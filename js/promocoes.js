const promocoes = [
  {
    titulo: "Maldivas",
    descricao: "Pacote 7 noites - All Inclusive",
    precoAntigo: "R$ 23.000",
    precoNovo: "R$ 9.200",
    desconto: "-60%",
    imagem: "maldivas",
    tipo: "Pacote",
  },
  {
    titulo: "Toquio",
    descricao: "Pacote completo com desconto",
    precoAntigo: "R$ 1.800",
    precoNovo: "R$ 899,90",
    desconto: "-50%",
    imagem: "toquio",
    tipo: "Pacote",
  },
  {
    titulo: "Berlim",
    descricao: "Viaje para a Alemanha",
    precoAntigo: "R$ 1.499",
    precoNovo: "R$ 749,90",
    desconto: "-50%",
    imagem: "alemanha",
    tipo: "Pacote",
  },
  {
    titulo: "Grécia",
    descricao: "Conheça o berço da filosofia",
    precoAntigo: "R$ 1.999",
    precoNovo: "R$ 999,90",
    desconto: "-50%",
    imagem: "grecia",
    tipo: "Pacote",
  },
  {
    titulo: "Porto",
    descricao: "Conheça a terra do bacalhau",
    precoAntigo: "R$ 1.999",
    precoNovo: "R$ 999,90",
    desconto: "-50%",
    imagem: "portugal",
    tipo: "Pacote",
  },
  {
    titulo: "Nova York",
    descricao: "Conheça a capital do mundo",
    precoAntigo: "R$ 1.999",
    precoNovo: "R$ 999,90",
    desconto: "-50%",
    imagem: "new_york",
    tipo: "Pacote",
  },
  {
    titulo: "Havana",
    descricao: "Conheça uma das ilhas mais famosas do mundo",
    precoAntigo: "R$ 1.999",
    precoNovo: "R$ 999,90",
    desconto: "-50%",
    imagem: "cuba",
    tipo: "Pacote",
  },
  {
    titulo: "Buenos Aires",
    descricao: "Experimente o melhor churrasco do mundo",
    precoAntigo: "R$ 1.999",
    precoNovo: "R$ 999,90",
    desconto: "-50%",
    imagem: "argentina",
    tipo: "Pacote",
  },
  {
    titulo: "Dublin",
    descricao: "Experimente o melhor churrasco do mundo",
    precoAntigo: "R$ 1.999",
    precoNovo: "R$ 999,90",
    desconto: "-50%",
    imagem: "irlanda",
    tipo: "Pacote",
  },
  {
    titulo: "Madri",
    descricao: "Experimente o melhor churrasco do mundo",
    precoAntigo: "R$ 1.999",
    precoNovo: "R$ 999,90",
    desconto: "-50%",
    imagem: "espanha",
    tipo: "Pacote",
  },
  {
    titulo: "Santiago",
    descricao: "Experimente o melhor churrasco do mundo",
    precoAntigo: "R$ 1.999",
    precoNovo: "R$ 999,90",
    desconto: "-50%",
    imagem: "chile",
    tipo: "Pacote",
  },
  {
    titulo: "Paris",
    descricao: "Experimente o melhor churrasco do mundo",
    precoAntigo: "R$ 1.999",
    precoNovo: "R$ 999,90",
    desconto: "-50%",
    imagem: "paris",
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
        <button class="details-button">Ver detalhes</button>
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

document.addEventListener("DOMContentLoaded", renderizarCards);
