function setActiveUser(userId) {
  state.activeUserId = userId;
  state.currentOffset = 0;
  state.activeTab = "overview";
  saveState();
  renderAppVisibility();
  renderAll();
}

function setFeedback(element, message, type = "") {
  if (!element) return;
  element.textContent = message;
  element.classList.remove("error", "success");
  if (type) element.classList.add(type);
}

function syncKakaoLoginState() {
  if (!isKakaoConfigured()) {
    setFeedback(loginFeedback, "Set the Kakao JavaScript key in js/config/kakao-config.js.", "error");
    if (kakaoLoginButton) kakaoLoginButton.disabled = true;
    return;
  }

  try {
    ensureKakaoSdk();
    if (kakaoLoginButton) kakaoLoginButton.disabled = false;
    setFeedback(loginFeedback, "Login with Kakao to create or sync the internal user record.");
  } catch (error) {
    setFeedback(loginFeedback, error.message || "Failed to initialize the Kakao SDK.", "error");
    if (kakaoLoginButton) kakaoLoginButton.disabled = true;
  }
}

function createKakaoUserId(profile) {
  return `kakao-${profile.id}`;
}

function getNextUserColor() {
  const palette = ["#d46a6a", "#4f7cff", "#2aa876", "#e28f35"];
  return palette[state.users.length % palette.length];
}

function ensureKakaoUser(profile) {
  const userId = createKakaoUserId(profile);
  const nickname = profile.properties?.nickname || `kakao-${profile.id}`;
  const email = profile.kakao_account?.email || "";
  let user = state.users.find((entry) => entry.id === userId);

  if (!user) {
    if (state.users.length >= MAX_USERS) {
      throw new Error(`Only ${MAX_USERS} members are allowed.`);
    }

    user = {
      id: userId,
      username: email || userId,
      password: null,
      name: nickname,
      color: getNextUserColor(),
      authProvider: "kakao",
      kakaoId: profile.id,
      email,
      profileImage: profile.properties?.profile_image || "",
    };
    state.users.push(user);
    Object.values(state.daily).forEach((entry) => {
      if (!Array.isArray(entry.tasks[userId])) entry.tasks[userId] = ["No tasks yet."];
    });
  } else {
    user.username = email || user.username || userId;
    user.name = nickname;
    user.authProvider = "kakao";
    user.kakaoId = profile.id;
    user.email = email;
    user.profileImage = profile.properties?.profile_image || user.profileImage || "";
  }

  syncBoardOrders(state);
  saveState();
  return user;
}

async function submitLogin(event) {
  event.preventDefault();
  setFeedback(loginFeedback, "");

  try {
    const profile = await loginWithKakao();
    const user = ensureKakaoUser(profile);
    setActiveUser(user.id);
    setFeedback(loginFeedback, "Kakao account linking is complete.", "success");
  } catch (error) {
    const message = error?.message || "Kakao login failed.";
    setFeedback(loginFeedback, message, "error");
  }
}

async function shareTodayViaKakaoTalk() {
  const activeUser = getActiveUser();
  if (!activeUser) return;

  try {
    const template = buildTodayShareTemplate();
    await sendKakaoMemo(template);
    window.alert("Sent today's schedule to your KakaoTalk memo.");
  } catch (error) {
    const message = error?.message || "Failed to send the KakaoTalk message.";
    window.alert(message);
  }
}

function logout() {
  state.activeUserId = null;
  state.activeTab = "overview";
  closeSettings();
  closeTodoComposer();
  setFeedback(loginFeedback, "");
  saveState();
  renderAppVisibility();
  renderAll();

  try {
    const kakao = ensureKakaoSdk();
    if (kakao.Auth.getAccessToken()) {
      kakao.Auth.logout(() => {});
    }
  } catch (error) {
    // Ignore SDK teardown errors during local logout.
  }
}
