const WATCH_FILENAMES = [
    'Carl F. Bucherer Manero.png', 
    'Grand Seiko sbgx261.png', 
    'Grand Seiko sbgx355.png', 
    'HAMILTON khaki.png', 
    'HAMILTON khaki murph.png', 
    'OMEGA constellation.png',
    'OMEGA seamaster-aqua-terra.png',
    'LONGINES spirit pilot.png',
    'LONGINES spirit.png',
    'Vacheron Constantin overseas.png',
];
const IMAGE_BASE_PATH = 'images/';

document.addEventListener('DOMContentLoaded', () => {
    const watchCase = document.getElementById('watchCase');
    const slotsContainer = watchCase.querySelector('.slots-container');
    const watchListContainer = document.querySelector('.watch-list');
    const slots = document.querySelectorAll('.slot');

    let draggedWatch = null;

    
    function addDragListeners(item) {
        item.addEventListener('dragstart', (e) => {
            draggedWatch = item;
            setTimeout(() => { item.classList.add('dragging'); }, 0);
            e.dataTransfer.setData('text/plain', item.src);
        });

        item.addEventListener('dragend', () => {
            draggedWatch.classList.remove('dragging');
            draggedWatch = null;
        });
        
        item.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            
             if (item.parentNode.classList.contains('slot')) {
                watchListContainer.appendChild(item);
                item.style.cursor = 'grab';
            }
        });
    }

    WATCH_FILENAMES.forEach(fileName => {
        const url = IMAGE_BASE_PATH + fileName; 
        
        const img = document.createElement('img');
        img.src = url; 
        
        const altText = fileName.split('.')[0]; 
        img.alt = altText;
        img.className = 'watch-item';
        img.draggable = true;
        img.setAttribute('data-watch-id', altText);

        watchListContainer.appendChild(img);
        
        addDragListeners(img);
    });

    
    watchCase.addEventListener('click', () => {
        const isCaseOpen = watchCase.classList.toggle('open');
        slotsContainer.classList.toggle('hidden', !isCaseOpen);
        
        const casePrompt = document.getElementById('casePrompt');
        if (isCaseOpen) {
            casePrompt.style.display = 'none';
        } else {
            const hasWatches = Array.from(slots).some(slot => slot.querySelector('img'));
            if (!hasWatches) {
                casePrompt.style.display = 'block';
            }
        }
    });

    
    slots.forEach(slot => {
        slot.addEventListener('dragenter', (e) => {
            e.preventDefault();
            slot.classList.add('drag-over');
        });

        slot.addEventListener('dragover', (e) => {
            e.preventDefault(); 
        });

        slot.addEventListener('dragleave', () => {
            slot.classList.remove('drag-over');
        });

        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.classList.remove('drag-over');

            if (watchCase.classList.contains('open') && draggedWatch) {
                
                const placedWatch = slot.querySelector('.watch-item');
                
                if (placedWatch) {
                    watchListContainer.appendChild(placedWatch);
                    placedWatch.style.cursor = 'grab'; 
                }
                
                slot.appendChild(draggedWatch);
                draggedWatch.style.cursor = 'default'; 
            }
        });
        
        slot.addEventListener('click', (e) => {
            e.stopPropagation(); 
            
            const placedWatch = slot.querySelector('.watch-item');
            if (placedWatch) {
                 watchListContainer.appendChild(placedWatch);
                 placedWatch.style.cursor = 'grab';
            }
        });
    });
});