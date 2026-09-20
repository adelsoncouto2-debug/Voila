function getParametrosDaUrl() {
  const params = new URLSearchParams(window.location.search);

  return {
    id: parseInt(params.get("id")),
    tipo: params.get("tipo"),
  };
}

async function carregarDetalhes() {
  const { id, tipo } = getParametrosDaUrl();

  if (!id || !tipo) {
    console.error("ID ou tipo não foi passado na URL.");
    return;
  }

  let caminhoJson;

  if (tipo === "hotel") {
    caminhoJson = "../json/hoteis.json";
  } else if (tipo === "destino") {
    caminhoJson = "../json/destinos.json";
  }

  if (!caminhoJson) {
    console.error("Tipo desconhecido:", tipo);
    return;
  }

  try {
    const resposta = await fetch(caminhoJson);
    const dados = await resposta.json();

    const item = dados.find((item) => item.id === id);

    if (!item) {
      console.error("Item não encontrado para o id:", id);
      return;
    }

    preencherPagina(item);
  } catch (erro) {
    console.error("Erro ao carregar os dados:", erro);
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
