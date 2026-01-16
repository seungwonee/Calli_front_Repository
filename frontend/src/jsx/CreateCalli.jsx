import React, { useState, useEffect } from 'react';
import client from '../api/client';
import '../css/CreateCalli.css';
import testImage1 from '../assets/slide1.png';
import testImage2 from '../assets/slide2.png';
import testImage3 from '../assets/slide3.png';
import ImageModal from '../components/ImageModal';
import ReviewModal from '../components/ReviewModal';


export default function CreateCalli({
    onGoHome,
    tokenCount,
    setTokenCount,
    freeCredits,
    setFreeCredits,
    onAddToWishlist,
    onAddToHistory,
    onGoToCharge,
    onAddReview // New prop
}) {
    const [text, setText] = useState('');
    const [styleInput, setStyleInput] = useState('');
    const [bgStyle, setBgStyle] = useState('');
    const [selectedRatio, setSelectedRatio] = useState('1:1');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null); // 생성된 이미지 상태
    const [lastGeneratedText, setLastGeneratedText] = useState(''); // 마지막으로 생성한 텍스트
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewModalImage, setPreviewModalImage] = useState(null);
    const [reviewModalOpen, setReviewModalOpen] = useState(false); // Review modal state

    const openPreviewModal = (imgSrc) => {
        setPreviewModalImage(imgSrc);
        setPreviewModalOpen(true);
    };

    const closePreviewModal = () => {
        setPreviewModalOpen(false);
        setPreviewModalImage(null);
    };


    // 화면 진입 시 맨 위로 스크롤
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // 로컬 히스토리 state (CreateCalli 화면 내의 History용, 전역과는 별개 혹은 연동 가능하지만 일단 유지)
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('create_history'); // 키 변경
        return saved ? JSON.parse(saved) : [];
    });

    const testImages = [testImage1, testImage2, testImage3];

    const quickPhrases = ["사랑합니다", "행복한 하루", "감사합니다", "축하합니다", "새해 복 많이 받으세요"];

    // 캘리그라피 스타일 추천 태그
    const stylePresets = [
        "굵고 힘있는 붓터치, 강렬한 느낌",
        "가늘고 흐르는 듯한 곡선, 우아한 느낌",
        "튀는 듯한 필체, 생동감 있는 느낌",
        "먹의 번짐을 살린 전통 서예 스타일"
    ];

    // 배경 스타일 추천 태그
    const bgPresets = [
        "검은색 배경",
        "밝은 베이지색 배경",
        "화사한 파스텔 배경",
        "한지 질감의 배경"
    ];

    const ratios = ["1:1", "2:3", "3:2", "3:4", "4:3"];

    const handleQuickPhrase = (phrase) => setText(phrase);
    const handleStylePreset = (preset) => setStyleInput(preset);
    const handleBgPreset = (preset) => setBgStyle(preset);


    const handleGenerate = async () => {
        // 무료 횟수 차감 또는 토큰 차감 로직 (App에서 받은 props 사용)
        if (freeCredits > 0) {
            setFreeCredits(prev => prev - 1);
        } else {
            // 무료 횟수 소진 시 토큰 차감
            if (Number(tokenCount) < 5) {
                if (window.confirm("토큰이 부족합니다. 충전 페이지로 이동하시겠습니까?")) {
                    if (onGoToCharge) onGoToCharge();
                }
                return;
            }
            setTokenCount(prev => prev - 5);
        }

        setIsGenerating(true);
        setGeneratedImage(null);

        try {
            // 1. 생성 요청 요청
            // DTO: textPrompt, stylePrompt, bgPrompt, size(Integer)
            const payload = {
                textPrompt: text,
                stylePrompt: styleInput,
                bgPrompt: bgStyle,
                size: 1 // 임시: 1 (백엔드 로직에 맞춰 수정 필요, Mock에서는 상관없음)
            };

            const res = await client.post('/image/generation', payload);
            const calliId = res.data; // Calli ID 반환됨

            console.log("Generation started, CalliID:", calliId);

            // 2. 폴링 (Polling) - 이미지 생성 완료 확인
            const pollInterval = setInterval(async () => {
                try {
                    const statusRes = await client.get(`/image/${calliId}/preview`);

                    if (statusRes.status === 200) {
                        // 생성 완료
                        clearInterval(pollInterval);
                        const imageUrl = statusRes.data.url; // PreviewResponseDto.url
                        console.log("Image Generated:", imageUrl);

                        setGeneratedImage(imageUrl);
                        setLastGeneratedText(text);
                        setIsGenerating(false);

                        // 로컬 히스토리 추가
                        const newHistoryItem = {
                            image: imageUrl,
                            text: text,
                            style: styleInput,
                            bg: bgStyle,
                            ratio: selectedRatio,
                        };
                        const newHistory = [newHistoryItem, ...history];
                        setHistory(newHistory);
                        localStorage.setItem('create_history', JSON.stringify(newHistory));

                    } else if (statusRes.status === 202) {
                        // 생성 중... 계속 대기
                        console.log("Generating...");
                    }
                } catch (err) {
                    // 404 등 에러 발생 시
                    if (err.response && err.response.status !== 202) {
                        console.error("Polling error:", err);
                        // 일정 횟수 이상 실패하면 중단하는 로직이 있으면 좋음
                    }
                }
            }, 1000); // 1초마다 확인

            // 안전장치: 30초 후에도 안되면 중단 (선택사항)
            setTimeout(() => {
                if (isGenerating) {
                    clearInterval(pollInterval);
                    // setIsGenerating(false); // 타임아웃 처리
                }
            }, 30000);

        } catch (error) {
            console.error("Generation request failed:", error);
            alert("이미지 생성 요청 실패");
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (!generatedImage) return;

        // 무료 생성 횟수가 남아있더라도 '다운로드'는 별개 비용 (토큰 20개)
        // 만약 무료 횟수로 생성했어도 다운로드는 유료라면 아래 유지
        if (Number(tokenCount) < 20) {
            if (window.confirm("다운로드를 위한 토큰이 부족합니다! (필요: 20개)\n충전 페이지로 이동하시겠습니까?")) {
                if (onGoToCharge) onGoToCharge();
            }
            return;
        }

        if (window.confirm("20 토큰을 사용하여 다운로드 하시겠습니까?")) {
            setTokenCount(prev => prev - 20);

            // 전역 History에 추가
            onAddToHistory(generatedImage, text);

            alert("다운로드가 완료되었습니다! 마이페이지 > 다운로드 내역에서 확인하세요.");

            // 첫 다운로드 체크 및 리뷰 모달 트리거
            const hasReviewed = localStorage.getItem('review_prompt_completed');
            if (!hasReviewed) {
                setTimeout(() => {
                    setReviewModalOpen(true);
                }, 1000); // 1초 뒤에 자연스럽게 뜸
            }
        }
    };

    const handleReviewSubmit = (reviewData) => {
        if (onAddReview) {
            onAddReview(reviewData);
            // setTokenCount(prev => prev + 5); // 보상 제거
            localStorage.setItem('review_prompt_completed', 'true'); // 완료 표시
            setReviewModalOpen(false);
            alert("소중한 후기 감사합니다! 🎉");
        }
    };

    const handleWishlistClick = () => {
        if (!generatedImage) {
            alert('생성된 이미지가 없습니다.');
            return;
        }

        const isAdded = onAddToWishlist(generatedImage, text);
        if (isAdded) {
            alert('위시리스트에 담았습니다! 마이페이지 > 위시리스트에서 확인하세요.');
        } else {
            alert('이미 위시리스트에 존재하는 이미지입니다.');
        }
    };

    // 히스토리 아이템 클릭 시 상태 복원
    const handleHistoryClick = (item) => {
        if (!item) return;
        // 구버전 데이터(문자열) 처리
        if (typeof item === 'string') {
            setGeneratedImage(item);
            return;
        }

        setGeneratedImage(item.image);
        setText(item.text || '');
        setStyleInput(item.style || '');
        setBgStyle(item.bg || '');
        setSelectedRatio(item.ratio || '1:1');
        // setSelectedFastStyle removed
    };

    // 버튼 텍스트 결정 로직
    const getButtonText = () => {
        if (isGenerating) return '생성 중...';
        const baseText = (lastGeneratedText && text === lastGeneratedText) ? '재생성하기' : '생성하기';

        if (freeCredits <= 0) {
            return `${baseText} (토큰 5개 차감)`;
        }
        return baseText;
    };

    return (
        <div className="create-calli-page-inner">
            <div className="create-container">
                {/* 좌측 입력 카드 */}
                <div className="input-card">
                    <div className="card-header">
                        <div className="card-title">
                            <span className="title-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                            </span>
                            <h2>Create</h2>
                        </div>
                        <div className="card-info">
                            {freeCredits > 0 && <span className="info-item pink">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'text-bottom' }}><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
                                무료 {freeCredits}회
                            </span>}
                            <span className="info-item blue">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'text-bottom' }}><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path></svg>
                                잔여 토큰 : {tokenCount}
                            </span>
                        </div>
                    </div>

                    <div className="input-section">
                        <div className="section-label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            <span>입력할 텍스트</span>
                            <span className="tooltip">ⓘ</span>
                            <span className="limit">{text.length}/20</span>
                        </div>
                        <textarea
                            className="phrase-textarea"
                            placeholder="캘리그라피로 만들 텍스트를 입력하세요"
                            value={text}
                            maxLength={20}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <div className="quick-tags">
                            {quickPhrases.map(phrase => (
                                <button key={phrase} className="tag-btn" onClick={() => handleQuickPhrase(phrase)}>{phrase}</button>
                            ))}
                        </div>
                    </div>

                    <div className="input-section">
                        <div className="section-label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
                            <span>캘리그라피 스타일</span>
                            <span className="tooltip">ⓘ</span>
                            <span className="limit">{styleInput.length}/100</span>
                        </div>
                        <textarea
                            className="style-input"
                            placeholder="예: 힘있고 강렬한 느낌, 굵은 붓터치"
                            value={styleInput}
                            maxLength={100}
                            onChange={(e) => setStyleInput(e.target.value)}
                        />
                        <div className="quick-tags">
                            {stylePresets.map(preset => (
                                <button key={preset} className="tag-btn" onClick={() => handleStylePreset(preset)}>{preset}</button>
                            ))}
                        </div>
                    </div>

                    <div className="input-section">
                        <div className="section-label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            <span>배경 스타일</span>
                            <span className="tooltip">ⓘ</span>
                            <span className="limit">{bgStyle.length}/100</span>
                        </div>
                        <textarea
                            className="bg-input"
                            placeholder="예: 검은색, 먹이 튄 느낌, 한지 질감"
                            value={bgStyle}
                            maxLength={100}
                            onChange={(e) => setBgStyle(e.target.value)}
                        />
                        <div className="quick-tags">
                            {bgPresets.map(preset => (
                                <button key={preset} className="tag-btn" onClick={() => handleBgPreset(preset)}>{preset}</button>
                            ))}
                        </div>
                    </div>

                    <div className="ratio-section">
                        <div className="section-label">이미지 비율 <span className="tooltip">ⓘ</span></div>
                        <div className="ratio-buttons">
                            {ratios.map(ratio => (
                                <button
                                    key={ratio}
                                    className={`ratio-btn ${selectedRatio === ratio ? 'active' : ''}`}
                                    onClick={() => setSelectedRatio(ratio)}
                                >
                                    {ratio}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        className="main-generate-btn"
                        disabled={!text.trim() || !styleInput.trim() || !bgStyle.trim() || isGenerating}
                        onClick={handleGenerate}
                    >
                        <span>{getButtonText()}</span>
                    </button>
                </div>

                {/* 우측 영역 (Preview & History) */}
                <div className="display-area">
                    <div className="preview-card">
                        <div className="preview-header">
                            <h2>Preview</h2>
                        </div>
                        <div className="preview-body">
                            {isGenerating ? (
                                <div className="loading-indicator">
                                    <p>AI가 캘리그라피를 그리고 있습니다...</p>
                                    {/* 추후 스피너나 로딩 애니메이션 추가 가능 */}
                                </div>
                            ) : generatedImage ? (
                                <img
                                    src={generatedImage}
                                    alt="Generated Calligraphy"
                                    className="preview-image"
                                    style={{ aspectRatio: selectedRatio.replace(':', '/'), cursor: 'pointer' }}
                                    onClick={() => openPreviewModal(generatedImage)}
                                    title="클릭하여 크게 보기"
                                />
                            ) : (
                                <p>캘리그라피를 생성하면 여기에 미리보기가 표시됩니다</p>
                            )}
                        </div>
                    </div>

                    <div className="action-row">
                        <button className="action-btn wishlist" onClick={handleWishlistClick}><span className="icon">♡</span> 위시리스트</button>
                        <button className="action-btn download" onClick={handleDownload}><span className="icon">⬇</span> 다운로드 (토큰 20개 차감)</button>
                    </div>

                    <div className="history-card">
                        <div className="history-header">
                            <span className="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            </span>
                            <h2>History</h2>
                        </div>
                        <div className="history-body">
                            {history.length > 0 ? (
                                <div className="history-list">
                                    {history.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="history-item"
                                            onClick={() => handleHistoryClick(item)}
                                            title="클릭하여 이 설정 불러오기"
                                        >
                                            <img
                                                src={typeof item === 'string' ? item : item.image}
                                                alt={`History ${idx}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="history-empty">생성 내역이 없습니다</p>
                            )}
                        </div>
                    </div>
                </div>
                {/* Image Modal */}
                <ImageModal
                    isOpen={previewModalOpen}
                    onClose={closePreviewModal}
                    imageUrl={previewModalImage}
                    ratio={selectedRatio} // 비율 전달
                />

                {/* Review Modal */}
                <ReviewModal
                    isOpen={reviewModalOpen}
                    onClose={() => setReviewModalOpen(false)}
                    onSubmit={handleReviewSubmit}
                    onNeverShowAgain={() => {
                        setReviewModalOpen(false);
                        localStorage.setItem('review_prompt_completed', 'true');
                    }}
                />
            </div>
        </div>
    );
}
