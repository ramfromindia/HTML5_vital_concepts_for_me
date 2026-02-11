/* =========================================================
   PROGRESSIVE ENHANCEMENT
   ---------------------------------------------------------
   If JavaScript is running, remove the no-js class so
   CSS animations and JS-dependent features can activate.
========================================================= */
document.documentElement.classList.remove("no-js");


/* =========================================================
   DOM CACHING
========================================================= */
const noteForm = document.querySelector("#noteForm");
const noteInput = document.querySelector("#noteInput");
const notesList = document.querySelector("#notesList");
const clearAllBtn = document.querySelector("#clearAllBtn");
const adviceDisplay = document.querySelector("#adviceDisplay");
const noteTemplate = document.querySelector("#noteTemplate");


/* =========================================================
   APPLICATION STATE
========================================================= */
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let clearTimer = null;


/* =========================================================
   PERSISTENCE
========================================================= */
const syncStorage = () =>
  localStorage.setItem("notes", JSON.stringify(notes));


/* =========================================================
   NOTE FACTORY
========================================================= */
const createNote = text => ({
  id: crypto.randomUUID(),
  text
});


/* =========================================================
   RENDERING ENGINE
========================================================= */
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


/* =========================================================
   ADD NOTE
========================================================= */
noteForm.addEventListener("submit", e => {
  e.preventDefault();

  const text = noteInput.value.trim();
  if (!text) return;

  notes.push(createNote(text));
  syncStorage();
  renderNotes();
  noteForm.reset();
});


/* =========================================================
   DELETE NOTE
========================================================= */
notesList.addEventListener("click", e => {
  const btn = e.target.closest(".delete-btn");
  if (!btn) return;

  notes = notes.filter(n => n.id !== btn.dataset.id);
  syncStorage();
  renderNotes();
});


/* =========================================================
   CLEAR ALL WITH CONFIRMATION
========================================================= */
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


/* =========================================================
   ASYNC DATA FETCH
========================================================= */
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
   NEW: JS FALLBACK SCROLL REVEAL
   ---------------------------------------------------------
   Used ONLY if browser doesn't support CSS scroll timelines.
   This replaces IntersectionObserver.
========================================================= */
if (!CSS.supports("animation-timeline: view()")) {

  // Manual reveal on scroll (lightweight + reliable)
  const cards = document.querySelectorAll(".card");

  const revealOnScroll = () => {
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) {
        card.style.opacity = 1;
        card.style.transform = "translateY(0)";
      }
    });
  };

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll(); // run once on load
}


/* =========================================================
   APP BOOTSTRAP
========================================================= */
renderNotes();
fetchAdvice();
