/**
 * dashboard.js
 * -----------------------------------------------------------------------
 * A página está dividida em duas partes:
 *
 *   1) CAMADA DE DADOS  (getDashboardData)
 *      Hoje devolve um objeto estático (mock), no MESMO formato que um
 *      endpoint de backend deveria devolver. Quando o backend existir,
 *      troque só o CORPO dessa função por um fetch — nada mais no
 *      arquivo precisa mudar, porque o resto do código só consome o
 *      objeto "data", sem saber de onde ele veio.
 *
 *   2) CAMADA DE RENDERIZAÇÃO (renderKpis, renderRevenueChart,
 *      renderDestinations) que recebe esse objeto e desenha a tela.
 * -----------------------------------------------------------------------
 */

/**
 * @typedef {Object} DashboardData
 * @property {string} userName
 * @property {KpiData[]} kpis
 * @property {{ labels: string[], values: number[] }} revenue
 * @property {DestinationData[]} destinations
 * @property {BookingData[]} recentBookings
 * @property {ActivityData[]} customerActivity
 */

/**
 * @typedef {Object} BookingData
 * @property {string} clientName
 * @property {string} description
 * @property {string} value
 * @property {"confirmed"|"pending"} status
 */

/**
 * @typedef {Object} ActivityData
 * @property {string} clientName
 * @property {string} action
 * @property {string} time
 */

/**
 * @typedef {Object} KpiData
 * @property {string} id
 * @property {string} label
 * @property {string} value
 * @property {string} icon
 * @property {number} deltaPercent
 * @property {string} deltaLabel
 */

/**
 * @typedef {Object} DestinationData
 * @property {string} name
 * @property {string} subLabel
 * @property {number} deltaPercent
 * @property {string} thumbUrl
 */

/**
 * Busca os dados do dashboard.
 *
 * TODO(backend): quando a API estiver pronta, substituir o corpo por:
 *
 *   const res = await fetch("/api/dashboard");
 *   if (!res.ok) throw new Error("Falha ao carregar dashboard");
 *   return await res.json();
 *
 * O endpoint deve devolver um objeto no formato descrito em
 * DashboardData acima.
 *
 * @returns {Promise<DashboardData>}
 */
async function getDashboardData() {
  // ----- MOCK: remover quando o backend existir -----
  const mockData = {
    userName: "Maria",
    kpis: [
      {
        id: "revenue",
        label: "Receita do Mês",
        value: "R$ 120.450,00",
        icon: "💲",
        deltaPercent: 18.6,
        deltaLabel: "em relação a abril",
      },
      {
        id: "bookings",
        label: "Reservas Realizadas",
        value: "853",
        icon: "💼",
        deltaPercent: 12.6,
        deltaLabel: "em relação a abril",
      },
      {
        id: "promotions",
        label: "Promoções Ativas",
        value: "12",
        icon: "🏷️",
        deltaPercent: 18.6,
        deltaLabel: "em relação a abril",
      },
      {
        id: "conversion",
        label: "Taxa de conversão",
        value: "27,6%",
        icon: "📈",
        deltaPercent: 18.6,
        deltaLabel: "em relação a abril",
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
    recentBookings: [
      {
        clientName: "Ricardo Soares",
        description: "Pacote Paris · 5 noites",
        value: "R$ 8.450,00",
        status: "confirmed",
      },
      {
        clientName: "Ricardo Boa",
        description: "Voo + Hotel · Tóquio",
        value: "R$ 12.300,00",
        status: "pending",
      },
      {
        clientName: "Ricardo Boaventura",
        description: "Cruzeiro Rio–Santos",
        value: "R$ 3.200,00",
        status: "confirmed",
      },
      {
        clientName: "Ricardo Soares Boaventura",
        description: "Pacote Maldivas",
        value: "R$ 15.900,00",
        status: "confirmed",
      },
    ],
    customerActivity: [
      {
        clientName: "Mariana Alves",
        action: "Cadastrou-se na plataforma",
        time: "há 12 min",
      },
      {
        clientName: "Pedro Henrique",
        action: "Favoritou o destino Tóquio",
        time: "há 40 min",
      },
      {
        clientName: "Juliana Santos",
        action: "Concluiu uma reserva",
        time: "há 1h",
      },
      {
        clientName: "Rafael Souza",
        action: "Entrou em contato via chat",
        time: "há 2h",
      },
    ],
    destinations: [
      {
        name: "Paris",
        subLabel: "220 restantes",
        deltaPercent: 18.6,
        thumbUrl: "../../img/trips/paris.jpeg",
      },
      {
        name: "Tóquio",
        subLabel: "105 restantes",
        deltaPercent: 15.5,
        thumbUrl: "../../img/trips/toquio.webp",
      },
      {
        name: "Rio de Janeiro",
        subLabel: "70 restantes",
        deltaPercent: 10.3,
        thumbUrl: "../../img/trips/rio_de_janeiro.jpeg",
      },
      {
        name: "Maldivas",
        subLabel: "40 restantes",
        deltaPercent: 7.2,
        thumbUrl: "../../img/trips/maldivas.jpeg",
      },
    ],
  };

  return mockData;
  // ----- FIM DO MOCK -----
}

/**
 * @param {KpiData[]} kpis
 */
function renderKpis(kpis) {
  const container = document.getElementById("kpiGrid");
  if (!container) return;

  container.innerHTML = kpis
    .map((kpi) => {
      const isNegative = kpi.deltaPercent < 0;
      const arrow = isNegative ? "↓" : "↑";
      const deltaClass = isNegative ? "kpi-delta negative" : "kpi-delta";
      const deltaAbs = Math.abs(kpi.deltaPercent).toLocaleString("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });

      return `
        <div class="kpi-card" data-kpi-id="${kpi.id}">
          <div class="kpi-card-top">
            <div class="kpi-icon">${kpi.icon}</div>
            <div>
              <p class="kpi-label">${kpi.label}</p>
              <p class="kpi-value">${kpi.value}</p>
            </div>
          </div>
          <div class="kpi-card-footer">
            <span class="${deltaClass}">${arrow} ${deltaAbs}%</span>
            <span>${kpi.deltaLabel}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

/**
 *
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
      )}" y="${height - 8}" class="chart-axis-label" text-anchor="middle">${label}</text>`;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" class="revenue-chart-svg" preserveAspectRatio="none" role="img" aria-label="Gráfico de receita mensal">
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
            src="${dest.thumbUrl}"
            alt="${dest.name}"
            loading="lazy"
          />
          <div class="destination-info">
            <p class="destination-name">${dest.name}</p>
            <p class="destination-sub">${dest.subLabel}</p>
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
 * @param {{clientName:string, description:string, value:string, status:"confirmed"|"pending"}[]} bookings
 */
function renderRecentBookings(bookings) {
  const list = document.getElementById("recentBookingsList");
  if (!list) return;

  list.innerHTML = bookings
    .map((booking) => {
      const initials = booking.clientName
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase();

      const tagClass =
        booking.status === "confirmed"
          ? "info-tag-confirmed"
          : "info-tag-pending";
      const tagLabel =
        booking.status === "confirmed" ? "Confirmada" : "Pendente";

      return `
        <li class="info-list-item">
          <div class="info-avatar">${initials}</div>
          <div class="info-main">
            <p class="info-title">${booking.clientName}</p>
            <p class="info-sub">${booking.description}</p>
          </div>
          <div class="info-side">
            <p class="info-value">${booking.value}</p>
            <span class="info-tag ${tagClass}">${tagLabel}</span>
          </div>
        </li>
      `;
    })
    .join("");
}

/**
 * @param {{clientName:string, action:string, time:string}[]} activity
 */
function renderCustomerActivity(activity) {
  const list = document.getElementById("customerActivityList");
  if (!list) return;

  list.innerHTML = activity
    .map((item) => {
      const initials = item.clientName
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase();

      return `
        <li class="info-list-item">
          <div class="info-avatar">${initials}</div>
          <div class="info-main">
            <p class="info-title">${item.clientName}</p>
            <p class="info-sub">${item.action}</p>
          </div>
          <div class="info-side">
            <span class="info-time">${item.time}</span>
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
    renderRecentBookings(data.recentBookings);
    renderCustomerActivity(data.customerActivity);
  } catch (err) {
    console.error("Erro ao carregar o dashboard:", err);
  }
}

document.addEventListener("DOMContentLoaded", initDashboard);
