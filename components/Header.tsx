import React, { useState, useEffect } from 'react';
import { ViewState, Language } from '../types';
import { getTranslation } from '../translations';

interface HeaderProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  logoText: string;
  logoImage: string;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onChangeView, logoText, logoImage, language, setLanguage }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = getTranslation(language);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { label: string; value: ViewState }[] = [
    { label: t.nav.home, value: 'HOME' },
    { label: t.nav.about, value: 'ABOUT' },
    { label: t.nav.gallery, value: 'GALLERY' },
    { label: t.nav.order, value: 'ORDER' },
    { label: t.nav.recipes, value: 'RECIPES' },
  ];

  const langs: Language[] = ['fr', 'en', 'ar'];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div 
          className="cursor-pointer flex items-center gap-2"
          onClick={() => onChangeView('HOME')}
        >
          {logoImage ? (
            <img src={logoImage} alt={logoText} className="h-12 w-auto object-contain" />
          ) : (
            <div className="text-2xl font-serif font-bold tracking-widest text-layen-dark">
              <span className="text-layen-gold text-3xl">{logoText.charAt(0)}</span>{logoText.slice(1)}
            </div>
          )}
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          {navItems.map((item) => (
            <button
              key={item.value}
              onClick={() => onChangeView(item.value)}
              className={`text-sm tracking-widest uppercase transition-colors duration-300 font-sans ${currentView === item.value ? 'text-layen-gold font-medium' : 'text-gray-600 hover:text-layen-gold'}`}
            >
              {item.label}
            </button>
          ))}
          <button 
            onClick={() => onChangeView('CONTACT')}
            className="px-6 py-2 border border-layen-gold text-layen-gold rounded-full hover:bg-layen-gold hover:text-white transition-all duration-300 text-xs tracking-widest uppercase"
          >
            {t.nav.contact}
          </button>
          
          {/* Language Switcher */}
          <div className="flex gap-2 border-l border-gray-300 pl-4">
            {langs.map((l) => (
              <button 
                key={l} 
                onClick={() => setLanguage(l)} 
                className={`text-xs uppercase font-bold ${language === l ? 'text-layen-gold' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-layen-dark" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden absolute w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="flex flex-col items-center py-8 gap-6">
          {navItems.map((item) => (
            <button
              key={item.value}
              onClick={() => { onChangeView(item.value); setMenuOpen(false); }}
              className="text-lg font-serif text-gray-800"
            >
              {item.label}
            </button>
          ))}
          
           {/* Mobile Language Switcher */}
          <div className="flex gap-4 mt-2">
            {langs.map((l) => (
              <button 
                key={l} 
                onClick={() => { setLanguage(l); setMenuOpen(false); }} 
                className={`text-sm uppercase font-bold ${language === l ? 'text-layen-gold' : 'text-gray-400'}`}
              >
                {l}
              </button>
            ))}
          </div>

          <button 
             onClick={() => { onChangeView('ADMIN'); setMenuOpen(false); }}
             className="text-xs text-gray-400 mt-4"
          >
            {t.nav.admin}
          </button>
        </div>
      </div>
    </nav>
  );
};