import { GALERY_ANIMATION_MS, GALERY_MODAL_CLOSE_ANIM_MS } from "./constants.js";

const galeryImages = [
  "assets/img/galery1.webp",
  "assets/img/galery2.webp",
  "assets/img/galery3.webp",
  "assets/img/galery4.webp",
  "assets/img/galery5.webp",
  "assets/img/galery6.webp",
  "assets/img/galery7.webp",
  "assets/img/galery8.webp",
  "assets/img/galery9.webp",
  "assets/img/galery10.webp",
  "assets/img/galery11.webp",
  "assets/img/galery12.webp",
];

let modal, modalImg, modalOverlay, btnClose, btnPrev, btnNext;
let currentIndex = 0;
let isAnimating = false;

function animateModalOpen() {
  modal.classList.remove("galery-modal-close-anim");
  modal.classList.add("galery-modal-open-anim");
  modalImg.classList.remove("galery-img-fadeout");
  modalImg.classList.add("galery-img-fadein");
}

function animateModalClose(cb) {
  modal.classList.remove("galery-modal-open-anim");
  modal.classList.add("galery-modal-close-anim");
  modalImg.classList.remove("galery-img-fadein");
  modalImg.classList.add("galery-img-fadeout");
  setTimeout(() => {
    modal.classList.remove("galery-modal-close-anim");
    modalImg.classList.remove("galery-img-fadeout");
    if (cb) cb();
  }, GALERY_MODAL_CLOSE_ANIM_MS);
}

function animateImgChange(newIndex, direction = 1) {
  if (isAnimating) return;
  isAnimating = true;
  modalImg.classList.remove(
    "galery-img-fadein",
    "galery-img-fadeout",
    "galery-img-slidein-left",
    "galery-img-slideout-left",
    "galery-img-slidein-right",
    "galery-img-slideout-right"
  );
  if (direction > 0) {
    modalImg.classList.add("galery-img-slideout-left");
  } else {
    modalImg.classList.add("galery-img-slideout-right");
  }
  setTimeout(() => {
    currentIndex = newIndex;
    updateGaleryModal();
    modalImg.classList.remove(
      "galery-img-slideout-left",
      "galery-img-slideout-right"
    );
    if (direction > 0) {
      modalImg.classList.add("galery-img-slidein-right");
    } else {
      modalImg.classList.add("galery-img-slidein-left");
    }
    setTimeout(() => {
      modalImg.classList.remove(
        "galery-img-slidein-left",
        "galery-img-slidein-right"
      );
      isAnimating = false;
    }, GALERY_ANIMATION_MS);
  }, GALERY_ANIMATION_MS);
}

function showGaleryModal(index) {
  if (!modal) {
    modal = document.getElementById("galery-modal");
    modalImg = modal.querySelector(".galery-modal-img");
    modalOverlay = modal.querySelector(".galery-modal-overlay");
    btnClose = modal.querySelector(".galery-modal-close");
    btnPrev = modal.querySelector(".galery-modal-prev");
    btnNext = modal.querySelector(".galery-modal-next");
    btnClose.onclick = closeGaleryModal;
    modalOverlay.onclick = closeGaleryModal;
    btnPrev.onclick = function (e) {
      e.stopPropagation();
      if (isAnimating) return;
      const newIdx =
        (currentIndex - 1 + galeryImages.length) % galeryImages.length;
      animateImgChange(newIdx, -1);
    };
    btnNext.onclick = function (e) {
      e.stopPropagation();
      if (isAnimating) return;
      const newIdx = (currentIndex + 1) % galeryImages.length;
      animateImgChange(newIdx, 1);
    };
    document.addEventListener("keydown", galeryModalKeyHandler);
  }
  currentIndex = index;
  updateGaleryModal();
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
  animateModalOpen();
}

function closeGaleryModal() {
  if (modal) {
    animateModalClose(() => {
      modal.style.display = "none";
      document.body.style.overflow = "";
    });
  }
}

function updateGaleryModal() {
  if (modalImg) {
    modalImg.src = galeryImages[currentIndex];
    modalImg.alt = "Galería " + (currentIndex + 1);
  }
}

function changeGaleryImg(delta) {
  if (isAnimating) return;
  const newIdx =
    (currentIndex + delta + galeryImages.length) % galeryImages.length;
  animateImgChange(newIdx, delta);
}

function galeryModalKeyHandler(e) {
  if (!modal || modal.style.display !== "flex" || isAnimating) return;
  if (e.key === "Escape") closeGaleryModal();
  if (e.key === "ArrowLeft") changeGaleryImg(-1);
  if (e.key === "ArrowRight") changeGaleryImg(1);
}

export function setupGaleryModal() {
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".galery-img-photo").forEach(function (el) {
      el.addEventListener("click", function () {
        const idx = parseInt(el.getAttribute("data-index"), 10);
        showGaleryModal(idx);
      });
    });
  });
}
