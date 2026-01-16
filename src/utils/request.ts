import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { useUserStore } from '@/stores/modules/user';

export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

class Request {
  private instance: AxiosInstance;

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config);
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const userStore = useUserStore();
        if (userStore.token) {
          config.headers.Authorization = `Bearer ${userStore.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { code, data, message } = response.data;

        if (code === 200) {
          return data;
        }

        console.error(`API Error: ${message}`);
        return Promise.reject(new Error(message || 'Request failed'));
      },
      (error) => {
        if (error.response) {
          const { status } = error.response;

          switch (status) {
            case 401:
              console.error('未授权,请重新登录');
              const userStore = useUserStore();
              userStore.logout();
              break;
            case 403:
              console.error('没有权限访问');
              break;
            case 404:
              console.error('请求的资源不存在');
              break;
            case 500:
              console.error('服务器错误');
              break;
            default:
              console.error(`请求失败: ${error.message}`);
          }
        }
        else if (error.request) {
          console.error('网络错误,请检查网络连接');
        }
        else {
          console.error(`请求配置错误: ${error.message}`);
        }

        return Promise.reject(error);
      },
    );
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put(url, data, config);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config);
  }

  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.patch(url, data, config);
  }
}

const request = new Request({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default request;
