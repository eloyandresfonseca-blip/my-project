import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './store/FinanceContext';
import { MobileContainer } from './components/layout/MobileContainer';
import { BottomNavigation, type TabType } from './components/layout/BottomNavigation';
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { TransactionsScreen } from './components/transactions/TransactionsScreen';
import { GoalsScreen } from './components/goals/GoalsScreen';
import { FinCoachScreen } from './components/coach/FinCoachScreen';
import { AddTransactionModal } from './components/transactions/AddTransactionModal';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [autoAuditTriggered, setAutoAuditTriggered] = useState(false);
  const { runAudit } = useFinance();

  const handleTriggerAudit = () => {
    runAudit();
    setAutoAuditTriggered(true);
    setCurrentTab('coach');
  };

  return (
    <MobileContainer>
      {/* Tab Screens */}
      {currentTab === 'dashboard' && (
        <DashboardScreen
          onNavigateToTab={(tab) => setCurrentTab(tab)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onTriggerAudit={handleTriggerAudit}
        />
      )}

      {currentTab === 'transactions' && (
        <TransactionsScreen
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />
      )}

      {currentTab === 'goals' && (
        <GoalsScreen />
      )}

      {currentTab === 'coach' && (
        <FinCoachScreen initialAuditPrompt={autoAuditTriggered} />
      )}

      {/* Persistent Bottom Navigation Bar */}
      <BottomNavigation
        currentTab={currentTab}
        onChangeTab={(tab) => setCurrentTab(tab)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Global Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </MobileContainer>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
