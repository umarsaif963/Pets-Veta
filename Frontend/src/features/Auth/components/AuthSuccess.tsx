import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const getPostLoginPath = (role?: string) => {
    if (role === 'Admin') {
        return '/admin-dashboard';
    }

    if (role === 'Doctor') {
        return '/doctor-dashboard';
    }

    if (role === 'PetOwner' || role === 'Seller') {
        return '/';
    }

    return '/';
};

export const AuthSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const verifyUserSession = async () => {
            try {

                const response = await axios.get('http://localhost:8000/api/v1/auth/me', {
                    withCredentials: true
                });

                if (response.data.success) {
                    navigate(getPostLoginPath(response.data.data?.role));
                }
            } catch (error) {
                console.error("Session verification failed", error);
                navigate('/login');
            }
        };

        verifyUserSession();
    }, [navigate]);

    return <div>Completing login, please wait...</div>;
};
