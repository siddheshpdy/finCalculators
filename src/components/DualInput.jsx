import React, { useId } from 'react';
import styles from './DualInput.module.css';

const formatBound = (bound, symbol) => {
  if (symbol === '\u20B9') {
    return `\u20B9${Number(bound).toLocaleString('en-IN')}`;
  }

  return `${bound}${symbol ? ` ${symbol}` : ''}`;
};

const DualInput = ({ label, symbol, value, min, max, step, onChange }) => {
  const inputId = useId();
  const sliderId = `${inputId}-slider`;

  return (
    <div className={styles.dualInput}>
      <div className={styles.labelRow}>
        <div className={styles.labelBlock}>
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        </div>
        <span className={styles.rangeMeta}>
          {formatBound(min, symbol)} to {formatBound(max, symbol)}
        </span>
      </div>

      <div className={styles.controlSurface}>
        <div className={styles.inputWrapper}>
          <input
            id={inputId}
            type="number"
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            className={styles.numberInput}
          />
          <span className={styles.symbol}>{symbol}</span>
        </div>

        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className={styles.rangeInput}
          aria-label={`${label} slider`}
        />
      </div>
    </div>
  );
};

export default DualInput;
