import React from 'react';
import { SiteContent, Language } from '../types';
import { getTranslation } from '../translations';

interface HeroProps {
  onOrder: () => void;
  content: SiteContent;
  language: Language;
}

export const Hero: React.FC<HeroProps> = ({ onOrder, content, language }) => {
  const t = getTranslation(language);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-layen-pink/30 to-layen-cream" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Decorative Circles */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-pink-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-yellow-50 rounded-full blur-3xl opacity-60 translate-y-1/3 -translate-x-1/4"></div>

      <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
        
        <div className={`text-center pt-20 md:pt-0 ${language === 'ar' ? 'md:text-right' : 'md:text-left'}`}>
          <h2 className="text-layen-gold text-sm tracking-[0.3em] uppercase mb-4 animate-fade-in">{content.heroSubtitle}</h2>
          <h1 className="text-5xl md:text-7xl font-serif text-layen-dark leading-tight mb-8 animate-fade-in-up whitespace-pre-line">
            {content.heroTitle}
          </h1>
          <p className="text-gray-600 text-lg mb-10 font-sans font-light max-w-md mx-auto md:mx-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {language === 'ar' 
              ? 'جرب القرمشة الرقيقة والغاناش الذائب في الماكرون المصنوع يدوياً. متعة فاخرة لحواسك.' 
              : language === 'fr' 
              ? 'Découvrez le croquant délicat et la ganache fondante de nos macarons artisanaux. Un luxe pour vos sens.'
              : 'Experience the delicate crunch and melting ganache of our artisanal macarons. A luxury treat for your senses.'}
          </p>
          <div className={`flex flex-col md:flex-row gap-4 justify-center animate-fade-in-up ${language === 'ar' ? 'md:justify-start' : 'md:justify-start'}`} style={{ animationDelay: '0.4s' }}>
            <button 
              onClick={onOrder}
              className="px-8 py-4 bg-layen-dark text-white rounded-full hover:bg-layen-gold transition-all duration-300 shadow-lg hover:shadow-xl text-sm tracking-widest uppercase"
            >
              {content.heroButtonText}
            </button>
            <button className="px-8 py-4 border border-layen-dark text-layen-dark rounded-full hover:bg-white hover:border-white transition-all duration-300 text-sm tracking-widest uppercase">
              {t.hero.discover}
            </button>
          </div>
        </div>

        <div className="relative h-[50vh] md:h-[80vh] flex items-center justify-center animate-float">
          <div className="relative w-full h-full flex items-center justify-center">
             {/* If video exists, show video, else show stack of images */}
             {content.heroVideo ? (
               <div className="rounded-full overflow-hidden w-64 h-64 md:w-96 md:h-96 border-8 border-white shadow-2xl z-20">
                 <video 
                   src={content.heroVideo} 
                   autoPlay 
                   muted 
                   loop 
                   playsInline 
                   className="w-full h-full object-cover"
                 />
               </div>
             ) : (
               <>
                 <img 
                   src={content.heroImage} 
                   alt="Main Macaron"
                   className="absolute w-48 h-48 md:w-64 md:h-64 object-cover rounded-full shadow-2xl z-20 border-4 border-white"
                 />
                 {/* Decorative background macarons (Editable) */}
                 <img 
                   src={content.heroImage2} 
                   alt="Decorative 1"
                   className="absolute w-32 h-32 md:w-48 md:h-48 object-cover rounded-full shadow-xl -top-4 -left-4 md:-left-12 z-10 border-4 border-white opacity-90"
                 />
                 <img 
                   src={content.heroImage3} 
                   alt="Decorative 2"
                   className="absolute w-40 h-40 md:w-56 md:h-56 object-cover rounded-full shadow-xl -bottom-8 -right-4 md:right-0 z-30 border-4 border-white"
                 />
               </>
             )}
          </div>
        </div>
      </div>
    </section>
  );
};