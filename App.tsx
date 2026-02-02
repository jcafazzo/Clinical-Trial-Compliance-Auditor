import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AbstractAnalyzer } from './pages/AbstractAnalyzer';
import { DataUpload } from './pages/DataUpload';
import { AnalysisTab, TrialData } from './types';
import { SAMPLE_DATA } from './constants';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AnalysisTab>(AnalysisTab.DASHBOARD);
  const [dataset, setDataset] = useState<TrialData[]>(SAMPLE_DATA);

  const handleResetData = () => {
    setDataset(SAMPLE_DATA);
    setCurrentTab(AnalysisTab.DASHBOARD);
  };

  const renderContent = () => {
    switch (currentTab) {
      case AnalysisTab.DASHBOARD:
        return <Dashboard data={dataset} />;
      case AnalysisTab.ABSTRACT_ANALYZER:
        return <AbstractAnalyzer />;
      case AnalysisTab.DATA_UPLOAD:
        return <DataUpload onReset={handleResetData} />;
      default:
        return <Dashboard data={dataset} />;
    }
  };

  return (
    <Layout currentTab={currentTab} onTabChange={setCurrentTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
