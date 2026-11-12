const headerScriptUrl = document.currentScript.src;
const intranetHeaderRootUrl = new URL("../", headerScriptUrl);
const siteHeaderRootUrl = new URL("../../../", headerScriptUrl);
const adminSwitchScript = document.createElement("script");
adminSwitchScript.src = new URL("js/admin-switch.js", siteHeaderRootUrl).href;
document.head.appendChild(adminSwitchScript);

fetch(new URL("components/header.html", intranetHeaderRootUrl), {
  cache: "no-cache",
})
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Falha ao carregar o cabeçalho: HTTP ${response.status}`);
    }
    return response.text();
  })
  .then((html) => {
    document.getElementById("header").innerHTML = html
      .replaceAll("{{SITE_ROOT}}", siteHeaderRootUrl.href)
      .replaceAll("{{INTRANET_ROOT}}", intranetHeaderRootUrl.href);

    const pagina = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".header-text a.text").forEach((link) => {
      const href = link.getAttribute("href").split("/").pop();
      if (href === pagina) {
        link.classList.remove("text");
        link.classList.add("text-selected");
      }
    });

    const loggedContainer = document.querySelector(".logged-container");
    const userButton = document.querySelector(".user-button");
    const userDropdown = document.querySelector(".user-dropdown-logged");
    const userNameSpan = document.querySelector(".user-button .user-name");
    const dropdownName = document.querySelector(".user-dropdown-name");
    const dropdownEmail = document.querySelector(".user-dropdown-email");
    const btnLogout = document.getElementById("btn-logout");
    const notificationButton = document.querySelector(".notification-button");
    const notificationDropdown = document.querySelector(
      ".notification-dropdown",
    );
    const notificationBadge = document.querySelector(".notification-badge");
    const btnMarcarLidas = document.getElementById("btn-marcar-lidas");

    if (userButton && userDropdown) {
      userButton.addEventListener("click", function (e) {
        e.stopPropagation();
        if (notificationDropdown) notificationDropdown.classList.remove("open");
        const isOpen = userDropdown.classList.toggle("open");
        userButton.setAttribute("aria-expanded", String(isOpen));
      });
      userDropdown.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }

    if (notificationButton && notificationDropdown) {
      notificationButton.addEventListener("click", function (e) {
        e.stopPropagation();
        if (userDropdown) userDropdown.classList.remove("open");
        if (userButton) userButton.setAttribute("aria-expanded", "false");
        const isOpen = notificationDropdown.classList.toggle("open");
        notificationButton.setAttribute("aria-expanded", String(isOpen));
      });
      notificationDropdown.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }

    if (btnMarcarLidas && notificationBadge) {
      btnMarcarLidas.addEventListener("click", function () {
        document
          .querySelectorAll(".notification-item.unread")
          .forEach((item) => item.classList.remove("unread"));
        notificationBadge.classList.add("hidden");
      });
    }

    document.addEventListener("click", function () {
      if (userDropdown) userDropdown.classList.remove("open");
      if (notificationDropdown) notificationDropdown.classList.remove("open");
      if (userButton) userButton.setAttribute("aria-expanded", "false");
      if (notificationButton) {
        notificationButton.setAttribute("aria-expanded", "false");
      }
    });

    function entrar(nome, email) {
      if (userNameSpan) userNameSpan.textContent = "Olá, " + nome;
      if (dropdownName) dropdownName.textContent = nome;
      if (dropdownEmail) dropdownEmail.textContent = email;

      if (loggedContainer) loggedContainer.classList.remove("hidden");
    }

    if (btnLogout) {
      btnLogout.addEventListener("click", function (e) {
        e.stopPropagation();
        sessionStorage.removeItem("usuarioLogado");
        window.location.href = new URL("index.html", siteHeaderRootUrl).href;
      });
    }

    const usuarioSalvo = sessionStorage.getItem("usuarioLogado");
    if (usuarioSalvo) {
      entrar(
        usuarioSalvo.toLowerCase() === "ceo@voila.com" ? "CEO" : "Gerente",
        usuarioSalvo,
      );
    }
  })
  .catch((err) => console.error("Erro ao carregar o header do gerente:", err));
