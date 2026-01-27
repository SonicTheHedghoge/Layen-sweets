import React from 'react';
import { FadeIn } from './FadeIn';
import { SiteContent, Language } from '../types';
import { getTranslation } from '../translations';

interface AboutProps {
  content: SiteContent;
  language: Language;
}

export const About: React.FC<AboutProps> = ({ content, language }) => {
  const t = getTranslation(language);

  return (
    <section className="py-24 bg-white relative overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <div className="relative">
              <div className="absolute inset-0 bg-layen-gold/10 transform translate-x-4 translate-y-4 rounded-sm"></div>
              <img 
                src={content.aboutImage}
                alt="About Layen Sweets" 
                className="relative z-10 w-full h-[600px] object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </FadeIn>
          
          <div className="space-y-8">
            <FadeIn delay={200}>
              <h3 className="text-layen-gold text-sm tracking-[0.3em] uppercase">{t.about.story}</h3>
              <h2 className="text-4xl md:text-5xl font-serif text-layen-dark mt-4">{content.aboutTitle}</h2>
            </FadeIn>
            
            <FadeIn delay={400}>
              <p className="text-gray-600 font-light leading-relaxed text-lg whitespace-pre-line">
                {content.aboutText}
              </p>
            </FadeIn>

            <FadeIn delay={600}>
              <div className="flex gap-12 pt-8 border-t border-gray-100">
                <div>
                  <span className="block text-3xl font-serif text-layen-gold">100%</span>
                  <span className="text-xs uppercase tracking-widest text-gray-500">{t.about.handmade}</span>
                </div>
                <div>
                  <span className="block text-3xl font-serif text-layen-gold">20+</span>
                  <span className="text-xs uppercase tracking-widest text-gray-500">{t.about.flavors}</span>
                </div>
                <div>
                  <span className="block text-3xl font-serif text-layen-gold">0%</span>
                  <span className="text-xs uppercase tracking-widest text-gray-500">{t.about.preservatives}</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
};