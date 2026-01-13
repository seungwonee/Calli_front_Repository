import React, { useState, useEffect } from 'react';
import '../css/LoginScreen.css';

// 디자인 및 슬라이드 자산 이미지 임포트
import slide1 from '../assets/slide1.png';
import slide2 from '../assets/slide2.png';
import slide3 from '../assets/slide3.png';
import kakaoIcon from '../assets/kakao.png';
import naverIcon from '../assets/naver.png';
import googleIcon from '../assets/google.png';

/**
 * 로그인 화면 컴포넌트
 * @param {Function} onGoHome - 상단 '홈으로' 버튼 클릭 시 메인 화면으로 이동하는 함수
 * @param {Function} onLoginSuccess - 로그인 성공 시 호출될 함수 (사용자 이름 전달)
 */
export default function LoginScreen({ onGoHome, onFindAccount, onSignUp, onLoginSuccess }) {
    const [userId, setUserId] = useState('');
    const [userPw, setUserPw] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // 우측 이미지 영역 슬라이드쇼를 위한 상태 및 이미지 리스트
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = [slide1, slide2, slide3];

    // 3초마다 슬라이드 이미지를 자동으로 변경하는 타이머 설정
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 3000);
        return () => clearInterval(timer); // 언마운트 시 타이머 제거
    }, [slides.length]);

    const handleLogin = (e) => {
        e.preventDefault(); // 폼 제출 기본 동작 방지

        // 1. 빈 값 체크
        if (!userId.trim() || !userPw.trim()) {
            setErrorMsg("아이디 또는 비밀번호를 입력해주세요.");
            return;
        }

        // 2. 로그인 시뮬레이션
        if (userId === 'admin' && userPw === 'admin') {
            onLoginSuccess('admin'); // 관리자 로그인
        } else if (userId === 'user1' && userPw === 'user123') {
            setErrorMsg(''); // 에러 메시지 초기화
            if (onLoginSuccess) {
                onLoginSuccess('명수마을깡패'); // 로그인 성공 처리
            } else {
                console.error("onLoginSuccess prop is missing");
            }
        } else {
            setErrorMsg("아이디 또는 비밀번호가 잘못되었습니다.");
        }
    };

    return (
        <div className="login-screen-inner">
            <div className="login-card">

                {/* 1. 왼쪽: 로그인 입력 폼 및 SNS 버튼 영역 */}
                <div className="login-left">
                    {/* 최상단 홈으로 가기 버튼
                    <button className="back-home-button" onClick={onGoHome}>
                        <img src={backIcon} alt="back" className="back-icon" />
                        <span>홈으로</span>
                    </button> */}

                    {/* 로그인 헤더: 서비스 로고 및 슬로건 */}
                    <div className="login-header">
                        <h1 className="login-logo-text">Calli For You</h1>
                        <p className="login-subtitle">make my calligraphy</p>
                    </div>

                    {/* 아이디/비밀번호 입력 폼 */}
                    <form className="login-form" onSubmit={handleLogin}>
                        <div className="input-group">
                            <label htmlFor="userId">아이디</label>
                            <input
                                type="text"
                                id="userId"
                                placeholder="아이디를 입력하세요"
                                value={userId}
                                onChange={(e) => {
                                    setUserId(e.target.value);
                                    setErrorMsg('');
                                }}
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="userPw">비밀번호</label>
                            <input
                                type="password"
                                id="userPw"
                                placeholder="비밀번호를 입력하세요"
                                value={userPw}
                                onChange={(e) => {
                                    setUserPw(e.target.value);
                                    setErrorMsg('');
                                }}
                            />
                        </div>

                        {errorMsg && <div className="error-message">{errorMsg}</div>}

                        {/* 메인 로그인 실행 버튼 */}
                        <button type="submit" className="login-main-button">Login</button>
                    </form>

                    {/* 아이디 찾기 및 회원가입 보조 링크 */}
                    <div className="login-footer-links">
                        <button className="text-button" onClick={onFindAccount}>아이디/비밀번호 찾기</button>
                        <button className="text-button" onClick={onSignUp}>회원가입</button>
                    </div>

                    {/* SNS 로그인 구분자 */}
                    <div className="sns-login-divider">
                        <span>또는</span>
                    </div>

                    {/* 카카오, 네이버, 구글 SNS 로그인 버튼 그룹 */}
                    <div className="sns-login-group">
                        <button className="sns-button kakao">
                            <img src={kakaoIcon} alt="Kakao" />
                        </button>
                        <button className="sns-button naver">
                            <img src={naverIcon} alt="Naver" />
                        </button>
                        <button className="sns-button google">
                            <img src={googleIcon} alt="Google" />
                        </button>
                    </div>
                </div>

                {/* 2. 오른쪽: 3초 간격 슬라이드쇼 이미지 영역 */}
                <div className="login-right">
                    <div className="login-slideshow-container">
                        {slides.map((slide, index) => (
                            <img
                                key={index}
                                src={slide}
                                alt={`Sample ${index + 1}`}
                                className={`login-slide-img ${index === currentSlide ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
