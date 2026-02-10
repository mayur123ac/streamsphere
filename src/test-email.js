const nodemailer = require("nodemailer");

async function main() {
  console.log("⏳ Attempting to send email...");

  // 1. Setup Transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      // Old: user: "mayurac123@gmail.com",
      // New:
      user: "streamsphere.project@gmail.com",

      // Old: pass: "vunpplvforgurfez",
      // New (The 16-digit code from the NEW account):
      pass: "xxxx xxxx xxxx xxxx",
    },
  });

  // 2. Setup Email
  const mailOptions = {
    from: "Test Script <NEW_ACCOUNT@gmail.com>",
    to: "mayurac123@gmail.com",
    subject: "Test Email from Node.js",
    text: "If you see this, your email configuration works!",
  };

  // 3. Send
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Success! Email sent successfully.");
  } catch (error) {
    console.log("❌ Error occurred!");
    console.error(error);
  }
}

main();
