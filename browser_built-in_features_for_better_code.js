/**
 * MINI NOTES APP - BEHAVIOR LAYER
 * - Uses Event Delegation for performance
 * - Implements double-click verification for bulk actions
 */

const noteForm = document.querySelector("#noteForm");
const noteInput = document.querySelector("#noteInput");
const notesList = document.querySelector("#notesList");
const clearAllBtn = document.querySelector("#clearAllBtn");
const adviceDisplay = document.querySelector("#adviceDisplay");
const noteTemplate = document.querySelector("#noteTemplate");

let notes = JSON.parse(localStorage.getItem("notes")) || [];
let clearTimer = null;

const syncStorage = () => localStorage.setItem("notes", JSON.stringify(notes));

/**
 * Optimized Render Logic
 * Updates UI and manages visibility of the 'Clear All' button.
 */
const renderNotes = () => {
  const fragment = document.createDocumentFragment();
  notesList.innerHTML = ""; 

  // Toggle Clear All button visibility based on note count
  clearAllBtn.style.visibility = notes.length > 0 ? "visible" : "hidden";

  notes.forEach((text, index) => {
    const clone = noteTemplate.content.cloneNode(true);
    // .textContent is a built-in security measure against XSS
    clone.querySelector(".note-text").textContent = text;
    
    const delBtn = clone.querySelector(".delete-btn");
    delBtn.setAttribute("data-index", index);
    
    fragment.appendChild(clone);
  });
  notesList.appendChild(fragment);
};

// Form submission with trim() optimization to ignore empty spaces
noteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = noteInput.value.trim();
  if (text) {
    notes.push(text);
    syncStorage();
    renderNotes();
    noteForm.reset();
  }
});

// Event Delegation: One listener for all delete buttons
notesList.addEventListener("click", (e) => {
  const btn = e.target.closest(".delete-btn");
  if (btn) {
    const index = parseInt(btn.getAttribute("data-index"));
    notes.splice(index, 1);
    syncStorage();
    renderNotes();
  }
});

/**
 * Double-Click confirmation workaround for VS Code / restrictive environments
 */
clearAllBtn.addEventListener("click", () => {
  if (notes.length === 0) return;

  if (clearAllBtn.classList.contains("confirming")) {
    notes = [];
    syncStorage();
    renderNotes();
    resetClearButton();
  } else {
    clearAllBtn.classList.add("confirming");
    clearAllBtn.textContent = "Are you sure?";
    clearTimer = setTimeout(resetClearButton, 3000);
  }
});

function resetClearButton() {
  clearTimeout(clearTimer);
  clearAllBtn.classList.remove("confirming");
  clearAllBtn.textContent = "Clear All";
}

// Async Fetch API for advice
const fetchAdvice = async () => {
  try {
    const res = await fetch("https://api.adviceslip.com/advice");
    const data = await res.json();
    adviceDisplay.textContent = `"${data.slip.advice}"`;
  } catch {
    adviceDisplay.textContent = "Progress is progress, no matter how small.";
  }
};

// IntersectionObserver for smooth scroll-in effects
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("show");
  });
}, { threshold: 0.1 });

// Initialize App
document.querySelectorAll(".observe").forEach(el => scrollObserver.observe(el));
renderNotes();
fetchAdvice();