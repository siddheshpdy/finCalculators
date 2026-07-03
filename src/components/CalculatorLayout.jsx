import React, { useEffect, useRef } from 'react';
import styles from './WealthPlanner.module.css';

const CalculatorLayout = ({
  currentMenu,
  setCurrentMenu,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  children,
}) => {
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen, setIsMobileMenuOpen]);

  return (
    <div className={styles.wealthPlannerRoot}>
      <div className={styles.mainContent}>
        <aside className={styles.sidebar} ref={sidebarRef}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Calculators</h2>
            <button
              className={styles.mobileMenuToggle}
              aria-label="Toggle calculator menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? '\u2715' : '\u2630'}
            </button>
          </div>
          <div
            data-testid="sidebar-menu"
            className={`${styles.sidebarMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}
          >
            {['SIP', 'Lumpsum', 'RD', 'Loan', 'SWP', 'Goal', 'Tracker'].map((menu) => (
              <button
                key={menu}
                onClick={() => {
                  setCurrentMenu(menu);
                  setIsMobileMenuOpen(false);
                }}
                className={`${styles.sidebarBtn} ${
                  currentMenu === menu ? styles.sidebarBtnActive : ''
                }`}
              >
                {menu}
              </button>
            ))}
            <button
              onClick={() => {
                setCurrentMenu('Help');
                setIsMobileMenuOpen(false);
              }}
              className={`${styles.sidebarBtn} ${
                currentMenu === 'Help' ? styles.sidebarBtnActive : ''
              }`}
            >
              Help
            </button>
          </div>
        </aside>

        <div className={styles.mainPanel}>{children}</div>
      </div>
    </div>
  );
};

export default CalculatorLayout;
