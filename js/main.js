function moveDay(delta) {
  state.currentOffset += delta;
  todayPanel.classList.remove("slide-left", "slide-right");
  void todayPanel.offsetWidth;
  todayPanel.classList.add(delta > 0 ? "slide-left" : "slide-right");
  saveState();
  renderOverview();
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
  memoEditor.value = info.memo;
  memoText.classList.toggle("hidden", isEditingMemo);
  memoEditor.classList.toggle("hidden", !isEditingMemo);
  memoEditButton.innerHTML = isEditingMemo ? "&#10003;" : "&#9998;";
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
    tasks.forEach((task, taskIndex) => {
      const item = document.createElement("li");
      item.textContent = task;
      item.addEventListener("click", () => openTodoComposer({
        mode: "edit",
        userId: user.id,
        taskIndex,
        title: task,
        participants: findTodoEventParticipants(currentKey, task, user.id),
      }));
      list.appendChild(item);
    });

    const scrollHint = document.createElement("div");
    scrollHint.className = "task-scroll-hint";
    scrollHint.setAttribute("aria-hidden", "true");

    article.appendChild(list);
    article.appendChild(scrollHint);
    attachDragScroll(list, () => updateTaskScrollHint(article, list, scrollHint));
    if (index === 0) {
      article.querySelector('[data-action="add-todo"]').addEventListener("click", () => openTodoComposer());
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
  element.addEventListener("scroll", onScrollUpdate, { passive: true });
}

function updateTaskScrollHint(card, list, hint) {
  const isOverflowing = list.scrollHeight > list.clientHeight + 1;
  card.classList.toggle("is-scrollable", isOverflowing);
  hint.textContent = isOverflowing ? "↓" : "";
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

function toggleMemoEdit() {
  const activeUser = getActiveUser();
  if (!activeUser) return;

  const currentKey = toDateKey(getDateByOffset(state.currentOffset));
  const info = getDailyData(currentKey);

  if (!isEditingMemo) {
    isEditingMemo = true;
    memoEditor.value = info.memo;
    renderOverview();
    requestAnimationFrame(() => memoEditor.focus());
    return;
  }

  info.memo = memoEditor.value.trim() || "등록된 메모가 없습니다. 이 날의 공통 메모를 추가해 보세요.";
  isEditingMemo = false;
  saveState();
  renderAll();
}

function findTodoEventParticipants(dateKey, title, userId) {
  const matched = (state.events[dateKey] || []).find((event) => (
    event.time === "TODO" &&
    event.title === title &&
    event.participants.includes(userId)
  ));
  return matched?.participants || [userId];
}

function openTodoComposer(options = null) {
  const activeUser = getActiveUser();
  if (!activeUser) return;
  todoEditContext = options?.mode === "edit" ? options : null;

  todoTitleInput.value = options?.title || "";
  todoParticipantList.innerHTML = "";
  todoComposerSubmitButton.textContent = todoEditContext ? "수정" : "추가";

  state.users.forEach((user) => {
    const selectedParticipants = options?.participants || [activeUser.id];
    const option = document.createElement("label");
    option.className = "participant-option";
    option.innerHTML = `
      <input type="checkbox" name="participants" value="${user.id}" ${selectedParticipants.includes(user.id) ? "checked" : ""}>
      <span class="color-swatch" style="background:${user.color}"></span>
      <span>${user.name}</span>
    `;
    todoParticipantList.appendChild(option);
  });

  todoComposerModal.classList.remove("hidden");
  syncModalBodyLock();
  requestAnimationFrame(() => todoTitleInput.focus());
}

function closeTodoComposer() {
  todoComposerModal.classList.add("hidden");
  todoComposerForm.reset();
  todoEditContext = null;
  todoComposerSubmitButton.textContent = "추가";
  syncModalBodyLock();
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

  if (!Array.isArray(state.events[currentKey])) {
    state.events[currentKey] = [];
  }

  if (todoEditContext) {
    const ownerTasks = info.tasks[todoEditContext.userId] || [];
    if (ownerTasks[todoEditContext.taskIndex] !== undefined) {
      ownerTasks[todoEditContext.taskIndex] = title;
    }

    const matchedEvent = (state.events[currentKey] || []).find((item) => (
      item.time === "TODO" &&
      item.title === todoEditContext.title &&
      item.participants.includes(todoEditContext.userId)
    ));
    if (matchedEvent) {
      matchedEvent.title = title;
      matchedEvent.participants = normalizedParticipants;
    }
  } else {
    const currentTasks = info.tasks[activeUser.id] || [];
    const nextTasks = currentTasks.length === 1 && currentTasks[0] === "등록된 할 일이 없습니다."
      ? [title]
      : [...currentTasks, title];
    info.tasks[activeUser.id] = nextTasks;

    state.events[currentKey].push({
      title,
      time: "TODO",
      participants: normalizedParticipants,
    });
  }

  if (state.selectedDate === currentKey) {
    renderSelectedEvents();
  }

  saveState();
  closeTodoComposer();
  renderAll();
}
