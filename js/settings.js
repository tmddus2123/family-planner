function openSettings() {
  renderSettings();
  settingsModal.classList.remove("hidden");
  syncModalBodyLock();
}

function closeSettings() {
  settingsModal.classList.add("hidden");
  syncModalBodyLock();
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
  const addedUser = state.users[state.users.length - 1];
  addedUser.username = nextId;
  addedUser.password = "1234";
  Object.values(state.daily).forEach((entry) => {
    if (!Array.isArray(entry.tasks[nextId])) entry.tasks[nextId] = ["새 사용자 일정이 아직 없습니다."];
  });
  syncBoardOrders(state);
  saveState();
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
      renderAll();
    });
    colorList.appendChild(row);
  });
}

initializeApp();
