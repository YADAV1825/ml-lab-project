import React from 'react';
import { BookOpen, MonitorPlay, Sparkles, Terminal } from 'lucide-react';

const DocumentationPanel = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight flex items-center gap-3">
          <BookOpen className="text-purple-400" size={36} />
          Documentation
        </h1>
        <p className="text-gray-400 text-lg">
          Complete guide on how to use the Lightning AI Machine Learning Studio.
        </p>
      </div>

      <section className="bg-gray-800/50 border border-gray-700 p-8 rounded-3xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <MonitorPlay className="text-blue-400" />
          1. Usage Guide
        </h2>
        <div className="space-y-4 text-gray-300">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold shrink-0">1</div>
            <div>
              <h3 className="font-bold text-white">Select a Model</h3>
              <p>Start at the Dashboard and choose an algorithm. Regression models are for predicting continuous values, while Classification is for categorical data.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold shrink-0">2</div>
            <div>
              <h3 className="font-bold text-white">Load Dataset</h3>
              <p>Go to the Dataset tab. You can upload a CSV, use a built-in dataset (like Iris or Diabetes), or generate a synthetic dataset.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold shrink-0">3</div>
            <div>
              <h3 className="font-bold text-white">Configure Parameters</h3>
              <p>In the Parameters tab, select your Target variable. Adjust hyperparameters using sliders, or select the Auto-tune checkbox to let GridSearchCV find the best parameters.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold shrink-0">4</div>
            <div>
              <h3 className="font-bold text-white">View Results</h3>
              <p>The Visualization tab will automatically show accuracy, MSE, and a Confusion Matrix for classification tasks once training completes.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-800/50 border border-gray-700 p-8 rounded-3xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Terminal className="text-green-400" />
          2. Model Explanations
        </h2>
        <div className="grid gap-6">
          <div className="bg-gray-900 border border-gray-700 p-5 rounded-2xl">
            <h3 className="text-lg font-bold text-blue-400 mb-2">Random Forest</h3>
            <p className="text-gray-400 text-sm mb-2"><strong>What it does:</strong> Creates an ensemble of decision trees and merges them together for a more accurate and stable prediction.</p>
            <p className="text-gray-400 text-sm"><strong>When to use:</strong> Excellent general-purpose algorithm. Handles tabular data very well without much preprocessing. Good for both regression and classification.</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 p-5 rounded-2xl">
            <h3 className="text-lg font-bold text-pink-400 mb-2">Support Vector Machine (SVM)</h3>
            <p className="text-gray-400 text-sm mb-2"><strong>What it does:</strong> Finds the optimal hyperplane which linearly separates the data points into classes.</p>
            <p className="text-gray-400 text-sm"><strong>When to use:</strong> Effective in high dimensional spaces. Best used when there is a clear margin of separation between classes.</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 p-5 rounded-2xl">
            <h3 className="text-lg font-bold text-purple-400 mb-2">K-Means Clustering</h3>
            <p className="text-gray-400 text-sm mb-2"><strong>What it does:</strong> Unsupervised algorithm that partitions n observations into k clusters based on nearest mean.</p>
            <p className="text-gray-400 text-sm"><strong>When to use:</strong> Finding natural groupings in data when you don't have predefined labels (customer segmentation, anomaly detection).</p>
          </div>
        </div>
      </section>

      <section className="bg-gray-800/50 border border-gray-700 p-8 rounded-3xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Sparkles className="text-yellow-400" />
          3. AI Assistant Capabilities
        </h2>
        <p className="text-gray-300 mb-6">
          The integrated Lightning AI Copilot (powered by deepseek-v4-pro) is aware of your current context. It knows which model you have selected and the structure of your loaded dataset.
        </p>
        <div className="space-y-3">
          <h3 className="font-bold text-white">Example Queries to try:</h3>
          <ul className="list-disc list-inside text-gray-400 space-y-2 text-sm ml-2">
            <li>"Generate a realistic dataset for house price prediction"</li>
            <li>"Give me a random forest training script for my current dataset"</li>
            <li>"Explain SVM in simple terms"</li>
            <li>"Optimize this model for better accuracy"</li>
            <li>"Write a full simulation pipeline for a decision tree"</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default DocumentationPanel;
