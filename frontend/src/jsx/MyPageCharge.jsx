import React, { useState, useEffect } from 'react';
import '../css/MyPageCharge.css';

const CHARGE_OPTIONS = [
    { id: 1, credit: 10, bonus: 0, price: 10000 },
    { id: 2, credit: 50, bonus: 5, price: 50000 },
    { id: 3, credit: 100, bonus: 15, price: 100000, isPopular: true },
    { id: 4, credit: 200, bonus: 40, price: 200000 },
    { id: 5, credit: 500, bonus: 125, price: 500000 },
];

export default function MyPageCharge({ onCancel, onChargeComplete, currentTokens }) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [paymentStep, setPaymentStep] = useState('select'); // 'select', 'card', 'transfer'

    // 카드 결제 정보 상태
    const [cardInfo, setCardInfo] = useState({
        num1: '', num2: '', num3: '', num4: '',
        expiry: '', cvc: '', pw: '', installment: '0'
    });

    // 계좌 이체 정보 상태
    const [transferInfo, setTransferInfo] = useState({
        bank: '', accountNum: '', owner: '', pw: ''
    });

    // 컴포넌트 마운트 시 저장된 결제 정보 불러오기
    useEffect(() => {
        const savedCard = localStorage.getItem('lastCardInfo');
        const savedTransfer = localStorage.getItem('lastTransferInfo');

        if (savedCard) {
            const parsed = JSON.parse(savedCard);
            setCardInfo(prev => ({ ...prev, ...parsed, pw: '' })); // 비밀번호는 제외하고 복원
        }
        if (savedTransfer) {
            const parsed = JSON.parse(savedTransfer);
            setTransferInfo(prev => ({ ...prev, ...parsed, pw: '' })); // 비밀번호는 제외하고 복원
        }
    }, []);

    const handleCardClick = (item) => {
        setSelectedItem(item);
        setPaymentStep('select');
    };

    const handleCloseModal = () => {
        setSelectedItem(null);
        setPaymentStep('select');
        // 모달 닫을 때 비밀번호 필드 초기화 (보안)
        setCardInfo(prev => ({ ...prev, pw: '' }));
        setTransferInfo(prev => ({ ...prev, pw: '' }));
    };

    const handleCardChange = (field, value) => {
        setCardInfo(prev => ({ ...prev, [field]: value }));
    };

    const handleTransferChange = (field, value) => {
        setTransferInfo(prev => ({ ...prev, [field]: value }));
    };

    const handlePayment = (method) => {
        // 결제 정보 저장 (비밀번호 제외)
        if (method === '신용카드') {
            const { pw, ...saveData } = cardInfo;
            localStorage.setItem('lastCardInfo', JSON.stringify(saveData));
        } else if (method === '계좌이체') {
            const { pw, ...saveData } = transferInfo;
            localStorage.setItem('lastTransferInfo', JSON.stringify(saveData));
        }

        // 결제 시뮬레이션
        alert(`${selectedItem.price.toLocaleString()}원 결제가 완료되었습니다. (${method})`);

        // 실제로는 여기서 백엔드에 결제 검증 요청을 보내야 함

        if (onChargeComplete) {
            onChargeComplete(selectedItem.credit + selectedItem.bonus, selectedItem.price, method);
        }
        handleCloseModal();
    };

    return (
        <div className="mypage-inner">
            <div className="charge-container">
                <div className="charge-header">
                    <h1 className="charge-title">토큰 충전소</h1>
                    <p className="charge-subtitle">원하는 만큼 토큰을 충전하고 다양한 캘리그라피를 만들어보세요!</p>
                    <div className="current-balance" style={{ marginTop: '10px', fontSize: '15px', color: '#6366F1', fontWeight: 'bold' }}>
                        현재 보유 토큰: {currentTokens}개
                    </div>
                </div>

                <div className="charge-grid">
                    {CHARGE_OPTIONS.map((item) => (
                        <div
                            key={item.id}
                            className={`charge-card ${item.isPopular ? 'popular' : ''}`}
                            onClick={() => handleCardClick(item)}
                        >

                            <div className="card-top">
                                <div className="credit-amount">
                                    {item.credit} <span className="credit-unit">토큰</span>
                                </div>
                                {item.bonus > 0 && (
                                    <div className="bonus-info">
                                        <span className="bonus-badge">+{item.bonus} 보너스</span>
                                        <span>= 총 {item.credit + item.bonus}개</span>
                                    </div>
                                )}
                            </div>

                            <div className="card-bottom">
                                <div className="price-text">{item.price.toLocaleString()}원</div>
                            </div>
                        </div>
                    ))}
                </div>
                <p className="vat-info">* 모든 결제 금액은 부가세(VAT)가 포함된 가격입니다.</p>
            </div>

            {/* 결제 모달 */}
            {selectedItem && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                        {paymentStep === 'select' && (
                            <>
                                <h3 className="modal-title">결제하기</h3>

                                <div className="selected-item-info">
                                    <div>
                                        <span style={{ fontWeight: 'bold' }}>{selectedItem.credit + selectedItem.bonus} 토큰</span>
                                        <div style={{ fontSize: '12px', color: '#888' }}>기본 {selectedItem.credit} + 보너스 {selectedItem.bonus}</div>
                                    </div>
                                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#0881dc' }}>
                                        {selectedItem.price.toLocaleString()}원
                                    </span>
                                </div>

                                <div className="payment-methods">
                                    <button className="pay-btn kakao" onClick={() => handlePayment('카카오페이')}>
                                        🟡 카카오페이로 결제
                                    </button>
                                    <button className="pay-btn naver" onClick={() => handlePayment('네이버페이')}>
                                        🟢 네이버페이로 결제
                                    </button>
                                    <button className="pay-btn pass" onClick={() => handlePayment('PASS 결제')}>
                                        🔴 PASS / 휴대폰 결제
                                    </button>
                                    <button className="pay-btn card" onClick={() => setPaymentStep('card')}>
                                        💳 신용카드 결제
                                    </button>
                                    <button className="pay-btn transfer" onClick={() => setPaymentStep('transfer')}>
                                        🏦 실시간 계좌이체
                                    </button>
                                </div>

                                <button className="modal-close-btn" onClick={handleCloseModal}>
                                    취소하기
                                </button>
                            </>
                        )}

                        {paymentStep === 'card' && (
                            <>
                                <h3 className="modal-title">신용카드 결제</h3>
                                <div className="payment-form">
                                    <div className="form-group">
                                        <label>카드 번호</label>
                                        <div className="card-num-inputs">
                                            <input type="text" maxLength="4" placeholder="0000" value={cardInfo.num1} onChange={(e) => handleCardChange('num1', e.target.value)} />
                                            <input type="text" maxLength="4" placeholder="0000" value={cardInfo.num2} onChange={(e) => handleCardChange('num2', e.target.value)} />
                                            <input type="text" maxLength="4" placeholder="0000" value={cardInfo.num3} onChange={(e) => handleCardChange('num3', e.target.value)} />
                                            <input type="text" maxLength="4" placeholder="0000" value={cardInfo.num4} onChange={(e) => handleCardChange('num4', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group half">
                                            <label>유효기간</label>
                                            <input type="text" placeholder="MM/YY" maxLength="5" value={cardInfo.expiry} onChange={(e) => handleCardChange('expiry', e.target.value)} />
                                        </div>
                                        <div className="form-group half">
                                            <label>CVC</label>
                                            <input type="password" placeholder="***" maxLength="3" value={cardInfo.cvc} onChange={(e) => handleCardChange('cvc', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>할부 선택</label>
                                        <select value={cardInfo.installment} onChange={(e) => handleCardChange('installment', e.target.value)}>
                                            <option value="0">일시불</option>
                                            <option value="2">2개월</option>
                                            <option value="3">3개월</option>
                                            <option value="4">4개월</option>
                                            <option value="5">5개월</option>
                                            <option value="6">6개월</option>
                                            <option value="12">12개월</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>비밀번호 앞 2자리</label>
                                        <input type="password" placeholder="**" maxLength="2" style={{ width: '50%' }} value={cardInfo.pw} onChange={(e) => handleCardChange('pw', e.target.value)} />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button className="back-btn" onClick={() => setPaymentStep('select')}>이전</button>
                                    <button className="confirm-pay-btn" onClick={() => handlePayment('신용카드')}>결제하기</button>
                                </div>
                            </>
                        )}

                        {paymentStep === 'transfer' && (
                            <>
                                <h3 className="modal-title">계좌이체</h3>
                                <div className="payment-form">
                                    <div className="form-group">
                                        <label>은행 선택</label>
                                        <select value={transferInfo.bank} onChange={(e) => handleTransferChange('bank', e.target.value)}>
                                            <option value="">은행을 선택하세요</option>
                                            <option value="KB국민은행">KB국민은행</option>
                                            <option value="신한은행">신한은행</option>
                                            <option value="우리은행">우리은행</option>
                                            <option value="하나은행">하나은행</option>
                                            <option value="NH농협">NH농협</option>
                                            <option value="카카오뱅크">카카오뱅크</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>계좌번호</label>
                                        <input type="text" placeholder="- 없이 입력하세요" value={transferInfo.accountNum} onChange={(e) => handleTransferChange('accountNum', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>예금주명</label>
                                        <input type="text" placeholder="본인 명의 예금주" value={transferInfo.owner} onChange={(e) => handleTransferChange('owner', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>계좌 비밀번호 앞 2자리</label>
                                        <input type="password" placeholder="**" maxLength="2" style={{ width: '50%' }} value={transferInfo.pw} onChange={(e) => handleTransferChange('pw', e.target.value)} />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button className="back-btn" onClick={() => setPaymentStep('select')}>이전</button>
                                    <button className="confirm-pay-btn" onClick={() => handlePayment('계좌이체')}>결제하기</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
