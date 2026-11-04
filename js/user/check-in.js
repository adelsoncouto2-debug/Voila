var totalRows = 12;
var seatLetters = ["A", "B", "C", "D", "E", "F"];
var reservation = {};
var selectedSeat = "";
var maxStep = 1;

var panels = document.querySelectorAll(".step_panel");
var stepButtons = document.querySelectorAll(".step");

function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(value) {
  var parts = value.split("-");
  return parts[2] + "/" + parts[1] + "/" + parts[0];
}

/* ---------- Navegação entre etapas ---------- */
function goToStep(number) {
  var i;
  for (i = 0; i < panels.length; i++) {
    panels[i].hidden = i + 1 !== number;
  }
  for (i = 0; i < stepButtons.length; i++) {
    var step = i + 1;
    var circle = stepButtons[i].querySelector(".circle_bellow");
    stepButtons[i].classList.remove("step_active", "step_done", "step_todo");
    if (step === number) {
      stepButtons[i].classList.add("step_active");
      circle.textContent = step;
    } else if (step < number || step <= maxStep) {
      stepButtons[i].classList.add("step_done");
      circle.innerHTML =
        '<svg class="icon icon_small"><use href="#i-check" /></svg>';
    } else {
      stepButtons[i].classList.add("step_todo");
      circle.textContent = step;
    }
  }
}

for (var s = 0; s < stepButtons.length; s++) {
  stepButtons[s].addEventListener("click", function () {
    var target = Number(this.getAttribute("data-step"));
    if (target <= maxStep) {
      goToStep(target);
    }
  });
}

/* ---------- Etapa 1: buscar reserva ---------- */
document.getElementById("btn_search").addEventListener("click", function () {
  var code = document.getElementById("input_code").value.trim().toUpperCase();
  var surname = document.getElementById("input_surname").value.trim();
  var date = document.getElementById("input_date").value;
  var airline = document.getElementById("input_airline").value;
  var error = document.getElementById("form_error");

  if (!/^[A-Z0-9]{6,10}$/.test(code)) {
    error.textContent =
      "Digite o código da reserva com 6 a 10 letras ou números.";
    return;
  }
  if (surname === "") {
    error.textContent = "Digite o sobrenome do passageiro.";
    return;
  }
  if (date === "") {
    error.textContent = "Informe a data da viagem.";
    return;
  }
  if (airline === "") {
    error.textContent = "Selecione a companhia aérea.";
    return;
  }

  error.textContent = "";
  reservation = {
    code: code,
    surname: surname,
    date: formatDate(date),
    airline: airline,
    flight: "3256",
    from: "GRU",
    fromCity: "São Paulo",
    to: "SDU",
    toCity: "Rio de Janeiro",
    gate: "12A",
    boarding: "10:45",
    departure: "11:25",
  };
  selectedSeat = "";
  document.getElementById("seat_selected").textContent = "nenhum";
  document.getElementById("btn_seat_next").disabled = true;
  buildSeatMap();
  maxStep = 2;
  goToStep(2);
});

/* ---------- Etapa 2: mapa de assentos ---------- */
function buildSeatMap() {
  var html = '<div class="seat_row seat_head">';
  var row, c;
  for (c = 0; c < 6; c++) {
    html += "<span>" + seatLetters[c] + "</span>";
    if (c === 2) {
      html += "<span></span>";
    }
  }
  html += "</div>";

  for (row = 1; row <= totalRows; row++) {
    html += '<div class="seat_row">';
    for (c = 0; c < 6; c++) {
      var id = row + seatLetters[c];
      var occupied = (row * 7 + c * 3) % 5 === 0;
      html +=
        '<button type="button" class="seat' +
        (occupied ? " seat_occupied" : "") +
        '" data-seat="' +
        id +
        '"' +
        (occupied ? " disabled" : "") +
        ' aria-label="Assento ' +
        id +
        (occupied ? " ocupado" : "") +
        '"></button>';
      if (c === 2) {
        html += '<span class="seat_number">' + row + "</span>";
      }
    }
    html += "</div>";
  }
  document.getElementById("seat_map").innerHTML = html;
}

document.getElementById("seat_map").addEventListener("click", function (event) {
  var seat = event.target.closest(".seat");
  if (!seat || seat.disabled) {
    return;
  }
  var all = document.querySelectorAll(".seat_chosen_on");
  for (var i = 0; i < all.length; i++) {
    all[i].classList.remove("seat_chosen_on");
  }
  seat.classList.add("seat_chosen_on");
  selectedSeat = seat.getAttribute("data-seat");
  document.getElementById("seat_selected").textContent = selectedSeat;
  document.getElementById("btn_seat_next").disabled = false;
});

document.getElementById("btn_seat_back").addEventListener("click", function () {
  goToStep(1);
});

document.getElementById("btn_seat_next").addEventListener("click", function () {
  fillConfirmation();
  maxStep = 3;
  goToStep(3);
});

/* ---------- Etapa 3: confirmação ---------- */
function fillConfirmation() {
  var items = [
    ["Código da reserva", reservation.code],
    ["Sobrenome do passageiro", reservation.surname],
    ["Companhia aérea", reservation.airline],
    ["Voo", reservation.flight],
    ["Origem", reservation.from + " - " + reservation.fromCity],
    ["Destino", reservation.to + " - " + reservation.toCity],
    ["Data da viagem", reservation.date],
    ["Embarque", reservation.boarding],
    ["Decolagem", reservation.departure],
    ["Portão", reservation.gate],
    ["Assento", selectedSeat],
  ];
  var html = "";
  for (var i = 0; i < items.length; i++) {
    html +=
      "<div><dt>" +
      items[i][0] +
      "</dt><dd>" +
      esc(items[i][1]) +
      "</dd></div>";
  }
  document.getElementById("data_list").innerHTML = html;
}

document
  .getElementById("btn_confirm_back")
  .addEventListener("click", function () {
    goToStep(2);
  });

document.getElementById("btn_confirm").addEventListener("click", function () {
  document.getElementById("final_pass").innerHTML = buildPass({
    code: reservation.code,
    flight: reservation.flight,
    from: reservation.from,
    fromCity: reservation.fromCity,
    to: reservation.to,
    toCity: reservation.toCity,
    seat: selectedSeat,
    boarding: reservation.boarding,
  });
  maxStep = 4;
  goToStep(4);
});

/* ---------- Etapa 4: cartão de embarque ---------- */
document.getElementById("btn_print").addEventListener("click", function () {
  window.print();
});

document.getElementById("btn_restart").addEventListener("click", function () {
  document.getElementById("input_code").value = "";
  document.getElementById("input_surname").value = "";
  document.getElementById("input_date").value = "";
  document.getElementById("input_airline").value = "";
  document.getElementById("form_error").textContent = "";
  selectedSeat = "";
  maxStep = 1;
  goToStep(1);
});

/* ---------- QR code simulado ---------- */
function buildQr(text) {
  var size = 21;
  var seed = 1;
  var i, x, y;
  for (i = 0; i < text.length; i++) {
    seed = (seed * 31 + text.charCodeAt(i)) % 2147483647;
  }
  if (seed === 0) {
    seed = 1;
  }
  function random() {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  }

  var rects = "";
  for (y = 0; y < size; y++) {
    for (x = 0; x < size; x++) {
      var inFinder = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
      if (!inFinder && random() > 0.5) {
        rects += '<rect x="' + x + '" y="' + y + '" width="1" height="1" />';
      }
    }
  }

  function finder(ox, oy) {
    return (
      '<rect x="' +
      ox +
      '" y="' +
      oy +
      '" width="7" height="7" />' +
      '<rect x="' +
      (ox + 1) +
      '" y="' +
      (oy + 1) +
      '" width="5" height="5" fill="#ffffff" />' +
      '<rect x="' +
      (ox + 2) +
      '" y="' +
      (oy + 2) +
      '" width="3" height="3" />'
    );
  }

  return (
    '<svg viewBox="0 0 21 21" fill="#172e4d" aria-label="QR code do cartão de embarque">' +
    rects +
    finder(0, 0) +
    finder(14, 0) +
    finder(0, 14) +
    "</svg>"
  );
}

/* ---------- Cartão de embarque (usado na etapa 4 e na lateral) ---------- */
function buildPass(data) {
  return (
    '<div class="boarding_pass">' +
    '<div class="pass_top"><span>VOILÀ</span>' +
    '<svg class="icon icon_small"><use href="#i-plane" /></svg></div>' +
    '<div class="pass_body">' +
    '<div class="pass_route">' +
    '<div><div class="pass_code">' +
    esc(data.from) +
    '</div><div class="pass_city">' +
    esc(data.fromCity) +
    "</div></div>" +
    '<svg class="icon"><use href="#i-plane" /></svg>' +
    '<div><div class="pass_code">' +
    esc(data.to) +
    '</div><div class="pass_city">' +
    esc(data.toCity) +
    "</div></div>" +
    "</div>" +
    '<div class="pass_info">' +
    "<div><span>Voo</span><strong>" +
    esc(data.flight) +
    "</strong></div>" +
    "<div><span>Assento</span><strong>" +
    esc(data.seat) +
    "</strong></div>" +
    "<div><span>Embarque</span><strong>" +
    esc(data.boarding) +
    "</strong></div>" +
    "</div>" +
    '<div class="pass_qr">' +
    buildQr(data.code + data.seat) +
    "<span>Cartão de embarque</span></div>" +
    "</div></div>"
  );
}

/* Prévia fixa da coluna da direita */
document.getElementById("preview_pass").innerHTML = buildPass({
  code: "VLA123456",
  flight: "3256",
  from: "GRU",
  fromCity: "São Paulo",
  to: "SDU",
  toCity: "Rio de Janeiro",
  seat: "12A",
  boarding: "10:45",
});

goToStep(1);
