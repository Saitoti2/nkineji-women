# Frontend-Backend Integration Guide

## API Client Setup

Create an API client to communicate with the backend.

### 1. Create API Client

```typescript
// src/lib/api-client.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadTokens();
  }

  private loadTokens() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
      ...options.headers,
    };

    let response = await fetch(url, { ...options, headers });

    // Handle token refresh on 401
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        headers.Authorization = `Bearer ${this.accessToken}`;
        response = await fetch(url, { ...options, headers });
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.accessToken;
        localStorage.setItem('accessToken', data.accessToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed', error);
    }

    this.logout();
    return false;
  }

  async login(credentials: { email?: string; password?: string; phone?: string; otp?: string }) {
    const data = await this.request<{ user: any; accessToken: string; refreshToken: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data;
  }

  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Campaigns
  async getCampaigns(filters?: any) {
    return this.request('/campaigns', {
      method: 'GET',
    });
  }

  async getCampaign(id: string) {
    return this.request(`/campaigns/${id}`);
  }

  // Donations
  async createDonation(donation: any) {
    return this.request('/donations', {
      method: 'POST',
      body: JSON.stringify(donation),
    });
  }

  // Add more API methods as needed
}

export const apiClient = new ApiClient(API_BASE_URL);
```

### 2. Update Frontend Components

Update donation and campaign components to use the API client.

## Environment Variables

Add to frontend `.env`:

```
VITE_API_URL=http://localhost:3000/api/v1
```

## Next Steps

1. Install backend dependencies: `cd backend && npm install`
2. Set up PostgreSQL database
3. Run migrations: `npm run migrate`
4. Start backend: `npm run dev`
5. Update frontend to use API client
6. Test integration

