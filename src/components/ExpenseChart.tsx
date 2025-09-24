import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useFinanceData } from '../hooks/useFinanceData';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export const ExpenseChart: React.FC = () => {
  const { expensesByCategory } = useFinanceData();

  const colors = [
    '#EF4444', // Red
    '#F97316', // Orange  
    '#EAB308', // Yellow
    '#22C55E', // Green
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
  ];

  const doughnutData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: colors.slice(0, Object.keys(expensesByCategory).length),
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        label: 'Utgifter (NOK)',
        data: Object.values(expensesByCategory),
        backgroundColor: colors.slice(0, Object.keys(expensesByCategory).length).map(color => color + '40'),
        borderColor: colors.slice(0, Object.keys(expensesByCategory).length),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('no-NO', {
              style: 'currency',
              currency: 'NOK',
              minimumFractionDigits: 0,
            }).format(value);
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Utgifter per Kategori</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64">
          <Doughnut data={doughnutData} options={chartOptions} />
        </div>
        
        <div className="h-64">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
};