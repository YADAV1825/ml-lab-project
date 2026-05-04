import React from 'react';
import { motion } from 'framer-motion';
import { Activity, GitBranch, Share2, Target, CircleDashed, Layers, Network, ChevronRight, Sparkles } from 'lucide-react';

const models = [
  { id: 'Linear Regression', name: 'Linear Regression', icon: <Activity size={28} />, gradient: 'from-blue-500 to-cyan-400', type: 'Regression', desc: 'Predict continuous values with linear relationships' },
  { id: 'Logistic Regression', name: 'Logistic Regression', icon: <Target size={28} />, gradient: 'from-emerald-500 to-teal-400', type: 'Classification', desc: 'Binary and multi-class classification tasks' },
  { id: 'Decision Tree', name: 'Decision Tree', icon: <GitBranch size={28} />, gradient: 'from-amber-500 to-orange-400', type: 'Both', desc: 'Tree-based decisions for interpretable models' },
  { id: 'Random Forest', name: 'Random Forest', icon: <Layers size={28} />, gradient: 'from-orange-500 to-red-400', type: 'Both', desc: 'Ensemble of trees for robust predictions' },
  { id: 'KNN', name: 'K-Nearest Neighbors', icon: <Share2 size={28} />, gradient: 'from-purple-500 to-violet-400', type: 'Both', desc: 'Instance-based learning from similar data points' },
  { id: 'SVM', name: 'Support Vector Machine', icon: <Network size={28} />, gradient: 'from-pink-500 to-rose-400', type: 'Both', desc: 'Find optimal hyperplane separating classes' },
  { id: 'K-Means', name: 'K-Means Clustering', icon: <CircleDashed size={28} />, gradient: 'from-indigo-500 to-blue-400', type: 'Clustering', desc: 'Discover natural groupings in unlabeled data' },
];

const Dashboard = ({ selectedModel, setSelectedModel, setActiveTab }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const handleSelect = (model) => {
    setSelectedModel(model.id);
    setActiveTab('dataset');
  };

  return (
    <div className="max-w-5xl mx-auto pt-2">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Select Algorithm</h1>
            <p className="text-slate-400 text-sm font-medium">Choose a model to begin your ML pipeline</p>
          </div>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {models.map((model) => (
          <motion.div
            key={model.id}
            variants={item}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelect(model)}
            className={`cursor-pointer glass-card p-5 transition-all duration-300 ${
              selectedModel === model.id 
                ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-transparent shadow-xl shadow-indigo-500/10' 
                : ''
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${model.gradient} flex items-center justify-center mb-4 shadow-lg`}>
              {React.cloneElement(model.icon, { className: 'text-white' })}
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{model.name}</h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">{model.desc}</p>
            <div className="flex items-center justify-between">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                {model.type}
              </span>
              <ChevronRight size={16} className="text-slate-300" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Dashboard;
