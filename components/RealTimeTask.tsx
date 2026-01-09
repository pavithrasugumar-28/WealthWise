import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { ActiveTask } from '../types';
import { Plus, Check, AlertTriangle, ShoppingCart, ArrowLeft, Trash2 } from 'lucide-react';

interface Props {
  task: ActiveTask;
  onClose: () => void;
}

const RealTimeTask: React.FC<Props> = ({ task, onClose }) => {
  const { addItemToTask, completeTask } = useFinance();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const percentSpent = Math.min((task.spent / task.budget) * 100, 100);
  const isNearLimit = percentSpent >= 90;
  const isOverLimit = task.spent > task.budget;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    addItemToTask(task.id, parseFloat(amount), description);
    setAmount('');
    setDescription('');
  };

  const handleComplete = () => {
    if(window.confirm("Complete this task? Any unspent budget will be allocated to your #1 priority saving goal.")) {
      completeTask(task.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col h-full overflow-hidden animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-4 bg-black text-white flex justify-between items-center shadow-lg shrink-0 border-b border-gray-800">
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold flex items-center gap-2 tracking-wide">
          <span className="text-emerald-500"><ShoppingCart size={20} /></span>
          {task.name.toUpperCase()}
        </h2>
        <div className="w-10"></div> 
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
        {/* Budget Status Card */}
        <div className={`rounded-2xl p-8 mb-8 text-center transition-colors duration-300 shadow-xl ${isOverLimit ? 'bg-red-950/30 border border-red-900' : 'bg-gray-900 border border-gray-800'}`}>
          <div className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-2">Remaining Budget</div>
          <div className={`text-6xl font-bold mb-6 tracking-tighter ${isOverLimit ? 'text-red-500' : 'text-emerald-400'}`}>
            ₹{(task.budget - task.spent).toLocaleString()}
          </div>
          
          <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full transition-all duration-500 ${isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-orange-500' : 'bg-emerald-500'}`}
              style={{ width: `${percentSpent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-3 text-gray-500 font-mono">
            <span>SPENT: ₹{task.spent}</span>
            <span>LIMIT: ₹{task.budget}</span>
          </div>

          {(isNearLimit || isOverLimit) && (
            <div className="mt-6 flex items-center justify-center gap-2 text-orange-400 animate-pulse font-bold tracking-wide">
              <AlertTriangle size={20} />
              {isOverLimit ? "BUDGET EXCEEDED" : "APPROACHING LIMIT"}
            </div>
          )}
        </div>

        {/* Add Item Form */}
        <form onSubmit={handleAdd} className="flex gap-3 mb-8">
          <input 
            type="text" 
            placeholder="Item name" 
            className="flex-1 bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-4 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none placeholder-gray-600 transition"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input 
            type="number" 
            placeholder="Amt" 
            className="w-24 bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-4 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none placeholder-gray-600 transition text-center"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-5 py-4 flex items-center justify-center shadow-lg shadow-emerald-900/50 transition">
            <Plus size={24} />
          </button>
        </form>

        {/* List */}
        <div className="space-y-3">
          {task.items.slice().reverse().map((item) => (
            <div key={item.id} className="bg-gray-900 p-4 rounded-xl flex justify-between items-center border border-gray-800">
              <span className="text-gray-200 font-medium">{item.description}</span>
              <span className="text-white font-bold font-mono">-₹{item.amount}</span>
            </div>
          ))}
          {task.items.length === 0 && (
            <div className="text-center text-gray-700 py-12 border-2 border-dashed border-gray-800 rounded-xl">
              <ShoppingCart className="mx-auto mb-2 opacity-20" size={48} />
              <p>No items added yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-gray-900 border-t border-gray-800 shrink-0">
        <button 
          onClick={handleComplete}
          className="w-full bg-white hover:bg-gray-100 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg"
        >
          <Check size={20} />
          FINISH & ALLOCATE EXCESS
        </button>
      </div>
    </div>
  );
};

export default RealTimeTask;