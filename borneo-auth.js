/**
 * ボルネオ島サイト用 ログイン連携スクリプト
 *
 * 使い方:
 *  1. このファイルをリポジトリに追加(例: /assets/js/borneo-auth.js)
 *  2. HTMLの </body> 直前で読み込む
 *     <script src="/assets/js/borneo-auth.js"></script>
 *  3. ログインボタンに id="discord-login-btn" を付ける
 *     <button id="discord-login-btn">Discordでログイン</button>
 *  4. ログイン状態を表示したい場所に以下のようなタグを用意する(任意)
 *     <div id="auth-status"></div>
 */

// ↓ Workerをデプロイした後に表示されるURLに書き換えてください
const WORKER_BASE_URL = "https://borneo-auth-worker.bard256.workers.dev";

const STORAGE_KEY = "borneo_session_token";

async function initBorneoAuth() {
  // 1. Discordから戻ってきた直後(URLフラグメントにトークンがある)か確認
  const hash = window.location.hash;
  if (hash.startsWith("#token=")) {
    const token = decodeURIComponent(hash.replace("#token=", ""));
    localStorage.setItem(STORAGE_KEY, token);
    // URLからトークンを消す(見た目をきれいにする)
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  // 2. 保存されているトークンがあれば検証
  const savedToken = localStorage.getItem(STORAGE_KEY);
  if (savedToken) {
    const session = await verifySession(savedToken);
    if (session && session.valid) {
      renderLoggedIn(session);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      renderLoggedOut();
    }
  } else {
    renderLoggedOut();
  }

  // 3. ログインボタンの動作
  const loginBtn = document.getElementById("discord-login-btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      window.location.href = `${WORKER_BASE_URL}/login`;
    });
  }
}

async function verifySession(token) {
  try {
    const res = await fetch(
      `${WORKER_BASE_URL}/session?token=${encodeURIComponent(token)}`
    );
    return await res.json();
  } catch (e) {
    console.error("セッション確認に失敗しました", e);
    return null;
  }
}

function renderLoggedIn(session) {
  const el = document.getElementById("auth-status");
  if (!el) return;

  const label = session.status === "islander" ? "島民" : "訪問者";
  const avatarUrl = session.avatar
    ? `https://cdn.discordapp.com/avatars/${session.username}/${session.avatar}.png`
    : null;

  el.innerHTML = `
    <span class="borneo-auth-badge borneo-auth-${session.status}">
      ${label}: ${escapeHtml(session.username)}
    </span>
    <button id="borneo-logout-btn">ログアウト</button>
  `;

  document.getElementById("borneo-logout-btn")?.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });

  // ログイン状態に応じてコンテンツの出し分けをしたい場合、
  // body に data 属性を付けておくとCSSやJSから制御しやすくなります
  document.body.dataset.borneoAuthStatus = session.status;
}

function renderLoggedOut() {
  const el = document.getElementById("auth-status");
  if (el) {
    el.innerHTML = `<span class="borneo-auth-badge">未ログイン</span>`;
  }
  document.body.dataset.borneoAuthStatus = "guest";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", initBorneoAuth);
