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