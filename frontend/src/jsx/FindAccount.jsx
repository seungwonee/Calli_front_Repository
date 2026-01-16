import React, { useState, useEffect } from 'react';
import '../css/FindAccount.css';

// 디자인 및 슬라이드 자산 이미지 임포트
import slide1 from '../assets/slide1.png';
import slide2 from '../assets/slide2.png';
import slide3 from '../assets/slide3.png';


/**
 * 아이디/비밀번호 찾기 화면 컴포넌트
 * @param {Function} onGoLogin - '로그인으로' 버튼 클릭 시 로그인 화면으로 이동하는 함수
 */
export default function FindAccount({ onGoLogin }) {
    // 탭 상태 관리: 아이디 찾기가 첫 화면
    const [recoveryType, setRecoveryType] = useState('id');
    // 비밀번호 재설정 단계 여부 (PW 찾기 후 단계)
    const [isResetStage, setIsResetStage] = useState(false);

    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');

    // 입력 폼 상태 관리
    const [userId, setUserId] = useState('');
    const [idError, setIdError] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [pwError, setPwError] = useState('');
    const [matchError, setMatchError] = useState('');

    // 우측 이미지 영역 슬라이드쇼를 위한 상태 및 이미지 리스트
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = [slide1, slide2, slide3];

    // 3초마다 슬라이드 이미지를 자동으로 변경하는 타이머 설정
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [slides.length]);

    // 아이디 입력 및 유효성 검사 핸들러
    // 아이디 입력 및 유효성 검사 핸들러
    const handleIdChange = (e) => {
        const val = e.target.value;
        setUserId(val);

        const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
        if (koreanRegex.test(val)) {
            setIdError('아이디는 영문, 숫자, 특수문자만 입력 가능합니다.');
        } else {
            setIdError('');
        }
    };

    const handleNameChange = (e) => setUserName(e.target.value);
    const handleEmailChange = (e) => setUserEmail(e.target.value);

    // 비밀번호 규칙 검사 (영문+숫자 8자 이상)
    const handlePwChange = (e) => {
        const val = e.target.value;
        setNewPw(val);

        const pwRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
        if (!val) {
            setPwError("");
        } else if (!pwRegex.test(val)) {
            setPwError("영문+숫자 포함 8자 이상이어야 합니다.");
        } else {
            setPwError("");
        }

        // 비밀번호 변경 시 확인 필드와 일치 여부 재확인
        if (confirmPw && val !== confirmPw) {
            setMatchError("비밀번호가 일치하지 않습니다.");
        } else {
            setMatchError("");
        }
    };

    // 비밀번호 확인 일치 검사
    const handleConfirmPwChange = (e) => {
        const val = e.target.value;
        setConfirmPw(val);

        if (!val) {
            setMatchError("");
        } else if (newPw && val !== newPw) {
            setMatchError("비밀번호가 일치하지 않습니다.");
        } else {
            setMatchError("");
        }
    };

    /**
     * 찾기 버튼 클릭 시 처리 (임시로 재설정 단계로 전환)
     */
    /**
     * 찾기 버튼 클릭 시 처리 (임시로 재설정 단계로 전환)
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        // 유효성 검사 에러 체크
        if (idError && recoveryType === 'pw' && !isResetStage) { return; }
        if (isResetStage && (pwError || matchError || !newPw || !confirmPw)) {
            if (!newPw || !confirmPw) alert("비밀번호를 입력해주세요.");
            return;
        }

        if (recoveryType === 'pw' && !isResetStage) {
            // [검증 로직] 아이디, 이름, 이메일이 모두 입력되었는지 확인 (버튼이 disabled여도 한 번 더 체크)
            if (!userId || !userName || !userEmail) {
                alert("아이디, 이름, 이메일을 모두 입력해주세요.");
                return;
            }

            // TODO: 여기서 백엔드 API 호출하여 사용자 정보 확인 (아이디, 이름, 이메일 일치 여부)
            // 성공 했다고 가정하고 다음 단계로 진행
            // alert("사용자 정보를 확인했습니다. 비밀번호를 재설정해주세요.");

            setIsResetStage(true); // 비밀번호 찾기 1단계 성공 시 재설정 단계로 이동
            setNewPw(''); // 새 단계 진입 시 초기화
            setConfirmPw('');
            setPwError('');
            setMatchError('');
        } else {
            // 아이디 찾기 완료 또는 비밀번호 재설정 완료 처리 로직
            alert(`${recoveryType === 'id' ? '아이디 찾기' : '비밀번호 재설정'}가 완료되었습니다.`);
            onGoLogin();
        }
    };

    /**
     * 탭 변경 핸들러 (재설정 단계 초기화)
     */
    const handleTabChange = (type) => {
        setRecoveryType(type);
        setIsResetStage(false);
        setIsResetStage(false);
        setUserId(''); // 탭 변경 시 입력 초기화
        setUserName('');
        setUserEmail('');
        setIdError('');
        setNewPw('');
        setConfirmPw('');
        setPwError('');
        setMatchError('');
    };

    return (
        <div className="recovery-screen-inner">
            <div className="recovery-card">

                {/* 1. 왼쪽: 탭 및 입력 폼 영역 */}
                <div className="recovery-left">
                    <div className="recovery-header">
                        <h1 className="recovery-logo-text">Calli For You</h1>
                        <p className="recovery-subtitle">make my calligraphy</p>
                    </div>

                    {/* 아이디/비밀번호 찾기 탭 버튼 그룹 */}
                    <div className="recovery-tabs">
                        <button
                            className={`tab-button ${recoveryType === 'id' ? 'active' : ''}`}
                            onClick={() => handleTabChange('id')}
                        >
                            아이디 찾기
                        </button>
                        <button
                            className={`tab-button ${recoveryType === 'pw' ? 'active' : ''}`}
                            onClick={() => handleTabChange('pw')}
                        >
                            비밀번호 찾기
                        </button>
                    </div>

                    {/* 입력 폼 영역 */}
                    <form className="recovery-form" onSubmit={handleSubmit}>
                        <div className="recovery-inputs-area">
                            {!isResetStage ? (
                                <>
                                    {/* 찾기 모드 (아이디 또는 비밀번호 기본 정보 입력) */}
                                    {recoveryType === 'pw' && (
                                        <div className="input-group">
                                            <label htmlFor="recoveryId">아이디</label>
                                            <input
                                                type="text"
                                                id="recoveryId"
                                                placeholder="아이디를 입력하세요"
                                                value={userId}
                                                onChange={handleIdChange}
                                            />
                                            {idError && <span style={{ color: '#ff4d4f', fontSize: '13px', marginTop: '4px', textAlign: 'left' }}>{idError}</span>}
                                        </div>
                                    )}
                                    <div className="input-group">
                                        <label htmlFor="recoveryName">이름</label>
                                        <input
                                            type="text"
                                            id="recoveryName"
                                            placeholder="이름을 입력하세요"
                                            value={userName}
                                            onChange={handleNameChange}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="recoveryEmail">이메일</label>
                                        <input
                                            type="email"
                                            id="recoveryEmail"
                                            placeholder="이메일을 입력하세요"
                                            value={userEmail}
                                            onChange={handleEmailChange}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* 비밀번호 재설정 모드 (비밀번호 찾기 버튼 클릭 후) */}
                                    <div className="input-group">
                                        <label htmlFor="newPw">새 비밀번호</label>
                                        <input
                                            type="password"
                                            id="newPw"
                                            autoComplete="new-password"
                                            placeholder="영문, 숫자 포함 8자 이상"
                                            value={newPw}
                                            onChange={handlePwChange}
                                        />
                                        {pwError && <span style={{ color: '#ff4d4f', fontSize: '13px', marginTop: '4px', textAlign: 'left' }}>{pwError}</span>}
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="confirmNewPw">새 비밀번호 확인</label>
                                        <input
                                            type="password"
                                            id="confirmNewPw"
                                            autoComplete="new-password"
                                            placeholder="새 비밀번호를 다시 입력하세요"
                                            value={confirmPw}
                                            onChange={handleConfirmPwChange}
                                        />
                                        {matchError && <span style={{ color: '#ff4d4f', fontSize: '13px', marginTop: '4px', textAlign: 'left' }}>{matchError}</span>}
                                    </div>
                                    {/* 아이디 찾기 폼과 높이를 맞추기 위한 빈 공간 (선택 사항) */}
                                    <div className="input-group" style={{ visibility: 'hidden' }}>
                                        <label>Spacer</label>
                                        <input type="text" />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* 실행 버튼 (전체 폼 높이가 고정되어 있어 버튼 위치는 항상 일정함) */}
                        <button
                            type="submit"
                            className="recovery-submit-button"
                            disabled={
                                // 비밀번호 찾기 1단계(정보 입력)일 때, 3가지 정보 중 하나라도 없으면 비활성화
                                (recoveryType === 'pw' && !isResetStage && (!userId || !userName || !userEmail)) ||
                                // 비밀번호 재설정 단계일 때, 값이 없거나 에러가 있으면 비활성화 (선택적)
                                (isResetStage && (!newPw || !confirmPw || pwError || matchError))
                            }
                            style={{
                                opacity: (recoveryType === 'pw' && !isResetStage && (!userId || !userName || !userEmail)) ? 0.5 : 1,
                                cursor: (recoveryType === 'pw' && !isResetStage && (!userId || !userName || !userEmail)) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isResetStage ? '비밀번호 변경하기' : (recoveryType === 'id' ? '아이디 찾기' : '비밀번호 찾기')}
                        </button>
                    </form>
                </div>

                {/* 2. 오른쪽: 슬라이드쇼 이미지 영역 */}
                <div className="recovery-right">
                    <div className="recovery-slideshow-container">
                        {slides.map((slide, index) => (
                            <img
                                key={index}
                                src={slide}
                                alt={`Sample ${index + 1}`}
                                className={`recovery-slide-img ${index === currentSlide ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
