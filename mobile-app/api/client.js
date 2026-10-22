import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

/**
 * Centralized HTTP Client.
 * Tự động gắn Authorization Bearer token từ AsyncStorage và chuẩn hóa xử lý lỗi.
 */
class ApiClient {
  constructor(baseUrl = API_URL) {
    this.baseUrl = baseUrl;
  }

  async getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (!headers.Authorization) {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.warn('Could not read access token from storage:', err);
      }
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const headers = await this.getHeaders(options.headers);

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.detail) {
            errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
          }
        } catch (_) {
          // Response is not JSON
        }
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }

      // 204 No Content
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request Failed: [${options.method || 'GET'}] ${url}`, error);
      throw error;
    }
  }

  get(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'GET', headers });
  }

  post(endpoint, body, headers = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    });
  }

  postForm(endpoint, formData, headers = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...headers,
      },
    });
  }

  put(endpoint, body, headers = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers,
    });
  }

  delete(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
