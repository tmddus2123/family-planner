function moveMonth(delta) {
  const selected = new Date(`${state.selectedDate}T00:00:00`);
  selected.setMonth(selected.getMonth() + delta, 1);
  state.selectedDate = toDateKey(selected);
  saveState();
  renderCalendar();
  renderSelectedEvents();
}

function renderWeekdays() {
  weekdays.innerHTML = "";
  dayNames.forEach((day) => {
    const cell = document.createElement("div");
    cell.textContent = day;
    weekdays.appendChild(cell);
  });
}

function getCalendarMarkerColors(events) {
  const colors = [];
  events.forEach((event) => {
    event.participants.forEach((participantId) => {
      if (participantId === "all") {
        colors.push({ label: "전체", color: "var(--all-color)", all: true });
        return;
      }
      const user = getUserById(participantId);
      if (user && !colors.some((entry) => entry.label === user.name)) {
        colors.push({ label: user.name, color: user.color, all: false });
      }
    });
  });
  return colors.slice(0, 4);
}

function renderLegend() {
  calendarLegend.innerHTML = "";
  state.users.forEach((user) => {
    const item = document.createElement("span");
    item.innerHTML = `<i class="legend-dot" style="background:${user.color}"></i>${user.name}`;
    calendarLegend.appendChild(item);
  });
  const allItem = document.createElement("span");
  allItem.innerHTML = `<i class="legend-dot all"></i>전체`;
  calendarLegend.appendChild(allItem);
}

function renderCalendar() {
  const selected = new Date(`${state.selectedDate}T00:00:00`);
  const year = selected.getFullYear();
  const month = selected.getMonth();
  calendarTitle.textContent = `${year}년 ${month + 1}월`;

  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  calendarGrid.innerHTML = "";

  for (let i = 0; i < 42; i += 1) {
    const dayButton = document.createElement("button");
    dayButton.type = "button";
    dayButton.className = "day-cell";

    let displayDay;
    let cellDate;
    let isMuted = false;

    if (i < startWeekday) {
      displayDay = prevMonthDays - startWeekday + i + 1;
      cellDate = new Date(year, month - 1, displayDay);
      isMuted = true;
    } else if (i >= startWeekday + daysInMonth) {
      displayDay = i - startWeekday - daysInMonth + 1;
      cellDate = new Date(year, month + 1, displayDay);
      isMuted = true;
    } else {
      displayDay = i - startWeekday + 1;
      cellDate = new Date(year, month, displayDay);
    }

    const key = toDateKey(cellDate);
    const events = state.events[key] || [];
    const markerHtml = getCalendarMarkerColors(events)
      .map((entry) => `<span class="marker${entry.all ? " all" : ""}" style="${entry.all ? "" : `background:${entry.color}`}" title="${entry.label}"></span>`)
      .join("");

    if (isMuted) dayButton.classList.add("muted");
    if (key === BASE_DATE_KEY) dayButton.classList.add("today");
    if (key === state.selectedDate) dayButton.classList.add("selected");

    dayButton.innerHTML = `
      <span class="day-number">${displayDay}</span>
      <div class="marker-row">${markerHtml}</div>
    `;

    dayButton.addEventListener("click", () => {
      state.selectedDate = key;
      saveState();
      renderCalendar();
      renderSelectedEvents();
    });

    calendarGrid.appendChild(dayButton);
  }
}

function participantLabel(participantId) {
  if (participantId === "all") return "전체";
  return getUserById(participantId)?.name || participantId;
}

function participantChip(participantId) {
  if (participantId === "all") {
    return `<span class="member-chip all-chip">전체</span>`;
  }

  const user = getUserById(participantId);
  if (!user) return "";
  return `<span class="member-chip" style="background:${hexToSoft(user.color)}; color:${user.color}">${user.name}</span>`;
}

function renderSelectedEvents() {
  const date = new Date(`${state.selectedDate}T00:00:00`);
  selectedDateTitle.textContent = formatHeadline(date);
  selectedEvents.innerHTML = "";

  const events = state.events[state.selectedDate] || [];
  if (!events.length) {
    selectedEvents.innerHTML = `<div class="empty-state">선택한 날짜에 등록된 일정이 없습니다.</div>`;
    return;
  }

  events.forEach((event) => {
    const summary = event.participants.map(participantLabel).join(", ");
    const chips = event.participants.map(participantChip).join("");
    const item = document.createElement("article");
    item.className = "event-item";
    item.innerHTML = `
      <strong>${event.title}</strong>
      <div class="event-meta">
        <span>${event.time}</span>
        <span class="event-pill all">참석자 ${summary}</span>
      </div>
      <div class="member-chip-row">${chips}</div>
    `;
    selectedEvents.appendChild(item);
  });
}
