/**
 * MINI NOTES APP - BEHAVIOR LAYER
 * * Major Functionalities:
 * 1. State Management: Persists notes to LocalStorage.
 * 2. Optimized Rendering: Uses DocumentFragments and <template> to batch DOM updates.
 * 3. Event Delegation: Single listener on parent <ul> handles all child delete actions.
 * 4. IntersectionObserver: Triggers CSS animations when elements enter viewport.
 */

// --- DOM References ---
const noteForm = document.querySelector("#noteForm");
const noteInput = document.querySelector("#noteInput");
const notesList = document.querySelector("#notesList");
const clearAllBtn = document.querySelector("#clearAllBtn");
const adviceDisplay = document.querySelector("#adviceDisplay");
const noteTemplate = document.querySelector("#noteTemplate");

// --- State Management ---
let notes = JSON.parse(localStorage.getItem("notes")) || [];

/**
 * Updates the UI by syncing the current 'notes' array with the DOM.
 */
const renderNotes = () => {
  // Use DocumentFragment to batch DOM injections (Performance+)
  const fragment = document.createDocumentFragment();
  notesList.innerHTML = ""; 

  notes.forEach((text, index) => {
    const clone = noteTemplate.content.cloneNode(true);
    
    // Security: textContent prevents HTML injection (XSS)
    clone.querySelector(".note-text").textContent = text;
    
    // Attach index to the delete button for delegation
    const delBtn = clone.querySelector(".delete-btn");
    delBtn.setAttribute("data-index", index);
    
    fragment.appendChild(clone);
  });

  notesList.appendChild(fragment);
};

/**
 * Persists the current state to the browser's LocalStorage.
 */
const syncStorage = () => {
  localStorage.setItem("notes", JSON.stringify(notes));
};

// --- Event Handlers ---

// 1. Adding a Note
noteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = noteInput.value.trim();

  // Optimized Check: Ensure it's not just spaces
  if (text) {
    notes.push(text);
    syncStorage();
    renderNotes();
    noteForm.reset();
  }
});

// 2. Optimized Individual Delete (Event Delegation)
notesList.addEventListener("click", (e) => {
  // Check if the clicked element is a delete button
  const btn = e.target.closest(".delete-btn");
  if (btn) {
    const index = parseInt(btn.getAttribute("data-index"));
    notes.splice(index, 1);
    syncStorage();
    renderNotes();
  }
});

// 3. Clear All Functionality (Bug Fixed)
clearAllBtn.addEventListener("click", () => {
  if (notes.length === 0) return;
  
  // Security check before bulk delete
  if (confirm("Permanently delete all notes?")) {
    notes = [];
    syncStorage();
    renderNotes();
  }
});

// 4. Fetch API for Advice
const fetchAdvice = async () => {
  try {
    const response = await fetch("https://api.adviceslip.com/advice");
    const data = await response.json();
    adviceDisplay.textContent = `"${data.slip.advice}"`;
  } catch (err) {
    adviceDisplay.textContent = "Keep moving forward, even when offline.";
  }
};

// 5. IntersectionObserver for Animations
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, { threshold: 0.1 });

// --- Initialization ---
document.querySelectorAll(".observe").forEach(el => scrollObserver.observe(el));
renderNotes();
fetchAdvice();