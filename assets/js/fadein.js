import { INTERSECTION_THRESHOLD_ANIMATION } from "./constants.js";

export function setupFadeInAnimations() {
  document.addEventListener("DOMContentLoaded", function () {
    const animatedEls = document.querySelectorAll(".fade-in-opacity");
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: INTERSECTION_THRESHOLD_ANIMATION }
      );
      animatedEls.forEach((el) => observer.observe(el));
    } else {
      animatedEls.forEach((el) => el.classList.add("visible"));
    }
  });
}
