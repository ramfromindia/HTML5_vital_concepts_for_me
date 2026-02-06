/**
 * MINI NOTES APP - BEHAVIOR LAYER
 * Includes double-click "Clear All" workaround for VS Code environments.
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

const renderNotes = () => {
  const fragment = document.createDocumentFragment();
  notesList.innerHTML = ""; 

  notes.forEach((text, index) => {
    const clone = noteTemplate.content.cloneNode(true);
    clone.querySelector(".note-text").textContent = text;
    
    const delBtn = clone.querySelector(".delete-btn");
    delBtn.setAttribute("data-index", index);
    
    fragment.appendChild(clone);
  });
  notesList.appendChild(fragment);
};

// Add Note logic
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

// Individual Delete (Event Delegation)
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
 * Optimized Clear All (VS Code Workaround)
 * First click arming the button, second click executing.
 */
clearAllBtn.addEventListener("click", () => {
  if (notes.length === 0) return;

  if (clearAllBtn.classList.contains("confirming")) {
    // Second Click: Execute
    notes = [];
    syncStorage();
    renderNotes();
    resetClearButton();
  } else {
    // First Click: Arm
    clearAllBtn.classList.add("confirming");
    clearAllBtn.textContent = "Click again to confirm";
    
    // Safety: Reset after 3 seconds of inactivity
    clearTimer = setTimeout(resetClearButton, 3000);
  }
});

function resetClearButton() {
  clearTimeout(clearTimer);
  clearAllBtn.classList.remove("confirming");
  clearAllBtn.textContent = "Clear All";
}

// Fetch Advice API
const fetchAdvice = async () => {
  try {
    const res = await fetch("https://api.adviceslip.com/advice");
    const data = await res.json();
    adviceDisplay.textContent = `"${data.slip.advice}"`;
  } catch {
    adviceDisplay.textContent = "Keep building great things!";
  }
};

// Scroll Observer for animations
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("show");
  });
}, { threshold: 0.1 });

// Init
document.querySelectorAll(".observe").forEach(el => scrollObserver.observe(el));
renderNotes();
fetchAdvice();