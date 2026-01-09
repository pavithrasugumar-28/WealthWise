import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { LayoutDashboard, Target, ShoppingCart, MessageSquareMore, Plus, Wallet, Briefcase, Play, X, ChevronRight, User, Landmark } from 'lucide-react';
import Dashboard from './components/Dashboard';
import RealTimeTask from './components/RealTimeTask';
import Savings from './components/Savings';
import Advisor from './components/Advisor';
import Investments from './components/Investments';
import Login from './components/Login';
import Profile from './components/Profile';
import SecurityLock from './components/SecurityLock';
import BudgetPlanner from './components/BudgetPlanner';
import VoiceAssistant from './components/VoiceAssistant';

const AppContent: React.FC = () => {
  const { activeTasks, createActiveTask, user, isAppLocked } = useFinance();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTasksList, setShowTasksList] = useState(false); // Mobile task menu
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskBudget, setNewTaskBudget] = useState('');
  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);

  // Auth Guard
  if (!user) {
    return <Login />;
  }

  // Security Lock Guard
  if (isAppLocked) {
    return <SecurityLock />;
  }

  const activeTasksList = activeTasks.filter(t => t.status === 'active');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskName && newTaskBudget) {
      createActiveTask(newTaskName, parseFloat(newTaskBudget));
      setShowTaskModal(false);
      setNewTaskName('');
      setNewTaskBudget('');
    }
  };

  const handleOpenTask = (taskId: string) => {
    setViewingTaskId(taskId);
    setShowTasksList(false); // Close mobile menu if open
  };

  if (viewingTaskId) {
    const task = activeTasks.find(t => t.id === viewingTaskId);
    if (task) {
      return <RealTimeTask task={task} onClose={() => setViewingTaskId(null)} />;
    } else {
      setViewingTaskId(null);
    }
  }

  const handleMobileFabClick = () => {
    if (activeTasksList.length > 0) {
      setShowTasksList(true);
    } else {
      setShowTaskModal(true);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-white flex text-gray-900">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-50 border-r border-gray-200 fixed h-full z-10">
        <div className="p-6 flex items-center gap-2 text-emerald-900 mb-6">
          <div className="bg-emerald-900 text-white p-1.5 rounded-lg">
            <Wallet size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">WealthWise</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'dashboard' ? 'bg-white text-emerald-900 shadow-sm border border-gray-100 font-semibold' : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-900'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('budget')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'budget' ? 'bg-white text-emerald-900 shadow-sm border border-gray-100 font-semibold' : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-900'}`}
          >
            <Landmark size={20} /> Budget Planner
          </button>
          <button 
            onClick={() => setActiveTab('savings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'savings' ? 'bg-white text-emerald-900 shadow-sm border border-gray-100 font-semibold' : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-900'}`}
          >
            <Target size={20} /> Savings Goals
          </button>
          <button 
            onClick={() => setActiveTab('investments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'investments' ? 'bg-white text-emerald-900 shadow-sm border border-gray-100 font-semibold' : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-900'}`}
          >
            <Briefcase size={20} /> Investments
          </button>
          <button 
            onClick={() => setActiveTab('advisor')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'advisor' ? 'bg-white text-emerald-900 shadow-sm border border-gray-100 font-semibold' : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-900'}`}
          >
            <MessageSquareMore size={20} /> AI Advisor
          </button>
        </nav>

        {/* User & Tasks Section */}
        <div className="flex flex-col gap-0 border-t border-gray-200">
           {/* Active Tasks Mini List */}
           <div className="p-4 bg-gray-50">
             <div className="flex justify-between items-center mb-3">
               <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Tasks</span>
               <button 
                 onClick={() => setShowTaskModal(true)} 
                 className="text-emerald-800 hover:bg-emerald-100 p-1.5 rounded-lg transition"
                 title="Start new task"
               >
                 <Plus size={16} />
               </button>
             </div>
             
             <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
               {activeTasksList.length === 0 && (
                 <div className="text-xs text-gray-400 italic text-center py-2 bg-gray-100/50 rounded-lg">No active tasks</div>
               )}
               
               {activeTasksList.map(task => (
                 <div key={task.id} className="bg-white border border-gray-200 p-2 rounded-lg shadow-sm flex justify-between items-center group hover:border-emerald-300 transition">
                    <div className="min-w-0 flex-1 mr-2">
                         <div className="font-bold text-xs text-gray-900 truncate">{task.name}</div>
                    </div>
                    <button 
                      onClick={() => handleOpenTask(task.id)} 
                      className="bg-gray-50 text-emerald-900 p-1.5 rounded-md hover:bg-emerald-900 hover:text-white transition"
                    >
                        <Play size={10} fill="currentColor" />
                    </button>
                 </div>
               ))}
             </div>
           </div>

           {/* User Profile Mini Tab */}
           <button 
             onClick={() => setActiveTab('profile')}
             className={`p-4 flex items-center gap-3 border-t border-gray-200 hover:bg-white transition text-left group ${activeTab === 'profile' ? 'bg-white' : ''}`}
           >
             <div className="w-10 h-10 rounded-full bg-emerald-900 text-white flex items-center justify-center font-bold text-sm">
               {getInitials(user.name)}
             </div>
             <div className="flex-1 min-w-0">
               <div className="font-bold text-sm text-gray-900 truncate group-hover:text-emerald-900">{user.name}</div>
               <div className="text-xs text-gray-500 truncate">View Profile</div>
             </div>
           </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-40 flex justify-around py-3 px-2">
        <button onClick={() => setActiveTab('dashboard')} className={`p-2 rounded-xl ${activeTab === 'dashboard' ? 'text-emerald-900 bg-emerald-50' : 'text-gray-400'}`}>
          <LayoutDashboard size={24} />
        </button>
        <button onClick={() => setActiveTab('budget')} className={`p-2 rounded-xl ${activeTab === 'budget' ? 'text-emerald-900 bg-emerald-50' : 'text-gray-400'}`}>
          <Landmark size={24} />
        </button>
        <div className="relative -top-6">
           <button 
             onClick={handleMobileFabClick}
             className="bg-emerald-900 text-white p-4 rounded-full shadow-xl hover:bg-emerald-950 transition active:scale-95 flex items-center justify-center"
           >
             {activeTasksList.length > 0 ? (
               <div className="relative">
                 <ShoppingCart size={24} />
                 <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-emerald-900">
                   {activeTasksList.length}
                 </span>
               </div>
             ) : (
               <Plus size={24} />
             )}
           </button>
        </div>
        <button onClick={() => setActiveTab('investments')} className={`p-2 rounded-xl ${activeTab === 'investments' ? 'text-emerald-900 bg-emerald-50' : 'text-gray-400'}`}>
          <Briefcase size={24} />
        </button>
        <button onClick={() => setActiveTab('profile')} className={`p-2 rounded-xl ${activeTab === 'profile' ? 'text-emerald-900 bg-emerald-50' : 'text-gray-400'}`}>
          <User size={24} />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-10 mb-20 md:mb-0 max-w-7xl mx-auto w-full bg-white">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6">
           <div className="flex items-center gap-2 text-emerald-900">
             <div className="bg-emerald-900 text-white p-1 rounded-lg">
                <Wallet size={20} />
             </div>
             <span className="font-bold text-lg text-gray-900">WealthWise</span>
           </div>
           {/* Mobile Profile Icon Header */}
            <button onClick={() => setActiveTab('profile')} className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs">
               {getInitials(user.name)}
            </button>
        </div>

        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'budget' && <BudgetPlanner />}
        {activeTab === 'savings' && <Savings />}
        {activeTab === 'investments' && <Investments />}
        {activeTab === 'advisor' && <Advisor />}
        {activeTab === 'profile' && <Profile />}
      </main>

      {/* Voice Assistant */}
      <VoiceAssistant />

      {/* New Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200 relative">
            <button onClick={() => setShowTaskModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
              <X size={20} />
            </button>
            <div className="mb-6">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Start Shopping Trip</h2>
              <p className="text-gray-500 mt-1">Track expenses in real-time against a budget.</p>
            </div>
            
            <form onSubmit={handleCreateTask}>
              <div className="space-y-5 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Task Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Weekly Groceries" 
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Budget Limit (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input 
                      type="number" 
                      placeholder="5000" 
                      className="w-full pl-8 p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition"
                      value={newTaskBudget}
                      onChange={(e) => setNewTaskBudget(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 py-3.5 text-gray-700 font-bold hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3.5 bg-emerald-900 text-white font-bold hover:bg-emerald-950 rounded-xl shadow-lg shadow-emerald-900/20 transition"
                >
                  Start Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Tasks List Modal */}
      {showTasksList && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-10 md:zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Active Tasks</h2>
              <button onClick={() => setShowTasksList(false)} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3 mb-6 max-h-[60vh] overflow-y-auto">
              {activeTasksList.map(task => (
                <button 
                  key={task.id}
                  onClick={() => handleOpenTask(task.id)}
                  className="w-full bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex justify-between items-center active:bg-gray-50 transition hover:border-emerald-500 group"
                >
                  <div className="text-left">
                    <div className="font-bold text-gray-900 group-hover:text-emerald-900 transition">{task.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Spent: <span className="font-medium text-gray-900">₹{task.spent}</span> / ₹{task.budget}
                    </div>
                    <div className="mt-2 h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600 rounded-full" 
                        style={{ width: `${Math.min((task.spent / task.budget) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-emerald-900 bg-emerald-50 p-3 rounded-full group-hover:bg-emerald-900 group-hover:text-white transition">
                    <ChevronRight size={20} />
                  </div>
                </button>
              ))}
            </div>

            <button 
              onClick={() => { setShowTasksList(false); setShowTaskModal(true); }}
              className="w-full py-4 bg-black text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-900 transition shadow-lg"
            >
              <Plus size={20} /> Start New Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
};

export default App;
