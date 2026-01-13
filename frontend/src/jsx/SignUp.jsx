
import React, { useState } from 'react';
import '../css/SignUp.css';
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from './termsData';

// 중복 체크를 위한 가상 사용자 데이터 (시뮬레이션용)
const existingUsers = [
    { id: 'admin', email: 'admin@example.com' },
    { id: 'user123', email: 'user1@example.com' }
];

/**
 * 회원가입 화면 컴포넌트 (이미지 없는 확장 레이아웃 버전)
 * @param {Function} onGoLogin - '로그인으로' 버튼 클릭 시 로그인 화면으로 이동하는 함수
 */
export default function SignUp({ onGoLogin }) {
    // 약관 모달 상태 관리
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        content: ''
    });

    const openModal = (title, content) => {
        setModalState({
            isOpen: true,
            title,
            content
        });
    };

    const closeModal = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    };

    // 폼 입력 데이터 상태 관리
    const [formData, setFormData] = useState({
        userId: '',
        password: '',
        passwordConfirm: '',
        name: '',
        email: '',
        phone: ''
    });

    // 약관 동의 상태 관리
    const [agreements, setAgreements] = useState({
        terms: false,
        privacy: false
    });

    // 에러 메시지 상태 관리
    const [errors, setErrors] = useState({});

    // 아이디 중복 확인 결과 상태
    const [idCheckResult, setIdCheckResult] = useState('');

    const handleCheckId = () => {
        if (!formData.userId) {
            setErrors(prev => ({ ...prev, userId: "아이디를 입력해주세요." }));
            return;
        }
        if (errors.userId && !errors.userId.includes("사용 중")) { // 형식 에러가 있으면 중단
            return;
        }

        if (existingUsers.some(user => user.id === formData.userId)) {
            setErrors(prev => ({ ...prev, userId: "이미 사용 중인 아이디입니다." }));
            setIdCheckResult('');
        } else {
            setErrors(prev => ({ ...prev, userId: "" }));
            setIdCheckResult("사용 가능한 아이디입니다.");
        }
    };

    // 유효성 검사 로직 (개별 필드 또는 전체 검사 가능)
    const runValidation = (name, value, currentFormData) => {
        const newErrors = { ...errors };
        const data = currentFormData || formData;
        const val = value !== undefined ? value : data[name];

        if (name === 'userId') {
            const idRegex = /^[a-zA-Z0-9]{4,}$/;
            if (!val) {
                newErrors.userId = ""; // 초기화
            } else if (!idRegex.test(val)) {
                newErrors.userId = "아이디는 영문자와 숫자 조합으로 4자 이상이어야 합니다.";
            } else {
                newErrors.userId = "";
            }
        }

        if (name === 'password' || name === 'passwordConfirm') {
            const pwRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
            const targetPw = name === 'password' ? val : data.password;
            const targetConfirm = name === 'passwordConfirm' ? val : data.passwordConfirm;

            // 비밀번호 규칙 검사
            if (name === 'password') {
                if (!val) newErrors.password = "";
                else if (!pwRegex.test(val)) {
                    newErrors.password = "비밀번호는 영문자와 숫자를 포함하여 8자 이상이어야 합니다.";
                } else {
                    newErrors.password = "";
                }
            }

            // 비밀번호 확인 일치 검사
            if (targetPw && targetConfirm && targetPw !== targetConfirm) {
                newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
            } else {
                newErrors.passwordConfirm = "";
            }
        }

        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!val) {
                newErrors.email = "";
            } else if (!emailRegex.test(val)) {
                newErrors.email = "올바른 이메일 형식이 아닙니다.";
            } else if (existingUsers.some(user => user.email === val)) {
                newErrors.email = "이미 등록된 이메일 주소입니다.";
            } else {
                newErrors.email = "";
            }
        }

        setErrors(newErrors);
        return newErrors;
    };

    // 입력 값 변경 핸들러
    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;

        if (type === 'checkbox') {
            const key = id === 'termsAgree' ? 'terms' : 'privacy';
            setAgreements(prev => ({ ...prev, [key]: checked }));
            return;
        }

        const keyMap = {
            signupId: 'userId',
            signupPw: 'password',
            signupPwConfirm: 'passwordConfirm',
            signupName: 'name',
            signupEmail: 'email',
            signupPhone: 'phone'
        };
        const key = keyMap[id];
        const newFormData = { ...formData, [key]: value };
        setFormData(newFormData);

        if (key === 'userId') {
            setIdCheckResult(''); // 아이디 변경 시 중복 확인 초기화
        }

        // 실시간 유효성 검사 실행
        runValidation(key, value, newFormData);
    };

    // 폼 전체 유효성 검사 (제출 시)
    const validateAll = () => {
        let currentErrors = { ...errors };
        // 모든 필드에 대해 검사 로직 재실행
        const fields = ['userId', 'password', 'passwordConfirm', 'email'];
        fields.forEach(field => {
            currentErrors = runValidation(field, formData[field], formData);
        });

        const hasErrors = Object.values(currentErrors).some(msg => msg !== "");
        return !hasErrors;
    };

    // 가입 버튼 활성화 조건 체크 (필수값 입력 + 에러 없음 + 약관 동의)
    const isFormIncomplete =
        !formData.userId ||
        !formData.password ||
        !formData.passwordConfirm ||
        !formData.name ||
        !formData.email ||
        !agreements.terms ||
        !agreements.privacy ||
        Object.values(errors).some(msg => msg !== "");

    // 폼 제출 핸들러
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isFormIncomplete && validateAll()) {
            alert("회원가입이 완료되었습니다!");
            onGoLogin();
        }
    };

    return (
        <div className="signup-screen-inner">
            <div className="signup-card full-width">

                {/* 1. 회원가입 정보 입력 폼 영역 (전체 너비 사용) */}
                <div className="signup-content">

                    {/* 헤더 섹션: 로고 및 타이틀 */}
                    <div className="signup-header">
                        <h1 className="signup-logo-text">Calli For You</h1>
                        <p className="signup-subtitle">make my calligraphy</p>
                    </div>

                    <p className="required-info-text" style={{ fontSize: '13px', color: '#ff4d94', marginBottom: '20px' }}>
                        *표시는 필수 입력 항목입니다.
                    </p>

                    {/* 회원가입 입력 폼 (그리드 레이아웃 적용으로 스크롤 방지) */}
                    <form className="signup-form-full" onSubmit={handleSubmit} noValidate>
                        <div className="signup-fields-grid">
                            {/* 왼쪽 열: 계정 관련 */}
                            <div className="grid-column">
                                <div className="signup-input-group">
                                    <label htmlFor="signupId">아이디 <span className="required">*</span></label>
                                    <div className="input-with-button">
                                        <input
                                            type="text"
                                            id="signupId"
                                            placeholder="영문, 숫자 4자 이상"
                                            value={formData.userId}
                                            onChange={handleChange}
                                            className={errors.userId ? 'input-error' : ''}
                                            required
                                        />
                                        <button type="button" className="check-btn" onClick={handleCheckId}>중복확인</button>
                                    </div>
                                    {errors.userId && <span className="error-msg">{errors.userId}</span>}
                                    {idCheckResult && <span className="success-msg">{idCheckResult}</span>}
                                </div>

                                <div className="signup-input-group">
                                    <label htmlFor="signupPw">비밀번호 <span className="required">*</span></label>
                                    <input
                                        type="password"
                                        id="signupPw"
                                        placeholder="영문, 숫자 포함 8자 이상"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={errors.password ? 'input-error' : ''}
                                        required
                                    />
                                    {errors.password && <span className="error-msg">{errors.password}</span>}
                                </div>

                                <div className="signup-input-group">
                                    <label htmlFor="signupPwConfirm">비밀번호 확인 <span className="required">*</span></label>
                                    <input
                                        type="password"
                                        id="signupPwConfirm"
                                        placeholder="비밀번호를 다시 입력하세요"
                                        value={formData.passwordConfirm}
                                        onChange={handleChange}
                                        className={errors.passwordConfirm ? 'input-error' : ''}
                                        required
                                    />
                                    {errors.passwordConfirm && <span className="error-msg">{errors.passwordConfirm}</span>}
                                </div>
                            </div>

                            {/* 오른쪽 열: 개인 정보 관련 */}
                            <div className="grid-column">
                                <div className="signup-input-group">
                                    <label htmlFor="signupName">이름 <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        id="signupName"
                                        placeholder="이름을 입력하세요"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="signup-input-group">
                                    <label htmlFor="signupEmail">이메일 <span className="required">*</span></label>
                                    <input
                                        type="email"
                                        id="signupEmail"
                                        placeholder="example@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={errors.email ? 'input-error' : ''}
                                        required
                                    />
                                    {errors.email && <span className="error-msg">{errors.email}</span>}
                                </div>

                                <div className="signup-input-group">
                                    <label htmlFor="signupPhone">휴대폰 번호</label>
                                    <input
                                        type="tel"
                                        id="signupPhone"
                                        placeholder="01012345678"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                    <p style={{ fontSize: '13px', color: '#888' }}>
                                        * 하이픈(-) 제외 11자리 숫자만 입력해주세요.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 하단 영역: 약관 동의 및 가입 버튼 */}
                        <div className="signup-bottom-area">
                            <div className="signup-agreements-horizontal">
                                <div className="agreement-item">
                                    <label className="signup-checkbox-label">
                                        <input
                                            type="checkbox"
                                            id="termsAgree"
                                            checked={agreements.terms}
                                            onChange={handleChange}
                                            required
                                        />
                                        <span>이용약관 동의 <span className="required">*</span></span>
                                    </label>
                                    <button type="button" className="view-terms-btn" onClick={() => openModal('이용약관', TERMS_OF_SERVICE)}>내용 보기</button>
                                </div>
                                <div className="agreement-item">
                                    <label className="signup-checkbox-label">
                                        <input
                                            type="checkbox"
                                            id="privacyAgree"
                                            checked={agreements.privacy}
                                            onChange={handleChange}
                                            required
                                        />
                                        <span>개인정보처리방침 동의 <span className="required">*</span></span>
                                    </label>
                                    <button type="button" className="view-terms-btn" onClick={() => openModal('개인정보처리방침', PRIVACY_POLICY)}>내용 보기</button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="signup-submit-button"
                                disabled={isFormIncomplete}
                            >
                                Sign Up
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* 약관 모달 */}
            {modalState.isOpen && (
                <div className="signup-modal-overlay" onClick={closeModal}>
                    <div className="signup-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{modalState.title}</h3>
                        </div>
                        <div className="modal-body">
                            <pre className="terms-text">{modalState.content}</pre>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-bottom-close-btn" onClick={closeModal}>닫기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}