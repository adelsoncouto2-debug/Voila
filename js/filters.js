document.addEventListener("DOMContentLoaded", function () {
  const precoMin = document.getElementById("precoMin");
  const precoMax = document.getElementById("precoMax");
  const precoMinLabel = document.getElementById("precoMinLabel");
  const precoMaxLabel = document.getElementById("precoMaxLabel");
  const sliderRange = document.getElementById("sliderRange");

  const MIN_VALOR = 500;
  const MAX_VALOR = 15000;

  fetch("/components/filters.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("filter").innerHTML = data;
    })
    .catch((error) => console.error("Erro ao carregar o filtro:", error));

  function formatarPreco(valor) {
    return "R$ " + Number(valor).toLocaleString("pt-BR");
  }

  function atualizarSlider() {
    let min = parseInt(precoMin.value, 10);
    let max = parseInt(precoMax.value, 10);

    if (min > max) {
      if (this === precoMin) {
        precoMax.value = min;
        max = min;
      } else {
        precoMin.value = max;
        min = max;
      }
    }

    const percentMin = ((min - MIN_VALOR) / (MAX_VALOR - MIN_VALOR)) * 100;
    const percentMax = ((max - MIN_VALOR) / (MAX_VALOR - MIN_VALOR)) * 100;

    sliderRange.style.left = percentMin + "%";
    sliderRange.style.width = percentMax - percentMin + "%";

    precoMinLabel.textContent = formatarPreco(min);
    precoMaxLabel.textContent = formatarPreco(max);
  }

  precoMin.addEventListener("input", atualizarSlider);
  precoMax.addEventListener("input", atualizarSlider);

  atualizarSlider();

  const botoesDuracao = document.querySelectorAll(".btn-duracao");

  botoesDuracao.forEach(function (botao) {
    botao.addEventListener("click", function () {
      botoesDuracao.forEach(function (b) {
        b.classList.remove("active");
      });
      this.classList.add("active");
    });
  });

  const btnLimpar = document.getElementById("limparFiltros");

  btnLimpar.addEventListener("click", function () {
    document.querySelectorAll('input[name="tipo"]').forEach(function (radio) {
      radio.checked = false;
    });

    document.getElementById("origem").value = "";
    document.getElementById("datas").value = "";

    precoMin.value = MIN_VALOR;
    precoMax.value = MAX_VALOR;
    atualizarSlider();

    botoesDuracao.forEach(function (b) {
      b.classList.remove("active");
    });
    document.querySelector('[data-duracao="qualquer"]').classList.add("active");
  });
});
