// ===============================
// VITALPET - CHECKOUT.JS
// Lee carrito desde localStorage
// Renderiza + valida + guarda datos para confirmación
// ===============================

// Helpers
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const CART_KEY = "vitalpet_cart";
const CHECKOUT_DATA_KEY = "vitalpet_checkout_data";

// UI
const cartItemsList = $("#cartItemsList");
const subtotalDisplay = $("#subtotalDisplay");
const envioDisplay = $("#envioDisplay");
const totalDisplay = $("#totalDisplay");

const btnVolver = $("#btnVolver");
const btnProcesar = $("#btnProcesar");

const alertError = $("#alertError");
const alertSuccess = $("#alertSuccess");
const alertWarning = $("#alertWarning");

const processingOverlay = $("#processingOverlay");

// Campos form
const nombreCliente = $("#nombreCliente");
const emailCliente = $("#emailCliente");
const telefonoCliente = $("#telefonoCliente");

const direccionCalle = $("#direccionCalle");
const direccionNumero = $("#direccionNumero");
const direccionApartamento = $("#direccionApartamento");
const direccionCodigoPostal = $("#direccionCodigoPostal");
const direccionCiudad = $("#direccionCiudad");
const direccionDepartamento = $("#direccionDepartamento");

const notasOrden = $("#notasOrden");

// Pago
const paymentCards = $$(".payment-method-card");

const paymentFieldsTarjeta = $("#paymentFieldsTarjeta");
const paymentFieldsPSE = $("#paymentFieldsPSE");
const paymentFieldsNequi = $("#paymentFieldsNequi");
const paymentFieldsEfectivo = $("#paymentFieldsEfectivo");

const numeroTarjeta = $("#numeroTarjeta");
const fechaTarjeta = $("#fechaTarjeta");
const cvvTarjeta = $("#cvvTarjeta");
const nombreTarjeta = $("#nombreTarjeta");

const bancoPSE = $("#bancoPSE");
const numeroNequi = $("#numeroNequi");

// Estado
let cart = [];
let selectedPayment = "";

// ===============================
// Helpers precio
// ===============================
function formatPrice(num) {
  return "$" + Number(num).toLocaleString("es-CO");
}

// ===============================
// Alerts
// ===============================
function hideAlerts() {
  alertError.classList.remove("show");
  alertSuccess.classList.remove("show");
  alertWarning.classList.remove("show");
}

function showAlert(type, msg) {
  hideAlerts();

  const el =
    type === "error" ? alertError :
    type === "success" ? alertSuccess :
    alertWarning;

  el.textContent = msg;
  el.classList.add("show");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===============================
// Storage
// ===============================
function loadCartFromStorage() {
  const saved = localStorage.getItem(CART_KEY);
  cart = saved ? JSON.parse(saved) : [];
}

function saveCartToStorage() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function clearCartStorage() {
  localStorage.removeItem(CART_KEY);
}

// ===============================
// Totales
// ===============================
function getSubtotal() {
  return cart.reduce((acc, item) => acc + item.price * item.qty, 0);
}

function getShippingCost(subtotal) {
  if (subtotal === 0) return 0;
  if (subtotal >= 50000) return 0;
  return 8000;
}

function updateTotals() {
  const subtotal = getSubtotal();
  const envio = getShippingCost(subtotal);
  const total = subtotal + envio;

  subtotalDisplay.textContent = formatPrice(subtotal);
  envioDisplay.textContent = envio === 0 ? "Gratis 🎉" : formatPrice(envio);

  // OJO: tu HTML no tiene totalDisplay aún, así que validamos
  if (totalDisplay) totalDisplay.textContent = formatPrice(total);

  return { subtotal, envio, total };
}

// ===============================
// Render carrito
// ===============================
function renderCart() {
  cartItemsList.innerHTML = "";

  if (cart.length === 0) {
    cartItemsList.innerHTML = `
      <div style="padding: 20px; color: #666; text-align:center; font-weight:700;">
        Tu carrito está vacío 🐾 <br><br>
        Vuelve a la tienda y agrega productos.
      </div>
    `;
    updateTotals();
    btnProcesar.disabled = true;
    return;
  }

  btnProcesar.disabled = false;

  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item-row";

    row.innerHTML = `
      <img class="cart-item-image" src="${item.image}" alt="${item.name}">
      
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
        
        <div style="margin-top:10px;">
          <div class="quantity-control">
            <button class="quantity-btn btn-minus">−</button>
            <span class="quantity-display">${item.qty}</span>
            <button class="quantity-btn btn-plus">+</button>
          </div>
        </div>
      </div>

      <button class="remove-btn" title="Eliminar">✖</button>
    `;

    // −
    row.querySelector(".btn-minus").addEventListener("click", () => {
      item.qty -= 1;
      if (item.qty <= 0) {
        cart = cart.filter((p) => p.id !== item.id);
      }
      saveCartToStorage();
      renderCart();
      updateTotals();
    });

    // +
    row.querySelector(".btn-plus").addEventListener("click", () => {
      item.qty += 1;
      saveCartToStorage();
      renderCart();
      updateTotals();
    });

    // eliminar
    row.querySelector(".remove-btn").addEventListener("click", () => {
      cart = cart.filter((p) => p.id !== item.id);
      saveCartToStorage();
      renderCart();
      updateTotals();
    });

    cartItemsList.appendChild(row);
  });

  updateTotals();
}

// ===============================
// Pago UI
// ===============================
function hideAllPaymentFields() {
  paymentFieldsTarjeta.classList.remove("active");
  paymentFieldsPSE.classList.remove("active");
  paymentFieldsNequi.classList.remove("active");
  paymentFieldsEfectivo.classList.remove("active");
}

function selectPayment(method) {
  selectedPayment = method;

  paymentCards.forEach((c) => c.classList.remove("selected"));
  const card = document.querySelector(`.payment-method-card[data-method="${method}"]`);
  card?.classList.add("selected");

  hideAllPaymentFields();

  if (method === "tarjeta") paymentFieldsTarjeta.classList.add("active");
  if (method === "pse") paymentFieldsPSE.classList.add("active");
  if (method === "nequi") paymentFieldsNequi.classList.add("active");
  if (method === "efectivo") paymentFieldsEfectivo.classList.add("active");
}

// ===============================
// Validaciones
// ===============================
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateCheckout() {
  if (!nombreCliente.value.trim()) return "Falta tu nombre completo.";
  if (!emailCliente.value.trim()) return "Falta tu email.";
  if (!isValidEmail(emailCliente.value.trim())) return "El email no es válido.";
  if (!telefonoCliente.value.trim()) return "Falta tu teléfono.";

  if (!direccionCalle.value.trim()) return "Falta la calle.";
  if (!direccionNumero.value.trim()) return "Falta el número de la dirección.";
  if (!direccionCiudad.value.trim()) return "Falta la ciudad.";
  if (!direccionDepartamento.value.trim()) return "Falta el departamento.";

  if (!selectedPayment) return "Selecciona un método de pago.";

  if (selectedPayment === "tarjeta") {
    if (!numeroTarjeta.value.trim()) return "Falta el número de tarjeta.";
    if (numeroTarjeta.value.replace(/\s/g, "").length < 13) return "Número de tarjeta inválido.";
    if (!fechaTarjeta.value.trim()) return "Falta el vencimiento.";
    if (!cvvTarjeta.value.trim()) return "Falta el CVV.";
    if (!nombreTarjeta.value.trim()) return "Falta el nombre del titular.";
  }

  if (selectedPayment === "pse") {
    if (!bancoPSE.value) return "Selecciona tu banco en PSE.";
  }

  if (selectedPayment === "nequi") {
    if (!numeroNequi.value.trim()) return "Falta el número Nequi.";
    if (numeroNequi.value.trim().length !== 10) return "El número Nequi debe tener 10 dígitos.";
  }

  return "";
}

// ===============================
// Guardar para confirmación
// ===============================
function buildDireccionCompleta() {
  let direccion = `${direccionCalle.value.trim()} #${direccionNumero.value.trim()}`;

  if (direccionApartamento.value.trim()) {
    direccion += `, Apto ${direccionApartamento.value.trim()}`;
  }

  if (direccionCodigoPostal.value.trim()) {
    direccion += `, CP ${direccionCodigoPostal.value.trim()}`;
  }

  direccion += `, ${direccionCiudad.value.trim()} - ${direccionDepartamento.value.trim()}`;

  return direccion;
}

function getPaymentLabel() {
  if (selectedPayment === "tarjeta") return "Tarjeta";
  if (selectedPayment === "pse") return "PSE";
  if (selectedPayment === "nequi") return "Nequi";
  if (selectedPayment === "efectivo") return "Contra entrega";
  return "No definido";
}

// ===============================
// Procesar compra (simulado)
// ===============================
function processOrder() {
  hideAlerts();

  if (cart.length === 0) {
    showAlert("warning", "Tu carrito está vacío.");
    return;
  }

  const error = validateCheckout();
  if (error) {
    showAlert("error", error);
    return;
  }

  const totals = updateTotals();

  // Guardar datos para confirmación
  const checkoutData = {
    nombre: nombreCliente.value.trim(),
    email: emailCliente.value.trim(),
    telefono: telefonoCliente.value.trim(),
    direccion: buildDireccionCompleta(),
    metodoPago: getPaymentLabel(),
    notas: notasOrden.value.trim(),
    subtotal: formatPrice(totals.subtotal),
    envio: totals.envio === 0 ? "Gratis" : formatPrice(totals.envio),
    total: formatPrice(totals.total),
    cart: cart
  };

  localStorage.setItem(CHECKOUT_DATA_KEY, JSON.stringify(checkoutData));

  // Simulación
  processingOverlay?.classList.add("active");

  setTimeout(() => {
    processingOverlay?.classList.remove("active");

    // IMPORTANTE:
    // NO borramos el checkout_data todavía
    // porque confirmación lo necesita.
    clearCartStorage();

    window.location.href = "confirmacion.html";
  }, 1500);
}

// ===============================
// Formateo tarjeta
// ===============================
function initCardInputs() {
  numeroTarjeta?.addEventListener("input", () => {
    let value = numeroTarjeta.value.replace(/\D/g, "").slice(0, 16);
    value = value.replace(/(.{4})/g, "$1 ").trim();
    numeroTarjeta.value = value;
  });

  fechaTarjeta?.addEventListener("input", () => {
    let value = fechaTarjeta.value.replace(/\D/g, "").slice(0, 4);
    if (value.length >= 3) value = value.slice(0, 2) + "/" + value.slice(2);
    fechaTarjeta.value = value;
  });

  cvvTarjeta?.addEventListener("input", () => {
    cvvTarjeta.value = cvvTarjeta.value.replace(/\D/g, "").slice(0, 4);
  });
}

// ===============================
// Eventos
// ===============================
btnVolver.addEventListener("click", () => {
  window.location.href = "productos.html";
});

btnProcesar.addEventListener("click", processOrder);

paymentCards.forEach((card) => {
  card.addEventListener("click", () => {
    selectPayment(card.dataset.method);
  });
});

// ===============================
// INIT
// ===============================
loadCartFromStorage();
renderCart();
updateTotals();
initCardInputs();
