'use client';

import { useState, useEffect } from 'react';
import styles from './TrackOrder.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBox, FaTruck, FaMapMarkerAlt, FaClock, FaPhoneAlt, FaInfoCircle } from 'react-icons/fa';

interface OrderStatus {
  status: string;
  date: string;
  description: string;
  location: string;
  icon?: JSX.Element;
  estimatedDelivery?: string;
  courier?: {
    name: string;
    phone: string;
    rating: number;
  };
  additionalInfo?: {
    weight?: string;
    dimensions?: string;
    items?: number;
    service?: string;
  };
}

interface TrackOrderProps {
  initialTrackingNumber?: string;
  onClose?: () => void;
}

const mockOrderStatuses: { [key: string]: OrderStatus[] } = {
  "ORDER123": [
    {
      status: "Заказ оформлен",
      date: "2024-01-15 10:30",
      description: "Заказ успешно создан и оплачен",
      location: "Онлайн",
      icon: <FaBox />,
      additionalInfo: {
        weight: "2.5 кг",
        dimensions: "30x40x20 см",
        items: 3,
        service: "Экспресс доставка"
      }
    },
    {
      status: "Передан в сортировочный центр",
      date: "2024-01-15 14:45",
      description: "Заказ прибыл в сортировочный центр",
      location: "Сортировочный центр, Москва",
      icon: <FaMapMarkerAlt />
    },
    {
      status: "Передан курьеру",
      date: "2024-01-15 15:30",
      description: "Заказ передан курьеру для доставки",
      location: "Москва, район Хамовники",
      icon: <FaTruck />,
      courier: {
        name: "Александр П.",
        phone: "+7 (999) 123-45-67",
        rating: 4.8
      },
      estimatedDelivery: "2024-01-15 18:30"
    }
  ],
  "ORDER456": [
    {
      status: "Заказ оформлен",
      date: "2024-01-14 09:15",
      description: "Заказ успешно создан и оплачен",
      location: "Онлайн",
      icon: <FaBox />,
      additionalInfo: {
        weight: "1.2 кг",
        dimensions: "20x15x10 см",
        items: 1,
        service: "Стандартная доставка"
      }
    },
    {
      status: "Доставлен",
      date: "2024-01-14 16:20",
      description: "Заказ успешно доставлен получателю",
      location: "Пункт выдачи, Москва",
      icon: <FaMapMarkerAlt />
    }
  ]
};

const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <motion.div 
    className={styles.infoCard}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className={styles.infoCardTitle}>{title}</h3>
    {children}
  </motion.div>
);

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className={styles.starRating}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span 
          key={star} 
          className={`${styles.star} ${star <= rating ? styles.filled : ''}`}
        >
          ★
        </span>
      ))}
      <span className={styles.ratingNumber}>({rating})</span>
    </div>
  );
};

export const TrackOrder = ({ initialTrackingNumber, onClose }: TrackOrderProps) => {
  const [orderNumber, setOrderNumber] = useState(initialTrackingNumber || "");
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[] | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialTrackingNumber) {
      handleTrack();
    }
  }, [initialTrackingNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTrack = () => {
    if (!orderNumber) return;
    
    setIsLoading(true);
    setError("");
    
    // Имитация API запроса
    setTimeout(() => {
      const statuses = mockOrderStatuses[orderNumber];
      if (statuses) {
        setOrderStatuses(statuses);
        setError("");
      } else {
        setOrderStatuses(null);
        setError("Заказ не найден. Проверьте номер заказа.");
      }
      setIsLoading(false);
    }, 1000);
  };

  const currentStatus = orderStatuses?.[orderStatuses.length - 1];
  const hasAdditionalInfo = currentStatus?.additionalInfo || currentStatus?.courier;

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.trackingBox}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.header}>
          <h1 className={styles.title}>Отследить заказ</h1>
          {onClose && (
            <button className={styles.closeButton} onClick={onClose}>
              ✕
            </button>
          )}
        </div>
        
        <p className={styles.subtitle}>
          Введите номер заказа для получения актуальной информации о его местоположении и статусе
        </p>

        <div className={styles.searchSection}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              placeholder="Введите номер заказа (например, ORDER123)"
              className={styles.input}
            />
            <motion.button
              className={styles.button}
              onClick={handleTrack}
              disabled={isLoading || !orderNumber}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? "Поиск..." : "Отследить"}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              className={styles.error}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <FaInfoCircle className={styles.errorIcon} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {orderStatuses && (
            <div className={styles.resultContainer}>
              <div className={styles.mainContent}>
                <motion.div
                  className={styles.timeline}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {orderStatuses.map((status, index) => (
                    <motion.div
                      key={index}
                      className={styles.timelineItem}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className={styles.timelinePoint}>
                        {status.icon || <FaBox />}
                      </div>
                      <div className={styles.timelineContent}>
                        <h3 className={styles.statusTitle}>{status.status}</h3>
                        <p className={styles.statusDate}>
                          <FaClock className={styles.icon} />
                          {status.date}
                        </p>
                        <p className={styles.statusDescription}>{status.description}</p>
                        <p className={styles.statusLocation}>
                          <FaMapMarkerAlt className={styles.icon} />
                          {status.location}
                        </p>
                        {status.estimatedDelivery && (
                          <p className={styles.estimatedDelivery}>
                            Ожидаемое время доставки: {status.estimatedDelivery}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {hasAdditionalInfo && (
                  <div className={styles.additionalInfo}>
                    {currentStatus?.additionalInfo && (
                      <InfoCard title="Информация о заказе">
                        <div className={styles.infoGrid}>
                          <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Вес:</span>
                            <span>{currentStatus.additionalInfo.weight}</span>
                          </div>
                          <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Габариты:</span>
                            <span>{currentStatus.additionalInfo.dimensions}</span>
                          </div>
                          <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Количество товаров:</span>
                            <span>{currentStatus.additionalInfo.items}</span>
                          </div>
                          <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Тип доставки:</span>
                            <span>{currentStatus.additionalInfo.service}</span>
                          </div>
                        </div>
                      </InfoCard>
                    )}

                    {currentStatus?.courier && (
                      <InfoCard title="Информация о курьере">
                        <div className={styles.courierInfo}>
                          <div className={styles.courierName}>
                            {currentStatus.courier.name}
                          </div>
                          <div className={styles.courierPhone}>
                            <FaPhoneAlt className={styles.icon} />
                            {currentStatus.courier.phone}
                          </div>
                          <StarRating rating={currentStatus.courier.rating} />
                        </div>
                      </InfoCard>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}; 