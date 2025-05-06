/**
 * 맛집 탐색기 - 메인 페이지 자바스크립트
 */
document.addEventListener('DOMContentLoaded', function() {
    // 전역 변수
    let map = null;
    let markers = [];
    let currentRestaurants = [];
    let userLocation = null;

    // 초기화
    init();

    /**
     * 초기화 함수
     */
    function init() {
        // 모바일 메뉴 토글 설정
        setupMobileMenu();

        // 현재 위치 버튼 이벤트 설정
        setupLocationButton();

        // 검색 버튼 이벤트 설정
        setupSearchButton();

        // 정렬 옵션 이벤트 설정
        setupSortOptions();

        // 더보기 버튼 이벤트 설정
        setupLoadMoreButton();

        // 초기 데이터 로드
        loadInitialData();
    }

    /**
     * 모바일 메뉴 토글 설정
     */
    function setupMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const nav = document.querySelector('nav');

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', function() {
                this.classList.toggle('active');

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
    }

    /**
     * 현재 위치 버튼 이벤트 설정
     */
    function setupLocationButton() {
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

                            // 사용자 위치 저장
                            userLocation = {
                                lat: latitude,
                                lng: longitude
                            };

                            // 위치 기반 맛집 검색
                            searchRestaurantsByLocation(latitude, longitude);

                            // 버튼 상태 복원
                            currentLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> 현재 위치 사용';
                            currentLocationBtn.disabled = false;

                            // 알림 표시
                            showNotification('현재 위치를 확인했습니다. 주변 맛집을 검색합니다.');

                            // 지도 업데이트
                            updateMap(latitude, longitude);
                        },
                        function(error) {
                            // 위치 정보 확인 실패
                            console.error('위치 정보 가져오기 오류:', error);

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

                            // 기본 위치(인하대 후문)로 맛집 검색
                            searchRestaurantsByLocation(37.4498, 126.6539);
                        }
                    );
                } else {
                    showNotification('브라우저에서 위치 정보를 지원하지 않습니다.', 'error');

                    // 기본 위치(인하대 후문)로 맛집 검색
                    searchRestaurantsByLocation(37.4498, 126.6539);
                }
            });
        }
    }

    /**
     * 검색 버튼 이벤트 설정
     */
    function setupSearchButton() {
        const searchBtn = document.getElementById('search-btn');
        const restaurantNameInput = document.getElementById('restaurant-name-input');

        // 검색 버튼 클릭 이벤트
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                performSearch();
            });
        }

        // 이름 입력 필드 엔터키 이벤트
        if (restaurantNameInput) {
            restaurantNameInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
    }

    /**
     * 검색 실행
     */
    function performSearch() {
        const restaurantName = document.getElementById('restaurant-name-input').value;
        const foodType = document.getElementById('food-type').value;
        const priceRange = document.getElementById('price-range').value;

        // 모든 검색 필드가 비어있는 경우 검색하지 않음
        if (!restaurantName && !foodType && !priceRange) {
            showNotification('검색어를 입력하거나 필터를 선택해주세요.', 'error');
            return;
        }

        // 검색 중 표시
        const restaurantContainer = document.getElementById('restaurant-container');
        if (restaurantContainer) {
            restaurantContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 검색 중입니다...</div>';
        }

        // 검색 실행
        searchRestaurants(restaurantName, foodType, priceRange);
    }

    /**
     * 정렬 옵션 이벤트 설정
     */
    function setupSortOptions() {
        const sortOption = document.getElementById('sort-option');

        if (sortOption) {
            sortOption.addEventListener('change', function() {
                const selectedOption = this.value;

                // 정렬 실행
                sortRestaurants(selectedOption);
            });
        }
    }

    /**
     * 더보기 버튼 이벤트 설정
     */
    function setupLoadMoreButton() {
        const loadMoreBtn = document.getElementById('load-more-btn');

        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function() {
                loadMoreRestaurants();
            });
        }
    }

    /**
     * 초기 데이터 로드
     */
    function loadInitialData() {
        // 초기 데이터 로드 중 표시
        const restaurantContainer = document.getElementById('restaurant-container');
        if (restaurantContainer) {
            restaurantContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 맛집 정보를 불러오는 중입니다...</div>';
        }

        // 로컬 스토리지에서 가게 데이터 가져오기
        fetchRestaurantsFromLocalStorage()
            .then(restaurants => {
                // 가게 데이터 처리
                currentRestaurants = restaurants;

                // UI 업데이트
                updateRestaurantList(restaurants);

                // 지도 업데이트 (기본 위치: 인하대 후문)
                initializeMap(37.4498, 126.6539);
                addMarkersToMap(restaurants);
            })
            .catch(error => {
                console.error('데이터 로드 오류:', error);
                showNotification('맛집 정보를 불러오는데 실패했습니다.', 'error');

                // 샘플 데이터 사용
                const sampleData = getSampleRestaurants();
                currentRestaurants = sampleData;
                updateRestaurantList(sampleData);

                // 지도 업데이트 (기본 위치: 인하대 후문)
                initializeMap(37.4498, 126.6539);
                addMarkersToMap(sampleData);
            });
    }

    /**
     * 로컬 스토리지에서 가게 데이터 가져오기
     */
    async function fetchRestaurantsFromLocalStorage() {
        return new Promise((resolve, reject) => {
            try {
                // 로컬 스토리지에서 가게 데이터 가져오기
                const restaurantsData = localStorage.getItem('restaurants');

                // 데이터가 있으면 파싱하여 반환
                if (restaurantsData) {
                    const restaurants = JSON.parse(restaurantsData);
                    resolve(restaurants);
                } else {
                    // 데이터가 없으면 샘플 데이터 사용
                    resolve(getSampleRestaurants());
                }
            } catch (error) {
                console.error('로컬 스토리지 데이터 로드 오류:', error);
                reject(error);
            }
        });
    }

    /**
     * 가게 목록 UI 업데이트
     */
    function updateRestaurantList(restaurants) {
        const restaurantContainer = document.getElementById('restaurant-container');
        if (!restaurantContainer) return;

        // 컨테이너 초기화
        restaurantContainer.innerHTML = '';

        // 결과가 없는 경우
        if (restaurants.length === 0) {
            restaurantContainer.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
            return;
        }

        // 가게 항목 추가
        restaurants.forEach(restaurant => {
            const restaurantElement = createRestaurantElement(restaurant);
            restaurantContainer.appendChild(restaurantElement);
        });
    }

    /**
     * 가게 항목 생성
     */
    function createRestaurantElement(restaurant) {
        const restaurantItem = document.createElement('div');
        restaurantItem.className = 'restaurant-item';
        restaurantItem.dataset.id = restaurant.id;
        restaurantItem.dataset.lat = restaurant.lat;
        restaurantItem.dataset.lng = restaurant.lng;

        // 태그 HTML 생성
        let tagsHtml = '';
        if (restaurant.tags && restaurant.tags.length > 0) {
            tagsHtml = '<div class="restaurant-tags">';
            restaurant.tags.forEach(tag => {
                tagsHtml += `<span>${tag}</span>`;
            });
            tagsHtml += '</div>';
        } else if (restaurant.facilities && restaurant.facilities.length > 0) {
            tagsHtml = '<div class="restaurant-tags">';
            const facilityNames = {
                'parking': '주차가능',
                'wifi': '와이파이',
                'card': '카드결제',
                'kids': '유아의자',
                'group': '단체석',
                'nosmoke': '금연'
            };

            restaurant.facilities.forEach(facility => {
                if (facilityNames[facility]) {
                    tagsHtml += `<span>${facilityNames[facility]}</span>`;
                }
            });
            tagsHtml += '</div>';
        }

        // 거리 계산
        let distance = '';
        if (userLocation && restaurant.lat && restaurant.lng) {
            const distanceValue = calculateDistance(
                userLocation.lat, userLocation.lng,
                restaurant.lat, restaurant.lng
            );

            if (distanceValue < 1) {
                // 1km 미만은 미터로 표시
                distance = `<p class="distance"><i class="fas fa-walking"></i> 도보 ${Math.round(distanceValue * 1000)}m</p>`;
            } else {
                // 도보 시간 대략 계산 (4km/h 기준)
                const walkingMinutes = Math.round(distanceValue / 4 * 60);
                distance = `<p class="distance"><i class="fas fa-walking"></i> 도보 ${walkingMinutes}분</p>`;
            }
        }

        // 카테고리 이름 변환
        const categoryName = getCategoryName(restaurant.category);

        // 위치 정보 추출
        const location = getLocationFromAddress(restaurant.address);

        // HTML 생성
        restaurantItem.innerHTML = `
            <div class="restaurant-image">
                <img src="${restaurant.mainImage || 'https://via.placeholder.com/300x200'}" alt="${restaurant.name}">
                <span class="rating"><i class="fas fa-star"></i> ${restaurant.rating ? restaurant.rating.toFixed(1) : '0.0'}</span>
            </div>
            <div class="restaurant-info">
                <h4>${restaurant.name}</h4>
                <p class="category">${categoryName} • ${location}</p>
                <p class="address"><i class="fas fa-map-marker-alt"></i> ${restaurant.address}</p>
                ${distance}
                ${tagsHtml}
            </div>
        `;

        // 클릭 이벤트 (상세 페이지로 이동)
        restaurantItem.addEventListener('click', function() {
            window.location.href = `/restaurant?id=${restaurant.id}`;
        });

        return restaurantItem;
    }

    /**
     * 위치 기반 맛집 검색
     */
    function searchRestaurantsByLocation(latitude, longitude) {
        // 위치 정보 저장
        userLocation = {
            lat: latitude,
            lng: longitude
        };

        // 모든 맛집 가져오기
        fetchRestaurantsFromLocalStorage()
            .then(restaurants => {
                // 거리 계산 및 정렬
                restaurants.forEach(restaurant => {
                    if (restaurant.lat && restaurant.lng) {
                        restaurant.distance = calculateDistance(
                            latitude, longitude,
                            restaurant.lat, restaurant.lng
                        );
                    } else {
                        restaurant.distance = Infinity;
                    }
                });

                // 거리순 정렬
                restaurants.sort((a, b) => a.distance - b.distance);

                // 업데이트
                currentRestaurants = restaurants;
                updateRestaurantList(restaurants.slice(0, 9)); // 첫 9개만 표시

                // 지도 업데이트
                updateMap(latitude, longitude);
                addMarkersToMap(restaurants);
            })
            .catch(error => {
                console.error('위치 기반 검색 오류:', error);
                showNotification('맛집 정보를 불러오는데 실패했습니다.', 'error');
            });
    }

    /**
     * 맛집 검색
     */
    function searchRestaurants(name, foodType, priceRange) {
        fetchRestaurantsFromLocalStorage()
            .then(restaurants => {
                // 필터링
                let filtered = restaurants;

                if (name) {
                    filtered = filtered.filter(restaurant =>
                        restaurant.name.toLowerCase().includes(name.toLowerCase())
                    );
                }

                if (foodType) {
                    filtered = filtered.filter(restaurant =>
                        restaurant.category === foodType
                    );
                }

                if (priceRange) {
                    filtered = filtered.filter(restaurant =>
                        restaurant.priceRange === priceRange
                    );
                }

                // 사용자 위치가 있으면 거리 계산
                if (userLocation) {
                    filtered.forEach(restaurant => {
                        if (restaurant.lat && restaurant.lng) {
                            restaurant.distance = calculateDistance(
                                userLocation.lat, userLocation.lng,
                                restaurant.lat, restaurant.lng
                            );
                        } else {
                            restaurant.distance = Infinity;
                        }
                    });
                }

                // 정렬 (기본: 평점순)
                const sortOption = document.getElementById('sort-option').value;
                sortRestaurantsList(filtered, sortOption);

                // 업데이트
                currentRestaurants = filtered;
                updateRestaurantList(filtered.slice(0, 9)); // 첫 9개만 표시

                // 결과 개수 표시
                if (filtered.length === 0) {
                    showNotification('검색 결과가 없습니다.', 'error');
                } else {
                    showNotification(`${filtered.length}개의 맛집을 찾았습니다.`);
                }

                // 지도 업데이트
                if (filtered.length > 0) {
                    // 첫 번째 검색 결과 위치 중심
                    updateMap(filtered[0].lat, filtered[0].lng);

                    // 모든 마커 추가
                    clearMarkers();
                    addMarkersToMap(filtered);
                }
            })
            .catch(error => {
                console.error('검색 오류:', error);
                showNotification('검색 중 오류가 발생했습니다.', 'error');
            });
    }

    /**
     * 맛집 정렬
     */
    function sortRestaurants(option) {
        if (currentRestaurants.length === 0) return;

        sortRestaurantsList(currentRestaurants, option);
        updateRestaurantList(currentRestaurants.slice(0, 9)); // 첫 9개만 표시
    }

    /**
     * 맛집 목록 정렬
     */
    function sortRestaurantsList(restaurants, option) {
        switch (option) {
            case 'rating':
                // 평점순 정렬
                restaurants.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'distance':
                // 거리순 정렬 (위치 정보가 있는 경우만)
                if (userLocation) {
                    restaurants.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
                }
                break;
            case 'reviews':
                // 리뷰 많은순 정렬
                restaurants.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
                break;
        }
    }

    /**
     * 더 많은 맛집 로드
     */
    function loadMoreRestaurants() {
        if (currentRestaurants.length === 0) return;

        const restaurantContainer = document.getElementById('restaurant-container');
        if (!restaurantContainer) return;

        // 현재 표시된 맛집 수
        const currentCount = restaurantContainer.querySelectorAll('.restaurant-item').length;

        // 더 표시할 맛집이 없는 경우
        if (currentCount >= currentRestaurants.length) {
            showNotification('더 이상 표시할 맛집이 없습니다.');
            return;
        }

        // 다음 9개 맛집 추가
        const nextRestaurants = currentRestaurants.slice(currentCount, currentCount + 9);

        nextRestaurants.forEach(restaurant => {
            const restaurantElement = createRestaurantElement(restaurant);
            restaurantContainer.appendChild(restaurantElement);
        });

        // 모두 로드한 경우 더보기 버튼 숨김
        if (currentCount + nextRestaurants.length >= currentRestaurants.length) {
            const loadMoreBtn = document.getElementById('load-more-btn');
            if (loadMoreBtn) {
                loadMoreBtn.style.display = 'none';
            }
        }
    }

    /**
     * 지도 초기화
     */
    function initializeMap(latitude, longitude) {
        const mapContainer = document.getElementById('kakao-map');
        if (!mapContainer) return;

        const mapOption = {
            center: new kakao.maps.LatLng(latitude, longitude),
            level: 3
        };

        map = new kakao.maps.Map(mapContainer, mapOption);

        // 지도 컨트롤 추가
        const zoomControl = new kakao.maps.ZoomControl();
        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
    }

    /**
     * 지도 업데이트
     */
    function updateMap(latitude, longitude) {
        if (!map) {
            initializeMap(latitude, longitude);
            return;
        }

        // 지도 중심 이동
        const position = new kakao.maps.LatLng(latitude, longitude);
        map.setCenter(position);

        // 현재 위치 마커 추가
        const currentPositionMarker = new kakao.maps.Marker({
            position: position,
            map: map,
            title: '현재 위치',
            zIndex: 10
        });

        // 일정 시간 후 마커 제거
        setTimeout(() => {
            currentPositionMarker.setMap(null);
        }, 3000);
    }

    /**
     * 모든 마커 제거
     */
    function clearMarkers() {
        markers.forEach(marker => {
            marker.setMap(null);
        });
        markers = [];
    }

    /**
     * 지도에 마커 추가
     */
    function addMarkersToMap(restaurants) {
        if (!map) return;

        // 기존 마커 제거
        clearMarkers();

        // 새 마커 추가
        restaurants.forEach(restaurant => {
            if (restaurant.lat && restaurant.lng) {
                const position = new kakao.maps.LatLng(restaurant.lat, restaurant.lng);

                // 마커 생성
                const marker = new kakao.maps.Marker({
                    position: position,
                    map: map,
                    title: restaurant.name
                });

                // 마커 클릭 이벤트 (인포윈도우 표시)
                kakao.maps.event.addListener(marker, 'click', function() {
                    showInfoWindow(marker, restaurant);
                });

                // 마커 배열에 추가
                markers.push(marker);
            }
        });

        // 지도 범위 조정
        if (restaurants.length > 1 && restaurants.every(r => r.lat && r.lng)) {
            const bounds = new kakao.maps.LatLngBounds();

            restaurants.forEach(restaurant => {
                bounds.extend(new kakao.maps.LatLng(restaurant.lat, restaurant.lng));
            });

            map.setBounds(bounds);
        }
    }

    /**
     * 인포윈도우 표시
     */
    function showInfoWindow(marker, restaurant) {
        // 거리 계산
        let distanceText = '';
        if (userLocation && restaurant.lat && restaurant.lng) {
            const distance = calculateDistance(
                userLocation.lat, userLocation.lng,
                restaurant.lat, restaurant.lng
            );

            if (distance < 1) {
                distanceText = `도보 ${Math.round(distance * 1000)}m`;
            } else {
                const walkingMinutes = Math.round(distance / 4 * 60);
                distanceText = `도보 ${walkingMinutes}분`;
            }
        }

        // 카테고리 이름 변환
        const categoryName = getCategoryName(restaurant.category);

        // 위치 정보 추출
        const location = getLocationFromAddress(restaurant.address);

        // 인포윈도우 내용
        const content = `
            <div class="map-infowindow">
                <div class="info-header">
                    <h4>${restaurant.name}</h4>
                    <div class="info-rating"><i class="fas fa-star"></i> ${restaurant.rating ? restaurant.rating.toFixed(1) : '0.0'}</div>
                </div>
                <div class="info-body">
                    <p class="info-category">${categoryName} • ${location}</p>
                    <p class="info-address">${restaurant.address}</p>
                    ${distanceText ? `<p class="info-distance">${distanceText}</p>` : ''}
                </div>
                <div class="info-footer">
                    <button class="btn-detail" onclick="location.href='/restaurant?id=${restaurant.id}'">상세정보</button>
                    <button class="btn-favorite" onclick="addToFavorites(${restaurant.id})">즐겨찾기</button>
                </div>
            </div>
        `;

        // 인포윈도우 생성
        const infowindow = new kakao.maps.InfoWindow({
            content: content,
            removable: true
        });

        // 인포윈도우 표시
        infowindow.open(map, marker);
    }

    /**
     * 두 지점 간 거리 계산 (km)
     */
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // 지구 반경 (km)
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c; // 킬로미터 단위 거리

        return distance;
    }

    /**
     * 도(degree)를 라디안(radian)으로 변환
     */
    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    /**
     * 카테고리명 반환
     */
    function getCategoryName(categoryCode) {
        const categories = {
            'korean': '한식',
            'chinese': '중식',
            'japanese': '일식',
            'western': '양식',
            'cafe': '카페/디저트',
            'fastfood': '패스트푸드',
            'asian': '아시안',
            'fusion': '퓨전',
            'etc': '기타'
        };

        return categories[categoryCode] || '기타';
    }

    /**
     * 주소에서 위치 추출
     */
    function getLocationFromAddress(address) {
        if (!address) return '';

        // 주소에서 동, 구 추출 (간단한 구현)
        const match = address.match(/([가-힣]+[시군])\s+([가-힣]+[구])\s+([가-힣]+[동])/);
        if (match) {
            return `${match[2]} ${match[3]}`;
        }

        return address.split(' ').slice(0, 3).join(' ');
    }

    /**
     * 알림 표시 함수
     */
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

        // 닫기 버튼 이벤트
        const closeBtn = notification.querySelector('.close-notification');
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
    }

    /**
     * 즐겨찾기에 추가
     */
    window.addToFavorites = function(restaurantId) {
        // 로컬 스토리지에서 즐겨찾기 목록 가져오기
        const favoritesString = localStorage.getItem('favorites');
        let favorites = favoritesString ? JSON.parse(favoritesString) : [];

        // 이미 즐겨찾기에 있는지 확인
        if (favorites.includes(restaurantId)) {
            // 즐겨찾기 제거
            favorites = favorites.filter(id => id !== restaurantId);
            showNotification('즐겨찾기에서 제거되었습니다.');
        } else {
            // 즐겨찾기 추가
            favorites.push(restaurantId);
            showNotification('즐겨찾기에 추가되었습니다.');
        }

        // 로컬 스토리지에 저장
        localStorage.setItem('favorites', JSON.stringify(favorites));

        // 이벤트 버블링 방지
        event.stopPropagation();
    };

    /**
     * 샘플 맛집 데이터 (기본 제공)
     */
    function getSampleRestaurants() {
        return [
            {
                id: 1,
                name: "맛있는 한식당",
                category: "korean",
                address: "인천 미추홀구 용현동 123-45",
                lat: 37.4498,
                lng: 126.6539,
                phone: "032-123-4567",
                website: "https://www.deliciouskorean.com",
                description: "인천 미추홀구에 위치한 맛있는 한식당은 전통 한식을 현대적으로 재해석한 메뉴를 선보이는 맛집입니다. 신선한 제철 재료만을 사용하여 건강하고 맛있는 음식을 제공합니다.",
                rating: 4.5,
                reviewsCount: 28,
                tags: ["맛집", "한식", "깔끔한"],
                facilities: ["parking", "wifi", "card", "group", "nosmoke"],
                mainImage: "https://via.placeholder.com/300x200",
                priceRange: "medium"
            },
            {
                id: 2,
                name: "분위기 좋은 카페",
                category: "cafe",
                address: "인천 미추홀구 용현동 456-78",
                lat: 37.4501,
                lng: 126.6545,
                phone: "032-234-5678",
                website: "https://www.nicecafe.com",
                description: "인천 미추홀구에 위치한 분위기 좋은 카페는 편안한 분위기에서 맛있는 커피와 디저트를 즐길 수 있는 공간입니다.",
                rating: 4.8,
                reviewsCount: 42,
                tags: ["카페", "디저트", "와이파이"],
                facilities: ["wifi", "card", "nosmoke"],
                mainImage: "https://via.placeholder.com/300x200",
                priceRange: "low"
            },
            {
                id: 3,
                name: "스시 오마카세",
                category: "japanese",
                address: "인천 미추홀구 용현동 789-10",
                lat: 37.4495,
                lng: 126.6550,
                phone: "032-345-6789",
                website: "https://www.omakasesushi.com",
                description: "인천 미추홀구에 위치한 스시 오마카세는 신선한 해산물로 만든 정통 일식을 즐길 수 있는 곳입니다.",
                rating: 4.2,
                reviewsCount: 15,
                tags: ["일식", "오마카세", "스시"],
                facilities: ["parking", "card"],
                mainImage: "https://via.placeholder.com/300x200",
                priceRange: "high"
            }
        ];
    }
});

/**
 * 전역 노출 함수
 */
// 샘플 맛집 데이터 전역 노출 (다른 스크립트에서 사용)
window.getSampleRestaurants = function() {
    return [
        {
            id: 1,
            name: "맛있는 한식당",
            category: "korean",
            address: "인천 미추홀구 용현동 123-45",
            lat: 37.4498,
            lng: 126.6539,
            phone: "032-123-4567",
            website: "https://www.deliciouskorean.com",
            description: "인천 미추홀구에 위치한 맛있는 한식당은 전통 한식을 현대적으로 재해석한 메뉴를 선보이는 맛집입니다. 신선한 제철 재료만을 사용하여 건강하고 맛있는 음식을 제공합니다.",
            rating: 4.5,
            reviewsCount: 28,
            tags: ["맛집", "한식", "깔끔한"],
            facilities: ["parking", "wifi", "card", "group", "nosmoke"],
            mainImage: "https://via.placeholder.com/300x200",
            priceRange: "medium"
        },
        {
            id: 2,
            name: "분위기 좋은 카페",
            category: "cafe",
            address: "인천 미추홀구 용현동 456-78",
            lat: 37.4501,
            lng: 126.6545,
            phone: "032-234-5678",
            website: "https://www.nicecafe.com",
            description: "인천 미추홀구에 위치한 분위기 좋은 카페는 편안한 분위기에서 맛있는 커피와 디저트를 즐길 수 있는 공간입니다.",
            rating: 4.8,
            reviewsCount: 42,
            tags: ["카페", "디저트", "와이파이"],
            facilities: ["wifi", "card", "nosmoke"],
            mainImage: "https://via.placeholder.com/300x200",
            priceRange: "low"
        },
        {
            id: 3,
            name: "스시 오마카세",
            category: "japanese",
            address: "인천 미추홀구 용현동 789-10",
            lat: 37.4495,
            lng: 126.6550,
            phone: "032-345-6789",
            website: "https://www.omakasesushi.com",
            description: "인천 미추홀구에 위치한 스시 오마카세는 신선한 해산물로 만든 정통 일식을 즐길 수 있는 곳입니다.",
            rating: 4.2,
            reviewsCount: 15,
            tags: ["일식", "오마카세", "스시"],
            facilities: ["parking", "card"],
            mainImage: "https://via.placeholder.com/300x200",
            priceRange: "high"
        }
    ];
};

// 알림 표시 함수 전역 노출
window.showNotification = function(message, type = 'success') {
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
};