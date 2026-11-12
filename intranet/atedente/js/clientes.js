const clientTabs = [...document.querySelectorAll(".client-tab")];
const clientSearch = document.querySelector("#client-search");
const clientPanels = [...document.querySelectorAll(".client-panel")];

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function selectClientTab(selectedTab) {
  clientTabs.forEach((tab) => {
    const isSelected = tab === selectedTab;
    tab.classList.toggle("is-active", isSelected);
    tab.setAttribute("aria-selected", String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
  });

  clientPanels.forEach((panel) => {
    panel.hidden = panel.id !== selectedTab.getAttribute("aria-controls");
  });

  filterClients();
}

function filterClients() {
  const activePanel = clientPanels.find((panel) => !panel.hidden);
  const query = normalizeText(clientSearch.value.trim());
  const cards = [...activePanel.querySelectorAll(".client-card")];
  let visibleCards = 0;

  cards.forEach((card) => {
    const matches = normalizeText(card.textContent).includes(query);
    card.hidden = !matches;
    visibleCards += Number(matches);
  });

  activePanel.querySelector(".empty-state").hidden = visibleCards > 0;
}

clientTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectClientTab(tab));
  tab.addEventListener("keydown", (event) => {
    let nextIndex;

    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % clientTabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + clientTabs.length) % clientTabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = clientTabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    clientTabs[nextIndex].focus();
    selectClientTab(clientTabs[nextIndex]);
  });
});

clientSearch.addEventListener("input", filterClients);
