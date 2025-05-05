document.addEventListener('DOMContentLoaded', function() {
    // 모바일 메뉴 토글 기능
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            nav.classList.toggle('active');

            // 모바일 메뉴가 활성화되면 span 요소들을 X 모양으로 변경
            const spans = this.querySelectorAll('span');
            if (this.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';

                // 모바일 메뉴 표시
                nav.style.display = 'block';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';

                // 모바일 메뉴 숨기기
                nav.style.display = '';
            }
        });
    }

    // 현재 위치 버튼 클릭 이벤트
    const currentLocationBtn = document.getElementById('current-location-btn');
    if (currentLocationBtn) {
        currentLocationBtn.addEventListener('click', function() {
            if (navigator.geolocation) {
                // 로딩 상태로 버튼 변경
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 위치 확인 중...';
                this.disabled = true;

                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        // 위치 정보 확인 성공
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;

                        // 위치 정보를 활용한 처리 (예: 지도에 표시, 주변 음식점 검색 등)
                        console.log(`현재 위치: 위도 ${latitude}, 경도 ${longitude}`);

                        // 위치 정보를 기반으로 근처 음식점 검색 함수 호출
                        searchNearbyRestaurants(latitude, longitude);

                        // 버튼 상태 복원
                        currentLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> 현재 위치 사용';
                        currentLocationBtn.disabled = false;

                        // 알림 표시
                        showNotification('현재 위치를 확인했습니다. 주변 음식점을 검색합니다.');

                        // 카카오맵 업데이트 (전역 함수 호출)
                        if (typeof updateKakaoMap === 'function') {
                            updateKakaoMap(latitude, longitude);
                        }
                    },
                    function(error) {
                        // 위치 정보 확인 실패
                        console.error('위치 정보를 가져오는데 실패했습니다:', error);

                        // 버튼 상태 복원
                        currentLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> 현재 위치 사용';
                        currentLocationBtn.disabled = false;

                        // 오류 메시지 표시
                        let errorMessage = '';
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage = '위치 정보 액세스 권한이 거부되었습니다.';
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage = '위치 정보를 사용할 수 없습니다.';
                                break;
                            case error.TIMEOUT:
                                errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
                                break;
                            default:
                                errorMessage = '알 수 없는 오류가 발생했습니다.';
                        }
                        showNotification(errorMessage, 'error');
                    }
                );
            } else {
                showNotification('브라우저에서 위치 정보를 지원하지 않습니다.', 'error');
            }
        });
    }

    // 검색 버튼 클릭 이벤트
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const restaurantName = document.getElementById('restaurant-name-input').value;
            const foodType = document.getElementById('food-type').value;
            const priceRange = document.getElementById('price-range').value;

            if (restaurantName.trim() === '' && foodType === '' && priceRange === '') {
                showNotification('맛집 이름, 음식 종류, 가격대 중 하나 이상 입력해주세요.', 'error');
                return;
            }

            // 검색 결과 표시 함수 호출
            searchRestaurants(restaurantName, foodType, priceRange);
        });
    }

    // 식당 이름 입력 필드에서 엔터키 처리
    const restaurantNameInput = document.getElementById('restaurant-name-input');
    if (restaurantNameInput) {
        restaurantNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }

    // 정렬 옵션 변경 이벤트
    const sortOption = document.getElementById('sort-option');
    if (sortOption) {
        sortOption.addEventListener('change', function() {
            const selectedOption = this.value;
            sortRestaurants(selectedOption);
        });
    }

    // 더보기 버튼 클릭 이벤트
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            loadMoreRestaurants();
        });
    }

    // 알림 표시 함수
    function showNotification(message, type = 'success') {
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
        notification.style.animation = 'slideIn 0.3s ease-out';

        // 알림 내용 스타일
        const content = notification.querySelector('.notification-content');
        content.style.display = 'flex';
        content.style.justifyContent = 'space-between';
        content.style.alignItems = 'center';

        // 닫기 버튼 스타일
        const closeBtn = notification.querySelector('.close-notification');
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.color = 'white';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontSize = '1rem';

        // 닫기 버튼 이벤트
        closeBtn.addEventListener('click', function() {
            notification.remove();
        });

        // 알림 추가
        document.body.appendChild(notification);

        // 자동 제거 타이머
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);

        // 알림 애니메이션 스타일 추가
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // 전역으로 함수 노출
    window.showNotification = showNotification;

    // API로부터 레스토랑 데이터를 가져오는 함수 (가상의 함수)
    function searchNearbyRestaurants(latitude, longitude) {
        // 실제 구현에서는 API 호출을 통해 데이터를 가져옴
        // 여기서는 예시 데이터를 사용하여 UI 업데이트

        showNotification('주변 맛집을 검색 중입니다...');

        // 검색 중임을 표시
        const restaurantContainer = document.getElementById('restaurant-container');
        if (restaurantContainer) {
            restaurantContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 주변 맛집을 검색 중입니다...</div>';
        }

        // 서버에서 데이터를 가져오는 것을 시뮬레이션 (1초 후)
        setTimeout(() => {
            // 예시 데이터 - 실제로는 서버에서 받아온 데이터를 사용
            const sampleData = getSampleRestaurants();
            updateRestaurantList(sampleData);

            // 지도 업데이트
            if (typeof updateKakaoMapWithRestaurants === 'function') {
                updateKakaoMapWithRestaurants(latitude, longitude, sampleData);
            }

            showNotification('검색이 완료되었습니다.');
        }, 1000);
    }

    // 맛집 이름, 음식 종류, 가격대로 레스토랑 검색하는 함수
    function searchRestaurants(restaurantName, foodType, priceRange) {
        // 실제 구현에서는 API 호출을 통해 데이터를 가져옴
        let searchMsg = '';
        if (restaurantName) {
            searchMsg = `'${restaurantName}' 맛집을 검색 중입니다...`;
        } else if (foodType || priceRange) {
            searchMsg = '조건에 맞는 맛집을 검색 중입니다...';
        }
        showNotification(searchMsg);

        // 검색 중임을 표시
        const restaurantContainer = document.getElementById('restaurant-container');
        if (restaurantContainer) {
            restaurantContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 맛집을 검색 중입니다...</div>';
        }

        // 서버에서 데이터를 가져오는 것을 시뮬레이션 (1초 후)
        setTimeout(() => {
            // 예시 데이터 (필터링 적용)
            let sampleData = getSampleRestaurants();

            // 맛집 이름 필터링
            if (restaurantName) {
                sampleData = sampleData.filter(item =>
                    item.name.toLowerCase().includes(restaurantName.toLowerCase())
                );
            }

            // 음식 종류 필터링
            if (foodType) {
                sampleData = sampleData.filter(item => item.foodType === foodType);
            }

            // 가격대 필터링
            if (priceRange) {
                sampleData = sampleData.filter(item => item.priceRange === priceRange);
            }

            if (sampleData.length === 0) {
                restaurantContainer.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
                showNotification('검색 결과가 없습니다.', 'error');
            } else {
                updateRestaurantList(sampleData);
                showNotification(`${sampleData.length}개의 맛집을 찾았습니다.`);

                // 카카오맵 업데이트 (검색 결과 표시)
                if (typeof updateKakaoMapWithRestaurants === 'function') {
                    // 첫 번째 결과 식당의 위치를 중심으로 지도 업데이트
                    updateKakaoMapWithRestaurants(null, null, sampleData);
                }
            }
        }, 1000);
    }

    // 레스토랑 목록 정렬 함수
    function sortRestaurants(sortBy) {
        const restaurantContainer = document.getElementById('restaurant-container');
        if (!restaurantContainer) return;

        // 현재 표시된 레스토랑 아이템 가져오기
        const items = document.querySelectorAll('.restaurant-item');
        if (items.length === 0) return;

        // 레스토랑 데이터 배열 (실제 구현에서는 데이터 상태 관리 필요)
        let restaurants = Array.from(items).map(item => {
            const rating = parseFloat(item.querySelector('.rating').textContent.replace(/[^\d.]/g, ''));
            const distance = parseInt(item.querySelector('.distance').textContent.match(/\d+/)[0]);
            return {
                element: item,
                rating: rating,
                distance: distance
            };
        });

        // 정렬 적용
        switch (sortBy) {
            case 'rating':
                restaurants.sort((a, b) => b.rating - a.rating);
                break;
            case 'distance':
                restaurants.sort((a, b) => a.distance - b.distance);
                break;
            case 'reviews':
                // 리뷰 수는 예시 데이터에 없으므로 랜덤 정렬 (실제로는 리뷰 수로 정렬)
                restaurants.sort(() => Math.random() - 0.5);
                break;
        }

        // DOM 재구성
        const fragment = document.createDocumentFragment();
        restaurants.forEach(restaurant => {
            fragment.appendChild(restaurant.element.cloneNode(true));
        });

        restaurantContainer.innerHTML = '';
        restaurantContainer.appendChild(fragment);

        showNotification(`맛집이 ${sortBy === 'rating' ? '평점순' : (sortBy === 'distance' ? '거리순' : '리뷰순')}으로 정렬되었습니다.`);
    }

    // 더 많은 레스토랑 불러오기 함수
    function loadMoreRestaurants() {
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 불러오는 중...';
            loadMoreBtn.disabled = true;
        }

        // 추가 데이터를 가져오는 것을 시뮬레이션 (1초 후)
        setTimeout(() => {
            const moreData = getMoreSampleRestaurants();
            appendRestaurants(moreData);

            if (loadMoreBtn) {
                loadMoreBtn.innerHTML = '더 보기 <i class="fas fa-chevron-down"></i>';
                loadMoreBtn.disabled = false;
            }

            showNotification('추가 맛집을 불러왔습니다.');

            // 카카오맵에 추가 맛집 표시
            if (typeof addMarkersToKakaoMap === 'function') {
                addMarkersToKakaoMap(moreData);
            }
        }, 1000);
    }

    // 레스토랑 목록 업데이트 함수
    function updateRestaurantList(restaurants) {
        const restaurantContainer = document.getElementById('restaurant-container');
        if (!restaurantContainer) return;

        restaurantContainer.innerHTML = '';

        restaurants.forEach(restaurant => {
            const item = createRestaurantItem(restaurant);
            restaurantContainer.appendChild(item);
        });
    }

    // 레스토랑 목록에 추가 항목 추가 함수
    function appendRestaurants(restaurants) {
        const restaurantContainer = document.getElementById('restaurant-container');
        if (!restaurantContainer) return;

        restaurants.forEach(restaurant => {
            const item = createRestaurantItem(restaurant);
            restaurantContainer.appendChild(item);
        });
    }

    // 레스토랑 아이템 HTML 생성 함수
    function createRestaurantItem(restaurant) {
        const item = document.createElement('div');
        item.className = 'restaurant-item';
        item.dataset.id = restaurant.id;
        item.dataset.lat = restaurant.lat || 37.5;  // 기본값 설정 (실제 데이터에는 좌표가 있어야 함)
        item.dataset.lng = restaurant.lng || 127.0; // 기본값 설정 (실제 데이터에는 좌표가 있어야 함)

        item.innerHTML = `
            <div class="restaurant-image">
                <img src="${restaurant.image}" alt="${restaurant.name}">
                <span class="rating"><i class="fas fa-star"></i> ${restaurant.rating}</span>
            </div>
            <div class="restaurant-info">
                <h4>${restaurant.name}</h4>
                <p class="category">${restaurant.category} • ${restaurant.location}</p>
                <p class="address"><i class="fas fa-map-marker-alt"></i> ${restaurant.address}</p>
                <p class="distance"><i class="fas fa-walking"></i> 도보 ${restaurant.distance}분</p>
                <div class="restaurant-tags">
                    ${restaurant.tags.map(tag => `<span>${tag}</span>`).join('')}
                </div>
            </div>
        `;

        // 아이템 클릭 이벤트 (지도에서 해당 맛집 표시)
        item.addEventListener('click', function() {
            const id = this.dataset.id;
            const lat = parseFloat(this.dataset.lat);
            const lng = parseFloat(this.dataset.lng);

            // 해당 맛집을 지도에서 강조 표시
            if (typeof highlightMarkerOnMap === 'function') {
                highlightMarkerOnMap(id, lat, lng);
            }
        });

        return item;
    }

    // 예시 데이터 생성 함수
    function getSampleRestaurants() {
        return [
            {
                id: 1,
                name: '맛있는 한식당',
                category: '한식',
                foodType: 'korean',
                location: '강남구',
                address: '서울시 강남구 역삼동 123-45',
                distance: 10,
                rating: 4.5,
                priceRange: 'medium',
                image: 'https://via.placeholder.com/300x200',
                tags: ['주차가능', '단체석', '배달가능'],
                lat: 37.501,
                lng: 127.036
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
                priceRange: 'low',
                image: 'https://via.placeholder.com/300x200',
                tags: ['와이파이', '콘센트', '테라스'],
                lat: 37.503,
                lng: 127.038
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
                priceRange: 'high',
                image: 'https://via.placeholder.com/300x200',
                tags: ['예약필수', '오마카세', '술있음'],
                lat: 37.505,
                lng: 127.034
            },
            {
                id: 4,
                name: '중국집 원조',
                category: '중식',
                foodType: 'chinese',
                location: '강남구',
                address: '서울시 강남구 역삼동 101-11',
                distance: 8,
                rating: 4.0,
                priceRange: 'medium',
                image: 'https://via.placeholder.com/300x200',
                tags: ['주차가능', '단체석', '포장가능'],
                lat: 37.497,
                lng: 127.032
            },
            {
                id: 5,
                name: '이탈리안 레스토랑',
                category: '양식',
                foodType: 'western',
                location: '강남구',
                address: '서울시 강남구 역삼동 121-13',
                distance: 12,
                rating: 4.6,
                priceRange: 'high',
                image: 'https://via.placeholder.com/300x200',
                tags: ['예약가능', '와인', '테라스'],
                lat: 37.499,
                lng: 127.037
            },
            {
                id: 6,
                name: '햄버거 전문점',
                category: '패스트푸드',
                foodType: 'fastfood',
                location: '강남구',
                address: '서울시 강남구 역삼동 131-14',
                distance: 3,
                rating: 3.9,
                priceRange: 'low',
                image: 'https://via.placeholder.com/300x200',
                tags: ['테이크아웃', '배달가능', '주차불가'],
                lat: 37.502,
                lng: 127.030
            }
        ];
    }

    // 예시용 전역에 노출
    window.getSampleRestaurants = getSampleRestaurants;

    // 추가 예시 데이터 생성 함수
    function getMoreSampleRestaurants() {
        return [
            {
                id: 7,
                name: '전통 한정식',
                category: '한식',
                foodType: 'korean',
                location: '강남구',
                address: '서울시 강남구 역삼동 141-15',
                distance: 18,
                rating: 4.7,
                priceRange: 'high',
                image: 'https://via.placeholder.com/300x200',
                tags: ['예약필수', '코스요리', '주차가능'],
                lat: 37.507,
                lng: 127.042
            },
            {
                id: 8,
                name: '베트남 쌀국수',
                category: '아시안',
                foodType: 'asian',
                location: '강남구',
                address: '서울시 강남구 역삼동 151-16',
                distance: 7,
                rating: 4.3,
                priceRange: 'low',
                image: 'https://via.placeholder.com/300x200',
                tags: ['테이크아웃', '배달가능', '현지음식'],
                lat: 37.506,
                lng: 127.039
            },
            {
                id: 9,
                name: '디저트 카페',
                category: '카페',
                foodType: 'cafe',
                location: '강남구',
                address: '서울시 강남구 역삼동 161-17',
                distance: 4,
                rating: 4.4,
                priceRange: 'medium',
                image: 'https://via.placeholder.com/300x200',
                tags: ['디저트', '브런치', '와이파이'],
                lat: 37.504,
                lng: 127.041
            }
        ];
    }
});

// CSS 스타일 추가 (알림 창 등)
document.addEventListener('DOMContentLoaded', function() {
    // 모바일 메뉴 스타일
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
        @media (max-width: 768px) {
            nav.active {
                display: block;
                position: absolute;
                top: 60px;
                left: 0;
                width: 100%;
                background-color: white;
                box-shadow: 0 5px 10px rgba(0,0,0,0.1);
                padding: 20px;
                z-index: 100;
            }
            
            nav.active ul {
                flex-direction: column;
                align-items: center;
            }
            
            nav.active ul li {
                margin: 10px 0;
                text-align: center;
                width: 100%;
            }
            
            .mobile-menu-btn.active span {
                margin: 0 auto;
            }
        }
        
        .loading {
            text-align: center;
            padding: 50px 0;
            color: #777;
            font-size: 1.1rem;
        }
        
        .loading i {
            margin-right: 10px;
            font-size: 1.5rem;
            color: #ff6b6b;
        }
        
        .no-results {
            text-align: center;
            padding: 50px 0;
            color: #777;
            font-size: 1.1rem;
        }
        
        .restaurant-item {
            cursor: pointer;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .restaurant-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
    `;
    document.head.appendChild(styleElement);
});