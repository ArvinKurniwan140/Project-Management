import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { router } from '@inertiajs/react';

interface LogoutButtonProps {
    className?: string;
    children?: React.ReactNode;
}

export default function LogoutButton({ className = '', children }: LogoutButtonProps) {
    const { logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (isLoggingOut) return;
        
        setIsLoggingOut(true);
        try {
            await logout();
            router.visit('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={className}
        >
            {isLoggingOut ? 'Logging out...' : (children || 'Logout')}
        </button>
    );
}