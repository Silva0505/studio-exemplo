// Studio Exemplo — site de marcações de demonstração (sem frameworks).
(function () {
  "use strict";

  const STORAGE_KEY = "studioExemplo.bookings";
  const SALON_EMAIL = "marcacoes@studio-exemplo.invalid"; // domínio fictício
  const OPEN_HOUR = 9;   // primeira hora: 09:00
  const CLOSE_HOUR = 18; // salão fecha às 18:00 (última marcação às 17:00)

  const SERVICES = [
    { id: "corte", name: "Corte", price: 25 },
    { id: "corte-brushing", name: "Corte + Brushing", price: 40 },
    { id: "coloracao", name: "Coloração", price: 55 },
  ];

  const $ = (sel) => document.querySelector(sel);
  const form = $("#booking-form");
  const servicesEl = $("#services");
  const dateEl = $("#date");
  const slotsEl = $("#slots");
  const slotsHint = $("#slots-hint");
  const summaryEl = $("#summary");
  const errorEl = $("#form-error");
  const confirmationEl = $("#confirmation");
  const listEl = $("#bookings-list");

  let selectedTime = null;

  // ---------- Armazenamento ----------
  function loadBookings() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function saveBookings(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      return false;
    }
  }

  // ---------- Utilitários ----------
  const pad = (n) => String(n).padStart(2, "0");
  const euro = (n) => n.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function formatDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("pt-PT", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function getService(id) {
    return SERVICES.find((s) => s.id === id);
  }

  function selectedServiceId() {
    const checked = form.querySelector('input[name="service"]:checked');
    return checked ? checked.value : null;
  }

  // ---------- Serviços ----------
  function renderServices() {
    servicesEl.innerHTML = SERVICES.map((s) => `
      <label class="service">
        <input type="radio" name="service" value="${s.id}">
        <span>${escapeHTML(s.name)}</span>
        <span class="service-price">${euro(s.price)}</span>
      </label>`).join("");
  }

  // ---------- Horas ----------
  function allSlots() {
    const slots = [];
    for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) slots.push(`${pad(h)}:00`);
    return slots;
  }

  function isPast(date, time) {
    const [y, m, d] = date.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);
    return new Date(y, m - 1, d, hh, mm) <= new Date();
  }

  function renderSlots() {
    const date = dateEl.value;
    slotsEl.innerHTML = "";
    if (!date) {
      slotsHint.textContent = "Escolha primeiro uma data.";
      selectedTime = null;
      return;
    }

    const taken = new Set(loadBookings().filter((b) => b.date === date).map((b) => b.time));
    let free = 0;

    allSlots().forEach((time) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot";
      btn.textContent = time;
      const unavailable = taken.has(time) || isPast(date, time);
      btn.disabled = unavailable;
      btn.setAttribute("aria-pressed", String(time === selectedTime && !unavailable));
      if (unavailable) {
        btn.title = taken.has(time) ? "Ocupado" : "Já passou";
      } else {
        free++;
      }
      btn.addEventListener("click", () => {
        selectedTime = time;
        renderSlots();
        renderSummary();
      });
      slotsEl.appendChild(btn);
    });

    if (selectedTime && (taken.has(selectedTime) || isPast(date, selectedTime))) selectedTime = null;

    slotsHint.textContent = free
      ? `${free} hora(s) livre(s) entre as ${pad(OPEN_HOUR)}h e as ${CLOSE_HOUR}h.`
      : "Não há horas livres nesta data. Escolha outra data.";
  }

  // ---------- Resumo ----------
  function renderSummary() {
    const service = getService(selectedServiceId());
    const parts = [];
    if (service) parts.push(`<strong>${escapeHTML(service.name)}</strong> · ${euro(service.price)}`);
    if (dateEl.value) parts.push(escapeHTML(formatDate(dateEl.value)));
    if (selectedTime) parts.push(`às ${selectedTime}`);
    summaryEl.innerHTML = parts.join(" · ");
  }

  // ---------- Validação ----------
  function validate(data) {
    if (!data.serviceId) return "Escolha um serviço.";
    if (!data.date) return "Escolha uma data.";
    if (data.date < todayISO()) return "A data não pode estar no passado.";
    if (!data.time) return "Escolha uma hora livre.";
    if (isPast(data.date, data.time)) return "Essa hora já passou. Escolha outra.";
    if (data.name.length < 2) return "Indique o seu nome.";
    if (!/^(\+351)?9\d{8}$/.test(data.phone.replace(/[\s-]/g, ""))) {
      return "Indique um telemóvel válido (9 dígitos, a começar por 9).";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "Indique um email válido.";
    const clash = loadBookings().some((b) => b.date === data.date && b.time === data.time);
    if (clash) return "Essa hora acabou de ficar ocupada. Escolha outra.";
    return "";
  }

  // ---------- Email (pré-visualização) ----------
  function buildEmail(b) {
    const service = getService(b.serviceId);
    return {
      from: `${b.name} <${b.email}>`,
      to: `Studio Exemplo <${SALON_EMAIL}>`,
      subject: `Nova marcação: ${service.name} — ${b.date} às ${b.time}`,
      body:
`Olá equipa do Studio Exemplo,

Foi feita uma nova marcação através do site.

Serviço:   ${service.name}
Preço:     ${euro(service.price)}
Data:      ${formatDate(b.date)}
Hora:      ${b.time}

Cliente:   ${b.name}
Telemóvel: ${b.phone}
Email:     ${b.email}

Referência: ${b.id}
Criada em:  ${new Date(b.createdAt).toLocaleString("pt-PT")}

— Mensagem automática (DEMO: não é um negócio real)`,
    };
  }

  function showConfirmation(b) {
    const service = getService(b.serviceId);
    $("#confirmation-text").textContent =
      `${b.name}, a sua marcação de ${service.name} (${euro(service.price)}) ficou registada para ${formatDate(b.date)} às ${b.time}.`;
    const email = buildEmail(b);
    $("#email-from").textContent = email.from;
    $("#email-to").textContent = email.to;
    $("#email-subject").textContent = email.subject;
    $("#email-body").textContent = email.body;

    form.classList.add("hidden");
    confirmationEl.classList.remove("hidden");
    confirmationEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---------- Painel ----------
  function renderPanel() {
    const list = loadBookings().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    $("#clear-all").disabled = list.length === 0;
    if (!list.length) {
      listEl.innerHTML = '<p class="hint">Ainda não há marcações.</p>';
      return;
    }
    const rows = list.map((b) => {
      const s = getService(b.serviceId) || { name: "?", price: 0 };
      return `<tr>
        <td data-label="Data">${escapeHTML(b.date)}</td>
        <td data-label="Hora">${escapeHTML(b.time)}</td>
        <td data-label="Serviço">${escapeHTML(s.name)} (${euro(s.price)})</td>
        <td data-label="Nome">${escapeHTML(b.name)}</td>
        <td data-label="Telemóvel">${escapeHTML(b.phone)}</td>
        <td data-label="Email">${escapeHTML(b.email)}</td>
        <td data-label=""><button type="button" class="btn btn-small btn-danger" data-cancel="${escapeHTML(b.id)}">Cancelar</button></td>
      </tr>`;
    }).join("");
    listEl.innerHTML = `<table class="booking-table">
      <thead><tr><th>Data</th><th>Hora</th><th>Serviço</th><th>Nome</th><th>Telemóvel</th><th>Email</th><th></th></tr></thead>
      <tbody>${rows}</tbody></table>`;
  }

  listEl.addEventListener("click", (e) => {
    const id = e.target.getAttribute("data-cancel");
    if (!id || !confirm("Cancelar esta marcação?")) return;
    saveBookings(loadBookings().filter((b) => b.id !== id));
    renderPanel();
    renderSlots();
  });

  $("#clear-all").addEventListener("click", () => {
    if (!confirm("Apagar todas as marcações guardadas?")) return;
    saveBookings([]);
    renderPanel();
    renderSlots();
  });

  // ---------- Formulário ----------
  form.addEventListener("change", (e) => {
    if (e.target.name === "service") renderSummary();
  });

  dateEl.addEventListener("change", () => {
    selectedTime = null;
    renderSlots();
    renderSummary();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      serviceId: selectedServiceId(),
      date: dateEl.value,
      time: selectedTime,
      name: $("#name").value.trim(),
      phone: $("#phone").value.trim(),
      email: $("#email").value.trim(),
    };
    const err = validate(data);
    errorEl.textContent = err;
    if (err) {
      renderSlots();
      return;
    }

    const booking = {
      id: "SE-" + Date.now().toString(36).toUpperCase(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    const list = loadBookings();
    list.push(booking);
    if (!saveBookings(list)) {
      errorEl.textContent = "Não foi possível guardar (localStorage indisponível).";
      return;
    }
    renderPanel();
    showConfirmation(booking);
  });

  $("#new-booking").addEventListener("click", () => {
    form.reset();
    selectedTime = null;
    errorEl.textContent = "";
    dateEl.min = todayISO();
    renderSlots();
    renderSummary();
    confirmationEl.classList.add("hidden");
    form.classList.remove("hidden");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // ---------- Arranque ----------
  renderServices();
  dateEl.min = todayISO();
  renderSlots();
  renderSummary();
  renderPanel();
})();
