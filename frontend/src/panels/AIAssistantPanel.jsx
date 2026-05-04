import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, Sparkles, Code2, Database } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AIAssistantPanel = ({ datasetInfo, selectedModel }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your deepseek-v4-pro assistant. I can help you generate datasets, write training scripts, optimize parameters, or explain models.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Create context block
      let contextMsg = "Current context:\n";
      if (selectedModel) contextMsg += `- Selected Model: ${selectedModel}\n`;
      if (datasetInfo) contextMsg += `- Dataset Loaded: ${datasetInfo.name || 'Custom'} (${datasetInfo.columns.length} columns)\n`;

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

  const quickActions = [
    { label: 'Explain Model', icon: <Sparkles size={16} />, prompt: `Explain how ${selectedModel || 'machine learning models'} work in simple terms.` },
    { label: 'Generate Training Code', icon: <Code2 size={16} />, prompt: `Give me a Python training script using scikit-learn for ${selectedModel || 'a classification model'} on my current dataset.` },
    { label: 'Optimize Parameters', icon: <Sparkles size={16} />, prompt: `What are the best hyperparameters to tune for ${selectedModel || 'this model'} and what values should I try?` },
    { label: 'Generate Dataset Script', icon: <Database size={16} />, prompt: 'Generate a Python script using numpy/pandas to create a realistic synthetic dataset.' }
  ];

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-4">
        <h1 className="text-xl font-extrabold text-white mb-1 tracking-tight flex items-center gap-2">
          <Bot className="text-blue-400" size={24} />
          Gemini-3
        </h1>
        <p className="text-gray-400 text-xs">
          Powered by Lightning AI
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {quickActions.map((action, i) => (
          <button
            key={i}
            onClick={() => handleSend(action.prompt)}
            className="whitespace-nowrap flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-gray-900 border border-gray-700 rounded-xl flex flex-col overflow-hidden shadow-xl">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-500 to-indigo-600'
                }`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-sm'
                }`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose prose-invert max-w-none prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-800">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0">
                <Bot size={20} />
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-gray-950 border-t border-gray-800">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask deepseek..."
              className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPanel;
