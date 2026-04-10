import React, { useState, useEffect } from 'react';

const KAKAO_CLIENT_ID = process.env.REACT_APP_KAKAO_CLIENT_ID;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const API_BASE = 'http://175.45.195.169:8080';

// 카카오 리디렉트 페이지 컴포넌트
const KakaoRedirect = ({ onOAuthCallback }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isProcessing) return;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      alert(`카카오 로그인 오류: ${error}`);
      window.location.href = '/';
      return;
    }

    if (code) {
      setIsProcessing(true);
      window.history.replaceState({}, document.title, window.location.pathname);
      onOAuthCallback(code);
    } else {
      alert('인가 코드가 없습니다.');
    }
  }, [onOAuthCallback, isProcessing]);

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h2>🔄 카카오 로그인 처리 중...</h2>
      <p>잠시만 기다려주세요.</p>
    </div>
  );
};

// 구글 리디렉트 페이지 컴포넌트
const GoogleRedirect = ({ onOAuthCallback }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isProcessing) return;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      alert(`구글 로그인 오류: ${error}`);
      window.location.href = '/';
      return;
    }

    if (code) {
      setIsProcessing(true);
      window.history.replaceState({}, document.title, window.location.pathname);
      onOAuthCallback(code);
    } else {
      alert('인가 코드가 없습니다.');
    }
  }, [onOAuthCallback, isProcessing]);

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h2>🔄 구글 로그인 처리 중...</h2>
      <p>잠시만 기다려주세요.</p>
    </div>
  );
};

// 메인 앱 컴포넌트
const MainApp = ({ isLoggedIn, userToken, loginProvider, onKakaoLogin, onGoogleLogin, onLogout, testCors, response, error }) => {
  return (
    <div style={{ padding: 20 }}>
      <h1>CORS 테스트 & 소셜 로그인</h1>

      {/* 로그인 섹션 */}
      <div style={{ marginBottom: 30, padding: 20, border: '1px solid #ddd', borderRadius: 5 }}>
        <h2>🔐 소셜 로그인</h2>
        {!isLoggedIn ? (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {/* 카카오 로그인 버튼 */}
            <button
              data-testid="kakao-login-btn"
              onClick={onKakaoLogin}
              style={{
                backgroundColor: '#FEE500',
                color: '#000',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 5,
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              카카오로 로그인
            </button>

            {/* 구글 로그인 버튼 */}
            <button
              data-testid="google-login-btn"
              onClick={onGoogleLogin}
              style={{
                backgroundColor: '#fff',
                color: '#444',
                border: '1px solid #ddd',
                padding: '10px 20px',
                borderRadius: 5,
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              구글로 로그인
            </button>
          </div>
        ) : (
          <div>
            <p style={{ color: 'green' }}>
              ✅ {loginProvider === 'google' ? '구글' : '카카오'} 로그인 완료
            </p>
            <p><strong>토큰:</strong> {userToken.substring(0, 20)}...</p>
            <button
              data-testid="logout-btn"
              onClick={onLogout}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 5,
                cursor: 'pointer',
              }}
            >
              로그아웃
            </button>
          </div>
        )}
      </div>

      {/* API 테스트 섹션 */}
      <div style={{ padding: 20, border: '1px solid #ddd', borderRadius: 5 }}>
        <h2>🌐 API 테스트</h2>
        <button data-testid="api-test-btn" onClick={testCors}>API 호출 테스트</button>

        {response && (
          <div style={{ marginTop: 20, color: 'green' }}>
            <h3>✅ 응답 결과:</h3>
            <pre style={{ backgroundColor: '#f8f9fa', padding: 10, borderRadius: 3 }}>{response}</pre>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 20, color: 'red' }}>
            <h3>❌ 에러 발생:</h3>
            <pre style={{ backgroundColor: '#f8f9fa', padding: 10, borderRadius: 3 }}>{error}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

// 메인 App 컴포넌트
const App = () => {
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userToken, setUserToken] = useState('');
  const [loginProvider, setLoginProvider] = useState('');

  const currentPath = window.location.pathname;

  // 카카오 SDK 초기화
  useEffect(() => {
    if (!window.Kakao) {
      const script = document.createElement('script');
      script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
      script.onload = () => {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(KAKAO_CLIENT_ID);
        }
        console.log('카카오 SDK 초기화 완료');
      };
      document.head.appendChild(script);
    } else if (!window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_CLIENT_ID);
    }

    const savedToken = localStorage.getItem('userToken');
    const savedProvider = localStorage.getItem('loginProvider');
    if (savedToken) {
      setUserToken(savedToken);
      setIsLoggedIn(true);
      setLoginProvider(savedProvider || '');
    }
  }, []);

  // 카카오 OAuth 콜백
  const handleKakaoOAuthCallback = async (code) => {
    try {
      setError('');
      const res = await fetch(`${API_BASE}/api/v1/auth/kakao/callback?code=${code}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        const token = data.token || data.accessToken || data.access_token || 'token_received';
        setUserToken(token);
        setIsLoggedIn(true);
        setLoginProvider('kakao');
        localStorage.setItem('userToken', token);
        localStorage.setItem('loginProvider', 'kakao');
        alert('카카오 로그인 성공!');
      } else {
        const errorData = await res.text();
        throw new Error(`로그인 실패: ${res.status} - ${errorData}`);
      }
    } catch (err) {
      console.error('카카오 OAuth 오류:', err);
      setError('카카오 로그인 처리 중 오류가 발생했습니다: ' + err.message);
    }
  };

  // 구글 OAuth 콜백
  const handleGoogleOAuthCallback = async (code) => {
    try {
      setError('');
      const redirectUri = `${window.location.origin}/api/auth/google-redirect`;
      const res = await fetch(`${API_BASE}/api/v1/auth/google/callback?code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        const token = data.token || data.accessToken || data.access_token || 'token_received';
        setUserToken(token);
        setIsLoggedIn(true);
        setLoginProvider('google');
        localStorage.setItem('userToken', token);
        localStorage.setItem('loginProvider', 'google');
        alert('구글 로그인 성공!');
      } else {
        const errorData = await res.text();
        throw new Error(`로그인 실패: ${res.status} - ${errorData}`);
      }
    } catch (err) {
      console.error('구글 OAuth 오류:', err);
      setError('구글 로그인 처리 중 오류가 발생했습니다: ' + err.message);
    }
  };

  // 카카오 로그인 시작
  const handleKakaoLogin = () => {
    const redirectUri = `${window.location.origin}/api/auth/kakao-redirect`;
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    console.log('카카오 로그인 URL:', kakaoAuthUrl);
    window.location.assign(kakaoAuthUrl);
  };

  // 구글 로그인 시작
  const handleGoogleLogin = () => {
    const redirectUri = `${window.location.origin}/api/auth/google-redirect`;
    const scope = encodeURIComponent('openid email profile');
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline`;
    console.log('구글 로그인 URL:', googleAuthUrl);
    window.location.assign(googleAuthUrl);
  };

  // 로그아웃
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserToken('');
    setLoginProvider('');
    localStorage.removeItem('userToken');
    localStorage.removeItem('loginProvider');

    if (window.Kakao && window.Kakao.Auth) {
      window.Kakao.Auth.logout(() => console.log('카카오 로그아웃 완료'));
    }
  };

  // CORS 테스트
  const testCors = async () => {
    setResponse('');
    setError('');
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (userToken) headers['Authorization'] = `Bearer ${userToken}`;

      const res = await fetch(`${API_BASE}/api/v1/search/keywords/top`, {
        method: 'GET',
        credentials: 'include',
        headers,
      });
      const data = await res.text();
      setResponse(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unknown Error');
    }
  };

  // 라우팅 처리
  if (currentPath === '/api/auth/kakao-redirect') {
    return (
      <div>
        <KakaoRedirect onOAuthCallback={handleKakaoOAuthCallback} />
        {error && (
          <div style={{ padding: 20, textAlign: 'center', color: 'red' }}>
            <h3>❌ 로그인 오류:</h3>
            <p>{error}</p>
          </div>
        )}
      </div>
    );
  }

  if (currentPath === '/api/auth/google-redirect') {
    return (
      <div>
        <GoogleRedirect onOAuthCallback={handleGoogleOAuthCallback} />
        {error && (
          <div style={{ padding: 20, textAlign: 'center', color: 'red' }}>
            <h3>❌ 로그인 오류:</h3>
            <p>{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <MainApp
      isLoggedIn={isLoggedIn}
      userToken={userToken}
      loginProvider={loginProvider}
      onKakaoLogin={handleKakaoLogin}
      onGoogleLogin={handleGoogleLogin}
      onLogout={handleLogout}
      testCors={testCors}
      response={response}
      error={error}
    />
  );
};

export default App;
