/* /js/admin-switch.js */
(function () {
  const init = () => {
    const usuario = (sessionStorage.getItem("usuarioLogado") || "").toLowerCase();
    if (usuario !== "voila@gmail.com") return;

    const naIntranet = location.pathname.startsWith("/intranet");
    const destino = naIntranet ? "/index.html" : "/intranet/index.html";
    const rotulo = naIntranet ? "Ver site do cliente" : "Voltar para a intranet";

    const style = document.createElement("style");
    style.textContent = `
      .admin-switch {
        position: fixed;
        right: 16px;
        bottom: 24px;
        z-index: 9000;
        display: flex;
        align-items: center;
        flex-direction: row-reverse;
        height: 52px;
        min-width: 52px;
        padding: 0 14px;
        background: #1e2d5b;
        color: #fff;
        border-radius: 26px;
        box-shadow: 0 6px 20px rgba(13, 42, 77, 0.3);
        font: 600 14px "Open Sans", sans-serif;
        white-space: nowrap;
        overflow: hidden;
        text-decoration: none;
        transition: background 0.2s;
      }
      .admin-switch svg { width: 24px; height: 24px; flex-shrink: 0; }
      .admin-switch span {
        max-width: 0;
        opacity: 0;
        transition: max-width 0.3s ease, opacity 0.3s ease, margin 0.3s ease;
      }
      .admin-switch:hover,
      .admin-switch:focus-visible { background: #ff6200; }
      .admin-switch:hover span,
      .admin-switch:focus-visible span {
        max-width: 200px;
        opacity: 1;
        margin-right: 10px;
      }
    `;
    document.head.appendChild(style);

    const btn = document.createElement("a");
    btn.className = "admin-switch";
    btn.href = destino;
    btn.setAttribute("aria-label", rotulo);
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
        <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
      </svg>
      <span>${rotulo}</span>`;
    document.body.appendChild(btn);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();