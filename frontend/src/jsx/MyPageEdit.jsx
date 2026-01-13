import React, { useState, useEffect } from 'react';
import '../css/MyPageEdit.css';

export default function MyPageEdit({ userName, onCancel, onSave, onWithdraw }) {
    // 초기 데이터 설정 (userName에 따라 다르게 설정)
    const [formData, setFormData] = useState({
        userId: 'user1',
        password: '',
        passwordConfirm: '',
        name: userName,
        phone: '', // 기본값 비워둠 (선택사항)
        email: ''
    });

    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawStep, setWithdrawStep] = useState(1);
    const [withdrawReason, setWithdrawReason] = useState('');
    const [customReason, setCustomReason] = useState('');

    useEffect(() => {
        // 명수마을깡패(user1)의 경우 예시 데이터
        if (userName === '명수마을깡패') {
            setFormData(prev => ({
                ...prev,
                userId: 'user1',
                email: '',
                phone: '' // 사용자가 입력 안 했다고 가정
            }));
        }
    }, [userName]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        // 유효성 검사
        if (formData.password && formData.password !== formData.passwordConfirm) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        // 저장 로직 (API 호출 대신 알림)
        alert("회원 정보가 수정되었습니다.");
        if (onSave) onSave();
    };

    const handleWithdrawClick = () => {
        setShowWithdrawModal(true);
        setWithdrawStep(1);
        setWithdrawReason('');
        setCustomReason('');
    };

    const handleCloseWithdraw = () => {
        setShowWithdrawModal(false);
    };

    const handleNextStep = () => {
        if (!withdrawReason) {
            alert("탈퇴 사유를 선택해주세요.");
            return;
        }
        if (withdrawReason === 'direct' && !customReason.trim()) {
            alert("탈퇴 사유를 입력해주세요.");
            return;
        }
        setWithdrawStep(2);
    };

    const handleFinalWithdraw = () => {
        // 실제 탈퇴 로직 호출
        if (onWithdraw) onWithdraw();
        handleCloseWithdraw();
    };

    return (
        <div className="mypage-inner">
            <div className="edit-container">
                <div className="edit-header">
                    <h1 className="edit-title">회원 정보 수정</h1>
                </div>

                <div className="edit-form">
                    {/* 아이디 */}
                    <div className="edit-row">
                        <label className="edit-label">아이디</label>
                        <div className="edit-input-wrapper">
                            <input
                                type="text"
                                className="edit-input readonly"
                                value={formData.userId}
                                readOnly
                            />
                        </div>
                    </div>

                    {/* 비밀번호 */}
                    <div className="edit-row">
                        <label className="edit-label">비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            className="edit-input"
                            placeholder="변경할 비밀번호를 입력하세요"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <p className="edit-helper-text">8자 이상의 영문과 숫자를 조합해주세요</p>
                    </div>

                    {/* 비밀번호 확인 */}
                    <div className="edit-row">
                        <label className="edit-label">비밀번호 확인</label>
                        <input
                            type="password"
                            name="passwordConfirm"
                            className="edit-input"
                            placeholder="비밀번호를 한번 더 입력하세요"
                            value={formData.passwordConfirm}
                            onChange={handleChange}
                        />
                        {formData.passwordConfirm && (
                            <p className={`validation-msg ${formData.password === formData.passwordConfirm ? 'success' : 'error'}`}>
                                {formData.password === formData.passwordConfirm ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
                            </p>
                        )}
                    </div>

                    {/* 이름 */}
                    <div className="edit-row">
                        <label className="edit-label">이름</label>
                        <div className="edit-input-wrapper">
                            <input
                                type="text"
                                name="name"
                                className="edit-input"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* 휴대폰 번호 (선택사항) */}
                    <div className="edit-row">
                        <label className="edit-label">휴대폰 번호 <span style={{ fontWeight: 'normal', fontSize: '13px', color: '#888' }}></span></label>
                        <div className="edit-input-wrapper">
                            <input
                                type="text"
                                name="phone"
                                className="edit-input"
                                placeholder="숫자만 입력해주세요"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* 이메일 */}
                    <div className="edit-row">
                        <label className="edit-label">이메일</label>
                        <div className="edit-input-wrapper">
                            <input
                                type="email"
                                name="email"
                                className="edit-input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="변경할 이메일을 입력하세요"
                            />
                        </div>
                    </div>

                </div>

                <div className="edit-actions">
                    <div className="edit-btn-group">
                        <button className="cancel-btn" onClick={onCancel}>취소</button>
                        <button className="save-btn" onClick={handleSubmit}>저장하기</button>
                    </div>
                    <button className="withdraw-btn" onClick={handleWithdrawClick}>회원 탈퇴</button>
                </div>
            </div>

            {/* 회원 탈퇴 모달 */}
            {showWithdrawModal && (
                <div className="withdraw-modal-overlay" onClick={handleCloseWithdraw}>
                    <div className="withdraw-modal" onClick={(e) => e.stopPropagation()}>
                        {withdrawStep === 1 ? (
                            <>
                                <h3 className="withdraw-title">회원 탈퇴</h3>
                                <div className="withdraw-warning-box">
                                    <strong>⚠ 탈퇴 시 유의사항</strong><br />
                                    탈퇴 시 보유 중인 토큰이 모두 소멸되며, 다운로드 내역과 보관함의 작품들이 삭제되어 복구할 수 없습니다.
                                </div>
                                <div className="withdraw-reason-group">
                                    <label>탈퇴 사유</label>
                                    <select
                                        className="withdraw-select"
                                        value={withdrawReason}
                                        onChange={(e) => setWithdrawReason(e.target.value)}
                                    >
                                        <option value="">사유를 선택해주세요</option>
                                        <option value="low_usage">사용 빈도가 낮음</option>
                                        <option value="inconvenient">서비스 이용이 불편함</option>
                                        <option value="better_service">타 서비스 이용 예정</option>
                                        <option value="content_dissatisfied">컨텐츠 만족도 낮음</option>
                                        <option value="direct">기타 (직접 입력)</option>
                                    </select>
                                    {withdrawReason === 'direct' && (
                                        <textarea
                                            className="withdraw-textarea"
                                            placeholder="탈퇴 사유를 입력해주세요."
                                            value={customReason}
                                            onChange={(e) => setCustomReason(e.target.value)}
                                        />
                                    )}
                                </div>
                                <div className="withdraw-modal-actions">
                                    <button className="withdraw-btn-prev" onClick={handleCloseWithdraw}>취소</button>
                                    <button className="withdraw-btn-next" onClick={handleNextStep}>다음</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="withdraw-title">정말 탈퇴하시겠습니까?</h3>
                                <div className="withdraw-desc">
                                    지금 탈퇴하시면 <strong>모든 데이터가 영구적으로 삭제</strong>됩니다.<br />
                                    그래도 탈퇴하시겠습니까?
                                </div>
                                <div className="withdraw-modal-actions">
                                    <button className="withdraw-btn-prev" onClick={() => setWithdrawStep(1)}>이전</button>
                                    <button className="withdraw-btn-final" onClick={handleFinalWithdraw}>탈퇴하기</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
