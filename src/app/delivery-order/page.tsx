'use client';

import { useState } from 'react';
import styles from './DeliveryOrder.module.css';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { FaStore, FaMapMarkedAlt, FaClock, FaTruck } from 'react-icons/fa';
import { DeliveryCart } from '@/components/DeliveryCart/DeliveryCart';

const features = [
  {
    id: 1,
    title: 'Мультимаркет',
    description: 'Заказывайте товары из разных магазинов в одной доставке',
    icon: <FaStore />
  },
  {
    id: 2,
    title: 'Отслеживание',
    description: 'Следите за статусом доставки в реальном времени',
    icon: <FaMapMarkedAlt />
  },
  {
    id: 3,
    title: 'Гибкое время',
    description: 'Выбирайте удобное время доставки',
    icon: <FaClock />
  },
  {
    id: 4,
    title: 'Особые условия',
    description: 'Указывайте особые требования к доставке',
    icon: <FaTruck />
  }
];

export default function DeliveryOrder() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.backgroundText}>FASTDELIVERY</div>
      <div className={styles.backgroundText}>FASTDELIVERY</div>
      <div className={styles.backgroundText}>FASTDELIVERY</div>
      
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
        <div className={styles.dot7} />
        <div className={styles.dot8} />
      </div>
      <Header />
      <div className={styles.content}>
        <h1 className={styles.title}>Оформление доставки</h1>
        
        <div className={styles.features}>
          {features.map(feature => (
            <div key={feature.id} className={styles.feature}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <section className={styles.orderSection}>
          <DeliveryCart />
        </section>
      </div>
      <Footer />
    </div>
  );
} 