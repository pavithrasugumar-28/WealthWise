import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { getFinancialAdvice, analyzeSpendingHabits, generateFinancialReport } from '../services/gemini';
import { Bot, Send, Sparkles, TrendingUp, BookOpen, FileText, Printer, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Advisor: React.FC = () => {
  const { transactions, savingGoals, budgetCategories, investments, user } = useFinance();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'reports'>('insights');
  
  // Insights State
  const [insights, setInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Reports State
  const [report, setReport] = useState<string>('');
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    if (activeTab === 'insights' && !insights) {
      loadInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadInsights = async () => {
    setLoadingInsights(true);
    const result = await analyzeSpendingHabits({ transactions, goals: savingGoals, budgets: budgetCategories, investments });
    setInsights(result);
    setLoadingInsights(false);
  };

  const handleGenerateReport = async () => {
    setLoadingReport(true);
    const result = await generateFinancialReport(
      { transactions, goals: savingGoals, budgets: budgetCategories, investments },
      user?.name || 'User'
    );
    setReport(result);
    setLoadingReport(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const result = await getFinancialAdvice(
      { transactions, goals: savingGoals, budgets: budgetCategories, investments },
      query
    );
    setResponse(result);
    setLoading(false);
  };

  // Find high priority goal
  const priorityGoal = savingGoals.sort((a, b) => a.priority - b.priority)[0];

  const suggestionChips = [
    priorityGoal 
      ? `Investment advice for '${priorityGoal.name}'?`
      : "How can I save more money?",
    "Review my current portfolio mix.",
    "Am I overspending in any category?",
    "Suggest a safe emergency fund plan."
  ];

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex border-b border-gray-200 no-print">
        <button 
          onClick={() => setActiveTab('insights')}
          className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 transition ${activeTab === 'insights' ? 'text-emerald-900 border-b-2 border-emerald-900 bg-gray-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
        >
          <TrendingUp size={18} /> Financial Insights
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 transition ${activeTab === 'reports' ? 'text-emerald-900 border-b-2 border-emerald-900 bg-gray-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
        >
          <FileText size={18} /> Reports
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 transition ${activeTab === 'chat' ? 'text-emerald-900 border-b-2 border-emerald-900 bg-gray-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
        >
          <Bot size={18} /> Ask Advisor
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
        {activeTab === 'insights' && (
          <div className="space-y-4">
            {loadingInsights ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <Sparkles className="animate-spin mb-3 text-emerald-600" size={32} />
                <p className="font-medium text-gray-500">Analyzing your financial DNA...</p>
              </div>
            ) : (
              <div className="prose prose-slate max-w-none">
                 <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl mb-6">
                    <h3 className="text-emerald-900 font-bold flex items-center gap-2 mt-0 text-lg">
                      <Sparkles className="text-emerald-700" size={20} /> AI Summary
                    </h3>
                    <div className="text-emerald-800 text-sm leading-relaxed">
                      {transactions.length > 0 ? "Based on your activity, here is your personalized wealth report." : "Start adding tasks and transactions to get a personalized report."}
                    </div>
                 </div>
                 <div className="text-gray-800 leading-relaxed">
                    <ReactMarkdown>{insights}</ReactMarkdown>
                 </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="h-full flex flex-col">
            {!report && !loadingReport ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-900">
                  <FileText size={40} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Generate Monthly Report</h3>
                  <p className="text-gray-500 mt-2 max-w-md mx-auto">
                    Create a formal financial health report summarizing your income, expenses, savings progress, and AI recommendations.
                  </p>
                </div>
                <button 
                  onClick={handleGenerateReport}
                  className="bg-emerald-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-emerald-950 transition"
                >
                  <Sparkles size={18} /> Generate Now
                </button>
              </div>
            ) : loadingReport ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Sparkles className="animate-spin mb-3 text-emerald-600" size={32} />
                <p className="font-medium text-gray-500">Compiling your financial data...</p>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-6 no-print">
                  <h3 className="font-bold text-gray-900 text-lg">Monthly Report</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleGenerateReport} 
                      className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
                    >
                      Regenerate
                    </button>
                    <button 
                      onClick={handlePrint}
                      className="bg-black text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-md hover:bg-gray-800 transition"
                    >
                      <Printer size={16} /> Print / PDF
                    </button>
                  </div>
                </div>
                
                {/* Print View Container */}
                <div className="bg-white p-8 md:p-12 shadow-lg border border-gray-200 print:shadow-none print:border-none print:p-0 mx-auto max-w-3xl">
                  <div className="mb-8 border-b border-gray-100 pb-6 flex justify-between items-start">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Health Report</h1>
                      <p className="text-gray-500">Prepared for <span className="font-bold text-gray-900">{user?.name}</span></p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400 font-bold uppercase tracking-wider">Date</div>
                      <div className="text-gray-900 font-medium">{new Date().toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div className="prose prose-slate max-w-none print:prose-sm">
                    <ReactMarkdown>{report}</ReactMarkdown>
                  </div>

                  <div className="mt-12 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
                    Generated by WealthWise AI • Confidential
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-6">
             {!response && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                 {suggestionChips.map((chip, idx) => (
                   <button 
                    key={idx}
                    onClick={() => setQuery(chip)}
                    className="text-left text-sm p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition text-gray-700 font-medium"
                   >
                     {chip}
                   </button>
                 ))}
               </div>
             )}

             {response && (
               <div className="flex gap-4 mb-6">
                 <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center shrink-0 shadow-md">
                   <Bot size={20} className="text-white" />
                 </div>
                 <div className="bg-white p-6 rounded-2xl rounded-tl-none shadow-sm border border-gray-200 text-gray-800 text-sm leading-7">
                   <ReactMarkdown>{response}</ReactMarkdown>
                 </div>
               </div>
             )}
             
             {loading && (
               <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center shrink-0">
                   <Bot size={20} className="text-white" />
                 </div>
                 <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none animate-pulse w-40 h-12"></div>
               </div>
             )}
          </div>
        )}
      </div>

      {activeTab === 'chat' && (
        <div className="p-4 bg-white border-t border-gray-200 no-print">
          <form onSubmit={handleAsk} className="flex gap-3">
            <input 
              type="text" 
              className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 outline-none text-sm transition"
              placeholder="Ask for advice on investments, savings..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-xl px-5 flex items-center justify-center transition shadow-lg"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Advisor;
