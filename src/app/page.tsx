'use client';

import Image from 'next/image';
import { useEffect, useState, useRef, useCallback } from 'react';
import styles from './page.module.css';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { FaStar, FaStore, FaShoppingBag, FaBox, FaTruck, FaMapMarkedAlt, FaMobile, FaClock, FaShieldAlt, FaHeadset } from 'react-icons/fa';
import Link from 'next/link';

const stores = [
  {
    id: 1,
    name: 'Tex Пром',
    category: 'Электроника',
    image: '/images/electronics.jpg',
    rating: 4.8,
    orders: '2.5K',
    deliveryTime: '30-45 мин'
  },
  {
    id: 2,
    name: 'URBAN',
    category: 'Одежда',
    image: '/images/fashion.jpg',
    rating: 4.9,
    orders: '3.2K',
    deliveryTime: '40-60 мин'
  },
  {
    id: 3,
    name: 'SPORTS ZONE',
    category: 'Спортивные товары',
    image: '/images/sports.jpg',
    rating: 4.7,
    orders: '1.8K',
    deliveryTime: '35-50 мин'
  },
  {
    id: 4,
    name: 'BOOK HOME',
    category: 'Книги',
    image: '/images/books.jpg',
    rating: 4.9,
    orders: '2.1K',
    deliveryTime: '25-40 мин'
  },
  {
    id: 5,
    name: 'NABI',
    category: 'Косметика',
    image: '/images/beauty.jpg',
    rating: 4.8,
    orders: '2.7K',
    deliveryTime: '30-45 мин'
  },
  {
    id: 6,
    name: 'TOY PANDA',
    category: 'Товары для детей',
    image: '/images/kids.jpg',
    rating: 4.9,
    orders: '2.3K',
    deliveryTime: '35-50 мин'
  }
];

const processSteps = [
  {
    id: 1,
    title: 'Выберите магазин',
    description: 'Просмотрите каталоги наших партнеров и выберите нужные товары из любимых магазинов',
    icon: <FaStore size={40} color="#FF3366" />
  },
  {
    id: 2,
    title: 'Оформите заказ',
    description: 'Добавьте товары в корзину и укажите адрес доставки. Мы подберем оптимальный маршрут',
    icon: <FaBox size={40} color="#FF3366" />
  },
  {
    id: 3,
    title: 'Отслеживайте',
    description: 'Следите за перемещением вашего заказа в реальном времени через мобильное приложение',
    icon: <FaMapMarkedAlt size={40} color="#FF3366" />
  },
  {
    id: 4,
    title: 'Получите доставку',
    description: 'Курьер доставит ваш заказ точно в срок. Оплата при получении или онлайн',
    icon: <FaTruck size={40} color="#FF3366" />
  }
];

const features = [
  {
    id: 1,
    title: 'Быстрая доставка',
    description: 'Доставляем заказы в течение дня',
    icon: <FaClock />
  },
  {
    id: 2,
    title: 'Мобильное приложение',
    description: 'Удобное управление заказами',
    icon: <FaMobile />
  },
  {
    id: 3,
    title: 'Безопасная оплата',
    description: 'Защищенные платежи',
    icon: <FaShieldAlt />
  },
  {
    id: 4,
    title: 'Поддержка 24/7',
    description: 'Всегда на связи',
    icon: <FaHeadset />
  }
];

export default function Home() {
  const [animatedElements, setAnimatedElements] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  const updateVisibility = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('data-element-id');
        if (id) {
          setAnimatedElements(prev => {
            const newSet = new Set(prev);
            newSet.add(id);
            return newSet;
          });
          observerRef.current?.unobserve(entry.target);
        }
      }
    });
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(updateVisibility, {
      threshold: 0.2,
      rootMargin: '50px'
    });

    const observer = observerRef.current;
    const elements = new Map(elementsRef.current);
    
    elements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      elements.forEach((element) => {
        observer.unobserve(element);
      });
      observer.disconnect();
    };
  }, [updateVisibility]);

  const setRef = useCallback((element: HTMLDivElement | null, id: string) => {
    if (element) {
      elementsRef.current.set(id, element);
      if (!animatedElements.has(id)) {
        observerRef.current?.observe(element);
      }
    } else {
      elementsRef.current.delete(id);
    }
  }, [animatedElements]);

  return (
    <div>
      <Header />
      <section className={styles.hero}>
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
        <div className={styles.decorativeText1}>DELIVERY</div>
        <div className={styles.decorativeText2}>EXPRESS</div>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Доставляем будущее
            <br />
            <span className={styles.titleAccent}>уже сегодня</span>
          </h1>
          <p className={styles.subtitle}>
            Инновационный сервис доставки, который переосмысливает логистику. 
            Используем передовые технологии для быстрой и надежной доставки 
            в любую точку мира.
          </p>
          <div className={styles.ctaContainer}>
            <Link href="/tracking" className={styles.cta}>
              Отследить заказ
            </Link>
            <Link href="/points" className={styles.ctaSecondary}>
              Пункты выдачи
            </Link>
          </div>
          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>500K+</div>
              <div className={styles.statLabel}>Доставок</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>98%</div>
              <div className={styles.statLabel}>Вовремя</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>150+</div>
              <div className={styles.statLabel}>Городов</div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.unifiedBackground} />
      
      <section className={styles.storesSection}>
        <div className={styles.storesContainer}>
          <div className={styles.storesHeading}>
            <h2 className={styles.storesTitle}>Наши партнёры</h2>
            <p className={styles.storesSubtitle}>
              Выбирайте из широкого ассортимента товаров от лучших магазинов с быстрой доставкой
            </p>
          </div>
          <div className={styles.storesGrid}>
            {stores.map((store) => (
              <div
                key={store.id}
                ref={(el) => setRef(el, `store-${store.id}`)}
                data-element-id={`store-${store.id}`}
                className={`${styles.storeCard} ${animatedElements.has(`store-${store.id}`) ? styles.visible : ''}`}
              >
                <div className={styles.storeImageContainer}>
                  <Image
                    src={store.image}
                    alt={store.name}
                    className={styles.storeImage}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <h3 className={styles.storeName}>{store.name}</h3>
                <p className={styles.storeCategory}>{store.category}</p>
                <div className={styles.storeStats}>
                  <div className={styles.storeRating}>
                    <FaStar />
                    <span>{store.rating}</span>
                  </div>
                  <div className={styles.storeStat}>
                    <FaShoppingBag />
                    <span>{store.orders}</span>
                  </div>
                  <div className={styles.storeDeliveryTime}>
                    {store.deliveryTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.processSection}>
        <div className={styles.processContainer}>
          <div className={styles.processHeading}>
            <h2 className={styles.processTitle}>Как это работает</h2>
            <p className={styles.processSubtitle}>
              Всего 4 простых шага для получения вашего заказа. Быстро, удобно и надежно
            </p>
          </div>
          
          <div className={styles.processSteps}>
            {processSteps.map((step) => (
              <div
                key={step.id}
                ref={(el) => setRef(el, `step-${step.id}`)}
                data-element-id={`step-${step.id}`}
                className={`${styles.processStep} ${animatedElements.has(`step-${step.id}`) ? styles.visible : ''}`}
              >
                <div className={styles.stepNumber}>{step.id}</div>
                <div className={styles.stepIcon}>{step.icon}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            ))}
          </div>

          <div className={styles.processFeatures}>
            {features.map(feature => (
              <div key={feature.id} className={styles.processFeature}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h4 className={styles.featureTitle}>{feature.title}</h4>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
