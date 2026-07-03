import React from 'react';
import styles from './ResultCard.module.css';

const ResultCard = ({ active, label, color, value, onClick }) => {
  const cardStyle = {
    borderColor: active ? color : '#F1F5F9',
    backgroundColor: active ? `${color}05` : 'white',
  };

  const isNumeric = !isNaN(parseFloat(value)) && isFinite(value);
  const CardTag = onClick ? 'button' : 'div';

  return (
    <CardTag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={styles.resultCard}
      style={cardStyle}
    >
      <p className={styles.label}>{label}</p>
      <h3 className={styles.value}>
        {isNumeric ? `\u20B9${Number(value).toLocaleString('en-IN')}` : value}
      </h3>
      {active && onClick && (
        <span className={styles.activeView} style={{ color }}>
          {'\u25CF'} Active View
        </span>
      )}
    </CardTag>
  );
};

export default ResultCard;
