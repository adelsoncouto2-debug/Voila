/* =====================================================================
   Este arquivo é o seu js/index.js original, sem nenhuma remoção.
   Tudo que está abaixo do comentário "NOVO" foi adicionado para tornar
   dinâmicos os 3 carrosséis da home (Ofertas e Destinos em Destaque,
   Combos e passeios, Hóteis e Pousadas), sem mudar a estrutura visual:
   os cards continuam usando exatamente as mesmas classes de antes
   (.cards_trips, .card_trips_info, .cards_trips_images etc.).
   ===================================================================== */

const promocoes = [
  {
    id: 1,
    titulo: "Maldivas",
    descricao: "Pacote 7 noites - All Inclusive",
    precoAntigo: "R$ 23.000",
    precoNovo: "R$ 9.200",
    desconto: "-60%",
    imagem: "maldivas",
    tipo: "Pacote",
  },
  {
    id: 2,
    titulo: "Toquio",
    descricao: "Pacote completo com desconto",
    precoAntigo: "R$ 1.800",
    precoNovo: "R$ 899,90",
    desconto: "-50%",
    imagem: "toquio",
    tipo: "Pacote",
  },
  {
    id: 12,
    titulo: "Paris",
    descricao: "Experimente o melhor churrasco do mundo",
    precoAntigo: "R$ 1.999",
    precoNovo: "R$ 999,90",
    desconto: "-50%",
    imagem: "paris",
    tipo: "Pacote",
  },
  {
    id: 9,
    titulo: "Dublin",
    descricao: "Experimente o melhor churrasco do mundo",
    precoAntigo: "R$ 1.999",
    precoNovo: "R$ 999,90",
    desconto: "-50%",
    imagem: "irlanda",
    tipo: "Pacote",
  },
  {
    id: 10,
    titulo: "Madri",
    descricao: "Experimente o melhor churrasco do mundo",
    precoAntigo: "R$ 1.999",
    precoNovo: "R$ 999,90",
    desconto: "-50%",
    imagem: "espanha",
    tipo: "Pacote",
  },
  {
    id: 5,
    titulo: "Porto",
    descricao: "Conheça a terra do bacalhau",
    precoAntigo: "R$ 1.999",
    precoNovo: "R$ 999,90",
    desconto: "-50%",
    imagem: "portugal",
    tipo: "Pacote",
  },
  {
    id: 1,
    titulo: "Aman",
    descricao: "Pacote 7 noites - All Inclusive",
    precoAntigo: "R$ 23.000",
    precoNovo: "R$ 9.200",
    desconto: "-60%",
    imagem: "aman",
    tipo: "Pacote",
  },
  {
    id: 2,
    titulo: "Atlantis",
    descricao: "Pacote completo com desconto",
    precoAntigo: "R$ 1.800",
    precoNovo: "R$ 899,90",
    desconto: "-50%",
    imagem: "atlantis",
    tipo: "Pacote",
  },
  {
    id: 3,
    titulo: "Capella",
    descricao: "Viaje para a Alemanha",
    precoAntigo: "R$ 1.499",
    precoNovo: "R$ 749,90",
    desconto: "-50%",
    imagem: "capella",
    tipo: "Pacote",
  },
];
const viewportCards = document.querySelector(".viewport_cards");
const cardsContainer = document.querySelector(".cards_container");
function criarCard(promo) {
  return `
    <div class="card">
      <div class="card-image-container">
        <div class="card-image ${promo.imagem}"></div>
        <span class="discount">${promo.desconto}</span>
        <span class="package">${promo.tipo}</span>
      </div>

      <div class="text_in_low_card">
        <h2>${promo.titulo}</h2>
        <p>${promo.descricao}</p>
      </div>

      <div class="card-bottom">
        <div class="price">
          <p class="old-price">${promo.precoAntigo}</p>
          <p class="new-price">${promo.precoNovo}</p>
        </div>
        <button class="details-button" data-id="${promo.id}">Ver detalhes</button>
      </div>
    </div>
  `;
}
function renderizarCards() {
  const container = document.getElementById("cards");

  if (!container) {
    console.error("Elemento #cards não encontrado");
    return;
  }

  container.innerHTML = promocoes.map(criarCard).join("");
}
function configurarCliqueDetalhes() {
  const container = document.getElementById("cards");

  if (!container) return;

  container.addEventListener("click", (evento) => {
    const botao = evento.target.closest(".details-button");
    if (!botao) return;

    const id = botao.getAttribute("data-id");
    window.location.href = `../components/details.html?id=${id}&tipo=hotel`;
  });
}

if (viewportCards && cardsContainer) {
  viewportCards.addEventListener("mousemove", (e) => {
    const rect = viewportCards.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const threshold = rect.width * 0.3;

    if (mouseX < threshold) {
      cardsContainer.classList.remove("scroll-right");
      cardsContainer.classList.add("scroll-left");
    } else if (mouseX > rect.width - threshold) {
      cardsContainer.classList.remove("scroll-left");
      cardsContainer.classList.add("scroll-right");
    }
  });

  viewportCards.addEventListener("mouseleave", () => {
    cardsContainer.classList.remove("scroll-left", "scroll-right");
  });
}

/* =====================================================================
   NOVO — dados e renderização dos 3 carrosséis da home

   Cada array abaixo é a "fonte da verdade" de um grupo de cards. Para
   adicionar, remover ou editar um destino, combo ou hotel, mexa só
   aqui — o HTML não precisa mais ser tocado.

   Campos de cada item:
     id         identificador único (string ou número)
     titulo     texto do <h3>
     linhas     array com as linhas do primeiro parágrafo (1 ou mais)
     precoPessoa  ex.: "R$9.500"
     periodo    ex.: "Out/Nov"
     imagem     classe usada em .cards_trips_images (define a imagem via CSS)
     tipo       livre, útil no futuro para diferenciar destino/combo/hotel

   Quando você tiver um backend, troque estes três arrays por dados
   vindos de fetch() (por exemplo, um GET /destaques, /combos e
   /pousadas) e chame renderTrips() + initTripsCarousels() depois que
   os dados chegarem — o resto do código continua igual.
   ===================================================================== */

const destaques = [
  {
    id: "destaque-maldivas",
    titulo: "PARAÍSO NAS MALDIVAS",
    linhas: ["Ilhas paradisíacas no", "Oceano Índico"],
    precoPessoa: "R$9.500",
    periodo: "Out/Nov",
    imagem: "maldivas",
    tipo: "destino",
  },
  {
    id: "destaque-paris",
    titulo: "PARIS",
    linhas: ["Venha realizar seu sonho", "e visitar a cidade da luz"],
    precoPessoa: "R$7.900",
    periodo: "Out/Nov",
    imagem: "paris",
    tipo: "destino",
  },
  {
    id: "destaque-toquio",
    titulo: "TOQUIO",
    linhas: ["Venha conhecer a cidade milenar e desfrutar da cultura japonesa"],
    precoPessoa: "R$13.300",
    periodo: "Out/Nov",
    imagem: "toquio",
    tipo: "destino",
  },
];

const combos = [
  {
    id: "combo-disney",
    titulo: "DISNEY",
    linhas: ["Viaje para o castelo dos seus sonhos com tudo incluso"],
    precoPessoa: "R$9.500",
    periodo: "Out/Nov",
    imagem: "disney",
    tipo: "combo",
  },
  {
    id: "combo-aparecida",
    titulo: "APARECIDA",
    linhas: ["Conheça um dos destinos religiosos mais visitados do Brasil."],
    precoPessoa: "R$1.500",
    periodo: "Out/Nov",
    imagem: "aparecida",
    tipo: "combo",
  },
  {
    id: "combo-olimpia",
    titulo: "OLÍMPIA",
    linhas: ["Viaje para o maior resort do Brasil"],
    precoPessoa: "R$6.500",
    periodo: "Out/Nov",
    imagem: "olimpia",
    tipo: "combo",
  },
];

const pousadas = [
  {
    id: "hotel-copacabana",
    titulo: "COPACABANA PALACE",
    linhas: ["Hospedagem exclusiva"],
    precoPessoa: "R$3.000",
    periodo: "Abr/Mai",
    imagem: "copacabana",
    tipo: "hotel",
  },
  {
    id: "hotel-empire-state",
    titulo: "EMPIRE STATE",
    linhas: ["Viaje para um dos hotéis mais conhecidos do mundo"],
    precoPessoa: "R$1.500",
    periodo: "Out/Nov",
    imagem: "empire_state",
    tipo: "hotel",
  },
  {
    id: "hotel-burj-khalifa",
    titulo: "BURJ KHALIFA",
    linhas: ["Se hospede no maior prédio do mundo"],
    precoPessoa: "R$6.500",
    periodo: "Out/Nov",
    imagem: "burj_khalifa",
    tipo: "hotel",
  },
];

// Liga cada array ao atributo data-trips do respectivo .trips_container no HTML.
const TRIPS_DATA = { destaques, combos, pousadas };

/* Monta o HTML de um card, idêntico ao que já existia no index.html. */
function buildTripCard(item) {
  const paragrafo = item.linhas
    .map((linha, i) => (i < item.linhas.length - 1 ? `${linha} <br />` : linha))
    .join("\n          ");

  return `
    <div class="cards_trips">
      <div class="card_trips_info">
        <h3>${item.titulo}</h3>
        <p>
          ${paragrafo}
        </p>
        <p>
          A partir de ${item.precoPessoa} <br />
          p/pessoa <br />
          Válido para ${item.periodo}
        </p>
        <button class="buttom_in_trip_card" data-id="${item.id}" data-tipo="${item.tipo}">Ver detalhes</button>
      </div>
      <div class="cards_trips_images ${item.imagem}"></div>
    </div>
  `;
}

/* Preenche cada .trips_container[data-trips] com os cards do array
   correspondente, inserindo-os entre os dois botões de seta — os
   botões continuam exatamente onde estavam. */
function renderTrips() {
  document
    .querySelectorAll(".trips_container[data-trips]")
    .forEach((container) => {
      const chave = container.dataset.trips;
      const itens = TRIPS_DATA[chave];

      if (!itens) {
        console.warn(`Nenhum dado encontrado para o grupo "${chave}"`);
        return;
      }

      const botaoDireita = container.querySelector(".circle_button_right");
      itens.forEach((item) => {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = buildTripCard(item).trim();
        container.insertBefore(wrapper.firstElementChild, botaoDireita);
      });
    });
}

/* Liga as setas de cada carrossel de forma independente.
   Antes, o código só pegava o primeiro ".trips_container" da página
   (querySelector no singular), então apenas o carrossel de "Ofertas
   e Destinos em Destaque" respondia aos cliques. Como agora existem
   3 grupos, cada um precisa da sua própria seta esquerda/direita e da
   sua própria posição — por isso o querySelectorAll + forEach abaixo. */
function initTripsCarousels() {
  const CARDS_VISIVEIS = 3;
  const LARGURA_CARD = 360; // mesmo valor usado no código original

  document
    .querySelectorAll(".trips_container[data-trips]")
    .forEach((container) => {
      const botaoEsquerda = container.querySelector(".circle_button_left");
      const botaoDireita = container.querySelector(".circle_button_right");
      let posicao = 0;

      function mover() {
        container.style.transform = `translateX(-${posicao * LARGURA_CARD}px)`;
      }

      function ultimaPosicao() {
        const totalCards = container.querySelectorAll(".cards_trips").length;
        return Math.max(0, totalCards - CARDS_VISIVEIS);
      }

      botaoDireita?.addEventListener("click", () => {
        if (posicao < ultimaPosicao()) posicao++;
        mover();
      });

      botaoEsquerda?.addEventListener("click", () => {
        if (posicao > 0) posicao--;
        mover();
      });
    });
}

document.addEventListener("DOMContentLoaded", () => {
  // código original desta página
  renderizarCards();
  configurarCliqueDetalhes();

  // novo: preenche e liga os 3 carrosséis da home
  renderTrips();
  initTripsCarousels();
});
