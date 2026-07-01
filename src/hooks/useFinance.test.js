import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFinance } from './useFinance';

describe('useFinance Hook', () => {
  const { result } = renderHook(() => useFinance());
  const { 
    calculateSIP, 
    calculateLumpsum, 
    calculateRD, 
    calculateLoan, 
    calculateSWP, 
    calculateGoalSIP,
    calculateRealSIP,
    calculatePortfolio
  } = result.current;

  it('calculateSIP: computes correct maturity value', () => {
    // 5000/mo, 12% pa, 1 yr
    const data = calculateSIP(5000, 12, 1);
    // Expected: ~64047
    expect(data.summary.normalSip.totalValue).toBe('64046.64');
  });

  it('calculateSIP: handles step-up correctly (percent)', () => {
    // 5000/mo, 12% pa, 2 yrs, 10% step-up
    const data = calculateSIP(5000, 12, 2, 10);
    // Year 1: 5000/mo -> 64046.64
    // Year 2: 5500/mo -> 70451.30 (approx) + 64046.64 * 1.12 (growth of prev yr)
    // Total should be higher than normal SIP
    expect(Number(data.summary.stepUpSip.totalValue)).toBeGreaterThan(Number(data.summary.normalSip.totalValue));
  });

  it('calculateSIP: handles step-up correctly (value)', () => {
    // 5000 start, 500 increase
    const data = calculateSIP(5000, 12, 2, 0, 500);
    // Year 2 monthly should be 5500
    const year2 = data.breakdown.find(d => d.year === 2);
    expect(year2.stepUp.monthlyInstallment).toBe('5500.00');
  });

  it('calculateLumpsum: computes compound interest', () => {
    // 100k, 10%, 1 yr -> 110k
    const data = calculateLumpsum(100000, 10, 1);
    expect(data.maturityValue).toBe('110000.00');
  });

  it('calculateRD: computes recurring deposit value', () => {
    // 5000/mo, 8%, 4 quarters (1 yr)
    const data = calculateRD(5000, 8, 4);
    expect(data.totalDeposit).toBe('60000.00');
    // Interest should be positive
    expect(Number(data.interestEarned)).toBeGreaterThan(0);
  });

  it('calculateLoan: computes EMI and total payment', () => {
    // 1L, 12%, 1 yr (12 months)
    const data = calculateLoan(100000, 12, 12);
    // EMI ~ 8885
    expect(data.monthlyPayment).toBe('8884.88');
    expect(Number(data.totalAmountPaid)).toBeGreaterThan(100000);
  });

  it('calculateLoan: handles prepayment', () => {
    // 10L, 8.5%, 10yr
    const base = calculateLoan(1000000, 8.5, 120);
    // With extra payment
    const prepaid = calculateLoan(1000000, 8.5, 120, 10000, 0); // 10k extra yearly
    
    expect(Number(prepaid.totalInterest)).toBeLessThan(Number(base.totalInterest));
    expect(prepaid.monthsSaved).toBeGreaterThan(0);
  });

  it('calculateSWP: computes withdrawals', () => {
    // 10L corpus, 10k withdrawal, 10% return
    const data = calculateSWP(1000000, 10000, 10);
    expect(Number(data.totalWithdrawn)).toBeGreaterThan(0);
    // Corpus should decrease or sustain depending on rate
  });

  it('calculateSWP: handles zero/negative inputs', () => {
    const data = calculateSWP(0, 5000, 10);
    expect(data.monthsLasted).toBe(0);
  });

  it('calculateSWP: handles step-up withdrawal', () => {
    const data = calculateSWP(1000000, 10000, 10, 10);
    const fixed = calculateSWP(1000000, 10000, 10, 0);
    // With a step-up, the corpus depletes faster, so it lasts for fewer months.
    expect(data.monthsLasted).toBeLessThan(fixed.monthsLasted);
  });

  it('calculateGoalSIP: computes required monthly investment', () => {
    // Target 1.2L in 1 yr at 0% return -> 10k/month
    const zeroRate = calculateGoalSIP(120000, 0, 1);
    expect(zeroRate.requiredSIP).toBe('10000.00');

    // Target 64046.64 in 1 yr at 12% -> ~5000/month
    const withRate = calculateGoalSIP(64046.64, 12, 1);
    expect(Math.round(Number(withRate.requiredSIP))).toBe(5000);
  });

  it('calculateRealSIP: computes returns with lumpsum', () => {
    const navData = [
        { date: '01-01-2020', nav: '10' },
        { date: '01-02-2020', nav: '11' },
    ];
    const inputs = {
        startDate: '2020-01-01',
        amount: 0,
        lumpsum: 1000,
        stepUpPercent: 0,
        stepUpValue: 0
    };
    const res = calculateRealSIP(navData, inputs);
    expect(res.totalInvested).toBe('1000.00');
    // 1000 / 10 = 100 units. Value at 11 = 1100.
    expect(res.currentValue).toBe('1100.00');
  });

  it('calculateRealSIP: computes returns with SIP', () => {
    const navData = [
        { date: '01-01-2020', nav: '10' },
        { date: '01-02-2020', nav: '11' },
        { date: '01-03-2020', nav: '12' },
    ];
    const inputs = {
        startDate: '2020-01-01',
        amount: 1000,
        lumpsum: 0,
        stepUpPercent: 0,
        stepUpValue: 0
    };
    const res = calculateRealSIP(navData, inputs);
    // 1st: 1000/10 = 100 units.
    // 2nd: 1000/11 = 90.9091 units.
    // Total units: 190.9091.
    // 3rd: 1000/12 = 83.3333 units
    // Total units: 274.2424
    // Value at 12: 3290.91
    expect(res.totalInvested).toBe('3000.00');
    expect(Number(res.currentValue)).toBeCloseTo(3290.91, 1);
  });

  it('calculatePortfolio: aggregates results', () => {
    const navData = [
        { date: '01-01-2020', nav: '10' },
        { date: '01-02-2020', nav: '11' },
    ];
    const portfolio = [
        {
            id: 1,
            fund: { schemeName: 'F1' },
            inputs: { startDate: '2020-01-01', amount: 1000, lumpsum: 0 },
            navData
        },
        {
            id: 2,
            fund: { schemeName: 'F2' },
            inputs: { startDate: '2020-01-01', amount: 0, lumpsum: 1000 },
            navData
        }
    ];
    const res = calculatePortfolio(portfolio);
    // F1: 2000 invested (SIP on 1st and 2nd month)
    // F2: 1000 invested.
    // Total: 3000.
    expect(res.totalInvested).toBe('3000.00');
  });

  describe('API calls', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('getFundList: success', async () => {
        const mock = [{ schemeCode: '1', schemeName: 'A' }];
        global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mock });
        const { result } = renderHook(() => useFinance());
        const data = await result.current.getFundList(true);
        expect(data).toEqual(mock);
    });

    it('getFundList: failure', async () => {
        global.fetch.mockResolvedValueOnce({ ok: false });
        const { result } = renderHook(() => useFinance());
        const data = await result.current.getFundList(true);
        expect(data).toEqual([]);
    });

    it('getFundNAV: success', async () => {
        const mock = { data: [] };
        global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mock });
        const { result } = renderHook(() => useFinance());
        const data = await result.current.getFundNAV('1');
        expect(data).toEqual([]);
    });
  });
});
