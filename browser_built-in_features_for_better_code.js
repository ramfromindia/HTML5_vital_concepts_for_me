document.documentElement.classList.remove("no-js");

const noteForm = document.querySelector("#noteForm");
const noteInput = document.querySelector("#noteInput");
const notesList = document.querySelector("#notesList");
const clearAllBtn = document.querySelector("#clearAllBtn");
const adviceDisplay = document.querySelector("#adviceDisplay");
const noteTemplate = document.querySelector("#noteTemplate");

let notes = JSON.parse(localStorage.getItem("notes")) || [];
let clearTimer = null;

const syncStorage = () =>
  localStorage.setItem("notes", JSON.stringify(notes));

const createNote = text => ({
  id: crypto.randomUUID(),
  text
});

const renderNotes = () => {
  const fragment = document.createDocumentFragment();
  notesList.innerHTML = "";
  clearAllBtn.style.visibility = notes.length ? "visible" : "hidden";

  for (const note of notes) {
    const clone = noteTemplate.content.cloneNode(true);
    clone.querySelector(".note-text").textContent = note.text;
    clone.querySelector(".delete-btn").dataset.id = note.id;
    fragment.appendChild(clone);
  }

  notesList.appendChild(fragment);
};

noteForm.addEventListener("submit", e => {
  e.preventDefault();
  const text = noteInput.value.trim();
  if (!text) return;

  notes.push(createNote(text));
  syncStorage();
  renderNotes();
  noteForm.reset();
});

/* UPDATED: animated delete */
notesList.addEventListener("click", e => {
  const btn = e.target.closest(".delete-btn");
  if (!btn) return;

  const item = btn.closest(".note-item");

  // NEW: play exit animation before removing
  item.classList.add("removing");

  setTimeout(() => {
    notes = notes.filter(n => n.id !== btn.dataset.id);
    syncStorage();
    renderNotes();
  }, 300);
});

clearAllBtn.addEventListener("click", () => {
  if (!notes.length) return;

  if (clearAllBtn.classList.contains("confirming")) {
    notes = [];
    syncStorage();
    renderNotes();
    resetClearButton();
  } else {
    clearAllBtn.classList.add("confirming");
    clearAllBtn.textContent = "Are you sure?";
    clearAllBtn.setAttribute("aria-pressed", "true");
    clearTimer = setTimeout(resetClearButton, 3000);
  }
});

function resetClearButton() {
  clearTimeout(clearTimer);
  clearAllBtn.classList.remove("confirming");
  clearAllBtn.textContent = "Clear All";
  clearAllBtn.setAttribute("aria-pressed", "false");
}

async function fetchAdvice() {
  try {
    const res = await fetch("https://api.adviceslip.com/advice");
    const data = await res.json();
    adviceDisplay.textContent = `"${data.slip.advice}"`;
  } catch {
    adviceDisplay.textContent =
      "Progress is progress, no matter how small.";
  }
}

/* =========================================================
   CLEAN PROFESSIONAL SCROLL REVEAL + STAGGER
========================================================= */

const cards = document.querySelectorAll(".card");

const reveal = () => {
  cards.forEach((card, i) => {
    if (card.getBoundingClientRect().top < window.innerHeight * 0.85) {
      card.style.setProperty("--delay", `${i * 120}ms`);
      card.classList.add("visible");
    }
  });
};

window.addEventListener("scroll", reveal);
reveal();

/* =========================================================
   APP BOOTSTRAP
========================================================= */

renderNotes();
fetchAdvice();
