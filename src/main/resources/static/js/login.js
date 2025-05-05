document.addEventListener('DOMContentLoaded', function() {
    // 로그인 탭 전환 기능
    const loginTabs = document.querySelectorAll('.login-tab');
    const formContainers = document.querySelectorAll('.login-form-container');

    loginTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 탭 활성화 상태 변경
            loginTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // 해당 폼 컨테이너 표시
            const targetTabId = this.dataset.tab;
            formContainers.forEach(container => {
                container.classList.remove('active');
                if (container.id === targetTabId) {
                    container.classList.add('active');
                }
            });
        });
    });

    // 로그인 폼 제출 처리
    const loginForm = document.getElementById('login-form-element');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const rememberMe = document.getElementById('remember-me').checked;

            // 여기서 실제 로그인 API 호출 코드가 들어갑니다
            console.log('로그인 시도:', { email, password, rememberMe });

            // 임시 로그인 성공 시뮬레이션
            showNotification('로그인 성공! 잠시 후 메인 페이지로 이동합니다.');

            // 실제 구현에서는 서버 응답 후 메인 페이지로 리다이렉트
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        });
    }

    // 회원가입 폼 제출 처리
    const signupForm = document.getElementById('signup-form-element');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const passwordConfirm = document.getElementById('signup-password-confirm').value;
            const termsAgreed = document.getElementById('terms').checked;

            // 비밀번호 유효성 검사 (8자 이상)
            if (password.length < 8) {
                showNotification('비밀번호는 8자 이상이어야 합니다.', 'error');
                return;
            }

            // 비밀번호 일치 확인
            if (password !== passwordConfirm) {
                showNotification('비밀번호가 일치하지 않습니다.', 'error');
                return;
            }

            // 약관 동의 확인
            if (!termsAgreed) {
                showNotification('이용약관에 동의해주세요.', 'error');
                return;
            }

            // 여기서 실제 회원가입 API 호출 코드가 들어갑니다
            console.log('회원가입 시도:', { name, email, password, termsAgreed });

            // 임시 회원가입 성공 시뮬레이션
            showNotification('회원가입이 완료되었습니다! 로그인해주세요.');

            // 회원가입 성공 시 로그인 탭으로 전환
            setTimeout(() => {
                document.querySelector('.login-tab[data-tab="login-form"]').click();
                signupForm.reset();
            }, 2000);
        });
    }

    // 비밀번호 찾기 버튼 이벤트
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();

            // 단순 알림으로 대체 (실제로는 모달 또는 페이지 전환)
            showNotification('비밀번호 찾기 기능은 현재 준비 중입니다.');
        });
    }

    // 이용약관 링크 이벤트
    const termsLinks = document.querySelectorAll('.terms-link');
    termsLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // 단순 알림으로 대체 (실제로는 모달 또는 페이지 전환)
            showNotification('이용약관 및 개인정보 처리방침 페이지는 현재 준비 중입니다.');
        });
    });

    // 알림 표시 함수 (main.js의 함수를 활용)
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