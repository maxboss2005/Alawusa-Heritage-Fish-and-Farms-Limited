// Helper to load from localStorage
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

// Helper to save to localStorage
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Add product to cart
function addToCart(id, name, price, image, quantity) {
  quantity = parseInt(quantity);
  let cart = getCart();
  const index = cart.findIndex(item => item.id === id);

  if (index !== -1) {
    cart[index].quantity += quantity;
  } else {
    cart.push({ id, name, price, image, quantity });
  }

  saveCart(cart);
  alert("Product added to cart!");
}

// Display cart items on cart.html
function renderCart() {
  if (!location.href.includes("cart.html")) return;
  
  const tbody = document.querySelector("#cart-table tbody");
  tbody.innerHTML = "";
  let cart = getCart();
  let subtotal = 0;

  cart.forEach((item, i) => {
    const row = document.createElement("tr");

    const itemSubtotal = item.price * item.quantity;
    subtotal += itemSubtotal;

    row.innerHTML = `
      <td><button onclick="removeItem(${i})">Remove</button></td>
      <td><img src="${item.image}" width="50"></td>
      <td>${item.name}</td>
      <td>₦${item.price}</td>
      <td>${item.quantity}</td>
      <td>₦${itemSubtotal}</td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById("cart-subtotal").innerText = subtotal;
  updateTotal();
}

// Remove item
function removeItem(index) {
  let cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

// Update total
function updateTotal() {
  const subtotal = parseInt(document.getElementById("cart-subtotal").innerText);
  const shipping = parseInt(document.getElementById("shipping").value) || 0;
  document.getElementById("cart-total").innerText = subtotal + shipping;
}

// Proceed to checkout
function proceedToCheckout() {
  alert("Redirecting to checkout...");
  // You can redirect to checkout.html or handle payment logic here
}

// Render cart on load
window.onload = renderCart;
