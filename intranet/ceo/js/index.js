/**
 * @typedef {Object} KpiData
 * @property {string} id
 * @property {string} label
 * @property {string} value
 * @property {string} icon
 * @property {number} deltaPercent
 * @property {string} deltaLabel
 * @property {boolean} [goodWhenDown]
 *
 * @typedef {Object} DestinationData
 * @property {string} name
 * @property {string} subLabel
 * @property {number} deltaPercent
 * @property {string} thumbUrl
 *
 * @typedef {Object} FlightData
 * @property {string} route
 * @property {string} code
 * @property {string} when
 * @property {number} occupancy  0 a 100
 *
 * @typedef {Object} SacData
 * @property {string} clientName
 * @property {string} subject
 * @property {"open"|"progress"|"resolved"} status
 * @property {string} time
 *
 * @typedef {Object} SystemMetricData
 * @property {string} label
 * @property {string} target
 * @property {string} value
 * @property {boolean} ok
 *
 * @typedef {Object} DashboardData
 * @property {string} userName
 * @property {KpiData[]} kpis
 * @property {{ labels: string[], values: number[] }} revenue
 * @property {{ labels: string[], values: number[] }} complaints
 * @property {DestinationData[]} destinations
 * @property {FlightData[]} flights
 * @property {SacData[]} sac
 * @property {SystemMetricData[]} system
 */

/**
 * @returns {Promise<DashboardData>}
 */
async function getDashboardData() {
  const mockData = {
    userName: "Gerente",
    kpis: [
      {
        id: "sales",
        label: "Vendas do Mês",
        value: "R$ 120.450,00",
        icon: "💲",
        deltaPercent: 18.6,
        deltaLabel: "em relação ao mês anterior",
      },
      {
        id: "tickets",
        label: "Passagens Vendidas",
        value: "853",
        icon: "✈️",
        deltaPercent: 12.6,
        deltaLabel: "em relação ao mês anterior",
      },
      {
        id: "complaints",
        label: "Reclamações Abertas",
        value: "14",
        icon: "⚠️",
        deltaPercent: -22.4,
        deltaLabel: "em relação ao mês anterior",
        goodWhenDown: true,
      },
      {
        id: "occupancy",
        label: "Ocupação Média dos Voos",
        value: "78,4%",
        icon: "💺",
        deltaPercent: 3.2,
        deltaLabel: "em relação ao mês anterior",
      },
    ],
    revenue: {
      labels: [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Maio",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ],
      values: [
        120000, 110000, 130000, 160000, 120000, 130000, 140000, 155000, 160000,
        112000, 98000, 190000,
      ],
    },
    complaints: {
      labels: [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Maio",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ],
      values: [18, 22, 15, 12, 20, 17, 14, 19, 16, 24, 21, 14],
    },
    destinations: [
      {
        name: "Paris",
        subLabel: "220 passagens vendidas",
        deltaPercent: 18.6,
        thumbUrl: "../img/trips/paris.jpeg",
      },
      {
        name: "Tóquio",
        subLabel: "105 passagens vendidas",
        deltaPercent: 15.5,
        thumbUrl: "../img/trips/toquio.webp",
      },
      {
        name: "Rio de Janeiro",
        subLabel: "70 passagens vendidas",
        deltaPercent: 10.3,
        thumbUrl: "../img/trips/rio_de_janeiro.jpeg",
      },
      {
        name: "Maldivas",
        subLabel: "40 passagens vendidas",
        deltaPercent: 7.2,
        thumbUrl: ".../img/trips/maldivas.jpeg",
      },
    ],
    flights: [
      {
        route: "Uberlândia → Rio de Janeiro",
        code: "VL 1204",
        when: "12/11 · 08:40",
        occupancy: 92,
      },
      {
        route: "Uberlândia → Salvador",
        code: "VL 2310",
        when: "13/11 · 14:15",
        occupancy: 30,
      },
      {
        route: "São Paulo → Paris",
        code: "VL 7781",
        when: "15/11 · 22:50",
        occupancy: 78,
      },
      {
        route: "Rio de Janeiro → Tóquio",
        code: "VL 9042",
        when: "18/11 · 23:30",
        occupancy: 55,
      },
    ],
    sac: [
      {
        clientName: "Mariana Alves",
        subject: "Cancelamento de voo",
        status: "open",
        time: "há 30 min",
      },
      {
        clientName: "Pedro Henrique",
        subject: "Dúvida sobre bagagem",
        status: "progress",
        time: "há 1h",
      },
      {
        clientName: "Juliana Santos",
        subject: "Pagamento recusado",
        status: "progress",
        time: "há 2h",
      },
      {
        clientName: "Rafael Souza",
        subject: "Alteração de assento",
        status: "resolved",
        time: "há 3h",
      },
    ],
    system: [
      {
        label: "Disponibilidade do sistema",
        target: "Meta: 99,9%",
        value: "99,9%",
        ok: true,
      },
      {
        label: "Tempo médio de resposta",
        target: "Meta: até 3 s",
        value: "1,8 s",
        ok: true,
      },
      {
        label: "Chamados resolvidos no prazo",
        target: "Meta: 90%",
        value: "92%",
        ok: true,
      },
    ],
  };

  return mockData;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  return String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/**
 * @param {KpiData[]} kpis
 */
function renderKpis(kpis) {
  const container = document.getElementById("kpiGrid");
  if (!container) return;

  container.innerHTML = kpis
    .map((kpi) => {
      const isDown = kpi.deltaPercent < 0;
      const arrow = isDown ? "↓" : "↑";
      const isGood = kpi.goodWhenDown ? isDown : !isDown;
      const deltaClass = isGood ? "kpi-delta" : "kpi-delta negative";
      const deltaAbs = Math.abs(kpi.deltaPercent).toLocaleString("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });

      return `
        <div class="kpi-card" data-kpi-id="${esc(kpi.id)}">
          <div class="kpi-card-top">
            <div class="kpi-icon">${kpi.icon}</div>
            <div>
              <p class="kpi-label">${esc(kpi.label)}</p>
              <p class="kpi-value">${esc(kpi.value)}</p>
            </div>
          </div>
          <div class="kpi-card-footer">
            <span class="${deltaClass}">${arrow} ${deltaAbs}%</span>
            <span>${esc(kpi.deltaLabel)}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

/**
 * @param {{ labels: string[], values: number[] }} revenue
 * @returns {string}
 */
function buildRevenueChartSVG(revenue) {
  const width = 800;
  const height = 320;
  const paddingLeft = 60;
  const paddingRight = 16;
  const paddingTop = 16;
  const paddingBottom = 28;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxValue = Math.max(...revenue.values, 0);
  const niceMax = Math.max(50000, Math.ceil(maxValue / 50000) * 50000);

  const stepX =
    revenue.values.length > 1 ? chartWidth / (revenue.values.length - 1) : 0;

  const points = revenue.values.map((value, i) => {
    const x = paddingLeft + i * stepX;
    const y = paddingTop + chartHeight - (value / niceMax) * chartHeight;
    return { x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const baseline = paddingTop + chartHeight;
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${baseline} ` +
        `L ${points[0].x.toFixed(1)} ${baseline} Z`
      : "";

  const gridSteps = 4;
  let gridLines = "";
  let yLabels = "";
  for (let i = 0; i <= gridSteps; i++) {
    const frac = i / gridSteps;
    const y = paddingTop + chartHeight - frac * chartHeight;
    const value = Math.round(niceMax * frac);
    gridLines += `<line x1="${paddingLeft}" y1="${y.toFixed(1)}" x2="${
      width - paddingRight
    }" y2="${y.toFixed(1)}" class="chart-gridline" />`;
    yLabels += `<text x="${paddingLeft - 10}" y="${(y + 4).toFixed(
      1,
    )}" class="chart-axis-label" text-anchor="end">${value.toLocaleString(
      "pt-BR",
    )}</text>`;
  }

  const xLabels = revenue.labels
    .map((label, i) => {
      const x = paddingLeft + i * stepX;
      return `<text x="${x.toFixed(
        1,
      )}" y="${height - 8}" class="chart-axis-label" text-anchor="middle">${esc(label)}</text>`;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" class="revenue-chart-svg" preserveAspectRatio="none" role="img" aria-label="Gráfico de vendas mensais">
      <defs>
        <linearGradient id="revenueAreaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f5793a" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#f5793a" stop-opacity="0" />
        </linearGradient>
      </defs>
      ${gridLines}
      <path d="${areaPath}" fill="url(#revenueAreaGradient)" stroke="none" />
      <path d="${linePath}" fill="none" stroke="#181919" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round" />
      ${yLabels}
      ${xLabels}
    </svg>
  `;
}

/**
 * @param {{ labels: string[], values: number[] }} revenue
 */
function renderRevenueChart(revenue) {
  const wrap = document.getElementById("revenueChartWrap");
  if (!wrap) return;
  wrap.innerHTML = buildRevenueChartSVG(revenue);
}

/**
 * @param {{ labels: string[], values: number[] }} complaints
 * @returns {string}
 */
function buildComplaintsChartSVG(complaints) {
  const width = 800;
  const height = 320;
  const paddingLeft = 48;
  const paddingRight = 16;
  const paddingTop = 24;
  const paddingBottom = 28;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const step = 5;
  const maxValue = Math.max(...complaints.values, 0);
  const niceMax = Math.max(step, Math.ceil(maxValue / step) * step);
  const gridSteps = niceMax / step;

  const slot = complaints.values.length
    ? chartWidth / complaints.values.length
    : 0;
  const barWidth = slot * 0.55;

  let gridLines = "";
  let yLabels = "";
  for (let i = 0; i <= gridSteps; i++) {
    const value = i * step;
    const y = paddingTop + chartHeight - (value / niceMax) * chartHeight;
    gridLines += `<line x1="${paddingLeft}" y1="${y.toFixed(1)}" x2="${
      width - paddingRight
    }" y2="${y.toFixed(1)}" class="chart-gridline" />`;
    yLabels += `<text x="${paddingLeft - 10}" y="${(y + 4).toFixed(
      1,
    )}" class="chart-axis-label" text-anchor="end">${value}</text>`;
  }

  const bars = complaints.values
    .map((value, i) => {
      const barHeight = (value / niceMax) * chartHeight;
      const x = paddingLeft + i * slot + (slot - barWidth) / 2;
      const y = paddingTop + chartHeight - barHeight;
      const cx = x + barWidth / 2;
      return `
        <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(
          1,
        )}" height="${barHeight.toFixed(1)}" rx="4" class="chart-bar" />
        <text x="${cx.toFixed(1)}" y="${(y - 6).toFixed(
          1,
        )}" class="chart-bar-value" text-anchor="middle">${value}</text>`;
    })
    .join("");

  const xLabels = complaints.labels
    .map((label, i) => {
      const x = paddingLeft + i * slot + slot / 2;
      return `<text x="${x.toFixed(
        1,
      )}" y="${height - 8}" class="chart-axis-label" text-anchor="middle">${esc(label)}</text>`;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" class="complaints-chart-svg" role="img" aria-label="Gráfico de volume de reclamações por mês">
      ${gridLines}
      ${bars}
      ${yLabels}
      ${xLabels}
    </svg>
  `;
}

/**
 * @param {{ labels: string[], values: number[] }} complaints
 */
function renderComplaintsChart(complaints) {
  const wrap = document.getElementById("complaintsChartWrap");
  if (!wrap) return;
  wrap.innerHTML = buildComplaintsChartSVG(complaints);
}

/**
 * @param {DestinationData[]} destinations
 */
function renderDestinations(destinations) {
  const list = document.getElementById("destinationsList");
  if (!list) return;

  list.innerHTML = destinations
    .map(
      (dest) => `
        <li class="destination-item">
          <img
            class="destination-thumb"
            src="${esc(dest.thumbUrl)}"
            alt="${esc(dest.name)}"
            loading="lazy"
          />
          <div class="destination-info">
            <p class="destination-name">${esc(dest.name)}</p>
            <p class="destination-sub">${esc(dest.subLabel)}</p>
          </div>
          <span class="destination-delta">↑ ${dest.deltaPercent.toLocaleString(
            "pt-BR",
            { minimumFractionDigits: 1, maximumFractionDigits: 1 },
          )}%</span>
        </li>
      `,
    )
    .join("");
}

/**
 * @param {FlightData[]} flights
 */
function renderFlights(flights) {
  const list = document.getElementById("flightsList");
  if (!list) return;

  list.innerHTML = flights
    .map((flight) => {
      const pct = Math.max(0, Math.min(100, flight.occupancy));

      let tag = "";
      if (pct >= 90) {
        tag = '<span class="info-tag info-tag-confirmed">Quase lotado</span>';
      } else if (pct < 40) {
        tag = '<span class="info-tag info-tag-pending">Baixa ocupação</span>';
      }

      return `
        <li class="info-list-item">
          <div class="info-main">
            <p class="info-title">${esc(flight.route)}</p>
            <p class="info-sub">${esc(flight.code)} · ${esc(flight.when)}</p>
          </div>
          <div class="info-side">
            <p class="info-value">${pct}%</p>
            <div class="occupancy-bar" role="img" aria-label="Ocupação de ${pct}%">
              <div class="occupancy-bar-fill" style="width: ${pct}%"></div>
            </div>
            ${tag}
          </div>
        </li>
      `;
    })
    .join("");
}

/**
 * @param {SacData[]} sac
 */
function renderSac(sac) {
  const list = document.getElementById("sacList");
  if (!list) return;

  const statusMap = {
    open: { label: "Aberto", cls: "info-tag-open" },
    progress: { label: "Em atendimento", cls: "info-tag-progress" },
    resolved: { label: "Resolvido", cls: "info-tag-confirmed" },
  };

  list.innerHTML = sac
    .map((item) => {
      const status = statusMap[item.status] || statusMap.open;

      return `
        <li class="info-list-item">
          <div class="info-avatar">${esc(getInitials(item.clientName))}</div>
          <div class="info-main">
            <p class="info-title">${esc(item.clientName)}</p>
            <p class="info-sub">${esc(item.subject)}</p>
          </div>
          <div class="info-side">
            <span class="info-time">${esc(item.time)}</span>
            <span class="info-tag ${status.cls}">${status.label}</span>
          </div>
        </li>
      `;
    })
    .join("");
}

/**
 * @param {SystemMetricData[]} metrics
 */
function renderSystem(metrics) {
  const list = document.getElementById("systemList");
  if (!list) return;

  list.innerHTML = metrics
    .map((metric) => {
      const tagClass = metric.ok ? "info-tag-confirmed" : "info-tag-pending";
      const tagLabel = metric.ok ? "Dentro da meta" : "Fora da meta";

      return `
        <li class="info-list-item">
          <div class="info-main">
            <p class="info-title">${esc(metric.label)}</p>
            <p class="info-sub">${esc(metric.target)}</p>
          </div>
          <div class="info-side">
            <p class="info-value">${esc(metric.value)}</p>
            <span class="info-tag ${tagClass}">${tagLabel}</span>
          </div>
        </li>
      `;
    })
    .join("");
}

async function initDashboard() {
  try {
    const data = await getDashboardData();

    const nameEl = document.getElementById("dashUserName");
    if (nameEl && data.userName) nameEl.textContent = data.userName;

    renderKpis(data.kpis);
    renderRevenueChart(data.revenue);
    renderDestinations(data.destinations);
    renderComplaintsChart(data.complaints);
    renderFlights(data.flights);
    renderSac(data.sac);
    renderSystem(data.system);
  } catch (err) {
    console.error("Erro ao carregar o dashboard:", err);
  }
}

document.addEventListener("DOMContentLoaded", initDashboard);