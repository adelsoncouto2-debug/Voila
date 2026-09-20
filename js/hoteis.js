const promocoes = [
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
  {
    id: 4,
    titulo: "Cheval Blanc",
    descricao: "Conheça o berço da filosofia",
    precoAntigo: "R$ 1.999",
    precoNovo: "R$ 999,90",
    desconto: "-50%",
    imagem: "cheval",
    tipo: "Pacote",
  },
  {
    id: 5,
    titulo: "Claridges",
    descricao: "Conheça a terra do bacalhau",
    precoAntigo: "R$ 1.999",
    precoNovo: "R$ 999,90",
    desconto: "-50%",
    imagem: "claridges",
    tipo: "Pacote",
  },
  {
    id: 6,
    titulo: "Mandarin",
    descricao: "Conheça a capital do mundo",
    precoAntigo: "R$ 1.999",
    precoNovo: "R$ 999,90",
    desconto: "-50%",
    imagem: "mandarin",
    tipo: "Pacote",
  },
  {
    id: 7,
    titulo: "Nihi",
    descricao: "Conheça uma das ilhas mais famosas do mundo",
    precoAntigo: "R$ 1.999",
    precoNovo: "R$ 999,90",
    desconto: "-50%",
    imagem: "nihi",
    tipo: "Pacote",
  },
  {
    id: 8,
    titulo: "Passalacqua",
    descricao: "Experimente o melhor churrasco do mundo",
    precoAntigo: "R$ 1.999",
    precoNovo: "R$ 999,90",
    desconto: "-50%",
    imagem: "passalacqua",
    tipo: "Pacote",
  },
  {
    id: 9,
    titulo: "Raffles",
    descricao: "Experimente o melhor churrasco do mundo",
    precoAntigo: "R$ 1.999",
    precoNovo: "R$ 999,90",
    desconto: "-50%",
    imagem: "raffles",
    tipo: "Pacote",
  },
  {
    id: 10,
    titulo: "Rosewood",
    descricao: "Experimente o melhor churrasco do mundo",
    precoAntigo: "R$ 1.999",
    precoNovo: "R$ 999,90",
    desconto: "-50%",
    imagem: "rosewood",
    tipo: "Pacote",
  },
  {
    id: 11,
    titulo: "Soneva",
    descricao: "Experimente o melhor churrasco do mundo",
    precoAntigo: "R$ 1.999",
    precoNovo: "R$ 999,90",
    desconto: "-50%",
    imagem: "soneva",
    tipo: "Pacote",
  },
  {
    id: 12,
    titulo: "Upper House",
    descricao: "Experimente o melhor churrasco do mundo",
    precoAntigo: "R$ 1.999",
    precoNovo: "R$ 999,90",
    desconto: "-50%",
    imagem: "house",
    tipo: "Pacote",
  },
];
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
