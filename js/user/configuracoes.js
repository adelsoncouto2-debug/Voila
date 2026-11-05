const STORAGE_KEY = "voila.settings";
const toast = document.getElementById("settings_toast");
const forms = document.querySelectorAll("[data-settings-form]");
let toastTimer;

function showToast(message, isError = false) {
  toast.textContent = message;
  toast.classList.toggle("toast_error", isError);
  toast.classList.add("toast_show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("toast_show"), 3500);
}

function readSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};

    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Formato de configurações inválido");
    }

    return parsed;
  } catch (error) {
    console.error("Erro ao carregar as configurações:", error);
    showToast("Não foi possível carregar as configurações salvas.", true);
    return {};
  }
}

const savedSettings = readSettings();

document.querySelectorAll("[data-setting]").forEach((field) => {
  const savedValue = savedSettings[field.name];
  if (typeof savedValue === "undefined") return;

  if (field.type === "checkbox" && typeof savedValue === "boolean") {
    field.checked = savedValue;
  } else if (field.type !== "checkbox" && typeof savedValue === "string") {
    field.value = savedValue;
  }
});

forms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const updatedSettings = { ...savedSettings };
    form.querySelectorAll("[data-setting]").forEach((field) => {
      updatedSettings[field.name] =
        field.type === "checkbox" ? field.checked : field.value.trim();
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
      Object.assign(savedSettings, updatedSettings);
      showToast("Configurações salvas neste navegador.");
    } catch (error) {
      console.error("Erro ao salvar as configurações:", error);
      showToast("Não foi possível salvar. Verifique o espaço disponível.", true);
    }
  });
});
