export function getAgendaView() {
  return `
    <div class="scroll-container">
        <header class="page-header">
            <h1>Agenda</h1>
            <p>Organize reuniões, prazos e compromissos pessoais.</p>
        </header>

        <section class="panel agenda-wrapper">
            <div class="calendar-top">
                <button id="prevMonth" class="month-btn">◀</button>
                <h2 id="monthTitle">Mês</h2>
                <button id="nextMonth" class="month-btn">▶</button>
            </div>

            <div class="calendar-grid week-days">
                <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sab</div>
            </div>

            <div id="calendarDays" class="calendar-grid days-grid"></div>
        </section>

        <section class="panel event-panel">
            <h3 id="selectedDateTitle">Selecione um dia no calendário</h3>

            <div class="event-form">
                <input type="text" id="eventInput" placeholder="Digite um novo compromisso e aperte Enter..." disabled>
                <button id="addEventBtn" class="btn-primary" disabled>Adicionar</button>
            </div>

            <ul id="eventList" class="event-list"></ul>
        </section>
    </div>
  `;
}

export function initAgenda() {
  const monthTitle = document.getElementById("monthTitle");
  const calendarDays = document.getElementById("calendarDays");
  const selectedDateTitle = document.getElementById("selectedDateTitle");
  const eventInput = document.getElementById("eventInput");
  const addEventBtn = document.getElementById("addEventBtn");
  const eventList = document.getElementById("eventList");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");

  if (!monthTitle) return;

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();
  let selectedDateKey = null;

  // LOCAL STORAGE
  function getEvents() {
    return JSON.parse(localStorage.getItem("inteliJr_agenda")) || {};
  }

  function saveEvents(events) {
    localStorage.setItem("inteliJr_agenda", JSON.stringify(events));
  }

  function formatDateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  // RENDERIZAÇÃO DO CALENDÁRIO

  function renderCalendar() {
    calendarDays.innerHTML = "";
    monthTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
    const events = getEvents();
    const today = new Date();

    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement("div");
      emptyCell.className = "day empty";
      calendarDays.appendChild(emptyCell);
    }

    for (let day = 1; day <= lastDate; day++) {
      const dayCell = document.createElement("div");
      dayCell.className = "day";
      const dateKey = formatDateKey(currentYear, currentMonth, day);

      if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
        dayCell.classList.add("today");
      }

      if (selectedDateKey === dateKey) {
        dayCell.classList.add("selected");
      }

      const dayNumber = document.createElement("div");
      dayNumber.className = "day-number";
      dayNumber.textContent = day;
      dayCell.appendChild(dayNumber);

      if (events[dateKey] && events[dateKey].length > 0) {
        const preview = document.createElement("div");
        preview.className = "day-event-preview";
        preview.innerHTML = `<i class="ph-fill ph-push-pin"></i> ${events[dateKey].length}`;
        dayCell.appendChild(preview);
      }

      dayCell.addEventListener("click", () => {
        selectedDateKey = dateKey;
        selectedDateTitle.textContent = `Compromissos de ${day}/${String(currentMonth + 1).padStart(2, "0")}/${currentYear}`;

        eventInput.disabled = false;
        addEventBtn.disabled = false;
        eventInput.focus();

        renderCalendar();
        renderEvents();
      });

      calendarDays.appendChild(dayCell);
    }
  }

  // RENDERIZAÇÃO E MANIPULAÇÃO DA LISTA

  function renderEvents() {
    eventList.innerHTML = "";

    if (!selectedDateKey) {
      eventList.innerHTML = "<li class='empty-msg'>Selecione um dia no calendário acima para ver ou adicionar tarefas.</li>";
      return;
    }

    const events = getEvents();
    const selectedEvents = events[selectedDateKey] || [];

    if (selectedEvents.length === 0) {
      eventList.innerHTML = "<li class='empty-msg'>Nenhum compromisso marcado para esta data.</li>";
      return;
    }

    selectedEvents.forEach((eventText, index) => {
      const li = document.createElement("li");
      li.className = "event-item animate-in";

      li.innerHTML = `
        <div class="event-info">
            <i class="ph ph-check-circle"></i>
            <span>${eventText}</span>
        </div>
        <button class="delete-btn" title="Excluir compromisso">
            <i class="ph ph-trash"></i>
        </button>
      `;

      const deleteBtn = li.querySelector(".delete-btn");
      deleteBtn.addEventListener("click", () => {
        li.classList.add("animate-out");
        setTimeout(() => removeEvent(index), 200);
      });

      eventList.appendChild(li);
    });
  }

  function addEvent() {
    const text = eventInput.value.trim();
    if (!selectedDateKey || !text) return;

    const events = getEvents();
    if (!events[selectedDateKey]) {
      events[selectedDateKey] = [];
    }

    events[selectedDateKey].push(text);
    saveEvents(events);

    eventInput.value = "";
    renderCalendar();
    renderEvents();
  }

  function removeEvent(index) {
    const events = getEvents();
    if (!events[selectedDateKey]) return;

    events[selectedDateKey].splice(index, 1);
    if (events[selectedDateKey].length === 0) {
      delete events[selectedDateKey];
    }

    saveEvents(events);
    renderCalendar();
    renderEvents();
  }

  // EVENT LISTENERS

  prevMonthBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar();
  });

  nextMonthBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar();
  });

  addEventBtn.addEventListener("click", addEvent);

  eventInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEvent();
    }
  });

  renderCalendar();
  renderEvents();
}