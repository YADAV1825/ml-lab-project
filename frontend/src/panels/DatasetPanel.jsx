import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Database, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const DatasetPanel = ({ datasetId, setDatasetId, datasetInfo, setDatasetInfo }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/dataset/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDatasetId(res.data.dataset_id);
      setDatasetInfo(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBuiltIn = async (name) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/dataset/builtin/${name}`);
      setDatasetId(res.data.dataset_id);
      setDatasetInfo({ ...res.data, name: name });
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pt-2 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Database className="text-white" size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Dataset Source</h1>
          <p className="text-slate-400 text-sm font-medium">Load the Diabetes dataset for training</p>
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

      {/* Dataset Card */}
      <div className="flex justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="glass-card p-8 max-w-lg w-full text-center"
        >
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-emerald-500/20">
            <Database className="text-white" size={28} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Diabetes Dataset</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
            Standard sklearn dataset used to predict diabetes progression. Compatible with all available models.
          </p>

          <button
            onClick={() => loadBuiltIn('diabetes')}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Loading...
              </>
            ) : datasetId ? (
              <>
                <CheckCircle2 size={18} />
                Reload Dataset
              </>
            ) : (
              <>
                <Database size={18} />
                Load Dataset
              </>
            )}
          </button>
        </motion.div>
      </div>

      {/* Dataset Preview Table */}
      {datasetInfo && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card-static p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={18} />
              <h3 className="text-lg font-bold text-slate-800">
                Dataset Loaded: {datasetInfo.name || 'Custom Upload'}
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
              {datasetInfo.columns.length} features
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl">
            <table className="glass-table">
              <thead>
                <tr>
                  {datasetInfo.columns.map((col, i) => (
                    <th key={i}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datasetInfo.preview.map((row, i) => (
                  <tr key={i}>
                    {datasetInfo.columns.map((col, j) => (
                      <td key={j} className="truncate max-w-[120px]">
                        {typeof row[col] === 'number' ? row[col].toFixed(4) : row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DatasetPanel;
