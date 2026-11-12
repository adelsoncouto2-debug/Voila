(function () {
  if (window.adminSwitchInitialized) return;
  window.adminSwitchInitialized = true;

  const scriptUrl = document.currentScript.src;
  const siteRootUrl = new URL("../", scriptUrl);
  const profiles = [
    {
      id: "atedente",
      label: "Atendente",
      email: "Voila@gmail.com",
      path: "intranet/atedente/index.html",
    },
    {
      id: "ceo",
      label: "CEO",
      email: "ceo@voila.com",
      path: "intranet/ceo/index.html",
    },
    {
      id: "funcionario",
      label: "Funcionário",
      email: "ricardo@iftm.edu.br",
      path: "intranet/funcionario/index.html",
    },
  ];

  const init = () => {
    const activeProfile = profiles.find((profile) =>
      window.location.pathname.includes(`/intranet/${profile.id}/`),
    );

    const style = document.createElement("style");
    style.textContent = `
      .admin-switch {
        position: fixed;
        right: 16px;
        bottom: 24px;
        z-index: 9000;
        font: 600 14px "Open Sans", sans-serif;
      }
      .admin-switch-toggle {
        min-height: 48px;
        padding: 0 18px;
        border: 0;
        border-radius: 24px;
        background: #1e2d5b;
        color: #fff;
        box-shadow: 0 6px 20px rgba(13, 42, 77, 0.3);
        cursor: pointer;
        font: inherit;
        white-space: nowrap;
      }
      .admin-switch-toggle:hover,
      .admin-switch-toggle:focus-visible,
      .admin-switch.open .admin-switch-toggle {
        background: #ff6200;
      }
      .admin-switch-menu {
        position: absolute;
        right: 0;
        bottom: calc(100% + 10px);
        display: none;
        width: 220px;
        padding: 8px;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        background: #fff;
        box-shadow: 0 8px 24px rgba(13, 42, 77, 0.18);
      }
      .admin-switch.open .admin-switch-menu {
        display: grid;
        gap: 4px;
      }
      .admin-switch-option {
        width: 100%;
        padding: 10px 12px;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: #1e2d5b;
        cursor: pointer;
        font: inherit;
        text-align: left;
      }
      .admin-switch-option:hover,
      .admin-switch-option:focus-visible,
      .admin-switch-option[aria-current="page"] {
        background: #f5f7fa;
        color: #ff6200;
      }
    `;
    document.head.appendChild(style);

    const container = document.createElement("div");
    container.className = "admin-switch";
    container.innerHTML = `
      <div class="admin-switch-menu" role="menu" aria-label="Selecionar perfil">
        ${profiles
          .map(
            (profile) => `
              <button
                class="admin-switch-option"
                type="button"
                role="menuitem"
                data-profile="${profile.id}"
                ${activeProfile?.id === profile.id ? 'aria-current="page"' : ""}
              >${profile.label}</button>
            `,
          )
          .join("")}
        <button
          class="admin-switch-option"
          type="button"
          role="menuitem"
          data-profile="cliente"
          ${activeProfile ? "" : 'aria-current="page"'}
        >Site do cliente</button>
      </div>
      <button
        class="admin-switch-toggle"
        type="button"
        aria-expanded="false"
        aria-haspopup="menu"
      >${activeProfile ? `Perfil: ${activeProfile.label}` : "Trocar perfil"}</button>
    `;
    document.body.appendChild(container);

    const toggle = container.querySelector(".admin-switch-toggle");
    toggle.addEventListener("click", () => {
      const isOpen = container.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    container.querySelectorAll("[data-profile]").forEach((option) => {
      option.addEventListener("click", () => {
        const selectedProfile = profiles.find(
          (profile) => profile.id === option.dataset.profile,
        );
        if (selectedProfile) {
          sessionStorage.setItem("usuarioLogado", selectedProfile.email);
          window.location.assign(
            new URL(selectedProfile.path, siteRootUrl).href,
          );
          return;
        }

        sessionStorage.removeItem("usuarioLogado");
        window.location.assign(new URL("index.html", siteRootUrl).href);
      });
    });

    document.addEventListener("click", (event) => {
      if (!container.contains(event.target)) {
        container.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
