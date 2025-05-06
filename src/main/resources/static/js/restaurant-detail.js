/**
 * 맛집 탐색기 - 맛집 상세 페이지 자바스크립트
 */
document.addEventListener('DOMContentLoaded', function() {
    // 전역 변수
    let map = null;
    let marker = null;
    let restaurantData = null;
    let isFavorite = false;
    let shareModal = null;
    const restaurantId = getRestaurantIdFromUrl();

    // 초기화 함수
    init();

    /**
     * 초기화 함수
     */
    function init() {
        // 식당 정보 가져오기
        fetchRestaurantData(restaurantId);

        // 탭 전환 이벤트 설정
        setupTabs();

        // 갤러리 이미지 슬라이더 설정
        setupGallery();

        // 카카오맵 설정
        setupMap();

        // 메뉴 카테고리 전환 설정
        setupMenuCategories();

        // 즐겨찾기 버튼 설정
        setupFavoriteButton();

        // 공유하기 버튼 설정
        setupShareButton();

        // 리뷰 정렬 설정
        setupReviewSorting();

        // 페이지네이션 설정
        setupPagination();

        // 주소 복사 및 길찾기 버튼 설정
        setupAddressButtons();
    }

    /**
     * URL에서 레스토랑 ID 추출
     */
    function getRestaurantIdFromUrl() {
        // URL에서 ID 파라미터 추출
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || 1; // 기본값 1
    }

    /**
     * 서버에서 식당 정보 가져오기
     */
    async function fetchRestaurantData(id) {
        try {
            // 로딩 표시
            showLoadingOverlay('식당 정보를 불러오는 중입니다...');

            // 실제 구현에서는 API 호출
            // const response = await fetch(`/api/restaurants/${id}`);
            // if (!response.ok) throw new Error('식당 정보를 불러오는데 실패했습니다.');
            // const data = await response.json();

            // 임시 데이터 (실제로는 서버에서 가져온 데이터 사용)
            // 이 부분은 실제 API 구현 시 대체되어야 함
            setTimeout(() => {
                const data = getMockRestaurantData(id);
                restaurantData = data;

                // UI 업데이트
                updateRestaurantUI(data);
                hideLoadingOverlay();
            }, 500);

        } catch (error) {
            console.error('식당 정보 로딩 오류:', error);
            showNotification(error.message || '식당 정보를 불러오는데 실패했습니다.', 'error');
            hideLoadingOverlay();
        }
    }

    /**
     * 식당 정보로 UI 업데이트
     */
    function updateRestaurantUI(data) {
        // 페이지 타이틀 업데이트
        document.title = `${data.name} - 맛집 탐색기`;

        // 상단 헤더 정보 업데이트
        document.getElementById('restaurant-name').textContent = data.name;

        // 카테고리, 위치, 평점 등 메타 정보 업데이트
        const metaElements = document.querySelectorAll('.restaurant-meta span');
        metaElements.forEach(element => {
            if (element.classList.contains('category')) {
                element.innerHTML = `<i class="fas fa-utensils"></i> ${getCategoryName(data.category)}`;
            } else if (element.classList.contains('location')) {
                element.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${getLocationFromAddress(data.address)}`;
            } else if (element.classList.contains('rating')) {
                element.innerHTML = `<i class="fas fa-star"></i> ${data.rating.toFixed(1)}`;
            } else if (element.classList.contains('reviews-count')) {
                element.innerHTML = `<i class="fas fa-comment"></i> 리뷰 ${data.reviewsCount}`;
            }
        });

        // 태그 업데이트
        updateTags(data.tags, data.facilities);

        // 갤러리 이미지 업데이트
        updateGallery(data.mainImage, data.additionalImages);

        // 기본 정보 탭 업데이트
        updateInfoTab(data);

        // 메뉴 탭 업데이트
        updateMenuTab(data.menus);

        // 리뷰 탭 업데이트
        updateReviewsTab(data.reviews, data.rating);

        // 사이드바 지도 업데이트
        updateMap(data.lat, data.lng, data.address);

        // 사이드바 영업시간 업데이트
        updateBusinessHours(data);

        // 사이드바 연락처 업데이트
        updateContact(data.phone, data.website);

        // 주변 맛집 업데이트 (실제로는 API 호출 필요)
        updateNearbyRestaurants(data.lat, data.lng);

        // 즐겨찾기 상태 업데이트
        checkFavoriteStatus(data.id);
    }

    /**
     * 탭 전환 기능 설정
     */
    function setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tabName = this.dataset.tab;

                // 버튼 활성화 상태 변경
                tabButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                // 탭 컨텐츠 표시/숨김
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === tabName) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }

    /**
     * 갤러리 이미지 슬라이더 설정
     */
    function setupGallery() {
        const mainImage = document.querySelector('.main-image img');
        const thumbnails = document.querySelectorAll('.thumbnail-images img');
        const morePhotosBtn = document.querySelector('.more-photos');

        // 썸네일 클릭 시 메인 이미지 변경
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                // 활성화 상태 변경
                thumbnails.forEach(thumb => thumb.classList.remove('active'));
                this.classList.add('active');

                // 메인 이미지 변경
                mainImage.src = this.src.replace('150', '800');
                mainImage.alt = this.alt;
            });
        });

        // 더보기 버튼 클릭 시 갤러리 모달 표시 (생략)
        if (morePhotosBtn) {
            morePhotosBtn.addEventListener('click', function() {
                showNotification('갤러리 기능은 준비 중입니다.');
            });
        }
    }

    /**
     * 카카오맵 설정
     */
    function setupMap() {
        const mapContainer = document.getElementById('restaurant-map');
        if (!mapContainer) return;

        // 카카오맵 초기화 (기본 위치: 인천 미추홀구)
        const defaultPosition = new kakao.maps.LatLng(37.4563, 126.7052);

        const mapOptions = {
            center: defaultPosition,
            level: 3
        };

        map = new kakao.maps.Map(mapContainer, mapOptions);
    }

    /**
     * 지도 업데이트
     */
    function updateMap(lat, lng, address) {
        if (!map) return;

        // 좌표가 없으면 주소로 검색
        if (!lat || !lng) {
            searchAddressToCoordinate(address);
            return;
        }

        // 좌표로 지도 업데이트
        const position = new kakao.maps.LatLng(lat, lng);

        // 기존 마커 제거
        if (marker) {
            marker.setMap(null);
        }

        // 새 마커 생성
        marker = new kakao.maps.Marker({
            position: position,
            map: map
        });

        // 지도 중심 이동
        map.setCenter(position);
    }

    /**
     * 주소로 좌표 검색 (카카오맵 API)
     */
    function searchAddressToCoordinate(address) {
        if (!address) return;

        const geocoder = new kakao.maps.services.Geocoder();

        geocoder.addressSearch(address, function(result, status) {
            if (status === kakao.maps.services.Status.OK) {
                const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

                // 마커 표시
                if (marker) {
                    marker.setMap(null);
                }

                marker = new kakao.maps.Marker({
                    map: map,
                    position: coords
                });

                // 지도 중심 이동
                map.setCenter(coords);
            }
        });
    }

    /**
     * 메뉴 카테고리 전환 설정
     */
    function setupMenuCategories() {
        const categoryButtons = document.querySelectorAll('.menu-category');

        // 카테고리 버튼 클릭 이벤트
        categoryButtons.forEach((button, index) => {
            button.addEventListener('click', function() {
                // 활성화 상태 변경
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                // 해당 카테고리 메뉴 표시 (실제 구현 필요)
                const category = index === 0 ? 'signature' :
                    index === 1 ? 'main' :
                        index === 2 ? 'side' : 'beverage';

                showCategoryMenus(category);
            });
        });
    }

    /**
     * 해당 카테고리의 메뉴 표시
     */
    function showCategoryMenus(category) {
        if (!restaurantData || !restaurantData.menus) return;

        // 메뉴 리스트 요소
        const menuList = document.querySelector('.menu-list');
        if (!menuList) return;

        // 해당 카테고리의 메뉴 필터링
        const categoryMenus = restaurantData.menus.filter(menu => menu.category === category);

        // 메뉴 리스트 업데이트
        menuList.innerHTML = '';

        if (categoryMenus.length === 0) {
            menuList.innerHTML = '<div class="empty-menu">등록된 메뉴가 없습니다.</div>';
            return;
        }

        categoryMenus.forEach(menu => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.innerHTML = `
                <div class="menu-image">
                    <img src="${menu.image || 'https://via.placeholder.com/150x150'}" alt="${menu.name}">
                </div>
                <div class="menu-info">
                    <h4 class="menu-name">${menu.name}</h4>
                    <p class="menu-description">${menu.description || ''}</p>
                    <p class="menu-price">${formatPrice(menu.price)}원</p>
                </div>
            `;
            menuList.appendChild(menuItem);
        });
    }

    /**
     * 즐겨찾기 버튼 설정
     */
    function setupFavoriteButton() {
        const favoriteBtn = document.querySelector('.btn-favorite');
        if (!favoriteBtn) return;

        favoriteBtn.addEventListener('click', function() {
            toggleFavorite();
        });
    }

    /**
     * 즐겨찾기 상태 확인
     */
    function checkFavoriteStatus(restaurantId) {
        // 실제 구현에서는 서버 API 호출 또는 로컬 스토리지 확인
        const favoritesString = localStorage.getItem('favorites');
        const favorites = favoritesString ? JSON.parse(favoritesString) : [];

        isFavorite = favorites.includes(parseInt(restaurantId));
        updateFavoriteButton();
    }

    /**
     * 즐겨찾기 토글
     */
    function toggleFavorite() {
        if (!restaurantData) return;

        // 즐겨찾기 상태 토글
        isFavorite = !isFavorite;

        // 로컬 스토리지에 저장 (실제로는 서버 API 호출)
        const favoritesString = localStorage.getItem('favorites');
        let favorites = favoritesString ? JSON.parse(favoritesString) : [];

        if (isFavorite) {
            // 추가
            if (!favorites.includes(restaurantData.id)) {
                favorites.push(restaurantData.id);
            }
            showNotification('즐겨찾기에 추가되었습니다.');
        } else {
            // 제거
            favorites = favorites.filter(id => id !== restaurantData.id);
            showNotification('즐겨찾기에서 제거되었습니다.');
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoriteButton();
    }

    /**
     * 즐겨찾기 버튼 업데이트
     */
    function updateFavoriteButton() {
        const favoriteBtn = document.querySelector('.btn-favorite');
        if (!favoriteBtn) return;

        if (isFavorite) {
            favoriteBtn.innerHTML = '<i class="fas fa-bookmark"></i> 즐겨찾기 취소';
            favoriteBtn.classList.add('active');
        } else {
            favoriteBtn.innerHTML = '<i class="far fa-bookmark"></i> 즐겨찾기';
            favoriteBtn.classList.remove('active');
        }
    }

    /**
     * 공유하기 버튼 설정
     */
    function setupShareButton() {
        const shareBtn = document.querySelector('.btn-share');
        shareModal = document.getElementById('shareModal');
        const modalClose = shareModal?.querySelector('.modal-close');

        // 공유 버튼 클릭 시 모달 표시
        if (shareBtn) {
            shareBtn.addEventListener('click', function() {
                if (shareModal) {
                    shareModal.style.display = 'flex';
                }
            });
        }

        // 모달 닫기 버튼
        if (modalClose) {
            modalClose.addEventListener('click', function() {
                shareModal.style.display = 'none';
            });
        }

        // 모달 바깥 클릭 시 닫기
        if (shareModal) {
            shareModal.addEventListener('click', function(e) {
                if (e.target === shareModal) {
                    shareModal.style.display = 'none';
                }
            });
        }

        // 공유 옵션 버튼 설정
        setupShareOptions();
    }

    /**
     * 공유 옵션 버튼 설정
     */
    function setupShareOptions() {
        const shareBtns = document.querySelectorAll('.share-btn');

        shareBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.classList.contains('kakao')) {
                    shareKakao();
                } else if (this.classList.contains('facebook')) {
                    shareFacebook();
                } else if (this.classList.contains('twitter')) {
                    shareTwitter();
                } else if (this.classList.contains('link')) {
                    copyLink();
                }
            });
        });
    }

    /**
     * 카카오톡 공유
     */
    function shareKakao() {
        showNotification('카카오톡 공유 기능은 준비 중입니다.');
        shareModal.style.display = 'none';
    }

    /**
     * 페이스북 공유
     */
    function shareFacebook() {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        shareModal.style.display = 'none';
    }

    /**
     * 트위터 공유
     */
    function shareTwitter() {
        const text = document.getElementById('restaurant-name')?.textContent || '맛집 탐색기';
        const url = encodeURIComponent(window.location.href);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
        shareModal.style.display = 'none';
    }

    /**
     * URL 복사
     */
    function copyLink() {
        const url = window.location.href;

        // 클립보드 복사
        navigator.clipboard.writeText(url)
            .then(() => {
                showNotification('URL이 클립보드에 복사되었습니다.');
            })
            .catch(err => {
                console.error('URL 복사 실패:', err);
                showNotification('URL 복사에 실패했습니다.', 'error');
            });

        shareModal.style.display = 'none';
    }

    /**
     * 리뷰 정렬 설정
     */
    function setupReviewSorting() {
        const sortSelect = document.getElementById('review-sort');
        if (!sortSelect) return;

        sortSelect.addEventListener('change', function() {
            sortReviews(this.value);
        });
    }

    /**
     * 리뷰 정렬
     */
    function sortReviews(sortBy) {
        if (!restaurantData || !restaurantData.reviews) return;

        let sortedReviews = [...restaurantData.reviews];

        switch (sortBy) {
            case 'recent':
                // 최신순 정렬
                sortedReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'rating-high':
                // 평점 높은순 정렬
                sortedReviews.sort((a, b) => b.rating - a.rating);
                break;
            case 'rating-low':
                // 평점 낮은순 정렬
                sortedReviews.sort((a, b) => a.rating - b.rating);
                break;
        }

        // 리뷰 목록 업데이트
        updateReviewsList(sortedReviews);
    }

    /**
     * 페이지네이션 설정
     */
    function setupPagination() {
        const prevBtn = document.querySelector('.reviews-pagination .prev');
        const nextBtn = document.querySelector('.reviews-pagination .next');
        const pageNumbers = document.querySelectorAll('.page-number');

        // 페이지 번호 클릭 이벤트
        pageNumbers.forEach(button => {
            button.addEventListener('click', function() {
                // 페이지 번호 활성화
                pageNumbers.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                // 해당 페이지 리뷰 표시 (실제 구현 필요)
                const page = parseInt(this.textContent);
                loadReviewsPage(page);
            });
        });

        // 이전 페이지 버튼
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                const activePage = document.querySelector('.page-number.active');
                const prevPage = activePage.previousElementSibling;

                if (prevPage && prevPage.classList.contains('page-number')) {
                    prevPage.click();
                }
            });
        }

        // 다음 페이지 버튼
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                const activePage = document.querySelector('.page-number.active');
                const nextPage = activePage.nextElementSibling;

                if (nextPage && nextPage.classList.contains('page-number')) {
                    nextPage.click();
                }
            });
        }
    }

    /**
     * 리뷰 페이지 로드
     */
    function loadReviewsPage(page) {
        if (!restaurantData || !restaurantData.reviews) return;

        // 페이지당 리뷰 수
        const perPage = 5;
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;

        // 해당 페이지의 리뷰
        const pagedReviews = restaurantData.reviews.slice(startIndex, endIndex);

        // 리뷰 목록 업데이트
        updateReviewsList(pagedReviews);

        // 스크롤 위치 조정
        const reviewsTab = document.getElementById('reviews');
        if (reviewsTab) {
            reviewsTab.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * 주소 관련 버튼 설정
     */
    function setupAddressButtons() {
        const copyAddressBtn = document.querySelector('.btn-copy-address');
        const findWayBtn = document.querySelector('.btn-find-way');

        // 주소 복사 버튼
        if (copyAddressBtn) {
            copyAddressBtn.addEventListener('click', function() {
                copyAddress();
            });
        }

        // 길찾기 버튼
        if (findWayBtn) {
            findWayBtn.addEventListener('click', function() {
                findWay();
            });
        }
    }

    /**
     * 주소 복사
     */
    function copyAddress() {
        if (!restaurantData) return;

        const address = restaurantData.address;

        // 클립보드 복사
        navigator.clipboard.writeText(address)
            .then(() => {
                showNotification('주소가 클립보드에 복사되었습니다.');
            })
            .catch(err => {
                console.error('주소 복사 실패:', err);
                showNotification('주소 복사에 실패했습니다.', 'error');
            });
    }

    /**
     * 길찾기
     */
    function findWay() {
        if (!restaurantData) return;

        // 카카오맵 길찾기 URL 생성
        const address = encodeURIComponent(restaurantData.address);
        const name = encodeURIComponent(restaurantData.name);

        // 카카오맵 길찾기 페이지 열기
        window.open(`https://map.kakao.com/link/to/${name},${restaurantData.lat},${restaurantData.lng}`, '_blank');
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
     * 주소에서 위치(동, 구) 추출
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
     * 태그 업데이트
     */
    function updateTags(tags, facilities) {
        const tagsContainer = document.querySelector('.restaurant-tags');
        if (!tagsContainer) return;

        tagsContainer.innerHTML = '';

        // 태그 추가
        if (tags && tags.length > 0) {
            tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.textContent = tag;
                tagsContainer.appendChild(tagElement);
            });
        }

        // 편의시설 태그 추가
        if (facilities && facilities.length > 0) {
            const facilityNames = {
                'parking': '주차가능',
                'wifi': '와이파이',
                'card': '카드결제',
                'kids': '유아의자',
                'group': '단체석',
                'nosmoke': '금연'
            };

            facilities.forEach(facility => {
                if (facilityNames[facility]) {
                    const tagElement = document.createElement('span');
                    tagElement.textContent = facilityNames[facility];
                    tagsContainer.appendChild(tagElement);
                }
            });
        }
    }

    /**
     * 갤러리 이미지 업데이트
     */
    function updateGallery(mainImage, additionalImages) {
        const mainImageElement = document.querySelector('.main-image img');
        const thumbnailContainer = document.querySelector('.thumbnail-images');

        if (!mainImageElement || !thumbnailContainer) return;

        // 메인 이미지 업데이트
        if (mainImage) {
            mainImageElement.src = mainImage;
            mainImageElement.alt = restaurantData.name + ' 대표 이미지';
        }

        // 썸네일 이미지 업데이트
        if (additionalImages && additionalImages.length > 0) {
            // 더보기 버튼 제외한 모든 이미지 제거
            const morePhotosBtn = thumbnailContainer.querySelector('.more-photos');
            thumbnailContainer.innerHTML = '';

            // 메인 이미지 먼저 추가
            const mainThumbnail = document.createElement('img');
            mainThumbnail.src = mainImage;
            mainThumbnail.alt = restaurantData.name + ' 대표 이미지';
            mainThumbnail.classList.add('active');
            thumbnailContainer.appendChild(mainThumbnail);

            // 썸네일에 클릭 이벤트 연결
            mainThumbnail.addEventListener('click', function() {
                updateMainImage(this);
            });

            // 추가 이미지 추가
            additionalImages.forEach((image, index) => {
                const thumbnail = document.createElement('img');
                thumbnail.src = image;
                thumbnail.alt = `${restaurantData.name} ${index + 1}`;
                thumbnailContainer.appendChild(thumbnail);

                // 썸네일에 클릭 이벤트 연결
                thumbnail.addEventListener('click', function() {
                    updateMainImage(this);
                });
            });

            // 더보기 버튼 다시 추가
            if (morePhotosBtn) {
                thumbnailContainer.appendChild(morePhotosBtn);
            }
        }
    }

    /**
     * 메인 이미지 업데이트
     */
    function updateMainImage(thumbnail) {
        const mainImage = document.querySelector('.main-image img');
        const thumbnails = document.querySelectorAll('.thumbnail-images img');

        // 썸네일 활성화 상태 변경
        thumbnails.forEach(thumb => thumb.classList.remove('active'));
        thumbnail.classList.add('active');

        // 메인 이미지 변경
        mainImage.src = thumbnail.src;
        mainImage.alt = thumbnail.alt;
    }

    /**
     * 정보 탭 업데이트
     */
    function updateInfoTab(data) {
        // 영업 정보 업데이트
        const infoList = document.querySelector('.info-list');
        if (infoList) {
            const items = infoList.querySelectorAll('li');
            items.forEach(item => {
                const label = item.querySelector('.info-label');
                const value = item.querySelector('.info-value');

                if (label.textContent === '영업시간') {
                    // 영업시간 표시 (평일 기준)
                    const mondayOpen = data.mondayOpen;
                    if (mondayOpen) {
                        value.textContent = `${data.mondayStart} - ${data.mondayEnd}`;
                        if (data.mondayLastOrder) {
                            value.textContent += ` (라스트오더 ${data.mondayLastOrder})`;
                        }
                    } else {
                        value.textContent = '정보가 없습니다.';
                    }
                } else if (label.textContent === '휴무일') {
                    // 휴무일 표시
                    const closedDays = [];
                    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                    const dayNames = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];

                    days.forEach((day, index) => {
                        if (!data[`${day}Open`]) {
                            closedDays.push(dayNames[index]);
                        }
                    });

                    value.textContent = closedDays.length > 0 ? closedDays.join(', ') : '연중무휴';
                } else if (label.textContent === '전화번호') {
                    value.textContent = data.phone || '정보가 없습니다.';
                } else if (label.textContent === '주소') {
                    value.textContent = data.address || '정보가 없습니다.';
                }
            });
        }

        // 편의 시설 업데이트
        const facilityIcons = document.querySelector('.facility-icons');
        if (facilityIcons && data.facilities) {
            // 모든 시설 항목 숨기기
            const facilityItems = facilityIcons.querySelectorAll('.facility-item');
            facilityItems.forEach(item => {
                item.style.display = 'none';
            });

            // 해당하는 시설만 표시
            data.facilities.forEach(facility => {
                const facilityItem = facilityIcons.querySelector(`.facility-item i.fa-${getFacilityIcon(facility)}`);
                if (facilityItem) {
                    facilityItem.parentElement.style.display = 'flex';
                }
            });
        }

        // 소개 텍스트 업데이트
        const description = document.querySelector('.restaurant-description');
        if (description) {
            description.textContent = data.description || '등록된 소개글이 없습니다.';
        }
    }

    /**
     * 편의시설 아이콘 클래스 반환
     */
    function getFacilityIcon(facility) {
        const icons = {
            'parking': 'parking',
            'wifi': 'wifi',
            'card': 'credit-card',
            'kids': 'baby',
            'group': 'user-friends',
            'nosmoke': 'smoking-ban'
        };

        return icons[facility] || 'question';
    }

    /**
     * 메뉴 탭 업데이트
     */
    function updateMenuTab(menus) {
        if (!menus || menus.length === 0) return;

        // 메뉴 카테고리 버튼 업데이트
        updateMenuCategories(menus);

        // 첫번째 카테고리(대표 메뉴) 표시
        showCategoryMenus('signature');
    }

    /**
     * 메뉴 카테고리 버튼 업데이트
     */
    function updateMenuCategories(menus) {
        // 각 카테고리별 메뉴 개수 확인
        const categories = {
            'signature': 0,
            'main': 0,
            'side': 0,
            'beverage': 0
        };

        menus.forEach(menu => {
            if (categories.hasOwnProperty(menu.category)) {
                categories[menu.category]++;
            }
        });

        // 카테고리 버튼 업데이트
        const categoryButtons = document.querySelectorAll('.menu-category');
        categoryButtons.forEach((button, index) => {
            const category = index === 0 ? 'signature' :
                index === 1 ? 'main' :
                    index === 2 ? 'side' : 'beverage';

            // 해당 카테고리의 메뉴가 있으면 버튼 활성화, 없으면 비활성화
            if (categories[category] > 0) {
                button.disabled = false;
                button.style.opacity = '1';
            } else {
                button.disabled = true;
                button.style.opacity = '0.5';
            }
        });
    }

    /**
     * 리뷰 탭 업데이트
     */
    function updateReviewsTab(reviews, rating) {
        if (!reviews) return;

        // 평균 평점 업데이트
        updateAverageRating(rating, reviews.length);

        // 평점 분포 업데이트
        updateRatingDistribution(reviews);

        // 리뷰 목록 업데이트
        updateReviewsList(reviews);
    }

    /**
     * 평균 평점 업데이트
     */
    function updateAverageRating(rating, count) {
        const ratingNumber = document.querySelector('.rating-number');
        const ratingStars = document.querySelector('.rating-stars');
        const ratingCount = document.querySelector('.rating-count');

        if (ratingNumber) {
            ratingNumber.textContent = rating.toFixed(1);
        }

        if (ratingStars) {
            ratingStars.innerHTML = generateStars(rating);
        }

        if (ratingCount) {
            ratingCount.textContent = `${count}개 리뷰`;
        }
    }

    /**
     * 평점에 해당하는 별점 HTML 생성
     */
    function generateStars(rating) {
        let starsHtml = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating - fullStars >= 0.5;

        // 꽉 찬 별
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<i class="fas fa-star"></i>';
        }

        // 반 별
        if (hasHalfStar) {
            starsHtml += '<i class="fas fa-star-half-alt"></i>';
        }

        // 빈 별
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<i class="far fa-star"></i>';
        }

        return starsHtml;
    }

    /**
     * 평점 분포 업데이트
     */
    function updateRatingDistribution(reviews) {
        if (!reviews || reviews.length === 0) return;

        // 각 평점별 개수 계산
        const distribution = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
        };

        reviews.forEach(review => {
            const rating = Math.round(review.rating);
            if (distribution.hasOwnProperty(rating)) {
                distribution[rating]++;
            }
        });

        // 분포 비율 계산 및 UI 업데이트
        const total = reviews.length;
        const ratingBars = document.querySelectorAll('.rating-bar');

        ratingBars.forEach((bar, index) => {
            const rating = 5 - index; // 5점부터 1점까지
            const count = distribution[rating];
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

            // 프로그레스 바 업데이트
            const progress = bar.querySelector('.progress');
            if (progress) {
                progress.style.width = `${percentage}%`;
            }

            // 퍼센트 표시 업데이트
            const percentText = bar.querySelector('.rating-percentage');
            if (percentText) {
                percentText.textContent = `${percentage}%`;
            }
        });
    }

    /**
     * 리뷰 목록 업데이트
     */
    function updateReviewsList(reviews) {
        const reviewsList = document.querySelector('.reviews-list');
        if (!reviewsList) return;

        reviewsList.innerHTML = '';

        if (!reviews || reviews.length === 0) {
            reviewsList.innerHTML = '<div class="empty-reviews">아직 등록된 리뷰가 없습니다.</div>';
            return;
        }

        reviews.forEach(review => {
            const reviewElement = createReviewElement(review);
            reviewsList.appendChild(reviewElement);
        });
    }

    /**
     * 리뷰 항목 생성
     */
    function createReviewElement(review) {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';

        // 리뷰 이미지 HTML 생성
        let imagesHtml = '';
        if (review.images && review.images.length > 0) {
            imagesHtml = '<div class="review-images">';
            review.images.forEach(image => {
                imagesHtml += `<img src="${image}" alt="리뷰 이미지">`;
            });
            imagesHtml += '</div>';
        }

        // 날짜 형식 변환
        const date = new Date(review.date);
        const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} 방문`;

        reviewItem.innerHTML = `
            <div class="review-header">
                <div class="reviewer-info">
                    <img src="${review.reviewer.image || 'https://via.placeholder.com/40'}" alt="프로필 이미지" class="reviewer-img">
                    <div class="reviewer-details">
                        <div class="reviewer-name">${review.reviewer.name}</div>
                        <div class="review-date">${formattedDate}</div>
                    </div>
                </div>
                <div class="review-rating">
                    <div class="stars">
                        ${generateStars(review.rating)}
                    </div>
                    <span>${review.rating.toFixed(1)}</span>
                </div>
            </div>
            <div class="review-content">
                <p>${review.content}</p>
            </div>
            ${imagesHtml}
            <div class="review-footer">
                <div class="review-reactions">
                    <button class="btn-like" data-id="${review.id}">
                        <i class="far fa-thumbs-up"></i>
                        <span>${review.likes || 0}</span>
                    </button>
                    <button class="btn-comment" data-id="${review.id}">
                        <i class="far fa-comment"></i>
                        <span>${review.comments || 0}</span>
                    </button>
                </div>
            </div>
        `;

        // 좋아요 버튼 이벤트
        const likeBtn = reviewItem.querySelector('.btn-like');
        likeBtn.addEventListener('click', function() {
            toggleReviewLike(this);
        });

        // 댓글 버튼 이벤트
        const commentBtn = reviewItem.querySelector('.btn-comment');
        commentBtn.addEventListener('click', function() {
            showReviewComments(this.dataset.id);
        });

        return reviewItem;
    }

    /**
     * 리뷰 좋아요 토글
     */
    function toggleReviewLike(button) {
        const icon = button.querySelector('i');
        const count = button.querySelector('span');

        if (icon.classList.contains('far')) {
            // 좋아요 추가
            icon.classList.remove('far');
            icon.classList.add('fas');
            count.textContent = (parseInt(count.textContent) + 1).toString();
        } else {
            // 좋아요 취소
            icon.classList.remove('fas');
            icon.classList.add('far');
            count.textContent = (parseInt(count.textContent) - 1).toString();
        }
    }

    /**
     * 리뷰 댓글 표시
     */
    function showReviewComments(reviewId) {
        // 댓글 기능은 실제 구현 필요
        showNotification('댓글 기능은 준비 중입니다.');
    }

    /**
     * 영업시간 업데이트
     */
    function updateBusinessHours(data) {
        const hoursList = document.querySelector('.hours-list');
        if (!hoursList) return;

        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const koreanDays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

        // 현재 요일 계산
        const today = new Date().getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일

        // 영업시간 목록 업데이트
        const hoursItems = hoursList.querySelectorAll('li');

        hoursItems.forEach((item, index) => {
            const day = item.querySelector('.day');
            const hours = item.querySelector('.hours');

            // 첫 번째 항목은 '오늘'
            if (index === 0) {
                const todayData = data[days[today].toLowerCase()];

                if (todayData && data[`${days[today]}Open`]) {
                    hours.textContent = `${data[`${days[today]}Start`]} - ${data[`${days[today]}End`]}`;
                    hours.classList.remove('closed');
                } else {
                    hours.textContent = '휴무일';
                    hours.classList.add('closed');
                }

                // 현재 요일 표시
                day.textContent = `오늘 (${koreanDays[today]})`;
            } else {
                // 요일별 영업시간
                const dayIndex = index - 1; // 첫 번째 항목이 '오늘'이므로 인덱스 조정
                const dayName = koreanDays[dayIndex];
                const dayCode = days[dayIndex].toLowerCase();

                day.textContent = dayName;

                if (data[`${dayCode}Open`]) {
                    hours.textContent = `${data[`${dayCode}Start`]} - ${data[`${dayCode}End`]}`;
                    hours.classList.remove('closed');
                } else {
                    hours.textContent = '휴무일';
                    hours.classList.add('closed');
                }

                // 오늘 표시
                if (dayIndex === today) {
                    item.classList.add('current-day');
                } else {
                    item.classList.remove('current-day');
                }
            }
        });
    }

    /**
     * 연락처 정보 업데이트
     */
    function updateContact(phone, website) {
        const contactSection = document.querySelector('.restaurant-contact');
        if (!contactSection) return;

        const phoneElement = contactSection.querySelector('p:first-child');
        const websiteElement = contactSection.querySelector('p:last-child');

        // 전화번호 업데이트
        if (phoneElement && phone) {
            phoneElement.innerHTML = `<i class="fas fa-phone"></i> ${phone}`;
        }

        // 웹사이트 업데이트
        if (websiteElement && website) {
            websiteElement.innerHTML = `<i class="fas fa-globe"></i> <a href="${website}" class="website-link" target="_blank">${formatUrl(website)}</a>`;
        } else if (websiteElement) {
            websiteElement.style.display = 'none';
        }
    }

    /**
     * URL 형식 가공
     */
    function formatUrl(url) {
        // URL에서 프로토콜 제거
        return url.replace(/^https?:\/\//, '');
    }

    /**
     * 주변 맛집 업데이트
     */
    function updateNearbyRestaurants(lat, lng) {
        // 실제 구현에서는 API 호출
        // 임시 데이터 사용
        const nearbyItems = document.querySelectorAll('.nearby-item');

        // 임시 데이터 (3개)
        const nearbyData = [
            {
                id: 2,
                name: '분위기 좋은 카페',
                category: '카페',
                distance: 180,
                rating: 4.8,
                image: 'https://via.placeholder.com/60x60'
            },
            {
                id: 3,
                name: '스시 오마카세',
                category: '일식',
                distance: 210,
                rating: 4.2,
                image: 'https://via.placeholder.com/60x60'
            },
            {
                id: 4,
                name: '중국집 원조',
                category: '중식',
                distance: 250,
                rating: 4.0,
                image: 'https://via.placeholder.com/60x60'
            }
        ];

        // 주변 맛집 아이템 업데이트
        nearbyItems.forEach((item, index) => {
            if (index < nearbyData.length) {
                const data = nearbyData[index];

                const image = item.querySelector('img');
                const name = item.querySelector('h4');
                const info = item.querySelector('p');
                const rating = item.querySelector('.nearby-rating');

                image.src = data.image;
                image.alt = data.name;
                name.textContent = data.name;
                info.textContent = `${data.category} • ${data.distance}m`;
                rating.innerHTML = `<i class="fas fa-star"></i> ${data.rating.toFixed(1)}`;

                // 클릭 이벤트 설정
                item.style.cursor = 'pointer';
                item.addEventListener('click', function() {
                    window.location.href = `/restaurant?id=${data.id}`;
                });
            }
        });
    }

    /**
     * 가격 형식 변환 (1000 -> 1,000)
     */
    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
     * 로딩 오버레이 표시
     */
    function showLoadingOverlay(message = '처리 중입니다...') {
        // 기존 오버레이 제거
        hideLoadingOverlay();

        // 새 오버레이 생성
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner"></div>
            <p>${message}</p>
        `;

        // 오버레이 스타일
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '2000';
        overlay.style.color = 'white';

        // 스피너 스타일
        const spinner = overlay.querySelector('.loading-spinner');
        spinner.style.width = '50px';
        spinner.style.height = '50px';
        spinner.style.border = '5px solid #f3f3f3';
        spinner.style.borderTop = '5px solid #ff6b6b';
        spinner.style.borderRadius = '50%';
        spinner.style.marginBottom = '20px';
        spinner.style.animation = 'spin 1s linear infinite';

        // 스피너 애니메이션 추가
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        // 오버레이 추가
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden'; // 스크롤 방지
    }

    /**
     * 로딩 오버레이 제거
     */
    function hideLoadingOverlay() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
            document.body.style.overflow = ''; // 스크롤 복원
        }
    }

    /**
     * 테스트용 가상 데이터 생성
     */
    function getMockRestaurantData(id) {
        return {
            id: parseInt(id),
            name: '맛있는 한식당',
            category: 'korean',
            address: '인천 미추홀구 용현동 123-45',
            lat: 37.4563,
            lng: 126.7052,
            phone: '032-123-4567',
            website: 'https://www.deliciouskorean.com',
            description: '인천 미추홀구에 위치한 맛있는 한식당은 전통 한식을 현대적으로 재해석한 메뉴를 선보이는 맛집입니다. 신선한 제철 재료만을 사용하여 건강하고 맛있는 음식을 제공합니다. 특히 김치찌개와 된장찌개는 이 식당의 시그니처 메뉴로, 깊은 맛을 자랑합니다. 가족 모임이나 소규모 단체 모임에도 적합한 공간을 갖추고 있습니다.',
            rating: 4.5,
            reviewsCount: 28,
            tags: ['맛집', '한식', '깔끔한'],
            facilities: ['parking', 'wifi', 'card', 'kids', 'group', 'nosmoke'],
            mainImage: 'https://via.placeholder.com/800x500',
            additionalImages: [
                'https://via.placeholder.com/200x150',
                'https://via.placeholder.com/200x150',
                'https://via.placeholder.com/200x150',
                'https://via.placeholder.com/200x150'
            ],
            mondayOpen: false,
            mondayStart: '',
            mondayEnd: '',
            mondayLastOrder: '',
            tuesdayOpen: true,
            tuesdayStart: '11:00',
            tuesdayEnd: '21:30',
            tuesdayLastOrder: '21:00',
            wednesdayOpen: true,
            wednesdayStart: '11:00',
            wednesdayEnd: '21:30',
            wednesdayLastOrder: '21:00',
            thursdayOpen: true,
            thursdayStart: '11:00',
            thursdayEnd: '21:30',
            thursdayLastOrder: '21:00',
            fridayOpen: true,
            fridayStart: '11:00',
            fridayEnd: '22:00',
            fridayLastOrder: '21:30',
            saturdayOpen: true,
            saturdayStart: '11:00',
            saturdayEnd: '22:00',
            saturdayLastOrder: '21:30',
            sundayOpen: true,
            sundayStart: '11:00',
            sundayEnd: '21:30',
            sundayLastOrder: '21:00',
            menus: [
                {
                    id: 1,
                    category: 'signature',
                    name: '김치찌개',
                    description: '묵은지와 국내산 삼겹살을 넣어 깊은 맛을 낸 시그니처 메뉴',
                    price: 9000,
                    image: 'https://via.placeholder.com/150x150'
                },
                {
                    id: 2,
                    category: 'signature',
                    name: '된장찌개',
                    description: '100% 국내산 청국장으로 맛을 낸 건강한 된장찌개',
                    price: 8500,
                    image: 'https://via.placeholder.com/150x150'
                },
                {
                    id: 3,
                    category: 'signature',
                    name: '제육볶음',
                    description: '매콤한 양념에 볶아낸 두툼한 삼겹살 제육볶음',
                    price: 12000,
                    image: 'https://via.placeholder.com/150x150'
                },
                {
                    id: 4,
                    category: 'signature',
                    name: '불고기',
                    description: '특제 양념에 24시간 숙성시킨 부드러운 소고기 불고기',
                    price: 15000,
                    image: 'https://via.placeholder.com/150x150'
                },
                {
                    id: 5,
                    category: 'main',
                    name: '비빔밥',
                    description: '신선한 야채와 고소한 참기름을 넣은 건강한 비빔밥',
                    price: 10000,
                    image: 'https://via.placeholder.com/150x150'
                },
                {
                    id: 6,
                    category: 'side',
                    name: '계란말이',
                    description: '부드럽고 촉촉한 특제 계란말이',
                    price: 6000,
                    image: 'https://via.placeholder.com/150x150'
                },
                {
                    id: 7,
                    category: 'beverage',
                    name: '참이슬',
                    description: '국산 소주',
                    price: 5000,
                    image: 'https://via.placeholder.com/150x150'
                }
            ],
            reviews: [
                {
                    id: 1,
                    reviewer: {
                        id: 101,
                        name: '맛집탐험가',
                        image: 'https://via.placeholder.com/40'
                    },
                    rating: 5.0,
                    date: '2025-03-20',
                    content: '김치찌개가 정말 맛있었어요! 묵은지를 넣어서 그런지 깊은 맛이 났습니다. 반찬도 푸짐하게 나와서 만족스러웠습니다. 직원분들도 친절하셔서 좋았어요. 다음에도 꼭 방문하고 싶은 맛집입니다.',
                    images: [
                        'https://via.placeholder.com/150',
                        'https://via.placeholder.com/150'
                    ],
                    likes: 12,
                    comments: 3
                },
                {
                    id: 2,
                    reviewer: {
                        id: 102,
                        name: '푸드리뷰어',
                        image: 'https://via.placeholder.com/40'
                    },
                    rating: 4.0,
                    date: '2025-03-18',
                    content: '음식은 맛있었지만 조금 기다리는 시간이 길었어요. 주말이라 그런지 사람이 많았습니다. 하지만 맛은 정말 좋았어요! 특히 제육볶음이 매콤하니 맛있었습니다.',
                    images: [],
                    likes: 5,
                    comments: 1
                },
                {
                    id: 3,
                    reviewer: {
                        id: 103,
                        name: '맛있는인천',
                        image: 'https://via.placeholder.com/40'
                    },
                    rating: 3.5,
                    date: '2025-03-15',
                    content: '된장찌개를 주문했는데 평범한 맛이었습니다. 기대했던 것보다는 조금 아쉬웠어요. 반찬은 맛있었고 양도 많아서 좋았습니다. 다음에는 김치찌개를 먹어보고 싶어요.',
                    images: [],
                    likes: 3,
                    comments: 0
                }
            ]
        };
    }
});