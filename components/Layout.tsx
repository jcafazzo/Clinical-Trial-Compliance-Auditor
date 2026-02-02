import React from 'react';
import { LayoutDashboard, FileText, Upload, Menu } from 'lucide-react';
import { AnalysisTab } from '../types';

interface LayoutProps {
  currentTab: AnalysisTab;
  onTabChange: (tab: AnalysisTab) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentTab, onTabChange, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // BMJ-style Deep Navy Blue for sidebar/header
  const brandColor = "bg-[#002F6C]"; 

  const navItems = [
    { id: AnalysisTab.DASHBOARD, label: 'Analysis Dashboard', icon: LayoutDashboard },
    { id: AnalysisTab.ABSTRACT_ANALYZER, label: 'Document Scanner', icon: FileText },
    { id: AnalysisTab.DATA_UPLOAD, label: 'Data Management', icon: Upload },
  ];

  return (
    <div className="min-h-screen flex bg-[#F2F2F2]">
      {/* Sidebar - Desktop */}
      <aside className={`hidden md:flex flex-col w-64 ${brandColor} text-white shadow-xl fixed h-full z-10`}>
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold tracking-tight font-serif leading-tight">
            Clinical Trial <br/>
            <span className="font-light italic text-blue-200">Auditor</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-blue-200 mt-3 font-medium">Research Compliance</p>
        </div>
        <nav className="flex-1 py-6 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-6 py-4 transition-all duration-200 border-l-4 ${
                currentTab === item.id
                  ? 'bg-white/10 border-blue-300 text-white'
                  : 'border-transparent text-blue-100 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium font-sans">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/10">
           <div className="text-xs text-blue-200 font-serif italic">
             "Rigorous analysis for better evidence."
           </div>
           <div className="mt-2 text-[10px] text-blue-300 uppercase tracking-wider">
             v1.0.0
           </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className={`md:hidden fixed w-full ${brandColor} text-white z-20 flex items-center justify-between p-4 shadow-md`}>
        <span className="font-bold font-serif text-lg">Clinical Trial Auditor</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={`md:hidden fixed inset-0 ${brandColor} z-30 pt-16 px-4`}>
           {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-4 border-b border-white/10 ${
                currentTab === item.id ? 'text-white font-bold' : 'text-blue-100'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="mt-8 w-full py-3 bg-white/10 rounded text-white font-medium"
          >
            Close Menu
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-10 pt-20 md:pt-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
