document.querySelectorAll(".faq-question").forEach(button => {
    button.addEventListener("click", () => {
        const answer = button.nextElementSibling;
        const icon = button.querySelector(".toggle-icon");

        if (answer.style.display === "block") {
            answer.style.display = "none";
            icon.textContent = "+";
        } else {
            document.querySelectorAll(".faq-answer").forEach(ans => ans.style.display = "none");
            document.querySelectorAll(".toggle-icon").forEach(icon => icon.textContent = "+");

            answer.style.display = "block";
            icon.textContent = "✖";
        }
    });
});




