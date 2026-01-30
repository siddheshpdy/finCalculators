import React, { useState, useMemo } from 'react';
import { useFinance } from '../hooks/useFinance';
import WealthChart from './WealthChart';

const SipCalculator = () => {
  const [inputs, setInputs] = useState({
    amount: 5000,
    rate: 12,
    years: 10,
    stepUpPercent: 10,
    stepUpValue: 0
  });
  const [activeStrategy, setActiveStrategy] = useState('percent'); // 'percent' or 'fixed'
  const [activeTab, setActiveTab] = useState('stepUp');

  const { calculateSIP } = useFinance();

  const results = useMemo(() => calculateSIP(
    Number(inputs.amount), Number(inputs.rate), Number(inputs.years),
    activeStrategy === 'percent' ? Number(inputs.stepUpPercent) : 0,
    activeStrategy === 'fixed' ? Number(inputs.stepUpValue) : 0
  ), [inputs, activeStrategy, calculateSIP]);

  const chartData = useMemo(() => results.breakdown.map(d => ({
    name: `Yr ${d.year}`,
    Invested: Number(activeTab === 'stepUp' ? d.stepUp.investedAmount : d.normal.investedAmount),
    TotalValue: Number(activeTab === 'stepUp' ? d.stepUp.totalValue : d.normal.totalValue)
  })), [results, activeTab]);

  const handleInputChange = (field, val) => {
    setInputs(prev => ({ ...prev, [field]: val }));
  };

  return (
    <div style={{ backgroundColor: '#F1F5F9', minHeight: '100vh', padding: '40px' }}>
      <div style={containerStyle}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1E293B', marginBottom: '30px' }}>Investment Planner</h2>

        <div style={controlGrid}>
          {/* SIP Details Card */}
          <div style={innerCard}>
            <p style={cardHeading}>SIP Details</p>
            <DualInput label="Monthly Investment" symbol="₹" value={inputs.amount} min={500} max={100000} step={500}
                       onChange={(val) => handleInputChange('amount', val)} />
            <DualInput label="Expected Return Rate" symbol="%" value={inputs.rate} min={1} max={30} step={0.5}
                       onChange={(val) => handleInputChange('rate', val)} />
            <DualInput label="Investment Tenure" symbol="Yrs" value={inputs.years} min={1} max={40} step={1}
                       onChange={(val) => handleInputChange('years', val)} />
          </div>

          {/* Step-Up Strategy Card */}
          <div style={innerCard}>
            <p style={cardHeading}>Step-Up Strategy</p>
            <div style={toggleWrapper}>
              <button onClick={() => setActiveStrategy('percent')} style={toggleBtn(activeStrategy === 'percent')}>%</button>
              <button onClick={() => setActiveStrategy('fixed')} style={toggleBtn(activeStrategy === 'fixed')}>₹</button>
            </div>
            {activeStrategy === 'percent' ? (
              <DualInput label="Yearly Increase (%)" symbol="%" value={inputs.stepUpPercent} min={1} max={50} step={1}
                           onChange={(val) => handleInputChange('stepUpPercent', val)} />
            ) : (
              <DualInput label="Fixed Annual Increase" symbol="₹" value={inputs.stepUpValue} min={0} max={50000} step={500}
                           onChange={(val) => handleInputChange('stepUpValue', val)} />
            )}
          </div>

          {/* Results Comparison Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div onClick={() => setActiveTab('stepUp')} style={maturityCard(activeTab === 'stepUp', '#10B981')}>
              <p style={labelSmall}>STEP-UP MATURITY</p>
              <h3 style={valueLarge}>₹{Number(results.summary.stepUpSip.totalValue).toLocaleString('en-IN')}</h3>
              {activeTab === 'stepUp' && <span style={activeBadge}>● Active View</span>}
            </div>
            <div onClick={() => setActiveTab('normal')} style={maturityCard(activeTab === 'normal', '#3B82F6')}>
              <p style={labelSmall}>NORMAL MATURITY</p>
              <h3 style={valueLarge}>₹{Number(results.summary.normalSip.totalValue).toLocaleString('en-IN')}</h3>
              {activeTab === 'normal' && <span style={activeBadgeBlue}>● Active View</span>}
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div style={{ ...innerCard, marginBottom: '30px' }}>
          <p style={cardHeading}>{activeTab === 'stepUp' ? 'Step-Up' : 'Normal'} Wealth Projection</p>
          <WealthChart data={chartData} primaryColor={activeTab === 'stepUp' ? "#10B981" : "#3B82F6"} secondaryColor="#64748B" />
        </div>

        {/* Breakdown Table */}
        <div style={innerCard}>
          <p style={cardHeading}>{activeTab === 'stepUp' ? 'Step-Up' : 'Normal'} SIP Breakdown</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#64748B', fontSize: '13px' }}>
                  <th style={thStyle}>Year</th>
                  <th style={thStyle}>Monthly SIP</th>
                  <th style={thStyle}>Cumulative Investment</th>
                  <th style={thStyle}>Maturity Value</th>
                </tr>
              </thead>
              <tbody style={{ color: '#1E293B', fontSize: '14px' }}>
                {results.breakdown.map((row) => {
                  const data = activeTab === 'stepUp' ? row.stepUp : row.normal;
                  return (
                    <tr key={row.year} style={{ borderTop: '1px solid #F1F5F9' }}>
                      <td style={tdStyle}>{row.year}</td>
                      <td style={tdStyle}>₹{Number(activeTab === 'stepUp' ? data.monthlyInstallment : inputs.amount).toLocaleString('en-IN')}</td>
                      <td style={tdStyle}>₹{Number(data.investedAmount).toLocaleString('en-IN')}</td>
                      <td style={{ ...tdStyle, fontWeight: '600', color: activeTab === 'stepUp' ? '#10B981' : '#3B82F6' }}>
                        ₹{Number(data.totalValue).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Sub-component for Slider + Manual Input
const DualInput = ({ label, symbol, value, min, max, step, onChange }) => (
  <div style={{ marginBottom: '25px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
      <label style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>{label}</label>
      <div style={inputContainer}>
        <input 
          type="number" 
          value={value} 
          onChange={(e) => onChange(Number(e.target.value))}
          style={numberInputStyle}
        />
        <span style={symbolStyle}>{symbol}</span>
      </div>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={step}
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))} 
      style={sliderStyle} 
    />
  </div>
);

// Styles
const containerStyle = { maxWidth: '1200px', margin: '0 auto', backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)' };
const controlGrid = { display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: '25px', marginBottom: '30px' };
const innerCard = { padding: '24px', borderRadius: '16px', border: '1px solid #F1F5F9', backgroundColor: '#FFFFFF' };
const cardHeading = { fontSize: '14px', fontWeight: '600', color: '#64748B', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputContainer = { position: 'relative', display: 'flex', alignItems: 'center' };
const numberInputStyle = { padding: '6px 30px 6px 10px', width: '80px', borderRadius: '8px', color: '#64748B', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontWeight: '600', fontSize: '14px', textAlign: 'right', outline: 'none' };
const symbolStyle = { position: 'absolute', right: '10px', fontSize: '12px', color: '#94A3B8', fontWeight: '600' };
const sliderStyle = { width: '100%', accentColor: '#3B82F6', cursor: 'pointer' };
const toggleWrapper = { display: 'inline-flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px', marginBottom: '20px' };
const toggleBtn = (active) => ({ padding: '6px 16px', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', backgroundColor: active ? '#3B82F6' : 'transparent', color: active ? 'white' : '#64748B', transition: '0.2s' });
const maturityCard = (active, color) => ({ padding: '24px', borderRadius: '16px', cursor: 'pointer', border: `2px solid ${active ? color : '#F1F5F9'}`, backgroundColor: active ? `${color}05` : 'white', transition: '0.3s', boxShadow: active ? `0 10px 15px -3px ${color}20` : 'none' });
const labelSmall = { fontSize: '11px', fontWeight: '700', color: '#94A3B8', marginBottom: '8px' };
const valueLarge = { fontSize: '24px', fontWeight: '700', color: '#1E293B', margin: 0 };
const activeBadge = { fontSize: '10px', color: '#10B981', fontWeight: '700', marginTop: '8px', display: 'block' };
const activeBadgeBlue = { ...activeBadge, color: '#3B82F6' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thStyle = { padding: '12px 8px' };
const tdStyle = { padding: '12px 8px' };

export default SipCalculator;