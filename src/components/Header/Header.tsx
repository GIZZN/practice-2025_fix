'use client';

import { useState, useEffect, useCallback, memo, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import dynamic from 'next/dynamic';
import styles from './Header.module.css';
import { FaUser, FaShoppingBag, FaSearch, FaMoon, FaSun } from 'react-icons/fa';

const MobileHeader = dynamic(() => import('./MobileHeader'), {
  loading: () => <div className={styles.mobileNavPlaceholder} />,
  ssr: false
});

const navVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      staggerChildren: 0.08,
      duration: 0.5,
      ease: [0.645, 0.045, 0.355, 1]
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.645, 0.045, 0.355, 1]
    }
  }
};

const NotificationBadge = memo(({ count }: { count: number }) => (
  <motion.span 
    className={styles.badge}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0, opacity: 0 }}
    transition={{
      type: "spring",
      stiffness: 500,
      damping: 25
    }}
  >
    {count}
  </motion.span>
));

NotificationBadge.displayName = 'NotificationBadge';

const SearchBar = memo(() => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`${styles.searchBar} ${isOpen ? styles.searchBarOpen : ''}`}>
      <input 
        type="text" 
        placeholder="Поиск..."
        className={styles.searchInput}
      />
      <button 
        className={styles.searchButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg 
          viewBox="0 0 24 24" 
          className={styles.searchIcon}
        >
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

const ThemeToggle = memo(() => {
  const [isDark, setIsDark] = useState(true);

  return (
    <motion.button
      className={`${styles.themeToggle} ${isDark ? styles.dark : styles.light}`}
      onClick={() => setIsDark(!isDark)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 1.10 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
    >
      <motion.div 
        className={styles.toggleCircle}
        animate={{ 
          x: isDark ? '26px' : '2px',
          backgroundColor: isDark ? '#4ECDC4' : '#FFD700'
        }}
        transition={{
          type: "spring",
          stiffness: 450,
          damping: 25
        }}
      />
      <motion.svg 
        className={styles.sunIcon} 
        viewBox="0 0 24 24"
        animate={{
          opacity: isDark ? 0.3 : 1,
          scale: isDark ? 0.8 : 1
        }}
        transition={{ duration: 0.2 }}
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </motion.svg>
      <motion.svg 
        className={styles.moonIcon} 
        viewBox="0 0 24 24"
        animate={{
          opacity: isDark ? 1 : 0.3,
          scale: isDark ? 1 : 0.8
        }}
        transition={{ duration: 0.2 }}
      >
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </motion.svg>
    </motion.button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

const DotBackground = memo(() => (
  <div className={styles.dotBackground}>
    <div className={styles.dot}></div>
    <div className={styles.dot}></div>
    <div className={styles.dot}></div>
    <div className={styles.dot}></div>
    <div className={styles.dot}></div>
  </div>
));

DotBackground.displayName = 'DotBackground';

const NavLinks = memo(() => (
  <motion.nav 
    className={styles.nav}
    variants={navVariants}
    initial="hidden"
    animate="visible"
  >
    {[
      { href: '/delivery-order', label: 'Создать заказ' },
      { href: '/tracking', label: 'Отследить заказ' },
      { href: '/points', label: 'Пункты выдачи' }
    ].map((item) => (
      <motion.div key={item.href} variants={itemVariants}>
        <Link href={item.href} className={styles.link}>
          {item.label}
          <motion.div className={styles.linkUnderline} />
        </Link>
      </motion.div>
    ))}
  </motion.nav>
));

NavLinks.displayName = 'NavLinks';

const MobileNavItem = memo(({ href, label, closeMenu }: { href: string; label: string; closeMenu: () => void }) => (
  <motion.div 
    variants={itemVariants}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Link 
      href={href} 
      className={styles.mobileLink} 
      onClick={closeMenu}
    >
      <DotBackground />
      {label}
    </Link>
  </motion.div>
));

MobileNavItem.displayName = 'MobileNavItem';

const MobileNav = memo(({ isOpen, closeMenu, user, logout, isAuthenticated }: {
  isOpen: boolean;
  closeMenu: () => void;
  user: any;
  logout: () => void;
  isAuthenticated: boolean;
}) => {
  const navItems = [
    { href: '/tracking', label: 'Отследить заказ' },
    { href: '/calculator', label: 'Рассчитать стоимость' },
    { href: '/points', label: 'Пункты выдачи' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={styles.mobileNav}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.2,
            ease: "easeOut"
          }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
            initial="hidden"
            animate="visible"
          >
            {navItems.map((item) => (
              <MobileNavItem 
                key={item.href} 
                href={item.href} 
                label={item.label} 
                closeMenu={closeMenu}
              />
            ))}
          </motion.div>
      
          <motion.div 
            className={styles.mobileAuth}
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="visible"
          >
            {isAuthenticated ? (
              <>
                <motion.div variants={itemVariants}>
                  <Link 
                    href="/profile" 
                    className={styles.profileLink} 
                    onClick={closeMenu}
                  >
                    <div className={styles.avatarWrapper}>
                      {user?.avatar ? (
                        <Image 
                          src={user.avatar} 
                          alt={`${user.name}'s profile`}
                          className={styles.avatar}
                          width={32}
                          height={32}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      {user && user.notifications > 0 && (
                        <NotificationBadge count={user.notifications} />
                      )}
                    </div>
                    <span className={styles.userName}>{user?.name}</span>
                  </Link>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    href="/" 
                    onClick={() => {
                      logout();
                      closeMenu();
                    }} 
                    className={styles.authButton}
                  >
                    <DotBackground />
                    Выйти
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div variants={itemVariants}>
                  <Link 
                    href="/login" 
                    className={styles.authButton} 
                    onClick={closeMenu}
                  >
                    <DotBackground />
                    Войти
                  </Link>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Link 
                    href="/register" 
                    className={styles.authButton} 
                    onClick={closeMenu}
                  >
                    <DotBackground />
                    Регистрация
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

MobileNav.displayName = 'MobileNav';

export const Header = memo(() => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    requestAnimationFrame(() => {
      if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > 50 && currentScrollY > lastScrollY.current) {
        setIsVisible(false);
        setIsMenuOpen(false);
      }
      lastScrollY.current = currentScrollY;
    });
  }, []);

  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout> | undefined;
    const throttledScroll = () => {
      if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
          handleScroll();
          scrollTimeout = undefined;
        }, 150);
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [handleScroll]);

  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <motion.header 
      className={styles.header}
      initial={false}
      animate={{ 
        y: isVisible ? 0 : -100,
        opacity: isVisible ? 1 : 0
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      <div className={styles.container}>
        <motion.div 
          className={styles.logoWrapper}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 17
          }}
        >
          <Link href="/" className={styles.logo} onClick={closeMenu}>
            FastDelivery
          </Link>
        </motion.div>

        <SearchBar />
        <NavLinks />

        <div className={styles.controls}>
          <ThemeToggle />
          
          <div className={styles.auth}>
            {isAuthenticated ? (
              <>
                <div 
                  className={styles.profileWrapper}
                >
                  <Link href="/profile" className={styles.profileLink}>
                    <div className={styles.avatarWrapper}>
                      {user?.avatar ? (
                        <Image 
                          src={user.avatar} 
                          alt={`${user.name}'s profile`}
                          className={styles.avatar}
                          width={32}
                          height={32}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      {user && user.notifications && (
                        <NotificationBadge count={1} />
                      )}
                    </div>
                    <span className={styles.userName}>{user?.name}</span>
                  </Link>
                </div>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    href="/" 
                    onClick={() => {
                      logout();
                      closeMenu();
                    }} 
                    className={styles.authButton}
                  >
                    Выйти
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/login" className={styles.authButton}>
                    Войти
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/register" className={styles.authButton}>
                    Регистрация
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>

        <button 
          className={`${styles.menuButton} ${isMenuOpen ? styles.menuOpen : ''}`}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
        >
          <div className={styles.menuIcon}>
            <span />
            <span />
            <span />
          </div>
        </button>

        <Suspense fallback={<div className={styles.mobileNavPlaceholder} />}>
          <MobileHeader 
          isOpen={isMenuOpen}
          closeMenu={closeMenu}
          user={user}
          logout={logout}
          isAuthenticated={isAuthenticated}
        />
        </Suspense>
      </div>
    </motion.header>
  );
});

Header.displayName = 'Header'; 