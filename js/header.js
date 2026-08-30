fetch("../components/header.html")
    .then(r => r.text())
    .then(html => {
        document.getElementById("header").innerHTML = html;
        const pagina = window.location.pathname.split("/").pop() || "index.html";
        document.querySelectorAll(".header-text a.text").forEach(link => {
            const href = link.getAttribute("href").split("/").pop()
            if (href === pagina) {
                link.classList.remove("text");
                link.classList.add("text-selected");
            }
        });
        const vai = document.querySelector(".vai-container");
        if (pagina === "vai.html") {
            vai.classList.add("active");
        }
        const loginButton = document.querySelector(".login");
        const dropdown = document.querySelector(".user-dropdown");
        loginButton.addEventListener("click", function(e){
            e.stopPropagation();
            dropdown.classList.toggle("open");
        });
        document.addEventListener("click", function(){
        dropdown.classList.remove("open");
        });
        dropdown.addEventListener("click", function(e){
        e.stopPropagation();
        });
        const loginModal = document.querySelector(".login-modal");
        const emailButton = document.querySelector(".dropdown-email");
        const closeButton = document.querySelector(".login-close");
        emailButton.addEventListener("click", function (e) {
            e.stopPropagation();
            dropdown.classList.remove("open");
            loginModal.classList.add("open");
        });
        closeButton.addEventListener("click", function () {
            loginModal.classList.remove("open");
        });
        loginModal.addEventListener("click", function (e) {
            if (e.target === loginModal) {
                loginModal.classList.remove("open");
            }
        });
        const password = document.getElementById("password");
        const eye = document.querySelector(".eye-icon");
        eye.addEventListener("click", function () {
            if (password.type === "password") {
                password.type = "text";
                eye.src = "../img/eye-off.svg";
            } else {
                password.type = "password";
                eye.src = "../img/eye.svg";
            }
        });
        const forgotLink = document.querySelector(".forgot-password");
        const forgotModal = document.querySelector(".forgot-modal");
        const forgotCloseButton = document.querySelector(".forgot-close");
        forgotLink.addEventListener("click", function (e) {
            e.preventDefault();
            loginModal.classList.remove("open");
            forgotModal.classList.add("open");
        });
        forgotCloseButton.addEventListener("click", function () {
            forgotModal.classList.remove("open");
        });
        forgotModal.addEventListener("click", function (e) {
            if (e.target === forgotModal) {
                forgotModal.classList.remove("open");
            }
        });
    });