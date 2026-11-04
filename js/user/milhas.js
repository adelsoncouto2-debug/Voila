// Página de Milhas: dados de DEMONSTRAÇÃO guardados no localStorage.
// Quando houver backend, basta trocar loadState/saveState por chamadas à API.

const STORAGE_KEY = "voila_milhas";
const VALOR_POR_MIL_MILHAS = 20; // R$ 20,00 a cada 1.000 milhas (demonstração)

// Nível é definido pelo total de milhas já acumuladas (não pelo saldo)
const NIVEIS = [
  { nome: "Bronze", minimo: 0 },
  { nome: "Prata", minimo: 5000 },
  { nome: "Ouro", minimo: 15000 },
  { nome: "Diamante", minimo: 30000 },
];

const RESGATES = [
  {
    id: "rio-de-janeiro",
    nome: "Rio de Janeiro",
    descricao: "Aproveite dias de sol com desconto na sua próxima viagem.",
    imagem: "../../img/trips/rio_de_janeiro.jpeg",
    desconto: "Até 15% OFF",
    custo: 5000,
  },
  {
    id: "buenos-aires",
    nome: "Buenos Aires",
    descricao: "Descubra a capital argentina com uma oferta especial.",
    imagem: "../../img/trips/argentina.jpeg",
    desconto: "Até 20% OFF",
    custo: 8000,
  },
  {
    id: "paris",
    nome: "Paris",
    descricao: "Viva momentos inesquecíveis na Cidade Luz.",
    imagem: "../../img/trips/paris.jpeg",
    desconto: "Até 25% OFF",
    custo: 15000,
  },
  {
    id: "maldivas",
    nome: "Maldivas",
    descricao: "Relaxe em praias paradisíacas com um desconto exclusivo.",
    imagem: "../../img/trips/maldivas.jpeg",
    desconto: "Até 30% OFF",
    custo: 22000,
  },
];

/* ---------- Utilitários ---------- */

const formatarNumero = (n) => n.toLocaleString("pt-BR");
const formatarReais = (n) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const novoId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const icone = (nome, extra = "") =>
  `<svg class="icon ${extra}" aria-hidden="true"><use href="#i-${nome}"></use></svg>`;

const diasAtras = (dias) =>
  new Date(Date.now() - dias * 86400000).toISOString();

/* ---------- Estado (localStorage) ---------- */

function estadoInicial() {
  return {
    saldo: 12450,
    acumulado: 12450,
    extrato: [
      {
        id: novoId(),
        desc: "Voo São Paulo para Salvador",
        pontos: 4200,
        data: diasAtras(5),
      },
      {
        id: novoId(),
        desc: "Hotel em Gramado",
        pontos: 2850,
        data: diasAtras(18),
      },
      {
        id: novoId(),
        desc: "Bônus de boas-vindas",
        pontos: 5400,
        data: diasAtras(40),
      },
    ],
  };
}

function loadState() {
  try {
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (
      dados &&
      typeof dados.saldo === "number" &&
      Array.isArray(dados.extrato)
    )
      return dados;
  } catch (erro) {
    // dados corrompidos ou localStorage indisponível: volta ao estado inicial
  }
  return estadoInicial();
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (erro) {
    return false;
  }
}

let state = loadState();

/* ---------- Elementos ---------- */

const saldoEl = document.getElementById("saldo");
const nivelEl = document.getElementById("nivel_atual");
const progressTrack = document.getElementById("progress_track");
const progressFill = document.getElementById("progress_fill");
const progressText = document.getElementById("progress_text");
const simInput = document.getElementById("sim_milhas");
const simValor = document.getElementById("sim_valor");
const rewardGrid = document.getElementById("reward_grid");
const statementList = document.getElementById("statement_list");
const toastEl = document.getElementById("toast");
const toastText = document.getElementById("toast_text");

/* ---------- Saldo e nível ---------- */

function renderSaldo() {
  saldoEl.textContent = formatarNumero(state.saldo);

  let indice = 0;
  NIVEIS.forEach((nivel, i) => {
    if (state.acumulado >= nivel.minimo) indice = i;
  });
  const atual = NIVEIS[indice];
  const proximo = NIVEIS[indice + 1];
  nivelEl.textContent = atual.nome;

  let percentual = 100;
  if (proximo) {
    const faixa = proximo.minimo - atual.minimo;
    percentual = Math.min(
      100,
      Math.round(((state.acumulado - atual.minimo) / faixa) * 100),
    );
    progressText.textContent = `Faltam ${formatarNumero(proximo.minimo - state.acumulado)} milhas para o nível ${proximo.nome}.`;
  } else {
    progressText.textContent = "Você chegou ao nível mais alto.";
  }
  progressFill.style.width = percentual + "%";
  progressTrack.setAttribute("aria-valuenow", String(percentual));
}

/* ---------- Simulador ---------- */

function atualizarSimulador() {
  const milhas = Math.max(0, Number(simInput.value) || 0);
  simValor.textContent = formatarReais((milhas / 1000) * VALOR_POR_MIL_MILHAS);
}
simInput.addEventListener("input", atualizarSimulador);

/* ---------- Resgates ---------- */

function renderResgates() {
  rewardGrid.innerHTML = "";

  RESGATES.forEach((r) => {
    const card = document.createElement("article");
    card.className = "reward_card";

    const imageWrap = document.createElement("div");
    imageWrap.className = "reward_image_wrap";

    const image = document.createElement("img");
    image.className = "reward_image";
    image.src = r.imagem;
    image.alt = `Destino: ${r.nome}`;

    const discount = document.createElement("span");
    discount.className = "reward_discount";
    discount.textContent = r.desconto;
    imageWrap.append(image, discount);

    const info = document.createElement("div");
    info.className = "reward_info";

    const nome = document.createElement("h4");
    nome.className = "reward_name";
    nome.textContent = r.nome;

    const description = document.createElement("p");
    description.className = "reward_description";
    description.textContent = r.descricao;

    const custo = document.createElement("span");
    custo.className = "reward_cost";
    custo.textContent = `${formatarNumero(r.custo)} milhas`;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn_primary";
    btn.textContent = "Trocar por desconto";
    const falta = r.custo - state.saldo;
    btn.disabled = falta > 0;
    btn.setAttribute("aria-label", `Trocar milhas por desconto em ${r.nome}`);
    btn.addEventListener("click", () => resgatar(r));

    info.append(nome, description, custo);

    if (falta > 0) {
      const aviso = document.createElement("p");
      aviso.className = "reward_missing";
      aviso.textContent = `Faltam ${formatarNumero(falta)} milhas`;
      info.append(aviso);
    }

    card.append(imageWrap, info, btn);
    rewardGrid.append(card);
  });
}

function resgatar(r) {
  if (state.saldo < r.custo) return;

  const anterior = state;
  state = {
    ...state,
    saldo: state.saldo - r.custo,
    extrato: [
      {
        id: novoId(),
        desc: `Resgate: ${r.nome}`,
        pontos: -r.custo,
        data: new Date().toISOString(),
      },
      ...state.extrato,
    ],
  };

  if (!saveState()) {
    state = anterior;
    mostrarAviso("Não foi possível salvar neste navegador");
    return;
  }

  renderTudo();
  mostrarAviso("Resgate realizado com sucesso!");
}

/* ---------- Extrato ---------- */

function renderExtrato() {
  statementList.innerHTML = "";

  state.extrato.forEach((mov) => {
    const entrada = mov.pontos >= 0;
    const li = document.createElement("li");
    li.className =
      "statement_item " + (entrada ? "statement_in" : "statement_out");

    const ic = document.createElement("span");
    ic.className = "statement_icon";
    ic.innerHTML = icone(entrada ? "up" : "down");

    const info = document.createElement("div");
    info.className = "statement_info";

    const desc = document.createElement("span");
    desc.className = "statement_desc";
    desc.textContent = mov.desc;

    const data = document.createElement("span");
    data.className = "statement_date";
    data.textContent = new Date(mov.data).toLocaleDateString("pt-BR");
    info.append(desc, data);

    const pontos = document.createElement("span");
    pontos.className = "statement_points";
    pontos.textContent = `${entrada ? "+" : "-"}${formatarNumero(Math.abs(mov.pontos))} milhas`;

    li.append(ic, info, pontos);
    statementList.append(li);
  });
}

/* ---------- Aviso (toast) ---------- */

let toastTimer;
function mostrarAviso(mensagem) {
  toastText.textContent = mensagem;
  toastEl.classList.add("toast_show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("toast_show"), 3200);
}

/* ---------- Início ---------- */

function renderTudo() {
  renderSaldo();
  renderResgates();
  renderExtrato();
}

simInput.value = state.saldo;
atualizarSimulador();
renderTudo();
