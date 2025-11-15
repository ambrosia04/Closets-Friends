document.addEventListener('DOMContentLoaded', () => {
    const resultsGrid = document.getElementById('results-grid');
    const browseTitle = document.getElementById('browse-title');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const loader = document.getElementById('loader');

    let currentPage = 1;
    let currentStyle = '';
    let currentPiece = '';
    let isLoading = false;

    // Function to fetch data from our Node.js server
    async function fetchProducts(style, piece, page) {
        if (isLoading) return;
        isLoading = true;
        loader.classList.remove('hidden');
        loadMoreBtn.classList.add('hidden');

        try {
            // Make sure your Node.js server is running on localhost:3000
            const response = await fetch(`http://localhost:3000/api/browse?style=${style}&piece=${piece}&page=${page}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            resultsGrid.innerHTML += '<p class="error-message">Could not load items. Please try again later.</p>';
        } finally {
            isLoading = false;
            loader.classList.add('hidden');
        }
    }

    // Function to display products in the grid
    function displayProducts(products) {
        if (products.length === 0 && currentPage === 1) {
            resultsGrid.innerHTML = '<p>No results found for this style.</p>';
            return;
        }

        products.forEach(product => {
            // --- CHANGE 1: Create a <div> instead of an <a> ---
            const itemElement = document.createElement('div');
            
            // --- CHANGE 2: Remove the lines that set href and target ---
            // itemElement.href = product.link;      <-- REMOVED
            // itemElement.target = '_blank';        <-- REMOVED
            
            itemElement.classList.add('browse-item');

            // The inner content remains exactly the same
            itemElement.innerHTML = `
                <div class="browse-item-image-container">
                    <img src="${product.imageUrl}" alt="${product.title}" onerror="this.style.display='none'">
                </div>
                <div class="browse-item-info">
                    <p class="browse-item-title">${product.title}</p>
                    <p class="browse-item-price">${product.price}</p>
                    <p class="browse-item-source">${product.source}</p>
                </div>
            `;
            resultsGrid.appendChild(itemElement);
        });

        if (products.length > 0) {
            loadMoreBtn.classList.remove('hidden');
        } else {
            loadMoreBtn.classList.add('hidden');
        }
    }

    // --- Main Logic ---
    // Get style and piece from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    currentStyle = urlParams.get('style');
    currentPiece = urlParams.get('piece');

    if (currentStyle && currentPiece) {
        browseTitle.textContent = `Online results for: ${currentStyle} ${currentPiece}`;
        fetchProducts(currentStyle, currentPiece, currentPage);
    } else {
        browseTitle.textContent = 'No style specified.';
    }

    // Event listener for the 'Load More' button
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        fetchProducts(currentStyle, currentPiece, currentPage);
    });
});