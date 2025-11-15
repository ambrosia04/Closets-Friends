document.addEventListener('DOMContentLoaded', () => {
    // This is our main function that runs everything.
    async function initializePage() {
        
        // --- 1. ALL VARIABLES ARE DECLARED HERE ---
        const wardrobeItems = JSON.parse(localStorage.getItem('wardrobeItems')) || [];
        const itemIndexToEdit = localStorage.getItem('itemToEditIndex');
        const isEditMode = itemIndexToEdit !== null;
        let currentItem = isEditMode ? wardrobeItems[itemIndexToEdit] : { possibleFits: [] };
        const uploadedImages = { main: null, thumb1: null, thumb2: null, thumb3: null };

        const addFitBtn = document.getElementById('add-fit-btn');
        const possibleFitsContainer = document.getElementById('possible-fits');
        const fitsModal = document.getElementById('fits-modal');
        const galleryGrid = document.getElementById('fits-gallery-grid');
        const confirmFitsBtn = document.getElementById('confirm-fits-btn');
        const cancelFitsBtn = document.getElementById('cancel-fits-btn');
        let tempSelectedFits = [];

        // =======================================================================
        // --- 2. ALL HELPER FUNCTIONS ARE NOW INSIDE initializePage ---
        // This gives them access to the variables above (like 'uploadedImages').
        // =======================================================================
// --- NEW: Image Compression Function ---
        /**
         * Takes an image file, compresses it, and returns a smaller Base64 data URL.
         * @param {File} file The image file to compress.
         * @returns {Promise<string>} A promise that resolves with the compressed image data URL.
         */
        function compressImage(file) {
            return new Promise((resolve, reject) => {
                const max_width = 800; // Set the maximum width of the compressed image
                const max_height = 800; // Set the maximum height
                const image = new Image();
                image.src = URL.createObjectURL(file);
                image.onload = () => {
                    let width = image.width;
                    let height = image.height;

                    if (width > height) {
                        if (width > max_width) {
                            height *= max_width / width;
                            width = max_width;
                        }
                    } else {
                        if (height > max_height) {
                            width *= max_height / height;
                            height = max_height;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(image, 0, 0, width, height);
                    
                    let dataUrl;
                    // If the original file is a PNG, save the compressed version as a PNG.
                    if (file.type === 'image/png') {
                        dataUrl = canvas.toDataURL('image/png');
                    } else {
                    // Otherwise, save it as a more efficient JPEG.
                        dataUrl = canvas.toDataURL('image/jpeg', 0.7); 
                    }
                     
                    resolve(dataUrl);
                };
                image.onerror = (error) => reject(error);
            });
        }

        function setupPhotoUpload(inputId, boxId, imageKey) {
            const input = document.getElementById(inputId);
            const box = document.getElementById(boxId);
            input.addEventListener('change', async (event) => { // Make this async
                const file = event.target.files[0];
                if (file) {
                    try {
                        // =======================================================================
                        // --- CHANGE: Use the compressor function ---
                        const compressedImageUrl = await compressImage(file);
                        // =======================================================================
                        
                        box.style.backgroundImage = `url(${compressedImageUrl})`;
                        box.textContent = '';
                        uploadedImages[imageKey] = compressedImageUrl;
                    } catch (error) {
                        console.error("Image compression failed:", error);
                        alert("There was an error processing the image.");
                    }
                }
            });
        }

        async function setupDynamicSelect(selectId, jsonFile, inputId, btnId) {
            const selectElement = document.getElementById(selectId);
            const newOptionInput = document.getElementById(inputId);
            const addOptionBtn = document.getElementById(btnId);
            const storageKey = `app_options_${selectId}`;
            let options = JSON.parse(localStorage.getItem(storageKey));
            if (!options) {
                try {
                    const response = await fetch(jsonFile);
                    options = await response.json();
                    localStorage.setItem(storageKey, JSON.stringify(options));
                } catch (error) { console.error(`Failed to load ${jsonFile}:`, error); options = []; }
            }
            populateSelect(selectElement, options);
            addOptionBtn.addEventListener('click', () => {
                const previouslySelected = Array.from(selectElement.selectedOptions).map(opt => opt.value);
                const newOptionValue = newOptionInput.value.trim();
                if (newOptionValue && !options.includes(newOptionValue)) {
                    options.push(newOptionValue);
                    options.sort();
                    localStorage.setItem(storageKey, JSON.stringify(options));
                    populateSelect(selectElement, options);
                    newOptionInput.value = '';
                    preselectOptions(selectId, previouslySelected);
                }
            });
            selectElement.addEventListener('mousedown', function(e) {
                e.preventDefault();
                const option = e.target;
                if (option.tagName === 'OPTION') {
                    option.selected = !option.selected;
                }
            });
        }

        function populateSelect(selectElement, options) {
            selectElement.innerHTML = '';
            options.forEach(optionValue => {
                const option = document.createElement('option');
                option.value = optionValue;
                option.textContent = optionValue;
                selectElement.appendChild(option);
            });
        }

        function preselectOptions(selectId, selectedValues) {
            if (!selectedValues || !Array.isArray(selectedValues)) return;
            const selectElement = document.getElementById(selectId);
            Array.from(selectElement.options).forEach(option => {
                if (selectedValues.includes(option.value)) {
                    option.selected = true;
                }
            });
        }

        function displayPossibleFits() {
            possibleFitsContainer.innerHTML = '';
            if (!currentItem.possibleFits || currentItem.possibleFits.length === 0) return;
            currentItem.possibleFits.forEach(fitId => {
                const fitItem = wardrobeItems.find(item => item.id === fitId);
                if (fitItem) {
                    const fitElement = document.createElement('div');
                    fitElement.className = 'wardrobe-item-link';
                    fitElement.innerHTML = `<img src="${fitItem.images[0]}" alt="${fitItem.name}"><p>${fitItem.name}</p>`;
                    possibleFitsContainer.appendChild(fitElement);
                }
            });
        }

        function openFitsModal() {
            galleryGrid.innerHTML = '';
            tempSelectedFits = [...(currentItem.possibleFits || [])];
            const currentItemId = isEditMode ? currentItem.id : -1;
            wardrobeItems.forEach(item => {
                if (item.id === currentItemId) return;
                const galleryItem = document.createElement('div');
                galleryItem.className = 'fit-gallery-item';
                galleryItem.dataset.itemId = item.id;
                galleryItem.innerHTML = `<img src="${item.images[0]}" alt="${item.name}"><p>${item.name}</p>`;
                if (tempSelectedFits.includes(item.id)) galleryItem.classList.add('selected');
                galleryItem.addEventListener('click', () => {
                    galleryItem.classList.toggle('selected');
                    const itemId = item.id;
                    if (galleryItem.classList.contains('selected')) {
                        if (!tempSelectedFits.includes(itemId)) tempSelectedFits.push(itemId);
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
            fitsModal.classList.add('hidden');
            displayPossibleFits();
        }

        function cancelFitsSelection() {
            fitsModal.classList.add('hidden');
            tempSelectedFits = [];
        }

        function populateFormForEdit() {
            if (!currentItem) return;
            document.getElementById('name').value = currentItem.name;
            document.getElementById('price').value = currentItem.price || '';
            document.getElementById('purchase-date').value = currentItem.purchaseDate || '';
            document.getElementById('purchase-place').value = currentItem.purchasePlace || '';
            if (currentItem.images && currentItem.images.length > 0) {
                const [main, thumb1, thumb2, thumb3] = currentItem.images;
                if (main) { document.getElementById('main-photo-box').style.backgroundImage = `url(${main})`; uploadedImages.main = main; }
                if (thumb1) { document.getElementById('thumb1-box').style.backgroundImage = `url(${thumb1})`; uploadedImages.thumb1 = thumb1; }
                if (thumb2) { document.getElementById('thumb2-box').style.backgroundImage = `url(${thumb2})`; uploadedImages.thumb2 = thumb2; }
                if (thumb3) { document.getElementById('thumb3-box').style.backgroundImage = `url(${thumb3})`; uploadedImages.thumb3 = thumb3; }
            }
            preselectOptions('materials', currentItem.materials);
            preselectOptions('vibe', currentItem.vibe);
            document.getElementById('save-item-btn').textContent = 'Update Item';
            displayPossibleFits();
        }

        // --- 3. RUN SETUP LOGIC ---
        setupPhotoUpload('main-photo-upload', 'main-photo-box', 'main');
        setupPhotoUpload('thumb1-upload', 'thumb1-box', 'thumb1');
        setupPhotoUpload('thumb2-upload', 'thumb2-box', 'thumb2');
        setupPhotoUpload('thumb3-upload', 'thumb3-box', 'thumb3');
        await setupDynamicSelect('materials', 'materials.json', 'new-material', 'add-material-btn');
        await setupDynamicSelect('vibe', 'vibes.json', 'new-vibe', 'add-vibe-btn');
        if (isEditMode) {
            populateFormForEdit();
        }

        // --- 4. SETUP FINAL EVENT LISTENERS ---
        document.getElementById('save-item-btn').addEventListener('click', () => {
            const name = document.getElementById('name').value.trim();
            if (!name) { alert('Please enter a name for the item.'); return; }
            if (!uploadedImages.main) { alert('Please add a main photo.'); return; }
            const itemData = {
                id: isEditMode ? currentItem.id : Date.now(),
                name: name,
                price: document.getElementById('price').value,
                materials: Array.from(document.getElementById('materials').selectedOptions).map(opt => opt.value),
                vibe: Array.from(document.getElementById('vibe').selectedOptions).map(opt => opt.value),
                purchaseDate: document.getElementById('purchase-date').value,
                purchasePlace: document.getElementById('purchase-place').value.trim(),
                images: [uploadedImages.main, uploadedImages.thumb1, uploadedImages.thumb2, uploadedImages.thumb3].filter(Boolean),
                possibleFits: currentItem.possibleFits || []
            };
            if (isEditMode) { wardrobeItems[itemIndexToEdit] = itemData; } else { wardrobeItems.push(itemData); }
            localStorage.setItem('wardrobeItems', JSON.stringify(wardrobeItems));
            localStorage.removeItem('itemToEditIndex');
            alert(`Item ${isEditMode ? 'updated' : 'saved'} successfully!`);
            window.location.href = 'wardrobe.html';
        });
        document.getElementById('cancel-btn').addEventListener('click', () => {
            localStorage.removeItem('itemToEditIndex');
            window.location.href = 'wardrobe.html';
        });
        addFitBtn.addEventListener('click', openFitsModal);
        confirmFitsBtn.addEventListener('click', saveFits);
        cancelFitsBtn.addEventListener('click', cancelFitsSelection);
        fitsModal.addEventListener('click', (e) => { if (e.target === fitsModal) cancelFitsSelection(); });
    }

    // --- KICK OFF THE ENTIRE SCRIPT ---
    initializePage();
});