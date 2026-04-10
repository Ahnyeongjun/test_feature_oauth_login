import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';

// ───────────────────────────────────────────────
// 공통 모킹 설정
// ───────────────────────────────────────────────
const mockAssign = jest.fn();

function setLocation(overrides = {}) {
  delete window.location;
  window.location = {
    pathname: '/',
    origin: 'http://localhost:3000',
    search: '',
    href: 'http://localhost:3000/',
    assign: mockAssign,
    ...overrides,
  };
}

// localStorage mock
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = value; },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// fetch mock
global.fetch = jest.fn();

// Kakao SDK mock
window.Kakao = {
  isInitialized: jest.fn(() => false),
  init: jest.fn(),
  Auth: { logout: jest.fn((cb) => cb && cb()) },
};

// history mock
window.history.replaceState = jest.fn();
window.alert = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  setLocation();
});

// ───────────────────────────────────────────────
// 메인 화면 렌더링
// ───────────────────────────────────────────────
describe('메인 화면', () => {
  test('카카오 로그인 버튼이 표시된다', () => {
    render(<App />);
    expect(screen.getByTestId('kakao-login-btn')).toBeInTheDocument();
  });

  test('구글 로그인 버튼이 표시된다', () => {
    render(<App />);
    expect(screen.getByTestId('google-login-btn')).toBeInTheDocument();
  });

  test('API 테스트 버튼이 표시된다', () => {
    render(<App />);
    expect(screen.getByTestId('api-test-btn')).toBeInTheDocument();
  });

  test('로그인 전에는 로그아웃 버튼이 없다', () => {
    render(<App />);
    expect(screen.queryByTestId('logout-btn')).not.toBeInTheDocument();
  });
});

// ───────────────────────────────────────────────
// 구글 로그인
// ───────────────────────────────────────────────
describe('구글 로그인', () => {
  test('구글 로그인 버튼 클릭 시 구글 OAuth URL로 이동한다', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('google-login-btn'));

    expect(mockAssign).toHaveBeenCalledWith(
      expect.stringContaining('accounts.google.com/o/oauth2/v2/auth')
    );
  });

  test('구글 OAuth URL에 client_id가 포함된다', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('google-login-btn'));

    const url = mockAssign.mock.calls[0][0];
    expect(url).toContain(process.env.REACT_APP_GOOGLE_CLIENT_ID);
  });

  test('구글 OAuth URL에 redirect_uri가 포함된다', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('google-login-btn'));

    const url = mockAssign.mock.calls[0][0];
    expect(url).toContain('google-redirect');
  });

  test('구글 OAuth URL에 scope가 포함된다', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('google-login-btn'));

    const url = mockAssign.mock.calls[0][0];
    expect(url).toContain('scope');
  });

  test('구글 OAuth URL에 response_type=code가 포함된다', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('google-login-btn'));

    const url = mockAssign.mock.calls[0][0];
    expect(url).toContain('response_type=code');
  });
});

// ───────────────────────────────────────────────
// 구글 OAuth 콜백 처리
// ───────────────────────────────────────────────
describe('구글 OAuth 콜백 처리', () => {
  beforeEach(() => {
    setLocation({
      pathname: '/api/auth/google-redirect',
      search: '?code=test_google_auth_code',
    });
  });

  test('구글 리디렉트 페이지에서 처리 중 메시지가 표시된다', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accessToken: 'google_test_token_xyz' }),
    });

    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText(/구글 로그인 처리 중/i)).toBeInTheDocument();
  });

  test('구글 로그인 성공 시 토큰이 저장된다', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accessToken: 'google_test_token_xyz' }),
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/oauth/login/google'),
        expect.any(Object)
      );
    });

    await waitFor(() => {
      expect(localStorageMock.getItem('loginProvider')).toBe('google');
    });

    expect(localStorageMock.getItem('userToken')).toBe('google_test_token_xyz');
  });

  test('구글 로그인 실패 시 토큰이 저장되지 않는다', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(localStorageMock.getItem('loginProvider')).toBeNull();
    });
  });

  test('구글 OAuth URL에 code가 없으면 alert를 표시한다', async () => {
    setLocation({
      pathname: '/api/auth/google-redirect',
      search: '',
    });

    await act(async () => {
      render(<App />);
    });

    expect(window.alert).toHaveBeenCalledWith('인가 코드가 없습니다.');
  });
});

// ───────────────────────────────────────────────
// 카카오 로그인
// ───────────────────────────────────────────────
describe('카카오 로그인', () => {
  test('카카오 로그인 버튼 클릭 시 카카오 OAuth URL로 이동한다', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('kakao-login-btn'));

    expect(mockAssign).toHaveBeenCalledWith(
      expect.stringContaining('kauth.kakao.com/oauth/authorize')
    );
  });

  test('카카오 OAuth URL에 client_id가 포함된다', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('kakao-login-btn'));

    const url = mockAssign.mock.calls[0][0];
    expect(url).toContain(process.env.REACT_APP_KAKAO_CLIENT_ID);
  });

  test('카카오 OAuth URL에 kakao-redirect가 포함된다', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('kakao-login-btn'));

    const url = mockAssign.mock.calls[0][0];
    expect(url).toContain('kakao-redirect');
  });
});

// ───────────────────────────────────────────────
// 카카오 OAuth 콜백 처리
// ───────────────────────────────────────────────
describe('카카오 OAuth 콜백 처리', () => {
  beforeEach(() => {
    setLocation({
      pathname: '/api/auth/kakao-redirect',
      search: '?code=test_kakao_auth_code',
    });
  });

  test('카카오 리디렉트 페이지에서 처리 중 메시지가 표시된다', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accessToken: 'kakao_test_token_abc' }),
    });

    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText(/카카오 로그인 처리 중/i)).toBeInTheDocument();
  });

  test('카카오 로그인 성공 시 토큰이 저장된다', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accessToken: 'kakao_test_token_abc' }),
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/oauth/login/kakao'),
        expect.any(Object)
      );
    });

    await waitFor(() => {
      expect(localStorageMock.getItem('loginProvider')).toBe('kakao');
    });
  });
});

// ───────────────────────────────────────────────
// 로그아웃
// ───────────────────────────────────────────────
describe('로그아웃', () => {
  beforeEach(() => {
    localStorageMock.setItem('userToken', 'saved_token_abc');
    localStorageMock.setItem('loginProvider', 'google');
  });

  test('저장된 토큰이 있으면 로그인 상태로 시작한다', () => {
    render(<App />);
    expect(screen.getByTestId('logout-btn')).toBeInTheDocument();
  });

  test('로그아웃 클릭 시 토큰이 삭제된다', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('logout-btn'));

    expect(localStorageMock.getItem('userToken')).toBeNull();
    expect(localStorageMock.getItem('loginProvider')).toBeNull();
  });

  test('로그아웃 후 로그인 버튼들이 다시 표시된다', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('logout-btn'));

    expect(screen.getByTestId('kakao-login-btn')).toBeInTheDocument();
    expect(screen.getByTestId('google-login-btn')).toBeInTheDocument();
  });
});
