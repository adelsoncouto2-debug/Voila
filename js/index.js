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

  container.addEventListener("click", (evento) => {
    const botao = evento.target.closest(".details-button");
    if (!botao) return;

    const id = botao.getAttribute("data-id");
    window.location.href = `../components/details.html?id=${id}&tipo=hotel`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderizarCards();
  configurarCliqueDetalhes();
});

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

const viewportTrips = document.querySelector(".viewport_trips");
const tripsContainer = document.querySelector(".trips_container");
const buttonLeft = document.querySelector(".circle_button_left");
const buttonRight = document.querySelector(".circle_button_right");
let posicao = 0;
const totalCards = tripsContainer.querySelectorAll(".cards_trips").length;
const cardsVisiveis = 3;
const ultimaPosicao = totalCards - cardsVisiveis;
buttonRight.addEventListener("click", function () {
  if (posicao < ultimaPosicao) {
    posicao++;
  }
  tripsContainer.style.transform = `translateX(-${posicao * 360}px)`;
});
buttonLeft.addEventListener("click", function () {
  if (posicao > 0) {
    posicao--;
  }
  tripsContainer.style.transform = `translateX(-${posicao * 360}px)`;
});
