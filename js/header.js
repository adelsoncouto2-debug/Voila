fetch("../components/header.html")
  .then((r) => r.text())
  .then((html) => {
    document.getElementById("header").innerHTML = html;

    const pagina = window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".header-text a.text").forEach((link) => {
      const href = link.getAttribute("href").split("/").pop();

      if (href === pagina) {
        link.classList.remove("text");
        link.classList.add("text-selected");
      }
    });

    const vai = document.querySelector(".vai-container");

    if (pagina === "vai.html") {
      vai.classList.add("active");
    }

    // ===== LOGIN (usuário deslogado) =====
    const loginContainer = document.querySelector(".login-container");
    const loginButton = document.querySelector(".login");
    const dropdown = document.querySelector(".user-dropdown");

    loginButton.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdown.classList.toggle("open");
    });

    document.addEventListener("click", function () {
      dropdown.classList.remove("open");
      userDropdown.classList.remove("open");
      notificationDropdown.classList.remove("open");
    });

    dropdown.addEventListener("click", function (e) {
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

    // ===== HEADER LOGADO (usuário autenticado) =====
    const loggedContainer = document.querySelector(".logged-container");
    const userButton = document.querySelector(".user-button");
    const userDropdown = document.querySelector(".user-dropdown-logged");
    const userNameSpan = document.querySelector(".user-button .user-name");
    const dropdownName = document.querySelector(".user-dropdown-name");
    const dropdownEmail = document.querySelector(".user-dropdown-email");
    const btnLogout = document.getElementById("btn-logout");

    userButton.addEventListener("click", function (e) {
      e.stopPropagation();
      notificationDropdown.classList.remove("open");
      userDropdown.classList.toggle("open");
    });

    userDropdown.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    // Notificações
    const notificationButton = document.querySelector(".notification-button");
    const notificationDropdown = document.querySelector(
      ".notification-dropdown",
    );
    const notificationBadge = document.querySelector(".notification-badge");
    const btnMarcarLidas = document.getElementById("btn-marcar-lidas");

    notificationButton.addEventListener("click", function (e) {
      e.stopPropagation();
      userDropdown.classList.remove("open");
      notificationDropdown.classList.toggle("open");
    });

    notificationDropdown.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    btnMarcarLidas.addEventListener("click", function () {
      document
        .querySelectorAll(".notification-item.unread")
        .forEach((item) => item.classList.remove("unread"));
      notificationBadge.classList.add("hidden");
    });

    function entrar(nome, email) {
      userNameSpan.textContent = "Olá, " + nome;
      dropdownName.textContent = nome;
      dropdownEmail.textContent = email;

      loginContainer.classList.add("hidden");
      loggedContainer.classList.remove("hidden");

      dropdown.classList.remove("open");
      loginModal.classList.remove("open");
    }

    function sair() {
      loggedContainer.classList.add("hidden");
      loginContainer.classList.remove("hidden");
      userDropdown.classList.remove("open");
      notificationDropdown.classList.remove("open");
    }

    btnLogout.addEventListener("click", function (e) {
      e.stopPropagation();
      sair();
    });

    // ===== VERIFICAÇÃO DO LOGIN =====
    const btnEfetuarLogin = document.getElementById("btn-efetuar-login");
    const loginEmailInput = document.getElementById("login-email");
    const loginPasswordInput = document.getElementById("password");

    btnEfetuarLogin.addEventListener("click", () => {
      const usuario = loginEmailInput.value.trim();
      const senha = loginPasswordInput.value.trim();

      if (usuario === "Voila@gmail.com" && senha === "1234") {
        alert("Login realizado com sucesso!");
        
        window.location.href = "/intranet/index.html";
      } else if (usuario === "ricardo@iftm.edu.br" && senha === "1234") {
        alert("Login realizado com sucesso!");
        entrar("Ricardo", usuario);
      } else {
        alert("Usuário ou senha incorretos.");
      }
    });
});