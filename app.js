const apiBase = location.port === "3000" ? "" : "http://127.0.0.1:3000";

const qs = (s) => document.querySelector(s);
const qsa = (s) => Array.from(document.querySelectorAll(s));

function setActive(tab) {
  qsa(".tab").forEach((b) => b.classList.remove("active"));
  qsa(".panel").forEach((p) => p.classList.remove("visible"));
  qs(`.tab[data-tab="${tab}"]`).classList.add("active");
  qs(`#${tab}`).classList.add("visible");
}

qsa(".tab").forEach((btn) => {
  btn.addEventListener("click", () => setActive(btn.dataset.tab));
});

async function fetchJSON(pathname) {
  const res = await fetch(`${apiBase}${pathname}`);
  if (!res.ok) throw new Error(`So'rov muvaffaqiyatsiz bo'ldi: ${res.status}`);
  return await res.json();
}

// Posts
async function loadPosts() {
  qs("#posts-list").innerHTML = '<div class="card">Postlar kutilmoqda...</div>';
  try {
    const posts = await fetchJSON("/post");
    const search = qs("#search-posts").value.trim().toLowerCase();
    const filtered = search
      ? posts.filter(
          (p) =>
            (p.title || "").toLowerCase().includes(search) ||
            (p.body || "").toLowerCase().includes(search)
        )
      : posts;
    qs("#posts-list").innerHTML =
      filtered
        .map(
          (p) => `<article class="card">
      <h3>${escapeHtml(p.title || "Nomlanmagan")}</h3>
      <p>${escapeHtml(p.body || "")}</p>
      <div class="meta">Post #${p.id}</div>
    </article>`
        )
        .join("") || '<div class="card">Postlar topilmadi.</div>';
  } catch (err) {
    qs(
      "#posts-list"
    ).innerHTML = `<div class="card">Postlarni olishda hatolik: ${escapeHtml(
      err.message
    )}</div>`;
  }
}

// Users
async function loadUsers() {
  qs("#users-list").innerHTML = '<div class="card">Foydalanuvchilar kutilmoqda...</div>';
  try {
    const users = await fetchJSON("/users");
    const search = qs("#search-users").value.trim().toLowerCase();
    const filtered = search
      ? users.filter(
          (u) =>
            (u.name || "").toLowerCase().includes(search) ||
            (u.email || "").toLowerCase().includes(search)
        )
      : users;
    qs("#users-list").innerHTML =
      filtered
        .map(
          (u) => `<article class="card">
      <h3>${escapeHtml(u.name || "Nomalum")}</h3>
      <div class="meta">${escapeHtml(u.email || "")}</div>
      ${
        u.address
          ? `<div class="meta">${escapeHtml(u.address.city || "")}</div>`
          : ""
      }
    </article>`
        )
        .join("") || '<div class="card">Topilmadi eee.</div>';
  } catch (err) {
    qs(
      "#users-list"
    ).innerHTML = `<div class="card">Bo'madi, unde user yo: ${escapeHtml(
      err.message
    )}</div>`;
  }
}

// Todos
async function loadTodos() {
  qs("#todos-list").innerHTML = '<div class="card">Todos kutilmoqda...</div>';
  try {
    const todos = await fetchJSON("/todos");
    const hideCompleted = qs("#hide-completed").checked;
    const visible = hideCompleted ? todos.filter((t) => !t.completed) : todos;
    qs("#todos-list").innerHTML = visible
      .map(
        (t) => `<article class="card">
      <h3>${escapeHtml(t.title || "Untitled")}</h3>
      <span class="badge">${t.completed ? "Tugatilgan" : "Tugallanmagan"}</span>
      <div class="meta">Todo #${t.id}</div>
    </article>`
      )
      .join("");
  } catch (err) {
    qs(
      "#todos-list"
    ).innerHTML = `<div class="card">Todosni olishda hatolik: ${escapeHtml(
      err.message
    )}</div>`;
  }
}

function escapeHtml(str) {
  return String(str).replace(
    /[&<>"]/g,
    (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch])
  );
}

// Toggle cards via event delegation
function setupCardToggling() {
  ["#posts-list", "#users-list", "#todos-list"].forEach((selector) => {
    const container = qs(selector);
    container.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (!card) return;
      card.classList.toggle("toggled");
    });
  });
}

// Wire controls
qs("#refresh-posts").addEventListener("click", loadPosts);
qs("#refresh-users").addEventListener("click", loadUsers);
qs("#refresh-todos").addEventListener("click", loadTodos);
qs("#search-posts").addEventListener("input", debounce(loadPosts, 300));
qs("#search-users").addEventListener("input", debounce(loadUsers, 300));
qs("#hide-completed").addEventListener("change", loadTodos);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// Initial load
setActive("posts");
loadPosts();
loadUsers();
loadTodos();
setupCardToggling();
