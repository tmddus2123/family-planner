window.LOGIN_SCREEN_TEMPLATE = `
  <section class="screen screen-login active" id="loginScreen">
    <div class="hero-card">
      <p class="eyebrow">Shared TODO & Calendar</p>
      <h1>Kakao login is the only sign-up path.</h1>
      <p class="hero-copy">
        Local username/password sign-up is disabled.
        The app creates or updates the internal user record from the Kakao profile on first login.
      </p>
      <div class="auth-layout">
        <section class="auth-card" id="loginCard">
          <p class="section-label">Kakao Login Only</p>
          <h3>Sign up and login are both restricted to Kakao account linking.</h3>
          <form class="auth-form" id="loginForm">
            <div class="kakao-guide">
              <strong>Required setup</strong>
              <p>Fill <code>js/config/kakao-config.js</code> with your JavaScript key and register the current site domain in Kakao Developers.</p>
            </div>
            <p class="auth-feedback" id="loginFeedback" aria-live="polite"></p>
            <div class="auth-actions">
              <button class="action-button auth-submit kakao-login-button" id="kakaoLoginButton" type="submit">Continue with Kakao</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  </section>
`;
