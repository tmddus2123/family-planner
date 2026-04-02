renderShell();

const STORAGE_KEY = "toyProjectSharedCalendarState";
const MAX_USERS = 4;
const BASE_DATE_KEY = "2026-03-23";
const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

const defaultState = {
  users: [
    { id: "me", username: "me", password: "1234", name: "나", color: "#d46a6a" },
    { id: "love", username: "love", password: "1234", name: "애인", color: "#4f7cff" },
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
const loginForm = document.getElementById("loginForm");
const loginCard = document.getElementById("loginCard");
const kakaoLoginButton = document.getElementById("kakaoLoginButton");
const loginFeedback = document.getElementById("loginFeedback");
const activeUserLabel = document.getElementById("activeUserLabel");
const todayTitle = document.getElementById("todayTitle");
const memoText = document.getElementById("memoText");
const memoContent = document.getElementById("memoContent");
const memoScrollHint = document.getElementById("memoScrollHint");
const memoEditor = document.getElementById("memoEditor");
const memoEditButton = document.getElementById("memoEditButton");
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
const todoComposerSubmitButton = document.getElementById("todoComposerSubmitButton");
const closeTodoComposerButton = document.getElementById("closeTodoComposerButton");
const cancelTodoComposerButton = document.getElementById("cancelTodoComposerButton");
const logoutButton = document.getElementById("logoutButton");
const shareKakaoButton = document.getElementById("shareKakaoButton");
const inviteUserButton = document.getElementById("inviteUserButton");
const leaveCalendarButton = document.getElementById("leaveCalendarButton");
const inviteLimitText = document.getElementById("inviteLimitText");
const fixedOwnerCard = document.getElementById("fixedOwnerCard");
const sortList = document.getElementById("sortList");
const colorList = document.getElementById("colorList");

let isEditingMemo = false;
let todoEditContext = null;

function renderShell() {
  const screenRoot = document.getElementById("screenRoot");
  if (!screenRoot) return;
  screenRoot.innerHTML = `
    <div class="app-shell" id="appShell">
      ${window.LOGIN_SCREEN_TEMPLATE || ""}
      ${window.APP_SCREEN_TEMPLATE || ""}
    </div>
    ${window.MODAL_SCREEN_TEMPLATE || ""}
  `;
}

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
  merged.users = merged.users.map((user, index) => ({
    ...user,
    username: user.username || user.id || `user${index + 1}`,
    password: user.password || "1234",
  }));
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

function renderAppVisibility() {
  const hasActiveUser = Boolean(getActiveUser());
  loginScreen.classList.toggle("active", !hasActiveUser);
  appScreen.classList.toggle("active", hasActiveUser);
}

function renderTabs() {
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === state.activeTab);
  });
  overviewPanel.classList.toggle("active", state.activeTab === "overview");
  calendarPanel.classList.toggle("active", state.activeTab === "calendar");
}

function syncModalBodyLock() {
  const hasOpenModal =
    !settingsModal.classList.contains("hidden") ||
    !todoComposerModal.classList.contains("hidden");
  document.body.classList.toggle("modal-open", hasOpenModal);
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

function initializeApp() {
  attachDragScroll(memoContent, () => {
    const card = memoContent.closest(".memo-card");
    if (!card) return;
    updateScrollableHint(card, memoContent, memoScrollHint, {
      moreTop: "drag up to view more",
      moreBottom: "drag down to view previous",
      middle: "drag up/down to browse",
    });
  });

  memoEditButton.addEventListener("click", toggleMemoEdit);
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
  loginForm.addEventListener("submit", submitLogin);
  todoComposerForm.addEventListener("submit", submitTodoComposer);
  logoutButton.addEventListener("click", logout);
  shareKakaoButton.addEventListener("click", shareTodayViaKakaoTalk);
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

  renderAppVisibility();
  syncKakaoLoginState();
  renderAll();
}
