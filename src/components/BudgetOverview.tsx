import React, { useState } from 'react';
import { Edit3, Check, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/format';

export const BudgetOverview: React.FC = () => {
  const { budgets, updateBudget } = useFinance();
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleEditStart = (category: string, currentLimit: number) => {
    setEditingBudget(category);
    setEditValue(currentLimit);
  };

  const handleEditSave = (category: string) => {
    updateBudget(category, editValue);
    setEditingBudget(null);
  };

  const handleEditCancel = () => {
    setEditingBudget(null);
    setEditValue(0);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Budsjett Oversikt</h2>
      
      <div className="space-y-4">
        {budgets.map((budget) => {
          const percentage = budget.limit > 0 ? Math.min((budget.spent / budget.limit) * 100, 100) : 0;
          const isEditing = editingBudget === budget.category;
          
          return (
            <div key={budget.category} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{budget.category}</h3>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(Number(e.target.value))}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <button
                        onClick={() => handleEditSave(budget.category)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm text-gray-600">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                      </span>
                      <button
                        onClick={() => handleEditStart(budget.category, budget.limit)}
                        className="p-1 text-gray-500 hover:bg-gray-50 rounded"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(percentage)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="text-gray-600">{percentage.toFixed(1)}% brukt</span>
                <span className="text-gray-600">
                  {formatCurrency(budget.limit - budget.spent)} igjen
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};