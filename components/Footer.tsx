import React from 'react';
import { SiteContent, Language } from '../types';
import { getTranslation } from '../translations';

interface FooterProps {
  onAdminClick: () => void;
  content: SiteContent;
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick, content, language }) => {
  const t = getTranslation(language);

  return (
    <footer className="bg-layen-dark text-white py-16" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 border-b border-gray-800 pb-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-3xl font-serif text-layen-gold mb-6 tracking-wider">{content.logoText}</h2>
            <p className="text-gray-400 font-light max-w-sm leading-relaxed">
              {language === 'ar' 
               ? 'نجلب أناقة الحلويات الفرنسية الأصيلة إلى لحظات فرحكم. مصنوعة بشغف، ومقدمة بحب.'
               : language === 'fr' 
               ? 'Apporter l\'élégance authentique de la pâtisserie française à vos moments de joie. Fait avec passion, livré avec amour.'
               : 'Bringing the authentic elegance of French patisserie to your moments of joy. Handcrafted with passion, delivered with love.'}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-sans font-medium uppercase tracking-widest text-white mb-6">{t.nav.contact}</h3>
            <ul className="space-y-4 text-gray-400 font-light text-sm">
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 flex items-center justify-center border border-gray-700 rounded-full text-xs">📞</span>
                {content.contactPhone}
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 flex items-center justify-center border border-gray-700 rounded-full text-xs">📍</span>
                Djerba, Tunisia
              </li>
            </ul>
          </div>

          <div>
             <h3 className="text-sm font-sans font-medium uppercase tracking-widest text-white mb-6">Social</h3>
             <a 
               href={content.facebookUrl} 
               target="_blank" 
               rel="noopener noreferrer"
               className="inline-flex items-center gap-2 text-gray-400 hover:text-layen-gold transition-colors"
             >
               Facebook <span className="text-xs">↗</span>
             </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 font-sans tracking-wide">
          <p>&copy; {new Date().getFullYear()} {content.logoText}. {t.footer.rights}</p>
          <div className="flex gap-4">
             <p>{t.footer.designed}</p>
             <button onClick={onAdminClick} className="hover:text-gray-400 transition-colors">Admin</button>
          </div>
        </div>
      </div>
    </footer>
  );
};