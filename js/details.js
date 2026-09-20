function getIdDaUrl() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get("id"));
}

async function carregarDetalhes() {
  const id = getIdDaUrl();

  if (!id) {
    console.error("Nenhum id foi passado na URL.");
    return;
  }

  try {
    const resposta = await fetch("../json/destinos.json");
    const destinos = await resposta.json();

    const destino = destinos.find((item) => item.id === id);

    if (!destino) {
      console.error("Destino não encontrado para o id:", id);
      return;
    }

    preencherPagina(destino);
  } catch (erro) {
    console.error("Erro ao carregar os dados do destino:", erro);
  }
}

function preencherPagina(destino) {
  document.getElementById("imagem-principal").style.backgroundImage =
    `url("${destino.imagemPrincipal}")`;
  document.getElementById("desconto").textContent = destino.desconto;
  document.getElementById("tag").textContent = destino.tag;
  document.getElementById("nome-destino").textContent = destino.nome;

  document.getElementById("avaliacao").textContent = `⭐ ${destino.avaliacao}`;
  document.getElementById("total-avaliacoes").textContent =
    `(${destino.totalAvaliacoes} avaliações)`;

  document.getElementById("preco-antigo").textContent = destino.precoAntigo;
  document.getElementById("preco-novo").textContent = destino.precoNovo;
  document.getElementById("parcelas").textContent = destino.parcelas;
  document.getElementById("economia").textContent = destino.economia;

  document.getElementById("data-ida").value = destino.dataIda;
  document.getElementById("data-volta").value = destino.dataVolta;

  document.getElementById("sobre-destino").textContent = destino.sobre;

  document.title = destino.nome + " - Voilà";

  const listaInclui = document.getElementById("lista-inclui");
  listaInclui.innerHTML = "";
  destino.inclui.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    listaInclui.appendChild(li);
  });

  const galeria = document.getElementById("galeria-fotos");
  galeria.innerHTML = "";
  destino.galeria.forEach((imagem) => {
    const div = document.createElement("div");
    div.classList.add("gallery-img");
    div.style.backgroundImage = `url("${imagem}")`;
    galeria.appendChild(div);
  });
}

carregarDetalhes();
