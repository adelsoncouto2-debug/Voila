const reservationsScriptUrl = document.currentScript.src;
const reservationsDataUrl = new URL("../json/reservas.json", reservationsScriptUrl);
const reservationList = document.querySelector("#reservations-list");
const reservationMessage = document.querySelector("#reservations-message");
const reservationSearch = document.querySelector("#reservation-search");
const reservationQuery = document.querySelector("#reservation-query");
const reservationTabs = [...document.querySelectorAll(".reservation-tab")];
const reservationPanel = document.querySelector("#reservations-panel");

const reservationStatusLabels = {
  reservada: "Reserva",
  marcada: "Viagem marcada",
  cancelada: "Cancelada",
};

let reservations = [];
let activeStatus = "reservada";

function normalizeSearchValue(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}

function createDetail(label, value) {
  const item = document.createElement("span");
  const strong = document.createElement("strong");
  strong.textContent = `${label}: `;
  item.append(strong, document.createTextNode(value));
  return item;
}

function createReservationCard(reservation) {
  const card = document.createElement("article");
  card.className = "reservation-card";

  const main = document.createElement("div");
  main.className = "reservation-card-main";

  const top = document.createElement("div");
  top.className = "reservation-card-top";

  const client = document.createElement("h2");
  client.className = "reservation-client";
  client.textContent = reservation.cliente;

  const status = document.createElement("span");
  status.className = `reservation-status ${reservation.status}`;
  status.textContent = reservationStatusLabels[reservation.status];
  top.append(client, status);

  const destination = document.createElement("p");
  destination.className = "reservation-destination";
  destination.textContent = `${reservation.destino} · Reserva ${reservation.id}`;

  const details = document.createElement("p");
  details.className = "reservation-details";
  details.append(
    createDetail("Ida", formatDate(reservation.dataPartida)),
    createDetail("Volta", formatDate(reservation.dataRetorno)),
  );

  const price = document.createElement("span");
  price.className = "reservation-price";
  price.textContent = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(reservation.valor);

  main.append(top, destination, details);
  card.append(main, price);
  return card;
}

function getVisibleReservations() {
  const query = normalizeSearchValue(reservationQuery.value);

  return reservations.filter((reservation) => {
    const matchesStatus = reservation.status === activeStatus;
    const matchesName =
      normalizeSearchValue(reservation.cliente) === query;
    const matchesDestination =
      normalizeSearchValue(reservation.destino) === query;

    return (
      matchesStatus &&
      (query === "" || matchesName === true || matchesDestination === true)
    );
  });
}

function renderReservations() {
  const visibleReservations = getVisibleReservations();
  reservationList.replaceChildren(
    ...visibleReservations.map(createReservationCard),
  );

  reservationMessage.hidden = visibleReservations.length > 0;
  if (visibleReservations.length > 0) {
    return;
  }

  if (reservations.length === 0) {
    reservationMessage.textContent = "Nenhuma reserva foi encontrada.";
  } else if (reservationQuery.value.trim()) {
    reservationMessage.textContent =
      "Nenhuma reserva encontrada com esse nome ou destino exato.";
  } else {
    reservationMessage.textContent = "Não há itens nesta categoria.";
  }
}

function updateTabCounts() {
  reservationTabs.forEach((tab) => {
    const status = tab.querySelector(".tab-count").dataset.count;
    const count = reservations.filter(
      (reservation) => reservation.status === status,
    ).length;
    tab.querySelector(".tab-count").textContent = String(count);
  });
}

function selectStatusTab(selectedTab) {
  activeStatus = selectedTab.querySelector(".tab-count").dataset.count;

  reservationTabs.forEach((tab) => {
    const isSelected = tab === selectedTab;
    tab.classList.toggle("is-active", isSelected);
    tab.setAttribute("aria-selected", String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
  });

  reservationPanel.setAttribute(
    "aria-labelledby",
    selectedTab.id,
  );
  renderReservations();
}

reservationTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectStatusTab(tab));
  tab.addEventListener("keydown", (event) => {
    let nextIndex;
    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % reservationTabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + reservationTabs.length) % reservationTabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = reservationTabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    reservationTabs[nextIndex].focus();
    selectStatusTab(reservationTabs[nextIndex]);
  });
});

reservationSearch.addEventListener("submit", (event) => {
  event.preventDefault();
  renderReservations();
});

reservationSearch.addEventListener("reset", () => {
  requestAnimationFrame(renderReservations);
});

async function loadReservations() {
  const response = await fetch(reservationsDataUrl);
  if (!response.ok) {
    throw new Error(`Falha ao carregar as reservas: HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new TypeError("O arquivo de reservas deve conter uma lista.");
  }

  reservations = data;
  updateTabCounts();
  renderReservations();
}

loadReservations().catch((error) => {
  console.error("Erro ao carregar as reservas:", error);
  reservationList.replaceChildren();
  reservationMessage.hidden = false;
  reservationMessage.textContent =
    "Não foi possível carregar as reservas. Tente novamente mais tarde.";
});
