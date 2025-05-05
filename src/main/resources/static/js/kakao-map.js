// 카카오맵 관련 기능
document.addEventListener('DOMContentLoaded', function() {
    // 전역 변수 선언
    let map;                 // 카카오맵 객체
    let markers = [];        // 지도에 표시된 마커들
    let currentInfowindow;   // 현재 열린 정보창
    const DEFAULT_LAT = 37.502; // 기본 위도 (강남역 부근)
    const DEFAULT_LNG = 127.038; // 기본 경도 (강남역 부근)

    // 지도 초기화
    initKakaoMap();

    // 카카오맵 초기화 함수
    function initKakaoMap() {
        // 지도를 표시할 div
        const mapContainer = document.getElementById('kakao-map');
        if (!mapContainer) return;

        // 지도 옵션 설정
        const mapOption = {
            center: new kakao.maps.LatLng(DEFAULT_LAT, DEFAULT_LNG), // 지도의 중심좌표 (기본값: 강남역)
            level: 4 // 지도의 확대 레벨
        };

        // 지도 생성
        map = new kakao.maps.Map(mapContainer, mapOption);

        // 지도 컨트롤 추가
        addMapControls();

        // 초기 맛집 데이터로 마커 표시
        const initialRestaurants = window.getSampleRestaurants ? window.getSampleRestaurants() : [];
        addMarkersToMap(initialRestaurants);
    }

    // 지도 컨트롤 추가 함수
    function addMapControls() {
        // 지도 확대/축소 컨트롤 추가
        const zoomControl = new kakao.maps.ZoomControl();
        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

        // 지도 타입 컨트롤 추가
        const mapTypeControl = new kakao.maps.MapTypeControl();
        map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
    }

    // 지도 중심 위치 변경 함수
    function setMapCenter(lat, lng) {
        if (!map) return;
        map.setCenter(new kakao.maps.LatLng(lat, lng));
    }

    // 현재 위치로 지도 업데이트 함수
    function updateKakaoMap(lat, lng) {
        if (!lat || !lng) {
            lat = DEFAULT_LAT;
            lng = DEFAULT_LNG;
        }

        // 지도 중심 변경
        setMapCenter(lat, lng);

        // 현재 위치 마커 추가
        const position = new kakao.maps.LatLng(lat, lng);
        const marker = new kakao.maps.Marker({
            position: position,
            map: map,
            title: '현재 위치',
            zIndex: 10
        });

        // 사용자 위치 강조 표시
        const circle = new kakao.maps.Circle({
            center: position,
            radius: 100, // 반경 100m
            strokeWeight: 2,
            strokeColor: '#75B8FA',
            strokeOpacity: 1,
            strokeStyle: 'solid',
            fillColor: '#CFE7FF',
            fillOpacity: 0.5
        });
        circle.setMap(map);

        // 500m 반경 서클
        const radiusCircle = new kakao.maps.Circle({
            center: position,
            radius: 500, // 반경 500m
            strokeWeight: 1,
            strokeColor: '#75B8FA',
            strokeOpacity: 0.5,
            strokeStyle: 'dashed',
            fillColor: '#CFE7FF',
            fillOpacity: 0.1
        });
        radiusCircle.setMap(map);

        // 3초 후 마커와 서클 제거
        setTimeout(() => {
            marker.setMap(null);
            circle.setMap(null);
            // radiusCircle은 유지
        }, 3000);
    }

    // 식당 데이터로 지도 업데이트 함수
    function updateKakaoMapWithRestaurants(lat, lng, restaurants) {
        // 기존 마커 제거
        removeAllMarkers();

        // 식당 마커 추가
        addMarkersToMap(restaurants);

        // 지도 중심 설정
        if (lat && lng) {
            // 지정된 위치가 있으면 해당 위치로 중심 설정
            setMapCenter(lat, lng);
        } else if (restaurants && restaurants.length > 0) {
            // 첫 번째 식당 위치로 중심 설정
            setMapCenter(restaurants[0].lat, restaurants[0].lng);
        } else {
            // 기본 위치로 설정
            setMapCenter(DEFAULT_LAT, DEFAULT_LNG);
        }

        // 지도 레벨 조정 (모든 마커가 보이도록)
        if (restaurants && restaurants.length > 1) {
            adjustMapBounds(restaurants);
        }
    }

    // 마커 추가 함수
    function addMarkersToMap(restaurants) {
        if (!restaurants || !Array.isArray(restaurants) || restaurants.length === 0) return;

        restaurants.forEach(restaurant => {
            // 위치 정보가 없으면 기본값 사용
            const lat = restaurant.lat || DEFAULT_LAT;
            const lng = restaurant.lng || DEFAULT_LNG;
            const position = new kakao.maps.LatLng(lat, lng);

            // 마커 생성
            const marker = new kakao.maps.Marker({
                position: position,
                map: map,
                title: restaurant.name,
                zIndex: 1
            });

            // 마커에 식당 ID 저장
            marker.restaurantId = restaurant.id;

            // 클릭 이벤트 추가
            kakao.maps.event.addListener(marker, 'click', function() {
                showInfoWindow(marker, restaurant);
            });

            // 마커 배열에 추가
            markers.push(marker);
        });
    }

    // 새 마커 추가 함수 (더보기 기능 등에서 사용)
    function addMarkersToKakaoMap(restaurants) {
        addMarkersToMap(restaurants);
    }

    // 모든 마커 제거 함수
    function removeAllMarkers() {
        markers.forEach(marker => {
            marker.setMap(null);
        });
        markers = [];

        // 열린 정보창 닫기
        if (currentInfowindow) {
            currentInfowindow.close();
            currentInfowindow = null;
        }
    }

    // 정보창 표시 함수
    function showInfoWindow(marker, restaurant) {
        // 기존 정보창 닫기
        if (currentInfowindow) {
            currentInfowindow.close();
        }

        // 정보창 내용 생성
        const content = `
            <div class="map-infowindow">
                <div class="info-header">
                    <h4>${restaurant.name}</h4>
                    <div class="info-rating"><i class="fas fa-star"></i> ${restaurant.rating}</div>
                </div>
                <div class="info-body">
                    <p class="info-category">${restaurant.category} • ${restaurant.location}</p>
                    <p class="info-address">${restaurant.address}</p>
                    <p class="info-distance">도보 ${restaurant.distance}분</p>
                </div>
                <div class="info-footer">
                    <button class="btn-detail" onclick="showRestaurantDetail(${restaurant.id})">상세정보</button>
                    <button class="btn-favorite" onclick="addToFavorites(${restaurant.id})">즐겨찾기</button>
                </div>
            </div>
        `;

        // 정보창 스타일 추가
        addInfoWindowStyle();

        // 정보창 생성
        const infowindow = new kakao.maps.InfoWindow({
            content: content,
            removable: true,
            zIndex: 2
        });

        // 정보창 표시
        infowindow.open(map, marker);
        currentInfowindow = infowindow;
    }

    // 정보창 스타일 추가 함수
    function addInfoWindowStyle() {
        const styleElement = document.getElementById('map-infowindow-style');
        if (styleElement) return; // 이미 스타일이 추가되어 있으면 중복 추가 방지

        const style = document.createElement('style');
        style.id = 'map-infowindow-style';
        style.innerHTML = `
            .map-infowindow {
                padding: 10px;
                width: 250px;
                border-radius: 8px;
            }
            
            .info-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .info-header h4 {
                margin: 0;
                font-size: 16px;
                color: #333;
            }
            
            .info-rating {
                color: #ff6b6b;
                font-weight: bold;
            }
            
            .info-rating i {
                color: #ffcc00;
            }
            
            .info-body {
                margin-bottom: 8px;
            }
            
            .info-body p {
                margin: 5px 0;
                font-size: 13px;
                color: #666;
            }
            
            .info-footer {
                display: flex;
                gap: 8px;
            }
            
            .info-footer button {
                flex: 1;
                padding: 6px 0;
                border: none;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            
            .btn-detail {
                background-color: #e9ecef;
                color: #495057;
            }
            
            .btn-favorite {
                background-color: #ff6b6b;
                color: white;
            }
            
            .btn-detail:hover {
                background-color: #dee2e6;
            }
            
            .btn-favorite:hover {
                background-color: #fa5252;
            }
        `;
        document.head.appendChild(style);
    }

    // 지도 경계 조정 함수 (모든 마커가 보이도록)
    function adjustMapBounds(restaurants) {
        const bounds = new kakao.maps.LatLngBounds();

        // 기준 위치 (현재 위치 등)가 있으면 추가
        if (map.getCenter) {
            bounds.extend(map.getCenter());
        }

        // 식당 위치 추가
        restaurants.forEach(restaurant => {
            bounds.extend(new kakao.maps.LatLng(restaurant.lat, restaurant.lng));
        });

        // 지도 범위 설정
        map.setBounds(bounds);
    }

    // 식당 마커 강조 표시 함수 (리스트에서 식당 클릭 시 호출)
    function highlightMarkerOnMap(restaurantId, lat, lng) {
        // 정보창 닫기
        if (currentInfowindow) {
            currentInfowindow.close();
            currentInfowindow = null;
        }

        // ID로 마커 찾기
        const marker = markers.find(m => m.restaurantId === parseInt(restaurantId));

        if (marker) {
            // 지도 중심 이동
            map.setCenter(marker.getPosition());
            map.setLevel(3); // 줌 레벨 조정

            // 식당 데이터 찾기
            const restaurant = window.getSampleRestaurants ?
                window.getSampleRestaurants().find(r => r.id === parseInt(restaurantId)) : null;

            if (restaurant) {
                // 정보창 표시
                showInfoWindow(marker, restaurant);

                // 마커 바운스 애니메이션
                marker.setAnimation(kakao.maps.Animation.BOUNCE);
                setTimeout(() => {
                    marker.setAnimation(null);
                }, 2000);
            }
        } else if (lat && lng) {
            // 마커가 없지만 좌표가 있는 경우
            map.setCenter(new kakao.maps.LatLng(lat, lng));
            map.setLevel(3);
        }
    }

    // 식당 상세 정보 보기 함수 (정보창의 버튼 클릭 시 호출)
    window.showRestaurantDetail = function(restaurantId) {
        console.log(`식당 ID ${restaurantId}의 상세 정보 보기`);
        // 실제 구현에서는 상세 정보 페이지로 이동하거나 모달로 표시
        window.showNotification(`식당 상세 정보 페이지로 이동합니다.`);
    };

    // 즐겨찾기 추가 함수 (정보창의 버튼 클릭 시 호출)
    window.addToFavorites = function(restaurantId) {
        console.log(`식당 ID ${restaurantId}를 즐겨찾기에 추가`);
        // 실제 구현에서는 즐겨찾기 API 호출
        window.showNotification(`즐겨찾기에 추가되었습니다.`);
    };

    // 전역 함수로 노출 (다른 스크립트에서 호출 가능하도록)
    window.updateKakaoMap = updateKakaoMap;
    window.updateKakaoMapWithRestaurants = updateKakaoMapWithRestaurants;
    window.addMarkersToKakaoMap = addMarkersToKakaoMap;
    window.highlightMarkerOnMap = highlightMarkerOnMap;
});