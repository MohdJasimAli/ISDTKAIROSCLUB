import axios from 'axios';

// Vite proxies /api → :5000 in dev; VITE_API_URL overrides for production.
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true, // send httpOnly auth cookies
  timeout: 15000,
});

let refreshing = null; // shared promise so parallel 401s trigger only one refresh

// On 401: silently refresh the session once, retry the original request, else surface a friendly message.
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config ?? {};
    const url = original.url ?? '';
    const isAuthPath = ['/auth/refresh', '/auth/login', '/auth/register', '/auth/logout'].some(
      (p) => url.includes(p)
    );

    if (error.response?.status === 401 && !original._retried && !isAuthPath) {
      original._retried = true;
      try {
        refreshing = refreshing ?? client.post('/auth/refresh');
        await refreshing;
        refreshing = null;
        return client(original);
      } catch {
        refreshing = null;
        // fall through — handle the original 401 below
      }
    }

    let userMessage = 'Network error — is the backend running?';
    if (error.code === 'ECONNABORTED') userMessage = 'Request timed out — please try again.';
    else if (error.response) {
      const { data } = error.response;
      userMessage = data?.message || `Server error (${error.response.status})`;
      if (data?.errors) {
        userMessage += ': ' + Object.values(data.errors).flat().join(', ');
      }
    }
    error.userMessage = userMessage;
    return Promise.reject(error);
  }
);

export default client;
