import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Target, ChevronUp, ChevronDown, Plus, ShieldAlert } from 'lucide-react';

const Savings: React.FC = () => {
  const { savingGoals, addSavingGoal, reorderGoalPriority, allocateFundsToGoal } = useFinance();
  const [showAdd, setShowAdd] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalType, setNewGoalType] = useState<'general' | 'emergency'>('general');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalName && newGoalTarget) {
      addSavingGoal({
        name: newGoalName,
        targetAmount: parseFloat(newGoalTarget),
        priority: savingGoals.length + 1,
        type: newGoalType
      });
      setShowAdd(false);
      setNewGoalName('');
      setNewGoalTarget('');
    }
  };

  const sortedGoals = [...savingGoals].sort((a, b) => a.priority - b.priority);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Saving Goals</h2>
          <p className="text-gray-500 text-sm mt-1">Prioritize your dreams. Excess funds cascade from top to bottom.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-black text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition shadow-lg"
        >
          <Plus size={18} /> New Goal
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Goal Name</label>
              <input 
                type="text" 
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 outline-none transition"
                value={newGoalName}
                onChange={e => setNewGoalName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Target Amount (₹)</label>
              <input 
                type="number" 
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 outline-none transition"
                value={newGoalTarget}
                onChange={e => setNewGoalTarget(e.target.value)}
              />
            </div>
          </div>
          <div className="mb-6">
             <label className="block text-sm font-bold text-gray-700 mb-3">Goal Type</label>
             <div className="flex gap-6">
               <label className="flex items-center gap-2 cursor-pointer group">
                 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${newGoalType === 'general' ? 'border-emerald-900' : 'border-gray-300'}`}>
                    {newGoalType === 'general' && <div className="w-2.5 h-2.5 bg-emerald-900 rounded-full" />}
                 </div>
                 <input 
                   type="radio" 
                   name="gtype" 
                   className="hidden"
                   checked={newGoalType === 'general'} 
                   onChange={() => setNewGoalType('general')}
                 />
                 <span className="text-gray-700 group-hover:text-black">General</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer group">
                 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${newGoalType === 'emergency' ? 'border-emerald-900' : 'border-gray-300'}`}>
                    {newGoalType === 'emergency' && <div className="w-2.5 h-2.5 bg-emerald-900 rounded-full" />}
                 </div>
                 <input 
                   type="radio" 
                   name="gtype" 
                   className="hidden"
                   checked={newGoalType === 'emergency'} 
                   onChange={() => setNewGoalType('emergency')}
                 />
                 <span className="text-gray-700 group-hover:text-black">Emergency Fund</span>
               </label>
             </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setShowAdd(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-emerald-900 text-white rounded-lg hover:bg-emerald-950 font-bold shadow-md">Create Goal</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {sortedGoals.map((goal, index) => (
          <div key={goal.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative group overflow-hidden transition hover:shadow-md">
            {goal.type === 'emergency' && (
              <div className="absolute top-0 right-0 bg-red-50 text-red-700 text-xs font-bold px-3 py-1.5 rounded-bl-xl flex items-center gap-1">
                <ShieldAlert size={14} /> Emergency Fund
              </div>
            )}
            
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-1.5 w-10">
                   {index > 0 && (
                     <button onClick={() => reorderGoalPriority(goal.id, 'up')} className="text-gray-400 hover:text-black transition">
                       <ChevronUp size={16} />
                     </button>
                   )}
                   <span className="text-xs font-black text-gray-700 my-0.5">{goal.priority}</span>
                   {index < sortedGoals.length - 1 && (
                     <button onClick={() => reorderGoalPriority(goal.id, 'down')} className="text-gray-400 hover:text-black transition">
                       <ChevronDown size={16} />
                     </button>
                   )}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">{goal.name}</h3>
                  <p className="text-sm text-gray-500 font-medium mt-0.5">Target: ₹{goal.targetAmount.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-900">₹{goal.currentAmount.toLocaleString()}</div>
                <div className="text-xs text-emerald-700 font-bold uppercase tracking-wider mt-1">Saved So Far</div>
              </div>
            </div>

            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div 
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${goal.currentAmount >= goal.targetAmount ? 'bg-emerald-500' : 'bg-emerald-900'}`}
                style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center text-xs font-medium text-gray-500">
              <span className="text-gray-900">{Math.round((goal.currentAmount / goal.targetAmount) * 100)}% COMPLETE</span>
              {index === 0 && <span className="text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded">
                <Target size={14} /> HIGHEST PRIORITY
              </span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Savings;