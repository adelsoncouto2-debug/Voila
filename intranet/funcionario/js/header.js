const headerScriptUrl = document.currentScript.src;
const intranetHeaderRootUrl = new URL("../", headerScriptUrl);
const siteHeaderRootUrl = new URL("../../../", headerScriptUrl);
const headerContainer = document.getElementById("header");

if (!headerContainer) {
  console.error("Não foi encontrado o contêiner do cabeçalho da intranet.");
} else {
  fetch(new URL("components/header.html", intranetHeaderRootUrl))
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Falha ao carregar o cabeçalho: HTTP ${response.status}`);
      }
      return response.text();
    })
    .then((html) => {
      headerContainer.innerHTML = html
        .replaceAll("{{SITE_ROOT}}", siteHeaderRootUrl.href)
        .replaceAll("{{INTRANET_ROOT}}", intranetHeaderRootUrl.href);

      const pagina = window.location.pathname.split("/").pop() || "index.html";
      const header = headerContainer.querySelector(".header");

      header.querySelectorAll(".header-text a.text").forEach((link) => {
        const href = new URL(link.href).pathname.split("/").pop();
        if (href === pagina) {
          link.classList.remove("text");
          link.classList.add("text-selected");
        }
      });

      const vaiLink = header.querySelector(".vai-container");
      if (vaiLink && pagina === "vai.html") {
        vaiLink.classList.add("active");
      }

      const loggedContainer = header.querySelector(".logged-container");
      const userButton = header.querySelector(".user-button");
      const userDropdown = header.querySelector(".user-dropdown-logged");
      const userName = header.querySelector(".user-name");
      const dropdownName = header.querySelector(".user-dropdown-name");
      const dropdownEmail = header.querySelector(".user-dropdown-email");
      const logoutButton = header.querySelector("#btn-logout");
      const notificationButton = header.querySelector(".notification-button");
      const notificationDropdown = header.querySelector(
        ".notification-dropdown",
      );
      const notificationBadge = header.querySelector(".notification-badge");
      const markReadButton = header.querySelector("#btn-marcar-lidas");

      if (userButton && userDropdown) {
        userButton.addEventListener("click", (event) => {
          event.stopPropagation();
          notificationDropdown?.classList.remove("open");
          notificationButton?.setAttribute("aria-expanded", "false");
          const isOpen = userDropdown.classList.toggle("open");
          userButton.setAttribute("aria-expanded", String(isOpen));
        });
        userDropdown.addEventListener("click", (event) => {
          event.stopPropagation();
        });
      }

      if (notificationButton && notificationDropdown) {
        notificationButton.addEventListener("click", (event) => {
          event.stopPropagation();
          userDropdown?.classList.remove("open");
          userButton?.setAttribute("aria-expanded", "false");
          const isOpen = notificationDropdown.classList.toggle("open");
          notificationButton.setAttribute("aria-expanded", String(isOpen));
        });
        notificationDropdown.addEventListener("click", (event) => {
          event.stopPropagation();
        });
      }

      if (markReadButton && notificationBadge && notificationDropdown) {
        markReadButton.addEventListener("click", () => {
          notificationDropdown
            .querySelectorAll(".notification-item.unread")
            .forEach((item) => item.classList.remove("unread"));
          notificationBadge.classList.add("hidden");
        });
      }

      document.addEventListener("click", () => {
        userDropdown?.classList.remove("open");
        notificationDropdown?.classList.remove("open");
        userButton?.setAttribute("aria-expanded", "false");
        notificationButton?.setAttribute("aria-expanded", "false");
      });

      const usuarioSalvo = sessionStorage.getItem("usuarioLogado");
      loggedContainer?.classList.remove("hidden");
      if (userName) userName.textContent = "Olá, Funcionário";
      if (dropdownName) dropdownName.textContent = "Funcionário";
      if (dropdownEmail && usuarioSalvo) dropdownEmail.textContent = usuarioSalvo;

      if (logoutButton) {
        logoutButton.addEventListener("click", () => {
          sessionStorage.removeItem("usuarioLogado");
          window.location.assign(
            new URL("index.html", intranetHeaderRootUrl).href,
          );
        });
      }
    })
    .catch((error) =>
      console.error("Erro ao carregar o header da intranet:", error),
    );
}
