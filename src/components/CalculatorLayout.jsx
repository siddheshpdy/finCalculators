import React, { useRef, useEffect } from 'react';
import styles from './WealthPlanner.module.css';

const CalculatorLayout = ({
  currentMenu,
  setCurrentMenu,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  children
}) => {
  const sidebarRef = useRef(null);

  // Close mobile menu when clicking outside
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
        {/* Left Sidebar */}
        <aside className={styles.sidebar} ref={sidebarRef}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Calculators</h2>
            <button 
              className={styles.mobileMenuToggle} 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
          <div className={`${styles.sidebarMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
            {['SIP', 'Lumpsum', 'RD', 'Loan', 'SWP', 'Tracker'].map(m => (
              <button key={m} onClick={() => { setCurrentMenu(m); setIsMobileMenuOpen(false); }} className={`${styles.sidebarBtn} ${currentMenu === m ? styles.sidebarBtnActive : ''}`}>{m}</button>
            ))}
            <button onClick={() => { setCurrentMenu('Help'); setIsMobileMenuOpen(false); }} className={`${styles.sidebarBtn} ${currentMenu === 'Help' ? styles.sidebarBtnActive : ''}`}>Help</button>
          </div>
        </aside>

        <div className={styles.mainPanel}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CalculatorLayout;