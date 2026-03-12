import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://apartmentv1.wooyouspace.space/api';
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Set default auth header
    const setAuthHeader = (token) => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    // Load user from localStorage on startup
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('auth_user');
        if (token && savedUser) {
            setAuthHeader(token);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { username, password });
            if (res.data.success) {
                const { token, user: userData } = res.data;
                localStorage.setItem('auth_token', token);
                localStorage.setItem('auth_user', JSON.stringify(userData));
                setAuthHeader(token);
                setUser(userData);
                return { success: true };
            }
            return { success: false, error: res.data.error };
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setAuthHeader(null);
        setUser(null);
    };

    const register = async (username, password, displayName, role = 'admin') => {
        const res = await axios.post(`${API_URL}/auth/register`, { username, password, displayName, role });
        return res.data;
    };

    const changePassword = async (oldPassword, newPassword) => {
        const res = await axios.put(`${API_URL}/auth/change-password`, { oldPassword, newPassword });
        return res.data;
    };

    const getUsers = async () => {
        const res = await axios.get(`${API_URL}/auth/users`);
        return res.data;
    };

    const updateUser = async (id, data) => {
        const res = await axios.put(`${API_URL}/auth/users/${id}`, data);
        return res.data;
    };

    const deleteUser = async (id) => {
        const res = await axios.delete(`${API_URL}/auth/users/${id}`);
        return res.data;
    };

    return (
        <AuthContext.Provider value={{
            user, loading, login, logout, register,
            changePassword, getUsers, updateUser, deleteUser,
            isAuthenticated: !!user,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
