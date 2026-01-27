import React, { useState, useMemo } from 'react';
import { useFinance } from '../hooks/useFinance';

const SipCalculator = () => {
  const colors = {
    pageBg: '#1E293B',    // Dark background for the whole page
    cardBg: '#FFFFFF',    // White background for the calculator card
    textMain: '#1E293B',  // Slate for text
    primary: '#059669',   // Emerald
    inputBg: '#475569',   // Darker inputs as per image
    border: '#E2E8F0',
    accent: '#F8FAFC'
  };

  const [inputs, setInputs] = useState({
    amount: 5000,
    rate: 12,
    years: 10,
    stepUpPercent: 10,
    stepUpValue: 0
  });

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
  console.log(results);

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
      {/* The White Card Container */}
      <div style={{
        margin: '0 auto', 
        backgroundColor: colors.cardBg, 
        borderRadius: '16px', 
        padding: '40px',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)',
        fontFamily: 'sans-serif'
      }}>
        
        <h1 style={{ textAlign: 'center', color: colors.textMain, fontSize: '32px', marginBottom: '40px' }}>
          Investment Planner
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
          {/* Left Side: SIP Details */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748B', marginBottom: '20px' }}>sip details</p>
            
            <div style={inputContainer}>
              <label style={labelStyle}>Monthly Investment (₹)</label>
              <input style={darkInput} type="number" value={inputs.amount} onChange={(e) => handleInputChange('amount', e.target.value)} />
            </div>

            <div style={inputContainer}>
              <label style={labelStyle}>Expected Return Rate (%)</label>
              <input style={darkInput} type="number" value={inputs.rate} onChange={(e) => handleInputChange('rate', e.target.value)} />
            </div>

            <div style={inputContainer}>
              <label style={labelStyle}>Investment Tenure (Years)</label>
              <input style={darkInput} type="number" value={inputs.years} onChange={(e) => handleInputChange('years', e.target.value)} />
            </div>
          </div>

          {/* Right Side: Step-Up Box */}
          <div style={{ backgroundColor: colors.accent, padding: '30px', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Step-Up Strategy</p>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '15px' }}>Yearly Increase (%)</p>
            <input style={darkInput} type="number" value={inputs.stepUpPercent} onChange={(e) => handleInputChange('stepUpPercent', e.target.value)} />
            
            <p style={{ margin: '15px 0', fontSize: '10px', color: '#94A3B8' }}>OR</p>
            
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '15px' }}>Fixed Annual Increase (₹)</p>
            <input style={darkInput} type="number" value={inputs.stepUpValue} onChange={(e) => handleInputChange('stepUpValue', e.target.value)} />
          </div>
        </div>

        {/* Maturity Result Boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
          <div style={resultBox(colors.primary, true)}>
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: colors.primary }}>STEP-UP MATURITY</span>
            <h2 style={{ margin: '10px 0', fontSize: '24px', color: colors.textMain }}>₹{Number(results.summary.stepUpSip.totalValue).toLocaleString('en-IN')}</h2>
          </div>
          <div style={resultBox('#CBD5E1', false)}>
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748B' }}>NORMAL MATURITY</span>
            <h2 style={{ margin: '10px 0', fontSize: '24px', color: colors.textMain }}>₹{Number(results.summary.normalSip.totalValue).toLocaleString('en-IN')}</h2>
          </div>
        </div>

        {/* Breakdown Table */}
        <h2 style={{ textAlign: 'center', color: colors.textMain, fontSize: '26px', marginBottom: '40px' }}>
          Step up sip breakdown
        </h2>
        <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
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
              {results.breakdown.map((row, i) => (
                <tr key={row.year} style={{ borderBottom: '1px solid #a6bcd3' }}>
                  <td style={{...tdStyle, color: colors.textMain}}>{row.year}</td>
                  <td style={{...tdStyle, color: colors.textMain}}>₹{Number(row.stepUp.monthlyInstallment).toLocaleString('en-IN')}</td>
                  <td style={{...tdStyle, color: colors.textMain}}>₹{Number(row.stepUp.investedAmount).toLocaleString('en-IN')}</td>
                  <td style={{ ...tdStyle, color: colors.primary, fontWeight: 'bold' }}>
                    ₹{Number(row.stepUp.totalValue).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Breakdown Table */}
        <h2 style={{ textAlign: 'center', color: colors.textMain, fontSize: '26px', marginBottom: '40px' }}>
          Normal sip breakdown
        </h2>
        <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
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
              {results.breakdown.map((row, i) => (
                <tr key={row.year} style={{ borderBottom: '1px solid #a6bcd3' }}>
                  <td style={{...tdStyle, color: colors.textMain}}>{row.year}</td>
                  <td style={{...tdStyle, color: colors.textMain}}>₹{Number(inputs.amount).toLocaleString('en-IN')}</td>
                  <td style={{...tdStyle, color: colors.textMain}}>₹{Number(row.normal.investedAmount).toLocaleString('en-IN')}</td>
                  <td style={{ ...tdStyle, color: colors.primary, fontWeight: 'bold' }}>
                    ₹{Number(row.normal.totalValue).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Internal Styles
const inputContainer = { marginBottom: '20px' };
const labelStyle = { display: 'block', fontSize: '11px', color: '#64748B', marginBottom: '8px' };
const darkInput = { 
  width: '100%', 
  padding: '12px', 
  borderRadius: '6px', 
  border: 'none', 
  backgroundColor: '#334155', 
  color: 'white', 
  textAlign: 'center',
  boxSizing: 'border-box'
};
const resultBox = (color, isGreen) => ({
  textAlign: 'center',
  padding: '20px',
  borderRadius: '12px',
  border: `1px solid ${color}`,
  backgroundColor: isGreen ? '#F0FDF4' : 'white'
});
const thStyle = { padding: '12px', fontSize: '12px', textAlign: 'center' };
const tdStyle = { padding: '12px', fontSize: '13px' };

export default SipCalculator;