import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import styles from './Header.module.css';

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

interface MobileHeaderProps {
  isOpen: boolean;
  closeMenu: () => void;
  user: any;
  logout: () => void;
  isAuthenticated: boolean;
}

const MobileHeader = memo(({ isOpen, closeMenu, user, logout, isAuthenticated }: MobileHeaderProps) => {
  const navItems = [
    { href: '/delivery-order', label: 'Создать заказ' },
    { href: '/tracking', label: 'Отследить заказ' },
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

MobileHeader.displayName = 'MobileHeader';

export default MobileHeader; 