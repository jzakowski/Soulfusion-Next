import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Base API path - all requests go through /api prefix
const API_BASE = '/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Send cookies for session auth
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('sf_session');
  }

  private clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sf_session');
    }
  }

  private setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sf_session', token);
    }
  }

  // Auth methods
  async login(email: string): Promise<{ success: boolean; message?: string }> {
    const response = await this.client.post('/auth/magic/start', { email });
    // API returns { ok: true } on success
    return { success: response.data.ok === true };
  }

  async verifyMagicLink(token: string, email: string): Promise<{ ok: boolean; user?: any }> {
    const response = await this.client.post('/auth/magic/complete', { token, email });
    // API returns { ok: true, user: true } and sets HttpOnly cookie
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
    this.clearToken();
  }

  // Profile methods
  async getProfile(): Promise<any> {
    const response = await this.client.get('/profile/me');
    return response.data;
  }

  async updateProfile(data: any): Promise<any> {
    const response = await this.client.put('/profile', data);
    return response.data;
  }

  // Posts/Beiträge
  async getPosts(params?: { cursor?: string; limit?: number; bubble_id?: string }): Promise<any> {
    const response = await this.client.get('/beitraege', { params });
    return response.data;
  }

  async getPost(id: string): Promise<any> {
    const response = await this.client.get(`/beitraege/${id}`);
    return response.data;
  }

  async createPost(data: any): Promise<any> {
    const response = await this.client.post('/beitraege', data);
    return response.data;
  }

  async likePost(id: string): Promise<void> {
    await this.client.post(`/beitraege/${id}/like`);
  }

  async savePost(id: string): Promise<void> {
    await this.client.post(`/beitraege/${id}/save`);
  }

  async addComment(postId: string, text: string): Promise<any> {
    const response = await this.client.post(`/beitraege/${postId}/comments`, { text });
    return response.data;
  }

  // Accommodations
  async getAccommodations(params?: any): Promise<any> {
    const response = await this.client.get('/unterkuenfte', { params });
    return response.data;
  }

  async getAccommodation(id: string): Promise<any> {
    const response = await this.client.get(`/unterkuenfte/${id}`);
    return response.data;
  }

  async createAccommodation(data: any): Promise<any> {
    const response = await this.client.post('/unterkuenfte', data);
    return response.data;
  }

  // LiveKit
  async getLiveKitToken(room: string, displayName: string, avatarUrl?: string): Promise<any> {
    const response = await this.client.get('/livekit/token', {
      params: { room, displayName, avatarUrl }
    });
    return response.data;
  }

  // Media Upload
  async getPresignedUpload(params: { file_name: string; file_type: string; file_size: number }): Promise<{ upload_url: string; file_url: string }> {
    const response = await this.client.post('/upload/presigned', params);
    return response.data;
  }

  async getPresignedUploadUrl(postId: string, fileName: string, fileType: 'image' | 'video' | 'audio'): Promise<any> {
    const response = await this.client.post('/upload/beitraege', {
      post_id: postId,
      file_name: fileName,
      file_type: fileType,
    });
    return response.data;
  }

  // Upload for accommodations
  async getAccommodationUploadUrl(fileName: string, fileType: string): Promise<{ upload_url: string; file_url: string }> {
    const response = await this.client.post('/unterkuenfte/upload/presigned', {
      file_name: fileName,
      file_type: fileType,
    });
    return response.data;
  }

  // Get client instance for direct use
  getClient(): AxiosInstance {
    return this.client;
  }
}

// Singleton instance
export const apiClient = new ApiClient();
