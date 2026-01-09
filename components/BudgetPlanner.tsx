import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Landmark, Check, AlertCircle, Edit3, DollarSign } from 'lucide-react';

const BudgetPlanner: React.FC = () => {
  const { monthlyIncome, setMonthlyIncome, budgetCategories, updateCategoryLimit } = useFinance();
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [tempIncome, setTempIncome] = useState(monthlyIncome.toString());
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempLimit, setTempLimit] = useState('');

  const totalAllocated = budgetCategories.reduce((sum, cat) => sum + cat.limit, 0);
  const remainingBudget = monthlyIncome - totalAllocated;
  const isOverBudget = remainingBudget < 0;

  const handleSaveIncome = () => {
    const val = parseFloat(tempIncome);
    if (!isNaN(val) && val >= 0) {
      setMonthlyIncome(val);
      setIsEditingIncome(false);
    }
  };

  const handleUpdateLimit = (id: string) => {
    const val = parseFloat(tempLimit);
    if (!isNaN(val) && val >= 0) {
      updateCategoryLimit(id, val);
      setEditingCategory(null);
    }
  };

  const startEditCategory = (id: string, currentLimit: number) => {
    setEditingCategory(id);
    setTempLimit(currentLimit.toString());
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <div className="bg-emerald-900 p-1.5 rounded-lg text-white">
            <Landmark size={20} />
          </div>
          Budget Planner
        </h2>
        <p className="text-gray-500 text-sm">Allocate your monthly income to expenses. Aim for a zero-based budget where every rupee has a job.</p>
      </div>

      {/* Income Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-700 uppercase tracking-wide text-xs">Monthly Income</h3>
          {!isEditingIncome && (
             <button onClick={() => { setTempIncome(monthlyIncome.toString()); setIsEditingIncome(true); }} className="text-emerald-900 hover:bg-emerald-50 p-1 rounded transition">
               <Edit3 size={16} />
             </button>
          )}
        </div>
        
        {isEditingIncome ? (
          <div className="flex gap-2">
             <input 
               type="number" 
               className="flex-1 text-3xl font-bold text-gray-900 border-b-2 border-emerald-900 focus:outline-none bg-transparent"
               value={tempIncome}
               onChange={e => setTempIncome(e.target.value)}
               autoFocus
             />
             <button onClick={handleSaveIncome} className="bg-emerald-900 text-white px-4 rounded-lg font-bold">
               <Check size={20} />
             </button>
          </div>
        ) : (
          <div className="text-3xl font-bold text-emerald-900">
             ₹{monthlyIncome.toLocaleString()}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-500 font-bold uppercase">Total Allocated</div>
            <div className="text-xl font-bold text-gray-900 mt-1">₹{totalAllocated.toLocaleString()}</div>
         </div>
         <div className={`p-4 rounded-xl border shadow-sm ${isOverBudget ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className={`text-xs font-bold uppercase ${isOverBudget ? 'text-red-700' : 'text-emerald-700'}`}>
              {isOverBudget ? 'Over Budget By' : 'Free Cash Flow'}
            </div>
            <div className={`text-xl font-bold mt-1 ${isOverBudget ? 'text-red-900' : 'text-emerald-900'}`}>
              ₹{Math.abs(remainingBudget).toLocaleString()}
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
               <div className="text-xs text-gray-500 font-bold uppercase">Budget Health</div>
               <div className={`text-sm font-bold mt-1 ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                 {isOverBudget ? 'Needs Attention' : 'Healthy'}
               </div>
            </div>
            {isOverBudget && <AlertCircle className="text-red-500" size={24} />}
            {!isOverBudget && <Check className="text-emerald-500" size={24} />}
         </div>
      </div>

      {/* Allocation List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-900">Expense Allocation</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {budgetCategories.map(cat => {
            const percentage = monthlyIncome > 0 ? (cat.limit / monthlyIncome) * 100 : 0;
            const isEditing = editingCategory === cat.id;

            return (
              <div key={cat.id} className="p-4 md:p-6 hover:bg-gray-50 transition">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-gray-900">{cat.name}</span>
                      <span className="text-xs font-bold text-gray-500">{percentage.toFixed(1)}% of Income</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-800 rounded-full" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 md:w-48 justify-end">
                    {isEditing ? (
                       <div className="flex items-center gap-2">
                         <span className="text-gray-400 font-bold">₹</span>
                         <input 
                           type="number" 
                           className="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 outline-none font-bold text-right"
                           value={tempLimit}
                           onChange={e => setTempLimit(e.target.value)}
                           autoFocus
                         />
                         <button onClick={() => handleUpdateLimit(cat.id)} className="bg-emerald-900 text-white p-2 rounded-lg">
                           <Check size={16} />
                         </button>
                       </div>
                    ) : (
                       <button 
                         onClick={() => startEditCategory(cat.id, cat.limit)}
                         className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 transition group"
                       >
                         <span className="font-bold text-gray-900 text-lg">₹{cat.limit.toLocaleString()}</span>
                         <Edit3 size={14} className="text-gray-400 group-hover:text-gray-900" />
                       </button>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Actual Spent: <span className="font-bold text-gray-700">₹{cat.spent.toLocaleString()}</span></span>
                  <span>Remaining: <span className={`font-bold ${cat.limit - cat.spent < 0 ? 'text-red-600' : 'text-emerald-600'}`}>₹{(cat.limit - cat.spent).toLocaleString()}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanner;
