const FECHA_LIMITE_CONFIRMACION = new Date("2025-08-01T23:59:00");

function isDesktop() {
  return window.innerWidth >= 700;
}

function handleResize() {
  const body = document.body;
  const simulator = document.getElementById("mobile-simulator");

  if (isDesktop()) {
    body.style.overflow = "hidden";
    simulator.style.height = "800px";
  } else {
    body.style.overflow = "";
    simulator.style.height = "auto";
  }
}

window.addEventListener("DOMContentLoaded", handleResize);
window.addEventListener("resize", handleResize);

// Mostrar navbar flotante después de 2 segundos con transición suave
window.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    var navbar = document.querySelector(".floating-navbar-xv");
    if (navbar) {
      navbar.classList.add("visible");
    }
  }, 2000);

  // --- Ocultar navbar al llegar a galería, mostrarlo en confirmar asistencia ---
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
        threshold: 0.4,
      }
    );
    observer.observe(galerySection);
    observer.observe(confirmationSection);
  }
});

// === ASIGNAR EVENTO AL BOTÓN DE CONFIRMAR ASISTENCIA ===
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.querySelector(".btn-confirmar-asistencia");
  if (btn) {
    btn.onclick = showConfirmModal;
  }
});

// Countdown Timer
(function () {
  const targetDate = new Date("2025-08-02T00:00:00");
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const messageEl = document.getElementById("countdown-message");
  const timerEl = document.getElementById("countdown-timer");

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
    var interval = setInterval(updateCountdown, 1000);
  }
})();

// === MODAL CONFIRMACIÓN ASISTENCIA ===
const GET_URL =
  "https://script.google.com/macros/s/AKfycbxCEPfzR5pvwSVoRQoA9ThLPBBsGU-eAgYWVP4dVToTPqcuyt96gASkvMPG-VLJLgPW/exec";
const POST_URL =
  "https://script.google.com/macros/s/AKfycbz5B-i-NxmBcuZg5y2CLKZPrbwGd7JpUfwX-jZ55XdVDw5cBU_F5blXZG85cgpMuwD3/exec";

let datosInvitados = {};
let modalState = {};

// Cargar datos al inicio
async function obtenerDatosInvitados() {
  try {
    const response = await fetch(GET_URL);
    const json = await response.json();
    datosInvitados = json;
  } catch (err) {
    datosInvitados = {};
  }
}
obtenerDatosInvitados();

// Utilidad para crear elementos
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith("on") && typeof v === "function")
      node[k.toLowerCase()] = v;
    else if (k === "class") node.className = v;
    else node.setAttribute(k, v);
  }
  for (const c of children) node.append(c);
  return node;
}

// Modal principal
function showConfirmModal() {
  // Validar fecha límite antes de mostrar el modal normal
  if (new Date() > FECHA_LIMITE_CONFIRMACION) {
    if (document.querySelector(".confirm-modal-overlay")) return;
    document.body.classList.add("modal-open");
    const overlay = el("div", { class: "confirm-modal-overlay" });
    const modal = el("div", { class: "confirm-modal" });
    const closeBtn = el(
      "button",
      {
        class: "modal-close",
        type: "button",
        title: "Cerrar",
        onclick: closeModal,
      },
      "×"
    );
    modal.append(
      closeBtn,
      el("h2", {}, "Confirmación cerrada"),
      el(
        "div",
        { class: "modal-final modal-error" },
        "Las confirmaciones de asistencia ya han cerrado."
      )
    );
    overlay.append(modal);
    document.body.append(overlay);
    overlay.tabIndex = -1;
    overlay.focus();
    overlay.onkeydown = (e) => {
      if (e.key === "Escape") closeModal();
    };
    return;
  }

  if (document.querySelector(".confirm-modal-overlay")) return;
  // Oculta el navbar flotante al abrir el modal
  var navbar = document.querySelector(".floating-navbar-xv");
  if (navbar) navbar.classList.remove("visible");
  document.body.classList.add("modal-open");
  modalState = { step: 1, telefono: "", max: 0, confirmados: 1 };

  // Overlay
  const overlay = el("div", { class: "confirm-modal-overlay" });

  // Modal content
  const modal = el("div", { class: "confirm-modal" });

  // Cerrar modal
  const closeBtn = el(
    "button",
    {
      class: "modal-close",
      type: "button",
      title: "Cerrar",
      onclick: closeModal,
    },
    "×"
  );
  modal.append(closeBtn);

  // Paso 1: Ingresar teléfono
  const title = el("h2", {}, "Confirmar asistencia");
  const msg = el("div", { class: "modal-msg", id: "modal-msg" }, "");
  const input = el("input", {
    type: "text",
    id: "modal-phone",
    placeholder: "Ingresa tu número de teléfono",
    autocomplete: "tel",
    maxlength: 15,
    style: "text-align:center;",
  });
  const btn = el(
    "button",
    { class: "modal-btn", id: "modal-verificar", type: "button" },
    "Verificar"
  );

  btn.onclick = async () => {
    const numero = input.value.trim();
    msg.textContent = "";
    if (!numero) {
      msg.textContent = "⚠️ Ingresa un número de teléfono.";
      msg.className = "modal-msg modal-error";
      return;
    }
    // Animación de carga
    showLoading(modal, "Verificando...");
    await obtenerDatosInvitados();
    if (datosInvitados[numero]) {
      modalState.telefono = numero;
      modalState.max = parseInt(datosInvitados[numero]);
      setTimeout(() => showSelectAsistentes(modal), 700);
    } else {
      setTimeout(() => {
        showStep1(modal, "❌ El número no está registrado.");
      }, 900);
    }
  };

  showStep1(modal);

  overlay.append(modal);
  document.body.append(overlay);

  // Cerrar con ESC
  overlay.tabIndex = -1;
  overlay.focus();
  overlay.onkeydown = (e) => {
    if (e.key === "Escape") closeModal();
  };
}

function showStep1(modal, errorMsg = "") {
  modal.innerHTML = "";
  modal.append(
    el(
      "button",
      {
        class: "modal-close",
        type: "button",
        title: "Cerrar",
        onclick: closeModal,
      },
      "×"
    ),
    el("h2", {}, "Confirmar asistencia"),
    el("div", { class: "modal-msg modal-error", id: "modal-msg" }, errorMsg),
    el("input", {
      type: "text",
      id: "modal-phone",
      placeholder: "Ingresa tu número de teléfono",
      autocomplete: "tel",
      maxlength: 15,
      style: "text-align:center;",
    }),
    el(
      "button",
      { class: "modal-btn", id: "modal-verificar", type: "button" },
      "Verificar"
    )
  );
  modal.querySelector("#modal-verificar").onclick = async () => {
    const numero = modal.querySelector("#modal-phone").value.trim();
    const msg = modal.querySelector("#modal-msg");
    msg.textContent = "";
    if (!numero) {
      msg.textContent = "⚠️ Ingresa un número de teléfono.";
      msg.className = "modal-msg modal-error";
      return;
    }
    showLoading(modal, "Verificando...");
    await obtenerDatosInvitados();
    if (datosInvitados[numero]) {
      modalState.telefono = numero;
      modalState.max = parseInt(datosInvitados[numero]);
      setTimeout(() => showSelectAsistentes(modal), 700);
    } else {
      setTimeout(() => {
        showStep1(modal, "❌ El número no está registrado.");
      }, 900);
    }
  };
  modal.querySelector("#modal-phone").focus();
}

function showLoading(modal, text) {
  modal.innerHTML = "";
  modal.append(
    el(
      "button",
      {
        class: "modal-close",
        type: "button",
        title: "Cerrar",
        onclick: closeModal,
      },
      "×"
    ),
    el(
      "div",
      { class: "modal-loading" },
      el("div", { class: "spinner" }),
      el("div", { class: "modal-small" }, text)
    )
  );
}

function showSelectAsistentes(modal) {
  modal.innerHTML = "";
  modal.append(
    el(
      "button",
      {
        class: "modal-close",
        type: "button",
        title: "Cerrar",
        onclick: closeModal,
      },
      "×"
    ),
    el("h2", {}, "Selecciona asistentes"),
    el(
      "div",
      { class: "modal-msg", id: "modal-msg2" },
      `Puedes confirmar hasta ${modalState.max} persona(s).`
    ),
    el("label", { for: "modal-select" }, "¿Cuántas personas asistirán?"),
    (() => {
      const sel = el("select", {
        id: "modal-select",
        style: "text-align:center;",
      });
      // Opción "Sin Asistencia"
      sel.append(el("option", { value: "0" }, "Sin Asistencia"));
      for (let i = 1; i <= modalState.max; i++) {
        sel.append(
          el("option", { value: i }, `${i} persona${i > 1 ? "s" : ""}`)
        );
      }
      sel.value = "1";
      return sel;
    })(),
    el(
      "button",
      { class: "modal-btn", id: "modal-confirmar", type: "button" },
      "Confirmar asistencia"
    )
  );
  modal.querySelector("#modal-confirmar").onclick = () => {
    const cant = modal.querySelector("#modal-select").value;
    modalState.confirmados = cant;
    showLoading(modal, "Enviando confirmación...");
    enviarConfirmacion(modal);
  };
}

function showFinal(modal, ok = true) {
  modal.innerHTML = "";
  modal.append(
    el(
      "button",
      {
        class: "modal-close",
        type: "button",
        title: "Cerrar",
        onclick: closeModal,
      },
      "×"
    ),
    el(
      "div",
      { class: ok ? "modal-final" : "modal-final modal-error" },
      ok
        ? "¡Asistencia confirmada correctamente!✅ "
        : "❌ Ocurrió un error. Intenta de nuevo."
    )
  );
  setTimeout(closeModal, 1800);
}

function closeModal() {
  const overlay = document.querySelector(".confirm-modal-overlay");
  if (overlay) overlay.remove();
  document.body.classList.remove("modal-open");
  modalState = {};
  // Vuelve a mostrar el navbar flotante al cerrar el modal
  var navbar = document.querySelector(".floating-navbar-xv");
  if (navbar) navbar.classList.add("visible");
}

async function enviarConfirmacion(modal) {
  // Enviar usando un formulario oculto y un iframe invisible
  const tempForm = document.createElement("form");
  tempForm.action = POST_URL;
  tempForm.method = "POST";
  tempForm.target = "hidden-frame-confirm";
  tempForm.style.display = "none";

  const telefonoInput = document.createElement("input");
  telefonoInput.name = "telefono";
  telefonoInput.value = modalState.telefono;

  const confirmadosInput = document.createElement("input");
  confirmadosInput.name = "confirmados";
  confirmadosInput.value = modalState.confirmados;

  tempForm.appendChild(telefonoInput);
  tempForm.appendChild(confirmadosInput);

  // Iframe invisible
  let iframe = document.getElementById("hidden-frame-confirm");
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.name = "hidden-frame-confirm";
    iframe.id = "hidden-frame-confirm";
    iframe.style.display = "none";
    document.body.appendChild(iframe);
  }

  document.body.appendChild(tempForm);
  tempForm.submit();
  tempForm.remove();

  setTimeout(() => showFinal(modal, true), 1200);
}

// === GALERÍA DE FOTOS CON MODAL ===
(function () {
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
    }, 250);
  }

  function animateImgChange(newIndex, direction = 1) {
    if (isAnimating) return;
    isAnimating = true;
    // Elimina animaciones previas
    modalImg.classList.remove(
      "galery-img-fadein",
      "galery-img-fadeout",
      "galery-img-slidein-left",
      "galery-img-slideout-left",
      "galery-img-slidein-right",
      "galery-img-slideout-right"
    );
    // Aplica animación de salida según dirección
    if (direction > 0) {
      modalImg.classList.add("galery-img-slideout-left");
    } else {
      modalImg.classList.add("galery-img-slideout-right");
    }
    setTimeout(() => {
      // Cambia la imagen
      currentIndex = newIndex;
      updateGaleryModal();
      // Elimina animación de salida
      modalImg.classList.remove(
        "galery-img-slideout-left",
        "galery-img-slideout-right"
      );
      // Aplica animación de entrada según dirección
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
      }, 300);
    }, 300);
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

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".galery-img-photo").forEach(function (el) {
      el.addEventListener("click", function () {
        const idx = parseInt(el.getAttribute("data-index"), 10);
        showGaleryModal(idx);
      });
    });
  });
})();

// === NAVBAR FLOTANTE XV FUNCIONALIDAD ===
document.addEventListener("DOMContentLoaded", function () {
  // Ubicación
  var btnUbicacion = document.getElementById("btn-ubicacion-xv");
  if (btnUbicacion) {
    btnUbicacion.onclick = function () {
      var detalles = document.querySelector(".details");
      if (detalles) {
        detalles.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };
  }
  // Confirmar asistencia
  var btnConfirmar = document.getElementById("btn-confirmar-xv");
  if (btnConfirmar) {
    btnConfirmar.onclick = function () {
      var confirmacion = document.querySelector(".confirmation");
      if (confirmacion) {
        confirmacion.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };
  }
  // Música
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
      { threshold: 0.15 }
    );
    animatedEls.forEach((el) => observer.observe(el));
  } else {
    // Fallback para navegadores antiguos
    animatedEls.forEach((el) => el.classList.add("visible"));
  }
});

window.addEventListener("load", function () {
  const loader = document.getElementById("loader-xv");
  const main = document.getElementById("mobile-simulator");
  if (loader && main && loader.style.display !== "none") {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
      main.style.opacity = "1";
    }, 1600);
  }
});

// === INDICADOR DE DESLIZAR ===
(function () {
  let hidden = false;
  function hideSwipeIndicator() {
    if (hidden) return;
    hidden = true;
    const el = document.getElementById("swipe-indicator");
    if (el) el.classList.add("hide");
  }
  window.addEventListener("scroll", hideSwipeIndicator, { passive: true });
  window.addEventListener("touchstart", hideSwipeIndicator, { passive: true });
  window.addEventListener("wheel", hideSwipeIndicator, { passive: true });
  // También ocultar si el usuario toca la pantalla (para móviles)
  document.addEventListener("touchmove", hideSwipeIndicator, { passive: true });
  // Si el usuario hace click (por si acaso)
  document.addEventListener("mousedown", hideSwipeIndicator);
})();
