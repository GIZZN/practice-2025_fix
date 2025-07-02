'use client';

import { useEffect, useState, useCallback, memo, useMemo, useRef } from 'react';
import styles from './PickupPoints.module.css';
import { FaMapMarkerAlt, FaClock, FaPhone, FaTimes } from 'react-icons/fa';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { FaTimes as FaTimesLocal } from 'react-icons/fa';
import { FaPhone as FaPhoneLocal } from 'react-icons/fa';

interface PickupPoint {
  id: string;
  address: string;
  coordinates: [number, number];
  workingHours: string;
  phone: string;
}

const mockPickupPoints: PickupPoint[] = [
  {
    id: '1',
    address: 'ул. Ленина, 10',
    coordinates: [55.751574, 37.573856],
    workingHours: '09:00-21:00',
    phone: '+7 (999) 123-45-67'
  },
  {
    id: '2',
    address: 'пр. Мира, 25',
    coordinates: [55.762374, 37.583856],
    workingHours: '10:00-22:00',
    phone: '+7 (999) 765-43-21'
  },
  {
    id: '3',
    address: 'ул. Тверская, 15',
    coordinates: [55.759574, 37.563856],
    workingHours: '08:00-20:00',
    phone: '+7 (999) 987-65-43'
  }
];

const PointCard = memo(({ 
  point, 
  isSelected, 
  index, 
  onSelect 
}: { 
  point: PickupPoint; 
  isSelected: boolean; 
  index: number;
  onSelect: (point: PickupPoint) => void;
}) => (
  <div
    className={`${styles.pointCard} ${isSelected ? styles.selected : ''}`}
    onClick={() => onSelect(point)}
    style={{
      animationDelay: `${index * 0.1}s`
    }}
  >
    <div className={styles.pointIcon}>
      <FaMapMarkerAlt />
    </div>
    <div className={styles.pointContent}>
      <h3 className={styles.pointAddress}>{point.address}</h3>
      <div className={styles.pointDetails}>
        <span className={styles.workingHours}>
          <FaClock />
          {point.workingHours}
        </span>
        <span className={styles.phone}>
          <FaPhone />
          {point.phone}
        </span>
      </div>
    </div>
  </div>
));

PointCard.displayName = 'PointCard';

const Shapes = memo(() => (
  <div className={styles.shapesContainer}>
    <div className={styles.shape1} />
    <div className={styles.shape2} />
    <div className={styles.shape3} />
  </div>
));

Shapes.displayName = 'Shapes';

const PointModal = memo(({ 
  point, 
  onClose,
  position,
  mapInstance
}: { 
  point: PickupPoint;
  onClose: () => void;
  position: [number, number];
  mapInstance: ymaps.Map;
}) => {
  const [modalPosition, setModalPosition] = useState({ left: 0, top: 0 });

  useEffect(() => {
    const updatePosition = () => {
      if (window.ymaps && mapInstance) {
        const projection = mapInstance.options.get('projection');
        const pixelPosition = projection.toGlobalPixels(
          position,
          mapInstance.getZoom()
        );
        const convertedPos = mapInstance.converter.globalToPage(pixelPosition);
        
        const mapElement = document.getElementById('map');
        if (mapElement) {
          const mapRect = mapElement.getBoundingClientRect();
          setModalPosition({
            left: convertedPos[0] - mapRect.left,
            top: convertedPos[1] - mapRect.top
          });
        }
      }
    };

    // Обновляем позицию при монтировании
    updatePosition();

    // Добавляем слушатели событий карты
    if (mapInstance) {
      mapInstance.events.add(['boundschange', 'actiontick'], updatePosition);
    }

    // Очищаем слушатели при размонтировании
    return () => {
      if (mapInstance) {
        mapInstance.events.remove(['boundschange', 'actiontick'], updatePosition);
      }
    };
  }, [position, mapInstance]);

  return (
    <div 
      className={styles.modalOverlay} 
      style={{
        left: modalPosition.left,
        top: modalPosition.top
      }}
    >
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>
        <h3>{point.address}</h3>
        <p className={styles.modalPhone}>
          <FaPhone />
          {point.phone}
        </p>
        <button className={styles.bookButton}>
          Записаться
        </button>
      </div>
    </div>
  );
});

PointModal.displayName = 'PointModal';

type YMap = ymaps.Map;

export const PickupPoints = () => {
  const [selectedPoint, setSelectedPoint] = useState<PickupPoint | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const mapRef = useRef<ymaps.Map | null>(null);
  const placemarkRefs = useRef<Map<string, ymaps.Placemark>>(new Map());
  const isMapInitialized = useRef(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const createPlacemark = useCallback((point: PickupPoint) => {
    if (!window.ymaps) return null;

    return new window.ymaps.Placemark(
      point.coordinates,
      {balloonContentLayout: window.ymaps.templateLayoutFactory.createClass('')},

      {
        iconLayout: 'default#image',
        iconImageHref: '/delivery-box.svg',
        iconImageSize: [40, 40],
        iconImageOffset: [-20, -40],
        iconShape: {
          type: 'Circle',
          coordinates: [0, 0],
          radius: 20
        }
      }
    );
  }, []);

  const initMap = useCallback(() => {
    if (!window.ymaps || isMapInitialized.current) return;
    
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    mapContainer.innerHTML = '';
    
    const mapInstance = new window.ymaps.Map('map', {
      center: [55.751574, 37.573856],
      zoom: 11,
      controls: ['zoomControl', 'geolocationControl']
    });

    mockPickupPoints.forEach(point => {
      const placemark = createPlacemark(point);
      if (placemark) {
        placemark.events.add('click', () => {
          setSelectedPoint(point);
        });
        mapInstance.geoObjects.add(placemark);
        placemarkRefs.current.set(point.id, placemark);
      }
    });

    mapRef.current = mapInstance;
    isMapInitialized.current = true;
  }, [createPlacemark]);

  const loadYandexMaps = useCallback(() => {
    const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]');
    if (existingScript) {
      if (window.ymaps && !isMapInitialized.current) {
        window.ymaps.ready(initMap);
      }
      return;
    }

    const scriptElement = document.createElement('script');
    scriptElement.src = `https://api-maps.yandex.ru/2.1/?apikey=ВАШ_API_КЛЮЧ&lang=ru_RU`;
    scriptElement.async = true;
    scriptElement.onload = () => window.ymaps.ready(initMap);
    document.body.appendChild(scriptElement);

    return () => {
      if (document.body.contains(scriptElement)) {
        document.body.removeChild(scriptElement);
      }
    };
  }, [initMap]);

  useEffect(() => {
    const cleanup = loadYandexMaps();
    
    return () => {
      if (mapRef.current) {
        mapRef.current.destroy();
        isMapInitialized.current = false;
      }
      placemarkRefs.current.clear();
      if (cleanup) cleanup();
    };
  }, [loadYandexMaps]);

  const handlePointSelect = useCallback((point: PickupPoint) => {
    setSelectedPoint(point);
    mapRef.current?.setCenter(point.coordinates, 15);
  }, []);

  const pointsList = useMemo(() => (
    <div className={styles.pointsList}>
      {mockPickupPoints.map((point, index) => (
        <PointCard
          key={point.id}
          point={point}
          isSelected={selectedPoint?.id === point.id}
          index={index}
          onSelect={handlePointSelect}
        />
      ))}
    </div>
  ), [selectedPoint, handlePointSelect]);

  return (
    <>
      <Header />
      <div className={`${styles.pageWrapper} ${isVisible ? styles.visible : ''}`}>
        <Shapes />
        <div className={styles.container}>
          <div className={styles.sidebar}>
            <div className={styles.sidebarContent}>
              <h2 className={styles.title}>
                Пункты выдачи
                <div className={styles.titleUnderline} />
              </h2>
              {pointsList}
            </div>
          </div>
          <div className={styles.mapWrapper}>
            <div id="map" className={styles.map}></div>
            {selectedPoint && mapRef.current && (
              <PointModal 
                point={selectedPoint}
                position={selectedPoint.coordinates}
                onClose={() => setSelectedPoint(null)}
                mapInstance={mapRef.current}
              />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}; 