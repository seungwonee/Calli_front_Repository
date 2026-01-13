import React, { useState } from 'react';
import '../css/MyPageAuth.css';

export default function MyPageAuth({ onSuccess }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // 간단한 비밀번호 확인 로직 (데모용)
        if (password === 'user123' || password === '1234') {
            setError('');
            onSuccess();
        } else {
            setError('비밀번호가 일치하지 않습니다.');
        }
    };

    return (
        <div className="mypage-inner">
            <div className="auth-container">
                <div className="auth-title-section">
                    <h1 className="auth-title">본인 확인</h1>
                    <p className="auth-subtitle">회원정보 수정을 위해 비밀번호를 입력해주세요</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <label className="auth-label">비밀번호</label>
                        <input
                            type="password"
                            className="auth-input"
                            placeholder="비밀번호를 입력하세요"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <div className="error-msg">{error}</div>}

                    <div className="auth-guide">
                        <p>🔒 회원님의 정보를 안전하게 보호하기 위해</p>
                        <p>비밀번호 확인이 필요합니다.</p>
                    </div>

                    <button type="submit" className="auth-btn">확인</button>
                </form>
            </div>
        </div>
    );
}
