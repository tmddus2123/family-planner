const STORAGE_KEY = "toyProjectSharedCalendarState";
const MAX_USERS = 4;
const BASE_DATE_KEY = "2026-03-23";
const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

const defaultState = {
  users: [
    { id: "me", name: "나", color: "#d46a6a" },
    { id: "love", name: "애인", color: "#4f7cff" },
  ],
  activeUserId: null,
  currentOffset: 0,
  selectedDate: BASE_DATE_KEY,
  activeTab: "overview",
  boardOrderByUser: {
    me: ["love"],
    love: ["me"],
  },
  daily: {
    "2026-03-22": {
      memo: "주말 정리한 내용을 확인하고, 밀린 집안일을 가볍게 나눠서 처리하기.",
      tasks: {
        me: ["마트 장보기", "공과금 확인", "운동 30분 하기"],
        love: ["세탁 돌리기", "다음 주 약속 시간 정리", "저녁 메뉴 정하기"],
      },
    },
    "2026-03-23": {
      memo: "오늘은 모두 바쁜 날이라 꼭 필요한 일정만 체크하고, 저녁에는 이번 주 계획을 같이 맞추기.",
      tasks: {
        me: ["오전 10시 회의 준비", "병원 예약 확인", "저녁 장보기 리스트 작성"],
        love: ["카페 미팅 참석", "공유 문서 피드백 남기기", "주말 일정 등록"],
      },
    },
    "2026-03-24": {
      memo: "내일은 외출 일정이 있어서 이동 시간과 식사 시간을 미리 맞춰두기.",
      tasks: {
        me: ["차량 점검 예약", "점심 약속 장소 확인", "공유 앨범 사진 업로드"],
        love: ["미용실 예약 시간 확인", "퇴근 후 약국 들르기", "공유 TODO 우선순위 정리"],
      },
    },
  },
  events: {
    "2026-03-03": [
      { title: "은행 업무", time: "11:00", participants: ["me"] },
      { title: "공유 가계부 정리", time: "21:00", participants: ["all"] },
    ],
    "2026-03-09": [
      { title: "회사 회식", time: "18:30", participants: ["love"] },
    ],
    "2026-03-12": [
      { title: "병원 검진", time: "14:00", participants: ["me"] },
    ],
    "2026-03-16": [
      { title: "데이트 저녁", time: "19:30", participants: ["all"] },
    ],
    "2026-03-20": [
      { title: "부모님 선물 주문", time: "13:00", participants: ["all"] },
      { title: "헬스장 OT", time: "19:00", participants: ["love"] },
    ],
    "2026-03-23": [
      { title: "오늘 일정 체크", time: "09:00", participants: ["all"] },
      { title: "오전 팀 회의", time: "10:00", participants: ["me"] },
      { title: "카페 미팅", time: "15:00", participants: ["love"] },
    ],
    "2026-03-24": [
      { title: "차량 점검 예약", time: "10:30", participants: ["me"] },
      { title: "퇴근 후 약국", time: "18:40", participants: ["love"] },
    ],
    "2026-03-27": [
      { title: "주말 여행 계획 회의", time: "20:00", participants: ["all"] },
    ],
    "2026-03-30": [
      { title: "월말 예산 정리", time: "21:00", participants: ["all"] },
    ],
  },
};

const state = loadState();

const loginScreen = document.getElementById("loginScreen");
const appScreen = document.getElementById("appScreen");
const loginChoices = document.getElementById("loginChoices");
const activeUserLabel = document.getElementById("activeUserLabel");
const todayTitle = document.getElementById("todayTitle");
const memoText = document.getElementById("memoText");
const memoContent = document.getElementById("memoContent");
const memoScrollHint = document.getElementById("memoScrollHint");
const memoToggleButton = document.getElementById("memoToggleButton");
const taskColumns = document.getElementById("taskColumns");
const membersTitle = document.getElementById("membersTitle");
const prevDayCard = document.getElementById("prevDayCard");
const nextDayCard = document.getElementById("nextDayCard");
const prevDayButton = document.getElementById("prevDayButton");
const nextDayButton = document.getElementById("nextDayButton");
const tabButtons = document.querySelectorAll(".tab-button");
const overviewPanel = document.getElementById("overviewPanel");
const calendarPanel = document.getElementById("calendarPanel");
const todayPanel = document.querySelector(".today-panel");
const weekdays = document.getElementById("weekdays");
const calendarGrid = document.getElementById("calendarGrid");
const calendarTitle = document.getElementById("calendarTitle");
const calendarLegend = document.getElementById("calendarLegend");
const prevMonthButton = document.getElementById("prevMonthButton");
const nextMonthButton = document.getElementById("nextMonthButton");
const selectedDateTitle = document.getElementById("selectedDateTitle");
const selectedEvents = document.getElementById("selectedEvents");
const settingsModal = document.getElementById("settingsModal");
const openSettingsButton = document.getElementById("openSettingsButton");
const closeSettingsButton = document.getElementById("closeSettingsButton");
const todoComposerModal = document.getElementById("todoComposerModal");
const todoComposerForm = document.getElementById("todoComposerForm");
const todoTitleInput = document.getElementById("todoTitleInput");
const todoParticipantList = document.getElementById("todoParticipantList");
const closeTodoComposerButton = document.getElementById("closeTodoComposerButton");
const cancelTodoComposerButton = document.getElementById("cancelTodoComposerButton");
const inviteUserButton = document.getElementById("inviteUserButton");
const leaveCalendarButton = document.getElementById("leaveCalendarButton");
const inviteLimitText = document.getElementById("inviteLimitText");
const fixedOwnerCard = document.getElementById("fixedOwnerCard");
const sortList = document.getElementById("sortList");
const colorList = document.getElementById("colorList");

attachDragScroll(memoContent, () => {
  const card = memoContent.closest(".memo-card");
  if (!card) return;
  updateScrollableHint(card, memoContent, memoScrollHint, {
    moreTop: "drag up to view more",
    moreBottom: "drag down to view previous",
    middle: "drag up/down to browse",
  });
});

prevDayButton.addEventListener("click", () => moveDay(-1));
nextDayButton.addEventListener("click", () => moveDay(1));
prevDayCard.addEventListener("click", () => moveDay(-1));
nextDayCard.addEventListener("click", () => moveDay(1));
prevMonthButton.addEventListener("click", () => moveMonth(-1));
nextMonthButton.addEventListener("click", () => moveMonth(1));
openSettingsButton.addEventListener("click", openSettings);
closeSettingsButton.addEventListener("click", closeSettings);
settingsModal.addEventListener("click", (event) => {
  if (event.target === settingsModal) closeSettings();
});
closeTodoComposerButton.addEventListener("click", closeTodoComposer);
cancelTodoComposerButton.addEventListener("click", closeTodoComposer);
todoComposerModal.addEventListener("click", (event) => {
  if (event.target === todoComposerModal) closeTodoComposer();
});
todoComposerForm.addEventListener("submit", submitTodoComposer);
inviteUserButton.addEventListener("click", inviteUser);
leaveCalendarButton.addEventListener("click", leaveCalendar);
window.addEventListener("resize", updateOverviewOverflowControls);

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.activeTab = button.dataset.tab;
    saveState();
    renderTabs();
  });
});

renderLoginChoices();
renderAppVisibility();
renderAll();

function loadState() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultState);

  try {
    const parsed = JSON.parse(saved);
    return mergeState(parsed);
  } catch (error) {
    return structuredClone(defaultState);
  }
}

function mergeState(saved) {
  const merged = structuredClone(defaultState);
  merged.users = Array.isArray(saved.users) && saved.users.length ? saved.users : merged.users;
  merged.activeUserId = saved.activeUserId || merged.activeUserId;
  merged.currentOffset = Number.isInteger(saved.currentOffset) ? saved.currentOffset : merged.currentOffset;
  merged.selectedDate = saved.selectedDate || merged.selectedDate;
  merged.activeTab = saved.activeTab || merged.activeTab;
  merged.daily = saved.daily || merged.daily;
  merged.events = saved.events || merged.events;
  merged.boardOrderByUser = saved.boardOrderByUser || merged.boardOrderByUser;
  syncBoardOrders(merged);
  if (merged.activeUserId && !getUserById(merged.activeUserId, merged.users)) {
    merged.activeUserId = merged.users[0]?.id || null;
  }
  return merged;
}

function saveState() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getUserById(userId, sourceUsers = state.users) {
  return sourceUsers.find((user) => user.id === userId) || null;
}

function getActiveUser() {
  return getUserById(state.activeUserId);
}

function getBaseDate() {
  return new Date(`${BASE_DATE_KEY}T00:00:00`);
}

function getDateByOffset(offset) {
  const date = getBaseDate();
  date.setDate(date.getDate() + offset);
  return date;
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatHeadline(date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${dayNames[date.getDay()]}요일`;
}

function getDailyData(key) {
  if (!state.daily[key]) {
    state.daily[key] = { memo: "등록된 메모가 없습니다. 이 날의 공통 메모를 추가해 보세요.", tasks: {} };
  }
  state.users.forEach((user) => {
    if (!Array.isArray(state.daily[key].tasks[user.id])) {
      state.daily[key].tasks[user.id] = ["등록된 할 일이 없습니다."];
    }
  });
  return state.daily[key];
}

function syncBoardOrders(targetState) {
  const allUserIds = targetState.users.map((user) => user.id);
  allUserIds.forEach((ownerId) => {
    const others = allUserIds.filter((id) => id !== ownerId);
    const existing = Array.isArray(targetState.boardOrderByUser[ownerId]) ? targetState.boardOrderByUser[ownerId] : [];
    const filtered = existing.filter((id) => others.includes(id));
    const missing = others.filter((id) => !filtered.includes(id));
    targetState.boardOrderByUser[ownerId] = [...filtered, ...missing];
  });
}

function getBoardOrderForActiveUser() {
  const activeUser = getActiveUser();
  if (!activeUser) return [];
  syncBoardOrders(state);
  const others = state.boardOrderByUser[activeUser.id].map((id) => getUserById(id)).filter(Boolean);
  return [activeUser, ...others];
}

function setActiveUser(userId) {
  state.activeUserId = userId;
  state.currentOffset = 0;
  state.activeTab = "overview";
  saveState();
  renderAppVisibility();
  renderAll();
}

function renderLoginChoices() {
  loginChoices.innerHTML = "";
  state.users.forEach((user, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-card";
    button.innerHTML = `
      <span class="choice-badge" style="background:${user.color}">${index === 0 ? "OWNER" : `USER ${index + 1}`}</span>
      <strong>${user.name}</strong>
      <small>${user.name}로 보드와 캘린더 보기</small>
    `;
    button.addEventListener("click", () => setActiveUser(user.id));
    loginChoices.appendChild(button);
  });
}

function renderAppVisibility() {
  const hasActiveUser = Boolean(getActiveUser());
  loginScreen.classList.toggle("active", !hasActiveUser);
  appScreen.classList.toggle("active", hasActiveUser);
}

function moveDay(delta) {
  state.currentOffset += delta;
  todayPanel.classList.remove("slide-left", "slide-right");
  void todayPanel.offsetWidth;
  todayPanel.classList.add(delta > 0 ? "slide-left" : "slide-right");
  saveState();
  renderOverview();
}

function moveMonth(delta) {
  const selected = new Date(`${state.selectedDate}T00:00:00`);
  selected.setMonth(selected.getMonth() + delta, 1);
  state.selectedDate = toDateKey(selected);
  saveState();
  renderCalendar();
  renderSelectedEvents();
}

function renderTabs() {
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === state.activeTab);
  });
  overviewPanel.classList.toggle("active", state.activeTab === "overview");
  calendarPanel.classList.toggle("active", state.activeTab === "calendar");
}

function setMiniCard(element, label, date) {
  const key = toDateKey(date);
  const info = getDailyData(key);
  element.innerHTML = `
    <span class="mini-label">${label}</span>
    <strong>${date.getDate()}일</strong>
    <span>${info.memo}</span>
  `;
}

function renderOverview() {
  const activeUser = getActiveUser();
  if (!activeUser) return;

  const currentDate = getDateByOffset(state.currentOffset);
  const currentKey = toDateKey(currentDate);
  const info = getDailyData(currentKey);
  const orderedUsers = getBoardOrderForActiveUser();

  activeUserLabel.textContent = activeUser.name;
  todayTitle.textContent = formatHeadline(currentDate);
  memoText.textContent = info.memo;
  memoContent.scrollTop = 0;
  memoToggleButton.classList.add("hidden");
  membersTitle.textContent = `${orderedUsers.length}명의 오늘 TODO`;

  taskColumns.innerHTML = "";
  orderedUsers.forEach((user, index) => {
    const tasks = info.tasks[user.id] || ["등록된 할 일이 없습니다."];
    const article = document.createElement("article");
    article.className = "task-card";
    article.style.borderTopColor = user.color;
    const addButtonHtml = index === 0
      ? `<div class="task-card-tools"><button class="task-add-button" type="button" data-action="add-todo" aria-label="오늘 TODO 추가">+</button></div>`
      : "";
    article.innerHTML = `
      <div class="task-card-head">
        <div class="task-user">
          <span class="task-dot" style="background:${user.color}"></span>
          <div>
            <h4>${user.name}</h4>
            <p class="task-role">${index === 0 ? "내 보드" : `${index + 1}번째 표시`}</p>
          </div>
        </div>
        ${addButtonHtml}
      </div>
    `;

    const list = document.createElement("ul");
    list.className = "task-list";
    tasks.forEach((task) => {
      const item = document.createElement("li");
      item.textContent = task;
      list.appendChild(item);
    });
    const scrollHint = document.createElement("div");
    scrollHint.className = "task-scroll-hint";
    scrollHint.textContent = "drag up/down to view more";

    article.appendChild(list);
    article.appendChild(scrollHint);
    attachDragScroll(list, () => updateTaskScrollHint(article, list, scrollHint));
    if (index === 0) {
      article.querySelector('[data-action="add-todo"]').addEventListener("click", openTodoComposer);
    }
    taskColumns.appendChild(article);
  });

  setMiniCard(prevDayCard, "어제", getDateByOffset(state.currentOffset - 1));
  setMiniCard(nextDayCard, "내일", getDateByOffset(state.currentOffset + 1));
  requestAnimationFrame(updateOverviewOverflowControls);
}

function updateOverviewOverflowControls() {
  if (!getActiveUser()) return;

  const memoCard = memoContent.closest(".memo-card");
  if (memoCard) {
    updateScrollableHint(memoCard, memoContent, memoScrollHint, {
      moreTop: "drag up to view more",
      moreBottom: "drag down to view previous",
      middle: "drag up/down to browse",
    });
  }
  taskColumns.querySelectorAll(".task-card").forEach((card) => {
    const list = card.querySelector(".task-list");
    const hint = card.querySelector(".task-scroll-hint");
    if (!list || !hint) return;
    updateTaskScrollHint(card, list, hint);
  });
}

function attachDragScroll(element, onScrollUpdate) {
  let startY = 0;
  let startScrollTop = 0;
  let dragging = false;
  let pointerId = null;
  let frameId = 0;

  const scheduleUpdate = () => {
    if (frameId) return;
    frameId = requestAnimationFrame(() => {
      frameId = 0;
      onScrollUpdate();
    });
  };

  const startDrag = (clientY, nextPointerId = null) => {
    if (element.scrollHeight <= element.clientHeight + 1) return false;
    dragging = true;
    startY = clientY;
    startScrollTop = element.scrollTop;
    pointerId = nextPointerId;
    return true;
  };

  const moveDrag = (clientY) => {
    if (!dragging) return;
    const delta = clientY - startY;
    element.scrollTop = startScrollTop - delta;
  };

  const endDrag = () => {
    dragging = false;
    pointerId = null;
  };

  element.addEventListener("pointerdown", (event) => {
    if (!startDrag(event.clientY, event.pointerId)) return;
    element.setPointerCapture(event.pointerId);
  });
  element.addEventListener("pointermove", (event) => {
    if (pointerId !== event.pointerId) return;
    moveDrag(event.clientY);
  });
  element.addEventListener("pointerup", endDrag);
  element.addEventListener("pointercancel", endDrag);
  element.addEventListener("lostpointercapture", endDrag);
  element.addEventListener("scroll", scheduleUpdate, { passive: true });
}

function updateTaskScrollHint(card, list, hint) {
  updateScrollableHint(card, list, hint, {
    moreTop: "drag up to view more",
    moreBottom: "drag down to view previous",
    middle: "drag up/down to browse",
  });
}

function updateScrollableHint(card, element, hint, textSet) {
  const isOverflowing = element.scrollHeight > element.clientHeight + 1;
  card.classList.toggle("is-scrollable", isOverflowing);
  if (!isOverflowing) {
    if (hint.textContent !== "") hint.textContent = "";
    return;
  }

  const atTop = element.scrollTop <= 2;
  const atBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 2;
  let nextText = textSet.middle;
  if (atTop && !atBottom) {
    nextText = textSet.moreTop;
  } else if (!atTop && atBottom) {
    nextText = textSet.moreBottom;
  }
  if (hint.textContent !== nextText) hint.textContent = nextText;
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

function openSettings() {
  renderSettings();
  settingsModal.classList.remove("hidden");
}

function closeSettings() {
  settingsModal.classList.add("hidden");
}

function openTodoComposer() {
  const activeUser = getActiveUser();
  if (!activeUser) return;

  todoTitleInput.value = "";
  todoParticipantList.innerHTML = "";

  state.users.forEach((user, index) => {
    const option = document.createElement("label");
    option.className = "participant-option";
    option.innerHTML = `
      <input type="checkbox" name="participants" value="${user.id}" ${user.id === activeUser.id ? "checked" : ""}>
      <span class="color-swatch" style="background:${user.color}"></span>
      <span>${user.name}</span>
    `;
    todoParticipantList.appendChild(option);
  });

  todoComposerModal.classList.remove("hidden");
  requestAnimationFrame(() => todoTitleInput.focus());
}

function closeTodoComposer() {
  todoComposerModal.classList.add("hidden");
  todoComposerForm.reset();
}

function submitTodoComposer(event) {
  event.preventDefault();

  const activeUser = getActiveUser();
  if (!activeUser) return;

  const currentDate = getDateByOffset(state.currentOffset);
  const currentKey = toDateKey(currentDate);
  const info = getDailyData(currentKey);
  const title = todoTitleInput.value.trim();
  if (!title) {
    todoTitleInput.focus();
    return;
  }

  const participants = [...todoComposerForm.querySelectorAll('input[name="participants"]:checked')]
    .map((input) => input.value);
  const normalizedParticipants = participants.length ? participants : [activeUser.id];

  const currentTasks = info.tasks[activeUser.id] || [];
  const nextTasks = currentTasks.length === 1 && currentTasks[0] === "등록된 할 일이 없습니다."
    ? [title]
    : [...currentTasks, title];
  info.tasks[activeUser.id] = nextTasks;

  if (!Array.isArray(state.events[currentKey])) {
    state.events[currentKey] = [];
  }

  state.events[currentKey].push({
    title,
    time: "TODO",
    participants: normalizedParticipants,
  });

  if (state.selectedDate === currentKey) {
    renderSelectedEvents();
  }

  saveState();
  closeTodoComposer();
  renderAll();
}

function inviteUser() {
  if (state.users.length >= MAX_USERS) {
    window.alert("최대 4명까지만 사용할 수 있습니다.");
    renderSettings();
    return;
  }

  const input = window.prompt("초대할 사용자 아이디를 입력하세요.");
  if (!input) return;

  const trimmed = input.trim();
  if (!trimmed) return;
  if (state.users.some((user) => user.name === trimmed)) {
    window.alert("이미 추가된 사용자입니다.");
    return;
  }

  const nextId = createUserId(trimmed);
  const palette = ["#e28f35", "#8b5cf6", "#2aa876", "#d84c8a"];
  const color = palette[state.users.length - 1] || "#e28f35";

  state.users.push({ id: nextId, name: trimmed, color });
  Object.values(state.daily).forEach((entry) => {
    if (!Array.isArray(entry.tasks[nextId])) entry.tasks[nextId] = ["새 사용자 일정이 아직 없습니다."];
  });
  syncBoardOrders(state);
  saveState();
  renderLoginChoices();
  renderAll();
  renderSettings();
}

function createUserId(name) {
  const base = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-가-힣]/g, "") || `user-${Date.now()}`;
  let candidate = base;
  let suffix = 1;
  while (state.users.some((user) => user.id === candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

function leaveCalendar() {
  const activeUser = getActiveUser();
  if (!activeUser) return;
  if (state.users.length === 1) {
    window.alert("마지막 사용자는 나갈 수 없습니다.");
    return;
  }

  const confirmed = window.confirm(`${activeUser.name} 사용자를 이 보드에서 나가게 할까요?`);
  if (!confirmed) return;

  state.users = state.users.filter((user) => user.id !== activeUser.id);
  Object.values(state.daily).forEach((entry) => {
    delete entry.tasks[activeUser.id];
  });
  Object.keys(state.events).forEach((dateKey) => {
    state.events[dateKey] = state.events[dateKey]
      .map((event) => ({
        ...event,
        participants: event.participants.filter((participantId) => participantId !== activeUser.id),
      }))
      .filter((event) => event.participants.length > 0);
  });

  delete state.boardOrderByUser[activeUser.id];
  syncBoardOrders(state);
  state.activeUserId = null;
  closeSettings();
  saveState();
  renderLoginChoices();
  renderAppVisibility();
  renderAll();
}

function renderSettings() {
  const activeUser = getActiveUser();
  if (!activeUser) return;

  inviteLimitText.textContent = `${state.users.length} / ${MAX_USERS}명 사용 중`;
  inviteLimitText.classList.toggle("warning", state.users.length >= MAX_USERS);
  inviteUserButton.disabled = state.users.length >= MAX_USERS;
  fixedOwnerCard.innerHTML = `
    <span class="color-swatch" style="background:${activeUser.color}"></span>
    <strong>${activeUser.name}</strong>
    <span class="task-role">항상 첫 번째</span>
  `;

  renderSortList(activeUser);
  renderColorList();
}

function renderSortList(activeUser) {
  sortList.innerHTML = "";
  const others = state.boardOrderByUser[activeUser.id].map((id) => getUserById(id)).filter(Boolean);

  if (!others.length) {
    sortList.innerHTML = `<div class="empty-state">순서를 조정할 다른 사용자가 아직 없습니다.</div>`;
    return;
  }

  others.forEach((user) => {
    const item = document.createElement("div");
    item.className = "sortable-item";
    item.draggable = true;
    item.dataset.userId = user.id;
    item.innerHTML = `
      <div class="drag-label">
        <span class="color-swatch" style="background:${user.color}"></span>
        <strong>${user.name}</strong>
      </div>
      <span class="drag-handle">DRAG</span>
    `;
    attachSortEvents(item, activeUser.id);
    sortList.appendChild(item);
  });
}

function attachSortEvents(item, ownerId) {
  item.addEventListener("dragstart", () => {
    item.classList.add("dragging");
  });

  item.addEventListener("dragend", () => {
    item.classList.remove("dragging");
    state.boardOrderByUser[ownerId] = [...sortList.querySelectorAll(".sortable-item")].map((node) => node.dataset.userId);
    saveState();
    renderOverview();
  });

  item.addEventListener("dragover", (event) => {
    event.preventDefault();
    const dragging = sortList.querySelector(".dragging");
    if (!dragging || dragging === item) return;
    const rect = item.getBoundingClientRect();
    const before = event.clientY < rect.top + rect.height / 2;
    sortList.insertBefore(dragging, before ? item : item.nextSibling);
  });
}

function renderColorList() {
  colorList.innerHTML = "";
  state.users.forEach((user) => {
    const row = document.createElement("div");
    row.className = "color-item";
    row.innerHTML = `
      <div class="color-user">
        <span class="color-swatch" style="background:${user.color}"></span>
        <strong>${user.name}</strong>
      </div>
      <input class="color-input" type="color" value="${user.color}" aria-label="${user.name} 색상">
    `;
    row.querySelector("input").addEventListener("input", (event) => {
      user.color = event.target.value;
      saveState();
      renderLoginChoices();
      renderAll();
    });
    colorList.appendChild(row);
  });
}

function hexToSoft(hex) {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((char) => char + char).join("") : value;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, 0.14)`;
}

function renderAll() {
  renderTabs();
  renderWeekdays();
  renderLegend();
  if (!getActiveUser()) return;
  syncBoardOrders(state);
  renderOverview();
  renderCalendar();
  renderSelectedEvents();
}

