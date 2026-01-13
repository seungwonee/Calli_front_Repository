import React, { useState } from 'react';
import '../css/MyPageWishlist.css';

// 아이콘 (폰트어썸 대신 텍스트나 이모지로 대체 가능, 여기선 이모지/SVG 사용)
const DownloadIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const TrashIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

const MagnifierIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
);

import ImageModal from '../components/ImageModal';

export default function MyPageWishlist({ wishlistItems, setWishlistItems, onDownloadRequest }) {
    // const [wishlistItems, setWishlistItems] = useState(createMockWishlist()); // 부모 Props 사용
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewModalImage, setPreviewModalImage] = useState(null);

    const openPreviewModal = (imgSrc) => {
        setPreviewModalImage(imgSrc);
        setPreviewModalOpen(true);
    };

    const closePreviewModal = () => {
        setPreviewModalOpen(false);
        setPreviewModalImage(null);
    };

    // 날짜별 그룹화
    const groupedItems = wishlistItems.reduce((acc, item) => {
        const dateKey = new Date(item.createdAt).toLocaleDateString();
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(item);
        return acc;
    }, {});

    const maxCount = 30;
    const currentCount = wishlistItems.length;

    // 선택 핸들러
    const toggleSelect = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    // 전체 선택 핸들러
    const toggleSelectAll = () => {
        if (selectedIds.size === wishlistItems.length) {
            setSelectedIds(new Set());
        } else {
            const allIds = new Set(wishlistItems.map(item => item.id));
            setSelectedIds(allIds);
        }
    };

    // 개별 삭제
    const handleDelete = (id) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            setWishlistItems(prev => prev.filter(item => item.id !== id));
            const newSelected = new Set(selectedIds);
            newSelected.delete(id);
            setSelectedIds(newSelected);
        }
    };

    // 개별 다운로드
    const handleDownload = (id) => {
        alert('이미지를 다운로드합니다.');
    };

    // 일괄 삭제
    const handleBulkDelete = () => {
        if (selectedIds.size === 0) return;
        if (window.confirm(`선택한 ${selectedIds.size}개 항목을 삭제하시겠습니까?`)) {
            setWishlistItems(prev => prev.filter(item => !selectedIds.has(item.id)));
            setSelectedIds(new Set());
        }
    };

    // 일괄 다운로드
    const handleBulkDownload = () => {
        if (selectedIds.size === 0) return;
        alert(`선택한 ${selectedIds.size}개 항목을 모두 다운로드합니다.`);
    };

    return (
        <div className="mypage-inner">
            <div className="wishlist-container">
                <div className="wishlist-header">
                    <h1 className="wishlist-title">위시리스트</h1>
                    <div className="wishlist-count">
                        저장한 캘리그라피 <strong>{currentCount}</strong> / {maxCount}
                    </div>
                </div>

                <div className="wishlist-actions-bar">
                    <div className="select-all-container" onClick={toggleSelectAll}>
                        <input
                            type="checkbox"
                            className="select-checkbox"
                            checked={wishlistItems.length > 0 && selectedIds.size === wishlistItems.length}
                            readOnly
                        />
                        <span>전체 선택</span>
                    </div>
                    <div className="bulk-actions">
                        <button
                            className="bulk-btn download"
                            onClick={handleBulkDownload}
                            disabled={selectedIds.size === 0}
                        >
                            선택 다운로드
                        </button>
                        <button
                            className="bulk-btn delete"
                            onClick={handleBulkDelete}
                            disabled={selectedIds.size === 0}
                        >
                            선택 삭제
                        </button>
                    </div>
                </div>

                {wishlistItems.length > 0 ? (
                    <div className="wishlist-gallery">
                        {Object.entries(groupedItems).map(([date, items]) => (
                            <div key={date} className="gallery-date-group">
                                <h3 className="gallery-date-header">{date}</h3>
                                <div className="gallery-grid">
                                    {items.map(item => (
                                        <div
                                            key={item.id}
                                            className={`gallery-item ${selectedIds.has(item.id) ? 'selected' : ''}`}
                                            onClick={() => toggleSelect(item.id)}
                                        >
                                            <input
                                                type="checkbox"
                                                className="item-select-checkbox"
                                                checked={selectedIds.has(item.id)}
                                                onClick={(e) => e.stopPropagation()} // 이벤트 버블링 방지 (checkbox만 따로 클릭 시)
                                                onChange={() => toggleSelect(item.id)}
                                            />

                                            {/* 이미지 자리 */}
                                            {/* 이미지 자리 */}
                                            {/* 실제 이미지 사용시 교체 */}
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.title} className="gallery-img" />
                                            ) : (
                                                <div className="gallery-img-wrapper" style={{ width: '100%', height: '100%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ color: '#aaa', fontSize: '12px' }}>{item.title}</span>
                                                </div>
                                            )}

                                            <div className="gallery-overlay" onClick={(e) => e.stopPropagation()}>
                                                <div className="overlay-title">{item.title}</div>
                                                <div className="overlay-actions">
                                                    <button
                                                        className="overlay-btn download-btn"
                                                        title="다운로드"
                                                        onClick={() => handleDownload(item.id)}
                                                    >
                                                        <DownloadIcon />
                                                    </button>
                                                    <button
                                                        className="overlay-btn preview-btn"
                                                        title="크게 보기"
                                                        onClick={(e) => { e.stopPropagation(); openPreviewModal(item.imageUrl); }}
                                                    >
                                                        <MagnifierIcon />
                                                    </button>
                                                    <button
                                                        className="overlay-btn delete-btn"
                                                        title="삭제"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-wishlist">
                        <p>위시리스트가 비어있습니다.</p>
                    </div>
                )}
            </div>
            {/* Image Modal */}
            <ImageModal
                isOpen={previewModalOpen}
                onClose={closePreviewModal}
                imageUrl={previewModalImage}
            />
        </div>
    );
}
