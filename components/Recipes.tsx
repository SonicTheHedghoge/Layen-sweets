import React, { useState, useEffect } from 'react';
import { Recipe, Language, SiteContent } from '../types';
import { dataService } from '../services/dataService';
import { FadeIn } from './FadeIn';
import { getTranslation } from '../translations';

interface RecipesProps {
  language: Language;
  content: SiteContent;
}

export const Recipes: React.FC<RecipesProps> = ({ language, content }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const t = getTranslation(language);

  useEffect(() => {
    const load = async () => {
      const data = await dataService.getRecipes();
      setRecipes(data);
    };
    load();
  }, []);

  return (
    <section className="py-24 bg-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-6">
        <FadeIn>
          <h2 className="text-4xl font-serif text-center text-layen-dark mb-16">{t.recipes.title}</h2>
        </FadeIn>
        
        <div className="grid md:grid-cols-2 gap-12">
          {recipes.map((recipe, idx) => (
             <FadeIn key={recipe.id} delay={idx * 200}>
               <article className="flex flex-col h-full group cursor-pointer">
                 <div className="overflow-hidden rounded-xl mb-6">
                   <img 
                     src={recipe.image} 
                     alt={recipe.title} 
                     className="w-full h-80 object-cover transform group-hover:scale-105 transition-transform duration-700"
                   />
                 </div>
                 <h3 className="text-2xl font-serif text-layen-dark mb-3 group-hover:text-layen-gold transition-colors">{recipe.title}</h3>
                 <p className="text-gray-600 font-light leading-relaxed line-clamp-3 mb-4">{recipe.content}</p>
                 <span className="text-xs uppercase tracking-widest text-layen-gold border-b border-layen-gold w-fit pb-1">{t.recipes.readStory}</span>
               </article>
             </FadeIn>
          ))}
          
          <FadeIn delay={200}>
             <article className="flex flex-col h-full bg-layen-cream p-8 rounded-xl items-center justify-center text-center border border-dashed border-gray-300">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                 <span className="text-2xl">✨</span>
               </div>
               <h3 className="text-xl font-serif text-layen-dark mb-2">{t.recipes.secretTitle}</h3>
               <p className="text-gray-500 font-light mb-6">"{content.chefQuote}"</p>
               <span className="font-serif italic text-layen-gold">- Chef Layen</span>
             </article>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};