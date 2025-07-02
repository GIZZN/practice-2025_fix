'use client';

import { useState, useEffect } from 'react';
import styles from './TrackOrder.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBox, 
  FaTruck, 
  FaMapMarkerAlt, 
  FaClock, 
  FaStore,
  FaInfoCircle,
  FaShippingFast
} from 'react-icons/fa';
import { useOrders, Order } from '@/hooks/useOrders';

interface OrderStatus {
  status: string;
  date: string;
  description: string;
  location: string;
  icon?: JSX.Element;
  isCompleted?: boolean;
}

interface TrackOrderProps {
  initialTrackingNumber?: string;
  onClose?: () => void;
}

const getOrderStatus = (order: Order): OrderStatus[] => {
  const statuses: OrderStatus[] = [];
  const orderDate = new Date(order.createdAt);

  statuses.push({
    status: "Заказ оформлен",
    date: orderDate.toLocaleString('ru-RU'),
    description: "Заказ успешно создан и подтвержден",
    location: "Онлайн",
    icon: <FaBox />,
    isCompleted: true
  });

  if (order.status === 'processing' || order.status === 'delivered') {
    statuses.push({
      status: "В обработке",
      date: new Date(orderDate.getTime() + 1 * 60 * 60 * 1000).toLocaleString('ru-RU'),
      description: "Заказ обрабатывается в сортировочном центре",
      location: "Сортировочный центр",
      icon: <FaTruck />,
      isCompleted: true
    });

    statuses.push({
      status: "В пути",
      date: new Date(orderDate.getTime() + 2 * 60 * 60 * 1000).toLocaleString('ru-RU'),
      description: "Заказ передан курьерской службе",
      location: "В пути к получателю",
      icon: <FaShippingFast />,
      isCompleted: order.status === 'delivered'
    });
  }

  if (order.status === 'delivered') {
    statuses.push({
      status: "Доставлен",
      date: new Date(order.deliveryDetails.date).toLocaleString('ru-RU'),
      description: "Заказ успешно доставлен получателю",
      location: order.deliveryDetails.address,
      icon: <FaMapMarkerAlt />,
      isCompleted: true
    });
  }

  return statuses;
};

export const TrackOrder = ({ initialTrackingNumber, onClose }: TrackOrderProps) => {
  const [orderNumber, setOrderNumber] = useState(initialTrackingNumber || "");
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[] | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { orders } = useOrders();

  useEffect(() => {
    if (initialTrackingNumber) {
      handleTrack();
    }
  }, [initialTrackingNumber]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const elements = document.querySelectorAll<HTMLElement>('[class*="timelineContent"], .trackingBox');
      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / element.offsetWidth) * 100;
        const y = ((e.clientY - rect.top) / element.offsetHeight) * 100;
        element.style.setProperty('--mouse-x', `${x}%`);
        element.style.setProperty('--mouse-y', `${y}%`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleTrack = () => {
    if (!orderNumber) return;
    
    setIsLoading(true);
    setError("");
    
    const cleanOrderNumber = orderNumber.replace(/[#\s]/g, '');
    const order = orders.find(order => order.id.slice(-4) === cleanOrderNumber);
    
    setTimeout(() => {
      if (order) {
        const statuses = getOrderStatus(order);
        setOrderStatuses(statuses);
        setCurrentOrder(order);
        setError("");
      } else {
        setOrderStatuses(null);
        setCurrentOrder(null);
        setError("Заказ не найден. Проверьте номер заказа.");
      }
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className={styles.container}>
      <div className={styles.shapesContainer}>
        <div className={styles.shape1} />
        <div className={styles.shape2} />
        <div className={styles.shape3} />
      </div>
      <div className={styles.dotsContainer}>
        <div className={styles.dot1} />
        <div className={styles.dot2} />
        <div className={styles.dot3} />
        <div className={styles.dot4} />
        <div className={styles.dot5} />
        <div className={styles.dot6} />
      </div>
      <div className={styles.decorativeText1}>DELIVERY</div>
      <div className={styles.decorativeText2}>EXPRESS</div>

      <motion.div 
        className={styles.trackingBox}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.header}>
          <h1 className={styles.title}>
            Отследить заказ
            <div className={styles.titleAccent}>Быстро и удобно</div>
          </h1>
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
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Введите номер заказа (например, #8281)"
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
          {orderStatuses && currentOrder && (
            <motion.div 
              className={styles.resultContainer}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className={styles.statsContainer}>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>
                    {currentOrder.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </div>
                  <div className={styles.statLabel}>Товаров</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>
                    {new Set(currentOrder.items.map(item => item.marketplace)).size}
                  </div>
                  <div className={styles.statLabel}>Магазинов</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>
                    {orderStatuses.filter(s => s.isCompleted).length}
                  </div>
                  <div className={styles.statLabel}>Этапов</div>
                </div>
              </div>
              
              <div className={styles.mainContent}>
                <div className={styles.timeline}>
                  {orderStatuses.map((status, index) => (
                    <motion.div
                      key={index}
                      className={`${styles.timelineItem} ${status.isCompleted ? styles.completed : ''}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className={styles.timelinePoint}>
                        {status.icon}
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
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className={styles.orderDetails}>
                  {currentOrder.items.map((item, index) => (
                    <div key={index} className={styles.orderItem}>
                      <div className={styles.marketplaceTag}>
                        <FaStore className={styles.icon} />
                        {item.marketplace}
                      </div>
                      <div className={styles.itemInfo}>
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.itemLink}>
                          Товар {index + 1}
                        </a>
                        <div className={styles.itemMeta}>
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
                          <span className={styles.itemQuantity}>
                            {item.quantity} шт.
                          </span>
                        </div>
                        {item.notes && (
                          <div className={styles.itemNotes}>
                            {item.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}; 