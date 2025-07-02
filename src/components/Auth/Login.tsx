'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import styles from './Auth.module.css';

export const Login = () => {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.email || !formData.password) {
      setFormError('Пожалуйста, заполните все поля');
      return;
    }

    try {
      console.log('Начало процесса входа');
      console.log('Данные для входа:', { email: formData.email, password: '***' });

      await login(formData);
      console.log('Вход выполнен успешно, перенаправление на профиль');
      router.replace('/profile');
    } catch (err) {
      console.error('Ошибка при входе:', err);
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Произошла ошибка при входе');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
    setFormError(null);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.authTitle}>Вход в систему</h2>
        
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="Введите ваш email"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="Введите пароль"
              required
              autoComplete="current-password"
            />
          </div>

          {formError && (
            <div className={styles.error}>
              {formError}
            </div>
          )}

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading || !formData.email || !formData.password}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>

          <p className={styles.authLink}>
            Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
          </p>
        </form>
      </div>
    </div>
  );
}; 