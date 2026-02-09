/* Remove CSS fallback once JS is running */
document.documentElement.classList.remove("no-js");

/* Cache DOM nodes */
const noteForm = document.querySelector("#noteForm");
const noteInput = document.querySelector("#noteInput");
const notesList = document.querySelector("#notesList");
const clearAllBtn = document.querySelector("#clearAllBtn");
const adviceDisplay = document.querySelector("#adviceDisplay");
const noteTemplate = document.querySelector("#noteTemplate");

/* Load notes from localStorage or start empty */
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let clearTimer = null;

/* Persist notes */
const syncStorage = () =>
  localStorage.setItem("notes", JSON.stringify(notes));

/* Creates note objects with unique IDs */
const createNote = text => ({
  id: crypto.randomUUID(),
  text
});

/* Renders notes using DocumentFragment for performance */
const renderNotes = () => {
  const fragment = document.createDocumentFragment();
  notesList.innerHTML = "";

  /* Hide Clear All if no notes */
  clearAllBtn.style.visibility = notes.length ? "visible" : "hidden";

  for (const note of notes) {
    const clone = noteTemplate.content.cloneNode(true);

    /* textContent prevents XSS */
    clone.querySelector(".note-text").textContent = note.text;

    /* Store id on delete button */
    clone.querySelector(".delete-btn").dataset.id = note.id;

    fragment.appendChild(clone);
  }

  notesList.appendChild(fragment);
};

/* Handle form submission */
noteForm.addEventListener("submit", e => {
  e.preventDefault();

  const text = noteInput.value.trim();
  if (!text) return;

  notes.push(createNote(text));
  syncStorage();
  renderNotes();
  noteForm.reset();
});

/* Event delegation for delete buttons */
notesList.addEventListener("click", e => {
  const btn = e.target.closest(".delete-btn");
  if (!btn) return;

  const id = btn.dataset.id;

  /* Remove by ID (not index) */
  notes = notes.filter(n => n.id !== id);

  syncStorage();
  renderNotes();
});

/* Double-click style confirmation for Clear All */
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

/* Fetches advice asynchronously */
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

/* Scroll-in animation using IntersectionObserver */
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.1 });

  document.querySelectorAll(".observe").forEach(el =>
    observer.observe(el)
  );
} else {
  /* Fallback: show everything */
  document.querySelectorAll(".card").forEach(el =>
    el.classList.add("show")
  );
}

/* Initialize app */
renderNotes();
fetchAdvice();
