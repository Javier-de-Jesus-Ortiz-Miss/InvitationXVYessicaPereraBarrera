import {
  FECHA_LIMITE_CONFIRMACION,
  MODAL_CLOSE_TIMEOUT_MS,
  MODAL_LOADING_STEP1_MS,
  MODAL_LOADING_ERROR_MS,
  MODAL_CONFIRM_SEND_MS
} from "./constants.js";

const GET_URL =
  "https://script.google.com/macros/s/AKfycbxCEPfzR5pvwSVoRQoA9ThLPBBsGU-eAgYWVP4dVToTPqcuyt96gASkvMPG-VLJLgPW/exec";
const POST_URL =
  "https://script.google.com/macros/s/AKfycbz5B-i-NxmBcuZg5y2CLKZPrbwGd7JpUfwX-jZ55XdVDw5cBU_F5blXZG85cgpMuwD3/exec";

let datosInvitados = {};
let modalState = {};

export async function obtenerDatosInvitados() {
  try {
    const response = await fetch(GET_URL);
    const json = await response.json();
    datosInvitados = json;
  } catch (err) {
    datosInvitados = {};
  }
}
// Función auxiliar para crear elementos DOM
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

export function setupConfirmarAsistenciaBtn() {
  document.addEventListener("DOMContentLoaded", function () {
    const btn = document.querySelector(".btn-confirmar-asistencia");
    if (btn) {
      btn.onclick = showConfirmModal;
    }
  });
}

export function showConfirmModal() {
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
  var navbar = document.querySelector(".floating-navbar-xv");
  if (navbar) navbar.classList.remove("visible");
  document.body.classList.add("modal-open");
  modalState = { step: 1, telefono: "", max: 0, confirmados: 1 };

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
  modal.append(closeBtn);

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
    showLoading(modal, "Verificando...");
    await obtenerDatosInvitados();
    if (datosInvitados[numero]) {
      modalState.telefono = numero;
      modalState.max = parseInt(datosInvitados[numero]);
      setTimeout(() => showSelectAsistentes(modal), MODAL_LOADING_STEP1_MS);
    } else {
      setTimeout(() => {
        showStep1(modal, "❌ El número no está registrado.");
      }, MODAL_LOADING_ERROR_MS);
    }
  };

  showStep1(modal);

  overlay.append(modal);
  document.body.append(overlay);

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
      setTimeout(() => showSelectAsistentes(modal), MODAL_LOADING_STEP1_MS);
    } else {
      setTimeout(() => {
        showStep1(modal, "❌ El número no está registrado.");
      }, MODAL_LOADING_ERROR_MS);
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
  setTimeout(closeModal, MODAL_CLOSE_TIMEOUT_MS);
}

function closeModal() {
  const overlay = document.querySelector(".confirm-modal-overlay");
  if (overlay) overlay.remove();
  document.body.classList.remove("modal-open");
  modalState = {};
  var navbar = document.querySelector(".floating-navbar-xv");
  if (navbar) navbar.classList.add("visible");
}

async function enviarConfirmacion(modal) {
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

  setTimeout(() => showFinal(modal, true), MODAL_CONFIRM_SEND_MS);
}
