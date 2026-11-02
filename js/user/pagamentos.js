// Página de Pagamentos: cadastro SIMULADO de formas de pagamento.
// Os dados ficam apenas no localStorage do navegador.

const STORAGE_KEY = "voila_formas_pagamento";
const CARD_DIGITS = 14; // propositalmente 2 a menos que um cartão real (16)

const METHODS = {
  pix: { title: "Cadastrar chave PIX", icon: "pix" },
  cartao: { title: "Cadastrar cartão", icon: "card" },
  boleto: { title: "Cadastrar boleto", icon: "barcode" },
  carteira: { title: "Cadastrar carteira digital", icon: "wallet" },
};

const FIELDS = {
  pix: `
    <div class="field">
      <label for="f_pixTipo">Tipo de chave</label>
      <select id="f_pixTipo" name="pixTipo">
        <option value="cpf">CPF</option>
        <option value="email">E-mail</option>
        <option value="tel">Telefone</option>
        <option value="aleatoria">Chave aleatória</option>
      </select>
    </div>
    <div class="field">
      <label for="f_pixChave">Chave PIX</label>
      <input id="f_pixChave" name="pixChave" type="text" autocomplete="off" />
      <p class="hint">Mostramos só uma versão mascarada da chave.</p>
    </div>`,
  cartao: `
    <div class="field">
      <label for="f_tipoCartao">Tipo do cartão</label>
      <select id="f_tipoCartao" name="tipoCartao">
        <option value="Crédito">Crédito</option>
        <option value="Débito">Débito</option>
      </select>
    </div>
    <div class="field">
      <label for="f_titular">Nome impresso no cartão</label>
      <input id="f_titular" name="titular" type="text" maxlength="40" autocomplete="off" />
    </div>
    <div class="field">
      <label for="f_numero">Número do cartão (simulação)</label>
      <input id="f_numero" name="numero" type="text" inputmode="numeric"
        placeholder="0000 0000 0000 00" autocomplete="off" data-mask="card" />
      <p class="hint">Digite ${CARD_DIGITS} dígitos, 2 a menos que um cartão real. Não use seu número verdadeiro. Também não pedimos o CVV.</p>
    </div>
    <div class="field field_short">
      <label for="f_validade">Validade</label>
      <input id="f_validade" name="validade" type="text" inputmode="numeric"
        placeholder="MM/AA" maxlength="5" autocomplete="off" data-mask="expiry" />
    </div>`,
  boleto: `
    <div class="field">
      <label for="f_emailBoleto">E-mail para receber o boleto</label>
      <input id="f_emailBoleto" name="emailBoleto" type="email" autocomplete="off" />
    </div>`,
  carteira: `
    <div class="field">
      <label for="f_carteira">Carteira</label>
      <select id="f_carteira" name="carteira">
        <option value="Apple Pay">Apple Pay</option>
        <option value="Google Pay">Google Pay</option>
      </select>
    </div>
    <div class="field">
      <label for="f_emailCarteira">E-mail da conta</label>
      <input id="f_emailCarteira" name="emailCarteira" type="email" autocomplete="off" />
    </div>`,
};

/* ---------- Utilitários ---------- */

const icon = (name, extra = "") =>
  `<svg class="icon ${extra}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const maskEmail = (email) => {
  const at = email.indexOf("@");
  return email.slice(0, 1) + "•••" + email.slice(at);
};

const newId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ---------- localStorage ---------- */

function loadItems() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch (erro) {
    return [];
  }
}

function saveItems(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch (erro) {
    return false;
  }
}

let items = loadItems();
let currentMethod = null;

/* ---------- Elementos ---------- */

const modal = document.getElementById("pay_modal");
const form = document.getElementById("pay_form");
const formFields = document.getElementById("form_fields");
const formError = document.getElementById("form_error");
const savedList = document.getElementById("saved_list");
const savedCount = document.getElementById("saved_count");
const emptyState = document.getElementById("empty_state");
const toastEl = document.getElementById("toast");
const toastText = document.getElementById("toast_text");

/* ---------- Validação e montagem de cada forma de pagamento ---------- */
// Cada função devolve { item } em caso de sucesso ou { error } quando algo está errado.

const BUILDERS = {
  pix(d) {
    const raw = d.pixChave.trim();
    const digits = raw.replace(/\D/g, "");
    let masked;

    if (d.pixTipo === "cpf") {
      if (digits.length !== 11)
        return {
          error: { field: "pixChave", msg: "O CPF precisa ter 11 números." },
        };
      masked = `•••.${digits.slice(3, 6)}.${digits.slice(6, 9)}-••`;
    } else if (d.pixTipo === "email") {
      if (!EMAIL_REGEX.test(raw))
        return {
          error: { field: "pixChave", msg: "Digite um e-mail válido." },
        };
      masked = maskEmail(raw);
    } else if (d.pixTipo === "tel") {
      if (digits.length < 10 || digits.length > 11)
        return {
          error: { field: "pixChave", msg: "Digite o telefone com DDD." },
        };
      masked = `(••) •••••-${digits.slice(-4)}`;
    } else {
      if (raw.length < 8)
        return {
          error: {
            field: "pixChave",
            msg: "A chave aleatória parece curta demais.",
          },
        };
      masked = raw.slice(0, 4) + "••••••••";
    }

    const nomes = {
      cpf: "CPF",
      email: "E-mail",
      tel: "Telefone",
      aleatoria: "Chave aleatória",
    };
    return {
      item: { title: "PIX", subtitle: `${nomes[d.pixTipo]}: ${masked}` },
    };
  },

  cartao(d) {
    const titular = d.titular.trim();
    const digits = d.numero.replace(/\D/g, "");
    const validade = d.validade.trim();

    if (titular.length < 3)
      return {
        error: { field: "titular", msg: "Digite o nome impresso no cartão." },
      };
    if (digits.length !== CARD_DIGITS)
      return {
        error: {
          field: "numero",
          msg: `Digite exatamente ${CARD_DIGITS} dígitos para a simulação.`,
        },
      };

    const match = validade.match(/^(\d{2})\/(\d{2})$/);
    if (!match)
      return {
        error: {
          field: "validade",
          msg: "Informe a validade no formato MM/AA.",
        },
      };
    const mes = Number(match[1]);
    const ano = 2000 + Number(match[2]);
    const hoje = new Date();
    if (mes < 1 || mes > 12)
      return {
        error: { field: "validade", msg: "O mês precisa estar entre 01 e 12." },
      };
    if (
      ano < hoje.getFullYear() ||
      (ano === hoje.getFullYear() && mes < hoje.getMonth() + 1)
    )
      return { error: { field: "validade", msg: "Esse cartão já venceu." } };

    const primeiro = digits[0];
    const bandeira =
      primeiro === "4"
        ? "Visa"
        : primeiro === "5" || primeiro === "2"
          ? "Mastercard"
          : "Cartão";

    return {
      item: {
        title: `${bandeira} •••• ${digits.slice(-4)}`,
        subtitle: `${d.tipoCartao}, titular ${titular.toUpperCase()}, vence em ${validade}`,
      },
    };
  },

  boleto(d) {
    const email = d.emailBoleto.trim();
    if (!EMAIL_REGEX.test(email))
      return {
        error: { field: "emailBoleto", msg: "Digite um e-mail válido." },
      };
    return {
      item: {
        title: "Boleto bancário",
        subtitle: `Enviado para ${maskEmail(email)}`,
      },
    };
  },

  carteira(d) {
    const email = d.emailCarteira.trim();
    if (!EMAIL_REGEX.test(email))
      return {
        error: { field: "emailCarteira", msg: "Digite um e-mail válido." },
      };
    return {
      item: { title: d.carteira, subtitle: `Conta ${maskEmail(email)}` },
    };
  },
};

/* ---------- Lista "Suas formas de pagamento" ---------- */

function render() {
  savedList.innerHTML = "";

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "saved_item";

    const ic = document.createElement("span");
    ic.className = "method_icon";
    ic.innerHTML = icon(
      METHODS[item.method] ? METHODS[item.method].icon : "wallet",
    );

    const info = document.createElement("div");
    info.className = "saved_info";

    const title = document.createElement("span");
    title.className = "saved_title";
    title.textContent = item.title; // textContent evita injeção de HTML

    const sub = document.createElement("span");
    sub.className = "saved_sub";
    sub.textContent = item.subtitle;
    info.append(title, sub);

    const actions = document.createElement("div");
    actions.className = "saved_actions";

    const btnRemove = document.createElement("button");
    btnRemove.type = "button";
    btnRemove.className = "btn_ghost btn_danger";
    btnRemove.innerHTML = icon("trash", "icon_small") + "Remover";
    btnRemove.setAttribute("aria-label", `Remover ${item.title}`);
    btnRemove.addEventListener("click", () => removeItem(item.id));
    actions.append(btnRemove);

    li.append(ic, info, actions);
    savedList.append(li);
  });

  emptyState.hidden = items.length > 0;
  savedList.hidden = items.length === 0;
  savedCount.textContent =
    items.length === 0
      ? ""
      : items.length === 1
        ? "1 cadastrada"
        : `${items.length} cadastradas`;
}

function removeItem(id) {
  const next = items.filter((i) => i.id !== id);
  if (saveItems(next)) {
    items = next;
    render();
    showToast("Forma de pagamento removida");
  } else {
    showToast("Não foi possível salvar neste navegador", true);
  }
}

/* ---------- Janela de cadastro ---------- */

function openModal(method) {
  currentMethod = method;
  document.getElementById("modal_title").textContent = METHODS[method].title;
  document.getElementById("modal_icon").innerHTML = icon(METHODS[method].icon);
  formFields.innerHTML = FIELDS[method];
  hideFormError();
  modal.showModal();
  const first = formFields.querySelector("input, select");
  if (first) first.focus();
}

function closeModal() {
  modal.close();
  currentMethod = null;
}

function showFormError(error) {
  formFields
    .querySelectorAll("[aria-invalid]")
    .forEach((el) => el.removeAttribute("aria-invalid"));
  formError.textContent = error.msg;
  formError.hidden = false;
  const input = error.field ? form.elements[error.field] : null;
  if (input) {
    input.setAttribute("aria-invalid", "true");
    input.focus();
  }
}

function hideFormError() {
  formError.hidden = true;
  formError.textContent = "";
}

// Máscaras: número do cartão (limitado a 14 dígitos) e validade (MM/AA)
form.addEventListener("input", (e) => {
  const el = e.target;
  if (el.dataset.mask === "card") {
    const digits = el.value.replace(/\D/g, "").slice(0, CARD_DIGITS);
    el.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  } else if (el.dataset.mask === "expiry") {
    const digits = el.value.replace(/\D/g, "").slice(0, 4);
    el.value =
      digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
  }
  if (el.hasAttribute("aria-invalid")) {
    el.removeAttribute("aria-invalid");
    hideFormError();
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentMethod) return;

  const data = Object.fromEntries(new FormData(form));
  const result = BUILDERS[currentMethod](data);

  if (result.error) {
    showFormError(result.error);
    return;
  }

  const item = {
    ...result.item,
    id: newId(),
    method: currentMethod,
    createdAt: Date.now(),
  };
  const next = [...items, item];

  if (!saveItems(next)) {
    showFormError({
      msg: "Não foi possível salvar: o armazenamento do navegador está indisponível.",
    });
    return;
  }

  items = next;
  render();
  closeModal();
  showToast("Cadastrado com sucesso!");
});

document.getElementById("modal_close").addEventListener("click", closeModal);
document.getElementById("modal_cancel").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal(); // clique no fundo escurecido
});

document.querySelectorAll(".method_card").forEach((card) => {
  card.addEventListener("click", () => openModal(card.dataset.method));
});

/* ---------- Aviso (toast) ---------- */

let toastTimer;
function showToast(message, isError = false) {
  toastText.textContent = message;
  toastEl.classList.toggle("toast_error", isError);
  toastEl.classList.add("toast_show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("toast_show"), 3200);
}

render();
