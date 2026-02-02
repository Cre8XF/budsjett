import React, { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES } from '../types';

export const TransactionForm: React.FC = () => {
  const { addTransaction } = useFinance();
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'income' | 'expense'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount && formData.category && formData.description) {
      addTransaction({
        amount: Number(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date,
        type: formData.type
      });
      setFormData({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        type: 'expense'
      });
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length >= 4) {
            const [amount, category, description, date] = values;
            if (amount && category && description && date) {
              addTransaction({
                amount: Math.abs(Number(amount)),
                category: category.trim(),
                description: description.trim(),
                date: date.trim(),
                type: Number(amount) > 0 ? 'income' : 'expense'
              });
            }
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const currentCategories = formData.type === 'income' ? CATEGORIES.income : CATEGORIES.expense;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Legg til Transaksjon</h2>
      
      {/* Manual Entry Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  formData.type === 'expense' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Utgift
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  formData.type === 'income' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Inntekt
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beløp (NOK)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Velg kategori</option>
              {currentCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dato</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Beskriv transaksjonen"
            required
          />
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Legg til Transaksjon
        </button>
      </form>

      {/* CSV Import */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Importer fra CSV</h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span className="text-sm">Velg CSV-fil</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500">
            Format: beløp, kategori, beskrivelse, dato (YYYY-MM-DD)
          </p>
        </div>
      </div>
    </div>
  );
};