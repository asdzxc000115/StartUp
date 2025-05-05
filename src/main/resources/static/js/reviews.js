document.addEventListener('DOMContentLoaded', function() {
    // 리뷰 탭 전환 기능
    const reviewTabs = document.querySelectorAll('.review-tab');
    const tabContents = document.querySelectorAll('.review-tab-content');

    reviewTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 탭 활성화 상태 변경
            reviewTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // 해당 탭 콘텐츠 표시
            const targetTabId = this.dataset.tab;
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTabId) {
                    content.classList.add('active');
                }
            });
        });
    });

    // 내 리뷰 데이터 (실제로는 서버에서 가져올 데이터)
    const myReviewsData = [
        {
            id: 1,
            restaurantId: 1,
            restaurantName: '맛있는 한식당',
            category: '한식',
            location: '강남구',
            rating: 4.5,
            content: '고기가 정말 신선하고 맛있었어요! 반찬도 푸짐하게 나와서 만족스러웠습니다. 다음에도 꼭 방문하고 싶은 맛집입니다. 직원분들도 친절하셔서 좋았습니다.',
            visitDate: '2025-03-15',
            images: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150']
        },
        {
            id: 2,
            restaurantId: 2,
            restaurantName: '분위기 좋은 카페',
            category: '카페',
            location: '강남구',
            rating: 4.0,
            content: '커피 맛이 좋고 인테리어가 예뻐요. 조용한 분위기에서 작업하기 좋습니다. 직원분들도 친절하셔서 자주 방문하게 되는 곳입니다.',
            visitDate: '2025-03-10',
            images: []
        }
    ];

    // 모든 리뷰 데이터 (실제로는 서버에서 가져올 데이터)
    const allReviewsData = [
        {
            id: 3,
            restaurantId: 3,
            restaurantName: '스시 오마카세',
            category: '일식',
            location: '강남구',
            rating: 5.0,
            content: '재료가 너무 신선하고 셰프의 솜씨가 대단했습니다. 가격은 조금 있지만 그만한 가치가 있는 곳입니다. 특히 밀치와 청어가 일품이었습니다!',
            visitDate: '2025-03-20',
            images: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150', 'https://via.placeholder.com/150'],
            reviewer: {
                id: 101,
                name: '맛집탐험가',
                image: 'https://via.placeholder.com/40'
            },
            likes: 12,
            comments: 3
        },
        {
            id: 4,
            restaurantId: 4,
            restaurantName: '이탈리안 레스토랑',
            category: '양식',
            location: '강남구',
            rating: 3.5,
            content: '파스타는 맛있었지만 서비스가 조금 아쉬웠습니다. 웨이팅 시간도 예상보다 길었고, 테이블 간격이 좁아 불편했어요. 하지만 음식 맛 자체는 괜찮았습니다.',
            visitDate: '2025-03-18',
            images: [],
            reviewer: {
                id: 102,
                name: '푸드리뷰어',
                image: 'https://via.placeholder.com/40'
            },
            likes: 5,
            comments: 2
        }
    ];

    // 초기 데이터 렌더링
    renderMyReviews(myReviewsData);
    renderAllReviews(allReviewsData);

    // 내 리뷰 정렬 기능
    const myReviewSort = document.getElementById('my-review-sort');
    if (myReviewSort) {
        myReviewSort.addEventListener('change', function() {
            sortMyReviews(this.value);
        });
    }

    // 모든 리뷰 필터 및 정렬 기능
    const allReviewCategory = document.getElementById('all-review-category');
    const allReviewSort = document.getElementById('all-review-sort');

    if (allReviewCategory) {
        allReviewCategory.addEventListener('change', function() {
            filterAllReviews();
        });
    }

    if (allReviewSort) {
        allReviewSort.addEventListener('change', function() {
            filterAllReviews();
        });
    }

    // 내 리뷰 검색 기능
    const searchMyReviews = document.getElementById('search-my-reviews');
    const searchMyBtn = document.getElementById('search-my-btn');

    if (searchMyBtn) {
        searchMyBtn.addEventListener('click', function() {
            searchInMyReviews();
        });
    }

    if (searchMyReviews) {
        searchMyReviews.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchInMyReviews();
            }
        });
    }

    // 모든 리뷰 검색 기능
    const searchAllReviews = document.getElementById('search-all-reviews');
    const searchAllBtn = document.getElementById('search-all-btn');

    if (searchAllBtn) {
        searchAllBtn.addEventListener('click', function() {
            filterAllReviews();
        });
    }

    if (searchAllReviews) {
        searchAllReviews.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterAllReviews();
            }
        });
    }

    // 내 리뷰 정렬 함수
    function sortMyReviews(sortBy) {
        let sortedReviews = [...myReviewsData];

        switch (sortBy) {
            case 'recent':
                // 방문일 기준 최신순
                sortedReviews.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
                break;
            case 'rating-high':
                // 평점 높은순
                sortedReviews.sort((a, b) => b.rating - a.rating);
                break;
            case 'rating-low':
                // 평점 낮은순
                sortedReviews.sort((a, b) => a.rating - b.rating);
                break;
        }

        renderMyReviews(sortedReviews);
    }

    // 내 리뷰 검색 함수
    function searchInMyReviews() {
        const searchText = searchMyReviews ? searchMyReviews.value.toLowerCase() : '';

        if (!searchText) {
            renderMyReviews(myReviewsData);
            return;
        }

        const filteredReviews = myReviewsData.filter(review =>
            review.restaurantName.toLowerCase().includes(searchText) ||
            review.content.toLowerCase().includes(searchText) ||
            review.category.toLowerCase().includes(searchText)
        );

        renderMyReviews(filteredReviews);
    }

    // 모든 리뷰 필터링 및 정렬 함수
    function filterAllReviews() {
        const category = allReviewCategory ? allReviewCategory.value : '';
        const sortBy = allReviewSort ? allReviewSort.value : 'recent';
        const searchText = searchAllReviews ? searchAllReviews.value.toLowerCase() : '';

        // 필터링
        let filteredReviews = allReviewsData.filter(review => {
            // 카테고리 필터
            if (category && review.category !== category) {
                return false;
            }

            // 검색어 필터
            if (searchText) {
                return review.restaurantName.toLowerCase().includes(searchText) ||
                    review.content.toLowerCase().includes(searchText) ||
                    review.category.toLowerCase().includes(searchText);
            }

            return true;
        });

        // 정렬
        switch (sortBy) {
            case 'recent':
                // 방문일 기준 최신순
                filteredReviews.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
                break;
            case 'rating-high':
                // 평점 높은순
                filteredReviews.sort((a, b) => b.rating - a.rating);
                break;
            case 'rating-low':
                // 평점 낮은순
                filteredReviews.sort((a, b) => a.rating - b.rating);
                break;
            case 'likes':
                // 좋아요 많은순
                filteredReviews.sort((a, b) => b.likes - a.likes);
                break;
        }

        renderAllReviews(filteredReviews);
    }

    // 내 리뷰 렌더링 함수
    function renderMyReviews(reviews) {
        const myReviewsContainer = document.getElementById('my-reviews-container');
        const emptyReviews = document.querySelector('#my-reviews .empty-reviews');

        if (!myReviewsContainer) return;

        if (reviews.length === 0) {
            myReviewsContainer.style.display = 'none';
            if (emptyReviews) {
                emptyReviews.style.display = 'block';
            }
            return;
        }

        if (emptyReviews) {
            emptyReviews.style.display = 'none';
        }
        myReviewsContainer.style.display = 'flex';

        myReviewsContainer.innerHTML = '';

        reviews.forEach(review => {
            const reviewElement = createMyReviewElement(review);
            myReviewsContainer.appendChild(reviewElement);
        });
    }

    // 모든 리뷰 렌더링 함수
    function renderAllReviews(reviews) {
        const allReviewsContainer = document.getElementById('all-reviews-container');

        if (!allReviewsContainer) return;

        allReviewsContainer.innerHTML = '';

        if (reviews.length === 0) {
            allReviewsContainer.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
            return;
        }

        reviews.forEach(review => {
            const reviewElement = createAllReviewElement(review);
            allReviewsContainer.appendChild(reviewElement);
        });
    }

    // 내 리뷰 항목 생성 함수
    function createMyReviewElement(review) {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        reviewItem.dataset.id = review.id;

        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(review.rating)) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else if (i === Math.ceil(review.rating) && !Number.isInteger(review.rating)) {
                starsHtml += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }

        let imagesHtml = '';
        if (review.images && review.images.length > 0) {
            imagesHtml = '<div class="review-images">';
            review.images.forEach(image => {
                imagesHtml += `<img src="${image}" alt="리뷰 이미지">`;
            });
            imagesHtml += '</div>';
        }

        const visitDate = new Date(review.visitDate);
        const formattedDate = `${visitDate.getFullYear()}.${String(visitDate.getMonth() + 1).padStart(2, '0')}.${String(visitDate.getDate()).padStart(2, '0')}`;

        reviewItem.innerHTML = `
            <div class="review-header">
                <div class="restaurant-info">
                    <h3>${review.restaurantName}</h3>
                    <p class="category">${review.category} • ${review.location}</p>
                </div>
                <div class="review-rating">
                    <div class="stars">
                        ${starsHtml}
                    </div>
                    <span>${review.rating.toFixed(1)}</span>
                </div>
            </div>
            <div class="review-content">
                <p>${review.content}</p>
            </div>
            ${imagesHtml}
            <div class="review-footer">
                <span class="review-date">${formattedDate} 방문</span>
                <div class="review-actions">
                    <button class="btn-edit"><i class="fas fa-edit"></i> 수정</button>
                    <button class="btn-delete"><i class="fas fa-trash-alt"></i> 삭제</button>
                </div>
            </div>
        `;

        // 수정 버튼 이벤트
        const editBtn = reviewItem.querySelector('.btn-edit');
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                editReview(review.id);
            });
        }

        // 삭제 버튼 이벤트
        const deleteBtn = reviewItem.querySelector('.btn-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                deleteReview(review.id);
            });
        }

        return reviewItem;
    }

    // 모든 리뷰 항목 생성 함수
    function createAllReviewElement(review) {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        reviewItem.dataset.id = review.id;

        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(review.rating)) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else if (i === Math.ceil(review.rating) && !Number.isInteger(review.rating)) {
                starsHtml += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }

        let imagesHtml = '';
        if (review.images && review.images.length > 0) {
            imagesHtml = '<div class="review-images">';
            review.images.forEach(image => {
                imagesHtml += `<img src="${image}" alt="리뷰 이미지">`;
            });
            imagesHtml += '</div>';
        }

        const visitDate = new Date(review.visitDate);
        const formattedDate = `${visitDate.getFullYear()}.${String(visitDate.getMonth() + 1).padStart(2, '0')}.${String(visitDate.getDate()).padStart(2, '0')}`;

        reviewItem.innerHTML = `
            <div class="review-header">
                <div class="restaurant-info">
                    <h3>${review.restaurantName}</h3>
                    <p class="category">${review.category} • ${review.location}</p>
                </div>
                <div class="review-rating">
                    <div class="stars">
                        ${starsHtml}
                    </div>
                    <span>${review.rating.toFixed(1)}</span>
                </div>
            </div>
            <div class="reviewer-info">
                <img src="${review.reviewer.image}" alt="프로필 이미지" class="reviewer-img">
                <span class="reviewer-name">${review.reviewer.name}</span>
                <span class="review-date">${formattedDate} 방문</span>
            </div>
            <div class="review-content">
                <p>${review.content}</p>
            </div>
            ${imagesHtml}
            <div class="review-footer">
                <div class="review-reactions">
                    <button class="btn-like">
                        <i class="far fa-thumbs-up"></i> 
                        <span>${review.likes}</span>
                    </button>
                    <button class="btn-comment">
                        <i class="far fa-comment"></i>
                        <span>${review.comments}</span>
                    </button>
                </div>
            </div>
        `;

        // 좋아요 버튼 이벤트
        const likeBtn = reviewItem.querySelector('.btn-like');
        if (likeBtn) {
            likeBtn.addEventListener('click', function() {
                toggleLike(review.id, this);
            });
        }

        // 댓글 버튼 이벤트
        const commentBtn = reviewItem.querySelector('.btn-comment');
        if (commentBtn) {
            commentBtn.addEventListener('click', function() {
                showComments(review.id);
            });
        }

        return reviewItem;
    }

    // 리뷰 수정 함수
    function editReview(reviewId) {
        // 실제로는 수정 페이지로 이동 또는 모달 표시
        showNotification('리뷰 수정 기능은 준비 중입니다.');

        // 리뷰 작성 탭으로 전환하고 폼에 기존 데이터 채우기
        const review = myReviewsData.find(r => r.id === reviewId);
        if (review) {
            // 리뷰 작성 탭으로 전환
            document.querySelector('.review-tab[data-tab="write-review"]').click();

            // 폼에 데이터 채우기
            const restaurantSelect = document.getElementById('restaurant-select');
            const visitDate = document.getElementById('visit-date');
            const ratingValue = document.getElementById('rating-value');
            const reviewText = document.getElementById('review-text');

            if (restaurantSelect) restaurantSelect.value = review.restaurantId;
            if (visitDate) visitDate.value = review.visitDate;
            if (ratingValue) ratingValue.value = review.rating;
            if (reviewText) reviewText.value = review.content;

            // 별점 시각적 표시
            updateRatingStars(review.rating);

            // 이미지 미리보기 (실제 구현에서는 더 복잡할 수 있음)
            // ...

            // 폼 제출 시 기존 리뷰 업데이트
            const reviewForm = document.getElementById('review-form');
            if (reviewForm) {
                reviewForm.dataset.editingId = reviewId;
            }
        }
    }

    // 별점 시각적 표시 업데이트
    function updateRatingStars(rating) {
        const stars = document.querySelectorAll('.rating-input i');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.className = 'fas fa-star';
            } else {
                star.className = 'far fa-star';
            }
        });
    }

    // 리뷰 삭제 함수
    function deleteReview(reviewId) {
        // 실제로는 서버 API 호출
        if (confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
            // 데이터에서 제거
            const index = myReviewsData.findIndex(r => r.id === reviewId);
            if (index !== -1) {
                myReviewsData.splice(index, 1);

                // UI 업데이트
                renderMyReviews(myReviewsData);

                showNotification('리뷰가 삭제되었습니다.');
            }
        }
    }

    // 좋아요 토글 함수
    function toggleLike(reviewId, button) {
        // 실제로는 서버 API 호출
        const review = allReviewsData.find(r => r.id === reviewId);
        if (review) {
            // 아이콘 변경
            const icon = button.querySelector('i');
            const count = button.querySelector('span');

            if (icon.classList.contains('far')) {
                // 좋아요 추가
                icon.classList.remove('far');
                icon.classList.add('fas');
                count.textContent = parseInt(count.textContent) + 1;
                review.likes++;
                showNotification('좋아요를 눌렀습니다.');
            } else {
                // 좋아요 취소
                icon.classList.remove('fas');
                icon.classList.add('far');
                count.textContent = parseInt(count.textContent) - 1;
                review.likes--;
                showNotification('좋아요를 취소했습니다.');
            }
        }
    }

    // 댓글 표시 함수
    function showComments(reviewId) {
        // 실제로는 댓글 목록 표시 모달 등
        showNotification('댓글 기능은 준비 중입니다.');
    }

    // 리뷰 작성 탭 기능
    const ratingStars = document.querySelectorAll('.rating-input i');
    const ratingValue = document.getElementById('rating-value');
    const reviewText = document.getElementById('review-text');
    const charCount = document.getElementById('char-count');
    const imageUpload = document.getElementById('review-image');
    const imagePreview = document.getElementById('image-preview');
    const reviewForm = document.getElementById('review-form');

    // 별점 선택 기능
    if (ratingStars.length > 0) {
        ratingStars.forEach(star => {
            star.addEventListener('mouseover', function() {
                const rating = parseInt(this.dataset.rating);

                // 마우스 오버된 별점까지 채우기
                ratingStars.forEach((s, index) => {
                    if (index < rating) {
                        s.className = 'fas fa-star';
                    } else {
                        s.className = 'far fa-star';
                    }
                });
            });

            star.addEventListener('mouseout', function() {
                const currentRating = parseInt(ratingValue.value) || 0;

                // 현재 선택된 별점으로 되돌리기
                ratingStars.forEach((s, index) => {
                    if (index < currentRating) {
                        s.className = 'fas fa-star';
                    } else {
                        s.className = 'far fa-star';
                    }
                });
            });

            star.addEventListener('click', function() {
                const rating = parseInt(this.dataset.rating);
                ratingValue.value = rating;

                // 클릭된 별점 유지
                ratingStars.forEach((s, index) => {
                    if (index < rating) {
                        s.className = 'fas fa-star';
                    } else {
                        s.className = 'far fa-star';
                    }
                });
            });
        });
    }

    // 리뷰 글자수 카운트
    if (reviewText) {
        reviewText.addEventListener('input', function() {
            const length = this.value.length;
            if (charCount) {
                charCount.textContent = length;

                // 글자수 제한 (500자)
                if (length > 500) {
                    this.value = this.value.substring(0, 500);
                    charCount.textContent = 500;
                }
            }
        });
    }

    // 이미지 미리보기 기능
    if (imageUpload) {
        imageUpload.addEventListener('change', function() {
            if (!imagePreview) return;

            // 기존 미리보기 삭제
            imagePreview.innerHTML = '';

            // 최대 5장까지만 선택 가능
            const maxFiles = 5;
            const files = Array.from(this.files).slice(0, maxFiles);

            if (files.length > maxFiles) {
                showNotification(`최대 ${maxFiles}장까지만 업로드 가능합니다.`, 'error');
            }

            // 파일 미리보기 생성
            files.forEach(file => {
                if (!file.type.startsWith('image/')) return;

                const reader = new FileReader();

                reader.onload = function(e) {
                    const previewItem = document.createElement('div');
                    previewItem.className = 'image-preview-item';

                    previewItem.innerHTML = `
                        <img src="${e.target.result}" alt="이미지 미리보기">
                        <button class="remove-image"><i class="fas fa-times"></i></button>
                    `;

                    // 이미지 삭제 버튼 이벤트
                    const removeBtn = previewItem.querySelector('.remove-image');
                    removeBtn.addEventListener('click', function() {
                        previewItem.remove();
                        // 실제로는 파일 input의 값을 조작해야 함 (복잡한 작업)
                    });

                    imagePreview.appendChild(previewItem);
                };

                reader.readAsDataURL(file);
            });
        });
    }

    // 리뷰 작성 폼 제출 처리
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const restaurantId = document.getElementById('restaurant-select').value;
            const visitDate = document.getElementById('visit-date').value;
            const rating = document.getElementById('rating-value').value;
            const content = document.getElementById('review-text').value;

            // 유효성 검사
            if (!restaurantId) {
                showNotification('식당을 선택해주세요.', 'error');
                return;
            }

            if (!visitDate) {
                showNotification('방문 날짜를 선택해주세요.', 'error');
                return;
            }

            if (!rating || rating === '0') {
                showNotification('별점을 선택해주세요.', 'error');
                return;
            }

            if (!content.trim()) {
                showNotification('리뷰 내용을 입력해주세요.', 'error');
                return;
            }

            // 수정 모드인지 확인
            const editingId = parseInt(this.dataset.editingId) || null;

            if (editingId) {
                // 기존 리뷰 수정
                const index = myReviewsData.findIndex(r => r.id === editingId);
                if (index !== -1) {
                    // 현재 선택된 레스토랑 정보 가져오기
                    const restaurant = {
                        id: parseInt(restaurantId),
                        name: document.getElementById('restaurant-select').options[document.getElementById('restaurant-select').selectedIndex].text,
                        category: '한식', // 실제로는 선택된 레스토랑의 카테고리 가져와야 함
                        location: '강남구' // 실제로는 선택된 레스토랑의 위치 가져와야 함
                    };

                    // 리뷰 데이터 업데이트
                    myReviewsData[index] = {
                        ...myReviewsData[index],
                        restaurantId: restaurant.id,
                        restaurantName: restaurant.name,
                        category: restaurant.category,
                        location: restaurant.location,
                        rating: parseFloat(rating),
                        content: content.trim(),
                        visitDate: visitDate,
                        // 이미지는 복잡하므로 예시에서는 그대로 유지
                    };

                    // UI 업데이트
                    renderMyReviews(myReviewsData);

                    showNotification('리뷰가 수정되었습니다.');
                }
            } else {
                // 새 리뷰 작성
                const newId = myReviewsData.length > 0 ? Math.max(...myReviewsData.map(r => r.id)) + 1 : 1;

                // 현재 선택된 레스토랑 정보 가져오기
                const restaurant = {
                    id: parseInt(restaurantId),
                    name: document.getElementById('restaurant-select').options[document.getElementById('restaurant-select').selectedIndex].text,
                    category: '한식', // 실제로는 선택된 레스토랑의 카테고리 가져와야 함
                    location: '강남구' // 실제로는 선택된 레스토랑의 위치 가져와야 함
                };

                // 새 리뷰 데이터 추가
                const newReview = {
                    id: newId,
                    restaurantId: restaurant.id,
                    restaurantName: restaurant.name,
                    category: restaurant.category,
                    location: restaurant.location,
                    rating: parseFloat(rating),
                    content: content.trim(),
                    visitDate: visitDate,
                    images: [] // 실제로는 업로드된 이미지 URL을 추가해야 함
                };

                myReviewsData.unshift(newReview);

                // UI 업데이트
                renderMyReviews(myReviewsData);

                showNotification('리뷰가 등록되었습니다.');
            }

            // 폼 초기화
            this.reset();
            ratingValue.value = '0';
            if (charCount) charCount.textContent = '0';
            if (imagePreview) imagePreview.innerHTML = '';
            ratingStars.forEach(star => star.className = 'far fa-star');
            delete this.dataset.editingId;

            // 내 리뷰 탭으로 전환
            setTimeout(() => {
                document.querySelector('.review-tab[data-tab="my-reviews"]').click();
            }, 500);
        });
    }

    // 식당 검색 버튼 이벤트
    const restaurantSearchBtn = document.getElementById('restaurant-search');
    if (restaurantSearchBtn) {
        restaurantSearchBtn.addEventListener('click', function() {
            // 실제로는 식당 검색 모달 표시
            showNotification('식당 검색 기능은 준비 중입니다.');
        });
    }

    // "리뷰 작성하기" 버튼 클릭 시 리뷰 작성 탭으로 전환
    const startReviewBtn = document.getElementById('start-review');
    if (startReviewBtn) {
        startReviewBtn.addEventListener('click', function() {
            document.querySelector('.review-tab[data-tab="write-review"]').click();
        });
    }

    // 페이지네이션 기능
    const prevBtns = document.querySelectorAll('.pagination-btn.prev');
    const nextBtns = document.querySelectorAll('.pagination-btn.next');
    const pageNumbersContainers = document.querySelectorAll('.page-numbers');

    // 각 페이지네이션에 이벤트 추가
    pageNumbersContainers.forEach(container => {
        const pageNumbers = container.querySelectorAll('.page-number');

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
    });

    // 이전/다음 페이지 버튼 이벤트
    prevBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const container = this.closest('.pagination').querySelector('.page-numbers');
            const currentPage = container.querySelector('.page-number.active');
            const prevPage = currentPage.previousElementSibling;

            if (prevPage && prevPage.classList.contains('page-number')) {
                prevPage.click();
            }
        });
    });

    nextBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const container = this.closest('.pagination').querySelector('.page-numbers');
            const currentPage = container.querySelector('.page-number.active');
            const nextPage = currentPage.nextElementSibling;

            if (nextPage && nextPage.classList.contains('page-number')) {
                nextPage.click();
            }
        });
    });

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