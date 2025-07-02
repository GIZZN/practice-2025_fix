'use client';

import { useState, useEffect } from 'react';
import { FaRegTimesCircle, FaTrash } from 'react-icons/fa';
import styles from './DeliveryCart.module.css';
import { useDeliveryCart } from '@/hooks/useDeliveryCart';
import { useOrders } from '@/hooks/useOrders';
import { AddItemForm } from './AddItemForm';
import { DeliveryForm } from './DeliveryForm';
import { useRouter } from 'next/navigation';

interface OrderItem {
  id: string;
  marketplace: string;
  link: string;
  quantity: number;
  size?: string;
  color?: string;
  notes?: string;
}

interface DeliveryDetails {
  address: string;
  date: string;
  time: string;
  notes: string;
}

export function DeliveryCart() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { 
    items, 
    addItem,
    removeItem, 
    updateQuantity, 
    clearCart,
    totalItems,
    uniqueMarketplaces
  } = useDeliveryCart();
  const { addOrder } = useOrders();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleSubmitDelivery = async (details: DeliveryDetails) => {
    try {
      setIsSubmitting(true);
      
      // Сохраняем заказ
      const order = addOrder(items, details);
      console.log('Order submitted:', order);
      
      // Имитируем задержку сервера
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // После успешной отправки очищаем корзину
      clearCart();
      setShowDeliveryForm(false);
      
      alert('Заказ успешно оформлен!');
      // Перенаправляем на страницу профиля
      router.push('/profile');
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showAddForm) {
    return (
      <AddItemForm
        onAdd={(item: Omit<OrderItem, 'id'>) => {
          addItem(item);
          setShowAddForm(false);
        }}
        onCancel={() => setShowAddForm(false)}
      />
    );
  }

  if (showDeliveryForm) {
    return (
      <DeliveryForm
        onSubmit={handleSubmitDelivery}
        onCancel={() => setShowDeliveryForm(false)}
        totalItems={totalItems}
        uniqueMarketplaces={uniqueMarketplaces}
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <div className={styles.emptyCartIcon}>🛒</div>
        <h3>Ваша корзина пуста</h3>
        <p>Добавьте товары для оформления доставки</p>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddForm(true)}
        >
          Добавить товар
        </button>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <div className={styles.cartHeader}>
        <div className={styles.cartStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Товаров:</span>
            <span className={styles.statValue}>{totalItems}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Маркетплейсов:</span>
            <span className={styles.statValue}>{uniqueMarketplaces}</span>
          </div>
        </div>
        <button 
          className={styles.clearCartButton}
          onClick={clearCart}
          disabled={isSubmitting}
        >
          <FaTrash />
          <span>Очистить</span>
        </button>
      </div>

      <div className={styles.cartItems}>
        {items.map(item => (
          <div key={item.id} className={styles.cartItem}>
            <div className={styles.itemInfo}>
              <div className={styles.itemHeader}>
                <span className={styles.marketplace}>{item.marketplace}</span>
                <div className={styles.itemAttributes}>
                  {item.size && <span className={styles.attribute}>Размер: {item.size}</span>}
                  {item.color && <span className={styles.attribute}>Цвет: {item.color}</span>}
                </div>
              </div>
              <div className={styles.itemLink}>{item.link}</div>
              {item.notes && (
                <div className={styles.itemNotes}>
                  <span className={styles.notesLabel}>Примечания:</span>
                  {item.notes}
                </div>
              )}
            </div>
            
            <div className={styles.itemActions}>
              <div className={styles.quantityControls}>
                <button 
                  onClick={() => updateQuantity(item.id, -1)}
                  className={styles.quantityButton}
                  disabled={item.quantity <= 1 || isSubmitting}
                >
                  -
                </button>
                <span className={styles.quantity}>{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, 1)}
                  className={styles.quantityButton}
                  disabled={isSubmitting}
                >
                  +
                </button>
              </div>
              <button 
                onClick={() => removeItem(item.id)}
                className={styles.removeButton}
                title="Удалить товар"
                disabled={isSubmitting}
              >
                <FaRegTimesCircle />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.cartFooter}>
        <button 
          className={styles.addMoreButton}
          onClick={() => setShowAddForm(true)}
          disabled={isSubmitting}
        >
          Добавить ещё
        </button>
        <button 
          className={`${styles.proceedButton} ${isSubmitting ? styles.loading : ''}`}
          onClick={() => setShowDeliveryForm(true)}
          disabled={isSubmitting}
        >
          Оформить доставку
        </button>
      </div>
    </div>
  );
} 