import { useState, useCallback, useMemo, useEffect } from 'react';
import { Transaction, Budget, SavingsGoal } from '../types';

const STORAGE_KEY = "financeData";

// Stored budgets only need category and limit; spent is derived from transactions
interface StoredBudget {
  category: string;
  limit: number;
}

const defaultTransactions: Transaction[] = [
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
];

const defaultStoredBudgets: StoredBudget[] = [
  { category: 'Mat', limit: 10000 },
  { category: 'Bolig', limit: 15000 },
  { category: 'Transport', limit: 3000 },
  { category: 'Fritid', limit: 5000 }
];

const defaultSavingsGoals: SavingsGoal[] = [
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
];

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return {
      transactions: defaultTransactions,
      storedBudgets: defaultStoredBudgets,
      savingsGoals: defaultSavingsGoals
    };
  }
  const parsed = JSON.parse(saved);
  return {
    transactions: parsed.transactions ?? defaultTransactions,
    // Strip any legacy 'spent' field — spent is now derived from transactions
    storedBudgets: (parsed.budgets ?? defaultStoredBudgets).map(
      (b: { category: string; limit: number }) => ({ category: b.category, limit: b.limit })
    ),
    savingsGoals: parsed.savingsGoals ?? defaultSavingsGoals
  };
}

export const useFinanceData = () => {
  // Load once via lazy initializer — avoids triple-parse of localStorage
  const [initialData] = useState(loadData);

  const [transactions, setTransactions] = useState<Transaction[]>(initialData.transactions);
  const [storedBudgets, setStoredBudgets] = useState<StoredBudget[]>(initialData.storedBudgets);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(initialData.savingsGoals);

  // --- Derived calculations ---

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

  // Derive budget.spent from transactions (single source of truth)
  const budgets: Budget[] = useMemo(
    () => storedBudgets.map(b => ({
      ...b,
      spent: expensesByCategory[b.category] ?? 0
    })),
    [storedBudgets, expensesByCategory]
  );

  // Monthly projection based on actual date range of transactions
  const monthlyProjection = useMemo(() => {
    if (transactions.length === 0) {
      return { sixMonths: 0, oneYear: 0 };
    }

    const dates = transactions.map(t => new Date(t.date));
    const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
    const latest = new Date(Math.max(...dates.map(d => d.getTime())));

    // Number of distinct months spanned (minimum 1)
    const monthsSpanned = Math.max(
      1,
      (latest.getFullYear() - earliest.getFullYear()) * 12 +
        (latest.getMonth() - earliest.getMonth()) + 1
    );

    const avgMonthlyIncome = totalIncome / monthsSpanned;
    const avgMonthlyExpenses = totalExpenses / monthsSpanned;
    const monthlySavings = avgMonthlyIncome - avgMonthlyExpenses;

    return {
      sixMonths: monthlySavings * 6,
      oneYear: monthlySavings * 12
    };
  }, [transactions, totalIncome, totalExpenses]);

  // --- Persist to localStorage ---

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      transactions,
      budgets: storedBudgets,
      savingsGoals
    }));
  }, [transactions, storedBudgets, savingsGoals]);

  // --- Actions (all hooks at top level — Rules of Hooks compliant) ---

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: Date.now().toString() };
    setTransactions(prev => [newTransaction, ...prev]);
    // No manual budget.spent increment — spent is derived from transactions
  }, []);

  const updateBudget = useCallback((category: string, limit: number) => {
    setStoredBudgets(prev => prev.map(budget =>
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

  const resetData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setTransactions([]);
    setStoredBudgets([]);
    setSavingsGoals([]);
  }, []);

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
    monthlyProjection,
    resetData
  };
};
