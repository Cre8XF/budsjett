import React, { useState } from 'react';
import { Target, Plus, Calendar, DollarSign } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/format';

export const SavingsGoals: React.FC = () => {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal } = useFinance();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: 0,
    deadline: '',
    category: ''
  });
  // Controlled contribution amount per goal (keyed by goal ID)
  const [contributionAmounts, setContributionAmounts] = useState<Record<string, string>>({});

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleAddGoal = () => {
    if (newGoal.name && newGoal.targetAmount && newGoal.deadline) {
      addSavingsGoal({
        ...newGoal,
        currentAmount: 0
      });
      setNewGoal({ name: '', targetAmount: 0, deadline: '', category: '' });
      setShowAddForm(false);
    }
  };

  const handleContribute = (goalId: string) => {
    const amount = Number(contributionAmounts[goalId] || 0);
    if (amount > 0) {
      updateSavingsGoal(goalId, amount);
      setContributionAmounts(prev => ({ ...prev, [goalId]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Sparemål</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nytt Mål
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Navn på sparemål"
              value={newGoal.name}
              onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Målbeløp (NOK)"
              value={newGoal.targetAmount || ''}
              onChange={(e) => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="date"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Kategori"
              value={newGoal.category}
              onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddGoal}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Legg til Mål
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {savingsGoals.map((goal) => {
          const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const daysRemaining = getDaysRemaining(goal.deadline);

          return (
            <div key={goal.id} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{goal.name}</h3>
                  <span className="text-sm text-gray-500">{goal.category}</span>
                </div>
                <Target className="w-5 h-5 text-blue-500" />
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{formatCurrency(goal.currentAmount)}</span>
                  <span>{formatCurrency(goal.targetAmount)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-gray-600">{percentage.toFixed(1)}% oppnådd</span>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{daysRemaining > 0 ? `${daysRemaining} dager igjen` : 'Utløpt'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Beløp å spare"
                  value={contributionAmounts[goal.id] || ''}
                  onChange={(e) => setContributionAmounts(prev => ({ ...prev, [goal.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleContribute(goal.id);
                    }
                  }}
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => handleContribute(goal.id)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  <DollarSign className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
