import React, { useState, useEffect } from 'react';
import '../css/QA.css';

export default function QA({ userName }) {
    // view: 'list', 'create', 'detail', 'edit'
    const [view, setView] = useState('list');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // 문의 목록 데이터 (localStorage 연동)
    const [inquiries, setInquiries] = useState(() => {
        const saved = localStorage.getItem('inquiries');
        let initialData = [];
        if (saved) {
            initialData = JSON.parse(saved);
            // 기존 데이터가 있다면, 샘플 데이터(ID:1)의 답변을 최신 포맷으로 업데이트 (마이그레이션)
            initialData = initialData.map(item => {
                if (item.id === 1 && item.answer === '회원가입 후 최초 3회만 제공됩니다.') {
                    return {
                        ...item,
                        answer: '안녕하세요, Calli For You입니다.\n우선 사용에 불편을 드려서 죄송합니다.\n문의 주셨던 내용에 대하여 아래 답변 드리니 확인 부탁드리겠습니다.\n\n회원가입 후 최초 3회만 제공됩니다.'
                    };
                }
                return item;
            });
        } else {
            initialData = [
                // 초기 샘플 데이터
                { id: 1, category: '이용문의', title: '무료 횟수는 언제 리셋되나요?', content: '매일 리셋되는 건가요?', author: 'user1', date: '2024-01-01', status: 'completed', answer: '안녕하세요, Calli For You입니다.\n우선 사용에 불편을 드려서 죄송합니다.\n문의 주셨던 내용에 대하여 아래 답변 드리니 확인 부탁드리겠습니다.\n\n회원가입 후 최초 3회만 제공됩니다.' },
                { id: 2, category: '오류신고', title: '이미지 생성이 안 돼요', content: '생성 버튼을 눌러도 반응이 없습니다.', author: '명수마을깡패', date: '2024-01-02', status: 'waiting', answer: '' }
            ];
        }
        return initialData;
    });

    const [selectedId, setSelectedId] = useState(null);
    const [formData, setFormData] = useState({ category: '기능 문의', title: '', content: '' });

    // 검색 및 필터 상태
    const [searchType, setSearchType] = useState('all'); // 'all' (제목+내용), 'author'
    const [searchTerm, setSearchTerm] = useState('');
    const [onlyMyQuestions, setOnlyMyQuestions] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('전체');

    // 데이터 변경 시 로컬스토리지 저장
    useEffect(() => {
        localStorage.setItem('inquiries', JSON.stringify(inquiries));
    }, [inquiries]);

    // 목록 필터링 로직
    const getFilteredInquiries = () => {
        return inquiries.filter(item => {
            // 1. 내 질문만 보기 필터
            if (onlyMyQuestions && item.author !== userName) return false;

            // 2. 카테고리 필터
            if (selectedCategory !== '전체' && item.category !== selectedCategory) return false;

            // 3. 검색어 필터
            if (searchTerm.trim()) {
                if (searchType === 'author') {
                    return item.author.includes(searchTerm);
                } else {
                    return item.title.includes(searchTerm) || item.content.includes(searchTerm);
                }
            }
            return true;
        }).sort((a, b) => new Date(b.date) - new Date(a.date)); // 최신순 정렬
    };

    // 화면 전환 핸들러
    const goToList = () => {
        setView('list');
        setSelectedId(null);
        setFormData({ category: '기능 문의', title: '', content: '' });
    };

    const goToCreate = () => {
        setFormData({ category: '기능 문의', title: '', content: '' });
        setView('create');
    };

    const goToDetail = (id) => {
        setSelectedId(id);
        setView('detail');
    };

    const goToEdit = (item) => {
        setFormData({ category: item.category, title: item.title, content: item.content });
        setView('edit');
    };

    // 작성 제출 핸들러
    const handleSubmit = () => {
        if (!formData.title.trim() || !formData.content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        const newId = inquiries.length > 0 ? Math.max(...inquiries.map(i => i.id)) + 1 : 1;
        const newInquiry = {
            id: newId,
            ...formData,
            author: userName,
            date: new Date().toISOString().split('T')[0],
            status: 'waiting',
            answer: ''
        };

        setInquiries([newInquiry, ...inquiries]);
        alert('문의가 등록되었습니다.');
        // 등록 후 바로 상세 화면(답변 대기)으로 이동
        setSelectedId(newId);
        setView('detail');
    };

    // 수정 제출 핸들러
    const handleUpdate = () => {
        if (!formData.title.trim() || !formData.content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        const updatedInquiries = inquiries.map(item =>
            item.id === selectedId
                ? { ...item, ...formData }
                : item
        );

        setInquiries(updatedInquiries);
        alert('수정되었습니다.');
        setView('detail');
    };

    // 현재 선택된 문의 아이템 찾기
    const currentItem = inquiries.find(item => item.id === selectedId);

    // --- 렌더링 ---

    // 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // ... (keep existing effects and handlers) ...

    // 1. 목록 화면
    const renderList = () => {
        const filteredItems = getFilteredInquiries();
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
        const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

        const paginate = (pageNumber) => setCurrentPage(pageNumber);

        return (
            <div className="inquiry-container">
                <div className="inquiry-header">
                    <div className="header-title">
                        <h2>문의사항</h2>
                    </div>
                    <div className="header-actions">
                        <button className="create-btn" onClick={goToCreate}>
                            <span>✏️</span> 새 질문 작성
                        </button>
                    </div>
                </div>

                <div className="filter-section">
                    {/* ... (keep filter section content exactly as is) ... */}
                    <div className="filter-left-group" style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                        <select
                            className="search-select"
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setCurrentPage(1); // 카테고리 변경 시 1페이지로 리셋
                            }}
                        >
                            <option value="전체">전체 카테고리</option>
                            <option value="기능 문의">기능 문의</option>
                            <option value="사용 방법">사용 방법</option>
                            <option value="오류 신고">오류 신고</option>
                            <option value="기타">기타</option>
                        </select>

                        <div className="search-box">
                            <select
                                className="search-select"
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}
                            >
                                <option value="all">제목 + 내용</option>
                                <option value="author">작성자</option>
                            </select>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="검색어를 입력하세요"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // 검색어 변경 시 1페이지로 리셋
                                }}
                            />
                        </div>
                    </div>
                    <label className="toggle-wrapper">
                        <span className="toggle-label">내 질문만 보기</span>
                        <div className="toggle-switch">
                            <input
                                type="checkbox"
                                className="toggle-input"
                                checked={onlyMyQuestions}
                                onChange={(e) => {
                                    setOnlyMyQuestions(e.target.checked);
                                    setCurrentPage(1); // 내 질문 필터 변경 시 1페이지로 리셋
                                }}
                            />
                            <span className="toggle-slider"></span>
                        </div>
                    </label>
                </div>

                <div className="inquiry-list-body">
                    <table className="inquiry-table">
                        <thead>
                            <tr>
                                <th width="10%">번호</th>
                                <th width="15%">카테고리</th>
                                <th width="40%">제목</th>
                                <th width="15%">작성자</th>
                                <th width="10%">상태</th>
                                <th width="10%">날짜</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map(item => (
                                    <tr key={item.id} className="inquiry-row" onClick={() => goToDetail(item.id)}>
                                        <td>{item.id}</td>
                                        <td>{item.category}</td>
                                        <td>{item.title}</td>
                                        <td>{item.author}</td>
                                        <td>
                                            <span className={`status-badge ${item.status}`}>
                                                {item.status === 'waiting' ? '답변 대기' : '답변 완료'}
                                            </span>
                                        </td>
                                        <td>{item.date}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="empty-state">문의 내역이 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="page-btn nav-btn"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            &lt;
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                onClick={() => paginate(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            className="page-btn nav-btn"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // 2. 작성 화면
    const renderCreate = () => (
        <div className="inquiry-container">
            <div className="inquiry-header">
                <div className="header-title">
                    <h2>작성하기</h2>
                </div>
            </div>
            <div className="write-container">
                <div className="form-group">
                    <label className="form-label">카테고리</label>
                    <select
                        className="form-select short-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option>기능 문의</option>
                        <option>사용 방법</option>
                        <option>오류 신고</option>
                        <option>기타</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">제목</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="제목을 입력하세요"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">내용</label>
                    <div className="textarea-wrapper">
                        <textarea
                            className="form-textarea"
                            // placeholder="문의하실 내용을 자세히 적어주세요."
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                        {!formData.content && (
                            <div className="placeholder-tip">
                                <div className="tip-title">💡 작성 팁</div>
                                <ul className="tip-list">
                                    <li>구체적인 상황을 설명해주시면 더 정확한 답변을 받을 수 있습니다</li>
                                    <li>오류 화면이나 예시가 있다면 함께 공유해주세요</li>
                                    <li>질문하기 전에 기존 Q&A를 먼저 확인해보세요</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                <div className="btn-group">
                    <button className="btn-cancel" onClick={goToList}>취소</button>
                    <button className="btn-submit" onClick={handleSubmit}>등록하기</button>
                </div>
            </div>
        </div>
    );

    // 3. 상세 화면 (대기/완료 공통)
    const renderDetail = () => {
        if (!currentItem) return null;
        const isWaiting = currentItem.status === 'waiting';

        return (
            <div className="inquiry-container">
                <div className="inquiry-header">
                    <div className="header-title">
                        <h2>{currentItem.title}</h2>
                        <span className="category-label">{currentItem.category}</span>
                        <span className={`status-badge ${currentItem.status}`}>
                            {isWaiting ? '답변 대기' : '답변 완료'}
                        </span>
                    </div>
                </div>
                <div className="detail-container">
                    <div className="form-group">
                        <div className="detail-meta" style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>
                            작성자: {currentItem.author} | 작성일: {currentItem.date}
                        </div>
                        <div className="detail-content">
                            {currentItem.content}
                        </div>
                    </div>

                    {!isWaiting && (
                        <div className="answer-section">
                            <div className="answer-header">
                                <span>💬 답변 내용</span>
                            </div>
                            <div className="answer-content">
                                {currentItem.answer}
                            </div>
                        </div>
                    )}

                    <div className="btn-group">
                        <button className="btn-cancel" onClick={goToList}>목록으로</button>
                        {/* 답변 대기 상태이고, 본인 글일 때만 수정 가능 */}
                        {isWaiting && currentItem.author === userName && (
                            <button className="btn-edit" onClick={() => goToEdit(currentItem)}>수정하기</button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // 4. 수정 화면
    const renderEdit = () => (
        <div className="inquiry-container">
            <div className="inquiry-header">
                <div className="header-title">
                    <h2>답변 수정하기</h2>
                </div>
            </div>
            <div className="write-container">
                <div className="form-group">
                    <label className="form-label">카테고리</label>
                    <select
                        className="form-select short-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option>기능 문의</option>
                        <option>사용 방법</option>
                        <option>오류 신고</option>
                        <option>기타</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">제목</label>
                    <input
                        type="text"
                        className="form-input"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">내용</label>
                    <textarea
                        className="form-textarea"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    />
                </div>
                <div className="btn-group">
                    <button className="btn-cancel" onClick={() => goToDetail(selectedId)}>취소</button>
                    <button className="btn-submit" onClick={handleUpdate}>수정완료</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="inquiry-page-inner">
            {view === 'list' && renderList()}
            {view === 'create' && renderCreate()}
            {view === 'detail' && renderDetail()}
            {view === 'edit' && renderEdit()}
        </div>
    );
}
