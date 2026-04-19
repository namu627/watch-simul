const IMAGE_BASE_PATH = 'images/';

document.addEventListener('DOMContentLoaded', () => init(WATCH_DATA));

function init(WATCH_DATA) {
    const watchCase = document.getElementById('watchCase');
    const watchListContainer = document.getElementById('watchList');
    const brandFilterContainer = document.getElementById('brandFilter');
    const slots = document.querySelectorAll('.slot');
    let draggedWatch = null;

    // 1. 브랜드 필터 버튼 생성
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

    // 2. 시계 목록 렌더링 (보관함에 있는 것은 제외)
    function renderWatchList(filterBrand = 'ALL') {
        const watchesInSlots = Array.from(document.querySelectorAll('.slot img'))
                                    .map(img => img.getAttribute('data-watch-id'));

        watchListContainer.innerHTML = '';
        const filtered = filterBrand === 'ALL' 
            ? WATCH_DATA 
            : WATCH_DATA.filter(w => w.brand === filterBrand);

        filtered.forEach(watch => {
            const watchId = watch.file.split('.')[0];
            if (!watchesInSlots.includes(watchId)) {
                const img = createWatchItem(watch.file);
                watchListContainer.appendChild(img);
            }
        });
    }

    function createWatchItem(fileName) {
        const url = IMAGE_BASE_PATH + fileName;
        const altText = fileName.split('.')[0];
        const img = document.createElement('img');
        img.src = url; img.alt = altText;
        img.className = 'watch-item';
        img.draggable = true;
        img.setAttribute('data-watch-id', altText);
        addDragListeners(img);
        return img;
    }

    function addDragListeners(item) {
        item.addEventListener('dragstart', (e) => {
            draggedWatch = item;
            item.classList.add('dragging');
        });
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            draggedWatch = null;
        });
        
        item.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            if (item.parentNode.classList.contains('slot')) {
                moveToInventory(item);
            } else if (watchCase.classList.contains('open')) {
                const emptySlot = Array.from(slots).find(s => s.childElementCount === 0);
                if (emptySlot) {
                    emptySlot.appendChild(item);
                    item.style.cursor = 'pointer';
                }
            }
        });
    }

    // 시계를 목록(인벤토리)으로 다시 보낼 때 필터 상태 체크
    function moveToInventory(item) {
        const currentFilter = document.querySelector('.filter-btn.active').textContent;
        const watchData = WATCH_DATA.find(w => w.file.includes(item.alt));
        if (currentFilter === 'ALL' || (watchData && watchData.brand === currentFilter)) {
            watchListContainer.appendChild(item);
            item.style.cursor = 'grab';
        } else {
            item.remove(); // 현재 필터에 안 맞으면 목록에서 일단 제거 (필터 변경 시 다시 나타남)
        }
    }

    // 초기 실행
    renderWatchList();

    // 보관함 클릭 이벤트 (기존 디자인 유지)
    watchCase.addEventListener('click', () => {
        watchCase.classList.toggle('open');
    });

    // 드롭 이벤트
    slots.forEach(slot => {
        slot.addEventListener('dragover', e => e.preventDefault());
        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            if (watchCase.classList.contains('open') && draggedWatch) {
                const existing = slot.querySelector('.watch-item');
                if (existing) moveToInventory(existing);
                slot.appendChild(draggedWatch);
                draggedWatch.style.cursor = 'pointer';
            }
        });
    });
}