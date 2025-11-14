// Get search query from URL
function getSearchQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("search")?.toLowerCase() || "";
}

// Filter and render products based on search query
function filterAndRenderProducts(query) {
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(query)
  );
  
  renderProducts(filteredProducts);
  
  // Update section header to show search results
  const sectionHeader = document.querySelector('.section-header h2');
  if (query && sectionHeader) {
    sectionHeader.textContent = `Search Results for "${query}"`;
    
    // Show number of results or "not found" message
    const resultsCount = document.createElement('span');
    resultsCount.style.fontSize = '14px';
    resultsCount.style.color = '#666';
    resultsCount.style.marginLeft = '10px';
    
    if (filteredProducts.length === 0) {
      resultsCount.textContent = `(0 products found)`;
      resultsCount.style.color = '#f44336';
    } else {
      resultsCount.textContent = `(${filteredProducts.length} products found)`;
    }
    
    sectionHeader.appendChild(resultsCount);
  }
}

// Enhanced renderProducts function with "not found" message
function renderProducts(productsToRender) {
  const productsContainer = document.getElementById('productsList');
  productsContainer.innerHTML = '';
  
  const searchQuery = getSearchQuery();
  
  if (productsToRender.length === 0 && searchQuery) {
    productsContainer.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
        <h3 style="color: #555; margin-bottom: 10px;">No Products Found</h3>
        <p style="color: #777; margin-bottom: 5px;">We couldn't find any products matching</p>
        <p style="color: #333; font-weight: 600; margin-bottom: 20px;">"${searchQuery}"</p>
        <p style="color: #777; margin-bottom: 20px;">Try checking your spelling or browse all products.</p>
        <button onclick="clearSearch()" style="margin-top: 15px; padding: 12px 24px; background: #2e7d32; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
          <i class="fas fa-th-large" style="margin-right: 8px;"></i>Browse All Products
        </button>
      </div>
    `;
    return;
  }
  
  if (productsToRender.length === 0 && !searchQuery) {
    productsContainer.innerHTML = `
      <div class="no-results">
        <i class="fas fa-box-open" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
        <h3 style="color: #555; margin-bottom: 10px;">No Products Available</h3>
        <p style="color: #777;">Please check back later for new products.</p>
      </div>
    `;
    return;
  }
  
  productsToRender.forEach(product => {
    const priceDisplay = product.minPrice === product.maxPrice 
      ? `₦${product.minPrice.toLocaleString()}` 
      : `₦${product.minPrice.toLocaleString()} - ₦${product.maxPrice.toLocaleString()}`;
    
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.setAttribute('data-name', product.name);
    productCard.setAttribute('data-category', product.category);
    productCard.setAttribute('data-price', product.maxPrice);
    
    productCard.innerHTML = `
      ${!product.inStock ? '<div class="product-badge">Out of Stock</div>' : ''}
      <div class="wishlist" data-id="${product.id}">
        <i class="fa fa-heart"></i>
      </div>
      <div class="product-img">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <div class="product-rating">
          ${generateStarRating(product.rating)}
          <span>(${product.reviews})</span>
        </div>
        <p>${priceDisplay}</p>
        <button onclick="openPopup('${product.name}', '${product.image}', ${product.minPrice}, ${product.maxPrice}, ${product.id})" ${!product.inStock ? 'disabled' : ''}>
          ${product.inStock ? '<i class="fas fa-cart-plus"></i> Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    `;
    
    productsContainer.appendChild(productCard);
  });
  
  // Re-attach wishlist event listeners
  attachWishlistListeners();
}

// Clear search and show all products
function clearSearch() {
  window.history.replaceState({}, document.title, window.location.pathname);
  document.getElementById('searchInput').value = '';
  const sectionHeader = document.querySelector('.section-header h2');
  if (sectionHeader) {
    sectionHeader.textContent = 'All Products';
    // Remove results count if it exists
    const resultsCount = sectionHeader.querySelector('span');
    if (resultsCount) resultsCount.remove();
  }
  renderProducts(products);
}

// Initialize the page with search filter
document.addEventListener('DOMContentLoaded', function() {
  const searchQuery = getSearchQuery();
  
  // If there's a search query, update the search input and filter products
  if (searchQuery) {
    document.getElementById('searchInput').value = searchQuery;
    filterAndRenderProducts(searchQuery);
  } else {
    renderProducts(products);
  }
  
  updateCartCount();
  
  // Initialize price filter
  const priceFilter = document.getElementById('filterPrice');
  const maxPriceDisplay = document.getElementById('maxPriceDisplay');
  
  priceFilter.addEventListener('input', function() {
    const value = parseInt(this.value);
    maxPriceDisplay.textContent = value.toLocaleString();
  });
});

// Real-time search functionality for products page
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", function(e) {
  const filter = e.target.value.toLowerCase().trim();
  
  // Update URL without page reload
  const url = new URL(window.location);
  if (filter) {
    url.searchParams.set('search', filter);
  } else {
    url.searchParams.delete('search');
  }
  window.history.replaceState({}, '', url);
  
  if (filter === '') {
    const sectionHeader = document.querySelector('.section-header h2');
    if (sectionHeader) {
      sectionHeader.textContent = 'All Products';
      const resultsCount = sectionHeader.querySelector('span');
      if (resultsCount) resultsCount.remove();
    }
    renderProducts(products);
    return;
  }
  
  filterAndRenderProducts(filter);
});

// Search button functionality for products page
const searchButton = document.getElementById('searchButton');
searchButton.addEventListener('click', function() {
  const searchInput = document.getElementById('searchInput');
  const filter = searchInput.value.toLowerCase().trim();
  
  if (filter) {
    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('search', filter);
    window.history.replaceState({}, '', url);
    
    filterAndRenderProducts(filter);
  }
});