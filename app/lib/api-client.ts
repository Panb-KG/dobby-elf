/**
 * API 客户端辅助
 * 
 * 统一处理：
 * - JWT Token 发送
 * - 错误处理
 * - 401 自动跳转登录
 */

const AUTH_TOKEN_KEY = 'dobi_auth_token';

/**
 * 获取当前 token
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * 发起认证 API 请求
 * 
 * @param url API 路径
 * @param options fetch 选项
 * @returns Response
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 添加 Authorization header
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // 包含 cookie
  });

  // 401 未授权 - 尝试自动重新登录
  if (response.status === 401) {
    console.log('[API] 401 Unauthorized, attempting auto re-login...');
    try {
      const autoRes = await fetch('/api/auth-sb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auto_login' }),
      });
      if (autoRes.ok) {
        const autoData = await autoRes.json();
        localStorage.setItem('dobi_auth_token', autoData.token);
        localStorage.setItem('dobi_user_data', JSON.stringify(autoData.user));
        console.log('[API] Auto re-login success, retrying original request...');
        // 用新 token 重试原始请求
        const newHeaders: HeadersInit = { ...options.headers as Record<string, string> };
        (newHeaders as Record<string, string>)['Authorization'] = `Bearer ${autoData.token}`;
        return fetch(url, { ...options, headers: newHeaders, credentials: 'include' });
      }
    } catch (e) {
      console.log('[API] Auto re-login failed:', e);
    }
    // 重新登录失败，触发事件通知
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-token-expired', { detail: { url } }));
    }
  }

  return response;
}

/**
 * GET 请求
 */
export async function authGet(url: string): Promise<Response> {
  return authFetch(url, { method: 'GET' });
}

/**
 * POST 请求
 */
export async function authPost(url: string, body?: unknown): Promise<Response> {
  return authFetch(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT 请求
 */
export async function authPut(url: string, body?: unknown): Promise<Response> {
  return authFetch(url, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE 请求
 */
export async function authDelete(url: string): Promise<Response> {
  return authFetch(url, { method: 'DELETE' });
}

/**
 * PATCH 请求
 */
export async function authPatch(url: string, body?: unknown): Promise<Response> {
  return authFetch(url, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}
