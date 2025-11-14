
  // Load cart from localStorage (empty by default)
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Render cart items
function renderCart() {
  const cartContainer = document.getElementById('cart-items');
  let subtotal = 0;
  let shippingTotal = 0;

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <h3>Your cart is empty</h3>
        <p>Add some products to your cart</p>
        <a href="products.html" class="continue-shopping">Browse Products</a>
      </div>
    `;
    
    // Update summary with zeros
    updateCartSummary(0, 0, 0);
    updateCartCount();
    return;
  }

  cartContainer.innerHTML = '';
  
  cart.forEach((item, index) => {
    const itemSubtotal = item.price * item.quantity;
    const itemShipping = (item.shipping || 1600) * item.quantity;

    subtotal += itemSubtotal;
    shippingTotal += itemShipping;

    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <div class="item-image">
        <img src="${item.image}" alt="${item.name}" class="item-image">
      </div>
      <div class="item-details">
        <h3>${item.name}</h3>
        <p>Fresh and healthy</p>
      </div>
      <div class="item-price">₦${item.price.toLocaleString()}</div>
      <div class="item-qty">
        <div class="quantity-controls">
          <button class="qty-btn" onclick="updateQuantity(${index}, ${item.quantity - 1})">-</button>
          <input type="text" class="qty-input" value="${item.quantity}" readonly>
          <button class="qty-btn" onclick="updateQuantity(${index}, ${item.quantity + 1})">+</button>
        </div>
      </div>
      <div class="item-subtotal">₦${itemSubtotal.toLocaleString()}</div>
      <div class="item-action">
        <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
      </div>
    `;
    cartContainer.appendChild(cartItem);
  });

  const total = subtotal + shippingTotal;
  
  // Update the cart summary with calculated values
  updateCartSummary(subtotal, shippingTotal, total);

  updateCartCount();
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Function to update cart summary
function updateCartSummary(subtotal, shipping, total) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  document.getElementById('subtotal-text').textContent = `Subtotal (${totalItems} items)`;
  document.getElementById('subtotal-amount').textContent = `₦${subtotal.toLocaleString()}`;
  document.getElementById('shipping-amount').textContent = `₦${shipping.toLocaleString()}`;
  document.getElementById('total-amount').textContent = `₦${total.toLocaleString()}`;

    updateCartCount();
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  // Update item quantity
  
function updateQuantity(index, newQuantity) {
  if (newQuantity < 1) {
    removeItem(index);
    return;
  }

  cart[index].quantity = newQuantity;
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart(); // This will update the summary
}

// Remove item from cart
function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart(); // This will update the summary
}

  // Update cart count in header
  function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
  }

  // Checkout function
  // Enhanced checkout function with Flutterwave for Naira payments
async function checkout() {
  const checkoutBtn = document.querySelector('.checkout-btn');
  const originalText = checkoutBtn.innerHTML;
  
  // Show loading
  checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  checkoutBtn.disabled = true;

  const method = document.querySelector('input[name="paymentMethod"]:checked').value;
  const totalAmount = cart.reduce((sum, item) => {
    const qty = item.quantity || 1;
    return sum + (item.price * qty) + ((item.shipping || 1600) * qty);
  }, 0);

  if (cart.length === 0) {
    showToast('Your cart is empty');
    checkoutBtn.innerHTML = originalText;
    checkoutBtn.disabled = false;
    return;
  }

  if (totalAmount <= 0) {
    showToast('Invalid total amount');
    checkoutBtn.innerHTML = originalText;
    checkoutBtn.disabled = false;
    return;
  }

  try {
    if (method === "naira") {
      // Generate unique transaction reference for guest user
      const txRef = "ALW_GUEST_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      
      // For guest users, we'll use localStorage to track the transaction
      const transactionData = {
        tx_ref: txRef,
        amount: totalAmount,
        currency: "NGN",
        status: "initiated",
        customer: {
          email: "guest@alawusa.com", // Default email for guests
          name: "Guest Customer",
          phone: "08000000000" // Default phone
        },
        cart: cart,
        created_at: new Date().toISOString(),
        user_type: "guest"
      };
      
      // Save transaction to localStorage for guest users
      localStorage.setItem("currentTransaction", JSON.stringify(transactionData));

      // Flutterwave payment for guest users
      if (typeof FlutterwaveCheckout === 'undefined') {
        showToast('Payment system loading, please try again');
        checkoutBtn.innerHTML = originalText;
        checkoutBtn.disabled = false;
        return;
      }

      // Get customer info from form or use defaults
      let customerEmail = "guest@alawusa.com";
      let customerName = "Guest Customer";
      let customerPhone = "08000000000";
      
      // You can add a form to collect guest user info or use these defaults
      // For now using defaults, but you can modify this to collect info

      FlutterwaveCheckout({
        public_key: "FLWPUBK-12f39e50a0c4450e5c4cfb2a3151a57a-X", // Use your Flutterwave public key
        tx_ref: txRef,
        amount: totalAmount,
        currency: "NGN",
        payment_options: "card, banktransfer, ussd, mobilemoney",
        customer: {
          email: customerEmail,
          phonenumber: customerPhone,
          name: customerName,
        },
        customizations: {
          title: "Alawusa Heritage",
          description: "Payment for items in cart",
          logo: "Alawusa heritage icon - Icon.png",
        },
        callback: function (data) {
          console.log("Payment callback:", data);
          
          if (data.status === "successful") {
            // Update transaction status
            updateGuestTransactionStatus(txRef, "successful", data);
            
            showToast("Payment successful! Transaction ID: " + data.transaction_id);
            
            // Save order for guest user
            saveGuestOrder({
              transaction_id: data.transaction_id,
              tx_ref: txRef,
              amount: totalAmount,
              currency: "NGN",
              status: "completed",
              customer: {
                email: customerEmail,
                name: customerName,
                phone: customerPhone
              },
              items: cart,
              payment_details: data,
              created_at: new Date().toISOString(),
              user_type: "guest"
            });
            
            // Clear cart
            localStorage.removeItem("cart");
            cart = [];
            
            setTimeout(() => {
              // Redirect to order confirmation page for guests
              window.location.href = "order-confirmation.html?tx_ref=" + txRef;
            }, 2000);
          } else {
            // Update transaction status to failed
            updateGuestTransactionStatus(txRef, "failed", data);
            showToast("Payment was not successful. Please try again.");
            checkoutBtn.innerHTML = originalText;
            checkoutBtn.disabled = false;
          }
        },
        onclose: function() {
          showToast("Payment window closed.");
          // Update transaction status to cancelled
          updateGuestTransactionStatus(txRef, "cancelled");
          checkoutBtn.innerHTML = originalText;
          checkoutBtn.disabled = false;
        },
      });

    } else {
      // Redirect for foreign currency payment (existing functionality)
      localStorage.setItem("checkoutTotal", totalAmount);
      localStorage.setItem("paymentMethod", "international");
      localStorage.setItem("currency", "USD");
      
      setTimeout(() => {
        window.location.href = "checkout.html";
      }, 1000);
    }
  } catch (error) {
    console.error("Checkout error:", error);
    showToast("An error occurred during checkout. Please try again.");
    checkoutBtn.innerHTML = originalText;
    checkoutBtn.disabled = false;
  }
}

// Helper functions for guest users
function updateGuestTransactionStatus(txRef, status, paymentData = null) {
  try {
    // For guest users, we'll use localStorage to track transactions
    const transactions = JSON.parse(localStorage.getItem("guestTransactions")) || [];
    const transactionIndex = transactions.findIndex(t => t.tx_ref === txRef);
    
    if (transactionIndex !== -1) {
      transactions[transactionIndex].status = status;
      transactions[transactionIndex].updated_at = new Date().toISOString();
      if (paymentData) {
        transactions[transactionIndex].payment_response = paymentData;
      }
    } else {
      // If transaction doesn't exist, create it
      const currentTransaction = JSON.parse(localStorage.getItem("currentTransaction"));
      if (currentTransaction) {
        currentTransaction.status = status;
        currentTransaction.updated_at = new Date().toISOString();
        if (paymentData) {
          currentTransaction.payment_response = paymentData;
        }
        transactions.push(currentTransaction);
      }
    }
    
    localStorage.setItem("guestTransactions", JSON.stringify(transactions));
    console.log("Guest transaction status updated:", txRef, status);
  } catch (error) {
    console.error("Error updating guest transaction status:", error);
  }
}

function saveGuestOrder(orderData) {
  try {
    // Generate order ID for guest
    const orderId = "ORD_GUEST_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    
    // Save guest order to localStorage
    const guestOrders = JSON.parse(localStorage.getItem("guestOrders")) || [];
    const orderWithId = {
      ...orderData,
      order_id: orderId
    };
    
    guestOrders.push(orderWithId);
    localStorage.setItem("guestOrders", JSON.stringify(guestOrders));
    
    console.log("Guest order saved:", orderId);
    return orderId;
  } catch (error) {
    console.error("Error saving guest order:", error);
    throw error;
  }
}

  // Initialize cart on page load
  document.addEventListener('DOMContentLoaded', renderCart);

  // Show toast notification
function showToast(message) {
  // Remove existing toast if any
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();
  
  // Create new toast
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Show toast
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
