'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Profile.module.css';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { User, UpdateUserRequest } from '@/components/Header/types';
import { useOrders, Order } from '@/hooks/useOrders';

interface OrderType {
  id: string;
  date: string;
  status: 'pending' | 'delivered' | 'in_transit';
  trackingNumber: string;
  from: string;
  to: string;
  price: number;
}

type Section = 'personal' | 'contacts' | 'preferences' | 'orders' | 'addresses';

const mockOrders: OrderType[] = [
  {
    id: '1',
    date: '2024-02-20',
    status: 'delivered',
    trackingNumber: 'TR123456789',
    from: 'Москва',
    to: 'Санкт-Петербург',
    price: 1200
  },
  {
    id: '2',
    date: '2024-02-25',
    status: 'in_transit',
    trackingNumber: 'TR987654321',
    from: 'Екатеринбург',
    to: 'Казань',
    price: 1500
  }
];

interface SaveResponse {
  success: boolean;
  message: string;
}

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
    'Accept': 'application/json'
  }
};

// Обновляем функцию получения заголовков
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    ...fetchConfig.headers,
    'Authorization': `Bearer ${token}`
  };
};

export const Profile = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [userData, setUserData] = useState<User>({
    id: 0,
    name: '',
    email: '',
    notifications: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    phone: null,
    birthDate: null,
    address: null,
    city: null,
    country: null,
    postalCode: null,
    telegram: null,
    whatsapp: null,
    preferredContact: null,
    language: null
  });
  const [mounted, setMounted] = useState(false);
  const { orders } = useOrders();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Не авторизован');
        }

        // Формируем URL в зависимости от того, используем ли мы прокси
        const url = isVercel 
          ? `${API_URL}?path=profile` 
          : `${API_URL}/profile`;

        const response = await fetch(url, {
          ...fetchConfig,
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          if (response.status === 401) {
            handleLogout();
            throw new Error('Сессия истекла. Пожалуйста, войдите снова');
          }
          throw new Error('Ошибка при получении данных профиля');
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
        if (error instanceof Error && error.message.includes('Сессия истекла')) {
          router.push('/login');
        }
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value || null
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Не авторизован');
      }

      const updateData: UpdateUserRequest = {
        name: userData.name,
        phone: userData.phone || null,
        birthDate: userData.birthDate || null,
        address: userData.address || null,
        city: userData.city || null,
        country: userData.country || null,
        postalCode: userData.postalCode || null,
        telegram: userData.telegram || null,
        whatsapp: userData.whatsapp || null,
        preferredContact: userData.preferredContact || null,
        language: userData.language || null,
      };

      // Формируем URL в зависимости от того, используем ли мы прокси
      const url = isVercel 
        ? `${API_URL}?path=profile` 
        : `${API_URL}/profile`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          throw new Error('Сессия истекла. Пожалуйста, войдите снова');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при сохранении изменений');
      }

      const data = await response.json();
      setUserData({
        ...userData,
        ...data
      });
      
      setSaveMessage('Изменения успешно сохранены');
      setIsEditing(false);
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Ошибка при сохранении изменений');
      if (error instanceof Error && error.message.includes('Сессия истекла')) {
        router.push('/login');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'В обработке';
      case 'processing':
        return 'Доставляется';
      case 'delivered':
        return 'Доставлен';
      default:
        return status;
    }
  };

  const getStatusClass = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return styles.statusDelivered;
      case 'processing':
        return styles.statusProcessing;
      case 'pending':
        return styles.statusPending;
      default:
        return '';
    }
  };

  if (!user) {
    return (
      <div className={styles.loading}>
        <p>Для доступа к профилю необходимо войти в систему</p>
      </div>
    );
  }

  const renderPersonalSection = () => (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Личные данные</h3>
        <button
          onClick={() => {
            setIsEditing(!isEditing);
            setSaveMessage('');
          }}
          className={styles.editButton}
          disabled={isSaving}
        >
          {isEditing ? 'Отменить' : 'Редактировать'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formSection}>
            <h4 className={styles.formSectionTitle}>Основная информация</h4>
            <div className={styles.fieldsGroup}>
              <div className={styles.fieldContainer}>
                <label className={styles.fieldLabel}>Имя</label>
                <div className={styles.fieldBox}>
                  <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={styles.input}
                    placeholder="Введите ваше имя"
                  />
                </div>
              </div>
              <div className={styles.fieldContainer}>
                <label className={styles.fieldLabel}>Email</label>
                <div className={styles.fieldBox}>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={styles.input}
                    placeholder="Введите ваш email"
                  />
                </div>
              </div>
              <div className={styles.fieldContainer}>
                <label className={styles.fieldLabel}>Дата рождения</label>
                <div className={styles.fieldBox}>
                  <input
                    type="date"
                    name="birthDate"
                    value={userData.birthDate ? userData.birthDate.split('T')[0] : ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h4 className={styles.formSectionTitle}>Контактная информация</h4>
            <div className={styles.fieldsGroup}>
              <div className={styles.fieldContainer}>
                <label className={styles.fieldLabel}>Телефон</label>
                <div className={styles.fieldBox}>
                  <input
                    type="tel"
                    name="phone"
                    value={userData.phone || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={styles.input}
                    placeholder="+7 (___) ___-__-__"
                  />
                </div>
              </div>
              <div className={styles.fieldContainer}>
                <label className={styles.fieldLabel}>Telegram</label>
                <div className={styles.fieldBox}>
                  <input
                    type="text"
                    name="telegram"
                    value={userData.telegram || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={styles.input}
                    placeholder="@username"
                  />
                </div>
              </div>
              <div className={styles.fieldContainer}>
                <label className={styles.fieldLabel}>WhatsApp</label>
                <div className={styles.fieldBox}>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={userData.whatsapp || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={styles.input}
                    placeholder="+7 (___) ___-__-__"
                  />
                </div>
              </div>
              <div className={styles.fieldContainer}>
                <label className={styles.fieldLabel}>Предпочитаемый способ связи</label>
                <div className={styles.fieldBox}>
                  <select
                    name="preferredContact"
                    value={userData.preferredContact || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={styles.input}
                  >
                    <option value="">Выберите способ связи</option>
                    <option value="phone">Телефон</option>
                    <option value="telegram">Telegram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h4 className={styles.formSectionTitle}>Адрес</h4>
            <div className={styles.fieldsGroup}>
              <div className={styles.fieldContainer}>
                <label className={styles.fieldLabel}>Улица, дом, квартира</label>
                <div className={styles.fieldBox}>
                  <input
                    type="text"
                    name="address"
                    value={userData.address || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={styles.input}
                    placeholder="Введите ваш адрес"
                  />
                </div>
              </div>
              <div className={styles.fieldContainer}>
                <label className={styles.fieldLabel}>Город</label>
                <div className={styles.fieldBox}>
                  <input
                    type="text"
                    name="city"
                    value={userData.city || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={styles.input}
                    placeholder="Введите город"
                  />
                </div>
              </div>
              <div className={styles.fieldContainer}>
                <label className={styles.fieldLabel}>Страна</label>
                <div className={styles.fieldBox}>
                  <input
                    type="text"
                    name="country"
                    value={userData.country || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={styles.input}
                    placeholder="Введите страну"
                  />
                </div>
              </div>
              <div className={styles.fieldContainer}>
                <label className={styles.fieldLabel}>Почтовый индекс</label>
                <div className={styles.fieldBox}>
                  <input
                    type="text"
                    name="postalCode"
                    value={userData.postalCode || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={styles.input}
                    placeholder="Введите почтовый индекс"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h4 className={styles.formSectionTitle}>Дополнительно</h4>
            <div className={styles.fieldsGroup}>
              <div className={styles.fieldContainer}>
                <label className={styles.fieldLabel}>Предпочитаемый язык</label>
                <div className={styles.fieldBox}>
                  <select
                    name="language"
                    value={userData.language || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={styles.input}
                  >
                    <option value="">Выберите язык</option>
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        {isEditing && (
          <div className={styles.formActions}>
            <button 
              type="submit" 
              className={styles.saveButton}
              disabled={isSaving}
            >
              {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
            {saveMessage && (
              <p className={`${styles.saveMessage} ${
                saveMessage.includes('Ошибка') ? styles.error : styles.success}`}>
                {saveMessage}
              </p>
            )}
          </div>
        )}
      </form>
    </section>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'personal':
        return renderPersonalSection();
      case 'orders':
        return (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>История заказов</h3>
            <div className={styles.orders}>
              {orders.length === 0 ? (
                <p className={styles.emptyMessage}>У вас пока нет заказов</p>
              ) : (
                orders.map(order => (
                  <div key={order.id} className={styles.order}>
                    <div className={styles.orderHeader}>
                      <div className={styles.orderInfo}>
                        <div className={styles.orderMeta}>
                          <span className={styles.orderNumber}>Заказ #{order.id.slice(-4)}</span>
                          <span className={styles.orderDate}>
                            {new Date(order.createdAt).toLocaleString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <span className={`${styles.orderStatus} ${getStatusClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className={styles.deliveryDetails}>
                        <div className={styles.deliveryRow}>
                          <span className={styles.deliveryLabel}>Адрес доставки:</span>
                          <span className={styles.deliveryValue}>{order.deliveryDetails.address}</span>
                        </div>
                        <div className={styles.deliveryRow}>
                          <span className={styles.deliveryLabel}>Дата и время:</span>
                          <span className={styles.deliveryValue}>
                            {order.deliveryDetails.date} в {order.deliveryDetails.time}
                          </span>
                        </div>
                        {order.deliveryDetails.notes && (
                          <div className={styles.deliveryRow}>
                            <span className={styles.deliveryLabel}>Примечания:</span>
                            <span className={styles.deliveryValue}>{order.deliveryDetails.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.orderItems}>
                      {order.items.map(item => (
                        <div key={item.id} className={styles.orderItem}>
                          <div className={styles.itemMain}>
                            <span className={styles.marketplace}>{item.marketplace}</span>
                            <a 
                              href={item.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={styles.itemLink}
                            >
                              {item.link}
                            </a>
                          </div>
                          <div className={styles.itemDetails}>
                            <div className={styles.itemAttributes}>
                              {item.size && (
                                <span className={styles.itemAttribute}>
                                  Размер: {item.size}
                                </span>
                              )}
                              {item.color && (
                                <span className={styles.itemAttribute}>
                                  Цвет: {item.color}
                                </span>
                              )}
                            </div>
                            <div className={styles.itemQuantity}>
                              Количество: {item.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        );
      case 'addresses':
        return (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Адреса доставки</h3>
            <p className={styles.emptyState}>
              У вас пока нет сохраненных адресов доставки
            </p>
          </section>
        );
      default:
        return null;
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Header />
      <main className={styles.profileContainer}>
      <div className={styles.sidebar}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {userData.name && userData.name.trim() ? userData.name[0].toUpperCase() : 'U'}
          </div>
          <h2 className={styles.userName}>{userData.name || 'Пользователь'}</h2>
          <p className={styles.userEmail}>{userData.email}</p>
        </div>
        <nav className={styles.navigation}>
          <button 
            className={`${styles.navButton} ${activeSection === 'personal' ? styles.active : ''}`}
            onClick={() => setActiveSection('personal')}
          >
            <span>Мои данные</span>
          </button>
          <button 
            className={`${styles.navButton} ${activeSection === 'orders' ? styles.active : ''}`}
            onClick={() => setActiveSection('orders')}
          >
            <span>История заказов</span>
          </button>
          <button 
            className={`${styles.navButton} ${activeSection === 'addresses' ? styles.active : ''}`}
            onClick={() => setActiveSection('addresses')}
          >
            <span>Адреса доставки</span>
          </button>
          <Link href="/" className={styles.homeButton}>
            <span>На главную</span>
          </Link>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <span>Выйти</span>
          </button>
        </nav>
      </div>

      <div className={styles.content}>
        {renderContent()}
      </div>
      </main>
      <Footer />
    </>
  );
}; 