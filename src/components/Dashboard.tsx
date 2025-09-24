import React from 'react';
import { PiggyBank, TrendingUp, Target, AlertTriangle } from 'lucide-react';
import { useFinanceData } from '../hooks/useFinanceData';
import { ExpenseChart } from './ExpenseChart';
import { BudgetOverview } from './BudgetOverview';
import { SavingsGoals } from './SavingsGoals';
import { RecentTransactions } from './RecentTransactions';

export const Dashboard: React.FC = () => {
  const { totalIncome, totalExpenses, totalSavings, monthlyProjection, budgets } = useFinanceData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK'
    }).format(amount);
  };

  const budgetWarnings = budgets.filter(budget => 
    budget.spent / budget.limit > 0.8
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Spareplanlegger</h1>
          <p className="text-gray-600">Oversikt over din personlige økonomi</p>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sparing</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSavings)}</p>
              </div>
              <PiggyBank className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Månedlig Inntekt</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalIncome)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Månedlige Utgifter</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalExpenses)}</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Årsprognose</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(monthlyProjection.oneYear)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Budget Warnings */}
        {budgetWarnings.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Budsjettvarslinger</h3>
            </div>
            <div className="space-y-1">
              {budgetWarnings.map(budget => (
                <p key={budget.category} className="text-sm text-orange-700">
                  Du har brukt {Math.round((budget.spent / budget.limit) * 100)}% av budsjettet for {budget.category}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <ExpenseChart />
            <BudgetOverview />
          </div>
          <div className="space-y-8">
            <SavingsGoals />
            <RecentTransactions />
          </div>
        </div>
      </div>
    </div>
  );
};