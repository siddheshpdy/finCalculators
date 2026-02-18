import React from 'react';
import styles from './DualInput.module.css';

const DualInput = ({ label, symbol, value, min, max, step, onChange }) => (
  <div className={styles.dualInput}>
    <div className={styles.labelWrapper}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputWrapper}>
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className={styles.numberInput} />
        <span className={styles.symbol}>{symbol}</span>
      </div>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className={styles.rangeInput} />
  </div>
);

export default DualInput;