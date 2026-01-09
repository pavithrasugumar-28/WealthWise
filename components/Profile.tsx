import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { User, LogOut, Mail, Briefcase, Calendar, Save, Edit2, Wallet, CreditCard, Link, Check, Loader2, Lock, ShieldCheck, Smartphone, X } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, logout, updateProfile, totalBalance, setTotalBalance, investments, savingGoals, connectedAccounts, connectAccount, setupPin, removePin } = useFinance();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editOccupation, setEditOccupation] = useState(user?.occupation || '');
  
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [newBalance, setNewBalance] = useState(totalBalance.toString());

  // Connect Flow States
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectStep, setConnectStep] = useState(1); // 1: Input, 2: OTP, 3: Success
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Security Flow States
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');

  if (!user) return null;

  const handleSave = () => {
    updateProfile({ name: editName, occupation: editOccupation });
    setIsEditing(false);
  };

  const handleSaveBalance = () => {
    const bal = parseFloat(newBalance);
    if (!isNaN(bal)) {
      setTotalBalance(bal);
      setIsEditingBalance(false);
    }
  };

  const initiateGPayConnect = () => {
    setConnectStep(1);
    setShowConnectModal(true);
  };

  const handleSendOtp = () => {
    if (phoneNumber.length < 10) return;
    setIsConnecting(true);
    // Simulate server request
    setTimeout(() => {
        setIsConnecting(false);
        setConnectStep(2);
    }, 1500);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 4) return;
    setIsConnecting(true);
    await connectAccount('GPay', phoneNumber);
    setIsConnecting(false);
    setConnectStep(3);
    setTimeout(() => {
        setShowConnectModal(false);
    }, 2000);
  };

  const handleSetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if(newPin.length === 4) {
        setupPin(newPin);
        setShowPinModal(false);
        setNewPin('');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-3xl mx-auto pb-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="h-32 bg-emerald-900 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
              <div className="w-full h-full bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-900 text-2xl font-bold">
                {getInitials(user.name)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8 flex justify-between items-start">
          <div>
            {isEditing ? (
               <input 
                 value={editName}
                 onChange={e => setEditName(e.target.value)}
                 className="text-2xl font-bold text-gray-900 border-b border-gray-300 focus:border-emerald-600 outline-none"
               />
            ) : (
               <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            )}
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              <Mail size={14} /> {user.email}
            </p>
          </div>
          
          <button 
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${isEditing ? 'bg-emerald-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {isEditing ? <><Save size={16} /> Save Changes</> : <><Edit2 size={16} /> Edit Profile</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
         {/* Linked Accounts Section */}
         <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
           <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Link size={18} className="text-emerald-900" /> Linked Accounts
           </h3>
           <div className="space-y-4">
             {connectedAccounts.map(acc => (
               <div key={acc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 font-bold border border-gray-100">
                      G
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Google Pay</div>
                      <div className="text-xs text-gray-500">Linked • {acc.accountNumber}</div>
                    </div>
                  </div>
                  <div className="text-emerald-600 flex items-center gap-1 text-sm font-medium">
                    <Check size={16} /> Connected
                  </div>
               </div>
             ))}

             {connectedAccounts.length === 0 && (
               <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                 <p className="text-gray-500 text-sm mb-4">Connect your wallets to track expenses automatically.</p>
                 <button 
                   onClick={initiateGPayConnect}
                   className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition flex items-center gap-2 mx-auto"
                 >
                   <CreditCard size={16} /> Connect GPay
                 </button>
               </div>
             )}
           </div>
         </div>

         {/* Security Section */}
         <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
           <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-900" /> Security
           </h3>
           <div className="flex items-center justify-between">
              <div>
                  <div className="font-bold text-gray-900">App Lock (PIN)</div>
                  <div className="text-sm text-gray-500">Require a 4-digit PIN to open the application.</div>
              </div>
              <div>
                  {user.securityPin ? (
                      <button 
                        onClick={removePin}
                        className="text-red-600 text-sm font-bold hover:bg-red-50 px-3 py-1.5 rounded-lg transition border border-red-200"
                      >
                        Remove PIN
                      </button>
                  ) : (
                      <button 
                        onClick={() => setShowPinModal(true)}
                        className="text-emerald-900 text-sm font-bold hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition border border-emerald-200"
                      >
                        Setup PIN
                      </button>
                  )}
              </div>
           </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase size={18} className="text-emerald-900" /> Professional Info
          </h3>
          <div className="space-y-4">
             <div>
               <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Occupation</div>
               {isEditing ? (
                 <input 
                   value={editOccupation}
                   onChange={e => setEditOccupation(e.target.value)}
                   className="w-full p-2 bg-gray-50 border rounded-lg"
                 />
               ) : (
                 <div className="text-gray-900 font-medium">{user.occupation || 'Not specified'}</div>
               )}
             </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
           <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User size={18} className="text-emerald-900" /> Account Summary
          </h3>
          <div className="space-y-4">
             <div className="flex justify-between items-center py-2 border-b border-gray-50">
               <span className="text-gray-600">Current Balance</span>
               <div className="flex items-center gap-2">
                 {isEditingBalance ? (
                   <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        value={newBalance}
                        onChange={e => setNewBalance(e.target.value)}
                        className="w-24 p-1 bg-gray-50 border rounded text-right font-bold text-emerald-900"
                      />
                      <button onClick={handleSaveBalance} className="text-emerald-600"><Save size={16}/></button>
                   </div>
                 ) : (
                   <>
                      <span className="font-bold text-emerald-900">₹{totalBalance.toLocaleString()}</span>
                      <button onClick={() => { setNewBalance(totalBalance.toString()); setIsEditingBalance(true); }} className="text-gray-400 hover:text-emerald-900">
                        <Edit2 size={12} />
                      </button>
                   </>
                 )}
               </div>
             </div>
             <div className="flex justify-between items-center py-2">
               <span className="text-gray-600">Investments Count</span>
               <span className="font-bold text-gray-900">{investments.length}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={logout}
          className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl flex items-center gap-2 hover:bg-red-100 transition"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      {/* GPay Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-in zoom-in duration-200">
                <button onClick={() => setShowConnectModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
                    <X size={20} />
                </button>
                
                {connectStep === 1 && (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-white border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600 font-bold text-xl shadow-sm">G</div>
                            <h3 className="font-bold text-lg">Connect Google Pay</h3>
                            <p className="text-sm text-gray-500">Securely link your account to sync transactions.</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-3 text-gray-400" size={16} />
                                    <input 
                                        type="tel" 
                                        className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition"
                                        placeholder="9876543210"
                                        value={phoneNumber}
                                        onChange={e => setPhoneNumber(e.target.value)}
                                        maxLength={10}
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={handleSendOtp}
                                disabled={isConnecting || phoneNumber.length < 10}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex justify-center"
                            >
                                {isConnecting ? <Loader2 className="animate-spin" /> : "Verify & Connect"}
                            </button>
                            <p className="text-[10px] text-gray-400 text-center">
                                By connecting, you agree to share transaction metadata for expense tracking purposes only.
                            </p>
                        </div>
                    </>
                )}

                {connectStep === 2 && (
                    <>
                         <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600 font-bold shadow-sm">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="font-bold text-lg">Verification</h3>
                            <p className="text-sm text-gray-500">Enter the 4-digit OTP sent to {phoneNumber}</p>
                        </div>
                        <div className="space-y-6">
                             <input 
                                type="text" 
                                className="w-full text-center text-3xl tracking-[1em] font-bold p-2 border-b-2 border-gray-200 focus:border-blue-600 outline-none"
                                placeholder="0000"
                                maxLength={4}
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                             />
                             <button 
                                onClick={handleVerifyOtp}
                                disabled={isConnecting || otp.length < 4}
                                className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition disabled:opacity-50 flex justify-center"
                            >
                                {isConnecting ? <Loader2 className="animate-spin" /> : "Confirm OTP"}
                            </button>
                        </div>
                    </>
                )}

                {connectStep === 3 && (
                     <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 animate-in zoom-in duration-300">
                            <Check size={32} />
                        </div>
                        <h3 className="font-bold text-xl text-gray-900">Connected!</h3>
                        <p className="text-sm text-gray-500 mt-2">Your GPay transactions will now sync automatically.</p>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* PIN Setup Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-in zoom-in duration-200">
                 <button onClick={() => setShowPinModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
                    <X size={20} />
                </button>
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-900">
                        <Lock size={24} />
                    </div>
                    <h3 className="font-bold text-lg">Set Security PIN</h3>
                    <p className="text-sm text-gray-500">Create a 4-digit PIN to lock the app.</p>
                </div>
                <form onSubmit={handleSetPin}>
                    <input 
                        type="password" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        className="w-full text-center text-3xl tracking-[0.5em] font-bold p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-600 outline-none mb-6"
                        placeholder="••••"
                        value={newPin}
                        onChange={e => setNewPin(e.target.value)}
                        autoFocus
                    />
                     <button 
                        type="submit"
                        disabled={newPin.length !== 4}
                        className="w-full bg-emerald-900 text-white font-bold py-3 rounded-xl hover:bg-emerald-950 transition disabled:opacity-50"
                    >
                        Save PIN
                    </button>
                </form>
             </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
