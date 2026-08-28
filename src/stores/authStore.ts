import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    role: string;
    permissions: string[];
    name?: string;
    avatar?: string;
    created_at?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isHydrated: boolean;

    // Actions
    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    refreshAccessToken: (newToken: string) => void;
    setHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isHydrated: false,

            setAuth: (user, accessToken, refreshToken) => {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('mara_bloom_auth_token', accessToken);
                    localStorage.setItem('mara_bloom_refresh_token', refreshToken);
                }
                set({ user, accessToken, refreshToken, isAuthenticated: true });
            },

            logout: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('mara_bloom_auth_token');
                    localStorage.removeItem('mara_bloom_refresh_token');
                }
                set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
            },

            refreshAccessToken: (newToken) => {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('mara_bloom_auth_token', newToken);
                }
                set({ accessToken: newToken });
            },

            setHydrated: (state) => set({ isHydrated: state }),
        }),
        {
            name: 'mara-bloom-auth',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated(true);
                // Sync localStorage tokens on rehydration
                if (state?.accessToken && typeof window !== 'undefined') {
                    localStorage.setItem('mara_bloom_auth_token', state.accessToken);
                }
                if (state?.refreshToken && typeof window !== 'undefined') {
                    localStorage.setItem('mara_bloom_refresh_token', state.refreshToken);
                }
            },
        }
    )
);
