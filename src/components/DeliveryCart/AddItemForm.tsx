import { useState, useEffect } from 'react';
import styles from './DeliveryCart.module.css';

interface OrderItem {
  marketplace: string;
  link: string;
  quantity: number;
  size?: string;
  color?: string;
  notes?: string;
}

interface AddItemFormProps {
  onAdd: (item: OrderItem) => void;
  onCancel: () => void;
}

const marketplaces = [
  { id: 'ozon', name: 'OZON' },
  { id: 'wildberries', name: 'Wildberries' },
  { id: 'aliexpress', name: 'AliExpress' },
  { id: 'yandex', name: 'Яндекс.Маркет' },
  { id: 'sber', name: 'СберМегаМаркет' },
  { id: 'kazan', name: 'KazanExpress' }
];

const STORAGE_KEY = 'delivery_current_item';

export function AddItemForm({ onAdd, onCancel }: AddItemFormProps) {
  const [item, setItem] = useState<OrderItem>({
    marketplace: '',
    link: '',
    quantity: 1
  });

  // Загрузка сохраненной формы при монтировании
  useEffect(() => {
    try {
      const savedItem = localStorage.getItem(STORAGE_KEY);
      if (savedItem) {
        setItem(JSON.parse(savedItem));
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  }, []);

  // Сохранение формы при изменении
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(item));
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item.marketplace && item.link) {
      onAdd(item);
      // Очищаем сохраненную форму
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setItem(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Math.max(1, parseInt(value) || 1) : value
    }));
  };

  return (
    <form className={styles.addForm} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="marketplace">Маркетплейс</label>
        <select
          id="marketplace"
          name="marketplace"
          value={item.marketplace}
          onChange={handleChange}
          required
        >
          <option value="">Выберите маркетплейс</option>
          {marketplaces.map(mp => (
            <option key={mp.id} value={mp.name}>{mp.name}</option>
          ))}
        </select>
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="link">Ссылка на товар</label>
        <input
          type="text"
          id="link"
          name="link"
          value={item.link}
          onChange={handleChange}
          placeholder="https://"
          required
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="quantity">Количество</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            min="1"
            value={item.quantity}
            onChange={handleChange}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="size">Размер (если нужно)</label>
          <input
            type="text"
            id="size"
            name="size"
            value={item.size || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="color">Цвет (если нужно)</label>
          <input
            type="text"
            id="color"
            name="color"
            value={item.color || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="notes">Примечания к товару</label>
        <textarea
          id="notes"
          name="notes"
          value={item.notes || ''}
          onChange={handleChange}
          placeholder="Особые пожелания или заметки"
        />
      </div>

      <div className={styles.formActions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onCancel}
        >
          Отмена
        </button>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={!item.marketplace || !item.link}
        >
          Добавить
        </button>
      </div>
    </form>
  );
} 