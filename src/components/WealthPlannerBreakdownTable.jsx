import React from 'react';
import styles from './WealthPlanner.module.css';

const formatCurrency = (value) =>
  `${String.fromCharCode(8377)}${Number(value).toLocaleString('en-IN')}`;

const WealthPlannerBreakdownTable = ({
  activeTab,
  chartData,
  currentMenu,
  inputs,
  portfolio,
  results,
  tableTitle,
  viewingId,
}) => {
  const renderTable = () => {
    if (currentMenu === 'SWP') {
      return (
        <>
          <thead>
            <tr>
              <th className={styles.th}>Year</th>
              {inputs.swp.stepUpPercent > 0 && (
                <th className={styles.th}>Corpus (Fixed)</th>
              )}
              <th className={styles.th}>
                Corpus ({inputs.swp.stepUpPercent > 0 ? 'Stepped-Up' : 'Fixed'})
              </th>
            </tr>
          </thead>
          <tbody>
            {chartData
              .filter((row) => row.name !== 'Start')
              .map((row, index) => (
                <tr key={index}>
                  <td className={styles.td}>{row.name.replace(/Year |Yr /g, '')}</td>
                  {inputs.swp.stepUpPercent > 0 && (
                    <td className={styles.td}>{formatCurrency(row['Fixed Withdrawal'])}</td>
                  )}
                  <td className={`${styles.td} ${styles.tdMaturity} ${styles.textRed}`}>
                    {formatCurrency(row['Stepped-Up Withdrawal'] ?? row['Fixed Withdrawal'])}
                  </td>
                </tr>
              ))}
          </tbody>
        </>
      );
    }

    if (currentMenu === 'Loan') {
      return (
        <>
          <thead>
            <tr>
              <th className={styles.th}>Year</th>
              <th className={styles.th}>Balance (w/o Prepayment)</th>
              <th className={styles.th}>Balance (w/ Prepayment)</th>
            </tr>
          </thead>
          <tbody>
            {chartData
              .filter((row) => row.name !== 'Start')
              .map((row, index) => (
                <tr key={index}>
                  <td className={styles.td}>{row.name.replace('Yr ', '')}</td>
                  <td className={styles.td}>{formatCurrency(row['Without Prepayment'])}</td>
                  <td className={`${styles.td} ${styles.tdMaturity} ${styles.textGreen}`}>
                    {formatCurrency(row['With Prepayment'])}
                  </td>
                </tr>
              ))}
          </tbody>
        </>
      );
    }

    if (currentMenu === 'Goal') {
      return (
        <>
          <thead>
            <tr>
              <th className={styles.th}>Year</th>
              <th className={styles.th}>Invested</th>
              <th className={styles.th}>Value</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, index) => (
              <tr key={index}>
                <td className={styles.td}>{row.name.replace('Year ', '')}</td>
                <td className={styles.td}>{formatCurrency(row.Invested)}</td>
                <td className={`${styles.td} ${styles.tdMaturity} ${styles.textGreen}`}>
                  {formatCurrency(row.TotalValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </>
      );
    }

    if (currentMenu === 'Tracker' && portfolio.length > 0) {
      if (viewingId) {
        return (
          <>
            <thead>
              <tr>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>NAV</th>
                <th className={styles.th}>Amount</th>
                <th className={styles.th}>Units</th>
              </tr>
            </thead>
            <tbody>
              {[...(results.purchaseHistory || [])].reverse().map((row, index) => (
                <tr key={index}>
                  <td className={styles.td}>{row.dateStr}</td>
                  <td className={styles.td}>{row.nav.toFixed(2)}</td>
                  <td className={styles.td}>{formatCurrency(row.amount)}</td>
                  <td className={`${styles.td} ${styles.tdMaturity} ${styles.textGreen}`}>
                    {row.units.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </>
        );
      }

      return (
        <>
          <thead>
            <tr>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Total Invested</th>
              <th className={styles.th}>Total Value</th>
            </tr>
          </thead>
          <tbody>
            {[...(results.breakdown || [])].reverse().map((row, index) => (
              <tr key={index}>
                <td className={styles.td}>{row.name}</td>
                <td className={styles.td}>{formatCurrency(row.Invested)}</td>
                <td className={`${styles.td} ${styles.tdMaturity} ${styles.textGreen}`}>
                  {formatCurrency(row.TotalValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </>
      );
    }

    return (
      <>
        <thead>
          <tr>
            <th className={styles.th}>{currentMenu === 'SIP' ? 'Year' : 'Quarter'}</th>
            <th className={styles.th}>
              {currentMenu === 'SIP' ? 'Monthly SIP' : 'Monthly Deposit'}
            </th>
            <th className={styles.th}>Cumulative Investment</th>
            <th className={styles.th}>Maturity Value</th>
          </tr>
        </thead>
        <tbody>
          {currentMenu === 'SIP'
            ? results.breakdown.map((row) => {
                const data = activeTab === 'primary' ? row.stepUp : row.normal;
                return (
                  <tr key={row.year}>
                    <td className={styles.td}>{row.year}</td>
                    <td className={styles.td}>
                      {formatCurrency(
                        activeTab === 'primary' ? data.monthlyInstallment : inputs.sip.amount,
                      )}
                    </td>
                    <td className={styles.td}>{formatCurrency(data.investedAmount)}</td>
                    <td
                      className={`${styles.td} ${styles.tdMaturity} ${
                        activeTab === 'primary' ? styles.textGreen : styles.textBlue
                      }`}
                    >
                      {formatCurrency(data.totalValue)}
                    </td>
                  </tr>
                );
              })
            : results.breakdown.map((row, index) => (
                <tr key={index}>
                  <td className={styles.td}>{row.name}</td>
                  <td className={styles.td}>{formatCurrency(inputs.rd.monthlyDeposit)}</td>
                  <td className={styles.td}>{formatCurrency(row.Invested)}</td>
                  <td className={`${styles.td} ${styles.tdMaturity} ${styles.textGreen}`}>
                    {formatCurrency(row.TotalValue)}
                  </td>
                </tr>
              ))}
        </tbody>
      </>
    );
  };

  return (
    <div className={styles.innerCard}>
      <p className={styles.cardHeading}>{tableTitle}</p>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>{renderTable()}</table>
      </div>
    </div>
  );
};

export default WealthPlannerBreakdownTable;
