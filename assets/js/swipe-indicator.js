let hidden = false;

function hideSwipeIndicator() {
  if (hidden) return;
  hidden = true;
  const el = document.getElementById("swipe-indicator");
  if (el) el.classList.add("hide");
}

export function setupSwipeIndicator() {
  window.addEventListener("scroll", hideSwipeIndicator, { passive: true });
  window.addEventListener("touchstart", hideSwipeIndicator, { passive: true });
  window.addEventListener("wheel", hideSwipeIndicator, { passive: true });
  document.addEventListener("touchmove", hideSwipeIndicator, { passive: true });
  document.addEventListener("mousedown", hideSwipeIndicator);
}
