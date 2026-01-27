import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, Language } from '../types';
import { dataService } from '../services/dataService';
import { FadeIn } from './FadeIn';
import { getTranslation } from '../translations';

interface GalleryProps {
  language: Language;
}

export const Gallery: React.FC<GalleryProps> = ({ language }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('Macaron');
  const t = getTranslation(language);

  useEffect(() => {
    const load = async () => {
      const data = await dataService.getProducts();
      setProducts(data);
    };
    load();
  }, []);

  const filteredProducts = products.filter(p => p.category === activeCategory);

  return (
    <section className="py-24 bg-layen-cream" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <FadeIn>
            <h2 className="text-4xl font-serif text-layen-dark mb-8">{t.gallery.title}</h2>
            
            {/* Category Tabs */}
            <div className="flex justify-center gap-8 border-b border-gray-200 pb-4 max-w-2xl mx-auto">
              {(['Macaron', 'Cake', 'Sable'] as ProductCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-lg tracking-widest uppercase transition-all duration-300 pb-4 relative ${
                    activeCategory === cat 
                      ? 'text-layen-gold font-medium' 
                      : 'text-gray-400 hover:text-layen-dark'
                  }`}
                >
                  {cat}s
                  {activeCategory === cat && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-layen-gold"></span>
                  )}
                </button>
              ))}
            </div>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredProducts.map((product, idx) => (
            <FadeIn key={product.id} delay={idx * 100}>
              <div className="group relative bg-white rounded-none shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer h-[450px]">
                
                {/* Image Container */}
                <div className="h-2/3 w-full overflow-hidden relative">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${!product.available ? 'grayscale opacity-70' : ''}`}
                  />
                  {!product.available && (
                     <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm">
                       <span className="bg-layen-dark text-white px-4 py-2 uppercase tracking-widest text-xs font-bold">{t.gallery.outOfStock}</span>
                     </div>
                  )}
                  {/* Dressage Badge for Sables */}
                  {product.category === 'Sable' && product.sableDressage && (
                    <div className="absolute top-4 right-4 bg-layen-gold text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-md">
                      {t.gallery.dressage}
                    </div>
                  )}
                </div>
                
                {/* Details */}
                <div className="p-8 text-center h-1/3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-serif text-layen-dark mb-2">{product.name}</h3>
                    <p className="text-gray-500 font-light text-sm line-clamp-2">{product.description}</p>
                  </div>
                  <div className="flex justify-between items-end border-t border-gray-100 pt-4 mt-2">
                     <span className="text-layen-gold font-serif text-xl">{product.price.toFixed(2)} TND</span>
                     <span className="text-[10px] uppercase text-gray-400 tracking-wider">{t.gallery.addToOrder}</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
          
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400 font-light italic">
              {t.gallery.comingSoon}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};