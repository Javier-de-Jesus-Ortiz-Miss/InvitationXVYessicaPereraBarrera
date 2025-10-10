export function setupNavbarXV() {
  document.addEventListener("DOMContentLoaded", function () {
    var btnUbicacion = document.getElementById("btn-ubicacion-xv");
    if (btnUbicacion) {
      btnUbicacion.onclick = function () {
        var detalles = document.querySelector(".details");
        if (detalles) {
          detalles.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      };
    }
    var btnConfirmar = document.getElementById("btn-confirmar-xv");
    if (btnConfirmar) {
      btnConfirmar.onclick = function () {
        var confirmacion = document.querySelector(".confirmation");
        if (confirmacion) {
          confirmacion.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      };
    }
    var btnMusic = document.getElementById("btn-music-xv");
    var audio = document.getElementById("bg-music-xv");
    if (btnMusic && audio) {
      function updateMusicIcon() {
        var icon = btnMusic.querySelector("i");
        if (audio.paused) {
          icon.className = "fas fa-volume-mute";
          btnMusic.classList.add("music-paused");
          btnMusic.title = "Reproducir música";
        } else {
          icon.className = "fas fa-music";
          btnMusic.classList.remove("music-paused");
          btnMusic.title = "Pausar música";
        }
      }
      btnMusic.onclick = function () {
        if (audio.paused) {
          audio.play();
        } else {
          audio.pause();
        }
        updateMusicIcon();
      };
      audio.addEventListener("play", updateMusicIcon);
      audio.addEventListener("pause", updateMusicIcon);
      updateMusicIcon();
    }
  });
}
