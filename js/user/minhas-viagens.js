const viagemFilterButtons = Array.from(
  document.querySelectorAll(".low_card_bellow_main"),
);

if (viagemFilterButtons.length > 0) {
  const initialActiveButton =
    viagemFilterButtons.find(
      (button) => button.getAttribute("aria-pressed") === "true",
    ) ?? viagemFilterButtons[0];

  viagemFilterButtons.forEach((button) => {
    const isActive = button === initialActiveButton;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));

    button.addEventListener("click", () => {
      viagemFilterButtons.forEach((filterButton) => {
        const selected = filterButton === button;
        filterButton.classList.toggle("is-active", selected);
        filterButton.setAttribute("aria-pressed", String(selected));
      });
    });
  });
}
