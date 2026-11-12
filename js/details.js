function getParametrosDaUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  return {
    id: Number.isInteger(id) && id > 0 ? id : null,
    tipo: params.get("tipo"),
  };
}

function configurarAbas() {
  const abas = document.querySelectorAll(".tab-item[data-tab]");
  const paineis = document.querySelectorAll(".detail-panel[data-panel]");

  abas.forEach((aba) => {
    aba.addEventListener("click", () => {
      const painelAtivo = aba.dataset.tab;

      abas.forEach((item) => {
        const ativo = item === aba;
        item.classList.toggle("active", ativo);
        item.setAttribute("aria-selected", String(ativo));
      });

      paineis.forEach((painel) => {
        const ativo = painel.dataset.panel === painelAtivo;
        painel.hidden = !ativo;
        painel.classList.toggle("active", ativo);
      });
    });
  });
}

function preencherLista(elemento, itens, criarItem = (li, item) => {
  li.textContent = item;
}) {
  elemento.replaceChildren();

  itens.forEach((item, indice) => {
    const li = document.createElement("li");
    criarItem(li, item, indice);
    elemento.appendChild(li);
  });
}

async function carregarDetalhes() {
  const { id, tipo } = getParametrosDaUrl();
  const caminhos = {
    hotel: "../json/hoteis.json",
    combo: "../json/destinos.json",
    promocao: "../json/destinos.json",
  };
  const caminhoJson = caminhos[tipo];

  if (!id || !caminhoJson) {
    console.error("ID ou tipo inválido na URL.", { id, tipo });
    return;
  }

  try {
    const resposta = await fetch(caminhoJson);
    if (!resposta.ok) {
      throw new Error(`Falha ao carregar os detalhes: HTTP ${resposta.status}`);
    }

    const dados = await resposta.json();
    const item = dados.find((registro) => registro.id === id);

    if (!item) {
      throw new Error(`Item do tipo "${tipo}" com ID ${id} não encontrado.`);
    }

    preencherPagina(item);
  } catch (erro) {
    console.error("Erro ao carregar os dados:", erro);
  }
}

function preencherPagina(item) {
  const { id, tipo } = getParametrosDaUrl();

  document.getElementById("imagem-principal").style.backgroundImage =
    `url("${item.imagemPrincipal}")`;
  document.getElementById("desconto").textContent = item.desconto;
  document.getElementById("tag").textContent = item.tag;
  document.getElementById("nome-destino").textContent = item.nome;

  document.getElementById("avaliacao").textContent = `⭐ ${item.avaliacao}`;
  document.getElementById("total-avaliacoes").textContent =
    `(${item.totalAvaliacoes} avaliações)`;
  document.getElementById("preco-antigo").textContent = item.precoAntigo;
  document.getElementById("preco-novo").textContent = item.precoNovo;
  document.getElementById("parcelas").textContent = item.parcelas;
  document.getElementById("economia").textContent = item.economia;
  document.getElementById("data-ida").value = item.dataIda;
  document.getElementById("data-volta").value = item.dataVolta;
  document.getElementById("sobre-destino").textContent = item.sobre;
  document.title = `${item.nome} - Voilà`;

  const paymentOptionsButton = document.querySelector(".cta-button");
  paymentOptionsButton.addEventListener("click", () => {
    sessionStorage.setItem(
      "voila_selected_combo",
      JSON.stringify({
        id,
        name: item.nome,
        price: item.precoNovo,
        type: tipo,
      }),
    );
    window.location.assign(
      `../pages/passagens.html?comboId=${encodeURIComponent(id)}`,
    );
  });

  preencherLista(document.getElementById("lista-inclui"), item.inclui);
  preencherLista(
    document.getElementById("lista-inclui-resumo"),
    item.inclui.slice(0, 3),
  );

  document.getElementById("hospedagem-nome").textContent =
    item.hospedagem.nome;
  document.getElementById("hospedagem-descricao").textContent =
    item.hospedagem.descricao;
  preencherLista(
    document.getElementById("lista-comodidades"),
    item.hospedagem.comodidades,
  );

  preencherLista(
    document.getElementById("lista-roteiro"),
    item.roteiro,
    (li, etapa) => {
      const titulo = document.createElement("strong");
      titulo.textContent = `${etapa.dia}: ${etapa.titulo}`;
      const descricao = document.createElement("p");
      descricao.textContent = etapa.descricao;
      li.append(titulo, descricao);
    },
  );

  preencherLista(
    document.getElementById("lista-avaliacoes"),
    item.avaliacoes,
    (li, avaliacao, indice) => {
      li.className = "review-item";
      const avatar = document.createElement("img");
      avatar.className = "review-avatar";
      avatar.src = `../img/user_${(indice % 3) + 1}.jpeg`;
      avatar.alt = `Foto de ${avaliacao.nome}`;

      const conteudo = document.createElement("div");
      conteudo.className = "review-content";
      const cabecalho = document.createElement("div");
      cabecalho.className = "review-header";
      const autor = document.createElement("strong");
      autor.textContent = avaliacao.nome;
      const nota = document.createElement("span");
      nota.textContent = `⭐ ${avaliacao.nota}/5`;
      const comentario = document.createElement("p");
      comentario.textContent = avaliacao.comentario;
      const data = document.createElement("small");
      data.textContent = avaliacao.data;
      cabecalho.append(autor, nota);
      conteudo.append(cabecalho, comentario, data);
      li.append(avatar, conteudo);
    },
  );

  const galeria = document.getElementById("galeria-fotos");
  galeria.replaceChildren();
  item.galeria.forEach((imagem) => {
    const div = document.createElement("div");
    div.classList.add("gallery-img");
    div.style.backgroundImage = `url("${imagem}")`;
    galeria.appendChild(div);
  });
}

configurarAbas();
carregarDetalhes();
