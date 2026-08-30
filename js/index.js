const viewportCards = document.querySelector(".viewport_cards");
const cardsContainer = document.querySelector(".cards_container");

if (viewportCards && cardsContainer) {
  viewportCards.addEventListener("mousemove", (e) => {
    const rect = viewportCards.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const threshold = rect.width * 0.3;

    if (mouseX < threshold) {
      cardsContainer.classList.remove("scroll-right");
      cardsContainer.classList.add("scroll-left");
    } else if (mouseX > rect.width - threshold) {
      cardsContainer.classList.remove("scroll-left");
      cardsContainer.classList.add("scroll-right");
    }
  });

  viewportCards.addEventListener("mouseleave", () => {
    cardsContainer.classList.remove("scroll-left", "scroll-right");
  });
}

const viewportTrips = document.querySelector(".viewport_trips");
const tripsContainer = document.querySelector(".trips_container");
const buttonLeft = document.querySelector(".circle_button_left");
const buttonRight = document.querySelector(".circle_button_right");
let posicao = 0;
const totalCards = tripsContainer.querySelectorAll(".cards_trips").length;
const cardsVisiveis = 3;
const ultimaPosicao = totalCards - cardsVisiveis;
buttonRight.addEventListener("click", function () {
  if (posicao < ultimaPosicao) {
    posicao++;
  }
  tripsContainer.style.transform = `translateX(-${posicao * 360}px)`;
});
buttonLeft.addEventListener("click", function () {
  if (posicao > 0) {
    posicao--;
  }
  tripsContainer.style.transform = `translateX(-${posicao * 360}px)`;
});
