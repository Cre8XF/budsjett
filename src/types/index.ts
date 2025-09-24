export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
}

export interface Budget {
  category: string;
  limit: number;
  spent: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export const CATEGORIES = {
  income: ['Lønn', 'Bonus', 'Investering', 'Annet'],
  expense: ['Mat', 'Bolig', 'Transport', 'Fritid', 'Helse', 'Klær', 'Annet']
} as const;