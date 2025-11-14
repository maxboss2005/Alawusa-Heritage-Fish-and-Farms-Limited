
    
        var MenuItems = document.getElementById("MenuItems");
        MenuItems.style.maxHeight = "0px";
        function menutoggle(){
            if(MenuItems.style.maxHeight == "0px")
                {
                  MenuItems.style.maxHeight = "300px"  
                }
            else
                {
                    MenuItems.style.maxHeight = "0px"
                }
        }
    

        // Filter products based on category selection
    
        function filterProducts(){
            const category = document.getElementById('categorySelect').value;
            const products = document.querySelectorAll('.product');
            const title = document.getElementById('productTitle');

            if (category === 'all') {
            title.textContent = 'All Products';
        } else if (category === 'poultry') {
            title.textContent = 'Poultry & Eggs';
        } else if (category === 'fish') {
            title.textContent = 'Fish';
        } else if (category === 'landanimals') {
            title.textContent = 'Land Animals';
        }else if (category === 'seafood') {
            title.textContent = 'Sea Food';
        }

            products.forEach(product => {
                if (category === 'all' || product.classList.contains(category)) {
                    product.style.display = 'block';
                } else {
                    product.style.display = 'none';
                }
            });
        }


        window.onload = filterProducts;
    

    // Update cart count in navbar

  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
      cartCount.textContent = totalItems;
    }
  }

  // call this on page load
  updateCartCount();



// Firebase configuration


  AOS.init({
    duration: 1000, // animation duration in ms
    once: false,     // animate only once while scrolling down
  });



  const faders = document.querySelectorAll('.fade-in');

  const appearOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.2,
  });

  faders.forEach(fader => {
    appearOnScroll.observe(fader);
  });



  function openMenu() {
    document.getElementById('mobileMenu').classList.add('open');
  }

  function closeMenu() {
    document.getElementById('mobileMenu').classList.remove('open');
  }



function filterProducts(category) {
    const products = document.querySelectorAll('.product');
    const title = document.getElementById('productTitle');

    if (category === 'all') {
        title.textContent = 'All Products';
    } else if (category === 'poultry') {
        title.textContent = 'Poultry & Eggs';
    } else if (category === 'fish') {
        title.textContent = 'Fish';
    } else if (category === 'landanimals') {
        title.textContent = 'Land Animals';
    } else if (category === 'seafood') {
        title.textContent = 'Sea Food';
    }

    products.forEach(product => {
        if (category === 'all' || product.classList.contains(category)) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}



document.querySelectorAll(".accordion-toggle").forEach(button => {
  button.addEventListener("click", () => {
    const content = button.nextElementSibling;

    // Close all other accordions
    document.querySelectorAll(".accordion-content").forEach(menu => {
      if (menu !== content) {
        menu.style.maxHeight = null;
        menu.previousElementSibling.classList.remove("active");
      }
    });

    // Toggle this one
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
      button.classList.remove("active");
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
      button.classList.add("active");
    }
  });
});



document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("q") ? urlParams.get("q").toLowerCase() : "";

  const products = document.querySelectorAll(".product");
  let found = false;

  if (query) {
    products.forEach(product => {
      const text = product.innerText.toLowerCase();
      if (text.includes(query)) {
        product.style.display = "block"; // show matching product
        found = true;
      } else {
        product.style.display = "none"; // hide non-matching product
      }
    });

    if (!found) {
      const noResult = document.createElement("div");
      noResult.innerHTML = `<p style="text-align:center; font-size:18px; margin:30px; color:red;">
        No products found for "<strong>${query}</strong>"
      </p>`;
      document.querySelector(".products").appendChild(noResult);
    }
  }
});
