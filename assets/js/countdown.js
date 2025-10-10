import { COUNTDOWN_TARGET_DATE, COUNTDOWN_INTERVAL_MS } from "./constants.js";

export function setupCountdownTimer() {
  const targetDate = COUNTDOWN_TARGET_DATE;
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const messageEl = document.getElementById("countdown-message");

  function pad(n) {
    return n.toString().padStart(2, "0");
  }

  function updateCountdown() {
    const now = new Date();
    const diff = targetDate - now;
    if (diff <= 0) {
      daysEl.textContent = "0";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      messageEl.textContent = "¡Es el gran día!";
      clearInterval(interval);
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    daysEl.textContent = days;
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  if (daysEl && hoursEl && minutesEl && secondsEl) {
    updateCountdown();
    var interval = setInterval(updateCountdown, COUNTDOWN_INTERVAL_MS);
  }
}
