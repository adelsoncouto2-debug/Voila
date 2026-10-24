fetch("/intranet/components/header.html")
  .then((r) => r.text())
  .then((html) => {
    document.getElementById("header").innerHTML = html;
    const pagina = window.location.pathname.split("/").pop() || "index.html";

    // 1. Marca a página atual selecionada no menu
    document.querySelectorAll(".header-text a.text").forEach((link) => {
      const href = link.getAttribute("href").split("/").pop();
      if (href === pagina) {
        link.classList.remove("text");
        link.classList.add("text-selected");
      }
    });

    // ===== SELETORES DO COMPONENTE LOGADO COPIADO =====
    const loggedContainer = document.querySelector(".logged-container");
    const userButton = document.querySelector(".user-button");
    const userDropdown = document.querySelector(".user-dropdown-logged");
    const userNameSpan = document.querySelector(".user-button .user-name");
    const dropdownName = document.querySelector(".user-dropdown-name");
    const dropdownEmail = document.querySelector(".user-dropdown-email");
    const btnLogout = document.getElementById("btn-logout");

    // Seletores de Notificações
    const notificationButton = document.querySelector(".notification-button");
    const notificationDropdown = document.querySelector(".notification-dropdown");
    const notificationBadge = document.querySelector(".notification-badge");
    const btnMarcarLidas = document.getElementById("btn-marcar-lidas");

    // ===== INTEGRAÇÃO DOS CLIQUES (DROPDOWN E NOTIFICAÇÕES) =====
    
    // Abre/fecha o menu do perfil (Dropdown de Milhas)
    if (userButton && userDropdown) {
      userButton.addEventListener("click", function (e) {
        e.stopPropagation();
        if (notificationDropdown) notificationDropdown.classList.remove("open");
        userDropdown.classList.toggle("open");
      });
      userDropdown.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }

    // Abre/fecha a caixinha de notificações
    if (notificationButton && notificationDropdown) {
      notificationButton.addEventListener("click", function (e) {
        e.stopPropagation();
        if (userDropdown) userDropdown.classList.remove("open");
        notificationDropdown.classList.toggle("open");
      });
      notificationDropdown.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }

    // Ação do botão de marcar notificações como lidas
    if (btnMarcarLidas && notificationBadge) {
      btnMarcarLidas.addEventListener("click", function () {
        document
          .querySelectorAll(".notification-item.unread")
          .forEach((item) => item.classList.remove("unread"));
        notificationBadge.classList.add("hidden");
      });
    }

    // Fecha qualquer dropdown aberto se clicar fora deles na tela
    document.addEventListener("click", function () {
      if (userDropdown) userDropdown.classList.remove("open");
      if (notificationDropdown) notificationDropdown.classList.remove("open");
    });

    // ===== FUNÇÃO PARA APLICAR DADOS DO USUÁRIO EM TELA =====
    function entrar(nome, email) {
      if (userNameSpan) userNameSpan.textContent = "Olá, " + nome;
      if (dropdownName) dropdownName.textContent = nome;
      if (dropdownEmail) dropdownEmail.textContent = email;
      
      // Remove o 'hidden' para o painel aparecer lindamente
      if (loggedContainer) loggedContainer.classList.remove("hidden");
    }

    // ===== COMPORTAMENTO DO BOTÃO DE LOGOUT =====
    if (btnLogout) {
      btnLogout.addEventListener("click", function (e) {
        e.stopPropagation();
        // Limpa as credenciais locais e ejeta para a Home externa
        sessionStorage.removeItem("usuarioLogado");
        window.location.href = "../index.html";
      });
    }

    // ===== AUTO-LOGIN DA SESSÃO ATIVA (Sincronizado com a Home) =====
    const usuarioSalvo = sessionStorage.getItem("usuarioLogado");
    if (usuarioSalvo) {
      if (usuarioSalvo === "Voila@gmail.com") {
        entrar("Admin", usuarioSalvo);
      } else {
        entrar("Ricardo", usuarioSalvo);
      }
    }
  })
  .catch((err) => console.error("Erro ao carregar o header da intranet:", err));
