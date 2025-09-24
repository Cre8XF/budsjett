import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { BudgetOverview } from './components/BudgetOverview';
import { SavingsGoals } from './components/SavingsGoals';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return (
          <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            <div className="max-w-4xl mx-auto px-4 py-8">
              <TransactionForm />
            </div>
          </div>
        );
      case 'budget':
        return (
          <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            <div className="max-w-4xl mx-auto px-4 py-8">
              <BudgetOverview />
            </div>
          </div>
        );
      case 'goals':
        return (
          <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            <div className="max-w-4xl mx-auto px-4 py-8">
              <SavingsGoals />
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
    </div>
  );
}

export default App;