// Atalhos para selecionar elementos
const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
const $$ = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)];


// ---------- Aviso (toast) ----------
let temporizador;

function toast(mensagem) {
  const aviso = $('#toast');
  aviso.textContent = '✓ ' + mensagem;
  aviso.classList.add('s');
  clearTimeout(temporizador);
  temporizador = setTimeout(() => aviso.classList.remove('s'), 2600);
}


// ---------- Menu lateral (troca de seções) ----------
$$('.side [data-p]').forEach((botao) => {
  botao.addEventListener('click', () => {
    $$('.side [data-p]').forEach((b) => {
      b.setAttribute('aria-selected', b === botao);
    });

    $$('.panel').forEach((painel) => {
      painel.classList.toggle('on', painel.id === botao.dataset.p);
    });

    scrollTo({ top: 0 });
  });
});


// ---------- Formulários (salvar dados, preferências e senha) ----------
$$('form[data-save]').forEach((form) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // O formulário do cartão tem tratamento próprio (mais abaixo)
    if (form.id === 'cf') return;

    if (form.id === 'pf' && $('#p1').value !== $('#p2').value) {
      toast('As senhas não coincidem');
      return;
    }

    toast(form.dataset.save);

    if (form.id === 'pf') form.reset();
  });
});

// Botões que só mostram um aviso
$$('[data-toast]').forEach((botao) => {
  botao.addEventListener('click', () => toast(botao.dataset.toast));
});


// ---------- Preferências de viagem ----------
$$('.chips button').forEach((chip) => {
  chip.addEventListener('click', () => {
    const marcado = chip.getAttribute('aria-pressed') === 'true';
    chip.setAttribute('aria-pressed', !marcado);
  });
});

$('#orc').addEventListener('input', (e) => {
  $('#ov').textContent = 'R$ ' + Number(e.target.value).toLocaleString('pt-BR');
});


// ---------- Formas de pagamento ----------
function ligarRemocao(botao) {
  botao.addEventListener('click', () => {
    botao.closest('.card').remove();
    toast('Cartão removido');
  });
}

function identificarBandeira(numero) {
  if (numero[0] === '4') return { sigla: 'VISA', nome: 'Visa' };
  if (numero[0] === '5') return { sigla: 'MC', nome: 'Mastercard' };
  return { sigla: 'CARD', nome: 'Cartão' };
}

$$('.rm').forEach(ligarRemocao);

$('#addC').addEventListener('click', () => {
  $('#cf').hidden = false;
  $('#cn').focus();
});

$('#cx').addEventListener('click', () => {
  $('#cf').hidden = true;
  $('#cf').reset();
});

$('#cf').addEventListener('submit', (e) => {
  e.preventDefault();

  const numero = $('#cn').value.replace(/\D/g, '');

  if (numero.length < 13) {
    toast('Número do cartão inválido');
    return;
  }

  const bandeira = identificarBandeira(numero);
  const cartao = document.createElement('div');
  cartao.className = 'card';
  cartao.innerHTML = `
    <div class="chip">${bandeira.sigla}</div>
    <div style="flex:1">
      <b></b>
      <p class="hint" style="margin:0"></p>
    </div>
    <button class="btn d rm">Remover</button>
  `;

  // Só os 4 últimos dígitos são exibidos
  $('b', cartao).textContent = `${bandeira.nome} final ${numero.slice(-4)}`;
  $('p', cartao).textContent = 'Vence ' + $('#cv').value;
  ligarRemocao($('.rm', cartao));

  $('#cards').append(cartao);
  $('#cf').reset();
  $('#cf').hidden = true;
  toast('Cartão adicionado');
});


// ---------- Acessibilidade e aparência ----------
// Contraste reforçado nos status dos assentos
$('#hc').addEventListener('change', (e) => {
  const ativo = e.target.checked;

  $$('.seats span').forEach((assento) => {
    assento.style.borderWidth = ativo ? '4px' : '2px';
    assento.style.fontSize = ativo ? '1.05em' : '';
  });
});

// Tamanho do texto
$$('#fz button').forEach((botao) => {
  botao.addEventListener('click', () => {
    document.documentElement.style.setProperty('--fs', botao.dataset.s + 'px');

    $$('#fz button').forEach((b) => {
      b.setAttribute('aria-pressed', b === botao);
    });
  });
});

// Tema: automático, claro ou escuro
$$('#th button').forEach((botao) => {
  botao.addEventListener('click', () => {
    const raiz = document.documentElement;

    if (botao.dataset.t === 'auto') {
      raiz.removeAttribute('data-theme');
    } else {
      raiz.setAttribute('data-theme', botao.dataset.t);
    }

    $$('#th button').forEach((b) => {
      b.setAttribute('aria-pressed', b === botao);
    });
  });
});


// ---------- Privacidade: excluir conta ----------
$('#del').addEventListener('click', () => $('#dg').showModal());
$('#no').addEventListener('click', () => $('#dg').close());

$('#ok').addEventListener('click', () => {
  $('#dg').close();
  toast('Pedido de exclusão registrado');
});
