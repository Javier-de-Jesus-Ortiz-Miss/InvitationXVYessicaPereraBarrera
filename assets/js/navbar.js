import { NAVBAR_SHOW_DELAY_MS, INTERSECTION_THRESHOLD_GALERY } from "./constants.js";

export function setupFloatingNavbar() {
  window.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
      var navbar = document.querySelector(".floating-navbar-xv");
      if (navbar) {
        navbar.classList.add("visible");
      }
    }, NAVBAR_SHOW_DELAY_MS);

    var navbar = document.querySelector(".floating-navbar-xv");
    var galerySection = document.querySelector(".galery");
    var confirmationSection = document.querySelector(".confirmation");
    if (
      navbar &&
      galerySection &&
      confirmationSection &&
      "IntersectionObserver" in window
    ) {
      let lastState = null;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.target === galerySection && entry.isIntersecting) {
              navbar.classList.remove("visible");
              lastState = "galery";
            }
            if (entry.target === confirmationSection && entry.isIntersecting) {
              navbar.classList.add("visible");
              lastState = "confirmation";
            }
          });
        },
        {
          threshold: INTERSECTION_THRESHOLD_GALERY,
        }
      );
      observer.observe(galerySection);
      observer.observe(confirmationSection);
    }
  });
}
