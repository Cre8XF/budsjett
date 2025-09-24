import { useState, useCallback, useMemo, useEffect } from 'react';
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
      },
      {
        id: '3',
        amount: 12000,
        category: 'Bolig',
        description: 'Husleie',
        date: '2025-01-03',
        type: 'expense'
      }
    ],
    budgets: [
      { category: 'Mat', limit: 10000, spent: 8500 },
      { category: 'Bolig', limit: 15000, spent: 12000 },
      { category: 'Transport', limit: 3000, spent: 2100 },
      { category: 'Fritid', limit: 5000, spent: 3200 }
    ],
    savingsGoals: [
      {
        id: '1',
        name: 'Sommerferie til Italia',
        targetAmount: 25000,
        currentAmount: 18500,
        deadline: '2025-06-01',
        category: 'Reise'
      },
      {
        id: '2',
        name: 'Ny MacBook Pro',
        targetAmount: 35000,
        currentAmount: 12000,
        deadline: '2025-08-01',
        category: 'Teknologi'
      }
    ]
  };

  // Hent lagrede data eller bruk default
  const loadData = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultData;
  };

  const [transactions, setTransactions] = useState<Transaction[]>(loadData().transactions);
  const [budgets, setBudgets] = useState<Budget[]>(loadData().budgets);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(loadData().savingsGoals);

  // Lagre til localStorage når noe endres
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ transactions, budgets, savingsGoals }));
  }, [transactions, budgets, savingsGoals]);

  // Funksjoner
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: Date.now().toString() };
    setTransactions(prev => [newTransaction, ...prev]);

    if (transaction.type === 'expense') {
      setBudgets(prev =>
        prev.map(budget =>
          budget.category === transaction.category
            ? { ...budget, spent: budget.spent + transaction.amount }
            : budget
        )
      );
    }
  }, []);

  const updateBudget = useCallback((category: string, limit: number) => {
    setBudgets(prev => prev.map(budget =>
      budget.category === category ? { ...budget, limit } : budget
    ));
  }, []);

  const addSavingsGoal = useCallback((goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal = { ...goal, id: Date.now().toString() };
    setSavingsGoals(prev => [...prev, newGoal]);
  }, []);

  const updateSavingsGoal = useCallback((id: string, amount: number) => {
    setSavingsGoals(prev =>
      prev.map(goal =>
        goal.id === id ? { ...goal, currentAmount: goal.currentAmount + amount } : goal
      )
    );
  }, []);

  // Beregninger
  const totalIncome = useMemo(
    () => transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const totalExpenses = useMemo(
    () => transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const totalSavings = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);

  const expensesByCategory = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    return expenses.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [transactions]);

  const monthlyProjection = useMemo(() => {
    const avgMonthlyIncome = totalIncome;
    const avgMonthlyExpenses = totalExpenses;
    const monthlySavings = avgMonthlyIncome - avgMonthlyExpenses;

    return {
      sixMonths: monthlySavings * 6,
      oneYear: monthlySavings * 12
    };
  }, [totalIncome, totalExpenses]);

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
    expensesByCategory,
    monthlyProjection
  };
};
