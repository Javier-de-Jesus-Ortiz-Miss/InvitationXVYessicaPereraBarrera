import { LOADER_FADEOUT_MS } from "./constants.js";

export function setupLoader() {
  window.addEventListener("load", function () {
    const loader = document.getElementById("loader-xv");
    const main = document.getElementById("mobile-simulator");
    if (loader && main && loader.style.display !== "none") {
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.style.display = "none";
        main.style.opacity = "1";
      }, LOADER_FADEOUT_MS);
    }
  });
}
