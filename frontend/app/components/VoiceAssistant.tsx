"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Volume2, X, MessageSquare, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("Namaste! Main SahayakAI hoon. Aapki kya madad kar sakta hoon?");
  const [language, setLanguage] = useState<'hi-IN' | 'en-IN'>('hi-IN');
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          setTranscript(transcriptText);
          handleVoiceCommand(transcriptText);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
      
      synthesisRef.current = window.speechSynthesis;
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'hi-IN' ? 'en-IN' : 'hi-IN');
    setResponse(language === 'hi-IN' ? "Hello! I am SahayakAI. How can I help you?" : "Namaste! Main SahayakAI hoon. Aapki kya madad kar sakta hoon?");
  };

  function speak(text: string) {
    if (synthesisRef.current) {
      synthesisRef.current.cancel(); // stop current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      // Try to find a specific voice for the language if possible
      const voices = synthesisRef.current.getVoices();
      const voice = voices.find(v => v.lang.includes(language.split('-')[0]));
      if (voice) {
        utterance.voice = voice;
      }
      synthesisRef.current.speak(utterance);
    }
  };

  function handleVoiceCommand(text: string) {
    const lowerText = text.toLowerCase();
    let reply = "";

    // Simple simulated AI logic
    if (language === 'hi-IN') {
      if (lowerText.includes("yojna") || lowerText.includes("scheme")) {
        reply = "Aapke liye PM Kisan Samman Nidhi aur Ayushman Bharat yojna upalabdh hain. Yojna page par check karein.";
      } else if (lowerText.includes("document") || lowerText.includes("kagaz")) {
        reply = "Aapko Aadhaar card aur Income certificate ki zaroorat padegi.";
      } else {
        reply = "Maaf kijiye, main theek se samajh nahi paya. Kripya dobara bolein.";
      }
    } else {
      if (lowerText.includes("scheme") || lowerText.includes("yojna")) {
        reply = "You are eligible for PM Kisan and Ayushman Bharat. Please check the schemes page.";
      } else if (lowerText.includes("document")) {
        reply = "You will need your Aadhaar card and Income certificate.";
      } else {
        reply = "Sorry, I didn't catch that. Could you please repeat?";
      }
    }

    setResponse(reply);
    speak(reply);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.lang = language;
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript("...");
        setResponse("Sun raha hoon... (Listening...)");
      } else {
        setResponse("Aapke browser mein voice support nahi hai.");
      }
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-primary/90 transition-transform hover:scale-105"
      >
        <Volume2 className="w-6 h-6" />
      </button>

      {/* Voice Assistant Modal/Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-[350px] bg-background border border-primary/20 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary/10 p-4 flex justify-between items-center border-b border-primary/10">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-primary">Sahayak Voice</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={toggleLanguage} className="p-1.5 hover:bg-primary/20 rounded-lg text-primary flex items-center text-xs font-bold" title="Change Language">
                  <Globe className="w-4 h-4 mr-1" />
                  {language === 'hi-IN' ? 'HI' : language === 'en-IN' ? 'EN' : 'MR'}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-primary/20 rounded-lg text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="p-6 space-y-6 min-h-[250px] flex flex-col justify-end">
              
              {/* User Transcript */}
              {transcript && transcript !== "..." && (
                <div className="flex justify-end">
                  <div className="bg-primary text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] text-sm">
                    {transcript}
                  </div>
                </div>
              )}

              {/* AI Response */}
              <div className="flex justify-start">
                <div className="bg-secondary/50 border border-primary/10 px-4 py-3 rounded-2xl rounded-tl-sm max-w-[85%] text-sm flex items-start space-x-2 shadow-sm">
                  <MessageSquare className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span className="font-medium">{response}</span>
                </div>
              </div>

            </div>

            {/* Mic Control */}
            <div className="p-4 border-t border-primary/10 flex justify-center bg-background">
              <button
                onClick={toggleListening}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isListening 
                    ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]" 
                    : "bg-primary text-white shadow-lg hover:scale-105"
                }`}
              >
                {isListening ? (
                  <>
                    <Mic className="w-7 h-7" />
                    <span className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-75"></span>
                  </>
                ) : (
                  <Mic className="w-7 h-7" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
