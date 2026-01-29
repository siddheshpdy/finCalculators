import React, { useState, useMemo } from 'react';
import { useFinance } from '../hooks/useFinance';
import WealthChart from './WealthChart';

const SipCalculator = () => {
  const colors = {
    pageBg: '#1E293B',
    cardBg: '#FFFFFF',
    textMain: '#1E293B', // Deep Slate / Black for text
    textMuted: '#64748B',
    primary: '#059669',
    secondary: '#334155',
    inputBg: '#334155',   // Dark inputs from screenshot
    accent: '#F8FAFC'
  };

  const [inputs, setInputs] = useState({
    amount: 5000,
    rate: 12,
    years: 10,
    stepUpPercent: 10,
    stepUpValue: 0
  });

  const [activeTab, setActiveTab] = useState('stepUp');

  const { calculateSIP } = useFinance();

  const results = useMemo(() =>
    calculateSIP(
      Number(inputs.amount),
      Number(inputs.rate),
      Number(inputs.years),
      Number(inputs.stepUpPercent),
      Number(inputs.stepUpValue)
    ),
    [inputs, calculateSIP]
  );

  const chartData = useMemo(() => {
    return results.breakdown.map(yearData => ({
      name: `Year ${yearData.year}`,
      Invested: activeTab === 'stepUp' ? Number(yearData.stepUp.investedAmount) : Number(yearData.normal.investedAmount),
      TotalValue: activeTab === 'stepUp' ? Number(yearData.stepUp.totalValue) : Number(yearData.normal.totalValue)
    }));
  }, [results, activeTab]);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'stepUpPercent' && value > 0 ? { stepUpValue: 0 } : {}),
      ...(field === 'stepUpValue' && value > 0 ? { stepUpPercent: 0 } : {})
    }));
  };

  return (
    <div style={{ backgroundColor: colors.pageBg, minHeight: '100vh', padding: '40px 20px' }}>
      <div style={cardContainer}>
        <h1 style={{ textAlign: 'center', color: colors.textMain, fontSize: '32px', marginBottom: '40px' }}>
          Investment Planner
        </h1>

        {/* INPUT FIELDS SECTION */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
          
          {/* Left Side: SIP Details */}
          <div style={{ textAlign: 'center' }}>
            <p style={subHeaderStyle}>sip details</p>
            
            <div style={inputGroup}>
              <label style={labelStyle}>Monthly Investment (₹)</label>
              <input style={darkInput} type="number" value={inputs.amount} onChange={(e) => handleInputChange('amount', e.target.value)} />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Expected Return Rate (%)</label>
              <input style={darkInput} type="number" value={inputs.rate} onChange={(e) => handleInputChange('rate', e.target.value)} />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Investment Tenure (Years)</label>
              <input style={darkInput} type="number" value={inputs.years} onChange={(e) => handleInputChange('years', e.target.value)} />
            </div>
          </div>

          {/* Right Side: Step-Up Box */}
          <div style={{ backgroundColor: colors.accent, padding: '30px', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold', color: colors.textMain, marginBottom: '5px' }}>Step-Up Strategy</p>
            
            <p style={labelStyle}>Yearly Increase (%)</p>
            <input style={darkInput} type="number" value={inputs.stepUpPercent} onChange={(e) => handleInputChange('stepUpPercent', e.target.value)} />

            <p style={{ margin: '15px 0', fontSize: '10px', color: colors.textMuted }}>OR</p>

            <p style={labelStyle}>Fixed Annual Increase (₹)</p>
            <input style={darkInput} type="number" value={inputs.stepUpValue} onChange={(e) => handleInputChange('stepUpValue', e.target.value)} />
          </div>
        </div>

        {/* MATURITY BOXES */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
          <div 
            onClick={() => setActiveTab('stepUp')}
            style={resultBox(colors.primary, activeTab === 'stepUp')}
          >
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: colors.primary }}>STEP-UP MATURITY</span>
            <h2 style={{ margin: '10px 0', fontSize: '24px', color: colors.textMain }}>
              ₹{Number(results.summary.stepUpSip.totalValue).toLocaleString('en-IN')}
            </h2>
            {activeTab === 'stepUp' && <div style={activeIndicator}>Active View</div>}
          </div>

          <div 
            onClick={() => setActiveTab('normal')}
            style={resultBox('#CBD5E1', activeTab === 'normal')}
          >
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: colors.textMuted }}>NORMAL MATURITY</span>
            <h2 style={{ margin: '10px 0', fontSize: '24px', color: colors.textMain }}>
              ₹{Number(results.summary.normalSip.totalValue).toLocaleString('en-IN')}
            </h2>
            {activeTab === 'normal' && <div style={activeIndicator}>Active View</div>}
          </div>
        </div>

        {/* CHART SECTION */}
        <div style={{ marginBottom: '60px' }}>
          <h3 style={{ fontSize: '18px', color: colors.textMain, textAlign: 'center', marginBottom: '20px' }}>
            {activeTab === 'stepUp' ? 'Step-Up' : 'Normal'} Wealth Projection
          </h3>
          <WealthChart data={chartData} primaryColor={colors.primary} secondaryColor={colors.secondary} />
        </div>

        {/* TABLE SECTION (Fixed Text Color to Black/Slate) */}
        <h2 style={{ textAlign: 'center', color: colors.textMain, fontSize: '22px', marginBottom: '20px', textTransform: 'capitalize' }}>
          {activeTab === 'stepUp' ? 'Step up' : 'Normal'} sip breakdown
        </h2>
        <div style={tableWrapper}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#1E293B', color: 'white' }}>
              <tr>
                <th style={thStyle}>Year</th>
                <th style={thStyle}>Monthly SIP</th>
                <th style={thStyle}>Invested (Cumulative)</th>
                <th style={thStyle}>Maturity Value</th>
              </tr>
            </thead>
            <tbody>
              {results.breakdown.map((row) => {
                const data = activeTab === 'stepUp' ? row.stepUp : row.normal;
                return (
                  <tr key={row.year} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={tdStyle}>{row.year}</td>
                    <td style={tdStyle}>₹{Number(activeTab === 'stepUp' ? data.monthlyInstallment : inputs.amount).toLocaleString('en-IN')}</td>
                    <td style={tdStyle}>₹{Number(data.investedAmount).toLocaleString('en-IN')}</td>
                    <td style={{ ...tdStyle, color: colors.primary, fontWeight: 'bold' }}>
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
  );
};

// CSS-in-JS Styles
const cardContainer = { margin: '0 auto', backgroundColor: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)', fontFamily: 'sans-serif', maxWidth: '900px' };
const subHeaderStyle = { fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748B', marginBottom: '20px' };
const inputGroup = { marginBottom: '20px' };
const labelStyle = { display: 'block', fontSize: '11px', color: '#64748B', marginBottom: '8px' };
const darkInput = { width: '100%', padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#334155', color: 'white', textAlign: 'center', boxSizing: 'border-box', outline: 'none' };
const resultBox = (borderColor, isActive) => ({ textAlign: 'center', padding: '20px', borderRadius: '12px', border: `2px solid ${isActive ? borderColor : '#E2E8F0'}`, backgroundColor: isActive ? '#F0FDF4' : 'white', cursor: 'pointer', position: 'relative' });
const activeIndicator = { fontSize: '9px', backgroundColor: '#1E293B', color: 'white', padding: '2px 8px', borderRadius: '10px', position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)' };
const tableWrapper = { borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' };
const thStyle = { padding: '12px', fontSize: '12px', textAlign: 'center' };
// Fixed tdStyle to use colors.textMain (Deep Slate) instead of inheriting white
const tdStyle = { padding: '12px', fontSize: '13px', textAlign: 'center', color: '#1E293B' };

export default SipCalculator;