import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Loader2, Check, MessageCircleQuestion, Wallet } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { processVoiceCommand } from '../services/gemini';

// Add type definition for webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const VoiceAssistant: React.FC = () => {
  const { addTransaction, budgetCategories, transactions, savingGoals, investments } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      // 'en-IN' works surprisingly well for Hinglish and mixed Tamil contexts in many browsers
      recognitionRef.current.lang = 'en-IN'; 

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setFeedback(null);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        await handleCommand(text);
      };

      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false);
        setFeedback({ type: 'error', message: 'Could not hear you. Please try again.' });
      };
    }
  }, []);

  const handleCommand = async (text: string) => {
    setIsProcessing(true);
    
    // Pass current data context for queries
    const contextData = {
      transactions,
      goals: savingGoals,
      budgets: budgetCategories,
      investments
    };

    const categoryNames = budgetCategories.map(b => b.name);
    
    const result = await processVoiceCommand(text, categoryNames, contextData);

    setIsProcessing(false);

    if (result.type === 'ADD_TRANSACTION') {
      addTransaction({
        amount: result.amount,
        description: result.description,
        category: result.category,
        source: 'Manual'
      });
      setFeedback({ 
        type: 'success', 
        message: `Added: ${result.description} (₹${result.amount})` 
      });
      // Auto close after success
      setTimeout(() => {
        setIsOpen(false);
        setFeedback(null);
        setTranscript('');
      }, 3000);

    } else if (result.type === 'QUERY') {
      setFeedback({
        type: 'info',
        message: result.answer
      });
    } else {
      setFeedback({
        type: 'error',
        message: "Sorry, I didn't catch that. Try saying 'I spent 100 on Food'."
      });
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!isOpen) setIsOpen(true);
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Mic start error", e);
      }
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={toggleListening}
        className="fixed bottom-24 right-4 md:bottom-10 md:right-10 w-14 h-14 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-105 transition-transform z-50 group"
        title="Voice Assistant"
      >
        <Mic size={24} className="group-hover:animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative flex flex-col items-center">
        <button 
          onClick={() => { setIsOpen(false); recognitionRef.current?.stop(); }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
        >
          <X size={20} />
        </button>

        <div className="mb-6 text-center">
          <h3 className="font-bold text-lg text-gray-900">Voice Assistant</h3>
          <p className="text-xs text-gray-500 mt-1">Supports English, Tamil & Hindi Mix</p>
        </div>

        {/* Visualizer / Status Icon */}
        <div className="relative w-24 h-24 flex items-center justify-center mb-6">
           {isProcessing ? (
             <div className="absolute inset-0 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
           ) : isListening ? (
             <>
               <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20 animate-ping"></span>
               <span className="absolute inline-flex h-20 w-20 rounded-full bg-emerald-400 opacity-30 animate-pulse"></span>
             </>
           ) : null}
           
           <button 
             onClick={toggleListening}
             className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-lg z-10 ${isListening ? 'bg-red-500 scale-110' : 'bg-emerald-900'}`}
           >
             {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <Mic size={28} />}
           </button>
        </div>

        {/* Transcript Area */}
        <div className="min-h-[60px] w-full text-center mb-4">
           {transcript ? (
             <p className="text-lg font-medium text-gray-800">"{transcript}"</p>
           ) : isListening ? (
             <p className="text-gray-400 animate-pulse">Listening...</p>
           ) : (
             <p className="text-gray-400 text-sm">Tap mic to speak<br/>"Spent 200 on Coffee"</p>
           )}
        </div>

        {/* Feedback / Result Area */}
        {feedback && (
          <div className={`w-full p-4 rounded-xl text-sm font-medium flex gap-3 items-start animate-in slide-in-from-bottom-2 ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 
            feedback.type === 'error' ? 'bg-red-50 text-red-800 border border-red-100' :
            'bg-blue-50 text-blue-800 border border-blue-100'
          }`}>
             <div className="shrink-0 mt-0.5">
               {feedback.type === 'success' && <Check size={16} />}
               {feedback.type === 'error' && <Wallet size={16} />}
               {feedback.type === 'info' && <MessageCircleQuestion size={16} />}
             </div>
             <div>{feedback.message}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;
