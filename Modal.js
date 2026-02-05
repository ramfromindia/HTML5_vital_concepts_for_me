const openBtn = document.querySelector("[data-modal-open]");
const modal = document.querySelector("[data-modal]");
const closeBtns = document.querySelectorAll("[data-modal-close]");

openBtn.addEventListener("click", () => {
  modal.classList.add("active");
});

closeBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    modal.classList.remove("active");
  });
});
