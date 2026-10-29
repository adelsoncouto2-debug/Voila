document.addEventListener("DOMContentLoaded", async () => {
  const cardsContainer = document.getElementById("cards");
  const semResultados = document.getElementById("sem-resultados");

  if (!cardsContainer || !semResultados) {
    console.error("Elementos da página de passagens não encontrados");
    return;
  }

  let todosVoos = [];
  let voosFiltrados = [];
  let templateCard;

  try {
    const [voosResponse, templateResponse] = await Promise.all([
      fetch("../json/passagens.json", { cache: "no-store" }),
      fetch("../components/cards_passagens.html", { cache: "no-store" }),
    ]);

    if (!voosResponse.ok || !templateResponse.ok) {
      throw new Error(
        "Não foi possível carregar os voos ou o componente dos cards",
      );
    }

    const [voos, templateHtml] = await Promise.all([
      voosResponse.json(),
      templateResponse.text(),
    ]);

    const componente = new DOMParser().parseFromString(
      templateHtml,
      "text/html",
    );
    templateCard = componente.querySelector("#flight-card-template");
    if (!templateCard) {
      throw new Error("Template de card de passagem não encontrado");
    }

    todosVoos = voos;
    voosFiltrados = [...todosVoos];
    renderizarCards(voosFiltrados);
  } catch (error) {
    console.error("Erro ao carregar voos:", error);
    cardsContainer.textContent = "Erro ao carregar os voos.";
  }

  function criarCard(voo) {
    const card = templateCard.content.firstElementChild.cloneNode(true);
    card.dataset.id = voo.id;

    // Se um campo faltar no template, avisa no console e segue em frente
    const definirTexto = (campo, valor) => {
      const elemento = card.querySelector(`[data-field="${campo}"]`);
      if (!elemento) {
        console.warn(`Campo "${campo}" não encontrado no template do card`);
        return;
      }
      elemento.textContent = valor;
    };

    const logo = card.querySelector(".airline-logo");
    if (logo) {
      logo.src = voo.logo;
      logo.alt = voo.cia;
      logo.addEventListener("error", () => {
        logo.hidden = true;
      });
    }

    definirTexto("airline", voo.cia);
    definirTexto("departure", voo.horarioIda);
    definirTexto("arrival", voo.horarioChegada);
    definirTexto("duration", voo.duracao);
    definirTexto("type", voo.tipoVoo);
    definirTexto("price", `R$ ${voo.preco.toLocaleString("pt-BR")},00`);
    definirTexto("class", `Classe: ${voo.classe}`);
    definirTexto("flight-number", `Voo número: ${voo.numeroVoo}`);
    definirTexto("aircraft", voo.aeronave);

    const preencherPermissao = (
      campo,
      permitida,
      textoPermitido,
      textoNegado,
    ) => {
      const item = card.querySelector(`[data-field="${campo}"]`);
      if (!item) {
        console.warn(`Campo "${campo}" não encontrado no template do card`);
        return;
      }
      item.classList.add(permitida ? "positive" : "negative");

      const texto = item.querySelector("span");
      if (texto) texto.textContent = permitida ? textoPermitido : textoNegado;

      const iconePositivo = item.querySelector('[data-icon="positive"]');
      const iconeNegativo = item.querySelector('[data-icon="negative"]');
      if (iconePositivo) iconePositivo.hidden = !permitida;
      if (iconeNegativo) iconeNegativo.hidden = permitida;
    };

    preencherPermissao(
      "cancellation",
      voo.permiteCancelamento,
      "Permite cancelamento",
      "Não permite cancelamento",
    );
    preencherPermissao(
      "seat",
      voo.permiteAssento,
      "Permite escolha de assento",
      "Não permite escolha de assento",
    );

    Object.entries(voo.bagagem).forEach(([tipo, incluida]) => {
      const icone = card.querySelector(`[data-bag-icon="${tipo}"]`);
      const detalhe = card.querySelector(`[data-baggage="${tipo}"]`);
      if (icone) icone.hidden = !incluida;
      if (detalhe) detalhe.hidden = !incluida;
    });

    const header = card.querySelector(".flight-card__header");
    const toggle = card.querySelector(".flight-card__toggle");
    const alternarDetalhes = () => {
      card.classList.toggle("is-expanded");
      toggle.setAttribute(
        "aria-expanded",
        String(card.classList.contains("is-expanded")),
      );
    };

    header.addEventListener("click", (evento) => {
      if (evento.target.closest(".flight-card__toggle")) return;
      alternarDetalhes();
    });
    toggle.addEventListener("click", alternarDetalhes);

    return card;
  }

  function renderizarCards(voos) {
    cardsContainer.innerHTML = "";

    if (voos.length === 0) {
      semResultados.style.display = "block";
      return;
    }

    semResultados.style.display = "none";

    voos.forEach((voo) => {
      cardsContainer.appendChild(criarCard(voo));
    });
  }

  function aplicarFiltros() {
    const precoMin = parseInt(
      document.getElementById("precoMin")?.value || 500,
    );
    const precoMax = parseInt(
      document.getElementById("precoMax")?.value || 15000,
    );
    const busca = (document.getElementById("origem")?.value || "")
      .toUpperCase()
      .trim();

    voosFiltrados = todosVoos.filter((voo) => {
      if (voo.preco < precoMin || voo.preco > precoMax) return false;

      if (busca) {
        const camposBusca = [
          voo.origem,
          voo.origemCidade,
          voo.destino,
          voo.destinoCidade,
        ];
        const encontrou = camposBusca.some((campo) =>
          campo.toUpperCase().includes(busca),
        );
        if (!encontrou) return false;
      }

      return true;
    });

    renderizarCards(voosFiltrados);
  }

  function limparFiltros() {
    ["precoMin", "precoMax", "origem"].forEach((id) => {
      const campo = document.getElementById(id);
      if (campo) campo.value = campo.defaultValue;
    });
    aplicarFiltros();
  }

  document.addEventListener("input", (evento) => {
    if (evento.target.matches("#precoMin, #precoMax, #origem")) {
      aplicarFiltros();
    }
  });

  document.addEventListener("click", (evento) => {
    if (evento.target.closest("#limparFiltros")) {
      limparFiltros();
    }
  });

  document.querySelectorAll(".format-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".format-button")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
});
