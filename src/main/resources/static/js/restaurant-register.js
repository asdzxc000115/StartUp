/**
 * 맛집 탐색기 - 가게 정보 등록 페이지 자바스크립트
 */
document.addEventListener('DOMContentLoaded', function() {
    // 전역 변수
    let currentStep = 1;
    const maxStep = 4;
    let tags = [];
    let mainImageFile = null;
    let menuImages = {};
    let restaurantImages = [];
    let map = null;
    let marker = null;

    // 단계 전환 버튼 이벤트
    setupStepButtons();

    // 태그 관리
    setupTagsInput();

    // 주소 검색 기능
    setupAddressSearch();

    // 영업 시간 관리
    setupBusinessHours();

    // 메뉴 카테고리 탭 전환
    setupMenuTabs();

    // 메뉴 추가/삭제 관리
    setupMenuItems();

    // 이미지 업로드 미리보기
    setupImageUploads();

    // 폼 제출 처리
    setupFormSubmission();

    // 설명 글자수 카운터 설정
    setupDescriptionCounter();

    /**
     * 단계별 폼 전환 기능 설정
     */
    function setupStepButtons() {
        const nextButtons = document.querySelectorAll('.btn-next');
        const prevButtons = document.querySelectorAll('.btn-prev');

        // 다음 단계 버튼
        nextButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (validateCurrentStep()) {
                    goToStep(currentStep + 1);
                }
            });
        });

        // 이전 단계 버튼
        prevButtons.forEach(button => {
            button.addEventListener('click', () => {
                goToStep(currentStep - 1);
            });
        });
    }

    /**
     * 현재 단계 유효성 검사
     */
    function validateCurrentStep() {
        // 각 단계별 필수 입력 요소 검사
        const formStep = document.getElementById(`step-${currentStep}`);
        const requiredFields = formStep.querySelectorAll('[required]');

        let isValid = true;

        requiredFields.forEach(field => {
            if (field.value.trim() === '') {
                field.classList.add('error');

                // 에러 메시지 표시
                const errorMsg = field.nextElementSibling?.classList.contains('error-message')
                    ? field.nextElementSibling
                    : document.createElement('div');

                if (!errorMsg.classList.contains('error-message')) {
                    errorMsg.classList.add('error-message');
                    errorMsg.textContent = '이 필드는 필수입니다.';
                    field.parentNode.insertBefore(errorMsg, field.nextSibling);
                }

                isValid = false;
            } else {
                field.classList.remove('error');
                const errorMsg = field.nextElementSibling;
                if (errorMsg?.classList.contains('error-message')) {
                    errorMsg.remove();
                }
            }
        });

        // 단계별 추가 검증
        switch(currentStep) {
            case 1:
                // 기본 정보 단계
                const description = document.getElementById('restaurant-description');
                if (description.value.length > 500) {
                    showNotification('가게 소개는 최대 500자까지 입력 가능합니다.', 'error');
                    isValid = false;
                }
                break;

            case 2:
                // 영업 정보 단계
                const lat = document.getElementById('restaurant-lat').value;
                const lng = document.getElementById('restaurant-lng').value;

                if (!lat || !lng) {
                    showNotification('주소를 검색하여 위치를 설정해주세요.', 'error');
                    isValid = false;
                }

                const phone = document.getElementById('restaurant-phone').value;
                const phoneRegex = /^\d{9,11}$/;
                if (!phoneRegex.test(phone.replace(/-/g, ''))) {
                    showNotification('올바른 전화번호 형식이 아닙니다.', 'error');
                    isValid = false;
                }
                break;

            case 3:
                // 메뉴 등록 단계
                const signatureMenuItems = document.querySelectorAll('#signature-menu-list .menu-item-row');
                if (signatureMenuItems.length === 0) {
                    showNotification('최소 1개 이상의 대표 메뉴를 등록해주세요.', 'error');
                    isValid = false;
                }

                // 메뉴 가격 유효성 검사
                const menuPrices = document.querySelectorAll('.menu-price-input');
                menuPrices.forEach(price => {
                    if (price.value && (isNaN(price.value) || parseInt(price.value) <= 0)) {
                        showNotification('메뉴 가격은 0보다 큰 숫자여야 합니다.', 'error');
                        price.classList.add('error');
                        isValid = false;
                    }
                });
                break;

            case 4:
                // 사진 등록 단계
                if (!mainImageFile) {
                    showNotification('가게 대표 사진을 등록해주세요.', 'error');
                    isValid = false;
                }

                // 약관 동의 체크
                const termsAgree = document.getElementById('terms-agree');
                if (!termsAgree.checked) {
                    showNotification('이용약관과 개인정보 처리방침에 동의해주세요.', 'error');
                    isValid = false;
                }
                break;
        }

        return isValid;
    }

    /**
     * 지정된 단계로 이동
     */
    function goToStep(step) {
        if (step < 1 || step > maxStep) return;

        // 현재 단계 숨기고 다음 단계 표시
        document.querySelectorAll('.form-step').forEach(formStep => {
            formStep.classList.remove('active');
        });

        document.getElementById(`step-${step}`).classList.add('active');

        // 진행 상태 업데이트
        updateProgressBar(step);

        // 현재 단계 업데이트
        currentStep = step;

        // 스크롤 맨 위로
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * 진행 상태 표시줄 업데이트
     */
    function updateProgressBar(step) {
        const progressSteps = document.querySelectorAll('.progress-step');
        const progressLines = document.querySelectorAll('.progress-line');

        progressSteps.forEach((stepEl, index) => {
            const stepNum = index + 1;

            stepEl.classList.remove('active', 'completed');

            if (stepNum < step) {
                stepEl.classList.add('completed');
            } else if (stepNum === step) {
                stepEl.classList.add('active');
            }
        });

        progressLines.forEach((line, index) => {
            line.classList.remove('filled');
            if (index < step - 1) {
                line.classList.add('filled');
            }
        });
    }

    /**
     * 태그 입력 기능 설정
     */
    function setupTagsInput() {
        const tagInput = document.getElementById('restaurant-tags-input');
        const tagsList = document.getElementById('tags-list');
        const tagsHiddenInput = document.getElementById('restaurant-tags');
        const tagSuggestions = document.querySelectorAll('.tag-suggestion');
        const maxTags = 5;

        // 태그 입력 처리
        tagInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const tagText = this.value.trim();

                if (tagText && !tags.includes(tagText) && tags.length < maxTags) {
                    addTag(tagText);
                    this.value = '';
                } else if (tags.length >= maxTags) {
                    showNotification(`태그는 최대 ${maxTags}개까지만 등록 가능합니다.`, 'error');
                } else if (tags.includes(tagText)) {
                    showNotification('이미 등록된 태그입니다.', 'error');
                    this.value = '';
                }
            }
        });

        // 태그 추천 클릭 처리
        tagSuggestions.forEach(suggestion => {
            suggestion.addEventListener('click', function() {
                const tagText = this.textContent.trim();

                if (!tags.includes(tagText) && tags.length < maxTags) {
                    addTag(tagText);
                } else if (tags.length >= maxTags) {
                    showNotification(`태그는 최대 ${maxTags}개까지만 등록 가능합니다.`, 'error');
                } else if (tags.includes(tagText)) {
                    showNotification('이미 등록된 태그입니다.', 'error');
                }
            });
        });

        // 태그 추가 함수
        function addTag(text) {
            tags.push(text);
            updateTagsUI();
        }

        // 태그 삭제 함수
        function removeTag(index) {
            tags.splice(index, 1);
            updateTagsUI();
        }

        // 태그 UI 업데이트
        function updateTagsUI() {
            // 태그 목록 갱신
            tagsList.innerHTML = '';

            tags.forEach((tag, index) => {
                const tagElement = document.createElement('span');
                tagElement.className = 'tag';
                tagElement.innerHTML = `
                    ${tag}
                    <span class="tag-remove">&times;</span>
                `;

                const removeButton = tagElement.querySelector('.tag-remove');
                removeButton.addEventListener('click', () => removeTag(index));

                tagsList.appendChild(tagElement);
            });

            // 히든 인풋 업데이트
            tagsHiddenInput.value = tags.join(',');
        }
    }

    /**
     * 주소 검색 기능 설정
     */
    function setupAddressSearch() {
        const searchAddressBtn = document.getElementById('search-address-btn');
        const addressModal = document.getElementById('addressSearchModal');
        const modalClose = document.querySelector('.modal-close');
        const addressKeyword = document.getElementById('address-keyword');
        const addressSearchButton = document.getElementById('address-search-button');
        const addressResults = document.getElementById('address-results');
        const restaurantAddress = document.getElementById('restaurant-address');
        const restaurantLat = document.getElementById('restaurant-lat');
        const restaurantLng = document.getElementById('restaurant-lng');
        const addressMapElement = document.getElementById('address-map');

        // 카카오맵 초기화
        if (addressMapElement) {
            map = new kakao.maps.Map(addressMapElement, {
                center: new kakao.maps.LatLng(37.566826, 126.9786567), // 서울 중심
                level: 5
            });
        }

        // 주소 검색 버튼 클릭
        searchAddressBtn.addEventListener('click', function() {
            addressModal.style.display = 'flex';
        });

        // 모달 닫기
        modalClose.addEventListener('click', function() {
            addressModal.style.display = 'none';
        });

        // 모달 바깥 클릭 시 닫기
        addressModal.addEventListener('click', function(e) {
            if (e.target === addressModal) {
                addressModal.style.display = 'none';
            }
        });

        // 주소 검색 실행
        addressSearchButton.addEventListener('click', searchAddress);
        addressKeyword.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                searchAddress();
            }
        });

        // 주소 검색 함수
        function searchAddress() {
            const keyword = addressKeyword.value.trim();

            if (!keyword) {
                showNotification('검색어를 입력해주세요.', 'error');
                return;
            }

            // 로딩 표시
            addressResults.innerHTML = '<div class="loading-results">검색 중...</div>';

            // 카카오 주소 검색 API 활용
            const geocoder = new kakao.maps.services.Geocoder();

            geocoder.addressSearch(keyword, function(result, status) {
                addressResults.innerHTML = '';

                if (status === kakao.maps.services.Status.OK) {
                    result.forEach(function(address) {
                        const addressItem = document.createElement('div');
                        addressItem.className = 'address-item';
                        addressItem.innerHTML = `
                            <div class="road-address">${address.road_address ? address.road_address.address_name : '도로명 주소 없음'}</div>
                            <div class="jibun-address">${address.address.address_name}</div>
                        `;

                        addressItem.addEventListener('click', function() {
                            selectAddress(address);
                        });

                        addressResults.appendChild(addressItem);
                    });
                } else {
                    addressResults.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
                }
            });
        }

        // 주소 선택 함수
        function selectAddress(address) {
            const addressName = address.road_address ? address.road_address.address_name : address.address.address_name;

            // 주소 입력 필드에 설정
            restaurantAddress.value = addressName;

            // 좌표 저장
            restaurantLat.value = address.y;
            restaurantLng.value = address.x;

            // 지도에 마커 표시
            const coords = new kakao.maps.LatLng(address.y, address.x);

            // 기존 마커 제거
            if (marker) {
                marker.setMap(null);
            }

            // 새 마커 생성
            marker = new kakao.maps.Marker({
                map: map,
                position: coords
            });

            // 지도 중심 이동
            map.setCenter(coords);

            // 모달 닫기
            addressModal.style.display = 'none';

            showNotification('주소가 설정되었습니다.');
        }
    }

    /**
     * 영업 시간 관리 기능 설정
     */
    function setupBusinessHours() {
        const copyHoursBtn = document.getElementById('copy-hours-btn');
        const dayCheckboxes = document.querySelectorAll('[id$="-open"]');

        // 영업일 체크박스 이벤트
        dayCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const day = this.id.replace('-open', '');
                const startSelect = document.getElementById(`${day}-start`);
                const endSelect = document.getElementById(`${day}-end`);
                const lastOrder = document.getElementById(`${day}-last-order`);

                if (this.checked) {
                    startSelect.disabled = false;
                    endSelect.disabled = false;
                    lastOrder.disabled = false;

                    // 기본값 설정
                    if (startSelect.value === '휴무일') startSelect.value = '09:00';
                    if (endSelect.value === '휴무일') endSelect.value = '21:00';
                } else {
                    startSelect.value = '휴무일';
                    endSelect.value = '휴무일';
                    lastOrder.value = '';

                    startSelect.disabled = true;
                    endSelect.disabled = true;
                    lastOrder.disabled = true;
                }
            });
        });

        // 모든 요일에 같은 시간 적용
        copyHoursBtn.addEventListener('click', function() {
            const mondayStart = document.getElementById('monday-start').value;
            const mondayEnd = document.getElementById('monday-end').value;
            const mondayLastOrder = document.getElementById('monday-last-order').value;

            const days = ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

            days.forEach(day => {
                const dayOpen = document.getElementById(`${day}-open`);

                if (dayOpen.checked) {
                    document.getElementById(`${day}-start`).value = mondayStart;
                    document.getElementById(`${day}-end`).value = mondayEnd;
                    document.getElementById(`${day}-last-order`).value = mondayLastOrder;
                }
            });

            showNotification('영업 시간이 모든 영업일에 적용되었습니다.');
        });

        // 시간 선택 옵션 생성
        generateTimeOptions();
    }

    /**
     * 시간 선택 옵션 생성
     */
    function generateTimeOptions() {
        const timeSelects = document.querySelectorAll('select[id$="-start"], select[id$="-end"]');

        timeSelects.forEach(select => {
            // 기존 옵션 유지
            const existingOptions = Array.from(select.options).slice(0, 2); // 휴무일, 00:00 옵션 유지

            // 새 옵션 생성
            select.innerHTML = '';

            // 기존 옵션 추가
            existingOptions.forEach(option => {
                select.appendChild(option);
            });

            // 시간 옵션 추가 (30분 단위)
            for (let hour = 0; hour < 24; hour++) {
                for (let min = 0; min < 60; min += 30) {
                    if (hour === 0 && min === 0) continue; // 이미 추가된 00:00 건너뛰기

                    const timeValue = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
                    const option = document.createElement('option');
                    option.value = timeValue;
                    option.textContent = timeValue;
                    select.appendChild(option);
                }
            }

            // 24:00 추가
            const lastOption = document.createElement('option');
            lastOption.value = '24:00';
            lastOption.textContent = '24:00';
            select.appendChild(lastOption);
        });
    }

    /**
     * 메뉴 탭 전환 기능 설정
     */
    function setupMenuTabs() {
        const categoryTabs = document.querySelectorAll('.category-tab');
        const menuContainers = document.querySelectorAll('.menu-items-container');

        categoryTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const category = this.dataset.category;

                // 탭 활성화
                categoryTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                // 컨테이너 표시
                menuContainers.forEach(container => {
                    container.style.display = 'none';
                });
                document.getElementById(`${category}-menu`).style.display = 'block';
            });
        });
    }

    /**
     * 메뉴 항목 관리 기능 설정
     */
    function setupMenuItems() {
        // 대표 메뉴 추가 버튼
        const addSignatureMenuBtn = document.getElementById('add-signature-menu');
        const signatureMenuList = document.getElementById('signature-menu-list');

        addSignatureMenuBtn.addEventListener('click', function() {
            addNewMenuItem(signatureMenuList);
        });

        // 기존 메뉴 삭제 버튼에 이벤트 연결
        setupRemoveMenuButtons();

        // 기존 메뉴 이미지 업로드에 이벤트 연결
        setupMenuImageUploads();
    }

    /**
     * 새 메뉴 항목 추가
     */
    function addNewMenuItem(container) {
        // 메뉴 항목 수 확인 (최대 15개)
        const menuItems = container.querySelectorAll('.menu-item-row');

        if (menuItems.length >= 15) {
            showNotification('메뉴는 카테고리당 최대 15개까지 등록 가능합니다.', 'error');
            return;
        }

        // 새 메뉴 ID 생성
        const menuId = Date.now();

        // 새 메뉴 항목 생성
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item-row';
        menuItem.dataset.id = menuId;

        menuItem.innerHTML = `
            <div class="menu-item-image">
                <label for="menu-image-${menuId}">
                    <div class="image-placeholder">
                        <i class="fas fa-camera"></i>
                        <span>사진 등록</span>
                    </div>
                    <img src="" alt="" style="display: none;">
                </label>
                <input type="file" id="menu-image-${menuId}" class="menu-image-input" accept="image/*" style="display: none;">
            </div>
            <div class="menu-item-info">
                <input type="text" class="menu-item-name" placeholder="메뉴명" required>
                <textarea class="menu-item-description" placeholder="메뉴 설명 (선택사항)"></textarea>
                <div class="menu-item-price">
                    <input type="number" class="menu-price-input" placeholder="가격" required> 원
                </div>
            </div>
            <button type="button" class="btn-remove-menu"><i class="fas fa-trash-alt"></i></button>
        `;

        container.appendChild(menuItem);

        // 이미지 업로드 이벤트 설정
        const imageInput = menuItem.querySelector('.menu-image-input');
        imageInput.addEventListener('change', handleMenuImageUpload);

        // 삭제 버튼 이벤트 설정
        const removeBtn = menuItem.querySelector('.btn-remove-menu');
        removeBtn.addEventListener('click', function() {
            menuItem.remove();
        });
    }

    /**
     * 기존 메뉴 삭제 버튼 이벤트 설정
     */
    function setupRemoveMenuButtons() {
        const removeButtons = document.querySelectorAll('.btn-remove-menu');

        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                this.closest('.menu-item-row').remove();
            });
        });
    }

    /**
     * 기존 메뉴 이미지 업로드 이벤트 설정
     */
    function setupMenuImageUploads() {
        const imageInputs = document.querySelectorAll('.menu-image-input');

        imageInputs.forEach(input => {
            input.addEventListener('change', handleMenuImageUpload);
        });
    }

    /**
     * 메뉴 이미지 업로드 처리
     */
    function handleMenuImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // 이미지 유효성 검사
        if (!file.type.match('image.*')) {
            showNotification('이미지 파일만 업로드 가능합니다.', 'error');
            return;
        }

        // 메뉴 ID
        const menuId = this.id.replace('menu-image-', '');

        // 미리보기 생성
        const reader = new FileReader();
        const imgElement = this.parentElement.querySelector('img');
        const placeholderElement = this.parentElement.querySelector('.image-placeholder');

        reader.onload = function(e) {
            imgElement.src = e.target.result;
            imgElement.style.display = 'block';
            placeholderElement.style.display = 'none';

            // 이미지 객체에 저장
            menuImages[menuId] = file;
        };

        reader.readAsDataURL(file);
    }

    /**
     * 이미지 업로드 기능 설정
     */
    function setupImageUploads() {
        setupMainImageUpload();
        setupAdditionalImageUploads();
    }

    /**
     * 대표 이미지 업로드 설정
     */
    function setupMainImageUpload() {
        const mainImageUpload = document.getElementById('main-image-upload');
        const mainImagePreview = document.getElementById('main-image-preview');
        const mainImagePlaceholder = document.querySelector('.main-image-placeholder');

        if (!mainImageUpload) return;

        mainImageUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            // 이미지 유효성 검사
            if (!file.type.match('image.*')) {
                showNotification('이미지 파일만 업로드 가능합니다.', 'error');
                return;
            }

            // 이미지 크기 검사 (최대 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('이미지 크기는 최대 5MB까지 가능합니다.', 'error');
                return;
            }

            // 미리보기 생성
            const reader = new FileReader();

            reader.onload = function(e) {
                mainImagePreview.src = e.target.result;
                mainImagePreview.style.display = 'block';
                mainImagePlaceholder.style.display = 'none';

                // 이미지 객체에 저장
                mainImageFile = file;
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * 추가 이미지 업로드 설정
     */
    function setupAdditionalImageUploads() {
        const imageUploadContainer = document.getElementById('image-upload-container');
        const existingUploads = document.querySelectorAll('.image-upload');

        if (!imageUploadContainer) return;

        // 기존 업로드 필드에 이벤트 추가
        existingUploads.forEach(upload => {
            upload.addEventListener('change', handleAdditionalImageUpload);
        });

        // 첫 번째 추가 이미지 업로드 항목에 이벤트 설정
        const firstImageUpload = document.getElementById('image-upload-1');
        if (firstImageUpload) {
            firstImageUpload.addEventListener('change', handleAdditionalImageUpload);
        }
    }

    /**
     * 추가 이미지 업로드 처리
     */
    function handleAdditionalImageUpload(e) {
        const uploadItem = this.closest('.image-upload-item');
        const file = e.target.files[0];

        if (!file) return;

        // 이미지 유효성 검사
        if (!file.type.match('image.*')) {
            showNotification('이미지 파일만 업로드 가능합니다.', 'error');
            return;
        }

        // 이미지 크기 검사 (최대 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('이미지 크기는 최대 5MB까지 가능합니다.', 'error');
            return;
        }

        // 미리보기 생성
        const reader = new FileReader();
        const imgElement = uploadItem.querySelector('img');
        const placeholderElement = uploadItem.querySelector('.image-placeholder');
        const removeButton = uploadItem.querySelector('.btn-remove-image');

        reader.onload = function(e) {
            imgElement.src = e.target.result;
            imgElement.style.display = 'block';
            placeholderElement.style.display = 'none';
            removeButton.style.display = 'block';

            // 이미지 객체에 저장
            const imageId = uploadItem.dataset.id || Date.now().toString();
            uploadItem.dataset.id = imageId;

            // 이미지 배열에 추가
            restaurantImages.push({
                id: imageId,
                file: file
            });

            // 새 업로드 항목이 필요한지 확인
            const allUploaded = Array.from(
                document.querySelectorAll('.image-upload-item')
            ).every(item => {
                return item.querySelector('img').style.display !== 'none';
            });

            if (allUploaded) {
                addNewImageUpload();
            }
        };

        reader.readAsDataURL(file);
    }

    /**
     * 새 이미지 업로드 항목 추가
     */
    function addNewImageUpload() {
        const imageUploadContainer = document.getElementById('image-upload-container');

        // 이미지 최대 개수 확인 (10개)
        const uploadItems = imageUploadContainer.querySelectorAll('.image-upload-item');

        if (uploadItems.length >= 10) {
            showNotification('추가 이미지는 최대 10장까지 업로드 가능합니다.', 'error');
            return;
        }

        // 새 이미지 ID 생성
        const imageId = Date.now();

        // 새 이미지 업로드 항목 생성
        const uploadItem = document.createElement('div');
        uploadItem.className = 'image-upload-item';
        uploadItem.dataset.id = imageId;

        uploadItem.innerHTML = `
            <label for="image-upload-${imageId}">
                <div class="image-placeholder">
                    <i class="fas fa-plus"></i>
                </div>
                <img src="" alt="" style="display: none;">
            </label>
            <input type="file" id="image-upload-${imageId}" class="image-upload" accept="image/*" style="display: none;">
            <button type="button" class="btn-remove-image" style="display: none;"><i class="fas fa-times"></i></button>
        `;

        imageUploadContainer.appendChild(uploadItem);

        // 이벤트 연결
        const imageInput = uploadItem.querySelector('.image-upload');
        imageInput.addEventListener('change', handleAdditionalImageUpload);

        const removeBtn = uploadItem.querySelector('.btn-remove-image');
        removeBtn.addEventListener('click', function() {
            // 이미지 객체에서 제거
            const imageId = uploadItem.dataset.id;
            const imageIndex = restaurantImages.findIndex(img => img.id === imageId);

            if (imageIndex !== -1) {
                restaurantImages.splice(imageIndex, 1);
            }

            uploadItem.remove();

            // 마지막 항목이 삭제되었으면 새 항목 추가
            const remainingItems = imageUploadContainer.querySelectorAll('.image-upload-item');

            if (remainingItems.length === 0) {
                addNewImageUpload();
            }
        });
    }

    /**
     * 설명 글자수 카운터 설정
     */
    function setupDescriptionCounter() {
        const descriptionTextarea = document.getElementById('restaurant-description');
        const descriptionCounter = document.getElementById('description-count');

        if (descriptionTextarea && descriptionCounter) {
            descriptionTextarea.addEventListener('input', function() {
                const length = this.value.length;
                descriptionCounter.textContent = length;

                // 500자 제한
                if (length > 500) {
                    this.value = this.value.substring(0, 500);
                    descriptionCounter.textContent = 500;
                }
            });
        }
    }

    /**
     * 폼 제출 처리
     */
    function setupFormSubmission() {
        const registerForm = document.getElementById('restaurant-register-form');

        if (!registerForm) return;

        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // 유효성 검사
            if (!validateCurrentStep()) {
                return;
            }

            // 로딩 표시
            showLoadingOverlay('가게 정보를 등록 중입니다...');

            try {
                // 폼 데이터 수집
                const formData = new FormData();

                // 기본 정보
                formData.append('name', document.getElementById('restaurant-name').value);
                formData.append('category', document.getElementById('restaurant-category').value);
                formData.append('description', document.getElementById('restaurant-description').value);
                formData.append('tags', document.getElementById('restaurant-tags').value);

                // 편의 시설
                const facilities = [];
                document.querySelectorAll('input[name="facilities"]:checked').forEach(checkbox => {
                    facilities.push(checkbox.value);
                });
                formData.append('facilities', facilities.join(','));

                // 영업 정보
                formData.append('address', document.getElementById('restaurant-address').value);
                formData.append('addressDetail', document.getElementById('restaurant-address-detail').value);
                formData.append('lat', document.getElementById('restaurant-lat').value);
                formData.append('lng', document.getElementById('restaurant-lng').value);
                formData.append('phone', document.getElementById('restaurant-phone').value);
                formData.append('website', document.getElementById('restaurant-website').value);
                formData.append('priceRange', document.getElementById('price-range').value);

                // 영업 시간
                const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                days.forEach(day => {
                    const isOpen = document.getElementById(`${day}-open`).checked;
                    const start = document.getElementById(`${day}-start`).value;
                    const end = document.getElementById(`${day}-end`).value;
                    const lastOrder = document.getElementById(`${day}-last-order`).value;

                    formData.append(`${day}Open`, isOpen);
                    formData.append(`${day}Start`, start);
                    formData.append(`${day}End`, end);
                    formData.append(`${day}LastOrder`, lastOrder);
                });

                // 메뉴 정보 수집
                const menuCategories = ['signature', 'main', 'side', 'beverage'];

                // 각 카테고리별 메뉴 수집
                menuCategories.forEach(category => {
                    const menuItems = document.querySelectorAll(`#${category}-menu-list .menu-item-row`);

                    menuItems.forEach((item, index) => {
                        const menuId = item.dataset.id || `${category}-${index}`;
                        const menuName = item.querySelector('.menu-item-name').value;
                        const menuDesc = item.querySelector('.menu-item-description').value;
                        const menuPrice = item.querySelector('.menu-price-input').value;

                        // 메뉴명이 있는 경우만 추가
                        if (menuName.trim()) {
                            formData.append(`menu[${menuId}][category]`, category);
                            formData.append(`menu[${menuId}][name]`, menuName);
                            formData.append(`menu[${menuId}][description]`, menuDesc);
                            formData.append(`menu[${menuId}][price]`, menuPrice);

                            // 메뉴 이미지 추가
                            if (menuImages[menuId]) {
                                formData.append(`menu[${menuId}][image]`, menuImages[menuId], `menu_${menuId}.jpg`);
                            }
                        }
                    });
                });

                // 대표 이미지 추가
                if (mainImageFile) {
                    formData.append('mainImage', mainImageFile, 'main_image.jpg');
                }

                // 추가 이미지 추가
                restaurantImages.forEach((img, index) => {
                    if (img.file) {
                        formData.append(`additionalImages[${index}]`, img.file, `additional_${index}.jpg`);
                    }
                });

                // API 호출 - 실제 구현 시 적절한 URL로 변경 필요
                const response = await fetch('/api/owner/restaurant', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();

                    showNotification('가게 등록이 완료되었습니다.');

                    // 성공 페이지로 이동
                    setTimeout(() => {
                        window.location.href = `/owner/restaurant/${result.restaurantId}`;
                    }, 2000);
                } else {
                    const error = await response.json();
                    throw new Error(error.message || '가게 등록에 실패했습니다.');
                }
            } catch (error) {
                console.error('가게 등록 오류:', error);
                showNotification(error.message || '가게 등록 중 오류가 발생했습니다.', 'error');
            } finally {
                hideLoadingOverlay();
            }
        });
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
});