import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_CONFIG } from "./supabase-config.js";

const PAGE_MODE = document.body.dataset.app || "student";

const BOARD_PATH = [
  { x: 30, y: 1180 },
  { x: 120, y: 1195 }, { x: 240, y: 1195 }, { x: 360, y: 1195 }, { x: 480, y: 1195 },
  { x: 600, y: 1195 }, { x: 720, y: 1195 }, { x: 840, y: 1195 }, { x: 940, y: 1200 },
  { x: 1080, y: 1195 }, { x: 1200, y: 1195 }, { x: 1320, y: 1195 }, { x: 1440, y: 1195 },
  { x: 1560, y: 1195 }, { x: 1680, y: 1195 }, { x: 1800, y: 1195 },
  { x: 1800, y: 1090 }, { x: 1790, y: 980 }, { x: 1670, y: 980 }, { x: 1550, y: 1010 },
  { x: 1320, y: 980 }, { x: 1200, y: 980 }, { x: 1080, y: 980 }, { x: 960, y: 980 },
  { x: 840, y: 980 }, { x: 720, y: 980 }, { x: 590, y: 1000 }, { x: 480, y: 980 },
  { x: 340, y: 980 }, { x: 125, y: 980 }, { x: 125, y: 880 },
  { x: 135, y: 785 }, { x: 250, y: 770 }, { x: 350, y: 770 }, { x: 480, y: 770 },
  { x: 600, y: 770 }, { x: 720, y: 770 }, { x: 840, y: 770 }, { x: 960, y: 770 },
  { x: 1080, y: 770 }, { x: 1210, y: 780 }, { x: 1330, y: 780 }, { x: 1440, y: 770 },
  { x: 1560, y: 770 }, { x: 1680, y: 770 }, { x: 1800, y: 770 },
  { x: 1790, y: 670 }, { x: 1780, y: 570 }, { x: 1660, y: 570 }, { x: 1540, y: 570 },
  { x: 1420, y: 570 }, { x: 1300, y: 570 }, { x: 1080, y: 570 }, { x: 950, y: 570 },
  { x: 825, y: 570 }, { x: 720, y: 570 }, { x: 600, y: 570 }, { x: 480, y: 570 },
  { x: 360, y: 570 }, { x: 240, y: 570 }, { x: 125, y: 570 },
  { x: 125, y: 370 }, { x: 240, y: 370 }, { x: 360, y: 370 }, { x: 480, y: 370 },
  { x: 580, y: 330 }, { x: 720, y: 370 }, { x: 840, y: 370 }, { x: 1080, y: 370 },
  { x: 1190, y: 370 }, { x: 1300, y: 370 }, { x: 1440, y: 370 }, { x: 1560, y: 370 },
  { x: 1680, y: 370 }, { x: 1790, y: 370 }, { x: 1780, y: 250 }, { x: 1800, y: 160 },
  { x: 1680, y: 160 }, { x: 1550, y: 160 }, { x: 1420, y: 160 }, { x: 1290, y: 160 },
  { x: 1160, y: 160 }, { x: 1050, y: 160 }, { x: 930, y: 160 }, { x: 820, y: 160 },
  { x: 695, y: 160 }, { x: 590, y: 160 }, { x: 470, y: 160 }, { x: 350, y: 160 },
  { x: 260, y: 160 }, { x: 140, y: 45 }
];

const PLAYER_CLASS_COUNT = 11;
const STORAGE_KEYS = {
  studentSession: "boardgame-student-session",
  submittedAnswers: "boardgame-submitted-answers",
  projectorRoomCode: "boardgame-projector-room-code"
};

const byId = (id) => document.getElementById(id);

const dom = {
  configNotice: byId("configNotice"),
  screenLobby: byId("screenLobby"),
  screenRoom: byId("screenRoom"),
  adminDashboard: byId("adminDashboard"),
  adminSignInForm: byId("adminSignInForm"),
  adminSignUpButton: byId("adminSignUpButton"),
  adminEmail: byId("adminEmail"),
  adminPassword: byId("adminPassword"),
  createRoomForm: byId("createRoomForm"),
  roomTitleInput: byId("roomTitleInput"),
  firstCorrectBonusInput: byId("firstCorrectBonusInput"),
  adminRoomsList: byId("adminRoomsList"),
  studentJoinForm: byId("studentJoinForm"),
  studentRoomCode: byId("studentRoomCode"),
  studentName: byId("studentName"),
  projectorJoinForm: byId("projectorJoinForm"),
  projectorRoomCode: byId("projectorRoomCode"),
  signOutButton: byId("signOutButton"),
  roomTitleLabel: byId("roomTitleLabel"),
  roomCodeLabel: byId("roomCodeLabel"),
  roomStatusLabel: byId("roomStatusLabel"),
  questionPromptLabel: byId("questionPromptLabel"),
  questionMetaLabel: byId("questionMetaLabel"),
  studentAnswerForm: byId("studentAnswerForm"),
  studentAnswerInput: byId("studentAnswerInput"),
  studentAnswerState: byId("studentAnswerState"),
  leaderboardList: byId("leaderboardList"),
  uploadQuestionsForm: byId("uploadQuestionsForm"),
  questionsFileInput: byId("questionsFileInput"),
  questionsSummary: byId("questionsSummary"),
  questionsList: byId("questionsList"),
  adminQuestionBox: byId("adminQuestionBox"),
  adminPlayersList: byId("adminPlayersList"),
  finishGameButton: byId("finishGameButton"),
  roomCardTemplate: byId("roomCardTemplate"),
  circlesContainer: byId("circles-container"),
  openProjectorLink: byId("openProjectorLink")
};

const appState = {
  supabase: null,
  authUser: null,
  room: null,
  roomPlayers: [],
  questions: [],
  answers: [],
  participant: null,
  channel: null,
  currentRoomLookupCode: null
};

let circles = [];
let playerElements = new Map();

function hasDom(element) {
  return Boolean(element);
}

function isAdminPage() {
  return PAGE_MODE === "admin";
}

function isStudentPage() {
  return PAGE_MODE === "student";
}

function isProjectorPage() {
  return PAGE_MODE === "projector";
}

function showElement(element, shouldShow) {
  if (element) {
    element.classList.toggle("hidden", !shouldShow);
  }
}

function setMessage(element, message, visible = true) {
  if (!element) {
    return;
  }
  element.textContent = message;
  showElement(element, visible);
}

function isSupabaseConfigured() {
  return (
    SUPABASE_CONFIG &&
    typeof SUPABASE_CONFIG.url === "string" &&
    typeof SUPABASE_CONFIG.anonKey === "string" &&
    !SUPABASE_CONFIG.url.includes("YOUR_SUPABASE_URL") &&
    !SUPABASE_CONFIG.anonKey.includes("YOUR_SUPABASE_ANON_KEY")
  );
}

function normalizeAnswer(value) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatStatus(status) {
  switch (status) {
    case "lobby":
      return "Лобби";
    case "question":
      return "Вопрос открыт";
    case "review":
      return "Проверка";
    case "finished":
      return "Игра завершена";
    default:
      return status;
  }
}

function buildProjectorHref(roomCode) {
  return `./projector.html?room=${encodeURIComponent(roomCode)}`;
}

function saveStudentSession(roomCode, participant) {
  localStorage.setItem(
    STORAGE_KEYS.studentSession,
    JSON.stringify({
      roomCode,
      participantId: participant.id,
      participantName: participant.display_name
    })
  );
}

function loadStudentSession() {
  const raw = localStorage.getItem(STORAGE_KEYS.studentSession);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearStudentSession() {
  localStorage.removeItem(STORAGE_KEYS.studentSession);
}

function saveProjectorRoomCode(roomCode) {
  localStorage.setItem(STORAGE_KEYS.projectorRoomCode, roomCode);
}

function loadProjectorRoomCode() {
  return localStorage.getItem(STORAGE_KEYS.projectorRoomCode);
}

function clearProjectorRoomCode() {
  localStorage.removeItem(STORAGE_KEYS.projectorRoomCode);
}

function loadSubmittedAnswersMap() {
  const raw = localStorage.getItem(STORAGE_KEYS.submittedAnswers);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function persistSubmittedAnswer(roomCode, questionId) {
  const current = loadSubmittedAnswersMap();
  current[`${roomCode}:${questionId}`] = true;
  localStorage.setItem(STORAGE_KEYS.submittedAnswers, JSON.stringify(current));
}

function hasSubmittedAnswer(roomCode, questionId) {
  if (!roomCode || !questionId) {
    return false;
  }

  const current = loadSubmittedAnswersMap();
  return Boolean(current[`${roomCode}:${questionId}`]);
}

function createPath() {
  if (!hasDom(dom.circlesContainer)) {
    return;
  }

  const circleSize = 50;
  circles = [];
  dom.circlesContainer.innerHTML = "";

  let maxY = 0;

  BOARD_PATH.forEach((coord, index) => {
    const circle = document.createElement("div");
    circle.className = "circle";
    circle.style.left = `${coord.x}px`;
    circle.style.top = `${coord.y}px`;
    circle.textContent = String(index);
    dom.circlesContainer.appendChild(circle);
    circles.push({ element: circle, x: coord.x, y: coord.y });
    maxY = Math.max(maxY, coord.y);
  });

  dom.circlesContainer.style.height = `${maxY + circleSize * 3}px`;
}

function getPlayerClass(index) {
  return `player${(index % PLAYER_CLASS_COUNT) + 1}`;
}

function positionPlayerNearCircle(circle, playerElement, playerIndex, totalPlayers) {
  const radius = 42;
  const circleSize = 40;
  const angleInDegrees = -90 + (360 / Math.max(totalPlayers, 1)) * playerIndex;
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  const x = circle.x + (circleSize / 2) + radius * Math.cos(angleInRadians);
  const y = circle.y + (circleSize / 2) + radius * Math.sin(angleInRadians);
  playerElement.style.left = `${x - 20}px`;
  playerElement.style.top = `${y - 20}px`;
}

function ensurePlayerElements() {
  if (!hasDom(dom.circlesContainer)) {
    return;
  }

  const existing = new Set();

  appState.roomPlayers.forEach((player, index) => {
    existing.add(player.id);
    let element = playerElements.get(player.id);

    if (!element) {
      element = document.createElement("div");
      element.className = `player ${getPlayerClass(index)}`;
      dom.circlesContainer.appendChild(element);
      playerElements.set(player.id, element);
    }

    element.className = `player ${getPlayerClass(index)}`;
    element.title = `${player.display_name} · ${player.score}`;
  });

  [...playerElements.keys()].forEach((playerId) => {
    if (!existing.has(playerId)) {
      playerElements.get(playerId)?.remove();
      playerElements.delete(playerId);
    }
  });
}

function renderBoardPlayers() {
  if (!hasDom(dom.circlesContainer)) {
    return;
  }

  ensurePlayerElements();
  appState.roomPlayers.forEach((player, index) => {
    const element = playerElements.get(player.id);
    const position = Math.min(player.position || 0, circles.length - 1);
    const circle = circles[position] || circles[0];
    if (circle && element) {
      positionPlayerNearCircle(circle, element, index, appState.roomPlayers.length);
    }
  });
}

function renderLeaderboard() {
  if (!hasDom(dom.leaderboardList)) {
    return;
  }

  const sortedPlayers = [...appState.roomPlayers].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    return new Date(left.joined_at) - new Date(right.joined_at);
  });

  dom.leaderboardList.innerHTML = "";

  sortedPlayers.forEach((player, index) => {
    const item = document.createElement("article");
    item.className = "leaderboard-item";
    item.innerHTML = `
      <div class="leaderboard-rank">${index + 1}</div>
      <div class="leaderboard-body">
        <strong>${escapeHtml(player.display_name)}</strong>
        <span>${player.score} очк. · клетка ${player.position}</span>
      </div>
    `;
    dom.leaderboardList.appendChild(item);
  });
}

function getActiveQuestion() {
  if (!appState.room?.active_question_id) {
    return null;
  }

  return appState.questions.find((question) => question.id === appState.room.active_question_id) || null;
}

function hasStudentAnsweredCurrentQuestion() {
  if (!appState.participant || !appState.room?.active_question_id) {
    return false;
  }

  return hasSubmittedAnswer(appState.currentRoomLookupCode, appState.room.active_question_id);
}

function renderQuestionState() {
  if (!hasDom(dom.questionPromptLabel) || !appState.room) {
    return;
  }

  const room = appState.room;

  dom.questionPromptLabel.textContent = room.active_question_prompt || "Вопрос ещё не открыт";
  dom.questionMetaLabel.textContent = room.active_question_prompt
    ? `Стоимость: ${room.active_question_points || 0} очк.`
    : "Ожидание ведущего";

  if (!isStudentPage()) {
    return;
  }

  const showStudentAnswerForm =
    room.status === "question" &&
    room.active_question_id &&
    !hasStudentAnsweredCurrentQuestion();

  showElement(dom.studentAnswerForm, showStudentAnswerForm);

  if (room.status === "finished") {
    setMessage(dom.studentAnswerState, "Игра завершена. Итоги показаны в таблице.");
    return;
  }

  if (showStudentAnswerForm) {
    showElement(dom.studentAnswerState, false);
    return;
  }

  if (room.status === "question" && hasStudentAnsweredCurrentQuestion()) {
    setMessage(dom.studentAnswerState, "Ответ принят. Ожидайте завершения проверки.");
    return;
  }

  setMessage(dom.studentAnswerState, "Сейчас отправка ответов недоступна.");
}

function renderAdminQuestionBox() {
  if (!isAdminPage() || !hasDom(dom.adminQuestionBox) || !appState.room) {
    return;
  }

  const room = appState.room;
  const activeQuestion = getActiveQuestion();

  if (!activeQuestion || room.status !== "question") {
    dom.adminQuestionBox.innerHTML = `<div class="notice subtle">Сначала открой вопрос из списка.</div>`;
    return;
  }

  const currentAnswers = appState.answers
    .filter((answer) => answer.question_id === activeQuestion.id)
    .sort((left, right) => new Date(left.submitted_at) - new Date(right.submitted_at));

  const answersHtml = currentAnswers.length
    ? currentAnswers.map((answer) => {
        const player = appState.roomPlayers.find((candidate) => candidate.id === answer.player_id);
        return `
          <article class="answer-item">
            <strong>${escapeHtml(player?.display_name || "Игрок")}</strong>
            <span>${escapeHtml(answer.answer_text)}</span>
          </article>
        `;
      }).join("")
    : `<div class="notice subtle">Ответов пока нет.</div>`;

  dom.adminQuestionBox.innerHTML = `
    <div class="notice subtle">
      <strong>Правильный ответ:</strong> ${escapeHtml(activeQuestion.answer)}
    </div>
    <div class="notice subtle">
      <strong>Базовая стоимость:</strong> ${activeQuestion.points}
      · <strong>Бонус первому:</strong> ${room.first_correct_bonus}
    </div>
    <div class="stack">${answersHtml}</div>
    <div class="row">
      <button id="closeQuestionButton" type="button">Закрыть вопрос</button>
    </div>
  `;

  byId("closeQuestionButton")?.addEventListener("click", closeActiveQuestion);
}

function renderQuestionsList() {
  if (!isAdminPage() || !hasDom(dom.questionsList)) {
    return;
  }

  const total = appState.questions.length;
  const unused = appState.questions.filter((question) => !question.is_used).length;
  setMessage(dom.questionsSummary, `Всего вопросов: ${total}. Неиспользованных: ${unused}.`, total > 0);

  dom.questionsList.innerHTML = "";

  const sortedQuestions = [...appState.questions].sort((left, right) => left.sort_order - right.sort_order);

  sortedQuestions.forEach((question) => {
    const item = document.createElement("article");
    item.className = "list-card question-list-item";
    item.innerHTML = `
      <div>
        <h3 class="list-card-title">${escapeHtml(question.prompt)}</h3>
        <p class="list-card-meta">${question.points} очк. · ${question.is_used ? "использован" : "готов"}</p>
      </div>
      <button type="button" ${question.is_used || appState.room?.status === "question" ? "disabled" : ""}>Открыть</button>
    `;
    item.querySelector("button")?.addEventListener("click", () => openQuestion(question.id));
    dom.questionsList.appendChild(item);
  });
}

function renderAdminPlayers() {
  if (!isAdminPage() || !hasDom(dom.adminPlayersList)) {
    return;
  }

  dom.adminPlayersList.innerHTML = "";

  appState.roomPlayers.forEach((player) => {
    const item = document.createElement("article");
    item.className = "list-card player-admin-card";
    item.innerHTML = `
      <div>
        <h3 class="list-card-title">${escapeHtml(player.display_name)}</h3>
        <p class="list-card-meta">${player.score} очк. · клетка ${player.position}</p>
      </div>
      <div class="row compact-row">
        <button type="button" class="ghost-button">-1</button>
        <button type="button">+1</button>
      </div>
    `;

    const buttons = item.querySelectorAll("button");
    buttons[0]?.addEventListener("click", () => adjustPlayerScore(player.id, -1));
    buttons[1]?.addEventListener("click", () => adjustPlayerScore(player.id, 1));
    dom.adminPlayersList.appendChild(item);
  });
}

function renderRoomMeta() {
  if (!appState.room) {
    return;
  }

  if (hasDom(dom.roomTitleLabel)) {
    dom.roomTitleLabel.textContent = appState.room.title;
  }
  if (hasDom(dom.roomCodeLabel)) {
    dom.roomCodeLabel.textContent = appState.room.code;
  }
  if (hasDom(dom.roomStatusLabel)) {
    dom.roomStatusLabel.textContent = formatStatus(appState.room.status);
  }
  if (hasDom(dom.openProjectorLink)) {
    dom.openProjectorLink.href = buildProjectorHref(appState.room.code);
  }
}

function renderTopThreeIfFinished() {
  if (!appState.room || appState.room.status !== "finished" || !hasDom(dom.questionPromptLabel)) {
    return;
  }

  const topThree = Array.isArray(appState.room.winner_snapshot) ? appState.room.winner_snapshot : [];
  if (!topThree.length) {
    return;
  }

  const lines = topThree
    .map((player, index) => `${index + 1}. ${player.display_name} — ${player.score}`)
    .join(" · ");

  dom.questionPromptLabel.textContent = "Игра завершена";
  dom.questionMetaLabel.textContent = lines;
}

function renderRoom() {
  renderRoomMeta();
  renderBoardPlayers();
  renderLeaderboard();
  renderQuestionState();
  renderQuestionsList();
  renderAdminPlayers();
  renderAdminQuestionBox();
  renderTopThreeIfFinished();
}

function showLobby() {
  showElement(dom.screenLobby, true);
  showElement(dom.screenRoom, false);
  if (isAdminPage()) {
    showElement(dom.signOutButton, Boolean(appState.authUser));
  } else if (isStudentPage()) {
    showElement(dom.signOutButton, false);
  }
  appState.room = null;
  appState.questions = [];
  appState.answers = [];
  appState.roomPlayers = [];
  appState.participant = null;
  clearSubscriptions();
}

function showRoom() {
  showElement(dom.screenLobby, false);
  showElement(dom.screenRoom, true);
  showElement(dom.signOutButton, isAdminPage() || isStudentPage());
  renderRoom();
}

async function initializeSupabase() {
  if (!isSupabaseConfigured()) {
    showElement(dom.configNotice, true);
    return false;
  }

  appState.supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  const { data } = await appState.supabase.auth.getUser();
  appState.authUser = data.user || null;

  if (isAdminPage()) {
    showElement(dom.adminDashboard, Boolean(appState.authUser));
    showElement(dom.signOutButton, Boolean(appState.authUser));
  }

  return true;
}

async function refreshAdminRooms() {
  if (!isAdminPage() || !appState.authUser || !hasDom(dom.adminRoomsList)) {
    return;
  }

  const { data, error } = await appState.supabase
    .from("rooms")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    dom.adminRoomsList.innerHTML = `<div class="notice subtle">${escapeHtml(error.message)}</div>`;
    return;
  }

  dom.adminRoomsList.innerHTML = "";

  data.forEach((room) => {
    const fragment = dom.roomCardTemplate.content.cloneNode(true);
    fragment.querySelector(".list-card-title").textContent = room.title;
    fragment.querySelector(".list-card-meta").textContent = `Код ${room.code} · ${formatStatus(room.status)}`;
    fragment.querySelector('[data-action="open-admin"]')?.addEventListener("click", () => openAdminRoom(room.id));
    fragment.querySelector('[data-action="open-projector"]')?.addEventListener("click", () => {
      window.open(buildProjectorHref(room.code), "_blank", "noopener");
    });
    dom.adminRoomsList.appendChild(fragment);
  });
}

async function adminSignIn(event) {
  event.preventDefault();
  const email = dom.adminEmail.value.trim();
  const password = dom.adminPassword.value;

  const { data, error } = await appState.supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert(error.message);
    return;
  }

  appState.authUser = data.user;
  showElement(dom.adminDashboard, true);
  showElement(dom.signOutButton, true);
  await refreshAdminRooms();
}

async function adminSignUp() {
  const email = dom.adminEmail.value.trim();
  const password = dom.adminPassword.value;

  if (!email || !password) {
    alert("Сначала заполни email и пароль.");
    return;
  }

  const { error } = await appState.supabase.auth.signUp({ email, password });
  if (error) {
    alert(error.message);
    return;
  }

  alert("Аккаунт создан. Если в проекте включено подтверждение почты, сначала подтверди email.");
}

async function generateUniqueRoomCode() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const { data, error } = await appState.supabase
      .from("rooms")
      .select("id")
      .eq("code", code)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (!data) {
      return code;
    }
  }

  throw new Error("Не удалось подобрать уникальный код комнаты.");
}

async function createRoom(event) {
  event.preventDefault();

  const code = await generateUniqueRoomCode();
  const payload = {
    code,
    title: dom.roomTitleInput.value.trim(),
    admin_user_id: appState.authUser.id,
    first_correct_bonus: Number(dom.firstCorrectBonusInput.value) || 0,
    board_size: BOARD_PATH.length - 1
  };

  const { data, error } = await appState.supabase
    .from("rooms")
    .insert(payload)
    .select()
    .single();

  if (error) {
    alert(error.message);
    return;
  }

  dom.createRoomForm.reset();
  dom.firstCorrectBonusInput.value = "1";
  await refreshAdminRooms();
  await openAdminRoom(data.id);
}

async function fetchAdminRoom(roomId) {
  const { data, error } = await appState.supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function fetchPublicRoomByCode(code) {
  const { data, error } = await appState.supabase
    .from("public_room_state")
    .select("*")
    .eq("code", code)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function fetchRoomPlayers(roomId) {
  const source = isAdminPage() ? "room_players" : "public_room_players";
  const { data, error } = await appState.supabase
    .from(source)
    .select("*")
    .eq("room_id", roomId)
    .order("joined_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

async function fetchQuestions(roomId) {
  if (!isAdminPage()) {
    return [];
  }

  const { data, error } = await appState.supabase
    .from("questions")
    .select("*")
    .eq("room_id", roomId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

async function fetchAnswers(roomId) {
  if (!isAdminPage()) {
    return [];
  }

  const { data, error } = await appState.supabase
    .from("answers")
    .select("*")
    .eq("room_id", roomId)
    .order("submitted_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

async function hydrateRoom() {
  if (!appState.room?.id) {
    return;
  }

  const roomId = appState.room.id;

  if (isAdminPage()) {
    appState.room = await fetchAdminRoom(roomId);
  } else {
    appState.room = await fetchPublicRoomByCode(appState.currentRoomLookupCode);
  }

  appState.roomPlayers = await fetchRoomPlayers(roomId);
  appState.questions = await fetchQuestions(roomId);
  appState.answers = await fetchAnswers(roomId);

  if (isStudentPage() && appState.participant) {
    const currentParticipant = appState.roomPlayers.find((player) => player.id === appState.participant.id);
    if (currentParticipant) {
      appState.participant = currentParticipant;
      saveStudentSession(appState.currentRoomLookupCode, currentParticipant);
    }
  }

  renderRoom();
}

function clearSubscriptions() {
  if (appState.channel) {
    appState.supabase?.removeChannel(appState.channel);
    appState.channel = null;
  }
}

function subscribeToRoom(roomId) {
  clearSubscriptions();

  appState.channel = appState.supabase
    .channel(`room-${roomId}-${PAGE_MODE}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomId}` }, hydrateRoom)
    .on("postgres_changes", { event: "*", schema: "public", table: "room_players", filter: `room_id=eq.${roomId}` }, hydrateRoom)
    .on("postgres_changes", { event: "*", schema: "public", table: "questions", filter: `room_id=eq.${roomId}` }, hydrateRoom)
    .on("postgres_changes", { event: "*", schema: "public", table: "answers", filter: `room_id=eq.${roomId}` }, hydrateRoom)
    .subscribe();
}

async function openAdminRoom(roomId) {
  appState.room = await fetchAdminRoom(roomId);
  appState.currentRoomLookupCode = appState.room.code;
  appState.participant = null;
  await hydrateRoom();
  subscribeToRoom(roomId);
  showRoom();
}

async function joinStudentRoom(event) {
  event.preventDefault();

  const code = dom.studentRoomCode.value.trim();
  const name = dom.studentName.value.trim();

  try {
    const room = await fetchPublicRoomByCode(code);

    if (room.status === "finished") {
      alert("Эта игра уже завершена.");
      return;
    }

    const existingSession = loadStudentSession();
    let participant = null;

    if (existingSession?.roomCode === code && existingSession.participantId) {
      const publicPlayers = await fetchRoomPlayers(room.id);
      participant = publicPlayers.find((player) => player.id === existingSession.participantId) || null;
    }

    if (!participant) {
      const { data, error } = await appState.supabase
        .from("room_players")
        .insert({
          room_id: room.id,
          display_name: name
        })
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      participant = data;
    }

    appState.currentRoomLookupCode = code;
    appState.room = room;
    appState.participant = participant;
    saveStudentSession(code, participant);
    await hydrateRoom();
    subscribeToRoom(room.id);
    showRoom();
  } catch (error) {
    alert(error.message || "Не удалось войти в комнату.");
  }
}

async function joinProjectorRoom(event, codeOverride = null) {
  if (event) {
    event.preventDefault();
  }

  const code = codeOverride || dom.projectorRoomCode?.value.trim();
  if (!code) {
    return;
  }

  try {
    const room = await fetchPublicRoomByCode(code);
    appState.currentRoomLookupCode = code;
    appState.room = room;
    saveProjectorRoomCode(code);
    await hydrateRoom();
    subscribeToRoom(room.id);
    showRoom();
  } catch (error) {
    alert(error.message || "Не удалось открыть комнату.");
  }
}

function parseQuestionsJson(raw) {
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error("JSON должен содержать массив вопросов.");
  }

  return data.map((item, index) => {
    if (!item.prompt || !item.answer) {
      throw new Error(`Вопрос под номером ${index + 1} должен содержать prompt и answer.`);
    }

    return {
      prompt: String(item.prompt).trim(),
      answer: String(item.answer).trim(),
      points: Math.max(1, Number(item.points) || 1),
      sort_order: index
    };
  });
}

async function uploadQuestions(event) {
  event.preventDefault();

  const file = dom.questionsFileInput.files?.[0];
  if (!file) {
    alert("Выбери JSON-файл.");
    return;
  }

  const raw = await file.text();
  let parsed;

  try {
    parsed = parseQuestionsJson(raw);
  } catch (error) {
    alert(error.message);
    return;
  }

  const payload = parsed.map((question, index) => ({
    room_id: appState.room.id,
    prompt: question.prompt,
    answer: question.answer,
    points: question.points,
    sort_order: appState.questions.length + index
  }));

  const { error } = await appState.supabase.from("questions").insert(payload);
  if (error) {
    alert(error.message);
    return;
  }

  dom.uploadQuestionsForm.reset();
  await hydrateRoom();
}

async function openQuestion(questionId) {
  const question = appState.questions.find((item) => item.id === questionId);
  if (!question) {
    return;
  }

  const { error } = await appState.supabase
    .from("rooms")
    .update({
      status: "question",
      active_question_id: question.id,
      active_question_prompt: question.prompt,
      active_question_points: question.points
    })
    .eq("id", appState.room.id);

  if (error) {
    alert(error.message);
    return;
  }

  await hydrateRoom();
}

async function submitStudentAnswer(event) {
  event.preventDefault();

  if (!appState.room?.active_question_id || !appState.participant) {
    return;
  }

  const answerText = dom.studentAnswerInput.value.trim();
  if (!answerText) {
    return;
  }

  const { error } = await appState.supabase.from("answers").insert({
    room_id: appState.room.id,
    question_id: appState.room.active_question_id,
    player_id: appState.participant.id,
    answer_text: answerText,
    normalized_answer: normalizeAnswer(answerText)
  });

  if (error) {
    alert(error.message);
    return;
  }

  persistSubmittedAnswer(appState.currentRoomLookupCode, appState.room.active_question_id);
  dom.studentAnswerForm.reset();
  await hydrateRoom();
}

async function adjustPlayerScore(playerId, delta) {
  const player = appState.roomPlayers.find((item) => item.id === playerId);
  if (!player) {
    return;
  }

  const score = Math.max(0, player.score + delta);
  const position = Math.min(score, BOARD_PATH.length - 1);

  const { error } = await appState.supabase
    .from("room_players")
    .update({ score, position })
    .eq("id", playerId);

  if (error) {
    alert(error.message);
    return;
  }

  await hydrateRoom();
}

async function closeActiveQuestion() {
  const room = appState.room;
  const activeQuestion = getActiveQuestion();

  if (!room || !activeQuestion || room.status !== "question") {
    return;
  }

  const answers = appState.answers
    .filter((answer) => answer.question_id === activeQuestion.id)
    .sort((left, right) => new Date(left.submitted_at) - new Date(right.submitted_at));

  const correctAnswer = normalizeAnswer(activeQuestion.answer);
  let firstCorrectPlayerId = null;

  const answerUpdates = answers.map((answer) => {
    const isCorrect = answer.normalized_answer === correctAnswer;
    if (isCorrect && !firstCorrectPlayerId) {
      firstCorrectPlayerId = answer.player_id;
    }
    return {
      id: answer.id,
      playerId: answer.player_id,
      is_correct: isCorrect,
      bonus_points: 0,
      awarded_points: 0
    };
  }).map((answer) => {
    if (!answer.is_correct) {
      return answer;
    }

    const bonus = answer.playerId === firstCorrectPlayerId ? room.first_correct_bonus : 0;
    return {
      ...answer,
      bonus_points: bonus,
      awarded_points: activeQuestion.points + bonus
    };
  });

  for (const answerUpdate of answerUpdates) {
    const { error } = await appState.supabase
      .from("answers")
      .update({
        is_correct: answerUpdate.is_correct,
        bonus_points: answerUpdate.bonus_points,
        awarded_points: answerUpdate.awarded_points
      })
      .eq("id", answerUpdate.id);

    if (error) {
      alert(error.message);
      return;
    }
  }

  const playerTotals = new Map();
  answerUpdates.forEach((update) => {
    if (!update.awarded_points) {
      return;
    }
    playerTotals.set(update.playerId, (playerTotals.get(update.playerId) || 0) + update.awarded_points);
  });

  for (const player of appState.roomPlayers) {
    const bonusScore = playerTotals.get(player.id) || 0;
    if (!bonusScore) {
      continue;
    }

    const score = player.score + bonusScore;
    const position = Math.min(score, BOARD_PATH.length - 1);

    const { error } = await appState.supabase
      .from("room_players")
      .update({ score, position })
      .eq("id", player.id);

    if (error) {
      alert(error.message);
      return;
    }
  }

  const { error: questionError } = await appState.supabase
    .from("questions")
    .update({ is_used: true })
    .eq("id", activeQuestion.id);

  if (questionError) {
    alert(questionError.message);
    return;
  }

  const { error: roomError } = await appState.supabase
    .from("rooms")
    .update({
      status: "review",
      active_question_id: null,
      active_question_prompt: null,
      active_question_points: 0
    })
    .eq("id", room.id);

  if (roomError) {
    alert(roomError.message);
    return;
  }

  await appState.supabase.from("rooms").update({ status: "lobby" }).eq("id", room.id);
  await hydrateRoom();
}

async function finishGame() {
  const topThree = [...appState.roomPlayers]
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((player) => ({
      display_name: player.display_name,
      score: player.score
    }));

  const { error } = await appState.supabase
    .from("rooms")
    .update({
      status: "finished",
      finished_at: new Date().toISOString(),
      winner_snapshot: topThree,
      active_question_id: null,
      active_question_prompt: null,
      active_question_points: 0
    })
    .eq("id", appState.room.id);

  if (error) {
    alert(error.message);
    return;
  }

  await hydrateRoom();
}

async function signOut() {
  clearSubscriptions();

  if (isAdminPage()) {
    await appState.supabase.auth.signOut();
    appState.authUser = null;
    showElement(dom.adminDashboard, false);
    showLobby();
    return;
  }

  if (isStudentPage()) {
    clearStudentSession();
    showLobby();
  }
}

async function tryRestoreStudentSession() {
  if (!isStudentPage()) {
    return;
  }

  const session = loadStudentSession();
  if (!session?.roomCode || !session?.participantId) {
    return;
  }

  try {
    const room = await fetchPublicRoomByCode(session.roomCode);
    const players = await appState.supabase
      .from("public_room_players")
      .select("*")
      .eq("room_id", room.id)
      .eq("id", session.participantId)
      .maybeSingle();

    if (players.error || !players.data) {
      clearStudentSession();
      return;
    }

    appState.currentRoomLookupCode = session.roomCode;
    appState.room = room;
    appState.participant = players.data;
    await hydrateRoom();
    subscribeToRoom(room.id);
    showRoom();
  } catch {
    clearStudentSession();
  }
}

async function tryRestoreProjectorSession() {
  if (!isProjectorPage()) {
    return;
  }

  const urlCode = new URLSearchParams(window.location.search).get("room");
  const savedCode = urlCode || loadProjectorRoomCode();
  if (!savedCode) {
    return;
  }

  if (hasDom(dom.projectorRoomCode)) {
    dom.projectorRoomCode.value = savedCode;
  }

  await joinProjectorRoom(null, savedCode);
}

function bindEvents() {
  if (hasDom(dom.adminSignInForm)) {
    dom.adminSignInForm.addEventListener("submit", adminSignIn);
  }
  if (hasDom(dom.adminSignUpButton)) {
    dom.adminSignUpButton.addEventListener("click", adminSignUp);
  }
  if (hasDom(dom.createRoomForm)) {
    dom.createRoomForm.addEventListener("submit", createRoom);
  }
  if (hasDom(dom.studentJoinForm)) {
    dom.studentJoinForm.addEventListener("submit", joinStudentRoom);
  }
  if (hasDom(dom.projectorJoinForm)) {
    dom.projectorJoinForm.addEventListener("submit", (event) => joinProjectorRoom(event));
  }
  if (hasDom(dom.uploadQuestionsForm)) {
    dom.uploadQuestionsForm.addEventListener("submit", uploadQuestions);
  }
  if (hasDom(dom.studentAnswerForm)) {
    dom.studentAnswerForm.addEventListener("submit", submitStudentAnswer);
  }
  if (hasDom(dom.finishGameButton)) {
    dom.finishGameButton.addEventListener("click", finishGame);
  }
  if (hasDom(dom.signOutButton)) {
    dom.signOutButton.addEventListener("click", signOut);
  }

  window.addEventListener("resize", renderBoardPlayers);
}

async function init() {
  createPath();
  bindEvents();

  const ready = await initializeSupabase();
  if (!ready) {
    return;
  }

  if (isAdminPage() && appState.authUser) {
    showElement(dom.adminDashboard, true);
    await refreshAdminRooms();
  }

  await tryRestoreStudentSession();
  await tryRestoreProjectorSession();
}

init();
