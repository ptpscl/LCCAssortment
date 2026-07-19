import React from 'react';
import { Home, LayoutDashboard, BarChart3, AlertCircle, ListChecks, LineChart, History, LogOut } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ currentView, onViewChange, onLogout }: SidebarProps) {
  const topNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'executive-dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'category-dashboard', label: 'Category Dashboard', icon: BarChart3 },
    { id: 'issue-summary', label: 'Issue Summary', icon: AlertCircle },
    { id: 'review-queue', label: 'Review Queue', icon: ListChecks },
    { id: 'assortment-tracker', label: 'Assortment Tracker', icon: LineChart },
  ];

  const bottomNavItems = [
    { id: 'history', label: 'History', icon: History },
  ];

  const NavItem = ({ item }: { item: any }) => {
    const Icon = item.icon;
    const isActive = currentView === item.id;
    return (
      <button
        onClick={() => onViewChange(item.id)}
        className={`w-full flex items-center h-10 px-3 rounded-[8px] text-[13px] font-medium transition-colors ${
          isActive 
            ? 'bg-brand-50 text-brand-600' 
            : 'text-text-muted hover:bg-surface-bg hover:text-text-main'
        }`}
      >
        <Icon className="w-4 h-4 mr-3 shrink-0" />
        {item.label}
      </button>
    );
  };

  return (
    <div className="w-[256px] bg-white border-r border-border-subtle flex flex-col h-full shrink-0">
      <div className="h-16 flex flex-col justify-center px-6 border-b border-border-subtle shrink-0">
        <h1 className="text-[18px] font-bold text-brand-600 leading-tight">LCC Assortment</h1>
        <p className="text-[12px] font-medium text-text-muted leading-tight">Support Tool</p>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="space-y-1">
          {topNavItems.map(item => <NavItem key={item.id} item={item} />)}
        </div>
        
        <div className="my-4 border-t border-border-subtle" />
        
        <div className="space-y-1">
          {bottomNavItems.map(item => <NavItem key={item.id} item={item} />)}
        </div>
      </div>
      
      <div className="p-4 border-t border-border-subtle shrink-0">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-semibold text-[13px] mr-3 shrink-0">
            PC
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-text-main truncate">Pat Cruz</p>
            <p className="text-[12px] text-text-muted truncate">Category Manager</p>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center h-10 px-3 rounded-[8px] text-[13px] font-medium text-text-muted hover:bg-surface-bg hover:text-text-main transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-3 shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );
}
