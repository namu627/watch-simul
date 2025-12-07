const WATCH_FILENAMES = [
    'Carl F. Bucherer Manero.png', 
    'Grand Seiko sbgx261.png', 
    'Grand Seiko sbgx355.png', 
    'HAMILTON khaki.png', 
    'cartier tank.png',
    'HAMILTON khaki murph.png', 
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

    // --- 1. 드래그 스크롤을 위한 변수 추가 ---
    let isDown = false;
    let startX;
    let scrollLeft;

    // ★ 2. 드래그 스크롤 이벤트 리스너 추가
    watchListContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        // 마우스 커서를 '잡는' 모양으로 변경
        watchListContainer.classList.add('active-grab'); 
        
        // 클릭한 마우스 위치를 저장
        startX = e.pageX - watchListContainer.offsetLeft;
        // 현재 목록의 스크롤 위치를 저장
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
        if (!isDown) return; // 마우스 버튼이 눌려있지 않으면 작동 안 함
        e.preventDefault();
        
        // 마우스 이동 거리 계산
        const x = e.pageX - watchListContainer.offsetLeft;
        // 이동 속도를 조절하는 상수 (값이 클수록 더 빨리 스크롤됨)
        const walk = (x - startX) * 1.5; 
        
        // 스크롤 위치 업데이트
        watchListContainer.scrollLeft = scrollLeft - walk;
    });
    // --- 드래그 스크롤 로직 끝 ---


    // --- (이하 기존 코드 유지) ---
    
    // 빈 슬롯 찾기 함수 (기존)
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
            // 드래그 스크롤과 충돌을 막기 위해 여기서 드래그 시작 여부를 판단할 필요가 있습니다.
            // 하지만 드래그 앤 드롭이 native 기능이므로 충돌 방지는 마우스 이벤트에서 처리합니다.
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

    // 보조 함수: 이미지 생성 및 이벤트 추가
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
    // --- 이미지 생성 로직 끝 ---

    
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