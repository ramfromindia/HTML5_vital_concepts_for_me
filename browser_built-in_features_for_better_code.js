// =====================================================
// Optimized DOM Access & State
// =====================================================
const form = document.getElementById("noteForm");
const input = document.getElementById("noteInput");
const list = document.getElementById("notes");
const advice = document.getElementById("advice");
const template = document.getElementById("noteTemplate");

// Initialize state from LocalStorage
let notes = JSON.parse(localStorage.getItem("notes")) || [];

/**
 * Renders notes using a DocumentFragment and HTML5 Template.
 * Optimization: Minimizes reflows by updating the DOM in a single batch.
 */
function renderNotes() {
  const fragment = document.createDocumentFragment();
  list.innerHTML = ""; // Clear existing list efficiently

  notes.forEach((note, index) => {
    // Clone the template content for a fresh DOM node
    const clone = template.content.cloneNode(true);
    
    // Security: Use textContent to prevent XSS attacks
    clone.querySelector(".note-text").textContent = note;
    
    // Associate the data index with the delete button
    const deleteBtn = clone.querySelector(".delete-btn");
    deleteBtn.dataset.index = index;
    
    fragment.appendChild(clone);
  });

  list.appendChild(fragment);
}

// =====================================================
// Event Management (Optimized)
// =====================================================

// Handle Form Submission
form.addEventListener("submit", (e) => {
  e.preventDefault();
  
  // Constraint Validation API check
  if (!form.checkValidity()) return;

  const newNote = input.value.trim();
  if (newNote) {
    notes.push(newNote);
    updateStorage();
    input.value = "";
    renderNotes();
  }
});

/**
 * EVENT DELEGATION: Instead of attaching listeners to every delete button, 
 * we listen on the parent <ul> and identify the target.
 */
list.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const index = e.target.dataset.index;
    notes.splice(index, 1);
    updateStorage();
    renderNotes();
  }
});

// Clear All Functionality with security check
document.getElementById("clearAll").addEventListener("click", () => {
  if (notes.length > 0 && confirm("Are you sure you want to delete all notes?")) {
    notes = [];
    updateStorage();
    renderNotes();
  }
});

function updateStorage() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

// =====================================================
// External APIs & Observers
// =====================================================

// Fetch API with error handling
async function getAdvice() {
  try {
    const res = await fetch("https://api.adviceslip.com/advice");
    const data = await res.json();
    advice.textContent = data.slip.advice;
  } catch {
    advice.textContent = "Could not load advice. Stay positive anyway!";
  }
}

// IntersectionObserver for scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(".observe").forEach(el => observer.observe(el));

// Initial Run
renderNotes();
getAdvice();