"use strict";
const reportScriptUrl = document.currentScript.src;

/* =====================================================================
   RELATÓRIOS - Voilà

   Organização do arquivo:
     1. CONFIG ............ único lugar para trocar JSON local por backend
     2. Camada de dados ... fetchReport() + normalizeReport()
     3. Métricas .......... definição dos indicadores exibidos na tela
     4. Gráficos SVG ...... barras, linhas/área, rosca e distribuição
     5. Tela .............. renderização e eventos

   CONTRATO DE DADOS (o que o backend precisa devolver)
   GET {API_BASE_URL}{REPORTS_ENDPOINT}
   {
     "user":   { "id": 1, "name": "Maria Silva", "role": "Agente de viagens" },
     "months": [
       {
         "month": "2026-01",                 // AAAA-MM
         "clientsServed": 142,
         "clientsMissed": 18,
         "ratingDistribution": { "1": 1, "2": 3, "3": 8, "4": 26, "5": 58 },
         "bookings": 38,
         "revenue": 84500,                   // em reais
         "avgResponseMinutes": 14,
         "topDestinations": [ { "name": "Paris", "bookings": 11 } ],

         // opcionais - se não vierem, são calculados aqui:
         "avgRating": 4.43,
         "ratingsCount": 96,
         "conversionRate": 0.268             // 0 a 1
       }
     ]
   }
   Se os nomes dos campos do seu backend forem outros, ajuste só a função
   normalizeReport(). O resto do código não conhece o formato bruto.
   ===================================================================== */

/* ---------------------------------------------------------------------
   1. CONFIG
   --------------------------------------------------------------------- */
const CONFIG = {
  // Deixe vazio para usar o JSON local. Quando o backend existir, coloque
  // a URL base aqui, por exemplo "https://api.voila.com.br".
  API_BASE_URL: "",
  REPORTS_ENDPOINT: "/reports/me",

  // Arquivo usado enquanto API_BASE_URL estiver vazio.
  LOCAL_DATA_URL: new URL("../json/relatorios.json", reportScriptUrl).href,

  LOCALE: "pt-BR",
  CURRENCY: "BRL",

  // Cabeçalhos de autenticação enviados ao backend (não vão no JSON local).
  getAuthHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

/* ---------------------------------------------------------------------
   Utilidades
   --------------------------------------------------------------------- */
const $ = (selector, root = document) => root.querySelector(selector);

const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

const sum = (list) => list.reduce((total, n) => total + n, 0);
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const nf0 = new Intl.NumberFormat(CONFIG.LOCALE, { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat(CONFIG.LOCALE, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const nf2 = new Intl.NumberFormat(CONFIG.LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const money = new Intl.NumberFormat(CONFIG.LOCALE, {
  style: "currency",
  currency: CONFIG.CURRENCY,
});
const pct = (ratio) => `${nf1.format(ratio * 100)}%`;

const monthDate = (id) => {
  const [year, month] = id.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
};
const monthFormat = (id, options) =>
  new Intl.DateTimeFormat(CONFIG.LOCALE, {
    ...options,
    timeZone: "UTC",
  }).format(monthDate(id));

const monthName = (id) => monthFormat(id, { month: "long" }); // "janeiro"
const monthLong = (id) =>
  capitalize(monthFormat(id, { month: "long", year: "numeric" })); // "Janeiro de 2026"
const monthShort = (id) => monthFormat(id, { month: "short" }).replace(".", ""); // "jan"

/* Escala "bonita" para eixos: devolve { max, step, count } */
function niceScale(maxValue, targetTicks = 4) {
  if (!maxValue || maxValue <= 0) return { max: 1, step: 0.25, count: 4 };
  const rough = maxValue / targetTicks;
  const power = 10 ** Math.floor(Math.log10(rough));
  const fraction = rough / power;
  const nice =
    fraction <= 1
      ? 1
      : fraction <= 2
        ? 2
        : fraction <= 2.5
          ? 2.5
          : fraction <= 5
            ? 5
            : 10;
  const step = nice * power;
  const count = Math.ceil(maxValue / step);
  return { max: step * count, step, count };
}

/* ---------------------------------------------------------------------
   2. CAMADA DE DADOS
   --------------------------------------------------------------------- */
async function fetchReport() {
  const usingBackend = Boolean(CONFIG.API_BASE_URL);
  const url = usingBackend
    ? `${CONFIG.API_BASE_URL}${CONFIG.REPORTS_ENDPOINT}`
    : CONFIG.LOCAL_DATA_URL;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(usingBackend ? CONFIG.getAuthHeaders() : {}),
    },
  });
  if (!response.ok)
    throw new Error(
      `Resposta inesperada do servidor (HTTP ${response.status}).`,
    );

  return normalizeReport(await response.json());
}

/* Único ponto que conhece o formato bruto da resposta. */
function normalizeReport(raw) {
  const user = {
    id: raw.user?.id ?? null,
    name: raw.user?.name ?? "Colaborador",
    role: raw.user?.role ?? "",
  };

  const months = (raw.months ?? [])
    .map((m) => {
      const distribution = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        ...(m.ratingDistribution ?? {}),
      };
      const ratingsCount =
        m.ratingsCount ??
        sum([1, 2, 3, 4, 5].map((s) => Number(distribution[s])));
      const avgRating =
        m.avgRating ??
        (ratingsCount
          ? sum([1, 2, 3, 4, 5].map((s) => s * Number(distribution[s]))) /
            ratingsCount
          : 0);

      const clientsServed = Number(m.clientsServed ?? 0);
      const clientsMissed = Number(m.clientsMissed ?? 0);
      const requests = clientsServed + clientsMissed;
      const bookings = Number(m.bookings ?? 0);

      return {
        id: m.month,
        clientsServed,
        clientsMissed,
        attendanceRate: requests ? clientsServed / requests : 0,
        avgRating: Number(avgRating),
        ratingsCount: Number(ratingsCount),
        ratingDistribution: distribution,
        bookings,
        conversionRate:
          m.conversionRate ?? (clientsServed ? bookings / clientsServed : 0),
        revenue: Number(m.revenue ?? 0),
        avgResponseMinutes: Number(m.avgResponseMinutes ?? 0),
        topDestinations: (m.topDestinations ?? []).map((d) => ({
          name: d.name,
          bookings: Number(d.bookings ?? 0),
        })),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  return { user, months };
}

/* ---------------------------------------------------------------------
   3. MÉTRICAS
   --------------------------------------------------------------------- */
const METRICS = {
  clientsServed: {
    label: "Clientes atendidos",
    better: "up",
    get: (m) => m.clientsServed,
    format: (m) => nf0.format(m.clientsServed),
  },
  clientsMissed: {
    label: "Clientes não atendidos",
    better: "down",
    get: (m) => m.clientsMissed,
    format: (m) => nf0.format(m.clientsMissed),
  },
  avgRating: {
    label: "Avaliação média",
    better: "up",
    get: (m) => m.avgRating,
    format: (m) => `${nf2.format(m.avgRating)} / 5`,
  },
  revenue: {
    label: "Receita gerada",
    better: "up",
    get: (m) => m.revenue,
    format: (m) => money.format(m.revenue),
  },
  attendanceRate: {
    label: "Taxa de atendimento",
    better: "up",
    get: (m) => m.attendanceRate,
    format: (m) => pct(m.attendanceRate),
  },
  bookings: {
    label: "Reservas fechadas",
    better: "up",
    get: (m) => m.bookings,
    format: (m) => nf0.format(m.bookings),
  },
  conversionRate: {
    label: "Taxa de conversão",
    better: "up",
    get: (m) => m.conversionRate,
    format: (m) => pct(m.conversionRate),
  },
  avgResponseMinutes: {
    label: "Tempo médio de resposta",
    better: "down",
    get: (m) => m.avgResponseMinutes,
    format: (m) => `${nf0.format(m.avgResponseMinutes)} min`,
  },
};

const KPI_KEYS = ["clientsServed", "clientsMissed", "avgRating", "revenue"];
const SUMMARY_KEYS = [
  "bookings",
  "conversionRate",
  "avgResponseMinutes",
  "ratingsCount",
];

/* "ratingsCount" não é comparado com o mês anterior, só exibido. */
METRICS.ratingsCount = {
  label: "Avaliações recebidas",
  better: null,
  get: (m) => m.ratingsCount,
  format: (m) => nf0.format(m.ratingsCount),
};

/* Variação em relação ao mês anterior (null quando não dá para comparar). */
function metricDelta(metric, current, previous) {
  if (!previous || !metric.better) return null;
  const now = metric.get(current);
  const before = metric.get(previous);
  if (!before) return null;

  const change = (now - before) / before;
  const good = metric.better === "up" ? change >= 0 : change <= 0;
  return {
    change,
    good,
    up: change >= 0,
    text: `${nf1.format(Math.abs(change) * 100)}%`,
  };
}

/* ---------------------------------------------------------------------
   4. GRÁFICOS SVG
   Cada função devolve uma string <svg>. A largura vem do container, então
   o texto mantém o tamanho real em qualquer tela.
   --------------------------------------------------------------------- */
const svgWrap = (width, height, inner, label) =>
  `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${esc(label)}">${inner}</svg>`;

function gridLines({ left, right, ticks, y, format }) {
  return ticks
    .map(
      (value) =>
        `<line class="chart-gridline" x1="${left}" x2="${right}" y1="${y(value)}" y2="${y(value)}"/>` +
        `<text class="chart-axis-label" x="${left - 8}" y="${y(value) + 4}" text-anchor="end">${format(value)}</text>`,
    )
    .join("");
}

/* Barras agrupadas: atendidos x não atendidos por mês */
function barChart(months, selectedId, width, height) {
  const L = 44,
    R = 8,
    T = 16,
    B = 34;
  const plotW = width - L - R;
  const plotH = height - T - B;
  const scale = niceScale(
    Math.max(...months.map((m) => Math.max(m.clientsServed, m.clientsMissed))),
  );
  const y = (v) => T + plotH - (v / scale.max) * plotH;
  const ticks = Array.from(
    { length: scale.count + 1 },
    (_, i) => i * scale.step,
  );

  const colW = plotW / months.length;
  const barW = Math.max(6, Math.min(24, colW * 0.28));
  const gap = 4;

  let out = gridLines({
    left: L,
    right: width - R,
    ticks,
    y,
    format: (v) => nf0.format(v),
  });

  months.forEach((m, i) => {
    const selected = m.id === selectedId;
    const x0 = L + colW * i;
    const cx = x0 + colW / 2;
    const servedX = cx - barW - gap / 2;
    const missedX = cx + gap / 2;
    const label = `${monthLong(m.id)}: ${m.clientsServed} atendidos, ${m.clientsMissed} não atendidos`;

    out +=
      `<g class="col-group${selected ? " is-selected" : ""}" data-month="${m.id}" tabindex="0" role="button" aria-pressed="${selected}" aria-label="${esc(label)}">` +
      `<title>${esc(label)}</title>` +
      `<rect class="col-hit" x="${x0 + 2}" y="${T}" width="${colW - 4}" height="${plotH}" rx="8"/>` +
      `<rect class="bar bar-served" x="${servedX}" y="${y(m.clientsServed)}" width="${barW}" height="${T + plotH - y(m.clientsServed)}" rx="4"/>` +
      `<rect class="bar bar-missed" x="${missedX}" y="${y(m.clientsMissed)}" width="${barW}" height="${T + plotH - y(m.clientsMissed)}" rx="4"/>` +
      `<text class="chart-axis-label x-label" x="${cx}" y="${height - 12}" text-anchor="middle">${esc(monthShort(m.id))}</text>` +
      (selected
        ? `<text class="chart-value" x="${servedX + barW / 2}" y="${y(m.clientsServed) - 6}" text-anchor="middle">${m.clientsServed}</text>` +
          `<text class="chart-value" x="${missedX + barW / 2}" y="${y(m.clientsMissed) - 6}" text-anchor="middle">${m.clientsMissed}</text>`
        : "") +
      `</g>`;
  });

  return svgWrap(
    width,
    height,
    out,
    "Clientes atendidos e não atendidos por mês",
  );
}

/* Linha (com área opcional) para avaliação e receita */
function lineChart({
  months,
  selectedId,
  width,
  height,
  value,
  ticks,
  formatTick,
  formatValue,
  gradientId,
  label,
}) {
  const L = 56,
    R = 12,
    T = 22,
    B = 34;
  const plotW = width - L - R;
  const plotH = height - T - B;
  const lo = ticks[0];
  const hi = ticks[ticks.length - 1];
  const y = (v) => T + plotH - ((v - lo) / (hi - lo)) * plotH;
  const colW = plotW / months.length;
  const x = (i) => L + colW * i + colW / 2;

  const points = months.map((m, i) => [x(i), y(value(m))]);
  const path = points
    .map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`)
    .join(" ");
  const baseline = T + plotH;

  let out = "";
  if (gradientId) {
    out +=
      `<defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0%" stop-color="#f5793a" stop-opacity="0.35"/>` +
      `<stop offset="100%" stop-color="#f5793a" stop-opacity="0"/></linearGradient></defs>`;
  }
  out += gridLines({ left: L, right: width - R, ticks, y, format: formatTick });

  if (gradientId) {
    out += `<path d="${path} L${points[points.length - 1][0].toFixed(1)} ${baseline} L${points[0][0].toFixed(1)} ${baseline} Z" fill="url(#${gradientId})"/>`;
  }
  out += `<path class="line-stroke" d="${path}"/>`;

  months.forEach((m, i) => {
    const selected = m.id === selectedId;
    const [px, py] = points[i];
    const text = `${monthLong(m.id)}: ${formatValue(value(m))}`;
    out +=
      `<g class="col-group${selected ? " is-selected" : ""}" data-month="${m.id}" tabindex="0" role="button" aria-pressed="${selected}" aria-label="${esc(text)}">` +
      `<title>${esc(text)}</title>` +
      `<rect class="col-hit" x="${x(i) - colW / 2 + 2}" y="${T - 6}" width="${colW - 4}" height="${plotH + 6}" rx="8"/>` +
      `<circle class="point" cx="${px}" cy="${py}" r="${selected ? 6 : 4}"/>` +
      `<text class="chart-axis-label x-label" x="${px}" y="${height - 12}" text-anchor="middle">${esc(monthShort(m.id))}</text>` +
      (selected
        ? `<text class="chart-value" x="${px}" y="${py - 14}" text-anchor="middle">${esc(formatValue(value(m)))}</text>`
        : "") +
      `</g>`;
  });

  return svgWrap(width, height, out, label);
}

function ratingChart(months, selectedId, width, height) {
  const lowest = Math.min(...months.map((m) => m.avgRating));
  const lo = Math.max(0, Math.floor((lowest - 0.1) * 4) / 4);
  const ticks = [];
  for (let v = lo; v <= 5 + 1e-9; v += 0.25) ticks.push(v);

  return lineChart({
    months,
    selectedId,
    width,
    height,
    ticks,
    value: (m) => m.avgRating,
    formatTick: (v) => nf2.format(v),
    formatValue: (v) => nf2.format(v),
    gradientId: "grad-rating",
    label: "Evolução da avaliação média por mês",
  });
}

function revenueChart(months, selectedId, width, height) {
  const scale = niceScale(Math.max(...months.map((m) => m.revenue)));
  const ticks = Array.from(
    { length: scale.count + 1 },
    (_, i) => i * scale.step,
  );

  return lineChart({
    months,
    selectedId,
    width,
    height,
    ticks,
    value: (m) => m.revenue,
    formatTick: (v) => nf0.format(v),
    formatValue: (v) => money.format(v).replace(/,00$/, ""),
    gradientId: "grad-revenue",
    label: "Receita gerada por mês",
  });
}

/* Rosca com a taxa de atendimento */
function donutChart(rate) {
  const size = 168,
    r = 64,
    c = 2 * Math.PI * r,
    mid = size / 2;
  const arc = c * Math.min(Math.max(rate, 0), 1);
  return (
    `<svg class="donut" viewBox="0 0 ${size} ${size}" role="img" aria-label="Taxa de atendimento: ${pct(rate)}">` +
    `<circle class="donut-track" cx="${mid}" cy="${mid}" r="${r}"/>` +
    `<circle class="donut-arc" cx="${mid}" cy="${mid}" r="${r}" stroke-dasharray="${arc} ${c - arc}" transform="rotate(-90 ${mid} ${mid})"/>` +
    `<text class="donut-value" x="${mid}" y="${mid + 4}" text-anchor="middle">${pct(rate)}</text>` +
    `<text class="donut-label" x="${mid}" y="${mid + 24}" text-anchor="middle">atendimento</text>` +
    `</svg>`
  );
}

/* Distribuição das notas (5 a 1 estrelas) */
function starsChart(month, width) {
  const rowH = 44;
  const height = rowH * 5;
  const L = 52,
    R = 52;
  const trackW = Math.max(40, width - L - R);
  const total = month.ratingsCount || 1;

  let out = "";
  for (let i = 0; i < 5; i++) {
    const stars = 5 - i;
    const count = Number(month.ratingDistribution[stars]) || 0;
    const share = count / total;
    const yRow = i * rowH;
    const text = `${stars} ${stars === 1 ? "estrela" : "estrelas"}: ${count} avaliações (${pct(share)})`;

    out +=
      `<g><title>${esc(text)}</title>` +
      `<text class="star-label" x="0" y="${yRow + 27}">${stars} <tspan class="star">★</tspan></text>` +
      `<rect class="star-track" x="${L}" y="${yRow + 15}" width="${trackW}" height="12" rx="6"/>` +
      `<rect class="star-fill" x="${L}" y="${yRow + 15}" width="${Math.max(count ? 8 : 0, trackW * share)}" height="12" rx="6"/>` +
      `<text class="star-pct" x="${width}" y="${yRow + 27}" text-anchor="end">${pct(share)}</text></g>`;
  }
  return svgWrap(
    width,
    height,
    out,
    `Distribuição das avaliações de ${monthLong(month.id)}`,
  );
}

/* ---------------------------------------------------------------------
   5. TELA
   --------------------------------------------------------------------- */
const state = { report: null, selectedId: null };

const ICONS = {
  clientsServed:
    '<path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  clientsMissed:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="8" x2="22" y2="13"/><line x1="22" y1="8" x2="17" y2="13"/>',
  avgRating:
    '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  revenue:
    '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
};

const icon = (key) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[key]}</svg>`;

function currentAndPrevious() {
  const { months } = state.report;
  const index = months.findIndex((m) => m.id === state.selectedId);
  return {
    current: months[index],
    previous: index > 0 ? months[index - 1] : null,
  };
}

function deltaHtml(metric, current, previous) {
  const delta = metricDelta(metric, current, previous);
  if (!delta) return "";
  return `<span class="kpi-delta${delta.good ? "" : " negative"}">${delta.up ? "↑" : "↓"} ${delta.text}</span>`;
}

function renderKpis(current, previous) {
  $("#kpi-grid").innerHTML = KPI_KEYS.map((key) => {
    const metric = METRICS[key];
    const delta = deltaHtml(metric, current, previous);
    const footer = previous
      ? `${delta} em relação a ${esc(monthName(previous.id))}`
      : "Sem mês anterior para comparar";

    return (
      `<article class="kpi-card">` +
      `<div class="kpi-card-top">` +
      `<div class="kpi-icon">${icon(key)}</div>` +
      `<div><p class="kpi-label">${esc(metric.label)}</p><p class="kpi-value">${esc(metric.format(current))}</p></div>` +
      `</div>` +
      `<div class="kpi-card-footer">${footer}</div>` +
      `</article>`
    );
  }).join("");
}

function renderSummary(current, previous) {
  $("#summary-title").textContent = `Resumo de ${monthName(current.id)}`;
  $("#chart-donut").innerHTML = donutChart(current.attendanceRate);

  $("#stat-list").innerHTML = SUMMARY_KEYS.map((key) => {
    const metric = METRICS[key];
    return (
      `<div class="stat"><dt>${esc(metric.label)}</dt>` +
      `<dd>${esc(metric.format(current))}${deltaHtml(metric, current, previous)}</dd></div>`
    );
  }).join("");
}

function renderDestinations(current) {
  $("#dest-title").textContent =
    `Destinos mais vendidos em ${monthName(current.id)}`;
  const list = current.topDestinations;

  if (!list.length) {
    $("#dest-list").innerHTML =
      '<li class="info-sub">Nenhuma reserva registrada neste mês.</li>';
    return;
  }

  const total = current.bookings || sum(list.map((d) => d.bookings)) || 1;
  $("#dest-list").innerHTML = list
    .map(
      (d, i) =>
        `<li class="info-list-item">` +
        `<div class="info-avatar">${i + 1}</div>` +
        `<div class="info-main"><p class="info-title">${esc(d.name)}</p>` +
        `<p class="info-sub">${nf0.format(d.bookings)} ${d.bookings === 1 ? "reserva" : "reservas"}</p></div>` +
        `<div class="info-side"><p class="info-value">${pct(d.bookings / total)}</p></div>` +
        `</li>`,
    )
    .join("");
}

/* Desenha um gráfico dentro do container, usando a largura real dele. */
function drawInto(selector, height, build) {
  const el = $(selector);
  const width = Math.floor(el.clientWidth);
  if (width < 120) return;
  el.style.minHeight = `${height}px`;
  el.innerHTML = build(width, height);
}

function renderCharts() {
  const { months } = state.report;
  const { current } = currentAndPrevious();
  const id = current.id;

  drawInto("#chart-attendance", 300, (w, h) => barChart(months, id, w, h));
  drawInto("#chart-rating", 280, (w, h) => ratingChart(months, id, w, h));
  drawInto("#chart-revenue", 280, (w, h) => revenueChart(months, id, w, h));
  drawInto("#chart-stars", 220, (w) => starsChart(current, w));
  $("#stars-title").textContent = `Avaliações de ${monthName(current.id)}`;
}

function render() {
  const { current, previous } = currentAndPrevious();
  $("#month-select").value = current.id;

  renderKpis(current, previous);
  renderSummary(current, previous);
  renderDestinations(current);
  renderCharts();

  const url = new URL(window.location.href);
  url.searchParams.set("mes", current.id);
  window.history.replaceState(null, "", url);
}

function selectMonth(id) {
  if (!state.report.months.some((m) => m.id === id) || id === state.selectedId)
    return;
  state.selectedId = id;
  render();
}

function fillMonthSelect() {
  const select = $("#month-select");
  select.innerHTML = [...state.report.months]
    .reverse()
    .map((m) => `<option value="${m.id}">${esc(monthLong(m.id))}</option>`)
    .join("");
  select.disabled = false;
}

function setStatus(type, message = "") {
  const box = $("#report-status");
  if (type === "ready") {
    box.innerHTML = "";
    return;
  }
  if (type === "loading") {
    box.innerHTML =
      '<div class="spinner" aria-hidden="true"></div><span>Carregando seus relatórios...</span>';
    return;
  }
  const titles = {
    error: "Não foi possível carregar os relatórios",
    empty: "Ainda não há relatórios",
  };
  box.innerHTML =
    `<strong>${titles[type]}</strong><p>${esc(message)}</p>` +
    (type === "error"
      ? '<button type="button" id="btn-retry">Tentar novamente</button>'
      : "");
}

async function init() {
  setStatus("loading");
  $("#report-content").hidden = true;

  try {
    state.report = await fetchReport();
  } catch (error) {
    console.error(error);
    setStatus(
      "error",
      "Verifique sua conexão e tente de novo. Se o problema continuar, avise o suporte.",
    );
    return;
  }

  const { user, months } = state.report;
  if (!months.length) {
    setStatus(
      "empty",
      "Quando você tiver atendimentos registrados, seus relatórios mensais aparecem aqui.",
    );
    return;
  }

  const firstName = user.name.split(" ")[0];
  $("#greeting").textContent = `Olá, ${firstName}! Aqui estão seus relatórios.`;

  const fromUrl = new URLSearchParams(window.location.search).get("mes");
  state.selectedId = months.some((m) => m.id === fromUrl)
    ? fromUrl
    : months[months.length - 1].id;

  setStatus("ready");
  $("#report-content").hidden = false;
  fillMonthSelect();
  render();
}

function bindEvents() {
  $("#month-select").addEventListener("change", (e) =>
    selectMonth(e.target.value),
  );

  const content = $("#report-content");
  content.addEventListener("click", (e) => {
    const group = e.target.closest("[data-month]");
    if (group) selectMonth(group.dataset.month);
  });
  content.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const group = e.target.closest("[data-month]");
    if (!group) return;
    e.preventDefault();
    const chartId = group.closest(".rp-chart")?.id;
    selectMonth(group.dataset.month);
    if (chartId)
      $(`#${chartId} [data-month="${group.dataset.month}"]`)?.focus();
  });

  $("#report-status").addEventListener("click", (e) => {
    if (e.target.id === "btn-retry") init();
  });

  // redesenha os gráficos quando a largura muda (zoom, rotação, janela)
  let lastWidth = 0;
  let frame;
  new ResizeObserver(() => {
    const width = Math.floor(content.clientWidth);
    if (!state.report || content.hidden || width === lastWidth) return;
    lastWidth = width;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(renderCharts);
  }).observe(content);
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  init();
});
