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
   LIVE REGION FOR SCREEN READER ANNOUNCEMENTS
========================================================= */
const liveRegion = document.createElement("div");

//aria-live="assertive" ensures important messages are announced immediately
liveRegion.setAttribute("aria-live", "assertive");

//aria-atomic="true" ensures the entire message is read, not just changes
liveRegion.setAttribute("aria-atomic", "true");

//sr-only class visually hides the element but keeps it accessible to screen readers
liveRegion.className = "sr-only";
document.body.appendChild(liveRegion);

/* =========================================================
   APPLICATION STATE
========================================================= */

// Load saved notes from localStorage or start empty
// "notes" is the key used to store the serialized array of note objects in localStorage. If there are no saved notes, it defaults to an empty array.
// JSON.parse converts the stored string back into a JavaScript array of note objects.
let notes = JSON.parse(localStorage.getItem("notes")) || [];

// Timer used for Clear-All confirmation reset
let clearTimer = null;

/* =========================================================
   PERSISTENCE HELPERS
========================================================= */

// Sync in-memory notes array to browser storage
//"notes" is the key under which the serialized array is stored.
// Using JSON.stringify to convert the array into a string format suitable for storage.That’s one long string, not an array of strings.
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
   INPUT VALIDATION (SECOND LINE OF DEFENSE)
========================================================= */
const NOTE_RULES = {
  MIN: 3,
  MAX: 100,
  PATTERN: /^[A-Za-z0-9\s.,!?'-]+$/
};

function validateNoteInput(text) {
  if (typeof text !== "string") return false;

  const trimmed = text.trim();

  if (trimmed.length < NOTE_RULES.MIN) return false;
  if (trimmed.length > NOTE_RULES.MAX) return false;
  if (!NOTE_RULES.PATTERN.test(trimmed)) return false;

  return true;
}

/* =========================================================
   RENDER NOTES TO DOM
========================================================= */
const renderNotes = () => {

  const fragment = document.createDocumentFragment();

  // Safely clear list (no innerHTML)
  notesList.replaceChildren();

  clearAllBtn.hidden = notes.length === 0;

  for (const note of notes) {
  // Clone template content for each note
  // Using a template allows us to keep HTML structure in the markup and avoid manual element creation in JS, which is more error-prone and less efficient.
  // The template element is a special HTML element that holds HTML content that is not rendered immediately. It allows us to define a chunk of HTML that can be cloned and inserted into the document as needed.
  //content property of the template gives us access to the document fragment that contains the template's children. This is where our note structure is defined in the HTML.
  // cloneNode(true) creates a deep copy of the template content, including all nested elements. This is crucial for maintaining the structure and styles defined in the template.
  // After cloning, we can manipulate the cloned content to insert the specific note text and set the appropriate data attributes for deletion.
  // This approach is more efficient than creating each element manually with createElement and appending them, as it leverages the browser's optimized handling of templates and document fragments.
  //dataset.id allows us to store the note's unique ID directly on the delete button, making it easy to identify which note to delete when the button is clicked.
  // By using a document fragment, we minimize the number of reflows and repaints in the browser, as we build the entire list of notes in memory before attaching it to the DOM in one operation.
    const clone =
      noteTemplate.content.cloneNode(true);

    clone.querySelector(".note-text").textContent =
      note.text;

    clone.querySelector(".delete-btn").dataset.id =
      note.id;

    fragment.appendChild(clone);
  }

  notesList.appendChild(fragment);
};

noteForm.addEventListener("submit", e => {
  e.preventDefault();

  const raw = noteInput.value;
  const text = raw.trim();

  if (!validateNoteInput(text)) {
    liveRegion.textContent = "Invalid input. Please follow note guidelines.";
    return;
  }

  notes.push(createNote(text));
  syncStorage();
  renderNotes();

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
    // Filter out the deleted note by ID
    //dataset.id gives us the unique ID of the note to delete, which we compare against each note in the array. We create a new array that includes all notes except the one with the matching ID.
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
  if (clearAllBtn.dataset.confirmState === "confirming") {
    notes = [];
    syncStorage();
    renderNotes();
    liveRegion.textContent = "All notes deleted successfully";
    resetClearButton();
  } else {
    // First click arms confirmation state
    clearAllBtn.dataset.confirmState = "confirming";
    clearAllBtn.textContent = "Are you sure?";
    clearAllBtn.classList.add("confirming");
    liveRegion.textContent = "Confirmation mode active. Click again to delete, or wait 3 seconds to cancel";

    // Auto-reset after 3 seconds
    clearTimer = setTimeout(resetClearButton, 3000);
  }
});

// Allow Escape key to cancel confirmation
// Adding a keydown event listener to the entire document allows us to listen for the Escape key press regardless of which element is currently focused. This provides a convenient way for users to cancel the clear-all confirmation without needing to click anywhere specific on the page.
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && clearAllBtn.dataset.confirmState === "confirming") {
    resetClearButton();
  }
});

// Resets the clear button to its default state
// This function is called after a successful clear or when the confirmation times out or is canceled. It ensures that the button's text, state, and styling are returned to their original settings, providing a consistent user experience.
function resetClearButton() {
  clearTimeout(clearTimer);
  // Remove confirmation state and reset text
  //dataset.confirmState is used to track whether the clear-all button is in its normal state or in a confirmation state. By setting it back to "armed", we indicate that the button is ready for a new clear action, and we update the text and styling accordingly.
  clearAllBtn.dataset.confirmState = "armed";
  clearAllBtn.textContent = "Clear All";
  clearAllBtn.classList.remove("confirming");
}

/* =========================================================
   ASYNC ADVICE FETCH
========================================================= */
async function fetchAdvice() {
  try {
    const res = await fetch("https://api.adviceslip.com/advice");

    // Check for successful response
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();

    // Validate response structure and data
    //data.slip means we expect the API to return an object with a "slip" property, which should itself be an object containing an "advice" property that is a non-empty string. If any of these conditions are not met, we throw an error to prevent displaying invalid or malformed advice.
    //data.slip.advice means we expect the "slip" object to have an "advice" property, which should be a string containing the advice text. We also check that it's not just whitespace by trimming it and checking its length.
    if (!data || typeof data !== 'object' || !data.slip || typeof data.slip.advice !== 'string' || data.slip.advice.trim().length === 0) {
      throw new Error('Invalid API response structure');
    }

    // Sanitize advice text to prevent potential XSS attacks
    const advice = data.slip.advice.trim();
    if (advice.length > 500) { // Arbitrary limit to prevent abuse
      throw new Error('Advice too long');
    }

    adviceDisplay.textContent = `"${advice}"`;
  } catch (error) {
    console.error('Failed to fetch advice:', error);
    // Graceful fallback
    adviceDisplay.textContent = "Progress is progress, no matter how small.";
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
   THEME TOGGLE SYSTEM
========================================================= */

const themeToggle = document.querySelector("#themeToggle");
const root = document.documentElement;

// Key used for persistence
const THEME_KEY = "theme";

/*
  Detect initial theme

  Priority:
  1. Saved preference
  2. System preference
*/
const getInitialTheme = () => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) return saved;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

/*
  Apply theme efficiently
*/
const icon = themeToggle.querySelector("span");

const applyTheme = theme => {
  root.dataset.theme = theme;

  localStorage.setItem(THEME_KEY, theme);

  icon.textContent = theme === "dark" ? "☀️" : "🌙";

  themeToggle.setAttribute(
    "aria-pressed",
    theme === "dark"
  );

  // Dynamically update the title based on the current theme
  themeToggle.setAttribute(
    "title",
    `Toggle color theme (to ${theme === "dark" ? "light" : "dark"})`
  );
};

/*
  Initialize theme on load
*/
applyTheme(getInitialTheme());

/*
  Toggle handler
*/
themeToggle.addEventListener("click", () => {
  const current = root.dataset.theme;
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
});

/* =========================================================
   APP BOOTSTRAP
========================================================= */

// Initial render from storage
renderNotes();

// Load daily advice
fetchAdvice();
