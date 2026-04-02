window.MODAL_SCREEN_TEMPLATE = `
  <div class="modal-backdrop hidden" id="settingsModal">
    <section class="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
      <div class="modal-head">
        <div>
          <p class="eyebrow">Settings</p>
          <h3 id="settingsTitle">보드 설정</h3>
        </div>
        <button class="close-button" id="closeSettingsButton" type="button" aria-label="설정 닫기">×</button>
      </div>

      <div class="settings-grid">
        <section class="settings-card">
          <p class="section-label">사용자 초대</p>
          <h4>최대 4명까지 초대</h4>
          <p class="settings-copy">팝업 입력창에서 사용자 아이디를 입력하면 멤버에 추가됩니다.</p>
          <button class="action-button" id="inviteUserButton" type="button">사용자 초대</button>
          <p class="limit-text" id="inviteLimitText"></p>
        </section>

        <section class="settings-card">
          <p class="section-label">캘린더 나가기</p>
          <h4>현재 사용자만 나가기</h4>
          <p class="settings-copy">내보내기는 없고, 현재 로그인한 사용자만 이 보드에서 나갑니다.</p>
          <button class="action-button danger" id="leaveCalendarButton" type="button">나가기</button>
        </section>

        <section class="settings-card settings-wide">
          <p class="section-label">표시 순서</p>
          <h4>내 다음에 보일 사용자 순서</h4>
          <p class="settings-copy">내 카드는 고정입니다. 아래 목록을 드래그해서 나머지 사용자의 보드 표시 순서를 바꾸세요.</p>
          <div class="fixed-owner" id="fixedOwnerCard"></div>
          <div class="sort-list" id="sortList"></div>
        </section>

        <section class="settings-card settings-wide">
          <p class="section-label">색상 설정</p>
          <h4>사용자별 포인트 색상</h4>
          <p class="settings-copy">보드 카드, 캘린더 점, 일정 태그에 같은 색상을 사용합니다.</p>
          <div class="color-list" id="colorList"></div>
        </section>
      </div>
    </section>
  </div>

  <div class="modal-backdrop hidden" id="todoComposerModal">
    <section class="settings-modal todo-composer" role="dialog" aria-modal="true" aria-labelledby="todoComposerTitle">
      <div class="modal-head">
        <div>
          <p class="eyebrow">Today TODO</p>
          <h3 id="todoComposerTitle">오늘 일정 추가</h3>
        </div>
        <button class="close-button" id="closeTodoComposerButton" type="button" aria-label="일정 입력 닫기">×</button>
      </div>

      <form class="todo-form" id="todoComposerForm">
        <label class="todo-field">
          <span class="section-label">제목</span>
          <input class="todo-input" id="todoTitleInput" name="title" type="text" maxlength="60" placeholder="오늘 할 일 또는 일정 제목">
        </label>

        <fieldset class="todo-field todo-fieldset">
          <legend class="section-label">참석자</legend>
          <div class="participant-list" id="todoParticipantList"></div>
        </fieldset>

        <div class="todo-actions">
          <button class="settings-button" id="cancelTodoComposerButton" type="button">취소</button>
          <button class="action-button" id="todoComposerSubmitButton" type="submit">추가</button>
        </div>
      </form>
    </section>
  </div>
`;
