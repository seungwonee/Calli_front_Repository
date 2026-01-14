import React, { useState, useEffect } from 'react';
import '../css/MyPage.css';
import MyPageAuth from './MyPageAuth';
import MyPageEdit from './MyPageEdit';
import MyPageCharge from './MyPageCharge';
import MyPageHistory from './MyPageHistory';
import MyPageWishlist from './MyPageWishlist';

// 아이콘 자산 (Figma URL)
const userIcon = "http://localhost:3845/assets/2651b4d1d9fe8d1c13bef9fb58ec44fbf5b69708.svg"; // 임시
const mailIcon = "http://localhost:3845/assets/24f0ebf3499e809f526383878fdf05ee388b9d48.svg"; // 임시

export default function MyPage({
    userName,
    userEmail,
    userPhone = "010-0000-0000", // Default prop
    onUpdateProfile,
    tokenCount = 0,
    setTokenCount,
    initialView = 'dashboard',
    historyList,
    setHistoryList,
    wishlistItems,
    setWishlistItems,
    paymentHistory,
    setPaymentHistory
}) {
    // view state: 'dashboard' | 'auth' | 'edit' | 'charge' | 'history' | 'wishlist'
    const [currentView, setCurrentView] = useState(initialView);
    // const [currentTokenCount, setCurrentTokenCount] = useState(tokenCount); // props인 tokenCount 사용

    // initialView prop이 바뀔 때마다 뷰 업데이트 (사이드바 메뉴 클릭 시 반영)
    useEffect(() => {
        setCurrentView(initialView);
    }, [initialView]);

    // 결제 내역 데이터 (나중에 API 연동)
    // const [paymentHistory, setPaymentHistory] = useState([]); -> Global props로 대체

    // 핸들러
    const handleAuthSuccess = () => {
        setCurrentView('edit');
    };

    const handleEditCancel = () => {
        setCurrentView('dashboard');
    };

    const handleEditSave = (newData) => {
        // App.jsx로 업데이트 요청
        if (onUpdateProfile) {
            onUpdateProfile(newData);
        }
        setCurrentView('dashboard');
    };

    const handleChargeComplete = (tokenAmount, price, method) => {
        // 충전 완료 시 처리 (토큰 증가, 내역 추가 등)
        setTokenCount(prev => prev + tokenAmount);

        // 결제 내역에 추가
        const newHistory = {
            date: new Date().toLocaleDateString(),
            method: method || '간편결제',
            amount: price,
            tokens: tokenAmount
        };
        setPaymentHistory(prev => [newHistory, ...prev]);

        setCurrentView('dashboard');
    };

    const handleInfoEditClick = () => {
        setCurrentView('auth');
    };

    const handleChargeClick = () => {
        setCurrentView('charge');
    };

    // 위시리스트 -> 다운로드 처리 (토큰 차감 및 히스토리 이동)
    const handleWishlistDownload = (items) => {
        const requiredTokens = items.length * 20;

        if (tokenCount < requiredTokens) {
            alert(`토큰이 부족합니다. (필요: ${requiredTokens}, 보유: ${tokenCount})\n충전 페이지로 이동하시겠습니까?`);
            // 여기서 confirm 후 충전 페이지 이동 로직을 넣을 수도 있음
            return false;
        }

        // 토큰 차감 - 부모로부터 받은 setter 사용
        setTokenCount(prev => prev - requiredTokens);

        // 다운로드 내역에 추가
        const newHistoryItems = items.map(item => ({
            id: Date.now() + Math.random(), // 임시 ID
            imageUrl: item.imageUrl,
            inputText: item.title, // 위시리스트 title을 inputText로 사용
            createdAt: new Date().toISOString(),
            downloadCount: 1,
            maxDownload: 3
        }));

        setHistoryList(prev => [...newHistoryItems, ...prev]);

        alert(`${items.length}개 항목을 다운로드했습니다. (총 -${requiredTokens} 토큰)`);
        return true;
    };

    // 뷰 렌더링 분기
    if (currentView === 'auth') {
        return <MyPageAuth onSuccess={handleAuthSuccess} />;
    }

    if (currentView === 'edit') {
        return <MyPageEdit
            userName={userName}
            userEmail={userEmail}
            userPhone={userPhone}
            onCancel={handleEditCancel}
            onSave={handleEditSave}
        />;
    }

    if (currentView === 'charge') {
        // onChargeComplete에서 setTokenCount 사용해야 함 (MyPageCharge 내부 수정 필요할 수도 있음, 일단 mock update)
        // 현재 handleChargeComplete은 local state를 업데이트 했었음. 수정 필요.
        return <MyPageCharge onCancel={() => setCurrentView('dashboard')} onChargeComplete={handleChargeComplete} currentTokens={tokenCount} />;
    }

    if (currentView === 'history') {
        return <MyPageHistory historyList={historyList} setHistoryList={setHistoryList} />;
    }

    if (currentView === 'wishlist') {
        return <MyPageWishlist
            wishlistItems={wishlistItems}
            setWishlistItems={setWishlistItems}
            onDownloadRequest={handleWishlistDownload}
        />;
    }


    // 기본 대시보드 뷰
    return (
        <div className="mypage-inner">
            <div className="mypage-container">

                {/* 1. 상단 인사말 및 메타 정보 */}
                <div className="user-info-section">
                    <h1 className="greeting-text">{userName}님, 안녕하세요!</h1>
                    <div className="user-meta-info">
                        <div className="meta-item"></div>
                    </div>
                </div>

                {/* 2. 내 정보 카드 */}
                <div className="mypage-card">
                    <div className="card-header-row">
                        <h3 className="card-title">내 정보</h3>
                        <button className="edit-btn" onClick={handleInfoEditClick}>정보 수정</button>
                    </div>
                    <div className="info-list">
                        <div className="info-item">
                            <span className="info-label">이름</span>
                            <span className="info-value">{userName}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">이메일</span>
                            <span className="info-value">{userEmail}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">휴대폰 번호</span>
                            <span className="info-value">{userPhone}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">보유 토큰</span>
                            <span className="info-value">{tokenCount} 토큰</span>
                        </div>
                    </div>
                </div>

                {/* 3. 최근 결제 내역 카드 */}
                <div className="mypage-card">
                    <div className="card-header-row">
                        <h3 className="card-title">최근 결제 내역</h3>
                    </div>

                    <div className="payment-history-container">
                        {paymentHistory.length > 0 ? (
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>날짜</th>
                                        <th>결제수단</th>
                                        <th>금액</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paymentHistory.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="history-date">{item.date}</td>
                                            <td className="history-method">{item.method || '간편결제'}</td>
                                            <td className="history-amount">{item.amount.toLocaleString()}원</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <>
                                <p className="empty-history-text">아직 결제 내역이 없습니다</p>
                                <button className="charge-link-btn" onClick={handleChargeClick}>토큰 충전하기 →</button>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
