// ================================
// DOM References
// ================================

const form = document.getElementById("noteForm");
const input = document.getElementById("noteInput");
const list = document.getElementById("notes");
const advice = document.getElementById("advice");

// ================================
// LocalStorage
// ================================

let notes = JSON.parse(localStorage.getItem("notes")) || [];

function renderNotes() {
  list.innerHTML = "";
  notes.forEach(note => {
    const li = document.createElement("li");
    li.textContent = note;
    list.appendChild(li);
  });
}

renderNotes();

// ================================
// Form + Constraint Validation API
// ================================

form.addEventListener("submit", e => {
  e.preventDefault();

  if (!form.checkValidity()) return;

  notes.push(input.value);
  localStorage.setItem("notes", JSON.stringify(notes));

  input.value = "";
  renderNotes();
});

// ================================
// Fetch API
// ================================

fetch("https://api.adviceslip.com/advice")
  .then(res => res.json())
  .then(data => advice.textContent = data.slip.advice)
  .catch(() => advice.textContent = "Offline");

// ================================
// IntersectionObserver
// ================================

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
});

document.querySelectorAll(".observe")
  .forEach(el => observer.observe(el));
