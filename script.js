const IMAGE_BASE_PATH = 'images/';

document.addEventListener('DOMContentLoaded', () => {
    if (typeof WATCH_DATA === 'undefined') {
        console.error('watches.js가 로드되지 않았습니다.');
        return;
    }
    init(WATCH_DATA);
});

function init(WATCH_DATA) {
    const watchCase = document.getElementById('watchCase');
    const watchListContainer = document.getElementById('watchList');
    const brandFilterContainer = document.getElementById('brandFilter');
    const slots = document.querySelectorAll('.slot');
    let draggedWatch = null;

    // 브랜드 필터 버튼 생성
    const brands = ['ALL', ...new Set(WATCH_DATA.map(w => w.brand))];
    brands.forEach(brand => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (brand === 'ALL' ? ' active' : '');
        btn.textContent = brand;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderWatchList(brand);
        });
        brandFilterContainer.appendChild(btn);
    });

    function renderWatchList(filterBrand = 'ALL') {
        const watchesInSlots = new Set(
            Array.from(document.querySelectorAll('.slot img'))
                 .map(img => img.getAttribute('data-watch-id'))
        );
        watchListContainer.innerHTML = '';
        (filterBrand === 'ALL' ? WATCH_DATA : WATCH_DATA.filter(w => w.brand === filterBrand))
            .forEach(watch => {
                const id = watch.file.replace(/\.[^.]+$/, '');
                if (!watchesInSlots.has(id)) {
                    watchListContainer.appendChild(createWatchItem(watch.file));
                }
            });
    }

    function createWatchItem(fileName) {
        const img = document.createElement('img');
        img.src = IMAGE_BASE_PATH + fileName;
        img.alt = fileName.replace(/\.[^.]+$/, '');
        img.className = 'watch-item';
        img.draggable = true;
        img.setAttribute('data-watch-id', img.alt);
        addEventListeners(img);
        return img;
    }

    function moveToSlot(item, slot) {
        const existing = slot.querySelector('.watch-item');
        if (existing) moveToInventory(existing);
        slot.appendChild(item);
    }

    function moveToInventory(item) {
        const currentFilter = document.querySelector('.filter-btn.active').textContent;
        const watchId = item.getAttribute('data-watch-id');
        const watch = WATCH_DATA.find(w => w.file.replace(/\.[^.]+$/, '') === watchId);
        if (currentFilter === 'ALL' || (watch && watch.brand === currentFilter)) {
            watchListContainer.appendChild(item);
        } else {
            item.remove();
        }
    }

    function addEventListeners(item) {
        // 데스크톱 드래그
        item.addEventListener('dragstart', () => {
            draggedWatch = item;
            setTimeout(() => item.classList.add('dragging'), 0);
        });
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            draggedWatch = null;
        });

        // 클릭 / 탭
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            if (item.parentNode.classList.contains('slot')) {
                moveToInventory(item);
            } else if (watchCase.classList.contains('open')) {
                const emptySlot = Array.from(slots).find(s => s.childElementCount === 0);
                if (emptySlot) moveToSlot(item, emptySlot);
            }
        });

        // 모바일 터치 드래그
        addTouchDrag(item);
    }

    function addTouchDrag(item) {
        let clone = null;
        let startX, startY, isDragging = false;

        item.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            startX = t.clientX;
            startY = t.clientY;
            isDragging = false;
        }, { passive: true });

        item.addEventListener('touchmove', (e) => {
            const t = e.touches[0];
            if (!isDragging) {
                if (Math.hypot(t.clientX - startX, t.clientY - startY) < 8) return;
                if (!watchCase.classList.contains('open')) return;
                isDragging = true;
                draggedWatch = item;
                item.classList.add('dragging');
                clone = item.cloneNode(true);
                clone.className = 'touch-clone';
                document.body.appendChild(clone);
            }
            e.preventDefault();
            clone.style.left = t.clientX + 'px';
            clone.style.top = t.clientY + 'px';
        }, { passive: false });

        item.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            clone.remove();
            clone = null;
            item.classList.remove('dragging');

            const t = e.changedTouches[0];
            item.style.visibility = 'hidden';
            const target = document.elementFromPoint(t.clientX, t.clientY);
            item.style.visibility = '';

            const targetSlot = target?.closest('.slot');
            if (targetSlot && watchCase.classList.contains('open')) {
                moveToSlot(draggedWatch, targetSlot);
            }
            draggedWatch = null;
            isDragging = false;
        });
    }

    renderWatchList();

    watchCase.addEventListener('click', () => watchCase.classList.toggle('open'));

    // 슬롯 드래그 이벤트
    slots.forEach(slot => {
        slot.addEventListener('dragenter', (e) => { e.preventDefault(); slot.classList.add('drag-over'); });
        slot.addEventListener('dragover', (e) => e.preventDefault());
        slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.classList.remove('drag-over');
            if (watchCase.classList.contains('open') && draggedWatch) {
                moveToSlot(draggedWatch, slot);
            }
        });
        slot.addEventListener('click', (e) => {
            e.stopPropagation();
            const watch = slot.querySelector('.watch-item');
            if (watch) moveToInventory(watch);
        });
    });

    // 시계 목록 마우스 드래그 스크롤
    let isScrolling = false, scrollStartX, scrollLeft;
    watchListContainer.addEventListener('mousedown', (e) => {
        isScrolling = true;
        scrollStartX = e.pageX - watchListContainer.offsetLeft;
        scrollLeft = watchListContainer.scrollLeft;
    });
    watchListContainer.addEventListener('mouseleave', () => { isScrolling = false; });
    watchListContainer.addEventListener('mouseup', () => { isScrolling = false; });
    watchListContainer.addEventListener('mousemove', (e) => {
        if (!isScrolling) return;
        e.preventDefault();
        const x = e.pageX - watchListContainer.offsetLeft;
        watchListContainer.scrollLeft = scrollLeft - (x - scrollStartX) * 1.5;
    });
}
