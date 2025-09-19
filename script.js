// ---------------- CART DATA ---------------- //
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Save cart
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Update cart count (navbar)
function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCount = document.getElementById("cart-count");
  if (cartCount) cartCount.innerText = count;
}

// Show popup message (bottom center)
function showPopup(message) {
  const popup = document.createElement("div");
  popup.innerText = message;
  popup.style.position = "fixed";
  popup.style.bottom = "20px";
  popup.style.left = "50%";
  popup.style.transform = "translateX(-50%)";
  popup.style.background = "#2d6a4f";
  popup.style.color = "white";
  popup.style.padding = "12px 20px";
  popup.style.borderRadius = "8px";
  popup.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
  popup.style.zIndex = "9999";
  popup.style.fontSize = "16px";
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 2500);
}

// ---------------- RENDER CART (for cart.html) ---------------- //
function renderCart() {
  const cartTable = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  if (!cartTable) return; // not on cart.html

  cartTable.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <img src="${item.image}" alt="${item.name}" width="50">
        <span>${item.name}</span>
      </td>
      <td>₹${item.price}</td>
      <td>
        <button class="qty-btn" data-index="${index}" data-action="decrease">-</button>
        <span>${item.quantity}</span>
        <button class="qty-btn" data-index="${index}" data-action="increase">+</button>
      </td>
      <td>₹${subtotal}</td>
      <td><button class="remove-btn" data-index="${index}"><i class="fa fa-times"></i></button></td>
    `;
    cartTable.appendChild(row);
  });

  if (cartTotal) cartTotal.innerText = total;
  saveCart();
  updateCartCount();
}

// ---------------- INITIALIZATION AND EVENT LISTENERS ---------------- //
function init() {
  // ✅ Add to Cart listener (fixed)
  document.querySelectorAll(".bottle").forEach((productCard) => {
    const btn = productCard.querySelector("a, .add-to-cart-btn");
    if (!btn) return;

    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const name = productCard.dataset.name || productCard.querySelector("h5").innerText;
      const price = parseFloat(productCard.dataset.price || productCard.querySelector(".des h4").innerText.replace(/[^\d]/g, ""));
      const image = productCard.dataset.img || productCard.querySelector("img").getAttribute("src");

      // check if product already in cart
      const existing = cart.find((item) => item.name === name);
      if (existing) {
        existing.quantity++;
      } else {
        cart.push({ name, price, quantity: 1, image });
      }

      saveCart();
      updateCartCount();
      showPopup(`${name} has been added to cart`);

    });
  });

  // Cart button actions listener (applies to qty and remove)
  document.addEventListener("click", (e) => {
    const qtyBtn = e.target.closest(".qty-btn");
    if (qtyBtn) {
      const index = qtyBtn.dataset.index;
      const action = qtyBtn.dataset.action;

      if (action === "increase") {
        cart[index].quantity++;
      } else if (action === "decrease" && cart[index].quantity > 1) {
        cart[index].quantity--;
      }
      renderCart();
    }

    const removeBtn = e.target.closest(".remove-btn");
    if (removeBtn) {
      const index = removeBtn.dataset.index;
      cart.splice(index, 1);
      renderCart();
    }
  });

  // Checkout on WhatsApp listener
  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
      }

      let message = "*EcoNate Order* \n Hello, I would like to place an order:%0A%0A";
      cart.forEach((item) => {
        message += `${item.name} - ${item.quantity} x ₹${item.price} = ₹${item.price * item.quantity}%0A`;
      });

      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      message += `%0A*Total: ₹${total}*`;

      const whatsappURL = `https://wa.me/918949131451?text=${message}`;
      window.open(whatsappURL, "_blank");
    });
  }
  
  // Initial page setup
  updateCartCount();
  renderCart();
}

document.addEventListener("DOMContentLoaded", init);

// Mobile menu toggle
const bar = document.getElementById("bar");
const nav = document.getElementById("navbar");
const closeBtn = document.getElementById("close-menu");

if (bar) {
  bar.addEventListener("click", () => {
    nav.classList.add("active"); // slide-in
  });
}

if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    nav.classList.remove("active"); // slide-out
  });
}

// ----- Search Functionality -----
const searchInput = document.getElementById("searchInput");
const products = document.querySelectorAll(".bottle");

if (searchInput) {
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();

    products.forEach(product => {
      const name = (product.dataset.name || "").toLowerCase();
      if (name.includes(query)) {
        product.style.display = "block"; 
      } else {
        product.style.display = "none"; 
      }
    });
  });
}

// ----- Sort Functionality -----
const sortSelect = document.getElementById("sortSelect");

if (sortSelect) {
  sortSelect.addEventListener("change", () => {
    const grid = document.querySelector(".product-grid");
    const productsArray = Array.from(products);

    let sorted;
    switch(sortSelect.value) {
      case "low":
        sorted = productsArray.sort((a, b) => a.dataset.price - b.dataset.price);
        break;
      case "high":
        sorted = productsArray.sort((a, b) => b.dataset.price - a.dataset.price);
        break;
      case "name":
        sorted = productsArray.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));
        break;
      default:
        sorted = productsArray;
    }

    grid.innerHTML = "";
    sorted.forEach(p => grid.appendChild(p));
  });
}


