import { useEffect, useRef, useState } from 'react';

const DEFAULT_TRACKER_INPUTS = {
  startDate: '2020-01-01',
  endDate: '',
  amount: 5000,
  lumpsum: 0,
  stepUpPercent: 0,
  stepUpValue: 0,
};

const cloneTrackerInputs = () => ({ ...DEFAULT_TRACKER_INPUTS });

const getInitialPortfolio = () => {
  try {
    const saved = localStorage.getItem('mf_portfolio');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const getInvestmentMode = (inputs) => {
  if (inputs.amount > 0 && inputs.lumpsum > 0) return 'Both';
  if (inputs.lumpsum > 0) return 'Lumpsum';
  return 'SIP';
};

export const useTrackerState = ({ currentMenu, getFundList, getFundNAV }) => {
  const [portfolio, setPortfolio] = useState(getInitialPortfolio);
  const [isAddingFund, setIsAddingFund] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [fundList, setFundList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFund, setSelectedFund] = useState(null);
  const [navData, setNavData] = useState([]);
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [trackerInputs, setTrackerInputs] = useState(cloneTrackerInputs);
  const [viewingId, setViewingId] = useState(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);
  const [deletedItem, setDeletedItem] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [investmentMode, setInvestmentMode] = useState('SIP');
  const fileInputRef = useRef(null);
  const getFundListRef = useRef(getFundList);
  const getFundNAVRef = useRef(getFundNAV);

  useEffect(() => {
    getFundListRef.current = getFundList;
    getFundNAVRef.current = getFundNAV;
  }, [getFundList, getFundNAV]);

  useEffect(() => {
    setViewingId(null);
  }, [currentMenu]);

  useEffect(() => {
    try {
      localStorage.setItem('mf_portfolio', JSON.stringify(portfolio));
    } catch (error) {
      console.error('Failed to save portfolio', error);
    }
  }, [portfolio]);

  useEffect(() => {
    if (currentMenu !== 'Tracker' || fundList.length > 0) {
      return undefined;
    }

    let cancelled = false;
    setTrackerLoading(true);

    getFundListRef.current().then((data) => {
      if (cancelled) return;
      if (data) setFundList(data);
      setTrackerLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [currentMenu, fundList.length]);

  useEffect(() => {
    if (portfolio.length === 0) {
      setViewingId(null);
    }
  }, [portfolio.length]);

  useEffect(() => {
    if (!showToast) {
      return undefined;
    }

    const timer = setTimeout(() => setShowToast(false), 4000);
    return () => clearTimeout(timer);
  }, [showToast]);

  const resetSelection = () => {
    setSelectedFund(null);
    setNavData([]);
    setSearchQuery('');
  };

  const handleFundSelect = async (fund) => {
    setSelectedFund(fund);
    setSearchQuery('');
    setTrackerLoading(true);
    setNavData([]);

    const data = await getFundNAVRef.current(fund.schemeCode);
    if (data && data.length > 0) {
      setNavData(data);
    }

    setTrackerLoading(false);
  };

  const handleRefreshFunds = () => {
    setTrackerLoading(true);
    getFundListRef.current(true).then((data) => {
      if (data) setFundList(data);
      setTrackerLoading(false);
    });
  };

  const handleAddToPortfolio = () => {
    if (!selectedFund || navData.length === 0) return;

    if (editingId) {
      setPortfolio((currentPortfolio) =>
        currentPortfolio.map((item) =>
          item.id === editingId
            ? {
                ...item,
                fund: selectedFund,
                inputs: { ...trackerInputs },
                navData: [...navData],
              }
            : item,
        ),
      );
      setEditingId(null);
    } else {
      const newEntry = {
        id: Date.now(),
        fund: selectedFund,
        inputs: { ...trackerInputs },
        navData: [...navData],
      };
      setPortfolio((currentPortfolio) => [...currentPortfolio, newEntry]);
    }

    resetSelection();
    setIsAddingFund(false);
  };

  const handleEditFund = (item) => {
    setSelectedFund(item.fund);
    setTrackerInputs(item.inputs);
    setNavData(item.navData);
    setEditingId(item.id);
    setIsAddingFund(true);
    setInvestmentMode(getInvestmentMode(item.inputs));
  };

  const handleRemoveFund = (id) => {
    setDeleteConfirmationId(id);
  };

  const confirmDelete = () => {
    if (!deleteConfirmationId) return;

    const itemToDelete = portfolio.find((item) => item.id === deleteConfirmationId);
    setDeletedItem(itemToDelete ?? null);
    setPortfolio((currentPortfolio) =>
      currentPortfolio.filter((item) => item.id !== deleteConfirmationId),
    );

    if (viewingId === deleteConfirmationId) {
      setViewingId(null);
    }

    setDeleteConfirmationId(null);
    setShowToast(true);
  };

  const handleUndo = () => {
    if (!deletedItem) return;

    setPortfolio((currentPortfolio) => [...currentPortfolio, deletedItem]);
    setShowToast(false);
    setDeletedItem(null);
  };

  const handleClearPortfolio = () => {
    setPortfolio([]);
    setShowClearConfirmation(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setTrackerLoading(true);

    try {
      let currentFundList = fundList;
      if (currentFundList.length === 0) {
        currentFundList = await getFundListRef.current();
        setFundList(currentFundList || []);
      }

      const text = await file.text();
      const lines = text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        throw new Error('Invalid CSV format');
      }

      const headers = lines[0]
        .split(',')
        .map((header) => header.replace(/"/g, '').trim().toLowerCase());

      const columnMap = {
        code: headers.findIndex((header) => header.includes('code')),
        name: headers.findIndex((header) => header.includes('name') || header.includes('fund')),
        date: headers.findIndex((header) => header.includes('date') || header.includes('start')),
        endDate: headers.findIndex(
          (header) => header.includes('end') && header.includes('date'),
        ),
        sip: headers.findIndex((header) => header.includes('sip') || header.includes('amount')),
        lumpsum: headers.findIndex((header) => header.includes('lumpsum')),
      };

      const newItems = [];

      for (let index = 1; index < lines.length; index += 1) {
        const row = lines[index]
          .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
          .map((value) => value.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

        const schemeCode = columnMap.code > -1 ? row[columnMap.code] : null;
        const schemeName = columnMap.name > -1 ? row[columnMap.name] : null;
        const startDate = columnMap.date > -1 ? row[columnMap.date] : null;
        const endDate = columnMap.endDate > -1 ? row[columnMap.endDate] : '';
        const sipAmount = columnMap.sip > -1 ? parseFloat(row[columnMap.sip]) || 0 : 0;
        const lumpsum = columnMap.lumpsum > -1 ? parseFloat(row[columnMap.lumpsum]) || 0 : 0;

        if (!startDate) continue;

        let fund = null;
        if (schemeCode) {
          fund = currentFundList?.find(
            (item) => String(item.schemeCode) === String(schemeCode),
          );
        }
        if (!fund && schemeName) {
          fund = currentFundList?.find(
            (item) => item.schemeName.toLowerCase() === schemeName.toLowerCase(),
          );
        }
        if (!fund && schemeCode) {
          fund = { schemeCode, schemeName: schemeName || `Fund ${schemeCode}` };
        }

        if (!fund) continue;

        const importedNavData = await getFundNAVRef.current(fund.schemeCode);
        if (!importedNavData || importedNavData.length === 0) continue;

        newItems.push({
          id: Date.now() + index,
          fund,
          inputs: {
            startDate,
            endDate,
            amount: sipAmount,
            lumpsum,
            stepUpPercent: 0,
            stepUpValue: 0,
          },
          navData: importedNavData,
        });
      }

      if (newItems.length > 0) {
        setPortfolio((currentPortfolio) => [...currentPortfolio, ...newItems]);
        alert(`Successfully imported ${newItems.length} funds.`);
      } else {
        alert(
          "No valid funds found. Please check CSV format (Requires 'Scheme Code' or 'Fund Name', and 'Start Date').",
        );
      }
    } catch (error) {
      console.error(error);
      alert('Failed to import CSV. Please check the file format.');
    } finally {
      setTrackerLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return {
    confirmDelete,
    deleteConfirmationId,
    editingId,
    fileInputRef,
    fundList,
    handleAddToPortfolio,
    handleClearPortfolio,
    handleEditFund,
    handleFileChange,
    handleFundSelect,
    handleImportClick,
    handleRefreshFunds,
    handleRemoveFund,
    handleUndo,
    investmentMode,
    isAddingFund,
    navData,
    portfolio,
    searchQuery,
    selectedFund,
    setDeleteConfirmationId,
    setEditingId,
    setInvestmentMode,
    setIsAddingFund,
    setNavData,
    setSearchQuery,
    setSelectedFund,
    setShowClearConfirmation,
    setShowToast,
    setTrackerInputs,
    setViewingId,
    showClearConfirmation,
    showToast,
    trackerInputs,
    trackerLoading,
    viewingId,
  };
};
