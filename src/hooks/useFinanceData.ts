import { useState, useCallback, useEffect } from 'react';
import { Transaction, Budget, SavingsGoal } from '../types';

const STORAGE_KEY = "financeData";

export const useFinanceData = () => {
  // Default-data hvis ingen lagring finnes
  const defaultData = {
    transactions: [
      {
        id: '1',
        amount: 45000,
        category: 'Lønn',
        description: 'Månedslønn',
        date: '2025-01-01',
        type: 'income'
      },
      {
        id: '2',
        amount: 8500,
        category: 'Mat',
        description: 'Dagligvarer',
        date: '2025-01-02',
        type: 'expense'
      }
    ],
    budgets: [
      { category: 'Mat', limit: 10000, spent: 8500 },
      { category: 'Bolig', limit: 12000, spent: 12000 }
    ],
    savingsGoals: []
  };

  // Hent lagrede data eller bruk default
  const loadData = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultData;
  };

  const [transactions, setTransactions] = useState<Transaction[]>(loadData().transactions);
  const [budgets, setBudgets] = useState<Budget[]>(loadData().budgets);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(loadData().savingsGoals);

  // Lagre til localStorage hver gang data endres
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ transactions, budgets, savingsGoals }));
  }, [transactions, budgets, savingsGoals]);

  // Funksjoner for å oppdatere data
  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
  }, []);

  const updateBudget = useCallback((category: string, limit: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.category === category ? { ...b, limit } : b))
    );
  }, []);

  const addSavingsGoal = useCallback((goal: SavingsGoal) => {
    setSavingsGoals((prev) => [...prev, goal]);
  }, []);

  const updateSavingsGoal = useCallback((id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  }, []);

  // Summer og analyser
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalSavings = totalIncome - totalExpenses;

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  return {
    transactions,
    budgets,
    savingsGoals,
    addTransaction,
    updateBudget,
    addSavingsGoal,
    updateSavingsGoal,
    totalIncome,
    totalExpenses,
    totalSavings,
    expensesByCategory
  };
};
