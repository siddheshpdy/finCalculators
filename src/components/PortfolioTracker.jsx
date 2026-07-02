import React, { useMemo, useState } from 'react';
import styles from './WealthPlanner.module.css';

const PortfolioTracker = ({
  portfolio,
  baseResults,
  onEdit,
  onRemove,
  onAddClick,
  onClear,
  onImport,
  viewingId,
  setViewingId,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterStatus, setFilterStatus] = useState('All');

  const sortedPortfolio = useMemo(() => {
    let sortableItems = [...portfolio];

    if (filterStatus === 'Active') {
      sortableItems = sortableItems.filter((item) => !item.inputs.endDate);
    } else if (filterStatus === 'Stopped') {
      sortableItems = sortableItems.filter((item) => item.inputs.endDate);
    }

    if (sortConfig.key !== null) {
      sortableItems.sort((first, second) => {
        const statsA = baseResults?.fundDetails?.find((fund) => fund.id === first.id);
        const statsB = baseResults?.fundDetails?.find((fund) => fund.id === second.id);

        let firstValue;
        let secondValue;

        if (sortConfig.key === 'fund') {
          firstValue = first.fund.schemeName.toLowerCase();
          secondValue = second.fund.schemeName.toLowerCase();
        } else if (sortConfig.key === 'invested') {
          firstValue = parseFloat(statsA?.totalInvested || 0);
          secondValue = parseFloat(statsB?.totalInvested || 0);
        } else if (sortConfig.key === 'value') {
          firstValue = parseFloat(statsA?.currentValue || 0);
          secondValue = parseFloat(statsB?.currentValue || 0);
        } else if (sortConfig.key === 'xirr') {
          firstValue = parseFloat(statsA?.xirr || 0);
          secondValue = parseFloat(statsB?.xirr || 0);
        }

        if (firstValue < secondValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (firstValue > secondValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableItems;
  }, [portfolio, sortConfig, baseResults, filterStatus]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const downloadCSV = () => {
    if (!portfolio || portfolio.length === 0) return;

    const headers = [
      'Scheme Code',
      'Fund Name',
      'Status',
      'Start Date',
      'End Date',
      'SIP Amount',
      'Lumpsum',
      'Total Invested',
      'Current Value',
      'Abs Return (%)',
      'XIRR (%)',
    ];

    const rows = portfolio.map((item) => {
      const stats = baseResults?.fundDetails?.find((fund) => fund.id === item.id);
      return [
        item.fund.schemeCode,
        `"${item.fund.schemeName.replace(/"/g, '""')}"`,
        item.inputs.endDate ? 'Stopped' : 'Active',
        item.inputs.startDate,
        item.inputs.endDate || '',
        item.inputs.amount,
        item.inputs.lumpsum,
        stats?.totalInvested || 0,
        stats?.currentValue || 0,
        stats?.absoluteReturn || 0,
        stats?.xirr || 0,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `portfolio_tracker_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <>
      {viewingId && (
        <button onClick={() => setViewingId(null)} className={styles.viewAllBtn}>
          Back to Full Portfolio
        </button>
      )}
      <div className={styles.filterContainer}>
        <span className={styles.filterLabel}>Filter:</span>
        <button
          onClick={() => setFilterStatus('All')}
          className={`${styles.filterBtn} ${filterStatus === 'All' ? styles.filterBtnActive : ''}`}
        >
          All
        </button>
        <button
          onClick={() => setFilterStatus('Active')}
          className={`${styles.filterBtn} ${
            filterStatus === 'Active' ? styles.filterBtnActive : ''
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilterStatus('Stopped')}
          className={`${styles.filterBtn} ${
            filterStatus === 'Stopped' ? styles.filterBtnActive : ''
          }`}
        >
          Stopped
        </button>
      </div>
      <div className={styles.trackerTableContainer}>
        <table className={styles.trackerTable}>
          <thead>
            <tr>
              <th onClick={() => requestSort('fund')} style={{ cursor: 'pointer' }}>
                Fund {sortConfig.key === 'fund' && (sortConfig.direction === 'asc' ? '\u25B2' : '\u25BC')}
              </th>
              <th onClick={() => requestSort('invested')} style={{ cursor: 'pointer' }}>
                Invested {sortConfig.key === 'invested' && (sortConfig.direction === 'asc' ? '\u25B2' : '\u25BC')}
              </th>
              <th onClick={() => requestSort('value')} style={{ cursor: 'pointer' }}>
                Value {sortConfig.key === 'value' && (sortConfig.direction === 'asc' ? '\u25B2' : '\u25BC')}
              </th>
              <th onClick={() => requestSort('xirr')} style={{ cursor: 'pointer' }}>
                XIRR {sortConfig.key === 'xirr' && (sortConfig.direction === 'asc' ? '\u25B2' : '\u25BC')}
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedPortfolio.map((item) => {
              const stats = baseResults?.fundDetails?.find((fund) => fund.id === item.id);
              return (
                <tr
                  key={item.id}
                  className={`${styles.trackerRow} ${
                    viewingId === item.id ? styles.trackerRowSelected : ''
                  }`}
                  onClick={() => setViewingId(viewingId === item.id ? null : item.id)}
                >
                  <td>
                    <span className={styles.fundName} title={item.fund.schemeName}>
                      {item.fund.schemeName}
                    </span>
                    <span className={styles.fundMeta}>
                      {item.inputs.endDate && (
                        <span className={styles.stoppedIndicator} title="SIP Stopped">
                          {'\u25CF'}{' '}
                        </span>
                      )}
                      {item.inputs.amount > 0 &&
                        `SIP: \u20B9${Number(item.inputs.amount).toLocaleString('en-IN')} | `}
                      {item.inputs.lumpsum > 0 &&
                        `Lumpsum: \u20B9${Number(item.inputs.lumpsum).toLocaleString('en-IN')} | `}
                      Start: {item.inputs.startDate}
                      {item.inputs.endDate && ` | End: ${item.inputs.endDate}`}
                    </span>
                  </td>
                  <td data-label="Invested" style={{ color: '#64748B' }}>
                    {'\u20B9'}
                    {Number(stats?.totalInvested || 0).toLocaleString('en-IN')}
                  </td>
                  <td data-label="Value">
                    <div style={{ fontWeight: 'bold' }}>
                      {'\u20B9'}
                      {Number(stats?.currentValue || 0).toLocaleString('en-IN')}
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: (stats?.absoluteReturn || 0) >= 0 ? '#10B981' : '#EF4444',
                      }}
                    >
                      {stats?.absoluteReturn}%
                    </div>
                  </td>
                  <td
                    data-label="XIRR"
                    style={{
                      fontWeight: '600',
                      color: (stats?.xirr || 0) >= 0 ? '#10B981' : '#EF4444',
                    }}
                  >
                    {stats?.xirr}%
                  </td>
                  <td onClick={(event) => event.stopPropagation()}>
                    <button
                      onClick={() => onEdit(item)}
                      className={styles.iconBtn}
                      title="Edit"
                      aria-label="Edit fund"
                    >
                      {'\u270E'}
                    </button>
                    <button
                      onClick={() => onRemove(item.id)}
                      className={styles.iconBtn}
                      style={{ color: '#EF4444' }}
                      title="Remove"
                      aria-label="Remove fund"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className={styles.trackerFooter}>
              <td>Total</td>
              <td data-label="Total Invested">
                {'\u20B9'}
                {Number(baseResults?.totalInvested || 0).toLocaleString('en-IN')}
              </td>
              <td data-label="Total Value">
                <div>
                  {'\u20B9'}
                  {Number(baseResults?.currentValue || 0).toLocaleString('en-IN')}
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: (baseResults?.absoluteReturn || 0) >= 0 ? '#10B981' : '#EF4444',
                  }}
                >
                  {baseResults?.absoluteReturn}%
                </div>
              </td>
              <td
                data-label="Total XIRR"
                style={{ color: (baseResults?.xirr || 0) >= 0 ? '#10B981' : '#EF4444' }}
              >
                {baseResults?.xirr}%
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className={styles.trackerActionRow}>
        <button onClick={onAddClick} className={styles.addFundBtn}>
          + Add Fund
        </button>
        <button onClick={downloadCSV} className={styles.exportBtn}>
          Export CSV
        </button>
        <button onClick={onImport} className={styles.importBtn}>
          Import CSV
        </button>
        <button onClick={onClear} className={styles.clearBtn}>
          Clear Portfolio
        </button>
      </div>
    </>
  );
};

export default PortfolioTracker;
