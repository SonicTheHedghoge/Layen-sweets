import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Product, SiteContent, Language } from '../types';
import { getTranslation } from '../translations';

interface LayenAIProps {
  products: Product[];
  siteContent: SiteContent;
  language: Language;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const LayenAI: React.FC<LayenAIProps> = ({ products, siteContent, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = getTranslation(language);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      // Initialize Gemini
      // Assuming process.env.API_KEY is available as per request
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' }); 
      
      // Build Context (System Prompt)
      const availableProducts = products.filter(p => p.available).map(p => 
        `${p.name} (${p.category}): ${p.price} TND. ${p.description}. Ingredients: ${p.ingredients.join(', ')}.`
      ).join('\n');

      const systemPrompt = `
        You are "Layen AI", the sophisticated, elegant, and helpful virtual assistant for "Layen Sweets", a luxury macaron and pastry boutique in Djerba, Tunisia.
        
        Brand Tone: Elegant, warm, representing 'Excellence Tunisienne' (Tunisian Excellence), high-end, enthusiastic but refined.
        Current Language: ${language === 'fr' ? 'French' : language === 'ar' ? 'Arabic' : 'English'}.
        User Query: "${userMsg}"
        
        Store Information:
        - Phone: ${siteContent.contactPhone}
        - Facebook: ${siteContent.facebookUrl}
        - Location: Djerba, Tunisia
        - About: ${siteContent.aboutText}
        
        Menu (Prices in TND):
        ${availableProducts}
        
        Rules:
        1. Answer ONLY based on the store information provided.
        2. Be concise but charming.
        3. If asked about prices, be specific.
        4. ABSOLUTELY NO mention of admin passwords, backend code, or internal logic.
        5. If asked about something not in the menu, politely say we focus on our handcrafted specialties.
        6. Respond in the requested language (${language}).
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
            { role: 'user', parts: [{ text: systemPrompt }] }
        ],
      });

      const text = response.text || (language === 'ar' ? "عذراً، لا يمكنني الرد حالياً." : "Pardon, je ne peux pas répondre pour le moment.");
      
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: language === 'ar' ? "حدث خطأ في الاتصال." : "Une erreur de connexion est survenue." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-layen-gold text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 border border-white/20"
      >
        <span className="text-2xl">✨</span>
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-24 right-6 w-80 md:w-96 bg-white/95 backdrop-blur-xl border border-layen-gold/30 rounded-2xl shadow-2xl z-50 transition-all duration-300 origin-bottom-right flex flex-col overflow-hidden ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} style={{ height: '500px' }}>
        
        {/* Header */}
        <div className="bg-layen-dark p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-layen-gold to-yellow-200 flex items-center justify-center text-xs font-bold text-layen-dark">AI</div>
            <div>
              <h3 className="text-white font-serif text-lg leading-none">Layen AI</h3>
              <p className="text-gray-400 text-[10px] uppercase tracking-widest">Concierge</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-layen-cream/50">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 text-sm mt-10 px-4">
              <p className="mb-2">✨</p>
              {t.ai.welcome}
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-layen-dark text-white rounded-br-none' 
                  : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none shadow-sm">
                 <div className="flex gap-1">
                   <div className="w-2 h-2 bg-layen-gold rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-layen-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                   <div className="w-2 h-2 bg-layen-gold rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                 </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.ai.placeholder}
              className={`flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:border-layen-gold outline-none transition-colors ${language === 'ar' ? 'text-right' : 'text-left'}`}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 bg-layen-gold text-white rounded-full flex items-center justify-center hover:bg-layen-dark transition-colors disabled:opacity-50"
            >
              ➤
            </button>
          </div>
        </form>
      </div>
    </>
  );
};