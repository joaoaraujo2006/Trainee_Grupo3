const monthTitle = document.getElementById("monthTitle");
const calendarDays = document.getElementById("calendarDays");
const selectedDateTitle = document.getElementById("selectedDateTitle");
const eventInput = document.getElementById("eventInput");
const addEventBtn = document.getElementById("addEventBtn");
const eventList = document.getElementById("eventList");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDateKey = null;

function getEvents() {
  return JSON.parse(localStorage.getItem("agendaEvents")) || {};
}

function saveEvents(events) {
  localStorage.setItem("agendaEvents", JSON.stringify(events));
}

function formatDateKey(year, month, day) {
  const monthFormatted = String(month + 1).padStart(2, "0");
  const dayFormatted = String(day).padStart(2, "0");
  return `${year}-${monthFormatted}-${dayFormatted}`;
}

function renderCalendar() {
  calendarDays.innerHTML = "";
  monthTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("day", "empty");
    calendarDays.appendChild(emptyCell);
  }

  const events = getEvents();
  const today = new Date();

  for (let day = 1; day <= lastDate; day++) {
    const dayCell = document.createElement("div");
    dayCell.classList.add("day");

    const dateKey = formatDateKey(currentYear, currentMonth, day);

    if (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    ) {
      dayCell.classList.add("today");
    }

    if (selectedDateKey === dateKey) {
      dayCell.classList.add("selected");
    }

    const dayNumber = document.createElement("div");
    dayNumber.classList.add("day-number");
    dayNumber.textContent = day;

    dayCell.appendChild(dayNumber);

    if (events[dateKey] && events[dateKey].length > 0) {
      const preview = document.createElement("div");
      preview.classList.add("day-event-preview");
      preview.textContent = `${events[dateKey].length} compromisso(s)`;
      dayCell.appendChild(preview);
    }

    dayCell.addEventListener("click", () => {
      selectedDateKey = dateKey;
      selectedDateTitle.textContent = `Compromissos de ${day}/${String(currentMonth + 1).padStart(2, "0")}/${currentYear}`;
      renderCalendar();
      renderEvents();
    });

    calendarDays.appendChild(dayCell);
  }
}

function renderEvents() {
  eventList.innerHTML = "";

  if (!selectedDateKey) {
    eventList.innerHTML = "<li>Selecione um dia para visualizar ou adicionar compromissos.</li>";
    return;
  }

  const events = getEvents();
  const selectedEvents = events[selectedDateKey] || [];

  if (selectedEvents.length === 0) {
    eventList.innerHTML = "<li>Nenhum compromisso adicionado para esta data.</li>";
    return;
  }

  selectedEvents.forEach((eventText, index) => {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = eventText;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Excluir";
    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", () => {
      removeEvent(index);
    });

    li.appendChild(span);
    li.appendChild(deleteBtn);
    eventList.appendChild(li);
  });
}

function addEvent() {
  const text = eventInput.value.trim();

  if (!selectedDateKey) {
    alert("Selecione um dia primeiro.");
    return;
  }

  if (!text) {
    alert("Digite um compromisso.");
    return;
  }

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

prevMonthBtn.addEventListener("click", () => {
  currentMonth--;

  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }

  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentMonth++;

  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }

  renderCalendar();
});

addEventBtn.addEventListener("click", addEvent);

renderCalendar();
renderEvents();