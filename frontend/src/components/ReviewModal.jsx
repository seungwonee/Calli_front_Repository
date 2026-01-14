import React, { useState } from 'react';
import '../css/ReviewModal.css';

export default function ReviewModal({ isOpen, onClose, onSubmit, onNeverShowAgain }) {
    const [rating, setRating] = useState(0);
    const [text, setText] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (rating === 0) {
            alert("별점을 선택해주세요!");
            return;
        }
        if (text.trim().length < 5) {
            alert("후기는 5글자 이상 작성해주세요!");
            return;
        }
        onSubmit({ rating, text });
        // Reset after submit
        setRating(0);
        setText('');
    };

    return (
        <div className="review-modal-overlay">
            <div className="review-modal-container">
                <button className="review-modal-close" onClick={onClose}>&times;</button>

                <h2 className="review-title">첫 작품 다운로드를 축하해요~!</h2>
                <p className="review-subtitle">
                    서비스가 마음에 드셨나요?<br />
                    소중한 후기는 서비스 개선에 큰 도움이 됩니다.
                </p>

                <div className="stars-container">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className={`star-btn ${star <= rating ? 'active' : ''}`}
                            onClick={() => setRating(star)}
                        >
                            ★
                        </button>
                    ))}
                </div>

                <div className="review-input-area">
                    <textarea
                        className="review-textarea"
                        placeholder="서비스 이용 경험이나 바라는 점을 자유롭게 적어주세요. (5글자 이상)"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </div>

                <div className="review-actions">
                    <button
                        className="submit-btn"
                        onClick={handleSubmit}
                        disabled={rating === 0 || text.trim().length < 5}
                    >
                        후기 제출하기
                    </button>

                    <div className="secondary-actions">
                        <button className="text-btn" onClick={onNeverShowAgain}>
                            다신 보지 않기
                        </button>
                        <button className="text-btn" onClick={onClose}>
                            나중에 하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
