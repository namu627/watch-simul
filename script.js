const WATCH_FILENAMES = [
    'Carl F. Bucherer Manero.png', 
    'tudor blackbay 54.png',
    'Grand Seiko sbgx261.png', 
    'Grand Seiko sbgx355.png', 
    'HAMILTON khaki.png',
    'HAMILTON khaki auto engineered garments.png',
    'HAMILTON khaki auto.png',
    'HAMILTON khaki auto titanium.png',
    'HAMILTON khaki murph.png', 
    'cartier tank.png',
    'OMEGA constellation.png',
    'OMEGA seamaster-aqua-terra.png',
    'LONGINES spirit pilot.png',
    'LONGINES spirit.png',
    'Vacheron Constantin overseas.png',
    'seiko sbth007.png',
];
const IMAGE_BASE_PATH = 'images/';

document.addEventListener('DOMContentLoaded', () => {
    const watchCase = document.getElementById('watchCase');
    const slotsContainer = watchCase.querySelector('.slots-container');
    const watchListContainer = document.querySelector('.watch-list');
    const slots = document.querySelectorAll('.slot');

    let draggedWatch = null;

    let isDown = false;
    let startX;
    let scrollLeft;

    watchListContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        watchListContainer.classList.add('active-grab'); 
        
        startX = e.pageX - watchListContainer.offsetLeft;
        scrollLeft = watchListContainer.scrollLeft;
    });

    watchListContainer.addEventListener('mouseleave', () => {
        isDown = false;
        watchListContainer.classList.remove('active-grab');
    });

    watchListContainer.addEventListener('mouseup', () => {
        isDown = false;
        watchListContainer.classList.remove('active-grab');
    });

    watchListContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        
        const x = e.pageX - watchListContainer.offsetLeft;
        const walk = (x - startX) * 1.5; 
        
        watchListContainer.scrollLeft = scrollLeft - walk;
    });


    function findFirstEmptySlot() {
        for (const slot of slots) {
            if (slot.childElementCount === 0) {
                return slot;
            }
        }
        return null;
    }

    
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
            else if (item.parentNode.classList.contains('watch-list') && watchCase.classList.contains('open')) {
                const emptySlot = findFirstEmptySlot();

                if (emptySlot) {
                    emptySlot.appendChild(item);
                    item.style.cursor = 'default';
                }
            }
        });
    }

    WATCH_FILENAMES.forEach(fileName => {
        const img = createWatchItem(fileName);
        watchListContainer.appendChild(img);
    });

    function createWatchItem(fileName) {
        const url = IMAGE_BASE_PATH + fileName;
        const altText = fileName.split('.')[0];
        
        const img = document.createElement('img');
        img.src = url; 
        img.alt = altText;
        img.className = 'watch-item';
        img.draggable = true;
        img.setAttribute('data-watch-id', altText);
        
        addDragListeners(img);
        return img;
    }

    
    watchCase.addEventListener('click', () => {
        const isCaseOpen = watchCase.classList.toggle('open');
        
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