/* =========================================================
   REMOVE no-js CLASS
   ---------------------------------------------------------
   Allows CSS to switch from fallback mode to JS-enhanced mode
========================================================= */
document.documentElement.classList.remove("no-js");

/* =========================================================
   DOM REFERENCES
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

// Load saved notes from localStorage or start empty
let notes = JSON.parse(localStorage.getItem("notes")) || [];

// Timer used for Clear-All confirmation reset
let clearTimer = null;

/* =========================================================
   PERSISTENCE HELPERS
========================================================= */

// Sync in-memory notes array to browser storage
const syncStorage = () =>
  localStorage.setItem("notes", JSON.stringify(notes));

/* =========================================================
   NOTE FACTORY
   Creates a standardized note object
========================================================= */
const createNote = text => ({
  id: crypto.randomUUID(), // secure unique ID
  text
});

/* =========================================================
   RENDER NOTES TO DOM
========================================================= */
const renderNotes = () => {
  // DocumentFragment minimizes layout thrashing
  const fragment = document.createDocumentFragment();

  // Clear existing list
  notesList.innerHTML = "";

  // Hide Clear All button when empty
  clearAllBtn.style.visibility = notes.length ? "visible" : "hidden";

  // Build each note from template
  for (const note of notes) {
    const clone = noteTemplate.content.cloneNode(true);

    clone.querySelector(".note-text").textContent = note.text;

    // Store ID directly on delete button
    clone.querySelector(".delete-btn").dataset.id = note.id;

    fragment.appendChild(clone);
  }

  notesList.appendChild(fragment);
};

/* =========================================================
   ADD NOTE HANDLER
========================================================= */
noteForm.addEventListener("submit", e => {
  e.preventDefault();

  const text = noteInput.value.trim();
  if (!text) return;

  notes.push(createNote(text));
  syncStorage();
  renderNotes();

  // Clears input + restores focus
  noteForm.reset();
});

/* =========================================================
   DELETE NOTE (WITH EXIT ANIMATION)
========================================================= */
notesList.addEventListener("click", e => {
  const btn = e.target.closest(".delete-btn");
  if (!btn) return;

  const item = btn.closest(".note-item");

  // Trigger CSS exit animation
  item.classList.add("removing");

  // Wait for animation before removing data
  setTimeout(() => {
    notes = notes.filter(n => n.id !== btn.dataset.id);
    syncStorage();
    renderNotes();
  }, 300);
});

/* =========================================================
   CLEAR ALL — TWO STEP CONFIRMATION
========================================================= */
clearAllBtn.addEventListener("click", () => {
  if (!notes.length) return;

  // Second click confirms deletion
  if (clearAllBtn.classList.contains("confirming")) {
    notes = [];
    syncStorage();
    renderNotes();
    resetClearButton();
  } else {
    // First click arms confirmation state
    clearAllBtn.classList.add("confirming");
    clearAllBtn.textContent = "Are you sure?";
    clearAllBtn.setAttribute("aria-pressed", "true");

    // Auto-reset after 3 seconds
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
   ASYNC ADVICE FETCH
========================================================= */
async function fetchAdvice() {
  try {
    const res = await fetch("https://api.adviceslip.com/advice");
    const data = await res.json();

    adviceDisplay.textContent = `"${data.slip.advice}"`;
  } catch {
    // Graceful fallback if network fails
    adviceDisplay.textContent =
      "Progress is progress, no matter how small.";
  }
}

/* =========================================================
   SCROLL REVEAL + STAGGER SYSTEM
========================================================= */

const cards = document.querySelectorAll(".card");

/*
  reveal()

  This arrow function is responsible for:

  1. Detecting when cards enter the viewport
  2. Applying a staggered animation delay
  3. Adding the "visible" class to trigger CSS transitions

  How it works step-by-step:

  - Loop over every card
  - Measure each card’s top position relative to viewport
  - If card is within 85% of screen height:
        → assign delay based on index
        → add "visible" class
*/
const reveal = () => {
  cards.forEach((card, i) => {

    /*
      getBoundingClientRect().top
      gives distance from top of viewport to element.

      window.innerHeight * 0.85
      creates a trigger zone slightly before full visibility,
      making animation feel smoother and anticipatory.
    */
    if (card.getBoundingClientRect().top < window.innerHeight * 0.85) {

      /*
        CSS variable "--delay" controls transition-delay.

        Each card waits:
          index * 120ms

        Result:
        Card 0 → 0ms
        Card 1 → 120ms
        Card 2 → 240ms
        etc.

        Produces a professional cascading entrance effect.
      */
      card.style.setProperty("--delay", `${i * 120}ms`);

      // Activates CSS animation
      card.classList.add("visible");
    }
  });
};

// Run reveal on every scroll
window.addEventListener("scroll", reveal);

// Also run once on page load
reveal();

/* =========================================================
   APP BOOTSTRAP
========================================================= */

// Initial render from storage
renderNotes();

// Load daily advice
fetchAdvice();
