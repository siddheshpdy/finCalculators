import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCalculatorState } from './useCalculatorState';

describe('useCalculatorState', () => {
  it('returns the default calculator state', () => {
    const { result } = renderHook(() => useCalculatorState());

    expect(result.current.currentMenu).toBe('SIP');
    expect(result.current.activeTab).toBe('primary');
    expect(result.current.activeStrategy).toBe('percent');
    expect(result.current.loanPrepaymentStrategy).toBe('yearly');
    expect(result.current.isMobileMenuOpen).toBe(false);
    expect(result.current.inputs.sip.amount).toBe(5000);
    expect(result.current.inputs.goal.targetAmount).toBe(10000000);
  });

  it('updates each slice through the exposed setters', () => {
    const { result } = renderHook(() => useCalculatorState());

    act(() => {
      result.current.setCurrentMenu('Goal');
      result.current.setActiveTab('secondary');
      result.current.setActiveStrategy('fixed');
      result.current.setLoanPrepaymentStrategy('monthly');
      result.current.setIsMobileMenuOpen(true);
      result.current.setInputs((current) => ({
        ...current,
        goal: {
          ...current.goal,
          targetAmount: 5000000,
        },
      }));
    });

    expect(result.current.currentMenu).toBe('Goal');
    expect(result.current.activeTab).toBe('secondary');
    expect(result.current.activeStrategy).toBe('fixed');
    expect(result.current.loanPrepaymentStrategy).toBe('monthly');
    expect(result.current.isMobileMenuOpen).toBe(true);
    expect(result.current.inputs.goal.targetAmount).toBe(5000000);
  });
});
