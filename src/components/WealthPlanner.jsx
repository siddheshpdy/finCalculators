import React, { useState, useMemo } from 'react';
import { useFinance } from '../hooks/useFinance';
import WealthChart from './WealthChart';

const WealthPlanner = () => {
  const { calculateSIP, calculateRD, calculateLoan } = useFinance();
  const [currentMenu, setCurrentMenu] = useState('SIP'); // 'SIP', 'RD', 'Loan'
  const [activeTab, setActiveTab] = useState('primary'); // For comparison views
  const [activeStrategy, setActiveStrategy] = useState('percent'); // For SIP Step-up

  const [inputs, setInputs] = useState({
    sip: { amount: 5000, rate: 12, years: 10, stepUpPercent: 10, stepUpValue: 0 },
    rd: { monthlyDeposit: 5000, rate: 7, quarters: 20 },
    loan: { principal: 1000000, rate: 8.5, months: 120, yearlyExtra: 0 } // Add yearlyExtra
  });

  // 1. Unified Calculation Engine
  // Inside WealthPlanner.jsx
const results = useMemo(() => {
  if (currentMenu === 'SIP') {
    return calculateSIP(
      inputs.sip.amount, inputs.sip.rate, inputs.sip.years,
      activeStrategy === 'percent' ? inputs.sip.stepUpPercent : 0,
      activeStrategy === 'fixed' ? inputs.sip.stepUpValue : 0
    );
  } else if (currentMenu === 'RD') {
    return calculateRD(inputs.rd.monthlyDeposit, inputs.rd.rate, inputs.rd.quarters);
  } else {
    // FIX: Pass the 4th argument (yearlyExtra) here
    return calculateLoan(
      inputs.loan.principal, 
      inputs.loan.rate, 
      inputs.loan.months, 
      inputs.loan.yearlyExtra // This was likely missing
    );
  }
}, [currentMenu, inputs, activeStrategy, calculateSIP, calculateRD, calculateLoan]);
  // 2. Chart Data Mapper
  const chartData = useMemo(() => {
    if (currentMenu === 'SIP') {
      return results.breakdown.map(d => ({
        name: `Yr ${d.year}`,
        Invested: Number(activeTab === 'primary' ? d.stepUp.investedAmount : d.normal.investedAmount),
        TotalValue: Number(activeTab === 'primary' ? d.stepUp.totalValue : d.normal.totalValue)
      }));
    }
    if (currentMenu === 'RD') {
      // Return the breakdown generated in calculateRD
      return results.breakdown || [];
    }
    return [];
  }, [results, currentMenu, activeTab]);

  return (
    <div style={{ backgroundColor: '#F1F5F9', minHeight: '100vh', padding: '40px' }}>
      <div style={containerStyle}>

        {/* Navigation Menu */}
        <div style={menuBar}>
          {['SIP', 'RD', 'Loan'].map(m => (
            <button key={m} onClick={() => setCurrentMenu(m)} style={menuTab(currentMenu === m)}>{m} Planner</button>
          ))}
        </div>

        <div style={controlGrid}>
          {/* Left: Input Section */}
          <div style={innerCard}>
            <p style={cardHeading}>{currentMenu} Details</p>
            {currentMenu === 'SIP' && (
              <>
                <DualInput label="Monthly SIP" symbol="₹" value={inputs.sip.amount} min={500} max={100000} step={500}
                  onChange={(v) => setInputs({ ...inputs, sip: { ...inputs.sip, amount: v } })} />
                <DualInput label="Expected Return" symbol="%" value={inputs.sip.rate} min={1} max={30} step={0.5}
                  onChange={(v) => setInputs({ ...inputs, sip: { ...inputs.sip, rate: v } })} />
                <DualInput label="Tenure" symbol="Yrs" value={inputs.sip.years} min={1} max={40} step={1}
                  onChange={(v) => setInputs({ ...inputs, sip: { ...inputs.sip, years: v } })} />
              </>
            )}
            {currentMenu === 'RD' && (
              <>
                <DualInput label="Monthly Deposit" symbol="₹" value={inputs.rd.monthlyDeposit} min={500} max={100000} step={500}
                  onChange={(v) => setInputs({ ...inputs, rd: { ...inputs.rd, monthlyDeposit: v } })} />
                <DualInput label="Interest Rate" symbol="%" value={inputs.rd.rate} min={1} max={15} step={0.1}
                  onChange={(v) => setInputs({ ...inputs, rd: { ...inputs.rd, rate: v } })} />
                <DualInput label="Duration" symbol="Qtr" value={inputs.rd.quarters} min={1} max={80} step={1}
                  onChange={(v) => setInputs({ ...inputs, rd: { ...inputs.rd, quarters: v } })} />
              </>
            )}
            {currentMenu === 'Loan' && (
              <>
                <DualInput label="Principal" symbol="₹" value={inputs.loan.principal} min={100000} max={10000000} step={50000}
                  onChange={(v) => setInputs({ ...inputs, loan: { ...inputs.loan, principal: v } })} />
                <DualInput label="Interest Rate" symbol="%" value={inputs.loan.rate} min={5} max={20} step={0.1}
                  onChange={(v) => setInputs({ ...inputs, loan: { ...inputs.loan, rate: v } })} />
                <DualInput label="Tenure" symbol="Mo" value={inputs.loan.months} min={12} max={360} step={12}
                  onChange={(v) => setInputs({ ...inputs, loan: { ...inputs.loan, months: v } })} />
              </>
            )}
          </div>

          {/* Middle: Strategy/Extra Options */}
          <div style={innerCard}>
            {currentMenu === 'Loan' ? (
              <>
                <p style={cardHeading}>Prepayment Strategy</p>
                <DualInput
                  label="Fixed Extra Annual Pay"
                  symbol="₹"
                  value={inputs.loan.yearlyExtra}
                  min={0} max={100000} step={1000}
                  onChange={(v) => setInputs({ ...inputs, loan: { ...inputs.loan, yearlyExtra: v } })}
                />
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '10px' }}>
                  This amount is paid once every year towards the principal.
                </p>
              </>
            ) : currentMenu === 'SIP' ? (
              <>
                <p style={cardHeading}>Step-Up Strategy</p>
                <div style={toggleWrapper}>
                  <button onClick={() => setActiveStrategy('percent')} style={toggleBtn(activeStrategy === 'percent')}>%</button>
                  <button onClick={() => setActiveStrategy('fixed')} style={toggleBtn(activeStrategy === 'fixed')}>₹</button>
                </div>
                {activeStrategy === 'percent' ? (
                  <DualInput label="Yearly Step-up" symbol="%" value={inputs.sip.stepUpPercent} min={0} max={50} onChange={(v) => setInputs({ ...inputs, sip: { ...inputs.sip, stepUpPercent: v } })} />
                ) : (
                  <DualInput label="Fixed Increase" symbol="₹" value={inputs.sip.stepUpValue} min={0} max={50000} onChange={(v) => setInputs({ ...inputs, sip: { ...inputs.sip, stepUpValue: v } })} />
                )}
              </>
            ) : (
              <p style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', marginTop: '40%' }}>No additional strategy available for this mode.</p>
            )}
          </div>

          {/* Right: Maturity Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {currentMenu === 'SIP' && (
              <>
                <ResultCard active={activeTab === 'primary'} label="STEP-UP MATURITY" color="#10B981" value={results.summary.stepUpSip.totalValue} onClick={() => setActiveTab('primary')} />
                <ResultCard active={activeTab === 'secondary'} label="NORMAL MATURITY" color="#3B82F6" value={results.summary.normalSip.totalValue} onClick={() => setActiveTab('secondary')} />
              </>
            )}
            {currentMenu === 'RD' && (
              <>
                <ResultCard active label="MATURITY VALUE" color="#10B981" value={results.maturityValue} />
                <ResultCard active={false} label="INTEREST EARNED" color="#64748B" value={results.interestEarned} />
              </>
            )}
            {currentMenu === 'Loan' && (
              <>
                <ResultCard active label="MONTHLY EMI" color="#EF4444" value={results.monthlyPayment} />
                <ResultCard active={false} label="TOTAL INTEREST" color="#64748B" value={results.totalInterest} />
                {/* NEW: Total Amount Paid */}
                <div style={{ ...maturityCard(false, '#1E293B'), marginTop: '10px', backgroundColor: '#F8FAFC' }}>
                  <p style={labelSmall}>TOTAL AMOUNT PAID</p>
                  <h3 style={{ ...valueLarge, color: '#1E293B' }}>
                    ₹{Number(results.totalAmountPaid).toLocaleString('en-IN')}
                  </h3>
                  {results.monthsSaved > 0 && (
                    <span style={{ color: '#10B981', fontSize: '11px', fontWeight: 'bold' }}>
                      ✓ Saved {results.monthsSaved} months
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chart View */}
        {(currentMenu === 'SIP' || currentMenu === 'RD') && (
          <div style={{ ...innerCard, marginBottom: '30px' }}>
            <p style={cardHeading}>
              {currentMenu === 'SIP' ? (activeTab === 'primary' ? 'Step-Up' : 'Normal') : 'RD'} Wealth Projection
            </p>
            <WealthChart
              data={chartData}
              primaryColor={currentMenu === 'RD' ? "#10B981" : (activeTab === 'primary' ? "#10B981" : "#3B82F6")}
            />
          </div>
        )}

        {/* Dynamic Breakdown Table */}
        {(currentMenu === 'SIP' || currentMenu === 'RD') && (
          <div style={innerCard}>
            <p style={cardHeading}>
              {currentMenu} {currentMenu === 'SIP' && (activeTab === 'primary' ? 'Step-Up' : 'Normal')} Breakdown Schedule
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#64748B', fontSize: '13px' }}>
                    <th style={thStyle}>{currentMenu === 'SIP' ? 'Year' : 'Quarter'}</th>
                    <th style={thStyle}>{currentMenu === 'SIP' ? 'Monthly SIP' : 'Monthly Deposit'}</th>
                    <th style={thStyle}>Cumulative Investment</th>
                    <th style={thStyle}>Maturity Value</th>
                  </tr>
                </thead>
                <tbody style={{ color: '#1E293B', fontSize: '14px' }}>
                  {currentMenu === 'SIP' ? (
                    // SIP Table Rows
                    results.breakdown.map((row) => {
                      const data = activeTab === 'primary' ? row.stepUp : row.normal;
                      return (
                        <tr key={row.year} style={{ borderTop: '1px solid #F1F5F9' }}>
                          <td style={tdStyle}>{row.year}</td>
                          <td style={tdStyle}>₹{Number(activeTab === 'primary' ? data.monthlyInstallment : inputs.sip.amount).toLocaleString('en-IN')}</td>
                          <td style={tdStyle}>₹{Number(data.investedAmount).toLocaleString('en-IN')}</td>
                          <td style={{ ...tdStyle, fontWeight: '600', color: activeTab === 'primary' ? '#10B981' : '#3B82F6' }}>
                            ₹{Number(data.totalValue).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    // RD Table Rows
                    results.breakdown.map((row, index) => (
                      <tr key={index} style={{ borderTop: '1px solid #F1F5F9' }}>
                        <td style={tdStyle}>{row.name}</td>
                        <td style={tdStyle}>₹{Number(inputs.rd.monthlyDeposit).toLocaleString('en-IN')}</td>
                        <td style={tdStyle}>₹{Number(row.Invested).toLocaleString('en-IN')}</td>
                        <td style={{ ...tdStyle, fontWeight: '600', color: '#10B981' }}>
                          ₹{Number(row.TotalValue).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Helper Components ---
const DualInput = ({ label, symbol, value, min, max, step, onChange }) => (
  <div style={{ marginBottom: '25px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <label style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} style={numberInputStyle} />
        <span style={symbolStyle}>{symbol}</span>
      </div>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: '100%', accentColor: '#3B82F6' }} />
  </div>
);

const ResultCard = ({ active, label, color, value, onClick }) => (
  <div onClick={onClick} style={maturityCard(active, color)}>
    <p style={labelSmall}>{label}</p>
    <h3 style={valueLarge}>₹{Number(value).toLocaleString('en-IN')}</h3>
    {active && onClick && <span style={{ fontSize: '10px', color, fontWeight: '700', marginTop: '5px', display: 'block' }}>● Active View</span>}
  </div>
);

// --- Styles ---
const containerStyle = { maxWidth: '1200px', margin: '0 auto', backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)' };
const menuBar = { display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #F1F5F9', paddingBottom: '15px' };
const menuTab = (active) => ({ padding: '10px 20px', border: 'none', borderRadius: '12px', backgroundColor: active ? '#1E293B' : 'transparent', color: active ? 'white' : '#64748B', fontWeight: '600', cursor: 'pointer' });
const controlGrid = { display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: '25px', marginBottom: '30px' };
const innerCard = { padding: '24px', borderRadius: '16px', border: '1px solid #F1F5F9', backgroundColor: '#FFFFFF' };
const cardHeading = { fontSize: '13px', fontWeight: '700', color: '#64748B', marginBottom: '20px', textTransform: 'uppercase' };
const numberInputStyle = { padding: '6px 30px 6px 10px', width: '80px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontWeight: '600', textAlign: 'right', color: '#64748B' };
const symbolStyle = { position: 'absolute', right: '10px', top: '7px', fontSize: '12px', color: '#94A3B8' };
const maturityCard = (active, color) => ({ padding: '20px', borderRadius: '16px', cursor: 'pointer', border: `2px solid ${active ? color : '#F1F5F9'}`, backgroundColor: active ? `${color}05` : 'white' });
const labelSmall = { fontSize: '11px', fontWeight: '700', color: '#94A3B8', marginBottom: '5px' };
const valueLarge = { fontSize: '22px', fontWeight: '700', color: '#1E293B', margin: 0 };
const toggleWrapper = { display: 'inline-flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px', marginBottom: '20px' };
const toggleBtn = (active) => ({ padding: '6px 16px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', backgroundColor: active ? '#3B82F6' : 'transparent', color: active ? 'white' : '#64748B' });
const tableStyle = { width: '100%', borderCollapse: 'collapse' }; const thStyle = { padding: '12px 8px' };
const tdStyle = { padding: '12px 8px' };
export default WealthPlanner;