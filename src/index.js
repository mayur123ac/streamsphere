// ==========================================
// 1. SETUP & DEPENDENCIES
// ==========================================
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const connectDB = require("./db");
const User = require("./userModel");
const nodemailer = require("nodemailer");
const session = require("express-session");
const OpenAI = require("openai");

const app = express();

// ---------- OpenAI Setup ----------
// Uses the key from Render Environment Variables (safe!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "place_holder_key_if_missing",
});

// ---------- Database Connection ----------
connectDB(); // Uses the smart logic from your updated db.js

// ---------- Middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration (Updated for Render security)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat", // Uses your secure key
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set to true only if you have https setup (Render handles this automatically usually)
      httpOnly: true,
      maxAge: 3600000 // 1 hour default
    },
  })
);

// Static files (CSS, Images, JS)
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

// ---------- Handlebars Setup ----------
const templatePath = path.join(__dirname, "../templates");
app.set("view engine", "hbs");
app.set("views", templatePath);

// ==========================================
// 2. GLOBAL VARIABLES (Available in all HTML files)
// ==========================================
app.use((req, res, next) => {
  // Check if session exists
  if (req.session.email) {
    res.locals.isAuthenticated = true;
    res.locals.name = req.session.name;
    res.locals.email = req.session.email;
    res.locals.isAdmin = req.session.email === process.env.ADMIN_EMAIL || req.session.email === "mayurac123@admin.com";

    // Create an avatar letter (e.g., "M" for "Mayur")
    res.locals.avatarLetter = req.session.name
      ? req.session.name.charAt(0).toUpperCase()
      : "U";
  } else {
    res.locals.isAuthenticated = false;
    res.locals.name = "Guest";
    res.locals.isAdmin = false;
  }
  next(); // Continue to the requested route
});

// ==========================================
// 3. EMAIL CONFIGURATION
// ==========================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "officialstreamsphere.help@gmail.com",
    pass: process.env.EMAIL_PASS || "mmrkiezulaljkkdw",
  },
});

// ==========================================
// 4. PUBLIC ROUTES (No Login Needed)
// ==========================================
app.get("/", (req, res) => {
  res.render("Streamsphere", { title: "StreamSphere – Welcome" });
});

app.get("/login", (req, res) => {
  if (req.session.email) return res.redirect("/homepage");
  res.render("login", { title: "Sign In", email: req.query.email || "" });
});

app.get("/signup", (req, res) => {
  res.render("signup", { title: "Create Account", errorMessage: null, name: "", email: "" });
});

app.get("/userexist", (req, res) => {
  res.render("userexist");
});

app.get("/contactus", (req, res) => res.render("contactus"));

// ==========================================
// 5. AUTHENTICATION LOGIC
// ==========================================

// --- SIGNUP ---
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
    return res.render("signup", {
      errorMessage: "Password must be 8+ chars with numbers & letters.",
      name, email
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("signup", {
        errorMessage: "User already exists with this email, please sign in.",
        name, email
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });

    await newUser.save();
    res.redirect("/login");
  } catch (err) {
    console.error("Signup error:", err);
    res.render("signup", { errorMessage: "Something went wrong. Please try again.", name, email });
  }
});

// --- LOGIN ---
app.post("/login", async (req, res) => {
  const { name, email, password, remember_me } = req.body;
  console.log("Login Attempt:", email);

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("❌ Create account first!");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("❌ Invalid email or password");

    // Set Session
    req.session.email = user.email;
    req.session.name = user.name || name || "User";

    // Remember Me Logic
    if (remember_me === "on") {
      req.session.cookie.maxAge = 172800000; // 2 Days
    } else {
      req.session.cookie.maxAge = 3600000; // 1 Hour
    }

    // Email Notification
    const mailOptions = {
      from: '"StreamSphere" <officialstreamsphere.help@gmail.com>',
      to: user.email,
      subject: "Login Alert - StreamSphere",
      html: `<h3>Welcome back, ${req.session.name}!</h3><p>You have successfully logged into StreamSphere.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log("Email error:", error);
      else console.log("Login notification sent.");
    });

    res.redirect("/payment");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Error logging in");
  }
});

// --- LOGOUT ---
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect("/");
  });
});

// ==========================================
// 6. PROTECTED ROUTES (Login Required)
// ==========================================

// Middleware to protect routes
const requireLogin = (req, res, next) => {
  if (!req.session.email) return res.redirect("/login");
  next();
};

app.get("/homepage", requireLogin, (req, res) => {
  res.render("homepage", { name: req.session.name, email: req.session.email });
});

app.get("/payment", requireLogin, (req, res) => {
  res.render("payment");
});

app.get("/account", requireLogin, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.session.email });
    res.render("account", {
      title: "Account Settings",
      name: req.session.name,
      email: req.session.email,
      password: "********",
      avatarLetter: req.session.name.charAt(0).toUpperCase(),
    });
  } catch (err) {
    console.log(err);
    res.redirect("/homepage");
  }
});

app.get("/mylist", requireLogin, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.session.email });
    res.render("mylist", {
      name: req.session.name,
      movies: user ? user.myList : [],
    });
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

// --- COMBINED SEARCH PAGE ROUTE (Fixed Duplicates) ---
app.get("/searchpg", requireLogin, (req, res) => {
  res.render("searchpg", {
    name: req.session.name,
    email: req.session.email,
    isAdmin: res.locals.isAdmin // Uses the global variable set in middleware
  });
});

app.get("/series", requireLogin, (req, res) => {
  res.render("series", {
    name: req.session.name,
    email: req.session.email,
    isAdmin: res.locals.isAdmin
  });
});

// ==========================================
// 7. API & FEATURES
// ==========================================

// Chatbot API
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message.toLowerCase();
  
  // Simple Keyword Matcher (Fallback if OpenAI is off)
  const movieCatalog = [
    { title: "The Avengers", tags: ["avengers", "marvel"], link: "/theavengers" },
    { title: "Demon Slayer", tags: ["anime", "demon slayer"], link: "/demonslayer" },
    { title: "Materialists", tags: ["romance"], link: "/materialists" }
  ];

  const foundMovie = movieCatalog.find(m => userMessage.includes(m.title.toLowerCase()));
  
  if (foundMovie) {
    return res.json({ reply: `Great choice! Watch **${foundMovie.title}** here: [Watch Now](${foundMovie.link})` });
  }
  
  res.json({ reply: "I couldn't find that exact movie, but try searching for Avengers or Anime!" });
});

// Recently Played API
app.post("/api/add-recent", async (req, res) => {
  const { email, movie } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.recentlyPlayed) user.recentlyPlayed = [];
    user.recentlyPlayed = user.recentlyPlayed.filter((item) => item.title !== movie.title);
    user.recentlyPlayed.unshift(movie);
    if (user.recentlyPlayed.length > 10) user.recentlyPlayed.pop();

    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/get-recent", async (req, res) => {
  const { email } = req.query;
  try {
    const user = await User.findOne({ email });
    res.json({ recentlyPlayed: user ? user.recentlyPlayed : [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// My List API
app.post("/api/add-to-list", async (req, res) => {
  if (!req.session.email) return res.status(401).send("Please login");
  const { title, image, link, genre, description } = req.body;
  try {
    const user = await User.findOne({ email: req.session.email });
    if (!user) return res.status(404).send("User not found");
    
    if (!user.myList) user.myList = [];
    const exists = user.myList.some((movie) => movie.title === title);
    if (!exists) {
      user.myList.push({ title, image, link, genre, description });
      await user.save();
    }
    res.json({ message: "Added" });
  } catch (err) {
    res.status(500).send("Error");
  }
});

app.post("/api/remove-from-list", async (req, res) => {
  if (!req.session.email) return res.status(401).send("Please login");
  const { title } = req.body;
  try {
    const user = await User.findOne({ email: req.session.email });
    if (user) {
      user.myList = user.myList.filter((movie) => movie.title !== title);
      await user.save();
      res.json({ message: "Removed" });
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(500).send("Error");
  }
});

// OTP & Password Reset
app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: "Streamsphere Support",
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) return res.status(500).json({ error: "Failed to send email" });
      return res.json({ message: "OTP sent" });
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.resetOTP !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: "Invalid or Expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 8. ADMIN ANALYSIS
// ==========================================
app.get("/analysis", requireLogin, (req, res) => {
  if (!res.locals.isAdmin) return res.redirect("/homepage");
  res.render("analysis", { name: req.session.name, email: req.session.email });
});

app.get("/api/admin/analytics-full", async (req, res) => {
  if (req.session.email !== process.env.ADMIN_EMAIL && req.session.email !== "mayurac123@admin.com") {
    return res.status(403).send("Unauthorized");
  }

  try {
    const users = await User.find({}, "name email myList recentlyPlayed");
    const analyzedUsers = users.map((user) => {
      // Mock analysis logic
      const historyCount = user.recentlyPlayed ? user.recentlyPlayed.length : 0;
      return {
        name: user.name || "User",
        email: user.email,
        myListCount: user.myList ? user.myList.length : 0,
        recentlyPlayedCount: historyCount,
        screenTime: `${historyCount * 2}h`,
        topGenre: "Mixed", // Simplify for now
        lastActive: "Now",
      };
    });
    res.json(analyzedUsers);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// ==========================================
// 9. MOVIE & SERIES STATIC ROUTES
// ==========================================
app.get("/hindistreamsphere", (req, res) => res.render("hindistreamsphere"));

// Movies
const movieRoutes = [
  "Materialists", "materialistsmovie", "Theavengers", "Theavengermovie", 
  "ballerina", "ballerinamovie", "f1", "f1movie", "howtotraindragon", 
  "howtotraindragonmovie", "fantastic4", "fantasticfourmovie", "havoc", 
  "civilwar", "kantara", "finaldestination", "Saiyara", "demonslayer", 
  "movie", "edenmovie", "Avatarmovie"
];

movieRoutes.forEach(route => {
  app.get(`/${route.toLowerCase()}`, (req, res) => res.render(`allmovies/${route}`));
});

// Info Pages
app.get("/dhurandhar", (req, res) => res.render("info/dhurandharinfo"));
app.get("/toxic", (req, res) => res.render("info/toxic"));
app.get("/chatapacha", (req, res) => res.render("info/chatapacha"));

// Series Episodes
const seriesEpisodes = [
  "SquidGameS02EP2", "SquidGameS02EP3", "SquidGameS02EP4", "SquidGameS02EP5",
  "StrangerThingsS05EP2", "StrangerThingsS05EP3", "StrangerThingsS05EP4"
];

seriesEpisodes.forEach(ep => {
  app.get(`/Series/${ep}`, (req, res) => res.render(`Series/${ep}`));
});

// ==========================================
// 10. SERVER START
// ==========================================
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});