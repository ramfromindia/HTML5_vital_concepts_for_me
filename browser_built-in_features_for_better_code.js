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
  const currentItems = list.children;

  // 1. Create a DocumentFragment: A "virtual" DOM node to batch updates
  // This prevents the browser from reflowing for every single item added.
  const fragment = document.createDocumentFragment();

  notes.forEach((note, index) => {
    // 2. Check if a list item already exists at this position
    if (currentItems[index]) {
      // 3. Update existing item if the text has changed
      if (currentItems[index].textContent !== note) {
        currentItems[index].textContent = note;
      }
    } else {
      // 4. If no item exists at this index, create a new one
      const li = document.createElement("li");
      li.textContent = note;
      fragment.appendChild(li);
    }
  });

  // 5. Append all new items at once
  list.appendChild(fragment);

  // 6. Remove any leftover items if the new notes array is shorter than the old one
  while (list.children.length > notes.length) {
    list.removeChild(list.lastChild);
  }
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

// IntersectionObserver API
// =====================================================
//
// Purpose:
// Allows the browser to notify JavaScript when an element
// enters or leaves the viewport (visible screen area).
//
// Why use it:
// - Efficient scroll-based animations
// - Lazy loading images or components
// - Triggering logic only when content becomes visible
//
// Compared to old scroll listeners:
// ✔ No continuous polling
// ✔ Better performance
// ✔ Browser-optimized callbacks
//
// How it works:
// 1. Create an observer with a callback function.
// 2. The browser watches selected elements.
// 3. When visibility changes, the callback runs.
// 4. Each "entry" represents one observed element.
//
// In this project:
// - We observe all elements with class ".observe".
// - When an element becomes visible (isIntersecting === true),
//   we add the "show" class.
// - CSS handles the animation.
//
// Flow:
// Browser → detects intersection
// → triggers callback
// → JavaScript adds class
// → CSS animates
// This pattern demonstrates progressive enhancement:
// HTML provides structure
// CSS defines animation
// JavaScript only triggers behavior
//
// =====================================================

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
