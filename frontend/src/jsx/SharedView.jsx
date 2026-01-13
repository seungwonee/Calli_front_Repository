import React, { useEffect, useState } from 'react';
import '../css/SharedView.css';

export default function SharedView({ shareId, sharedData, onGoHome }) {
    const [displayData, setDisplayData] = useState(null);

    useEffect(() => {
        if (sharedData) {
            setDisplayData(sharedData);
        } else {
            // URL 파라미터가 없는 경우 (예외 처리)
            // 나중에 API 호출 로직이 들어갈 곳
            // 현재는 빈 상태로 두거나 기본값
        }
    }, [sharedData, shareId]);

    // 데이터가 없으면 로딩 중이거나 에러
    if (!displayData) return (
        <div className="shared-view-container">
            <div className="shared-loading">데이터를 불러오는 중입니다...</div>
        </div>
    );

    return (
        <div className="shared-view-container">
            {/* Header Removed as per user request (or minimal branding) */}
            {/* <header className="shared-header">
                <h1 className="service-brand" onClick={onGoHome}>Calli for you</h1>
            </header> */}
            {/* Just a simple branding inside main if needed, or total removal */}

            <header className="shared-header-simple">
                <h1 className="service-brand" onClick={onGoHome}>Calli for you</h1>
            </header>

            <main className="shared-main">
                <div className="artwork-card">
                    <div className="image-wrapper">
                        {/* 이미지 URL이 유효한지 확인 필요 */}
                        <img
                            src={displayData.imageUrl}
                            alt="Shared Calligraphy"
                            className="shared-image"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=Image+Not+Found' }}
                        />
                    </div>

                    <div className="artwork-info">
                        <div className="info-row">
                            <span className="info-label">문구</span>
                            <p className="info-text highlight">"{decodeURIComponent(displayData.prompt || '')}"</p>
                        </div>
                        <div className="info-row">
                            <span className="info-label">스타일</span>
                            <p className="info-text">{decodeURIComponent(displayData.style || '')}</p>
                        </div>
                    </div>
                </div>

                <div className="cta-section">
                    <p className="cta-message">
                        이 작품처럼 멋진 캘리그라피를 직접 만들어보세요!
                    </p>
                    <button className="cta-main-btn" onClick={onGoHome}>
                        나도 만들기
                    </button>
                </div>
            </main>

            <footer className="shared-footer">
                <p>© 2026 Calli for you. All rights reserved.</p>
            </footer>
        </div>
    );
}
