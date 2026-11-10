const tripsScriptUrl = document.currentScript.src;
const tripsDataUrl = new URL("../../../json/destinos.json", tripsScriptUrl);
const tripsListPage = document.querySelector("#trips-list-page");
const tripsEditorPage = document.querySelector("#trip-editor-page");
const tripsList = document.querySelector("#trips-list");
const tripsSearchForm = document.querySelector("#trip-search-form");
const tripsSearch = document.querySelector("#trip-search");
const tripsCount = document.querySelector("#trips-count");
const tripsMessage = document.querySelector("#trips-message");
const tripsError = document.querySelector("#trips-error");
const tripForm = document.querySelector("#trip-form");
const tripNameInput = document.querySelector("#trip-name");
const tripDescriptionInput = document.querySelector("#trip-description");
const tripMainImageInput = document.querySelector("#trip-main-image");
const tripPriceInput = document.querySelector("#trip-price");
const galleryInputs = document.querySelector("#gallery-inputs");
const galleryPreview = document.querySelector("#gallery-preview");
const editorTitle = document.querySelector("#trip-editor-title");
const saveTripButton = document.querySelector("#save-trip-button");

let trips = [];
let currentTripId = null;
let nextDemoTripId = -1;

function normalizeSearchValue(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

function getImageUrl(path) {
  try {
    return new URL(path, tripsDataUrl).href;
  } catch {
    return "";
  }
}

function createTripCard(trip) {
  const card = document.createElement("article");
  card.className = "trip-row";

  const image = document.createElement("img");
  image.className = "trip-row-image";
  image.src = getImageUrl(trip.imagemPrincipal);
  image.alt = "";
  image.loading = "lazy";

  const content = document.createElement("div");
  content.className = "trip-row-content";

  const top = document.createElement("div");
  top.className = "trip-row-top";

  const name = document.createElement("h2");
  name.className = "trip-row-name";
  name.textContent = trip.nome;

  const status = document.createElement("span");
  status.className = "trip-status";
  status.textContent = "Cadastrada";
  top.append(name, status);

  const description = document.createElement("p");
  description.className = "trip-row-description";
  description.textContent = trip.sobre || "Sem descrição cadastrada.";

  const meta = document.createElement("p");
  meta.className = "trip-row-meta";
  const details = [];
  if (trip.precoNovo) details.push(`Preço exibido: ${trip.precoNovo}`);
  if (trip.galeria?.length) {
    details.push(
      `${trip.galeria.length} ${trip.galeria.length === 1 ? "foto" : "fotos"} na galeria`,
    );
  }
  meta.textContent = details.join(" · ");

  const openButton = document.createElement("button");
  openButton.className = "open-trip-button";
  openButton.type = "button";
  openButton.textContent = "Abrir viagem";
  openButton.addEventListener("click", () => openTripEditor(trip.id));

  content.append(top, description, meta, openButton);
  card.append(image, content);
  return card;
}

function renderTrips() {
  const query = normalizeSearchValue(tripsSearch.value);
  const visibleTrips = trips.filter((trip) =>
    normalizeSearchValue(`${trip.nome} ${trip.sobre || ""}`).includes(query),
  );

  tripsList.replaceChildren(...visibleTrips.map(createTripCard));
  tripsCount.textContent = `${visibleTrips.length} ${
    visibleTrips.length === 1 ? "viagem encontrada" : "viagens encontradas"
  }`;
  tripsMessage.hidden = visibleTrips.length > 0;
  tripsMessage.textContent = query
    ? "Nenhuma viagem encontrada com esse termo."
    : "Nenhuma viagem cadastrada.";
}

function createGalleryInput(value = "") {
  const row = document.createElement("div");
  row.className = "gallery-input-row";

  const label = document.createElement("label");
  label.className = "visually-hidden";
  label.textContent = "URL da foto da galeria";

  const input = document.createElement("input");
  input.type = "text";
  input.name = "galleryPhoto";
  input.placeholder = "https://exemplo.com/foto.jpg";
  input.value = value;
  label.append(input);

  const removeButton = document.createElement("button");
  removeButton.className = "remove-photo-button";
  removeButton.type = "button";
  removeButton.textContent = "Remover";
  removeButton.addEventListener("click", () => {
    row.remove();
    renderGalleryPreview();
  });

  input.addEventListener("input", renderGalleryPreview);
  row.append(label, removeButton);
  galleryInputs.append(row);
}

function renderGalleryPreview() {
  const imageUrls = [...galleryInputs.querySelectorAll('input[name="galleryPhoto"]')]
    .map((input) => input.value.trim())
    .filter(Boolean);

  galleryPreview.replaceChildren();
  imageUrls.forEach((url) => {
    const image = document.createElement("img");
    image.src = getImageUrl(url);
    image.alt = "Foto da galeria";
    image.loading = "lazy";
    image.addEventListener("error", () => image.remove(), { once: true });
    galleryPreview.append(image);
  });
}

function openTripEditor(tripId) {
  const trip = trips.find((item) => item.id === tripId);
  if (!trip) return;

  currentTripId = trip.id;
  editorTitle.textContent = `Editar viagem: ${trip.nome}`;
  saveTripButton.textContent = "Salvar alterações";
  tripNameInput.value = trip.nome || "";
  tripDescriptionInput.value = trip.sobre || "";
  tripMainImageInput.value = trip.imagemPrincipal || "";
  tripPriceInput.value = trip.precoNovo || "";
  galleryInputs.replaceChildren();
  (trip.galeria || []).forEach((photo) => createGalleryInput(photo));
  renderGalleryPreview();
  showEditor();
}

function openNewTripEditor() {
  currentTripId = null;
  editorTitle.textContent = "Adicionar nova viagem";
  saveTripButton.textContent = "Adicionar viagem";
  tripForm.reset();
  galleryInputs.replaceChildren();
  galleryPreview.replaceChildren();
  createGalleryInput();
  showEditor();
}

function showEditor() {
  tripsListPage.hidden = true;
  tripsEditorPage.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
  tripNameInput.focus();
}

function showTrips() {
  tripsEditorPage.hidden = true;
  tripsListPage.hidden = false;
  currentTripId = null;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleTripFormSubmit(event) {
  event.preventDefault();

  const gallery = [...galleryInputs.querySelectorAll('input[name="galleryPhoto"]')]
    .map((input) => input.value.trim())
    .filter(Boolean);
  const values = {
    nome: tripNameInput.value.trim(),
    sobre: tripDescriptionInput.value.trim(),
    imagemPrincipal: tripMainImageInput.value.trim() || gallery[0] || "",
    galeria: gallery,
    precoNovo: tripPriceInput.value.trim(),
  };

  if (currentTripId === null) {
    trips.unshift({
      id: nextDemoTripId--,
      tipo: "demonstracao",
      ...values,
    });
  } else {
    const trip = trips.find((item) => item.id === currentTripId);
    if (!trip) return;
    Object.assign(trip, values);
  }

  tripsSearch.value = "";
  renderTrips();
  showTrips();
}

tripsSearchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderTrips();
});

tripsSearchForm.addEventListener("reset", () => {
  requestAnimationFrame(renderTrips);
});

document.querySelector("#add-trip-button").addEventListener("click", openNewTripEditor);
document.querySelector("#back-to-trips").addEventListener("click", showTrips);
document.querySelector("#cancel-trip-edit").addEventListener("click", showTrips);
document.querySelector("#add-gallery-photo").addEventListener("click", () => {
  createGalleryInput();
  galleryInputs.lastElementChild.querySelector("input").focus();
});
tripMainImageInput.addEventListener("input", renderGalleryPreview);
tripForm.addEventListener("submit", handleTripFormSubmit);

async function loadTrips() {
  const response = await fetch(tripsDataUrl);
  if (!response.ok) {
    throw new Error(`Falha ao carregar as viagens: HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new TypeError("O arquivo de destinos deve conter uma lista.");
  }

  trips = data.filter(
    (trip) =>
      trip &&
      Number.isFinite(trip.id) &&
      typeof trip.nome === "string" &&
      typeof trip.imagemPrincipal === "string",
  );
  renderTrips();
}

loadTrips().catch((error) => {
  console.error("Erro ao carregar as viagens:", error);
  tripsList.replaceChildren();
  tripsCount.textContent = "";
  tripsMessage.hidden = true;
  tripsError.hidden = false;
});
