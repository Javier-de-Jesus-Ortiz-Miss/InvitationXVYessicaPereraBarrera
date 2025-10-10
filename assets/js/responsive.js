import { RESPONSIVE_DESKTOP_WIDTH, RESPONSIVE_DESKTOP_HEIGHT } from "./constants.js";

export function isDesktop() {
  return window.innerWidth >= RESPONSIVE_DESKTOP_WIDTH;
}

export function handleResize() {
  const body = document.body;
  const simulator = document.getElementById("mobile-simulator");

  if (isDesktop()) {
    body.style.overflow = "hidden";
    simulator.style.height = `${RESPONSIVE_DESKTOP_HEIGHT}px`;
  } else {
    body.style.overflow = "";
    simulator.style.height = "auto";
  }
}

export function setupResponsiveHandlers() {
  window.addEventListener("DOMContentLoaded", handleResize);
  window.addEventListener("resize", handleResize);
}
