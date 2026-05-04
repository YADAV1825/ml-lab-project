import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AIInsightPanel = ({ datasetInfo, selectedModel, trainingResults }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Hi! I\'m your ML Copilot. Train a model and I\'ll automatically explain the results — or ask me anything about ML!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoExplained, setHasAutoExplained] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Auto-explain when training results come in
  useEffect(() => {
    if (trainingResults && !hasAutoExplained) {
      setHasAutoExplained(true);
      autoExplainResults();
    }
  }, [trainingResults]);

  // Reset auto-explain flag when model changes
  useEffect(() => {
    setHasAutoExplained(false);
  }, [selectedModel]);

  const buildResultsSummary = () => {
    if (!trainingResults) return '';
    const r = trainingResults;
    let summary = `\n--- TRAINING RESULTS ---\n`;
    summary += `Model: ${selectedModel}\n`;
    summary += `Task Type: ${r.task_type}\n`;
    if (r.accuracy !== undefined) summary += `Accuracy: ${(r.accuracy * 100).toFixed(2)}%\n`;
    if (r.precision !== undefined) summary += `Precision: ${(r.precision * 100).toFixed(2)}%\n`;
    if (r.recall !== undefined) summary += `Recall: ${(r.recall * 100).toFixed(2)}%\n`;
    if (r.f1 !== undefined) summary += `F1 Score: ${(r.f1 * 100).toFixed(2)}%\n`;
    if (r.mse !== undefined) summary += `MSE: ${r.mse.toFixed(4)}\n`;
    if (r.mae !== undefined) summary += `MAE: ${r.mae.toFixed(4)}\n`;
    if (r.r2 !== undefined) summary += `R² Score: ${(r.r2 * 100).toFixed(2)}%\n`;
    if (r.roc_auc !== undefined) summary += `ROC AUC: ${(r.roc_auc * 100).toFixed(2)}%\n`;
    if (r.inertia) summary += `Inertia: ${r.inertia.toFixed(2)}\n`;
    if (r.params_used) summary += `Parameters Used: ${JSON.stringify(r.params_used)}\n`;
    if (r.confusion_matrix) summary += `Confusion Matrix: ${JSON.stringify(r.confusion_matrix)}\n`;
    return summary;
  };

  const autoExplainResults = async () => {
    const resultsSummary = buildResultsSummary();
    const prompt = `I just trained a ${selectedModel} model on the Diabetes dataset. Here are my results:\n${resultsSummary}\n\nPlease explain:\n1. What the model did and how it works in simple terms\n2. What each metric means and whether my values are good or bad\n3. Key observations from the confusion matrix (if classification)\n4. Suggestions for improvement\n\nKeep it concise but insightful. Use bullet points and be specific about the numbers.`;

    const autoMsg = { role: 'user', content: `🤖 Auto-analysis: Explain my ${selectedModel} training results` };
    const newMessages = [...messages, autoMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      let contextMsg = "Current context:\n";
      if (selectedModel) contextMsg += `- Selected Model: ${selectedModel}\n`;
      if (datasetInfo) contextMsg += `- Dataset: ${datasetInfo.name || 'Custom'} (${datasetInfo.columns.length} columns)\n`;
      contextMsg += resultsSummary;

      const apiMessages = [
        { role: 'system', content: contextMsg },
        ...newMessages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: prompt }
      ];

      const res = await axios.post('http://localhost:8000/api/chat', { messages: apiMessages });
      setMessages([...newMessages, { role: 'assistant', content: res.data.reply }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: `⚠️ Could not auto-analyze: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    const userMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      let contextMsg = "Current context:\n";
      if (selectedModel) contextMsg += `- Selected Model: ${selectedModel}\n`;
      if (datasetInfo) contextMsg += `- Dataset: ${datasetInfo.name || 'Custom'} (${datasetInfo.columns.length} columns)\n`;
      if (trainingResults) contextMsg += buildResultsSummary();

      const apiMessages = [
        { role: 'system', content: contextMsg },
        ...newMessages.map(m => ({ role: m.role, content: m.content }))
      ];

      const res = await axios.post('http://localhost:8000/api/chat', { messages: apiMessages });
      setMessages([...newMessages, { role: 'assistant', content: res.data.reply }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col glass-card-static overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Bot className="text-white" size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">ML Copilot</h2>
            <p className="text-[10px] text-slate-400 font-medium">Auto-explains results after training</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {[
            { label: 'Explain Model', prompt: `Explain how ${selectedModel || 'machine learning models'} work simply.` },
            { label: 'Optimize', prompt: `What hyperparameters should I tune for ${selectedModel || 'this model'}?` },
          ].map((a, i) => (
            <button key={i} onClick={() => handleSend(a.prompt)}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-colors flex items-center gap-1">
              <Sparkles size={12} />{a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-slate-100'
            }`}>
              {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-indigo-500" />}
            </div>
            <div className={`max-w-[85%] p-3 text-sm ${
              msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
            }`}>
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap text-xs">{msg.content}</p>
              ) : (
                <div className="prose-glass prose prose-sm max-w-none text-xs leading-relaxed">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-indigo-500" />
            </div>
            <div className="chat-bubble-ai p-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/20">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your model..."
            className="glass-input text-xs py-2"
          />
          <button type="submit" disabled={!input.trim() || isLoading}
            className="btn-primary px-3 py-2 rounded-xl disabled:opacity-40">
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIInsightPanel;
