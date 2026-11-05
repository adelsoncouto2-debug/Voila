const serviceStorageKey = "voila_ceo_services_v1";
const serviceRows = document.getElementById("serviceRows");
const serviceDialog = document.getElementById("serviceDialog");
const serviceForm = document.getElementById("serviceForm");
let services = [];

function serviceEscape(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function servicePriceNumber(value) {
  const normalized = String(value || "").replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function serviceMoney(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);
}

function loadStoredServices() {
  try {
    const stored = JSON.parse(localStorage.getItem(serviceStorageKey) || "null");
    return Array.isArray(stored) ? stored : null;
  } catch {
    return null;
  }
}

function normalizeServices(data) {
  return data.map((offer) => ({
    id: String(offer.id),
    name: offer.nome,
    category: "Pacote de viagem",
    price: servicePriceNumber(offer.precoNovo),
    status: "Ativo",
    includes: Array.isArray(offer.inclui) ? offer.inclui : [],
  }));
}

function filteredServices() {
  const search = document.getElementById("serviceSearch").value.trim().toLocaleLowerCase("pt-BR");
  const category = document.getElementById("serviceCategory").value;
  const status = document.getElementById("serviceStatus").value;
  return services.filter((service) => {
    const matchesCategory = category === "all" || service.category === category;
    const matchesStatus = status === "all" || service.status === status;
    const searchable = `${service.name} ${service.category} ${(service.includes || []).join(" ")}`.toLocaleLowerCase("pt-BR");
    return matchesCategory && matchesStatus && (!search || searchable.includes(search));
  }).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

function renderServiceCategoryOptions() {
  const select = document.getElementById("serviceCategory");
  const current = select.value;
  const categories = [...new Set(services.map((service) => service.category))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  select.innerHTML = '<option value="all">Todas</option>' + categories.map((category) => `<option value="${serviceEscape(category)}">${serviceEscape(category)}</option>`).join("");
  select.value = categories.includes(current) ? current : "all";
}

function renderServiceMetrics() {
  const active = services.filter((service) => service.status === "Ativo");
  const categories = new Set(services.map((service) => service.category)).size;
  const average = active.length ? active.reduce((sum, service) => sum + Number(service.price), 0) / active.length : 0;
  const metrics = [
    ["Serviços cadastrados", services.length, "Itens disponíveis no catálogo", '<path d="M4 5h16v14H4zM8 9h8M8 13h8M8 17h4"/>'],
    ["Ativos", active.length, "Visíveis para comercialização", '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>'],
    ["Categorias", categories, "Tipos de serviço oferecidos", '<path d="M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v6H4zM13 14h7v6h-7z"/>'],
    ["Preço médio", serviceMoney(average), "Dos serviços ativos", '<path d="M12 3v18M16 7.5c-.8-1-2.2-1.5-4-1.5-2.2 0-4 1-4 3 0 4.5 8 2 8 6.5 0 2-1.8 3-4 3-1.9 0-3.4-.6-4.2-1.8"/>'],
  ];
  document.getElementById("serviceMetrics").innerHTML = metrics.map(([label, value, note, icon]) => `
    <article class="operation-metric">
      <div class="operation-metric-label"><span class="operation-metric-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg></span>${label}</div>
      <p class="operation-metric-value">${value}</p><p class="operation-metric-note">${note}</p>
    </article>
  `).join("");
}

function renderServiceRows() {
  const visible = filteredServices();
  serviceRows.innerHTML = visible.map((service) => {
    const includes = (service.includes || []).slice(0, 3).join(" · ") || "Sem itens informados";
    const statusClass = service.status === "Ativo" ? "status-active" : "status-inactive";
    return `
      <tr>
        <td><span class="table-primary">${serviceEscape(service.name)}</span></td>
        <td>${serviceEscape(service.category)}</td>
        <td class="service-includes">${serviceEscape(includes)}</td>
        <td class="table-price">${serviceMoney(service.price)}</td>
        <td><span class="operation-status ${statusClass}">${serviceEscape(service.status)}</span></td>
        <td><button type="button" class="table-action" data-edit-service="${serviceEscape(service.id)}">Editar</button></td>
      </tr>
    `;
  }).join("");
  document.getElementById("serviceCount").textContent = `${visible.length} ${visible.length === 1 ? "serviço encontrado" : "serviços encontrados"}`;
  document.getElementById("serviceEmpty").hidden = visible.length > 0;
}

function renderServices() {
  renderServiceMetrics();
  renderServiceRows();
}

function resetServiceForm() {
  serviceForm.reset();
  document.getElementById("serviceId").value = "";
  document.getElementById("serviceDialogTitle").textContent = "Novo serviço";
}

function openServiceEditor(service) {
  resetServiceForm();
  if (service) {
    document.getElementById("serviceDialogTitle").textContent = "Editar serviço";
    document.getElementById("serviceId").value = service.id;
    document.getElementById("serviceNameInput").value = service.name;
    document.getElementById("serviceCategoryInput").value = service.category;
    document.getElementById("servicePriceInput").value = service.price;
    document.getElementById("serviceStatusInput").value = service.status;
    document.getElementById("serviceIncludesInput").value = (service.includes || []).join(", ");
  }
  serviceDialog.showModal();
}

async function initializeServices() {
  try {
    const base = typeof caminhoBase === "function" ? caminhoBase() : "";
    const response = await fetch(`${base}/json/destinos.json`);
    if (!response.ok) throw new Error("Não foi possível carregar o catálogo de serviços.");
    const source = await response.json();
    services = loadStoredServices() || normalizeServices(source);
    renderServiceCategoryOptions();
    renderServices();
  } catch (error) {
    document.getElementById("serviceCount").textContent = error.message;
    document.getElementById("serviceEmpty").hidden = false;
  }
}

document.getElementById("addServiceButton").addEventListener("click", () => openServiceEditor());
serviceRows.addEventListener("click", (event) => {
  const button = event.target.closest("[data-edit-service]");
  if (!button) return;
  openServiceEditor(services.find((service) => service.id === button.dataset.editService));
});
serviceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = (id) => document.getElementById(id).value.trim();
  const id = value("serviceId") || `servico-${Date.now()}`;
  const service = {
    id,
    name: value("serviceNameInput"),
    category: value("serviceCategoryInput"),
    price: Number(value("servicePriceInput")),
    status: value("serviceStatusInput"),
    includes: value("serviceIncludesInput").split(",").map((item) => item.trim()).filter(Boolean),
  };
  if (services.some((item) => item.id === id)) services = services.map((item) => item.id === id ? service : item);
  else services = [...services, service];
  localStorage.setItem(serviceStorageKey, JSON.stringify(services));
  renderServiceCategoryOptions();
  renderServices();
  serviceDialog.close();
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
document.getElementById("serviceSearch").addEventListener("input", renderServiceRows);
document.getElementById("serviceCategory").addEventListener("change", renderServiceRows);
document.getElementById("serviceStatus").addEventListener("change", renderServiceRows);
document.getElementById("clearServiceFilters").addEventListener("click", () => {
  document.getElementById("serviceSearch").value = "";
  document.getElementById("serviceCategory").value = "all";
  document.getElementById("serviceStatus").value = "all";
  renderServiceRows();
});

initializeServices();
