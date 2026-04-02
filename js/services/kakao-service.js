function getKakaoConfig() {
  return window.KAKAO_CONFIG || {};
}

function isKakaoConfigured() {
  const { javascriptKey } = getKakaoConfig();
  return Boolean(javascriptKey) && javascriptKey !== "REPLACE_WITH_YOUR_KAKAO_JAVASCRIPT_KEY";
}

function ensureKakaoSdk() {
  if (!window.Kakao) {
    throw new Error("Kakao SDK failed to load.");
  }

  const { javascriptKey } = getKakaoConfig();
  if (!isKakaoConfigured()) {
    throw new Error("Set js/config/kakao-config.js with your Kakao JavaScript key.");
  }

  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(javascriptKey);
  }

  return window.Kakao;
}

async function loginWithKakao() {
  const kakao = ensureKakaoSdk();
  const { scopes = [] } = getKakaoConfig();

  return new Promise((resolve, reject) => {
    kakao.Auth.login({
      scope: scopes.join(","),
      success: async () => {
        try {
          const profile = await requestKakaoProfile();
          resolve(profile);
        } catch (error) {
          reject(error);
        }
      },
      fail: reject,
    });
  });
}

async function requestKakaoProfile() {
  const kakao = ensureKakaoSdk();
  return kakao.API.request({
    url: "/v2/user/me",
  });
}

function createKakaoMemoTemplate({ title, description, mobileUrl, webUrl }) {
  return {
    object_type: "feed",
    content: {
      title,
      description,
      image_url: "https://developers.kakao.com/tool/resource/static/img/button/kakaotalksharing/kakaotalk_sharing_btn_small.png",
      link: {
        mobile_web_url: mobileUrl,
        web_url: webUrl,
      },
    },
    buttons: [
      {
        title: "보드 열기",
        link: {
          mobile_web_url: mobileUrl,
          web_url: webUrl,
        },
      },
    ],
  };
}

async function sendKakaoMemo(templateObject) {
  const kakao = ensureKakaoSdk();
  return kakao.API.request({
    url: "/v2/api/talk/memo/default/send",
    data: {
      template_object: JSON.stringify(templateObject),
    },
  });
}

function buildTodayShareTemplate() {
  const activeUser = getActiveUser();
  if (!activeUser) {
    throw new Error("Login is required.");
  }

  const currentDate = getDateByOffset(state.currentOffset);
  const currentKey = toDateKey(currentDate);
  const info = getDailyData(currentKey);
  const tasks = info.tasks[activeUser.id] || [];
  const taskSummary = tasks.slice(0, 3).join(", ") || "등록된 TODO가 없습니다.";
  const url = window.location.href;

  return createKakaoMemoTemplate({
    title: `${activeUser.name}님의 오늘 일정`,
    description: `${formatHeadline(currentDate)} · ${taskSummary}`,
    mobileUrl: url,
    webUrl: url,
  });
}
