import React, { useState } from 'react';
import '../css/MyPageHistory.css';
import ShareModal from './ShareModal';
import ImageModal from '../components/ImageModal';


export default function MyPageHistory({ historyList, setHistoryList, onGoToCreate }) {
    // const [historyList, setHistoryList] = useState(createMockHistory()); // 부모 Props 사용
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedShareItem, setSelectedShareItem] = useState(null);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewModalImage, setPreviewModalImage] = useState(null);

    const openPreviewModal = (imgSrc) => {
        if (!imgSrc) return;
        setPreviewModalImage(imgSrc);
        setPreviewModalOpen(true);
    };

    const closePreviewModal = () => {
        setPreviewModalOpen(false);
        setPreviewModalImage(null);
    };

    const isExpired = (dateString, duration = 30) => {
        const created = new Date(dateString);
        const today = new Date();
        const diffTime = Math.abs(today - created);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > duration;
    };

    // 만료되지 않은 항목만 필터링
    const validHistoryList = historyList.filter(item => !isExpired(item.createdAt));

    // 날짜별 그룹화
    const groupedHistory = validHistoryList.reduce((acc, item) => {
        const dateKey = new Date(item.createdAt).toLocaleDateString();
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(item);
        return acc;
    }, {});

    const handleDownload = (id) => {
        setHistoryList(prevList => prevList.map(item => {
            if (item.id === id) {
                if (item.downloadCount >= item.maxDownload) {
                    alert('다운로드 횟수를 초과했습니다.');
                    return item;
                }
                alert('이미지를 다운로드합니다. (남은 횟수: ' + (item.maxDownload - item.downloadCount - 1) + ')');
                return { ...item, downloadCount: item.downloadCount + 1 };
            }
            return item;
        }));
    };

    const handleShare = (item) => {
        setSelectedShareItem(item);
        setIsShareModalOpen(true);
    };

    // 시간 포맷팅
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // 남은 기간 계산
    const getDaysLeft = (dateString) => {
        const created = new Date(dateString);
        const expireDate = new Date(created.setDate(created.getDate() + 30));
        const today = new Date();
        const diffTime = expireDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="mypage-inner">
            <div className="history-container">
                <div className="history-header">
                    <h1 className="history-title">다운로드 내역</h1>
                    <p className="history-subtitle">최근 30일간 생성하신 캘리그라피 내역입니다.</p>
                </div>

                {validHistoryList.length > 0 ? (
                    <div className="history-list">
                        {Object.entries(groupedHistory).map(([date, items]) => (
                            <div key={date} className="date-section">
                                <h3 className="date-section-title">{date}</h3>
                                <div className="date-section-items">
                                    {items.map(item => (
                                        <div key={item.id} className="history-item-card">
                                            <div
                                                className="history-thumbnail-wrapper"
                                                onClick={() => openPreviewModal(item.imageUrl)}
                                                style={{ cursor: 'pointer' }}
                                                title="클릭하여 크게 보기"
                                            >
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.inputText}
                                                        className="history-thumbnail"
                                                    />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                                                        이미지
                                                    </div>
                                                )}
                                            </div>
                                            <div className="history-info">
                                                <div className="history-text">{item.inputText}</div>
                                                <div className="history-meta">
                                                    <span>{formatTime(item.createdAt)}</span>
                                                    <span style={{ color: '#ff4d4f' }}>만료까지 {getDaysLeft(item.createdAt)}일 남음</span>
                                                </div>
                                            </div>
                                            <div className="history-actions">
                                                <button
                                                    className="action-btn download"
                                                    onClick={() => handleDownload(item.id)}
                                                    disabled={item.downloadCount >= item.maxDownload}
                                                >
                                                    {item.downloadCount >= item.maxDownload ? '횟수 초과' : `재다운로드 (${item.downloadCount}/${item.maxDownload})`}
                                                </button>
                                                <button
                                                    className="action-btn share"
                                                    onClick={() => handleShare(item)}
                                                    disabled={item.downloadCount >= item.maxDownload}
                                                    style={item.downloadCount >= item.maxDownload ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                                >
                                                    공유하기
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-history">
                        <p>다운로드 내역이 없습니다.</p>
                    </div>
                )}
            </div >

            {/* Share Modal */}
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                imageUrl={selectedShareItem?.imageUrl}
                prompt={selectedShareItem?.inputText}
                style={selectedShareItem?.style || '기본 스타일'}
            />
            {/* Image Modal */}
            <ImageModal
                isOpen={previewModalOpen}
                onClose={closePreviewModal}
                imageUrl={previewModalImage}
            />
        </div >
    );
}
