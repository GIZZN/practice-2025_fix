import { useState, useEffect } from 'react';
import styles from './DeliveryCart.module.css';

interface DeliveryDetails {
  address: string;
  date: string;
  time: string;
  notes: string;
}

interface DeliveryFormProps {
  onSubmit: (details: DeliveryDetails) => void;
  onCancel: () => void;
  totalItems: number;
  uniqueMarketplaces: number;
}

const STORAGE_KEY = 'delivery_details';

export function DeliveryForm({ 
  onSubmit, 
  onCancel, 
  totalItems, 
  uniqueMarketplaces 
}: DeliveryFormProps) {
  const [details, setDetails] = useState<DeliveryDetails>({
    address: '',
    date: '',
    time: '',
    notes: ''
  });

  // Загрузка сохраненных деталей доставки
  useEffect(() => {
    try {
      const savedDetails = localStorage.getItem(STORAGE_KEY);
      if (savedDetails) {
        setDetails(JSON.parse(savedDetails));
      }
    } catch (error) {
      console.error('Error loading delivery details:', error);
    }
  }, []);

  // Сохранение деталей доставки при изменении
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
    } catch (error) {
      console.error('Error saving delivery details:', error);
    }
  }, [details]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(details);
    // Очищаем сохраненные детали
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Устанавливаем минимальную дату как сегодня
  const today = new Date().toISOString().split('T')[0];

  return (
    <form className={styles.deliveryForm} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="address">Адрес доставки</label>
        <input
          type="text"
          id="address"
          name="address"
          value={details.address}
          onChange={handleChange}
          placeholder="Улица, дом, квартира"
          required
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="date">Дата доставки</label>
          <input
            type="date"
            id="date"
            name="date"
            value={details.date}
            onChange={handleChange}
            min={today}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="time">Время доставки</label>
          <input
            type="time"
            id="time"
            name="time"
            value={details.time}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="notes">Примечания к доставке</label>
        <textarea
          id="notes"
          name="notes"
          value={details.notes}
          onChange={handleChange}
          placeholder="Особые пожелания или инструкции для курьера"
        />
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryInfo}>
          <div>Всего товаров: {totalItems}</div>
          <div>Маркетплейсов: {uniqueMarketplaces}</div>
        </div>
        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            Назад
          </button>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={!details.address || !details.date || !details.time}
          >
            Заказать доставку
          </button>
        </div>
      </div>
    </form>
  );
} 