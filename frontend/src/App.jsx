import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Database, Settings, BarChart2, Zap, Bot, BookOpen, ChevronRight } from 'lucide-react';
import Dashboard from './panels/Dashboard';
import ParameterPanel from './panels/ParameterPanel';
import DatasetPanel from './panels/DatasetPanel';
import VisualizationPanel from './panels/VisualizationPanel';
import AIInsightPanel from './panels/AIInsightPanel';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Global state
  const [datasetId, setDatasetId] = useState(null);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [modelParams, setModelParams] = useState({});
  const [trainingResults, setTrainingResults] = useState(null);
  const [isTraining, setIsTraining] = useState(false);

  const handleSetSelectedModel = (modelId) => {
    setSelectedModel(modelId);
    setModelParams({});
    setTrainingResults(null);
  };

  const tabs = [
    { id: 'dashboard', icon: <Zap size={18} />, label: 'Models' },
    { id: 'dataset', icon: <Database size={18} />, label: 'Data' },
    { id: 'parameters', icon: <Settings size={18} />, label: 'Configure' },
    { id: 'visualization', icon: <BarChart2 size={18} />, label: 'Results' },
  ];

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden relative" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Decorative floating orbs */}
      <div className="floating-orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(99,102,241,0.3), transparent)', top: -100, right: -100 }} />
      <div className="floating-orb" style={{ width: 300, height: 300, background: 'radial-gradient(circle, rgba(168,85,247,0.2), transparent)', bottom: -50, left: '30%' }} />
      <div className="floating-orb" style={{ width: 250, height: 250, background: 'radial-gradient(circle, rgba(45,212,191,0.2), transparent)', top: '40%', left: -80 }} />

      {/* Top Navigation Bar */}
      <header className="relative z-30 flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold gradient-text tracking-tight">Lightning Studio</h1>
            <p className="text-[10px] text-slate-400 font-medium -mt-0.5">AI-Powered ML Platform</p>
          </div>
        </div>

        {/* Navigation Pills */}
        <nav className="nav-pill flex items-center gap-1 p-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`nav-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'nav-pill-active'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/30'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Status badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card-static text-xs font-medium">
            <div className={`w-2 h-2 rounded-full ${datasetId ? 'bg-emerald-400' : 'bg-amber-400'} ${datasetId ? '' : 'animate-pulse'}`} />
            <span className="text-slate-600">{datasetId ? 'Data Loaded' : 'No Data'}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card-static text-xs font-medium">
            <div className={`w-2 h-2 rounded-full ${selectedModel ? 'bg-indigo-400' : 'bg-slate-300'}`} />
            <span className="text-slate-600">{selectedModel || 'No Model'}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left: Main Panel */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="h-full"
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  selectedModel={selectedModel} 
                  setSelectedModel={handleSetSelectedModel} 
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === 'dataset' && (
                <DatasetPanel 
                  datasetId={datasetId}
                  setDatasetId={setDatasetId}
                  datasetInfo={datasetInfo}
                  setDatasetInfo={setDatasetInfo}
                />
              )}
              {activeTab === 'parameters' && (
                <ParameterPanel 
                  selectedModel={selectedModel}
                  modelParams={modelParams}
                  setModelParams={setModelParams}
                  datasetInfo={datasetInfo}
                  datasetId={datasetId}
                  setTrainingResults={setTrainingResults}
                  isTraining={isTraining}
                  setIsTraining={setIsTraining}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === 'visualization' && (
                <VisualizationPanel 
                  trainingResults={trainingResults}
                  selectedModel={selectedModel}
                  isTraining={isTraining}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: AI Insight Panel (always visible) */}
        <div className="w-[380px] shrink-0 pr-4 pb-4">
          <AIInsightPanel 
            datasetInfo={datasetInfo}
            selectedModel={selectedModel}
            trainingResults={trainingResults}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
