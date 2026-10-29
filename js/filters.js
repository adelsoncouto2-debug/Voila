function getBasePath() {
  if (location.hostname.endsWith("github.io")) {
    const partes = location.pathname.split("/").filter(Boolean);
    return partes.length > 0 ? "/" + partes[0] : "";
  }
  return "";
}

function basePath(caminho) {
  if (!caminho.startsWith("/")) caminho = "/" + caminho;
  return getBasePath() + caminho;
}

document.addEventListener("DOMContentLoaded", function () {
  const MIN_VALOR = 500;
  const MAX_VALOR = 15000;

  fetch(basePath("/components/filters.html"))
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Falha ao carregar o filtro: HTTP ${response.status}`);
      }
      return response.text();
    })
    .then((data) => {
      const container = document.getElementById("filter");
      if (!container) {
        throw new Error("Elemento #filter não encontrado");
      }

      container.innerHTML = data;

      const precoMin = container.querySelector("#precoMin");
      const precoMax = container.querySelector("#precoMax");
      const precoMinLabel = container.querySelector("#precoMinLabel");
      const precoMaxLabel = container.querySelector("#precoMaxLabel");
      const sliderRange = container.querySelector("#sliderRange");
      const btnLimpar = container.querySelector("#limparFiltros");

      if (
        !precoMin ||
        !precoMax ||
        !precoMinLabel ||
        !precoMaxLabel ||
        !sliderRange ||
        !btnLimpar
      ) {
        throw new Error("Controles necessários não encontrados no componente de filtros");
      }

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

      const botoesDuracao = container.querySelectorAll(".btn-duracao");
      botoesDuracao.forEach(function (botao) {
        botao.addEventListener("click", function () {
          botoesDuracao.forEach(function (b) {
            b.classList.remove("active");
          });
          this.classList.add("active");
        });
      });

      btnLimpar.addEventListener("click", function () {
        container.querySelectorAll('input[name="tipo"]').forEach(function (radio) {
          radio.checked = false;
        });

        container.querySelector("#origem").value = "";
        container.querySelector("#datas").value = "";

        precoMin.value = MIN_VALOR;
        precoMax.value = MAX_VALOR;
        atualizarSlider();

        botoesDuracao.forEach(function (b) {
          b.classList.remove("active");
        });
        container
          .querySelector('[data-duracao="qualquer"]')
          .classList.add("active");
      });
    })
    .catch((error) => console.error("Erro ao carregar o filtro:", error));
});