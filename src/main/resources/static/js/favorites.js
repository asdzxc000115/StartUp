document.addEventListener('DOMContentLoaded', function() {
    // 즐겨찾기 데이터 (실제로는 서버에서 가져올 데이터)
    const favoritesData = [
        {
            id: 1,
            name: '맛있는 한식당',
            category: '한식',
            foodType: 'korean',
            location: '강남구',
            address: '서울시 강남구 역삼동 123-45',
            distance: 10,
            rating: 4.5,
            image: 'https://via.placeholder.com/300x200'
        },
        {
            id: 2,
            name: '분위기 좋은 카페',
            category: '카페',
            foodType: 'cafe',
            location: '강남구',
            address: '서울시 강남구 역삼동 456-78',
            distance: 5,
            rating: 4.8,
            image: 'https://via.placeholder.com/300x200'
        },
        {
            id: 3,
            name: '스시 오마카세',
            category: '일식',
            foodType: 'japanese',
            location: '강남구',
            address: '서울시 강남구 역삼동 789-10',
            distance: 15,
            rating: 4.2,
            image: 'https://via.placeholder.com/300x200'
        },
        {
            id: 4,
            name: '이탈리안 레스토랑',
            category: '양식',
            foodType: 'western',
            location: '강남구',
            address: '서울시 강남구 역삼동 121-13',
            distance: 12,
            rating: 4.6,
            image: 'https://via.placeholder.com/300x200'
        },
        {
            id: 5,
            name: '중국집 원조',
            category: '중식',
            foodType: 'chinese',
            location: '강남구',
            address: '서울시 강남구 역삼동 101-11',
            distance: 8,
            rating: 4.0,
            image: 'https://via.placeholder.com/300x200'
        }
    ];

    // 즐겨찾기 초기 데이터 표시
    let currentFavorites = [...favoritesData];
    renderFavorites(currentFavorites);

    // 카테고리 필터 적용
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            applyFilters();
        });
    }

    // 정렬 옵션 적용
    const sortOption = document.getElementById('sort-option');
    if (sortOption) {
        sortOption.addEventListener('change', function() {
            applyFilters();
        });
    }

    // 검색 기능
    const searchInput = document.getElementById('search-favorites');
    const searchBtn = document.getElementById('search-btn');

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            applyFilters();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    }

    // 필터 적용 함수
    function applyFilters() {
        const selectedCategory = categoryFilter ? categoryFilter.value : '';
        const selectedSort = sortOption ? sortOption.value : 'recent';
        const searchText = searchInput ? searchInput.value.toLowerCase() : '';

        // 필터링
        let filteredFavorites = favoritesData.filter(favorite => {
            // 카테고리 필터
            if (selectedCategory && favorite.foodType !== selectedCategory) {
                return false;
            }

            // 검색어 필터
            if (searchText) {
                return favorite.name.toLowerCase().includes(searchText) ||
                    favorite.category.toLowerCase().includes(searchText) ||
                    favorite.address.toLowerCase().includes(searchText);
            }

            return true;
        });

        // 정렬
        switch (selectedSort) {
            case 'rating':
                filteredFavorites.sort((a, b) => b.rating - a.rating);
                break;
            case 'name':
                filteredFavorites.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'recent':
            default:
                // 이미 ID 순 (가정상 최근 추가 순)으로 정렬되어 있음
                break;
        }

        // 결과 표시
        currentFavorites = filteredFavorites;
        renderFavorites(currentFavorites);
    }

    // 즐겨찾기 목록 렌더링 함수
    function renderFavorites(favorites) {
        const favoriteContainer = document.getElementById('favorites-container');
        const emptyFavorites = document.querySelector('.empty-favorites');

        if (!favoriteContainer) return;

        if (favorites.length === 0) {
            favoriteContainer.style.display = 'none';
            if (emptyFavorites) {
                emptyFavorites.style.display = 'block';
            }
            return;
        }

        if (emptyFavorites) {
            emptyFavorites.style.display = 'none';
        }
        favoriteContainer.style.display = 'grid';

        favoriteContainer.innerHTML = '';

        favorites.forEach(favorite => {
            const favoriteItem = createFavoriteItem(favorite);
            favoriteContainer.appendChild(favoriteItem);
        });
    }

    // 즐겨찾기 아이템 생성 함수
    function createFavoriteItem(favorite) {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        item.dataset.id = favorite.id;

        item.innerHTML = `
            <div class="favorite-image">
                <img src="${favorite.image}" alt="${favorite.name}">
                <span class="rating"><i class="fas fa-star"></i> ${favorite.rating.toFixed(1)}</span>
                <button class="remove-favorite"><i class="fas fa-trash-alt"></i></button>
            </div>
            <div class="favorite-info">
                <h3>${favorite.name}</h3>
                <p class="category">${favorite.category} • ${favorite.location}</p>
                <p class="address"><i class="fas fa-map-marker-alt"></i> ${favorite.address}</p>
                <div class="favorite-actions">
                    <button class="btn-view"><i class="fas fa-info-circle"></i> 상세정보</button>
                    <button class="btn-navigate"><i class="fas fa-directions"></i> 길찾기</button>
                </div>
            </div>
        `;

        // 즐겨찾기 삭제 버튼 이벤트
        const removeBtn = item.querySelector('.remove-favorite');
        if (removeBtn) {
            removeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                removeFavorite(favorite.id);
            });
        }

        // 상세정보 버튼 이벤트
        const viewBtn = item.querySelector('.btn-view');
        if (viewBtn) {
            viewBtn.addEventListener('click', function() {
                showRestaurantDetails(favorite.id);
            });
        }

        // 길찾기 버튼 이벤트
        const navigateBtn = item.querySelector('.btn-navigate');
        if (navigateBtn) {
            navigateBtn.addEventListener('click', function() {
                navigateToRestaurant(favorite.address);
            });
        }

        return item;
    }

    // 즐겨찾기 삭제 함수
    function removeFavorite(id) {
        // 실제로는 서버 API 호출
        showNotification('즐겨찾기에서 삭제하시겠습니까?');

        // 확인을 위한 임시 모달 (실제로는 모달 구현 필요)
        if (confirm('정말로 이 식당을 즐겨찾기에서 삭제하시겠습니까?')) {
            // 데이터에서 제거
            currentFavorites = currentFavorites.filter(item => item.id !== id);

            // UI 업데이트
            renderFavorites(currentFavorites);

            showNotification('즐겨찾기에서 삭제되었습니다.');
        }
    }

    // 식당 상세정보 표시 함수
    function showRestaurantDetails(id) {
        // 실제로는 상세정보 페이지로 이동 또는 모달 표시
        const restaurant = favoritesData.find(item => item.id === id);
        showNotification(`${restaurant.name} 상세정보로 이동합니다.`);

        // 임시로 알림만 표시
        alert(`${restaurant.name} 상세정보 페이지는 준비 중입니다.`);
    }

    // 길찾기 기능 함수
    function navigateToRestaurant(address) {
        // 실제로는 지도 API를 연동하여 길찾기 기능 제공
        showNotification(`${address}로 길찾기를 시작합니다.`);

        // 임시로 알림만 표시
        alert(`길찾기 기능은 준비 중입니다. 주소: ${address}`);
    }

    // 페이지네이션 기능
    const prevBtn = document.querySelector('.pagination-btn.prev');
    const nextBtn = document.querySelector('.pagination-btn.next');
    const pageNumbers = document.querySelectorAll('.page-number');

    // 페이지 버튼 클릭 이벤트
    pageNumbers.forEach(button => {
        button.addEventListener('click', function() {
            // 활성 페이지 변경
            pageNumbers.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // 실제로는 해당 페이지 데이터 로드
            const page = parseInt(this.textContent);
            showNotification(`${page}페이지로 이동합니다.`);

            // 페이지 이동 시뮬레이션
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // 이전/다음 페이지 버튼 이벤트
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            const currentPage = document.querySelector('.page-number.active');
            const prevPage = currentPage.previousElementSibling;

            if (prevPage && prevPage.classList.contains('page-number')) {
                prevPage.click();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            const currentPage = document.querySelector('.page-number.active');
            const nextPage = currentPage.nextElementSibling;

            if (nextPage && nextPage.classList.contains('page-number')) {
                nextPage.click();
            }
        });
    }

    // 알림 표시 함수 (main.js의 함수 활용 또는 임시 구현)
    function showNotification(message, type = 'success') {
        // main.js에 정의된 showNotification 함수 활용
        // 혹은 여기서 직접 구현

        // 전역에 showNotification 함수가 없을 경우 임시 구현
        if (typeof window.showNotification !== 'function') {
            // 기존 알림 제거
            const existingNotification = document.querySelector('.notification');
            if (existingNotification) {
                existingNotification.remove();
            }

            // 새 알림 생성
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <p>${message}</p>
                    <button class="close-notification"><i class="fas fa-times"></i></button>
                </div>
            `;

            // 알림 스타일
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.right = '20px';
            notification.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
            notification.style.color = 'white';
            notification.style.padding = '15px';
            notification.style.borderRadius = '4px';
            notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
            notification.style.zIndex = '1001';
            notification.style.minWidth = '250px';
            notification.style.maxWidth = '400px';

            // 닫기 버튼 스타일 및 이벤트
            const closeBtn = notification.querySelector('.close-notification');
            closeBtn.style.background = 'none';
            closeBtn.style.border = 'none';
            closeBtn.style.color = 'white';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.marginLeft = '10px';

            closeBtn.addEventListener('click', function() {
                notification.remove();
            });

            // 알림 추가
            document.body.appendChild(notification);

            // 자동 제거 타이머
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    notification.remove();
                }
            }, 5000);
        } else {
            // 전역 함수가 있으면 활용
            window.showNotification(message, type);
        }
    }
});