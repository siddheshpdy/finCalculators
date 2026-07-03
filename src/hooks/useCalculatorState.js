import { useEffect, useState } from 'react';
import { getCanonicalPathForMenu, getLocationMenuState } from '../utils/calculatorRoutes';

const createDefaultInputs = () => ({
  sip: {
    amount: 5000,
    rate: 12,
    years: 10,
    stepUpPercent: 10,
    stepUpValue: 0,
    initialLumpsum: 0,
    inflationRate: 6,
  },
  lumpsum: { amount: 100000, rate: 12, years: 10 },
  rd: { monthlyDeposit: 5000, rate: 7, quarters: 20 },
  loan: { principal: 1000000, rate: 8.5, months: 120, yearlyExtra: 0, monthlyExtra: 0 },
  swp: {
    initialCorpus: 10000000,
    monthlyWithdrawal: 50000,
    annualRate: 8,
    stepUpPercent: 0,
  },
  goal: { targetAmount: 10000000, rate: 12, years: 10 },
});

export const useCalculatorState = () => {
  const [currentMenu, setCurrentMenuState] = useState(() => {
    if (typeof window === 'undefined') {
      return 'SIP';
    }

    return getLocationMenuState().menu;
  });
  const [activeTab, setActiveTab] = useState('primary');
  const [activeStrategy, setActiveStrategy] = useState('percent');
  const [loanPrepaymentStrategy, setLoanPrepaymentStrategy] = useState('yearly');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [inputs, setInputs] = useState(createDefaultInputs);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const syncMenuFromLocation = () => {
      const { menu } = getLocationMenuState();
      setCurrentMenuState(menu);
      setIsMobileMenuOpen(false);
    };

    const { isKnownPath, isRedirected } = getLocationMenuState();
    if (isRedirected || !isKnownPath) {
      window.history.replaceState(window.history.state, '', getCanonicalPathForMenu(currentMenu));
    }

    window.addEventListener('popstate', syncMenuFromLocation);
    return () => {
      window.removeEventListener('popstate', syncMenuFromLocation);
    };
  }, [currentMenu, setIsMobileMenuOpen]);

  const setCurrentMenu = (menu) => {
    setCurrentMenuState(menu);

    if (typeof window === 'undefined') {
      return;
    }

    const nextPath = getCanonicalPathForMenu(menu);
    const searchParams = new URLSearchParams(window.location.search);
    const hasRedirectParam = searchParams.has('p');

    if (window.location.pathname !== nextPath || hasRedirectParam) {
      window.history.pushState({ menu }, '', nextPath);
    }
  };

  return {
    activeStrategy,
    activeTab,
    currentMenu,
    inputs,
    isMobileMenuOpen,
    loanPrepaymentStrategy,
    setActiveStrategy,
    setActiveTab,
    setCurrentMenu,
    setInputs,
    setIsMobileMenuOpen,
    setLoanPrepaymentStrategy,
  };
};
