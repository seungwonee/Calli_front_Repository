import React, { useState, useEffect } from 'react';
import '../css/Admin.css';

const DEFAULT_ANSWER_TEMPLATE = `안녕하세요, Calli For You입니다.
우선 사용에 불편을 드려서 죄송합니다.
문의 주셨던 내용에 대하여 아래 답변 드리니 확인 부탁드리겠습니다.

`;

export default function AdminInquiry() {
    // 문의 목록 데이터 (localStorage 연동)
    const [inquiries, setInquiries] = useState(() => {
        const saved = localStorage.getItem('inquiries');
        let data = saved ? JSON.parse(saved) : [];

        // 데이터 무결성 검사: 답변이 없거나 템플릿만 있는데 상태가 진행중/완료라면 'waiting'으로 강제 보정
        data = data.map(item => {
            const answerText = item.answer ? item.answer.trim() : '';
            const isTemplate = answerText === DEFAULT_ANSWER_TEMPLATE.trim() || answerText === '';

            if (isTemplate && item.status !== 'waiting') {
                return { ...item, status: 'waiting' };
            }
            return item;
        });

        return data;
    });

    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'waiting', 'processing', 'completed'

    // 데이터 저장
    useEffect(() => {
        localStorage.setItem('inquiries', JSON.stringify(inquiries));
    }, [inquiries]);

    // 필터링
    const filteredInquiries = inquiries.filter(item => {
        if (activeTab === 'all') return true;
        // status가 없는 옛날 데이터는 'waiting'취급
        const status = item.status || 'waiting';
        return status === activeTab;
    }).sort((a, b) => b.id - a.id); // 최신순(ID 역순) 정렬

    // 상세 보기 클릭
    const handleRowClick = (inquiry) => {
        setSelectedInquiry(inquiry);
        // 기존 답변이 있으면 그것을, 없으면 템플릿을 로드
        setReplyContent(inquiry.answer || DEFAULT_ANSWER_TEMPLATE);
    };

    // 상태 업데이트 함수 (내부적으로만 사용하거나, 특정 액션에서 호출)
    const updateStatus = (id, newStatus) => {
        setInquiries(prev => prev.map(item =>
            item.id === id ? { ...item, status: newStatus } : item
        ));
        if (selectedInquiry && selectedInquiry.id === id) {
            setSelectedInquiry(prev => ({ ...prev, status: newStatus }));
        }
    };

    // 임시 저장
    const handleTempSave = () => {
        if (!replyContent.trim()) {
            alert('내용을 입력해주세요.');
            return;
        }

        // 템플릿만 있는 경우 'waiting', 내용이 추가된 경우 'processing'
        const isTemplateOnly = replyContent.trim() === DEFAULT_ANSWER_TEMPLATE.trim();
        const nextStatus = isTemplateOnly ? 'waiting' : 'processing';

        setInquiries(prev => prev.map(item => {
            if (item.id === selectedInquiry.id) {
                return {
                    ...item,
                    answer: replyContent,
                    status: nextStatus, // 조건부 상태 변경
                    answerDate: new Date().toISOString()
                };
            }
            return item;
        }));

        // 현재 선택된 객체 상태도 동기화 (UI 즉시 반영)
        setSelectedInquiry(prev => ({
            ...prev,
            answer: replyContent,
            status: nextStatus
        }));

        alert('임시 저장되었습니다.');
    };

    // 답변 등록
    const handleReplySubmit = () => {
        if (!replyContent.trim()) {
            alert('답변 내용을 입력해주세요.');
            return;
        }

        if (window.confirm("답변을 등록하시겠습니까? 등록 후에는 수정할 수 없습니다.")) {
            setInquiries(prev => prev.map(item => {
                if (item.id === selectedInquiry.id) {
                    return {
                        ...item,
                        answer: replyContent,
                        status: 'completed',
                        answerDate: new Date().toISOString()
                    };
                }
                return item;
            }));

            alert('답변이 등록되었습니다.');
            setSelectedInquiry(null);
            setReplyContent('');
        }
    };

    const handleCloseDetail = () => {
        setSelectedInquiry(null);
        setReplyContent('');
    };

    // 상태 뱃지 렌더링
    const renderStatusBadge = (status) => {
        const s = status || 'waiting';
        let label = '';
        let className = '';

        switch (s) {
            case 'completed': label = '답변 완료'; className = 'badge-completed'; break;
            case 'processing': label = '답변 중'; className = 'badge-processing'; break;
            default: label = '답변 대기'; className = 'badge-waiting'; break;
        }
        return <span className={`status-badge ${className}`}>{label}</span>;
    };

    const REPLY_TEMPLATES = [
        {
            title: '확인 중입니다',
            icon: '🕒',
            content: '문의 주신 내용을 확인 중입니다. 빠른 시일 내에 답변드리겠습니다. 감사합니다.'
        },
        {
            title: '업데이트 예정',
            icon: '🛠️',
            content: '소중한 의견 감사합니다. 말씀하신 기능/문제는 다음 업데이트에 반영될 예정입니다. 더 나은 서비스를 제공할 수 있도록 노력하겠습니다. 감사합니다.'
        },
        {
            title: '문제 해결됨',
            icon: '✅',
            content: '해당 문제가 해결되었습니다. 불편을 드려 죄송합니다. 추가 문의사항이 있으시면 언제든지 연락 주세요.'
        }
    ];

    const handleTemplateClick = (text) => {
        setReplyContent(DEFAULT_ANSWER_TEMPLATE + text);
    };

    return (
        <div className="admin-inquiry-container">
            {selectedInquiry ? (
                // 상세 보기 및 답변 작성 모드
                <div className="inquiry-detail-view">
                    <div className="detail-header">
                        <h2>문의 상세 내용</h2>
                    </div>

                    <div className="detail-content-card">
                        <div className="admin-info-row">
                            <span className="label" >제목</span>
                            <span className="value">{selectedInquiry.title}</span>
                        </div>
                        <div className="admin-info-row">
                            <span className="label">작성자</span>
                            <span className="value">{selectedInquiry.author}</span>
                        </div>
                        <div className="admin-info-row">
                            <span className="label">작성일</span>
                            <span className="value">{selectedInquiry.date}</span>
                        </div>
                        <div className="admin-info-row">
                            <span className="label">상태</span>
                            <div className="value">{renderStatusBadge(selectedInquiry.status)}</div>
                        </div>

                        <div className="content-box">
                            <p>{selectedInquiry.content}</p>
                        </div>
                    </div>

                    {/* 답변 템플릿 섹션 */}
                    {selectedInquiry.status !== 'completed' && (
                        <div className="template-section">
                            <h3 className="template-header">
                                <span className="header-icon">💡</span> 답변 템플릿
                            </h3>
                            <div className="template-list">
                                {REPLY_TEMPLATES.map((tpl, idx) => (
                                    <div key={idx} className="template-card" onClick={() => handleTemplateClick(tpl.content)}>
                                        <div className="tpl-title">
                                            <span className="tpl-icon">{tpl.icon}</span> {tpl.title}
                                        </div>
                                        <div className="tpl-content">{tpl.content}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="reply-section">
                        <h3>답변 작성</h3>
                        <textarea
                            className="reply-textarea"
                            placeholder="답변 내용을 입력하세요..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            disabled={selectedInquiry.status === 'completed'} // 완료된 건은 수정 불가
                        />
                        <div className="reply-actions">
                            <button className="cancel-btn" onClick={handleCloseDetail}>취소</button>
                            {selectedInquiry.status !== 'completed' && (
                                <>
                                    <button className="temp-save-btn" onClick={handleTempSave}>임시저장</button>
                                    <button className="submit-btn" onClick={handleReplySubmit}>답변등록</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                // 목록 뷰
                <>
                    <div className="filter-tabs">
                        <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>전체</button>
                        <button className={`tab-btn ${activeTab === 'waiting' ? 'active' : ''}`} onClick={() => setActiveTab('waiting')}>답변 대기</button>
                        <button className={`tab-btn ${activeTab === 'processing' ? 'active' : ''}`} onClick={() => setActiveTab('processing')}>답변 중</button>
                        <button className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>답변 완료</button>
                    </div>

                    <div className="inquiry-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th width="50">No</th>
                                    <th width="100">카테고리</th>
                                    <th width="300">제목</th>
                                    <th width="100">작성자</th>
                                    <th width="100">작성일</th>
                                    <th width="80">상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInquiries.length > 0 ? filteredInquiries.map((item, idx) => (
                                    <tr key={item.id} onClick={() => handleRowClick(item)}>
                                        <td>{item.id}</td>
                                        <td>{item.category}</td>
                                        <td>{item.title}</td>
                                        <td>{item.author}</td>
                                        <td>{item.date}</td>
                                        <td>{renderStatusBadge(item.status)}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="empty-message">문의 내역이 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
