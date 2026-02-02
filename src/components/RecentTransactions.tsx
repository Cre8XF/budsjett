import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, Clock } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/format';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

export const RecentTransactions: React.FC = () => {
  const { transactions } = useFinance();
  const recentTransactions = transactions.slice(0, 5);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd. MMM', { locale: nb });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Siste Transaksjoner</h2>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-3">
        {recentTransactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                transaction.type === 'income' 
                  ? 'bg-green-100' 
                  : 'bg-red-100'
              }`}>
                {transaction.type === 'income' ? (
                  <ArrowUpCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowDownCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
              
              <div>
                <p className="font-medium text-gray-900">{transaction.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{transaction.category}</span>
                  <span>•</span>
                  <span>{formatDate(transaction.date)}</span>
                </div>
              </div>
            </div>
            
            <div className={`font-semibold ${
              transaction.type === 'income' 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
        Se alle transaksjoner
      </button>
    </div>
  );
};