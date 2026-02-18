import React from 'react';
import styles from './ResultCard.module.css';

const ResultCard = ({ active, label, color, value, onClick }) => {
  // Dynamic styles that depend on props
  const cardStyle = {
    borderColor: active ? color : '#F1F5F9',
    backgroundColor: active ? `${color}05` : 'white',
  };

  const isNumeric = !isNaN(parseFloat(value)) && isFinite(value);

  return (
    <div onClick={onClick} className={styles.resultCard} style={cardStyle}>
      <p className={styles.label}>{label}</p>
      <h3 className={styles.value}>{isNumeric ? `₹${Number(value).toLocaleString('en-IN')}` : value}</h3>
      {active && onClick && <span className={styles.activeView} style={{ color }}>● Active View</span>}
    </div>
  );
};

export default ResultCard;