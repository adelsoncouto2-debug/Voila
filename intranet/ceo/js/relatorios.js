













































const PAGE_SIZE = 10;
const COMPLAINT_SUBJECTS = [
  "Cancelamento de voo",
  "Bagagem",
  "Pagamento",
  "Atraso",
  "Outros",
];
const TIME_BUCKETS = [
  { label: "Madrugada", range: "00h – 06h" },
  { label: "Manhã", range: "06h – 12h" },
  { label: "Tarde", range: "12h – 18h" },
  { label: "Noite", range: "18h – 24h" },
];



function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d, n) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

function diffDays(a, b) {
  return Math.round((startOfDay(b) - startOfDay(a)) / 86400000);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}


function toISO(d) {
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}


function fromISO(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}


function fmtISO(iso) {
  const [y, m, d] = iso.split("-");
  return d + "/" + m + "/" + y;
}

const brl0 = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
const brl2 = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const num0 = new Intl.NumberFormat("pt-BR");


function fmtMoneyKpi(value) {
  if (value >= 1000000) {
    return (
      "R$ " +
      (value / 1000000).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) +
      " mi"
    );
  }
  return brl2.format(value);
}

function fmtPct(value) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}


function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}




function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeighted(rand, items) {
  const total = items.reduce((sum, it) => sum + it.w, 0);
  let r = rand() * total;
  for (const it of items) {
    r -= it.w;
    if (r < 0) return it;
  }
  return items[items.length - 1];
}






function buildMockData(today) {
  const rand = mulberry32(20261105);

  const destinations = [
    { name: "Paris", w: 20, price: 4300 },
    { name: "Tóquio", w: 12, price: 5400 },
    { name: "Rio de Janeiro", w: 18, price: 820 },
    { name: "Maldivas", w: 8, price: 6900 },
    { name: "Salvador", w: 12, price: 760 },
    { name: "Lisboa", w: 9, price: 3900 },
    { name: "Nova York", w: 8, price: 4800 },
    { name: "Florianópolis", w: 7, price: 690 },
    { name: "Recife", w: 6, price: 740 },
  ];
  const companies = [
    { name: "LATAM", w: 40 },
    { name: "GOL", w: 28 },
    { name: "AZUL", w: 22 },
    { name: "TAP", w: 10 },
  ];
  const hours = [];
  for (let h = 0; h < 24; h++) {
    let w = 4;
    if (h < 4) w = 0.5;
    else if (h < 6) w = 2;
    else if (h < 12) w = 5;
    else if (h < 18) w = 4;
    else if (h >= 22) w = 1.5;
    hours.push({ h, w });
  }
  const minutes = [0, 10, 15, 20, 30, 40, 45, 50];
  const subjects = [
    { name: "Cancelamento de voo", w: 32 },
    { name: "Bagagem", w: 24 },
    { name: "Pagamento", w: 20 },
    { name: "Atraso", w: 15 },
    { name: "Outros", w: 9 },
  ];

  const sales = [];
  const complaints = [];
  let saleId = 1;
  let complaintId = 1;


  for (let age = 0; age < 800; age++) {
    const date = toISO(addDays(today, -age));

    const salesToday = 3 + Math.floor(rand() * 5);
    for (let i = 0; i < salesToday; i++) {
      const dest = pickWeighted(rand, destinations);
      const company = pickWeighted(rand, companies);
      const hour = pickWeighted(rand, hours).h;
      const minute = minutes[Math.floor(rand() * minutes.length)];
      const tickets = 1 + Math.floor(rand() * 3);
      const value =
        Math.round(tickets * dest.price * (0.85 + rand() * 0.3) * 100) / 100;
      const r = rand();
      const status = r < 0.82 ? "confirmed" : r < 0.92 ? "pending" : "canceled";

      sales.push({
        id: "V" + saleId++,
        date,
        destination: dest.name,
        company: company.name,
        flight: "VL " + (1000 + Math.floor(rand() * 9000)),
        time: pad2(hour) + ":" + pad2(minute),
        tickets,
        value,
        status,
      });
    }

    const complaintsToday = Math.floor(rand() * 4);
    for (let i = 0; i < complaintsToday; i++) {
      const r = rand();
      let status;
      if (age <= 1) status = r < 0.45 ? "open" : "progress";
      else if (age <= 7) status = r < 0.05 ? "open" : r < 0.3 ? "progress" : "resolved";
      else status = r < 0.02 ? "progress" : "resolved";

      complaints.push({
        id: "R" + complaintId++,
        date,
        subject: pickWeighted(rand, subjects).name,
        status,
      });
    }
  }

  return { sales, complaints };
}














async function getReportData() {

  return buildMockData(startOfDay(new Date()));

}












function filterSales(sales, start, end, f) {
  const a = toISO(start);
  const b = toISO(end);
  return sales.filter(
    (s) =>
      s.date >= a &&
      s.date <= b &&
      (f.destination === "all" || s.destination === f.destination) &&
      (f.company === "all" || s.company === f.company),
  );
}

function filterComplaints(complaints, start, end) {
  const a = toISO(start);
  const b = toISO(end);
  return complaints.filter((c) => c.date >= a && c.date <= b);
}


function summarizeSales(sales) {
  let total = 0;
  let tickets = 0;
  for (const s of sales) {
    if (s.status === "canceled") continue;
    total += s.value;
    tickets += s.tickets;
  }
  return { total, tickets, avg: tickets > 0 ? total / tickets : 0 };
}


function deltaPercent(current, previous) {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}





function computeReport(data, f) {
  const days = diffDays(f.start, f.end) + 1;
  const prevEnd = addDays(f.start, -1);
  const prevStart = addDays(prevEnd, -(days - 1));

  const salesAll = filterSales(data.sales, f.start, f.end, f);
  const salesValid = salesAll.filter((s) => s.status !== "canceled");
  const prevSales = filterSales(data.sales, prevStart, prevEnd, f);

  const cur = summarizeSales(salesAll);
  const prev = summarizeSales(prevSales);

  const complaintsCur = filterComplaints(data.complaints, f.start, f.end);
  const complaintsPrev = filterComplaints(data.complaints, prevStart, prevEnd);


  const destMap = new Map();
  for (const s of salesValid) {
    destMap.set(s.destination, (destMap.get(s.destination) || 0) + s.value);
  }
  const destSorted = [...destMap.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const byDestination = destSorted.slice(0, 5);
  const othersValue = destSorted.slice(5).reduce((sum, d) => sum + d.value, 0);
  if (destSorted.length > 5) {
    byDestination.push({ name: "Outros", value: othersValue, muted: true });
  }


  const compMap = new Map();
  for (const s of salesValid) {
    const row = compMap.get(s.company) || { value: 0, tickets: 0 };
    row.value += s.value;
    row.tickets += s.tickets;
    compMap.set(s.company, row);
  }
  const byCompany = [...compMap.entries()]
    .map(([name, r]) => ({ name, value: r.value, tickets: r.tickets }))
    .sort((a, b) => b.value - a.value);


  const byTime = TIME_BUCKETS.map((b) => ({ ...b, tickets: 0 }));
  for (const s of salesValid) {
    const hour = parseInt(s.time.slice(0, 2), 10);
    const idx = hour < 6 ? 0 : hour < 12 ? 1 : hour < 18 ? 2 : 3;
    byTime[idx].tickets += s.tickets;
  }


  const subjectMap = new Map();
  for (const c of complaintsCur) {
    subjectMap.set(c.subject, (subjectMap.get(c.subject) || 0) + 1);
  }
  const bySubject = [...subjectMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      if (a.name === "Outros") return 1;
      if (b.name === "Outros") return -1;
      return b.count - a.count;
    });
  const complaintStatus = { open: 0, progress: 0, resolved: 0 };
  for (const c of complaintsCur) complaintStatus[c.status]++;


  const tableRows = [...salesAll].sort((a, b) =>
    a.date !== b.date
      ? b.date.localeCompare(a.date)
      : b.time.localeCompare(a.time),
  );

  return {
    days,
    kpis: {
      total: cur.total,
      tickets: cur.tickets,
      avg: cur.avg,
      complaints: complaintsCur.length,
    },
    deltas: {
      total: deltaPercent(cur.total, prev.total),
      tickets: deltaPercent(cur.tickets, prev.tickets),
      avg: deltaPercent(cur.avg, prev.avg),
      complaints: deltaPercent(complaintsCur.length, complaintsPrev.length),
    },
    byDestination,
    byCompany,
    byTime,
    bySubject,
    complaintStatus,
    tableRows,
  };
}



const ICONS = {
  money:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M16 7.5c-.8-1-2.2-1.5-4-1.5-2.2 0-4 1-4 3 0 4.5 8 2 8 6.500 0 2-1.800 3-4 3-1.900 0-3.400-.6-4.200-1.800"/></svg>',
  plane:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 4L3 11l7 2.500L12.500 21 21 4zM10 13.500L21 4"/></svg>',
  card:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v10H4zM4 11h16M8 15h3"/></svg>',
  alert:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3L2 20h20L12 3zM12 10v5M12 17.500v.01"/></svg>',
};

function el(id) {
  return document.getElementById(id);
}






function deltaHtml(delta, goodWhenDown) {
  if (delta === null) {
    return '<span class="rel-delta flat">— sem período anterior</span>';
  }
  const rounded = Math.round(delta * 10) / 10;
  if (rounded === 0) {
    return '<span class="rel-delta flat">→ 0,0%</span><span>vs. período anterior</span>';
  }
  const isDown = rounded < 0;
  const isGood = goodWhenDown ? isDown : !isDown;
  const arrow = isDown ? "↓" : "↑";
  return (
    '<span class="rel-delta' + (isGood ? "" : " bad") + '">' +
    arrow + " " + fmtPct(Math.abs(rounded)) + "%</span>" +
    "<span>vs. período anterior</span>"
  );
}

function renderKpis(report) {
  const k = report.kpis;
  const d = report.deltas;
  const cards = [
    { label: "Total vendido", value: fmtMoneyKpi(k.total), full: brl2.format(k.total), icon: ICONS.money, delta: d.total, down: false },
    { label: "Passagens vendidas", value: num0.format(k.tickets), full: num0.format(k.tickets), icon: ICONS.plane, delta: d.tickets, down: false },
    { label: "Ticket médio", value: fmtMoneyKpi(k.avg), full: brl2.format(k.avg), icon: ICONS.card, delta: d.avg, down: false },
    { label: "Reclamações", value: num0.format(k.complaints), full: num0.format(k.complaints), icon: ICONS.alert, delta: d.complaints, down: true },
  ];

  el("relKpiGrid").innerHTML = cards
    .map(
      (c) => `
      <div class="rel-card rel-kpi">
        <div class="rel-kpi-top">
          <div class="rel-ico">${c.icon}</div>
          <div>
            <p class="rel-kpi-label">${esc(c.label)}</p>
            <p class="rel-kpi-value" title="${esc(c.full)}">${esc(c.value)}</p>
          </div>
        </div>
        <div class="rel-kpi-foot">${deltaHtml(c.delta, c.down)}</div>
      </div>`,
    )
    .join("");
}

const EMPTY_HTML = '<p class="rel-empty">Sem dados no período selecionado.</p>';


function renderValueBars(containerId, rows, fillClass) {
  const container = el(containerId);
  if (!rows.length) {
    container.innerHTML = EMPTY_HTML;
    return;
  }
  const max = Math.max(...rows.map((r) => r.value), 1);
  const total = rows.reduce((sum, r) => sum + r.value, 0) || 1;

  container.innerHTML =
    '<div class="rel-hbar">' +
    rows
      .map((r) => {
        const width = Math.max(2, Math.round((r.value / max) * 100));
        const cls = r.muted ? "rel-fill muted" : "rel-fill " + fillClass;
        return `
        <div class="rel-hrow">
          <span class="rel-hname">${esc(r.name)}</span>
          <div class="rel-track" aria-hidden="true"><div class="${cls}" style="width:${width}%"></div></div>
          <span class="rel-hval">${esc(brl0.format(r.value))}<small>${fmtPct((r.value / total) * 100)}%</small></span>
        </div>`;
      })
      .join("") +
    "</div>";
}

function renderCompany(report) {
  renderValueBars("relCompanyChart", report.byCompany, "navy");

  const note = el("relCompanyNote");
  const withTickets = report.byCompany.filter((c) => c.tickets > 0);
  if (!withTickets.length) {
    note.innerHTML = "";
    return;
  }
  const best = withTickets.reduce((a, b) =>
    b.value / b.tickets > a.value / a.tickets ? b : a,
  );
  note.innerHTML =
    "Companhia com maior ticket médio: <b>" +
    esc(best.name) + " (" + esc(brl2.format(best.value / best.tickets)) + ")</b>";
}

function renderTime(report) {
  const container = el("relTimeChart");
  const note = el("relTimeNote");
  const totalTickets = report.byTime.reduce((sum, b) => sum + b.tickets, 0);

  if (!totalTickets) {
    container.innerHTML = EMPTY_HTML;
    note.innerHTML = "";
    return;
  }

  const max = Math.max(...report.byTime.map((b) => b.tickets), 1);
  const maxPx = 130;

  container.innerHTML =
    '<div class="rel-vbars">' +
    report.byTime
      .map((b) => {
        const px = b.tickets ? Math.max(3, Math.round((b.tickets / max) * maxPx)) : 0;
        return `<div class="rel-vcol"><span class="rel-vnum">${num0.format(b.tickets)}</span><div class="rel-vbar" style="height:${px}px"></div></div>`;
      })
      .join("") +
    "</div>" +
    '<div class="rel-vlabels">' +
    report.byTime
      .map((b) => `<div>${esc(b.label)}<span>${esc(b.range)}</span></div>`)
      .join("") +
    "</div>";

  const peak = report.byTime.reduce((a, b) => (b.tickets > a.tickets ? b : a));
  note.innerHTML =
    "Faixa mais procurada: <b>" +
    esc(peak.label) + " (" + fmtPct((peak.tickets / totalTickets) * 100) +
    "% das passagens)</b>";
}

function renderComplaints(report) {
  const container = el("relComplaintChart");
  const status = el("relComplaintStatus");
  const rows = report.bySubject;

  if (!rows.length) {
    container.innerHTML = EMPTY_HTML;
    status.innerHTML = "";
    return;
  }

  const max = Math.max(...rows.map((r) => r.count), 1);
  container.innerHTML =
    '<div class="rel-hbar">' +
    rows
      .map((r) => {
        const width = Math.max(2, Math.round((r.count / max) * 100));
        const cls = r.name === "Outros" ? "rel-fill muted" : "rel-fill";
        return `
        <div class="rel-hrow wide">
          <span class="rel-hname">${esc(r.name)}</span>
          <div class="rel-track" aria-hidden="true"><div class="${cls}" style="width:${width}%"></div></div>
          <span class="rel-hval">${num0.format(r.count)}</span>
        </div>`;
      })
      .join("") +
    "</div>";

  const s = report.complaintStatus;
  status.innerHTML =
    "Situação: <b>" + num0.format(s.resolved) + " resolvidas</b> · <b>" +
    num0.format(s.progress) + " em atendimento</b> · <b>" +
    num0.format(s.open) + " abertas</b>";
}

const STATUS_TAG = {
  confirmed: { label: "Confirmada", cls: "ok" },
  pending: { label: "Pendente", cls: "pend" },
  canceled: { label: "Cancelada", cls: "canc" },
};

function renderTable(report, page) {
  const rows = report.tableRows;
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), totalPages);
  const slice = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  el("relTableBody").innerHTML = slice.length
    ? slice
        .map((s) => {
          const tag = STATUS_TAG[s.status] || STATUS_TAG.pending;
          return `
        <tr>
          <td>${esc(fmtISO(s.date))}</td>
          <td>${esc(s.destination)}</td>
          <td>${esc(s.company)}</td>
          <td>${esc(s.flight)} · ${esc(s.time)}</td>
          <td class="r">${num0.format(s.tickets)}</td>
          <td class="r">${esc(brl2.format(s.value))}</td>
          <td><span class="rel-tag ${tag.cls}">${tag.label}</span></td>
        </tr>`;
        })
        .join("")
    : '<tr><td colspan="7" class="empty">Nenhuma venda encontrada para os filtros selecionados.</td></tr>';

  const from = rows.length ? (current - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(current * PAGE_SIZE, rows.length);
  el("relTableInfo").textContent =
    "Mostrando " + num0.format(from) + "–" + num0.format(to) +
    " de " + num0.format(rows.length) + " vendas";

  renderPagination(current, totalPages);
  return current;
}


function pageList(current, total) {
  const set = new Set([1, total, current - 1, current, current + 1]);
  const pages = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i] - pages[i - 1] > 1) out.push("…");
    out.push(pages[i]);
  }
  return out;
}

function renderPagination(current, total) {
  let html =
    '<button type="button" data-page="' + (current - 1) + '" aria-label="Página anterior"' +
    (current <= 1 ? " disabled" : "") + ">‹</button>";

  for (const p of pageList(current, total)) {
    if (p === "…") {
      html += '<span class="dots" aria-hidden="true">…</span>';
    } else {
      html +=
        '<button type="button" data-page="' + p + '"' +
        (p === current ? ' class="on" aria-current="page"' : "") +
        ' aria-label="Página ' + p + '">' + p + "</button>";
    }
  }

  html +=
    '<button type="button" data-page="' + (current + 1) + '" aria-label="Próxima página"' +
    (current >= total ? " disabled" : "") + ">›</button>";

  el("relPagination").innerHTML = html;
}




let reportData = { sales: [], complaints: [] };
let report = null;

const state = {
  preset: "30",
  start: null,
  end: null,
  destination: "all",
  company: "all",
  page: 1,
};

function applyPreset(preset) {
  const today = startOfDay(new Date());
  state.preset = preset;
  if (preset !== "custom") {
    state.end = today;
    state.start = addDays(today, -(Number(preset) - 1));
  }
}

function syncControls() {
  document.querySelectorAll(".rel-chip").forEach((chip) => {
    const on = chip.dataset.preset === state.preset;
    chip.classList.toggle("on", on);
    chip.setAttribute("aria-pressed", String(on));
  });
  el("dateStart").value = toISO(state.start);
  el("dateEnd").value = toISO(state.end);
  el("filterDestination").value = state.destination;
  el("filterCompany").value = state.company;
}

function showDateError(message) {
  const box = el("dateError");
  box.textContent = message;
  box.hidden = !message;
}


function update() {
  report = computeReport(reportData, {
    start: state.start,
    end: state.end,
    destination: state.destination,
    company: state.company,
  });

  renderKpis(report);
  renderValueBars("relDestChart", report.byDestination, "");
  renderCompany(report);
  renderTime(report);
  renderComplaints(report);
  state.page = renderTable(report, state.page);
}

function fillSelect(selectId, values) {
  const select = el(selectId);
  const first = select.options[0];
  select.innerHTML = "";
  select.appendChild(first);
  for (const v of values) {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  }
}

function bindEvents() {
  document.querySelectorAll(".rel-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      showDateError("");
      applyPreset(chip.dataset.preset);
      state.page = 1;
      syncControls();
      if (chip.dataset.preset === "custom") {
        el("dateStart").focus();
        return;
      }
      update();
    });
  });

  function onDateChange() {
    const s = el("dateStart").value;
    const e = el("dateEnd").value;
    if (!s || !e) return;

    const start = fromISO(s);
    const end = fromISO(e);

    state.preset = "custom";
    document.querySelectorAll(".rel-chip").forEach((chip) => {
      const on = chip.dataset.preset === "custom";
      chip.classList.toggle("on", on);
      chip.setAttribute("aria-pressed", String(on));
    });

    if (start > end) {
      showDateError("A data inicial não pode ser maior que a data final.");
      return;
    }
    showDateError("");
    state.start = start;
    state.end = end;
    state.page = 1;
    update();
  }
  el("dateStart").addEventListener("change", onDateChange);
  el("dateEnd").addEventListener("change", onDateChange);

  el("filterDestination").addEventListener("change", (e) => {
    state.destination = e.target.value;
    state.page = 1;
    update();
  });
  el("filterCompany").addEventListener("change", (e) => {
    state.company = e.target.value;
    state.page = 1;
    update();
  });

  el("btnClear").addEventListener("click", () => {
    showDateError("");
    state.destination = "all";
    state.company = "all";
    state.page = 1;
    applyPreset("30");
    syncControls();
    update();
  });

  el("relPagination").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-page]");
    if (!btn || btn.disabled) return;
    state.page = renderTable(report, Number(btn.dataset.page));
  });


}

async function initReports() {
  try {
    reportData = await getReportData();

    const today = startOfDay(new Date());
    el("dateStart").max = toISO(today);
    el("dateEnd").max = toISO(today);

    fillSelect(
      "filterDestination",
      [...new Set(reportData.sales.map((s) => s.destination))].sort((a, b) =>
        a.localeCompare(b, "pt-BR"),
      ),
    );
    fillSelect(
      "filterCompany",
      [...new Set(reportData.sales.map((s) => s.company))].sort((a, b) =>
        a.localeCompare(b, "pt-BR"),
      ),
    );

    applyPreset("30");
    syncControls();
    bindEvents();
    update();
  } catch (err) {
    console.error("Erro ao carregar os relatórios:", err);
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initReports);
}