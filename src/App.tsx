import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import HomeView from './components/views/HomeView';
import ExecutiveDashboard from './components/views/ExecutiveDashboard';
import CategoryDashboard from './components/views/CategoryDashboard';
import IssueSummary from './components/views/IssueSummary';
import QueueScreen from './components/views/QueueScreen';
import AbSandboxScreen from './components/views/AbSandboxScreen';
import AssortmentTracker from './components/views/AssortmentTracker';
import HistoryView from './components/views/HistoryView';
import LoginView from './components/views/LoginView';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<string>('home');

  if (!isAuthenticated) {
    return <LoginView onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    switch(currentView) {
      case 'home': return <HomeView />;
      case 'executive-dashboard': return <ExecutiveDashboard />;
      case 'category-dashboard': return <CategoryDashboard />;
      case 'issue-summary': return <IssueSummary />;
      case 'review-queue': return <QueueScreen onViewChange={setCurrentView} />;
      case 'assortment-tracker': return <AssortmentTracker />;
      case 'history': return <HistoryView />;
      case 'ab-sandbox': return <AbSandboxScreen onViewChange={setCurrentView} />;
      default: return <HomeView />;
    }
  };

  const getTitle = () => {
    switch(currentView) {
      case 'home': return 'Home';
      case 'executive-dashboard': return 'Executive Dashboard';
      case 'category-dashboard': return 'Category Dashboard';
      case 'issue-summary': return 'Exception Dashboard';
      case 'review-queue': return 'Generate AB';
      case 'ab-sandbox': return 'AB Sandbox';
      case 'assortment-tracker': return 'Assortment Tracker';
      case 'history': return 'History';
      default: return '';
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-bg font-sans text-text-main selection:bg-brand-50 selection:text-brand-600">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} onLogout={() => setIsAuthenticated(false)} />
      
      <main className="flex flex-col flex-1 overflow-hidden">
        <Topbar title={getTitle()} />
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1200px] mx-auto w-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
