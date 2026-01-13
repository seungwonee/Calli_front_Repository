import React, { useState, useEffect } from 'react';
import '../css/CreateCalli.css';
import testImage1 from '../assets/slide1.png';
import testImage2 from '../assets/slide2.png';
import testImage3 from '../assets/slide3.png';
import ImageModal from '../components/ImageModal';


export default function CreateCalli({
    onGoHome,
    tokenCount,
    setTokenCount,
    freeCredits,
    setFreeCredits,
    onAddToWishlist,
    onAddToHistory,
    onGoToCharge
}) {
    const [text, setText] = useState('');
    const [styleInput, setStyleInput] = useState('');
    const [bgStyle, setBgStyle] = useState('');
    const [selectedFastStyle, setSelectedFastStyle] = useState(null);
    const [selectedRatio, setSelectedRatio] = useState('1:1');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null); // 생성된 이미지 상태
    const [lastGeneratedText, setLastGeneratedText] = useState(''); // 마지막으로 생성한 텍스트
    const [showTips, setShowTips] = useState(false); // 작성 팁 토글 상태
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
    const ratios = ["1:1", "2:3", "3:2", "3:4", "4:3"];

    // ... (fastStyles 생략) ...
    const fastStyles = [
        {
            id: 1,
            title: "힘있고 강렬한",
            desc: "굵고 힘있는 붓터치, 강렬한 느낌",
            presetStyle: "굵고 힘있는 붓터치, 강렬한 느낌",
            presetBg: "검은색 배경"
        },
        {
            id: 2,
            title: "우아하고 부드러운",
            desc: "가늘고 흐르는 듯한 곡선, 우아한 느낌",
            presetStyle: "가늘고 흐르는 듯한 곡선, 우아한 느낌",
            presetBg: "밝은 베이지색 배경"
        },
        {
            id: 3,
            title: "활기차고 경쾌한",
            desc: "튀는 듯한 필체, 생동감 있는 느낌",
            presetStyle: "튀는 듯한 필체, 생동감 있는 느낌",
            presetBg: "화사한 파스텔 배경"
        },
        {
            id: 4,
            title: "고전적이고 전통적",
            desc: "먹의 번짐을 살린 전통 서체 스타일",
            presetStyle: "먹의 번짐을 살린 전통 서예 스타일",
            presetBg: "한지 질감의 배경"
        }
    ];

    const handleQuickPhrase = (phrase) => setText(phrase);

    const handleFastStyleSelect = (style) => {
        setSelectedFastStyle(style.id);
        setStyleInput(style.presetStyle);
        setBgStyle(style.presetBg);
    };

    const handleGenerate = () => {
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

        setTimeout(() => {
            setIsGenerating(false);
            const randomImg = testImages[Math.floor(Math.random() * testImages.length)];
            console.log("Generated Image Path:", randomImg);
            setGeneratedImage(randomImg);
            setLastGeneratedText(text);

            // 로컬 히스토리 추가
            const newHistoryItem = {
                image: randomImg,
                text: text,
                style: styleInput,
                bg: bgStyle,
                ratio: selectedRatio,
                fastStyleId: selectedFastStyle // 스타일 ID 저장
            };
            const newHistory = [newHistoryItem, ...history];
            setHistory(newHistory);
            localStorage.setItem('create_history', JSON.stringify(newHistory));
        }, 1500); // 시간 단축
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
        setSelectedFastStyle(item.fastStyleId || null); // 스타일 ID 복원
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
                        <input
                            type="text"
                            className="style-input"
                            placeholder="예: 힘있고 강렬한 느낌, 굵은 붓터치"
                            value={styleInput}
                            maxLength={100}
                            onChange={(e) => setStyleInput(e.target.value)}
                        />
                    </div>

                    {!showTips ? (
                        <div className="fast-style-section">
                            <div className="section-header">
                                <div className="section-label">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                                    <span>빠른 스타일 선택</span>
                                </div>
                                <button className="toggle-btn" onClick={() => setShowTips(true)}>예시 숨기기</button>
                            </div>
                            <div className="style-cards-grid">
                                {fastStyles.map(style => (
                                    <div
                                        key={style.id}
                                        className={`style-card ${selectedFastStyle === style.id ? 'active' : ''}`}
                                        onClick={() => handleFastStyleSelect(style)}
                                    >
                                        <h3>{style.title}</h3>
                                        <p>{style.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="writing-tips-section">
                            <div className="section-header">
                                <div className="section-label">
                                    <span className="info-icon">ⓘ</span>
                                    <span className="tips-icon">💡</span>
                                    <span>작성 팁</span>
                                </div>
                                <button className="toggle-btn" onClick={() => setShowTips(false)}>예시 보기</button>
                            </div>
                            <div className="tips-box">
                                <ul>
                                    <li>느낌을 구체적으로 표현하세요</li>
                                    <li>붓터치 스타일을 언급해보세요</li>
                                    <li>전체적인 분위기를 추가하세요</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="input-section">
                        <div className="section-label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            <span>배경 스타일</span>
                            <span className="tooltip">ⓘ</span>
                            <span className="limit">{bgStyle.length}/100</span>
                        </div>
                        <input
                            type="text"
                            className="bg-input"
                            placeholder="예: 검은색, 먹이 튄 느낌, 한지 질감"
                            value={bgStyle}
                            maxLength={100}
                            onChange={(e) => setBgStyle(e.target.value)}
                        />
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
                        <span className="icon">✨</span>
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
                />
            </div>
        </div>
    );
}
