// resources/js/services/authService.ts
import api from '@/lib/axios';

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    user?: any;
    authorization?: {
        token: string;
        refresh_token: string;
        type: string;
        expires_in: number;
    };
}

class AuthService {
    async login(data: LoginData): Promise<AuthResponse> {
        const response = await api.post('/auth/login', data);
        
        if (response.data.success) {
            const { token, refresh_token } = response.data.authorization;
            localStorage.setItem('access_token', token);
            localStorage.setItem('refresh_token', refresh_token);
        }
        
        return response.data;
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await api.post('/auth/register', data);
        
        if (response.data.success) {
            const { token, refresh_token } = response.data.authorization;
            localStorage.setItem('access_token', token);
            localStorage.setItem('refresh_token', refresh_token);
        }
        
        return response.data;
    }

    async logout(): Promise<void> {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
    }

    async getCurrentUser() {
        const response = await api.get('/auth/me');
        return response.data;
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('access_token');
    }

    getToken(): string | null {
        return localStorage.getItem('access_token');
    }
}

export default new AuthService();