const complaintStatusLabels = {
  open: "Aberto",
  progress: "Em atendimento",
  resolved: "Resolvido",
};

function complaintDaysAgo(days) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return localDateKey(date);
}

const complaintRecords = [
  { protocol: "SAC-2408", subject: "Reembolso pendente", category: "Cancelamento e reembolso", opened: complaintDaysAgo(0), channel: "Chat", attendant: "Mariana Costa", status: "progress" },
  { protocol: "SAC-2407", subject: "Alteração de horário do voo", category: "Voos e horários", opened: complaintDaysAgo(0), channel: "Chat", attendant: "Rafael Nunes", status: "open" },
  { protocol: "SAC-2406", subject: "Cobrança em duplicidade", category: "Pagamento", opened: complaintDaysAgo(1), channel: "Chat", attendant: "Camila Rocha", status: "resolved" },
  { protocol: "SAC-2405", subject: "Assento diferente do escolhido", category: "Reserva e assentos", opened: complaintDaysAgo(1), channel: "Chat", attendant: "Mariana Costa", status: "progress" },
  { protocol: "SAC-2404", subject: "Dificuldade para cancelar passagem", category: "Cancelamento e reembolso", opened: complaintDaysAgo(2), channel: "Chat", attendant: "Sem responsável", status: "open" },
  { protocol: "SAC-2403", subject: "Confirmação da compra não recebida", category: "Pagamento", opened: complaintDaysAgo(3), channel: "Chat", attendant: "Rafael Nunes", status: "resolved" },
  { protocol: "SAC-2402", subject: "Informação incorreta sobre bagagem", category: "Atendimento", opened: complaintDaysAgo(4), channel: "Chat", attendant: "Camila Rocha", status: "resolved" },
  { protocol: "SAC-2401", subject: "Voo cancelado pela companhia", category: "Voos e horários", opened: complaintDaysAgo(6), channel: "Chat", attendant: "Mariana Costa", status: "progress" },
  { protocol: "SAC-2400", subject: "Estorno ainda não identificado", category: "Cancelamento e reembolso", opened: complaintDaysAgo(9), channel: "Chat", attendant: "Rafael Nunes", status: "open" },
  { protocol: "SAC-2399", subject: "Erro ao finalizar pagamento", category: "Pagamento", opened: complaintDaysAgo(11), channel: "Chat", attendant: "Camila Rocha", status: "resolved" },
  { protocol: "SAC-2398", subject: "Dúvida sobre conexão", category: "Voos e horários", opened: complaintDaysAgo(16), channel: "Chat", attendant: "Mariana Costa", status: "resolved" },
  { protocol: "SAC-2397", subject: "Atendimento durante a compra", category: "Atendimento", opened: complaintDaysAgo(22), channel: "Chat", attendant: "Rafael Nunes", status: "resolved" },
  { protocol: "SAC-2396", subject: "Ajuste de dados da reserva", category: "Reserva e assentos", opened: complaintDaysAgo(26), channel: "Chat", attendant: "Camila Rocha", status: "resolved" },
];

const complaintIcons = {
  total: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v12H9l-5 4V5zM8 9h8M8 13h5"/></svg>',
  open: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  progress: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14-5l2 2M20 4v5h-5M20 12a8 8 0 0 1-14 5l-2-2M4 20v-5h5"/></svg>',
  resolved: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>',
};

const complaintElements = {
  period: document.getElementById("filterPeriod"),
  status: document.getElementById("filterStatus"),
  subject: document.getElementById("filterSubject"),
  search: document.getElementById("filterSearch"),
  rows: document.getElementById("complaintRows"),
  kpis: document.getElementById("complaintKpis"),
  topicChart: document.getElementById("topicChart"),
  volumeChart: document.getElementById("volumeChart"),
  empty: document.getElementById("emptyState"),
  summary: document.getElementById("tableSummary"),
};

function complaintEscape(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function complaintDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function complaintsInPeriod() {
  const selected = complaintElements.period.value;
  if (selected === "all") return complaintRecords;
  const days = Number(selected);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days + 1);
  return complaintRecords.filter((record) => complaintDate(record.opened) >= start);
}

function filteredComplaints() {
  const search = complaintElements.search.value.trim().toLocaleLowerCase("pt-BR");
  return complaintsInPeriod().filter((record) => {
    const matchesStatus = complaintElements.status.value === "all" || record.status === complaintElements.status.value;
    const matchesSubject = complaintElements.subject.value === "all" || record.category === complaintElements.subject.value;
    const searchable = `${record.protocol} ${record.subject} ${record.category} ${record.attendant}`.toLocaleLowerCase("pt-BR");
    return matchesStatus && matchesSubject && (!search || searchable.includes(search));
  });
}

function renderComplaintSubjectOptions() {
  const categories = [...new Set(complaintRecords.map((record) => record.category))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  complaintElements.subject.innerHTML = '<option value="all">Todos os assuntos</option>' + categories
    .map((category) => `<option value="${complaintEscape(category)}">${complaintEscape(category)}</option>`)
    .join("");
}

function renderComplaintKpis(records) {
  const metrics = [
    { key: "total", label: "Chamados no período", count: records.length, note: "Registros de atendimento" },
    { key: "open", label: "Abertos", count: records.filter((record) => record.status === "open").length, note: "Aguardando atendimento" },
    { key: "progress", label: "Em atendimento", count: records.filter((record) => record.status === "progress").length, note: "Em acompanhamento pela equipe" },
    { key: "resolved", label: "Resolvidos", count: records.filter((record) => record.status === "resolved").length, note: "Atendimentos concluídos" },
  ];
  complaintElements.kpis.innerHTML = metrics.map((metric) => `
    <article class="complaint-kpi">
      <div class="complaint-kpi-label"><span class="complaint-kpi-icon">${complaintIcons[metric.key]}</span>${metric.label}</div>
      <p class="complaint-kpi-value">${metric.count}</p>
      <p class="complaint-kpi-note">${metric.note}</p>
    </article>
  `).join("");
}

function renderTopicChart(records) {
  const counts = new Map();
  records.forEach((record) => counts.set(record.category, (counts.get(record.category) || 0) + 1));
  const entries = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"));
  const max = Math.max(1, ...entries.map(([, count]) => count));
  complaintElements.topicChart.innerHTML = entries.length ? entries.map(([category, count]) => `
    <div class="topic-row">
      <span class="topic-label" title="${complaintEscape(category)}">${complaintEscape(category)}</span>
      <span class="topic-track" aria-hidden="true"><span class="topic-fill" style="width:${Math.round((count / max) * 100)}%"></span></span>
      <span class="topic-count">${count}</span>
    </div>
  `).join("") : '<p class="topic-empty">Sem chamados para exibir neste filtro.</p>';
}

function renderVolumeChart(records) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const key = localDateKey(date);
    const count = records.filter((record) => record.opened === key).length;
    return { date, count };
  });
  const max = Math.max(1, ...days.map((day) => day.count));
  const formatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
  complaintElements.volumeChart.innerHTML = days.map(({ date, count }) => `
    <div class="volume-day" aria-label="${date.toLocaleDateString("pt-BR")}: ${count} chamados">
      <div class="volume-bar-area"><span class="volume-bar" style="height:${Math.max(3, (count / max) * 100)}%"><span class="volume-bar-value">${count}</span></span></div>
      <span>${formatter.format(date).replace(".", "")}</span>
    </div>
  `).join("");
}

function renderComplaintRows(records) {
  const sorted = [...records].sort((a, b) => b.opened.localeCompare(a.opened) || b.protocol.localeCompare(a.protocol));
  complaintElements.rows.innerHTML = sorted.map((record) => `
    <tr>
      <td><span class="protocol">${complaintEscape(record.protocol)}</span></td>
      <td><span class="subject-main">${complaintEscape(record.subject)}</span><span class="subject-category">${complaintEscape(record.category)}</span></td>
      <td>${complaintDate(record.opened).toLocaleDateString("pt-BR")}</td>
      <td>${complaintEscape(record.channel)}</td>
      <td>${complaintEscape(record.attendant)}</td>
      <td><span class="complaint-status status-${record.status}">${complaintStatusLabels[record.status]}</span></td>
    </tr>
  `).join("");
  complaintElements.empty.hidden = sorted.length > 0;
  complaintElements.summary.textContent = `${sorted.length} ${sorted.length === 1 ? "chamado encontrado" : "chamados encontrados"}`;
}

function renderComplaints() {
  const periodRecords = complaintsInPeriod();
  const records = filteredComplaints();
  renderComplaintKpis(periodRecords);
  renderTopicChart(records);
  renderVolumeChart(records);
  renderComplaintRows(records);
}

renderComplaintSubjectOptions();
complaintElements.period.addEventListener("change", renderComplaints);
complaintElements.status.addEventListener("change", renderComplaints);
complaintElements.subject.addEventListener("change", renderComplaints);
complaintElements.search.addEventListener("input", renderComplaints);
document.getElementById("clearFilters").addEventListener("click", () => {
  complaintElements.period.value = "30";
  complaintElements.status.value = "all";
  complaintElements.subject.value = "all";
  complaintElements.search.value = "";
  renderComplaints();
});
renderComplaints();
