import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Play, Settings, Sparkles, Loader2, AlertCircle } from 'lucide-react';

const ParameterPanel = ({ 
  selectedModel, 
  modelParams, 
  setModelParams, 
  datasetInfo, 
  datasetId, 
  setTrainingResults,
  isTraining,
  setIsTraining,
  setActiveTab
}) => {
  const [error, setError] = useState(null);
  const [targetCol, setTargetCol] = useState(datasetInfo?.columns.includes('target') ? 'target' : (datasetInfo?.columns[0] || ''));
  const [tune, setTune] = useState(false);
  
  if (!selectedModel) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Settings size={36} className="text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-400 mb-2">No Model Selected</h2>
          <p className="text-slate-400 text-sm">Please select a model from the dashboard first.</p>
        </motion.div>
      </div>
    );
  }

  const handleParamChange = (key, value) => {
    setModelParams({ ...modelParams, [key]: value });
  };

  const handleTrain = async () => {
    if (!datasetId) {
      setError("Please load a dataset first.");
      return;
    }
    
    setIsTraining(true);
    setError(null);
    
    try {
      const isClustering = selectedModel === 'K-Means';
      const taskType = isClustering ? 'clustering' : 'classification';

      const payload = {
        dataset_id: datasetId,
        target_col: targetCol,
        model_name: selectedModel,
        task_type: taskType,
        test_size: 0.2,
        params: modelParams,
        tune: tune
      };

      const res = await axios.post('http://localhost:8000/api/train', payload);
      setTrainingResults(res.data);
      setActiveTab('visualization');
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pt-2 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Settings className="text-white" size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Configure <span className="gradient-text">{selectedModel}</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium">Adjust hyperparameters or auto-tune them</p>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm"
        >
          <AlertCircle size={18} />
          {error}
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 space-y-6"
      >
        {/* Target Variable */}
        <div>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Target Variable</h3>
          <select 
            value={targetCol}
            onChange={(e) => setTargetCol(e.target.value)}
            className="glass-select"
          >
            {datasetInfo?.columns?.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        {/* Hyperparameters */}
        <div>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Hyperparameters</h3>
          
          <div className="space-y-5">
            {(selectedModel === 'Random Forest' || selectedModel === 'Decision Tree') && (
              <div>
                <label className="flex justify-between text-sm font-medium text-slate-600 mb-2">
                  <span>Max Depth</span>
                  <span className="text-indigo-500 font-bold">{modelParams.max_depth || 10}</span>
                </label>
                <input 
                  type="range" min="1" max="50" 
                  value={modelParams.max_depth || 10} 
                  onChange={(e) => handleParamChange('max_depth', parseInt(e.target.value))}
                />
              </div>
            )}

            {selectedModel === 'Random Forest' && (
              <div>
                <label className="flex justify-between text-sm font-medium text-slate-600 mb-2">
                  <span>N Estimators</span>
                  <span className="text-indigo-500 font-bold">{modelParams.n_estimators || 100}</span>
                </label>
                <input 
                  type="range" min="10" max="500" step="10"
                  value={modelParams.n_estimators || 100} 
                  onChange={(e) => handleParamChange('n_estimators', parseInt(e.target.value))}
                />
              </div>
            )}

            {selectedModel === 'SVM' && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Kernel</label>
                <select 
                  value={modelParams.kernel || 'rbf'}
                  onChange={(e) => handleParamChange('kernel', e.target.value)}
                  className="glass-select"
                >
                  <option value="linear">Linear</option>
                  <option value="poly">Polynomial</option>
                  <option value="rbf">RBF</option>
                  <option value="sigmoid">Sigmoid</option>
                </select>
              </div>
            )}
          </div>

          {/* Auto-tune */}
          <div className="flex items-center gap-3 pt-5 mt-5 border-t border-white/30">
            <input 
              type="checkbox" 
              id="tune" 
              checked={tune} 
              onChange={(e) => setTune(e.target.checked)}
              className="w-5 h-5 accent-indigo-500 rounded"
            />
            <label htmlFor="tune" className="text-slate-600 font-medium flex items-center gap-2 text-sm cursor-pointer">
              <Sparkles className="text-purple-500" size={16} />
              Auto-tune hyperparameters (GridSearchCV)
            </label>
          </div>
        </div>
      </motion.div>

      {/* Train Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleTrain}
        disabled={isTraining || !datasetId}
        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
      >
        {isTraining ? (
          <>
            <Loader2 size={22} className="animate-spin" />
            Training Model...
          </>
        ) : (
          <>
            <Play size={22} />
            Start Training
          </>
        )}
      </motion.button>
    </div>
  );
};

export default ParameterPanel;
