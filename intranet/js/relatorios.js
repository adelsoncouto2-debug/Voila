"use strict";

/* =====================================================================
   RELATÓRIOS - Voilà

   Organização do arquivo:
     1. CONFIG ............ único lugar para trocar JSON local por backend
     2. Camada de dados ... fetchReport() + normalizeReport()
     3. Métricas .......... definição dos indicadores (usada na tela e no PDF)
     4. Gráficos SVG ...... barras, linhas/área, rosca e distribuição
     5. Tela .............. renderização e eventos
     6. PDF ............... geração com jsPDF a partir dos mesmos dados

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
  LOCAL_DATA_URL: "../json/relatorios.json",

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
const compact = new Intl.NumberFormat(CONFIG.LOCALE, {
  notation: "compact",
  maximumFractionDigits: 1,
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

const slugify = (text) =>
  String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

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
   3. MÉTRICAS (compartilhadas entre a tela e o PDF)
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

let toastTimer;
function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 4500);
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
  $("#btn-download").disabled = false;
  render();
}

function bindEvents() {
  $("#month-select").addEventListener("change", (e) =>
    selectMonth(e.target.value),
  );
  $("#btn-download").addEventListener("click", downloadPdf);

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

/* ---------------------------------------------------------------------
   6. PDF
   --------------------------------------------------------------------- */
const PDF_COLORS = {
  orange: [245, 121, 58],
  orangeLight: [251, 217, 184],
  navy: [13, 42, 77],
  gray: [107, 114, 128],
  border: [229, 231, 235],
  green: [46, 158, 91],
  red: [217, 83, 79],
  white: [255, 255, 255],
};

/* jsPDF usa fontes padrão (Latin-1): troca espaços especiais do Intl. */
const clean = (text) => String(text).replace(/[\u00a0\u202f]/g, " ");

async function downloadPdf() {
  const button = $("#btn-download");
  const label = $("#btn-download-label");

  if (!window.jspdf?.jsPDF) {
    toast(
      "O gerador de PDF não carregou. Verifique sua conexão e tente de novo.",
    );
    return;
  }

  button.disabled = true;
  button.classList.add("is-loading");
  label.textContent = "Gerando PDF...";

  try {
    await new Promise((resolve) => setTimeout(resolve, 60)); // deixa o botão atualizar
    const { current, previous } = currentAndPrevious();
    const doc = buildPdf(state.report, current, previous);
    doc.save(`relatorio-${slugify(state.report.user.name)}-${current.id}.pdf`);
    toast("Relatório baixado.");
  } catch (error) {
    console.error(error);
    toast("Não foi possível gerar o PDF. Tente novamente.");
  } finally {
    button.disabled = false;
    button.classList.remove("is-loading");
    label.textContent = "Baixar meu relatório";
  }
}

function buildPdf(report, current, previous) {
  const { jsPDF } = window.jspdf;
  const C = PDF_COLORS;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const PW = 210,
    PH = 297,
    M = 15,
    CW = PW - 2 * M;
  const months = report.months;
  let y = 0;

  /* --- helpers de desenho --- */
  const fill = (c) => doc.setFillColor(...c);
  const stroke = (c) => doc.setDrawColor(...c);
  const text = (
    value,
    x,
    yy,
    { size = 9, bold = false, color = C.navy, align = "left" } = {},
  ) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(clean(value), x, yy, { align });
  };
  const ensureSpace = (height) => {
    if (y + height > PH - 20) {
      doc.addPage();
      y = M + 4;
    }
  };
  const sectionTitle = (title, x = M, yy = y) => {
    fill(C.orange);
    doc.rect(x, yy - 3.6, 1.2, 4.6, "F");
    text(title, x + 3.2, yy, { size: 11, bold: true });
  };

  /* --- faixa superior --- */
  fill(C.orange);
  doc.rect(0, 0, PW, 36, "F");
  text("VOILÀ", M, 17, { size: 22, bold: true, color: C.white });
  text("O mundo é seu", M, 24, { size: 9, color: C.white });
  text("Relatório de desempenho", PW - M, 16, {
    size: 13,
    bold: true,
    color: C.white,
    align: "right",
  });
  text(monthLong(current.id), PW - M, 24, {
    size: 10,
    color: C.white,
    align: "right",
  });

  /* --- identificação --- */
  const generated = new Intl.DateTimeFormat(CONFIG.LOCALE, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());
  text(report.user.name, M, 47, { size: 14, bold: true });
  text(
    `${report.user.role ? `${report.user.role}  |  ` : ""}Gerado em ${generated}`,
    M,
    53,
    { size: 9, color: C.gray },
  );

  /* --- cartões de indicadores --- */
  const pdfDelta = (key) => {
    const metric = METRICS[key];
    const delta = metricDelta(metric, current, previous);
    if (!delta) return { line: "", color: C.gray };
    return {
      line: `${delta.up ? "+" : "-"}${delta.text} vs. ${monthName(previous.id)}`,
      color: delta.good ? C.green : C.red,
    };
  };

  const kpiRow = (keys, yy) => {
    const gap = 4;
    const w = (CW - gap * (keys.length - 1)) / keys.length;
    keys.forEach((key, i) => {
      const x = M + i * (w + gap);
      const metric = METRICS[key];
      const d = pdfDelta(key);
      fill(C.white);
      stroke(C.border);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, yy, w, 24, 2.5, 2.5, "FD");
      text(metric.label, x + 3, yy + 6.5, { size: 7.5, color: C.gray });
      text(metric.format(current), x + 3, yy + 14.5, {
        size: key === "revenue" ? 11.5 : 14,
        bold: true,
      });
      text(d.line, x + 3, yy + 20.5, { size: 7, bold: true, color: d.color });
    });
  };

  y = 62;
  kpiRow(["clientsServed", "clientsMissed", "avgRating", "revenue"], y);
  kpiRow(
    ["attendanceRate", "bookings", "conversionRate", "avgResponseMinutes"],
    y + 28,
  );
  y += 66;

  /* --- gráfico de barras --- */
  sectionTitle("Atendimentos por mês", M, y);
  // legenda
  fill(C.orange);
  doc.rect(PW - M - 58, y - 3, 3, 3, "F");
  text("Atendidos", PW - M - 54, y - 0.4, { size: 8, color: C.gray });
  fill(C.navy);
  doc.rect(PW - M - 30, y - 3, 3, 3, "F");
  text("Não atendidos", PW - M - 26, y - 0.4, { size: 8, color: C.gray });
  y += 6;
  pdfBarChart(
    doc,
    C,
    { x: M, y, w: CW, h: 50 },
    months,
    current.id,
    text,
    fill,
    stroke,
  );
  y += 50 + 12;

  /* --- avaliação e receita lado a lado --- */
  const half = (CW - 8) / 2;
  sectionTitle("Avaliação média por mês", M, y);
  sectionTitle("Receita gerada por mês", M + half + 8, y);
  y += 6;

  const lowest = Math.min(...months.map((m) => m.avgRating));
  const ratingLo = Math.max(0, Math.floor((lowest - 0.1) * 4) / 4);
  const ratingTicks = [];
  for (let v = ratingLo; v <= 5 + 1e-9; v += 0.25) ratingTicks.push(v);
  const revScale = niceScale(Math.max(...months.map((m) => m.revenue)));
  const revTicks = Array.from(
    { length: revScale.count + 1 },
    (_, i) => i * revScale.step,
  );

  pdfLineChart(
    doc,
    C,
    { x: M, y, w: half, h: 40 },
    months,
    current.id,
    {
      value: (m) => m.avgRating,
      ticks: ratingTicks,
      tickFormat: (v) => nf2.format(v),
      valueFormat: (v) => nf2.format(v),
    },
    text,
    fill,
    stroke,
  );
  pdfLineChart(
    doc,
    C,
    { x: M + half + 8, y, w: half, h: 40 },
    months,
    current.id,
    {
      value: (m) => m.revenue,
      ticks: revTicks,
      tickFormat: (v) => compact.format(v),
      valueFormat: (v) => money.format(v).replace(/,00$/, ""),
    },
    text,
    fill,
    stroke,
  );
  y += 40 + 14;

  /* --- tabela comparativa --- */
  ensureSpace(14 + (months.length + 1) * 7);
  sectionTitle("Comparativo mensal", M, y);
  y += 5;

  const cols = [
    { title: "Mês", w: 44, align: "left", get: (m) => monthLong(m.id) },
    {
      title: "Atendidos",
      w: 24,
      align: "right",
      get: (m) => nf0.format(m.clientsServed),
    },
    {
      title: "Não atend.",
      w: 26,
      align: "right",
      get: (m) => nf0.format(m.clientsMissed),
    },
    {
      title: "Avaliação",
      w: 26,
      align: "right",
      get: (m) => nf2.format(m.avgRating),
    },
    {
      title: "Reservas",
      w: 24,
      align: "right",
      get: (m) => nf0.format(m.bookings),
    },
    {
      title: "Receita",
      w: 36,
      align: "right",
      get: (m) => money.format(m.revenue),
    },
  ];
  const drawRow = (cells, yy, options) => {
    let x = M;
    cols.forEach((col, i) => {
      const tx = col.align === "right" ? x + col.w - 3 : x + 3;
      text(cells[i], tx, yy + 4.8, { size: 8.5, align: col.align, ...options });
      x += col.w;
    });
  };

  fill(C.navy);
  doc.rect(M, y, CW, 7, "F");
  drawRow(
    cols.map((c) => c.title),
    y,
    { bold: true, color: C.white },
  );
  y += 7;

  months.forEach((m) => {
    const selected = m.id === current.id;
    if (selected) {
      fill(C.orangeLight);
      doc.rect(M, y, CW, 7, "F");
    }
    stroke(C.border);
    doc.setLineWidth(0.2);
    doc.line(M, y + 7, M + CW, y + 7);
    drawRow(
      cols.map((c) => c.get(m)),
      y,
      { bold: selected },
    );
    y += 7;
  });
  y += 12;

  /* --- avaliações e destinos --- */
  ensureSpace(58);
  sectionTitle(`Avaliações de ${monthName(current.id)}`, M, y);
  sectionTitle(`Destinos mais vendidos`, M + half + 8, y);
  y += 8;

  const total = current.ratingsCount || 1;
  for (let i = 0; i < 5; i++) {
    const stars = 5 - i;
    const count = Number(current.ratingDistribution[stars]) || 0;
    const share = count / total;
    const rowY = y + i * 8;
    const trackX = M + 22;
    const trackW = half - 22 - 20;
    text(`${stars} ${stars === 1 ? "estrela" : "estrelas"}`, M, rowY + 3, {
      size: 8.5,
    });
    fill(C.border);
    doc.roundedRect(trackX, rowY, trackW, 3.4, 1.7, 1.7, "F");
    if (count) {
      fill(C.orange);
      doc.roundedRect(
        trackX,
        rowY,
        Math.max(2.5, trackW * share),
        3.4,
        1.7,
        1.7,
        "F",
      );
    }
    text(pct(share), M + half, rowY + 3, {
      size: 8.5,
      color: C.gray,
      align: "right",
    });
  }

  const destTotal =
    current.bookings ||
    sum(current.topDestinations.map((d) => d.bookings)) ||
    1;
  if (!current.topDestinations.length) {
    text("Nenhuma reserva registrada neste mês.", M + half + 8, y + 3, {
      size: 8.5,
      color: C.gray,
    });
  }
  current.topDestinations.slice(0, 5).forEach((d, i) => {
    const rowY = y + i * 8;
    const x = M + half + 8;
    text(`${i + 1}. ${d.name}`, x, rowY + 3, { size: 8.5, bold: i === 0 });
    text(
      `${nf0.format(d.bookings)} ${d.bookings === 1 ? "reserva" : "reservas"}  |  ${pct(d.bookings / destTotal)}`,
      x + half,
      rowY + 3,
      {
        size: 8.5,
        color: C.gray,
        align: "right",
      },
    );
  });

  /* --- rodapé em todas as páginas --- */
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    stroke(C.border);
    doc.setLineWidth(0.2);
    doc.line(M, PH - 14, PW - M, PH - 14);
    text(
      `Voilà - Relatório de ${report.user.name} - ${monthLong(current.id)}`,
      M,
      PH - 9,
      { size: 8, color: C.gray },
    );
    text(`Página ${p} de ${pages}`, PW - M, PH - 9, {
      size: 8,
      color: C.gray,
      align: "right",
    });
  }

  return doc;
}

function pdfBarChart(doc, C, box, months, selectedId, text, fill, stroke) {
  const padL = 9,
    padB = 7;
  const plotX = box.x + padL;
  const plotW = box.w - padL;
  const plotH = box.h - padB;
  const scale = niceScale(
    Math.max(...months.map((m) => Math.max(m.clientsServed, m.clientsMissed))),
  );
  const yOf = (v) => box.y + plotH - (v / scale.max) * plotH;
  const colW = plotW / months.length;
  const barW = Math.min(7, colW * 0.28);

  months.forEach((m, i) => {
    if (m.id !== selectedId) return;
    fill(C.orangeLight);
    doc.roundedRect(
      plotX + colW * i + 0.5,
      box.y,
      colW - 1,
      plotH,
      1.5,
      1.5,
      "F",
    );
  });

  stroke(C.border);
  doc.setLineWidth(0.2);
  for (let i = 0; i <= scale.count; i++) {
    const v = scale.step * i;
    doc.line(plotX, yOf(v), plotX + plotW, yOf(v));
    text(nf0.format(v), plotX - 2, yOf(v) + 1, {
      size: 7,
      color: C.gray,
      align: "right",
    });
  }

  months.forEach((m, i) => {
    const selected = m.id === selectedId;
    const cx = plotX + colW * i + colW / 2;
    fill(C.orange);
    doc.rect(
      cx - barW - 0.4,
      yOf(m.clientsServed),
      barW,
      box.y + plotH - yOf(m.clientsServed),
      "F",
    );
    fill(C.navy);
    doc.rect(
      cx + 0.4,
      yOf(m.clientsMissed),
      barW,
      box.y + plotH - yOf(m.clientsMissed),
      "F",
    );
    text(monthShort(m.id), cx, box.y + box.h - 1.5, {
      size: 7.5,
      bold: selected,
      color: selected ? C.navy : C.gray,
      align: "center",
    });
    if (selected) {
      text(
        String(m.clientsServed),
        cx - barW / 2 - 0.4,
        yOf(m.clientsServed) - 1.2,
        { size: 7.5, bold: true, align: "center" },
      );
      text(
        String(m.clientsMissed),
        cx + barW / 2 + 0.4,
        yOf(m.clientsMissed) - 1.2,
        { size: 7.5, bold: true, align: "center" },
      );
    }
  });
}

function pdfLineChart(
  doc,
  C,
  box,
  months,
  selectedId,
  opts,
  text,
  fill,
  stroke,
) {
  const padL = 13,
    padB = 7,
    padT = 5;
  const plotX = box.x + padL;
  const plotW = box.w - padL;
  const plotH = box.h - padB - padT;
  const lo = opts.ticks[0];
  const hi = opts.ticks[opts.ticks.length - 1];
  const yOf = (v) => box.y + padT + plotH - ((v - lo) / (hi - lo)) * plotH;
  const colW = plotW / months.length;
  const xOf = (i) => plotX + colW * i + colW / 2;

  months.forEach((m, i) => {
    if (m.id !== selectedId) return;
    fill(C.orangeLight);
    doc.roundedRect(
      plotX + colW * i + 0.5,
      box.y + padT - 1,
      colW - 1,
      plotH + 1,
      1.5,
      1.5,
      "F",
    );
  });

  stroke(C.border);
  doc.setLineWidth(0.2);
  opts.ticks.forEach((v) => {
    doc.line(plotX, yOf(v), plotX + plotW, yOf(v));
    text(opts.tickFormat(v), plotX - 2, yOf(v) + 1, {
      size: 7,
      color: C.gray,
      align: "right",
    });
  });

  stroke(C.navy);
  doc.setLineWidth(0.6);
  for (let i = 1; i < months.length; i++) {
    doc.line(
      xOf(i - 1),
      yOf(opts.value(months[i - 1])),
      xOf(i),
      yOf(opts.value(months[i])),
    );
  }

  months.forEach((m, i) => {
    const selected = m.id === selectedId;
    const px = xOf(i);
    const py = yOf(opts.value(m));
    doc.setLineWidth(0.5);
    if (selected) {
      fill(C.orange);
      stroke(C.white);
      doc.circle(px, py, 1.7, "FD");
      text(opts.valueFormat(opts.value(m)), px, py - 3.2, {
        size: 7.5,
        bold: true,
        align: "center",
      });
    } else {
      fill(C.white);
      stroke(C.navy);
      doc.circle(px, py, 1, "FD");
    }
    text(monthShort(m.id), px, box.y + box.h - 1.5, {
      size: 7.5,
      bold: selected,
      color: selected ? C.navy : C.gray,
      align: "center",
    });
  });
}

/* --------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  init();
});
