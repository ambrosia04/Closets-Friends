document.addEventListener('DOMContentLoaded', () => {
    const wardrobe = document.getElementById('wardrobe');
    const emptyMessage = document.getElementById('empty-wardrobe-message');
    const addItemBtn = document.getElementById('add-item-btn');
    const addItemBtnEmpty = document.getElementById('add-item-btn-empty');
    const importBtn = document.getElementById('import-json');
    const exportBtn = document.getElementById('export-json');

    // Modal Elements
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

    let wardrobeItems = JSON.parse(localStorage.getItem('wardrobeItems')) || [];
    let itemIndexToDelete = null; // Variable to store which item to delete

    function displayWardrobeItems() {
        wardrobe.innerHTML = '';
        if (wardrobeItems.length === 0) {
            emptyMessage.style.display = 'flex'; // Usamos flex para centrar mejor
        } else {
            emptyMessage.style.display = 'none';
            wardrobeItems.forEach((item, index) => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('wardrobe-item');
                
                // --- CAMBIO PRINCIPAL: No usamos <a> ---
                // Ponemos el contenido directamente en el div
                itemElement.innerHTML = `
                    <img src="${item.images[0]}" alt="${item.name}">
                    <p>${item.name}</p>
                `;

                // Añadimos el listener de navegación directamente al div
                itemElement.addEventListener('click', () => {
                    localStorage.setItem('selectedItemIndex', index);
                    window.location.href = 'item.html';
                });

                // Creamos el botón de eliminar (esto no cambia)
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.innerHTML = '&times;';
                deleteBtn.addEventListener('click', (event) => {
                    event.stopPropagation(); // MUY IMPORTANTE: Evita que al borrar se active el click de navegación
                    itemIndexToDelete = index;
                    deleteConfirmModal.classList.remove('hidden');
                });

                // Añadimos el botón de borrar y el item a la página
                itemElement.appendChild(deleteBtn);
                wardrobe.appendChild(itemElement);
            });
        }
    }

    function deleteItem() {
        if (itemIndexToDelete === null) return;

        // Remove the item from the array
        wardrobeItems.splice(itemIndexToDelete, 1);
        // Update localStorage
        localStorage.setItem('wardrobeItems', JSON.stringify(wardrobeItems));
        // Hide the modal
        deleteConfirmModal.classList.add('hidden');
        // Refresh the wardrobe display
        displayWardrobeItems();
        // Reset the index
        itemIndexToDelete = null;
    }

    // Event Listeners
    [addItemBtn, addItemBtnEmpty].forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.href = 'edit-item.html';
        });
    });
    
    confirmDeleteBtn.addEventListener('click', deleteItem);

    cancelDeleteBtn.addEventListener('click', () => {
        deleteConfirmModal.classList.add('hidden');
        itemIndexToDelete = null;
    });

    deleteConfirmModal.addEventListener('click', (event) => {
        // Close modal if the overlay (background) is clicked
        if (event.target === deleteConfirmModal) {
            deleteConfirmModal.classList.add('hidden');
            itemIndexToDelete = null;
        }
    });

    // --- Import / Export Logic (remains the same) ---
    exportBtn.addEventListener('click', () => {
        if (wardrobeItems.length === 0) {
            alert("Your wardrobe is empty. Nothing to export!");
            return;
        }
        const dataStr = JSON.stringify(wardrobeItems, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'my_wardrobe.json';
        link.click();
        URL.revokeObjectURL(url);
    });

    importBtn.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedItems = JSON.parse(e.target.result);
                if (Array.isArray(importedItems)) {
                    wardrobeItems = importedItems;
                    localStorage.setItem('wardrobeItems', JSON.stringify(wardrobeItems));
                    displayWardrobeItems();
                    alert('Wardrobe imported successfully!');
                } else {
                    alert('Invalid file format.');
                }
            } catch (error) {
                alert('Error reading the file. Please ensure it is a valid JSON file.');
            }
        };
        reader.readAsText(file);
    });

    // Initial display on page load
    displayWardrobeItems();
});