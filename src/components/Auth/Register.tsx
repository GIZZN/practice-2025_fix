'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import styles from './Auth.module.css';

export const Register = () => {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError('Пожалуйста, введите имя');
      return false;
    }
    if (!formData.email.trim()) {
      setFormError('Пожалуйста, введите email');
      return false;
    }
    if (!formData.password) {
      setFormError('Пожалуйста, введите пароль');
      return false;
    }
    if (formData.password.length < 8) {
      setFormError('Пароль должен содержать минимум 8 символов');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Пароли не совпадают');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await register(formData);
      router.replace('/profile');
    } catch (err) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Произошла ошибка при регистрации');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'email' ? value.trim() : value
    }));
    setFormError(null);
  };

  const isFormValid = () => {
    return formData.name.trim() &&
           formData.email.trim() &&
           formData.password &&
           formData.confirmPassword &&
           formData.password === formData.confirmPassword &&
           formData.password.length >= 8;
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.authTitle}>Регистрация</h2>
        
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>Имя</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              placeholder="Введите ваше имя"
              required
              autoComplete="name"
            />
          </div>

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
              placeholder="Минимум 8 символов"
              required
              autoComplete="new-password"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Подтверждение пароля</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={styles.input}
              placeholder="Повторите пароль"
              required
              autoComplete="new-password"
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
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>

          <p className={styles.authLink}>
            Уже есть аккаунт? <Link href="/login">Войти</Link>
          </p>
        </form>
      </div>
    </div>
  );
}; 