document.addEventListener('DOMContentLoaded', () => {
    // Main page elements
    const mainImage = document.getElementById('main-image');
    const thumbnailContainer = document.getElementById('thumbnail-container');
    const itemName = document.getElementById('item-name');
    const itemMaterial = document.getElementById('item-material');
    const itemVibe = document.getElementById('item-vibe');
    const itemPurchaseDate = document.getElementById('item-purchase-date');
    const itemPurchasePlace = document.getElementById('item-purchase-place');
    const possibleFitsContainer = document.getElementById('possible-fits');
    
    // Modal elements
    const addFitBtn = document.getElementById('add-fit-btn');
    const fitsModal = document.getElementById('fits-modal');
    const galleryGrid = document.getElementById('fits-gallery-grid');
    const confirmFitsBtn = document.getElementById('confirm-fits-btn');
    const cancelFitsBtn = document.getElementById('cancel-fits-btn');
    const editItemBtn = document.getElementById('edit-item-btn');

    // =======================================================================
    // --- NEW: Get the elements for the Image Viewer Modal ---
    const imageViewerModal = document.getElementById('image-viewer-modal');
    const modalImage = document.getElementById('modal-image');
    const closeModalBtn = document.querySelector('#image-viewer-modal .close-btn');
    // =======================================================================

    // Load data
    const wardrobeItems = JSON.parse(localStorage.getItem('wardrobeItems')) || [];
    const selectedItemIndex = localStorage.getItem('selectedItemIndex');
    
    if (selectedItemIndex === null || !wardrobeItems[selectedItemIndex]) {
        document.body.innerHTML = '<h1>Item not found.</h1><a href="wardrobe.html">Go back to wardrobe</a>';
        return;
    }

    const currentItem = wardrobeItems[selectedItemIndex];
    let tempSelectedFits = [];

    // --- MAIN DISPLAY LOGIC ---
    function displayItemDetails() {
        mainImage.src = currentItem.images[0];
        mainImage.alt = currentItem.name;

        thumbnailContainer.innerHTML = '';
        currentItem.images.slice(1).forEach(image => {
            const thumb = document.createElement('img');
            thumb.src = image;
            thumb.addEventListener('click', () => mainImage.src = image);
            thumbnailContainer.appendChild(thumb);
        });

        itemName.textContent = currentItem.name;
        itemMaterial.textContent = currentItem.materials.join(', ') || 'N/A';
        itemVibe.textContent = currentItem.vibe.join(', ') || 'N/A';
        itemPurchaseDate.textContent = currentItem.purchaseDate || 'N/A';
        itemPurchasePlace.textContent = currentItem.purchasePlace || 'N/A';
        
         // This function handles updating the thumbnails
        function updateThumbnails(activeSrc) {
            thumbnailContainer.innerHTML = ''; // Clear existing thumbnails
            
            // Loop through ALL images for the item
            currentItem.images.forEach(imageSrc => {
                const thumb = document.createElement('img');
                thumb.src = imageSrc;

                // If this thumbnail matches the active main image, add the 'active' class
                if (imageSrc === activeSrc) {
                    thumb.classList.add('active');
                }

                // Add click listener to each thumbnail
                thumb.addEventListener('click', () => {
                    mainImage.src = imageSrc; // Set the clicked image as the main one
                    updateThumbnails(imageSrc); // Re-run this function to update the active state
                });

                thumbnailContainer.appendChild(thumb);
            });
        }

        // =======================================================================
        // --- NEW: Browse Online Button Logic ---
        const browseOnlineBtn = document.getElementById('browse-online-btn');

        if (browseOnlineBtn) {
            browseOnlineBtn.addEventListener('click', () => {
                const style = currentItem.vibe && currentItem.vibe.length > 0 ? currentItem.vibe[0] : '';
                const itemName = currentItem.name || '';
                const nameParts = itemName.split(' ');
                const clothingPiece = nameParts[nameParts.length - 1];

                if (style && clothingPiece) {
                    // Navigate to our new browse page with URL parameters
                    window.location.href = `browse.html?style=${encodeURIComponent(style)}&piece=${encodeURIComponent(clothingPiece)}`;
                } else {
                    alert("This item doesn't have a defined style (vibe) or name to search for.");
                }
            });
        }

        // Initial call to populate thumbnails with the first image being active
        updateThumbnails(currentItem.images[0]);
        // =======================================================================

        // Display possible fits
        displayPossibleFits();
    }

    function displayPossibleFits() {
        possibleFitsContainer.innerHTML = '';
        // Add the same fallback here for safety
        if (!currentItem.possibleFits || currentItem.possibleFits.length === 0) {
             possibleFitsContainer.innerHTML = '<p>No fits defined yet.</p>';
             return;
        }

        currentItem.possibleFits.forEach(fitId => {
            const fitItem = wardrobeItems.find(item => item.id === fitId);
            if (fitItem) {
                const fitElement = document.createElement('a');
                fitElement.className = 'wardrobe-item-link';
                const fitItemIndex = wardrobeItems.findIndex(item => item.id === fitId);
                fitElement.href = 'item.html';
                fitElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.setItem('selectedItemIndex', fitItemIndex);
                    window.location.reload();
                });
                fitElement.innerHTML = `
                    <img src="${fitItem.images[0]}" alt="${fitItem.name}">
                    <p>${fitItem.name}</p>
                `;
                possibleFitsContainer.appendChild(fitElement);
            }
        });
    }

    // --- MODAL LOGIC ---
    function openFitsModal() {
        galleryGrid.innerHTML = '';
        // ============================ THE FIX IS HERE ============================
        // If currentItem.possibleFits is undefined, use an empty array [] instead.
        tempSelectedFits = [...(currentItem.possibleFits || [])];
        // =======================================================================

        wardrobeItems.forEach(item => {
            if (item.id === currentItem.id) return;

            const galleryItem = document.createElement('div');
            galleryItem.className = 'fit-gallery-item';
            galleryItem.dataset.itemId = item.id;
            galleryItem.innerHTML = `
                <img src="${item.images[0]}" alt="${item.name}">
                <p>${item.name}</p>
            `;

            if (tempSelectedFits.includes(item.id)) {
                galleryItem.classList.add('selected');
            }

            galleryItem.addEventListener('click', () => {
                galleryItem.classList.toggle('selected');
                const itemId = item.id;
                if (galleryItem.classList.contains('selected')) {
                    if (!tempSelectedFits.includes(itemId)) {
                        tempSelectedFits.push(itemId);
                    }
                } else {
                    tempSelectedFits = tempSelectedFits.filter(id => id !== itemId);
                }
            });
            galleryGrid.appendChild(galleryItem);
        });
        fitsModal.classList.remove('hidden');
    }

    function saveFits() {
        currentItem.possibleFits = tempSelectedFits;
        localStorage.setItem('wardrobeItems', JSON.stringify(wardrobeItems));
        fitsModal.classList.add('hidden');
        displayPossibleFits();
    }

    function cancelFitsSelection() {
        fitsModal.classList.add('hidden');
        tempSelectedFits = [];
    }
    
    // --- EVENT LISTENERS ---
    addFitBtn.addEventListener('click', openFitsModal);
    confirmFitsBtn.addEventListener('click', saveFits);
    cancelFitsBtn.addEventListener('click', cancelFitsSelection);
    fitsModal.addEventListener('click', (event) => {
        if (event.target === fitsModal) {
            cancelFitsSelection();
        }
    });
    editItemBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent the link from navigating normally
            // Store the index of the item we want to edit
            localStorage.setItem('itemToEditIndex', selectedItemIndex);
            // Redirect to the edit page
            window.location.href = 'edit-item.html';
    });

     // --- NEW: Event listeners for the Image Viewer Modal ---

    // 1. Open the modal when the main image is clicked
    mainImage.addEventListener('click', () => {
        imageViewerModal.classList.remove('hidden');
        modalImage.src = mainImage.src;
    });

    // 2. Close the modal when the 'X' button is clicked
    closeModalBtn.addEventListener('click', () => {
        imageViewerModal.classList.add('hidden');
    });

    // 3. Close the modal when the dark overlay is clicked
    imageViewerModal.addEventListener('click', (event) => {
        if (event.target === imageViewerModal) {
            imageViewerModal.classList.add('hidden');
        }
    });
    displayItemDetails();
});