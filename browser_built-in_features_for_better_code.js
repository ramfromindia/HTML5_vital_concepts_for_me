/* =========================================================
   PROGRESSIVE ENHANCEMENT
   ---------------------------------------------------------
   If JavaScript is running, remove the no-js class so
   CSS animations and JS-dependent features can activate.
========================================================= */
document.documentElement.classList.remove("no-js");


/* =========================================================
   DOM CACHING
   ---------------------------------------------------------
   Store frequently used DOM elements once.
   Avoid repeated querySelector calls (performance + clarity).
========================================================= */
const noteForm = document.querySelector("#noteForm");
const noteInput = document.querySelector("#noteInput");
const notesList = document.querySelector("#notesList");
const clearAllBtn = document.querySelector("#clearAllBtn");
const adviceDisplay = document.querySelector("#adviceDisplay");
const noteTemplate = document.querySelector("#noteTemplate");


/* =========================================================
   APPLICATION STATE
   ---------------------------------------------------------
   notes = single source of truth for the app.
   Loaded from localStorage if available, otherwise empty.
========================================================= */
let notes = JSON.parse(localStorage.getItem("notes")) || [];

/* Used for "Clear All" confirmation timeout */
let clearTimer = null;


/* =========================================================
   PERSISTENCE
   ---------------------------------------------------------
   Sync current notes state to localStorage.
   localStorage stores strings, so we stringify the array.
========================================================= */
const syncStorage = () =>
  localStorage.setItem("notes", JSON.stringify(notes));


/* =========================================================
   NOTE FACTORY
   ---------------------------------------------------------
   Creates a new note object with:
   - unique ID (safe, collision-free)
   - text content
========================================================= */
const createNote = text => ({
  id: crypto.randomUUID(),
  text
});


/* =========================================================
   RENDERING ENGINE
   ---------------------------------------------------------
   Converts the notes array into DOM elements.
   This function is called after ANY state change.
========================================================= */
const renderNotes = () => {
  /* Build DOM updates offscreen for performance */
  const fragment = document.createDocumentFragment();

  /* Clear old UI before re-rendering */
  notesList.innerHTML = "";

  /* Hide "Clear All" button if no notes exist */
  clearAllBtn.style.visibility = notes.length ? "visible" : "hidden";

  /* Loop through application state */
  for (const note of notes) {

    /* Clone inert HTML template */
    const clone = noteTemplate.content.cloneNode(true);

    /* Safely inject note text (prevents XSS) */
    clone.querySelector(".note-text").textContent = note.text;

    /* Store note ID on delete button for event delegation */
    clone.querySelector(".delete-btn").dataset.id = note.id;

    /* Collect DOM nodes without touching the real DOM */
    fragment.appendChild(clone);
  }

  /* Insert all notes into the page at once */
  notesList.appendChild(fragment);
};


/* =========================================================
   ADD NOTE (FORM SUBMIT)
   ---------------------------------------------------------
   Browser handles validation.
   JS handles state update + render.
========================================================= */
noteForm.addEventListener("submit", e => {
  e.preventDefault();

  const text = noteInput.value.trim();
  if (!text) return;

  /* Update state */
  notes.push(createNote(text));

  /* Persist + re-render */
  syncStorage();
  renderNotes();

  /* Reset form input */
  noteForm.reset();
});


/* =========================================================
   DELETE NOTE (EVENT DELEGATION)
   ---------------------------------------------------------
   One click listener handles ALL delete buttons,
   including future dynamically added ones.
========================================================= */
notesList.addEventListener("click", e => {
  const btn = e.target.closest(".delete-btn");
  if (!btn) return;

  const id = btn.dataset.id;

  /* Remove note by ID (not by index) */
  notes = notes.filter(n => n.id !== id);

  syncStorage();
  renderNotes();
});


/* =========================================================
   CLEAR ALL WITH CONFIRMATION
   ---------------------------------------------------------
   First click: ask for confirmation.
   Second click (within 3s): delete everything.
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


/* Reset Clear All button state */
function resetClearButton() {
  clearTimeout(clearTimer);
  clearAllBtn.classList.remove("confirming");
  clearAllBtn.textContent = "Clear All";
  clearAllBtn.setAttribute("aria-pressed", "false");
}


/* =========================================================
   ASYNC DATA FETCH (DAILY ADVICE)
   ---------------------------------------------------------
   Demonstrates async/await + graceful fallback.
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
   SCROLL-IN ANIMATIONS (IntersectionObserver)
   ---------------------------------------------------------
   Animates cards when they enter the viewport.
   Falls back gracefully if unsupported.
========================================================= */
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target); // animate once
      }
    }
  }, { threshold: 0.1 });

  document.querySelectorAll(".observe").forEach(el =>
    observer.observe(el)
  );
} else {
  /* Fallback: show everything immediately */
  document.querySelectorAll(".card").forEach(el =>
    el.classList.add("show")
  );
}


/* =========================================================
   APP BOOTSTRAP
   ---------------------------------------------------------
   Initial render + async data fetch.
========================================================= */
renderNotes();
fetchAdvice();
