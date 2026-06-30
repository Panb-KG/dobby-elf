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

  // 401 未授权
  if (response.status === 401) {
    // 不立即清除 token，允许离线模式继续使用
    // 只在关键操作（如需要服务器验证的操作）时才强制重新登录
    console.log('[API] 401 Unauthorized, but keeping session for offline mode');
    
    // 触发一个通知事件，让组件决定是否需要重新认证
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
