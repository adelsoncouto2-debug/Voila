document.addEventListener("DOMContentLoaded", async () => {
  const cardsContainer = document.getElementById("cards");
  const semResultados = document.getElementById("sem-resultados");

  let todosVoos = [];
  let voosFiltrados = [];

  // Carrega o JSON
  try {
    const response = await fetch("../json/passagens.json");
    todosVoos = await response.json();
    voosFiltrados = [...todosVoos];
    renderizarCards(voosFiltrados);
  } catch (error) {
    console.error("Erro ao carregar voos:", error);
    cardsContainer.innerHTML = "<p>Erro ao carregar os voos.</p>";
  }

  // ==================== RENDERIZAÇÃO DOS CARDS ====================
  function renderizarCards(voos) {
    cardsContainer.innerHTML = "";

    if (voos.length === 0) {
      semResultados.style.display = "block";
      return;
    }

    semResultados.style.display = "none";

    voos.forEach((voo) => {
      const card = document.createElement("article");
      card.className = "flight-card";
      card.dataset.id = voo.id;

      card.innerHTML = `
        <div class="flight-card__header">
          <div class="flight-card__airline">
            <img src="${voo.logo}" alt="${voo.cia}" class="airline-logo" />
            <span class="airline-name">${voo.cia}</span>
          </div>

          <div class="flight-card__times">
            <div class="time-block">
              <span class="time">${voo.horarioIda}</span>
            </div>

            <div class="flight-path">
              <span class="path-label">${voo.tipoVoo}</span>
              <div class="path-line"></div>
            </div>

            <div class="time-block">
              <span class="time">${voo.horarioChegada}</span>
              <span class="duration">${voo.duracao}</span>
            </div>
          </div>

          <div class="flight-card__price">
            <span class="price">R$ ${voo.preco.toLocaleString("pt-BR")},00</span>
          </div>

          <div class="flight-card__baggage">
            ${
              voo.bagagem.mochila
                ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <rect x="5" y="6" width="14" height="14" rx="2"/>
                    <path d="M9 12h6"/><path d="M9 16h6"/>
                  </svg>`
                : ""
            }
            ${
              voo.bagagem.mao
                ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="6" y="7" width="12" height="13" rx="2"/>
                    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
                    <path d="M10 12h4"/><path d="M10 15h4"/><path d="M12 7v13"/>
                  </svg>`
                : ""
            }
            ${
              voo.bagagem.despachada
                ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="5" y="8" width="14" height="12" rx="2"/>
                    <path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
                    <path d="M8 12h8"/><path d="M8 16h8"/>
                    <circle cx="9" cy="18" r="0.8" fill="currentColor"/>
                    <circle cx="15" cy="18" r="0.8" fill="currentColor"/>
                  </svg>`
                : ""
            }
          </div>

          <button class="flight-card__toggle" aria-label="Expandir detalhes">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        </div>

        <div class="flight-card__details">
          <div class="details-top">
            <span>Classe: ${voo.classe}</span>
            <span>Voo número: ${voo.numeroVoo}</span>
            <span>${voo.aeronave}</span>
          </div>

          <div class="details-bottom">
            <div class="info-list">
              <div class="info-item ${voo.permiteCancelamento ? "positive" : "negative"}">
                ${
                  voo.permiteCancelamento
                    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>`
                    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>`
                }
                <span>${voo.permiteCancelamento ? "Permite cancelamento" : "Não permite cancelamento"}</span>
              </div>
              <div class="info-item ${voo.permiteAssento ? "positive" : "negative"}">
                ${
                  voo.permiteAssento
                    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>`
                    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>`
                }
                <span>${voo.permiteAssento ? "Permite escolha de assento" : "Não permite escolha de assento"}</span>
              </div>
            </div>

            <div class="baggage-details">
              ${
                voo.bagagem.mochila
                  ? `<div class="baggage-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><rect x="5" y="6" width="14" height="14" rx="2"/><path d="M9 12h6"/><path d="M9 16h6"/></svg>
                      <span>Inclui mochila ou bolsa</span>
                    </div>`
                  : ""
              }
              ${
                voo.bagagem.mao
                  ? `<div class="baggage-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="7" width="12" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M10 12h4"/><path d="M10 15h4"/><path d="M12 7v13"/></svg>
                      <span>Inclui mochila de mão</span>
                    </div>`
                  : ""
              }
              ${
                voo.bagagem.despachada
                  ? `<div class="baggage-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="8" width="14" height="12" rx="2"/><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M8 12h8"/><path d="M8 16h8"/><circle cx="9" cy="18" r="0.8" fill="currentColor"/><circle cx="15" cy="18" r="0.8" fill="currentColor"/></svg>
                      <span>Inclui bagagem para despache</span>
                    </div>`
                  : ""
              }
            </div>
          </div>
        </div>
      `;

      // Toggle expandir
      card.querySelector(".flight-card__header").addEventListener("click", () => {
        card.classList.toggle("is-expanded");
      });

      cardsContainer.appendChild(card);
    });
  }

  // ==================== FILTROS ====================
  function aplicarFiltros() {
    const precoMin = parseInt(document.getElementById("precoMin")?.value || 500);
    const precoMax = parseInt(document.getElementById("precoMax")?.value || 15000);
    const origemInput = document.getElementById("origem")?.value?.toUpperCase().trim() || "";

    voosFiltrados = todosVoos.filter((voo) => {
      // Filtro de preço
      if (voo.preco < precoMin || voo.preco > precoMax) return false;

      // Filtro de origem (código ou cidade)
      if (origemInput) {
        const matchOrigem =
          voo.origem.includes(origemInput) ||
          voo.origemCidade.toUpperCase().includes(origemInput);
        if (!matchOrigem) return false;
      }

      return true;
    });

    renderizarCards(voosFiltrados);
  }

  // Escuta mudanças nos filtros (depois que o filters.js carregar o HTML)
  const observer = new MutationObserver(() => {
    const precoMin = document.getElementById("precoMin");
    const precoMax = document.getElementById("precoMax");
    const origem = document.getElementById("origem");
    const btnLimpar = document.getElementById("limparFiltros");

    if (precoMin && precoMax) {
      precoMin.addEventListener("input", aplicarFiltros);
      precoMax.addEventListener("input", aplicarFiltros);
    }

    if (origem) {
      origem.addEventListener("input", aplicarFiltros);
    }

    if (btnLimpar) {
      btnLimpar.addEventListener("click", () => {
        setTimeout(aplicarFiltros, 50); // espera o limpar do filters.js
      });
    }
  });

  observer.observe(document.getElementById("filter"), {
    childList: true,
    subtree: true,
  });

  // Botões Separar / Agrupar (só visual por enquanto)
  document.querySelectorAll(".format-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".format-button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
});