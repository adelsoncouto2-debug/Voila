const flightStorageKey = "voila_ceo_flights_v1";
const flightRows = document.getElementById("flightRows");
const flightDialog = document.getElementById("flightDialog");
const flightForm = document.getElementById("flightForm");
let flights = [];

function flightEscape(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function flightDateKey(offset) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseFlightDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function flightMoney(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);
}

function loadStoredFlights() {
  try {
    const stored = JSON.parse(localStorage.getItem(flightStorageKey) || "null");
    return Array.isArray(stored) ? stored : null;
  } catch {
    return null;
  }
}

function normalizeFlights(data) {
  return data.map((flight, index) => ({
    id: String(flight.id),
    number: flight.numeroVoo,
    company: flight.cia,
    origin: flight.origemCidade,
    originCode: flight.origem,
    destination: flight.destinoCidade,
    destinationCode: flight.destino,
    date: flightDateKey(index + 1),
    departure: flight.horarioIda,
    arrival: flight.horarioChegada,
    duration: flight.duracao,
    aircraft: flight.aeronave,
    capacity: 180,
    sold: 96 + ((index * 23) % 72),
    price: flight.preco,
    status: index === 0 ? "Em breve" : "Programado",
  }));
}

function flightStatusClass(status) {
  return ({
    Programado: "status-scheduled",
    "Em breve": "status-soon",
    "Quase lotado": "status-full",
    Cancelado: "status-cancelled",
  })[status] || "status-scheduled";
}

function filteredFlights() {
  const search = document.getElementById("flightSearch").value.trim().toLocaleLowerCase("pt-BR");
  const company = document.getElementById("flightCompany").value;
  const status = document.getElementById("flightStatus").value;
  return flights.filter((flight) => {
    const matchesCompany = company === "all" || flight.company === company;
    const matchesStatus = status === "all" || flight.status === status;
    const text = `${flight.number} ${flight.company} ${flight.origin} ${flight.destination} ${flight.originCode} ${flight.destinationCode}`.toLocaleLowerCase("pt-BR");
    return matchesCompany && matchesStatus && (!search || text.includes(search));
  }).sort((a, b) => a.date.localeCompare(b.date) || a.departure.localeCompare(b.departure));
}

function renderFlightMetrics() {
  const active = flights.filter((flight) => flight.status !== "Cancelado");
  const seats = active.reduce((sum, flight) => sum + Math.max(0, Number(flight.capacity) - Number(flight.sold)), 0);
  const totalCapacity = active.reduce((sum, flight) => sum + Number(flight.capacity), 0);
  const occupancy = totalCapacity ? Math.round((active.reduce((sum, flight) => sum + Number(flight.sold), 0) / totalCapacity) * 100) : 0;
  const metrics = [
    ["Voos cadastrados", flights.length, "Na agenda da agência", "<path d=\"M3 12 21 5l-6 16-3-7-9-2zM12 14l9-9\"/>", "flight"],
    ["Em operação", active.length, "Programados e em breve", "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M8 12h8M12 8v8\"/>", "flight"],
    ["Assentos disponíveis", seats, "Somados nos voos ativos", "<path d=\"M7 4v7a3 3 0 0 0 3 3h7v6M7 11h3a3 3 0 0 1 3 3v6M4 20h16\"/>", "seat"],
    ["Ocupação média", `${occupancy}%`, "Considerando voos ativos", "<path d=\"M4 17l5-5 4 3 7-8M15 7h5v5\"/>", "flight"],
  ];
  document.getElementById("flightMetrics").innerHTML = metrics.map(([label, value, note, icon]) => `
    <article class="operation-metric">
      <div class="operation-metric-label"><span class="operation-metric-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg></span>${label}</div>
      <p class="operation-metric-value">${value}</p><p class="operation-metric-note">${note}</p>
    </article>
  `).join("");
}

function renderFlightCompanyOptions() {
  const select = document.getElementById("flightCompany");
  const current = select.value;
  const companies = [...new Set(flights.map((flight) => flight.company))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  select.innerHTML = '<option value="all">Todas</option>' + companies.map((company) => `<option value="${flightEscape(company)}">${flightEscape(company)}</option>`).join("");
  select.value = companies.includes(current) ? current : "all";
}

function renderFlightRows() {
  const visible = filteredFlights();
  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  flightRows.innerHTML = visible.map((flight) => {
    const capacity = Math.max(1, Number(flight.capacity));
    const sold = Math.min(capacity, Number(flight.sold));
    const available = capacity - sold;
    const percent = Math.round((sold / capacity) * 100);
    const fillClass = percent >= 90 ? "high" : percent >= 70 ? "medium" : "";
    const route = `${flight.originCode} → ${flight.destinationCode}`;
    return `
      <tr>
        <td><span class="table-primary">${flightEscape(flight.number)}</span><span class="table-secondary">${flightEscape(route)}</span></td>
        <td>${flightEscape(flight.company)}<span class="table-secondary">${flightEscape(flight.aircraft || "")}</span></td>
        <td><span class="table-primary">${parseFlightDate(flight.date).toLocaleDateString("pt-BR")}</span><span class="table-secondary">${flightEscape(flight.departure)} – ${flightEscape(flight.arrival)} · ${flightEscape(flight.duration || "")}</span></td>
        <td><div class="seat-info"><div class="seat-info-line"><span>${available} livres</span><strong>${percent}% ocup.</strong></div><div class="seat-track" aria-label="${percent}% dos assentos ocupados"><div class="seat-fill ${fillClass}" style="width:${percent}%"></div></div></div></td>
        <td class="table-price">${currency.format(Number(flight.price) || 0)}</td>
        <td><span class="operation-status ${flightStatusClass(flight.status)}">${flightEscape(flight.status)}</span></td>
        <td><button type="button" class="table-action" data-edit-flight="${flightEscape(flight.id)}">Editar</button></td>
      </tr>
    `;
  }).join("");
  document.getElementById("flightCount").textContent = `${visible.length} ${visible.length === 1 ? "voo encontrado" : "voos encontrados"}`;
  document.getElementById("flightEmpty").hidden = visible.length > 0;
}

function renderFlights() {
  renderFlightMetrics();
  renderFlightRows();
}

function resetFlightForm() {
  flightForm.reset();
  document.getElementById("flightId").value = "";
  document.getElementById("flightCapacityInput").value = "180";
  document.getElementById("flightSoldInput").value = "0";
  document.getElementById("flightFormError").hidden = true;
  document.getElementById("flightDialogTitle").textContent = "Cadastrar voo";
}

function openFlightEditor(flight) {
  resetFlightForm();
  if (flight) {
    document.getElementById("flightDialogTitle").textContent = "Editar voo";
    document.getElementById("flightId").value = flight.id;
    document.getElementById("flightNumberInput").value = flight.number;
    document.getElementById("flightCompanyInput").value = flight.company;
    document.getElementById("flightOriginInput").value = flight.origin;
    document.getElementById("flightDestinationInput").value = flight.destination;
    document.getElementById("flightDateInput").value = flight.date;
    document.getElementById("flightAircraftInput").value = flight.aircraft || "";
    document.getElementById("flightDepartureInput").value = flight.departure;
    document.getElementById("flightArrivalInput").value = flight.arrival;
    document.getElementById("flightCapacityInput").value = flight.capacity;
    document.getElementById("flightSoldInput").value = flight.sold;
    document.getElementById("flightPriceInput").value = flight.price;
    document.getElementById("flightStatusInput").value = flight.status;
  }
  flightDialog.showModal();
}

async function initializeFlights() {
  try {
    const base = typeof caminhoBase === "function" ? caminhoBase() : "";
    const response = await fetch(`${base}/json/passagens.json`);
    if (!response.ok) throw new Error("Não foi possível carregar os voos.");
    const source = await response.json();
    flights = loadStoredFlights() || normalizeFlights(source);
    renderFlightCompanyOptions();
    renderFlights();
  } catch (error) {
    document.getElementById("flightCount").textContent = error.message;
    document.getElementById("flightEmpty").hidden = false;
  }
}

document.getElementById("addFlightButton").addEventListener("click", () => openFlightEditor());
flightRows.addEventListener("click", (event) => {
  const button = event.target.closest("[data-edit-flight]");
  if (!button) return;
  openFlightEditor(flights.find((flight) => flight.id === button.dataset.editFlight));
});
flightForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = (id) => document.getElementById(id).value.trim();
  const capacity = Number(value("flightCapacityInput"));
  const sold = Number(value("flightSoldInput"));
  const error = document.getElementById("flightFormError");
  if (sold > capacity) {
    error.textContent = "Os assentos vendidos não podem exceder a capacidade da aeronave.";
    error.hidden = false;
    return;
  }
  const id = value("flightId") || `voo-${Date.now()}`;
  const previous = flights.find((flight) => flight.id === id);
  const origin = value("flightOriginInput");
  const destination = value("flightDestinationInput");
  const flight = {
    id,
    number: value("flightNumberInput"),
    company: value("flightCompanyInput"),
    origin,
    originCode: previous?.originCode || origin,
    destination,
    destinationCode: previous?.destinationCode || destination,
    date: value("flightDateInput"),
    departure: value("flightDepartureInput"),
    arrival: value("flightArrivalInput"),
    duration: previous?.duration || "",
    aircraft: value("flightAircraftInput"),
    capacity,
    sold,
    price: Number(value("flightPriceInput")),
    status: value("flightStatusInput"),
  };
  if (previous) flights = flights.map((item) => item.id === id ? flight : item);
  else flights = [...flights, flight];
  localStorage.setItem(flightStorageKey, JSON.stringify(flights));
  renderFlightCompanyOptions();
  renderFlights();
  flightDialog.close();
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
document.getElementById("flightSearch").addEventListener("input", renderFlightRows);
document.getElementById("flightCompany").addEventListener("change", renderFlightRows);
document.getElementById("flightStatus").addEventListener("change", renderFlightRows);
document.getElementById("clearFlightFilters").addEventListener("click", () => {
  document.getElementById("flightSearch").value = "";
  document.getElementById("flightCompany").value = "all";
  document.getElementById("flightStatus").value = "all";
  renderFlightRows();
});

initializeFlights();
