window.APP_SCREEN_TEMPLATE = `
  <section class="screen screen-app" id="appScreen">
    <div class="app-card">
      <header class="topbar">
        <div>
          <p class="eyebrow">Our Space</p>
          <h2><span id="activeUserLabel"></span>'s shared board</h2>
        </div>

        <div class="topbar-actions">
          <nav class="tab-row">
            <button class="tab-button active" data-tab="overview" type="button">Main</button>
            <button class="tab-button" data-tab="calendar" type="button">Calendar</button>
          </nav>
          <button class="action-button share-button" id="shareKakaoButton" type="button">Send today via KakaoTalk</button>
          <button class="settings-button" id="openSettingsButton" type="button">Settings</button>
        </div>
      </header>

      <main>
        <section class="tab-panel active" id="overviewPanel">
          <div class="date-strip">
            <button class="mini-day-card" id="prevDayCard" type="button"></button>

            <section class="today-panel">
              <div class="today-head">
                <button class="nav-arrow" id="prevDayButton" type="button" aria-label="View previous day">&lt;</button>
                <div>
                  <p class="day-label">Today Board</p>
                  <h3 id="todayTitle"></h3>
                </div>
                <button class="nav-arrow" id="nextDayButton" type="button" aria-label="View next day">&gt;</button>
              </div>

              <div class="memo-card">
                <p class="section-label">Shared Memo</p>
                <div class="memo-head">
                  <p class="section-label">Shared Memo</p>
                  <button class="memo-edit-button" id="memoEditButton" type="button" aria-label="Edit shared memo">&#9998;</button>
                </div>
                <div class="memo-content" id="memoContent">
                  <p id="memoText"></p>
                  <textarea class="memo-editor hidden" id="memoEditor"></textarea>
                </div>
                <div class="memo-scroll-hint" id="memoScrollHint">drag up/down to view more</div>
                <button class="expand-button hidden" id="memoToggleButton" type="button" aria-expanded="false">more v</button>
              </div>

              <div class="members-head">
                <div>
                  <p class="section-label">Today Tasks</p>
                  <h4 id="membersTitle">Member TODO</h4>
                </div>
                <p class="members-help">The owner card stays fixed first. Change the rest of the display order in settings.</p>
              </div>

              <div class="task-columns" id="taskColumns"></div>
            </section>

            <button class="mini-day-card" id="nextDayCard" type="button"></button>
          </div>
        </section>

        <section class="tab-panel" id="calendarPanel">
          <div class="calendar-layout">
            <section class="calendar-card">
              <div class="calendar-head">
                <div>
                  <p class="section-label">This Month</p>
                  <h3 id="calendarTitle"></h3>
                </div>
                <div class="calendar-tools">
                  <div class="calendar-nav">
                    <button class="calendar-nav-button" id="prevMonthButton" type="button" aria-label="View previous month">&lt;</button>
                    <button class="calendar-nav-button" id="nextMonthButton" type="button" aria-label="View next month">&gt;</button>
                  </div>
                  <div class="legend" id="calendarLegend"></div>
                </div>
              </div>
              <div class="weekdays" id="weekdays"></div>
              <div class="calendar-grid" id="calendarGrid"></div>
            </section>

            <aside class="schedule-card">
              <div class="schedule-head">
                <p class="section-label">Selected Date</p>
                <h3 id="selectedDateTitle"></h3>
              </div>
              <div id="selectedEvents" class="event-list"></div>
            </aside>
          </div>
        </section>
      </main>

      <div class="app-footer">
        <button class="action-button logout-button" id="logoutButton" type="button">Logout</button>
      </div>
    </div>
  </section>
`;
