import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, useSearchParams, Navigate } from 'react-router-dom';
import client from '../api/client';
import '../css/App.css';
import MainScreen from './MainScreen';
import LoginScreen from './LoginScreen';
import CreateCalli from './CreateCalli';
import FindAccount from './FindAccount';
import SignUp from './SignUp';
import WelcomeModal from './WelcomeModal';
import SharedView from './SharedView';
import QA from './QA';
import MyPage from './MyPage';
import ServiceInfo from './ServiceInfo';
import AdminLayout from './AdminLayout';
import AdminInquiry from './AdminInquiry';
import AdminMember from './AdminMember';
import Notice from './Notice';
import FAQ from './FAQ';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import ScrollToTopButton from '../components/ScrollToTopButton';

// 임시 데이터 생성 함수 (History) - Global로 이동
const createMockHistory = () => {
  const today = new Date();
  const history = [];

  // 1. 최근 항목 (다운로드 가능)
  history.push({
    id: 1,
    imageUrl: '/assets/sample_calli_1.png',
    inputText: '아름다운 강산',
    createdAt: new Date(today.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    downloadCount: 0,
    maxDownload: 3
  });
  return history;
};

// 임시 데이터 생성 함수 (Wishlist) - Global로 이동
const createMockWishlist = () => {
  const today = new Date();
  const list = [];
  // 3개 아이템 생성 (테스트용)
  for (let i = 1; i <= 3; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    list.push({
      id: i,
      imageUrl: '/assets/sample_calli_1.png',
      title: i % 2 === 0 ? '사랑합니다' : '행복하세요',
      createdAt: date.toISOString()
    });
  }
  return list;
};

// 임시 리뷰 데이터 생성 함수 - Global로 이동
const createMockReviews = () => [
  { id: 1, initial: "형", name: "형*호", rating: 5, text: "모바일 청첩장 문구를 만들려고 했는대, 정말 감성적이고 예쁜 캘리그라피가 나왔어요! 직접 작가님께 의뢰하는 것보다 훨씬 빠르고 간편했습니다!", color: "avatar-blue", createdAt: new Date().toISOString() },
  { id: 2, initial: "이", name: "이*민", rating: 5, text: "카페 메뉴판에 사용할 캘리그라피를 찾고 있었는데, 여러 스타일을 직접 비교해보고 선택할 수 있어서 너무 좋았어요. 가성비 최고!", color: "avatar-pink", createdAt: new Date().toISOString() },
  { id: 3, initial: "박", name: "박*연", rating: 4, text: "SNS 프로필 이미지로 사용하려고 만들었는데, 정말 만족한 결과였어요! 제가 원하는 스타일로 나와서 신기했습니다!", color: "avatar-green", createdAt: new Date().toISOString() },
  { id: 4, initial: "김", name: "김*수", rating: 5, text: "부모님 생신 축하 문구를 만들어 드렸는데 너무 좋아하시네요. 따뜻한 느낌의 붓글씨 스타일이 정말 마음에 듭니다.", color: "avatar-blue", createdAt: new Date().toISOString() },
  { id: 5, initial: "최", name: "최*영", rating: 5, text: "로고 디자인 아이데이션 할 때 정말 유용해요. 다양한 시안을 바로바로 볼 수 있어서 시간 절약이 많이 됩니다.", color: "avatar-green", createdAt: new Date().toISOString() }
];

// Wrapper for SharedView to extract params
const SharedViewWrapper = ({ onGoHome }) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const prompt = searchParams.get('prompt');
  const style = searchParams.get('style');
  const imageUrl = searchParams.get('imageUrl');

  const sharedData = (prompt || style || imageUrl) ? { prompt, style, imageUrl } : null;

  return <SharedView shareId={id} sharedData={sharedData} onGoHome={onGoHome} />;
};

// Protected Route Component
const ProtectedRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) {
    // 로그아웃 상태에서 접근 시 로그인 페이지로 리다이렉트 (replace로 기록 덮어쓰기)
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // 페이지 이동 시 최상단 스크롤
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
  const [userName, setUserName] = useState(''); // 사용자 이름
  const [userEmail, setUserEmail] = useState(''); // 사용자 이메일
  const [userPhone, setUserPhone] = useState('010-0000-0000'); // 사용자 휴대폰 번호
  const [showWelcomeModal, setShowWelcomeModal] = useState(false); // 환영 모달 표시 여부
  const [myPageKey, setMyPageKey] = useState(0); // 마이페이지 강제 리프레시용 키

  // Global Data State
  const [userTokenCount, setUserTokenCount] = useState(50); // 기본 토큰
  const [userFreeDownloadCount, setUserFreeDownloadCount] = useState(0); // 무료 횟수 (명수마을깡패용)
  const [wishlistItems, setWishlistItems] = useState([]); // 기본 빈 배열 (신규 회원)
  const [historyList, setHistoryList] = useState([]); // 기본 빈 배열 (신규 회원)
  const [paymentHistory, setPaymentHistory] = useState([]); // 결제 내역 전역 관리

  // 리뷰 데이터 상태 관리
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('app_reviews_v1');
    return saved ? JSON.parse(saved) : createMockReviews();
  });

  const [adminView, setAdminView] = useState('inquiry'); // Admin current view

  // [보안 기능] 이미지 우클릭/드래그 방지 및 캡쳐/저장 단축키 차단
  useEffect(() => {
    // 1. 이미지 우클릭 방지
    const handleContextMenu = (e) => {
      // 이벤트 타겟이 이미지 태그이거나, role이 presentation이 아닌 이미지인 경우 차단
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    // 2. 이미지 드래그 방지
    const handleDragStart = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    // 3. 캡쳐 및 개발자 도구 단축키 차단
    const handleKeyDown = (e) => {
      // F12 (개발자 도구)
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }

      // Ctrl 키 조합 차단
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 's': // 저장
          case 'p': // 인쇄
          case 'u': // 소스 보기
            e.preventDefault();
            break;
          default:
            break;
        }

        // Ctrl + Shift 조합
        if (e.shiftKey) {
          switch (e.key.toLowerCase()) {
            case 'i': // 개발자 도구
            case 'j': // 콘솔
            case 'c': // 요소 검사
              e.preventDefault();
              break;
            default:
              break;
          }
        }
      }

      // Windows 키 (Meta) + Shift + S 조합 차단 시도
      if ((e.metaKey || e.key === 'Meta') && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);

    // 클린업 함수
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const goToLogin = () => { navigate('/login'); setIsSidebarOpen(false); };
  const goToMain = () => {
    navigate('/');
    window.scrollTo(0, 0); // 최상단 이동
    setIsSidebarOpen(false);
  };

  const goToCreate = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      navigate('/login');
      setIsSidebarOpen(false);
      return;
    }
    navigate('/create');
    setIsSidebarOpen(false);
  };

  const goToFindAccount = () => { navigate('/find-account'); setIsSidebarOpen(false); };
  const goToSignUp = () => { navigate('/signup'); setIsSidebarOpen(false); };

  const handleLoginSuccess = (name) => {
    // 명수마을깡패 로직
    if (name === '명수마을깡패') {
      localStorage.removeItem('visited_user1');
      localStorage.removeItem('review_prompt_completed'); // 테스트용: 후기 모달 리셋

      // [Reset Logic] 무료 3회, 토큰 0개, 히스토리/위시리스트 초기화
      setUserFreeDownloadCount(3);
      setUserTokenCount(0);
      setHistoryList([]);
      setWishlistItems([]);
      setUserEmail('test@example.com');
      setUserPhone('010-1234-5678');
    } else {
      // 일반 유저: 백엔드에서 최신 정보 가져오기
      fetchMyData();
    }

    setIsLoggedIn(true);
    setUserName(name);

    // 관리자면 admin 화면으로, 아니면 main으로
    if (name === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }

    setIsSidebarOpen(false);

    if (name === '명수마을깡패' && !localStorage.getItem('visited_user1')) {
      setShowWelcomeModal(true);
    }
  };

  // ✅ 사용자 정보 최신화 함수 (백엔드 연동)
  const fetchMyData = async () => {
    try {
      const res = await client.get('/user/me');
      if (res.status === 200 && res.data) {
        const data = res.data;
        // DB 데이터로 상태 업데이트
        setUserName(data.userName || data.loginId);
        setUserEmail(data.userEmail || '');
        setUserPhone(data.userPhone || '');

        // 토큰 및 크레딧
        // DB의 balance/freeToken을 어떻게 매핑할지 결정
        // 현재 프론트: userTokenCount, userFreeDownloadCount
        // 백엔드: freeToken(무료횟수), balance(보유토큰?) 추정 (UserEntity 확인 결과: balance=int, freeToken=int)

        setUserTokenCount(data.balance || 0);
        setUserFreeDownloadCount(data.freeToken || 0);

        // 2. 위시리스트 가져오기
        try {
          const wishRes = await client.get('/image/wishlist');
          if (wishRes.status === 200 && wishRes.data) {
            const mappedWishlist = wishRes.data.map(item => ({
              id: item.wishlistId,
              imageUrl: item.imgPath,
              title: item.textPrompt || '제목 없음',
              calliId: item.calliId,
              createdAt: new Date().toISOString() // API에 날짜가 없으면 현재 시간
            }));
            setWishlistItems(mappedWishlist);
          }
        } catch (wErr) {
          console.error("Failed to fetch wishlist:", wErr);
        }

        console.log("Fetched user data:", data);
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      // 세션 만료 등의 이유로 실패 시 로그아웃 처리할 수도 있음
    }
  };

  // 로그인 상태 복구 (새로고침 시)
  useEffect(() => {
    // 클라이언트 세션 쿠키가 있다고 가정하고 시도
    fetchMyData().then(() => {
      // 성공하면 isLoggedIn = true로 설정하는 로직이 필요할 수 있음
      // 하지만 client.js가 401을 뱉으면 catch로 빠짐.
      // 여기서는 간단히 '이미 로그인된 상태'라고 판단되면 데이터를 갱신하는 용도로 사용
    });
  }, []); // 마운트 시 1회 시도

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    // replace: true를 사용하여 로그아웃 시 현재 페이지 기록을 메인으로 대체 (뒤로가기 시 다시 못 돌아오게 함)
    navigate('/', { replace: true });
    window.scrollTo(0, 0); // 메인 화면 최상단으로 스크롤 이동
    setIsSidebarOpen(false);
    localStorage.removeItem('create_history');
  };

  const handleModalStart = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('visited_user1', 'true');
    goToCreate();
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleMyPageClick = (view = 'dashboard') => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      navigate('/login');
      setIsSidebarOpen(false);
      return;
    }
    // 마이페이지로 이동하면서 view state 전달
    navigate('/mypage', { state: { view } });
    setMyPageKey(prev => prev + 1); // 키를 변경하여 컴포넌트 강제 리마운트 필요 시
    setIsSidebarOpen(false);
  };

  const handleProfileUpdate = (newData) => {
    if (newData.name) setUserName(newData.name);
    if (newData.email) setUserEmail(newData.email);
    if (newData.phone) setUserPhone(newData.phone);
  };

  const handleInquiryClick = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      navigate('/login');
      setIsSidebarOpen(false);
      return;
    }
    navigate('/qa');
    setIsSidebarOpen(false);
  };

  const handleInquiryMenuClick = () => { handleInquiryClick(); };

  const handleGoToService = (tab = 'intro') => {
    navigate('/service', { state: { tab } });
    setIsSidebarOpen(false);
  };

  const handleGoToNotice = () => {
    navigate('/notice');
    setIsSidebarOpen(false);
  };

  const handleGoToFAQ = () => {
    navigate('/faq');
    setIsSidebarOpen(false);
  };

  // Data Handlers
  const addToWishlist = (imageSrc, text) => {
    const imgUrl = typeof imageSrc === 'string' ? imageSrc : imageSrc.image;
    const isDuplicate = wishlistItems.some(item => item.imageUrl === imgUrl);
    if (isDuplicate) return false;

    const newItem = {
      id: Date.now(),
      imageUrl: imgUrl,
      title: text || '제목 없음',
      createdAt: new Date().toISOString()
    };
    setWishlistItems(prev => [newItem, ...prev]);
    return true;
  };

  const addToHistory = (imageSrc, text) => {
    const imgUrl = typeof imageSrc === 'string' ? imageSrc : imageSrc.image;
    const newItem = {
      id: Date.now(),
      imageUrl: imgUrl,
      inputText: text || '생성된 이미지',
      createdAt: new Date().toISOString(),
      downloadCount: 0,
      maxDownload: 3
    };
    setHistoryList(prev => [newItem, ...prev]);
  };

  const handleAddReview = (newReview) => {
    let maskedName = '익명';
    if (userName) {
      if (userName.length === 2) {
        maskedName = userName.charAt(0) + '*';
      } else if (userName.length > 2) {
        const first = userName.charAt(0);
        const last = userName.charAt(userName.length - 1);
        maskedName = first + '*' + last;
      } else {
        maskedName = userName;
      }
    }

    const reviewWithMeta = {
      ...newReview,
      id: Date.now(),
      initial: userName ? userName.charAt(0) : 'G', // Guest or Name
      name: maskedName,
      color: ['avatar-blue', 'avatar-pink', 'avatar-green'][Math.floor(Math.random() * 3)],
      createdAt: new Date().toISOString()
    };

    const updatedReviews = [reviewWithMeta, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem('app_reviews_v1', JSON.stringify(updatedReviews));
    return true;
  };

  // Derived state for visibility
  const path = location.pathname;
  const isSharedScreen = path.startsWith('/share');
  // Auth screen check: exact match
  const isAuthScreen = ['/login', '/signup', '/find-account'].includes(path);
  // Admin screen check
  const isAdminScreen = path.startsWith('/admin');

  // Admin View Rendering
  if (isAdminScreen) {
    // Note: AdminLayout contains Sidebar/Header typically? Or is distinct?
    // Based on original, it rendered INSTEAD of main structure.
    return (
      <AdminLayout
        onLogout={handleLogout}
        currentView={adminView}
        setCurrentView={setAdminView}
      >
        {adminView === 'inquiry' && <AdminInquiry />}
        {adminView === 'member' && <AdminMember />}
      </AdminLayout>
    );
  }

  return (
    <div className="master-app">
      {/* 배경 블러 효과 */}
      <div className="bg-blur-container">
        <div className="bg-blur bg-blur-1"></div>
        <div className="bg-blur bg-blur-2"></div>
        <div className="bg-blur-3"></div>
      </div>

      {/* 신규 사용자 환영 모달 */}
      {showWelcomeModal && (
        <WelcomeModal userName={userName} onStart={handleModalStart} />
      )}

      {/* 사이드바 (공유 화면 제외) */}
      {!isSharedScreen && (
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          goToMain={goToMain}
          currentScreen={path === '/' ? 'main' : path.substring(1)} // Approximate screen name for logic
          goToCreate={goToCreate}
          handleInquiryMenuClick={handleInquiryMenuClick}
          isLoggedIn={isLoggedIn}
          handleMyPageClick={handleMyPageClick}
          handleLogout={handleLogout}
        />
      )}

      <div className={`master-layout ${isSidebarOpen ? 'sidebar-open' : ''} ${isSharedScreen ? 'no-header' : ''}`}>
        {!isSharedScreen && (
          <Header
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            goToMain={goToMain}
            isLoggedIn={isLoggedIn}
            userName={userName}
            goToLogin={goToLogin}
          />
        )}

        <main className="screen-container">
          <Routes>
            <Route path="/" element={<MainScreen onStart={goToCreate} onLogin={goToLogin} reviews={reviews} />} />
            <Route path="/login" element={<LoginScreen onGoHome={goToMain} onFindAccount={goToFindAccount} onSignUp={goToSignUp} onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/find-account" element={<FindAccount onGoLogin={goToLogin} />} />
            <Route path="/signup" element={<SignUp onGoLogin={goToLogin} />} />
            <Route path="/qa" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <QA userName={userName} />
              </ProtectedRoute>
            } />
            <Route path="/service" element={<ServiceInfo initialTab={location.state?.tab || 'intro'} />} />
            <Route path="/share/:id" element={<SharedViewWrapper onGoHome={goToMain} />} />
            <Route path="/notice" element={<Notice />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/mypage" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <MyPage
                  key={myPageKey}
                  userName={userName}
                  userEmail={userEmail}
                  userPhone={userPhone} // Pass userPhone
                  onUpdateProfile={handleProfileUpdate} // Pass update handler
                  initialView={location.state?.view || 'dashboard'}
                  tokenCount={userTokenCount}
                  setTokenCount={setUserTokenCount}
                  historyList={historyList}
                  setHistoryList={setHistoryList}
                  wishlistItems={wishlistItems}
                  setWishlistItems={setWishlistItems}
                  paymentHistory={paymentHistory}
                  setPaymentHistory={setPaymentHistory}
                />
              </ProtectedRoute>
            } />
            <Route path="/create" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <CreateCalli
                  onGoHome={goToMain}
                  tokenCount={userTokenCount}
                  setTokenCount={setUserTokenCount}
                  freeCredits={userFreeDownloadCount}
                  setFreeCredits={setUserFreeDownloadCount}
                  onAddToWishlist={addToWishlist}
                  onAddToHistory={addToHistory}
                  onGoToCharge={() => handleMyPageClick('charge')}
                  onAddReview={handleAddReview}
                />
              </ProtectedRoute>
            } />

            {/* Catch all redirect to main */}
            <Route path="*" element={<MainScreen onStart={goToCreate} onLogin={goToLogin} />} />
          </Routes>
        </main>

        {/* Footer (로그인 관련 화면 및 공유 화면 제외) */}
        {!isAuthScreen && !isSharedScreen && (
          <Footer
            onGoToService={handleGoToService}
            onGoToNotice={handleGoToNotice}
            onGoToFAQ={handleGoToFAQ}
            onGoToInquiry={handleInquiryClick}
          />
        )}
      </div>

      {path === '/' && <ScrollToTopButton />}
    </div>
  );
}

export default App;
