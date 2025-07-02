'use client';

import { useState, useEffect } from 'react';

// Проверяем, работаем ли мы на Vercel (HTTPS) или локально (HTTP)
const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
// Используем прокси для Vercel, чтобы обойти проблему Mixed Content
const API_URL = isVercel 
  ? '/api/proxy' // Это будет прокси через Next.js API routes
  : 'http://92.246.76.171:8080/api';

// Обновляем конфигурацию для fetch запросов
const fetchConfig = {
  credentials: 'include' as const,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': typeof window !== 'undefined' ? window.location.origin : ''
  },
  mode: 'cors' as const
};

// Функция для выполнения fetch запроса с таймаутом
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 30000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    console.log('Отправка запроса на:', url);
    console.log('С данными:', options.body);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(id);
    
    console.log('Получен ответ:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Если ответ не OK, пробуем прочитать тело ответа
    if (!response.ok) {
      let errorMessage = 'Ошибка сервера';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || 'Неизвестная ошибка';
      } catch (e) {
        console.error('Не удалось прочитать тело ошибки:', e);
      }
      throw new Error(errorMessage);
    }

    return response;
  } catch (error: any) {
    clearTimeout(id);
    console.error('Ошибка запроса:', error);

    if (error.name === 'AbortError') {
      throw new Error('Превышено время ожидания запроса. Пожалуйста, проверьте ваше интернет-соединение и попробуйте снова.');
    }
    
    if (!navigator.onLine) {
      throw new Error('Отсутствует подключение к интернету. Пожалуйста, проверьте ваше соединение.');
    }

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Не удалось подключиться к серверу. Пожалуйста, проверьте ваше интернет-соединение или попробуйте позже.');
    }

    throw error;
  }
};

// Добавляем функцию для получения заголовков с токеном
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    ...fetchConfig.headers,
    'Authorization': `Bearer ${token}`
  };
};

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  notifications: boolean;
  phone?: string | null;
  birthDate?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  postalCode?: string | null;
  telegram?: string | null;
  whatsapp?: string | null;
  preferredContact?: string | null;
  language?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  name: string;
  confirmPassword: string;
}

export interface AuthContextType {
  user: User | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const isBrowser = typeof window !== 'undefined';

const getStorageItem = (key: string) => {
  if (!isBrowser) return null;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

const setStorageItem = (key: string, value: unknown) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting localStorage:', error);
  }
};

const removeStorageItem = (key: string) => {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchUser(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      // Формируем URL в зависимости от того, используем ли мы прокси
      const url = isVercel 
        ? `${API_URL}?path=profile` 
        : `${API_URL}/profile`;
      
      const response = await fetch(url, {
        ...fetchConfig,
        headers: {
          ...fetchConfig.headers,
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при получении данных пользователя');
      }

      const data = await response.json();
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        notifications: data.notifications,
        phone: data.phone,
        birthDate: data.birth_date,
        address: data.address,
        city: data.city,
        country: data.country,
        postalCode: data.postal_code,
        telegram: data.telegram,
        whatsapp: data.whatsapp,
        preferredContact: data.preferred_contact,
        language: data.language,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const login = async (data: LoginData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!validateEmail(data.email)) {
        throw new Error('Некорректный email');
      }

      if (!validatePassword(data.password)) {
        throw new Error('Пароль должен содержать минимум 8 символов');
      }

      const url = isVercel 
        ? `${API_URL}?path=auth/login` 
        : `${API_URL}/auth/login`;
      
      console.log('Отправка запроса на:', url);

      const response = await fetch(url, {
        ...fetchConfig,
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при входе');
      }

      const { token, user } = await response.json();
      
      localStorage.setItem('authToken', token);
      setUser(user);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при входе');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Начало процесса регистрации');

      if (!validateEmail(data.email)) {
        throw new Error('Некорректный email');
      }

      if (!validatePassword(data.password)) {
        throw new Error('Пароль должен содержать минимум 8 символов');
      }

      if (data.password !== data.confirmPassword) {
        throw new Error('Пароли не совпадают');
      }

      const requestData = {
        name: data.name,
        email: data.email,
        password: data.password,
        confirm_password: data.confirmPassword
      };

      console.log('Подготовленные данные для регистрации:', {
        ...requestData,
        password: '***',
        confirm_password: '***'
      });

      const url = isVercel 
        ? `${API_URL}?path=auth/register` 
        : `${API_URL}/auth/register`;
      
      console.log('Отправка запроса на:', url);

      const response = await fetchWithTimeout(
        url,
        {
          ...fetchConfig,
          method: 'POST',
          body: JSON.stringify(requestData)
        },
        15000
      );

      console.log('Успешный ответ от сервера');
      
      const responseData = await response.json();
      console.log('Полученные данные:', {
        ...responseData,
        token: responseData.token ? '***' : undefined
      });

      if (!responseData.token || !responseData.user) {
        throw new Error('Сервер вернул неполные данные');
      }

      localStorage.setItem('authToken', responseData.token);
      setUser(responseData.user);
      setIsAuthenticated(true);
      
      console.log('Регистрация успешно завершена');
    } catch (err) {
      console.error('Ошибка при регистрации:', err);
      const errorMessage = err instanceof Error ? err.message : 'Произошла неизвестная ошибка при регистрации';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout
  };
}; 