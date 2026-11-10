function caminhoBase() {
  if (window.location.hostname.endsWith("github.io")) {
    const partes = window.location.pathname.split("/").filter(Boolean);
    return partes.length ? "/" + partes[0] : "";
  }
  return "";
}

fetch(caminhoBase() + "/intranet/ceo/components/header.html", {
  cache: "no-cache",
})
  .then((r) => r.text())
  .then((html) => {
    document.getElementById("header").innerHTML = html;
    const base = caminhoBase();
    if (base) {
      document
        .querySelectorAll('#header [src^="/"], #header [href^="/"]')
        .forEach((el) => {
          ["src", "href"].forEach((attr) => {
            const valor = el.getAttribute(attr);
            if (valor && valor.startsWith("/") && !valor.startsWith("//")) {
              el.setAttribute(attr, base + valor);
            }
          });
        });
    }

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
        window.location.href = caminhoBase() + "/index.html";
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
