import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Wallet, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useFinance();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [occupation, setOccupation] = useState('');
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      login(name, email, occupation || 'Not Specified');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-900 text-white rounded-2xl mb-4 shadow-xl shadow-emerald-900/20">
            <Wallet size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">WealthWise</h1>
          <p className="text-gray-500">Your personal AI financial architect</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 animate-in zoom-in duration-300">
          <form onSubmit={handleSubmit}>
             <div className="space-y-6">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                 <input 
                   type="text" 
                   required
                   className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 outline-none transition font-medium"
                   placeholder="e.g. John Doe"
                   value={name}
                   onChange={e => setName(e.target.value)}
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                 <input 
                   type="email" 
                   required
                   className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 outline-none transition font-medium"
                   placeholder="john@example.com"
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                 />
               </div>

               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Occupation (Optional)</label>
                 <input 
                   type="text" 
                   className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 outline-none transition font-medium"
                   placeholder="e.g. Software Engineer"
                   value={occupation}
                   onChange={e => setOccupation(e.target.value)}
                 />
               </div>

               <button 
                 type="submit" 
                 className="w-full py-4 bg-emerald-900 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 hover:bg-emerald-950 transition flex items-center justify-center gap-2 group"
               >
                 Start My Journey <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
               </button>
             </div>
          </form>
          
          <div className="mt-8 text-center text-xs text-gray-400">
            By continuing, you agree to WealthWise Terms & Conditions.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
