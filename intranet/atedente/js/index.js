const dashboardSiteRootUrl = new URL("../../../", document.currentScript.src);
const dashboardAssetUrl = (path) =>
  new URL(`img/${path}`, dashboardSiteRootUrl).href;

async function getDashboardData() {
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
        thumbUrl: dashboardAssetUrl("trips/paris.jpeg"),
      },
      {
        name: "Tóquio",
        subLabel: "105 restantes",
        deltaPercent: 15.5,
        thumbUrl: dashboardAssetUrl("airplane_trips.jpg"),
      },
      {
        name: "Rio de Janeiro",
        subLabel: "70 restantes",
        deltaPercent: 10.3,
        thumbUrl: dashboardAssetUrl("trips/rio_de_janeiro.jpeg"),
      },
      {
        name: "Maldivas",
        subLabel: "40 restantes",
        deltaPercent: 7.2,
        thumbUrl: dashboardAssetUrl("trips/maldivas.jpeg"),
      },
    ],
  };

  return mockData;
}
// Ícones SVG brancos (substituem os emojis)
const kpiIcons = {
  revenue: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" fill="currentColor"/>
    </svg>`,
  bookings: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" fill="currentColor"/>
    </svg>`,
  promotions: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" fill="currentColor"/>
    </svg>`,
  conversion: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99l1.5 1.5z" fill="currentColor"/>
    </svg>`,
};

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

      // Usa o SVG correspondente ou fallback
      const iconSvg = kpiIcons[kpi.id] || kpi.icon;

      return `
        <div class="kpi-card" data-kpi-id="${kpi.id}">
          <div class="kpi-card-top">
            <div class="kpi-icon">${iconSvg}</div>
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

function renderRevenueChart(revenue) {
  const wrap = document.getElementById("revenueChartWrap");
  if (!wrap) return;
  wrap.innerHTML = buildRevenueChartSVG(revenue);
}

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
