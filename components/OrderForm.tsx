import React, { useState, useEffect } from 'react';
import { Product, Order, Language } from '../types';
import { dataService } from '../services/dataService';
import { FadeIn } from './FadeIn';
import { getTranslation } from '../translations';

interface OrderFormProps {
  language: Language;
}

export const OrderForm: React.FC<OrderFormProps> = ({ language }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [customer, setCustomer] = useState({ name: '', phone: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);
  const t = getTranslation(language);

  useEffect(() => {
    const load = async () => {
      const data = await dataService.getProducts();
      // Only show available products
      setProducts(data.filter(p => p.available));
    };
    load();
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const product = products.find(p => p.id === id);
      return total + (product ? product.price * qty : 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const items = Object.entries(cart).map(([id, quantity]) => {
      const prod = products.find(p => p.id === id);
      let notes = '';
      if (prod?.category === 'Sable' && prod.sableDressage) {
        notes = 'With Dressage';
      }
      return { productId: id, name: prod?.name || 'Unknown', quantity: quantity as number, notes };
    });

    if (items.length === 0) return;

    const order: Order = {
      id: Date.now().toString(),
      customerName: customer.name,
      phone: customer.phone,
      items,
      totalPrice: calculateTotal(),
      notes: customer.notes,
      status: 'Pending',
      date: new Date().toISOString()
    };

    await dataService.submitOrder(order);
    setSubmitted(true);
  };

  // Group products for display
  const groupedProducts = {
    Macaron: products.filter(p => p.category === 'Macaron'),
    Cake: products.filter(p => p.category === 'Cake'),
    Sable: products.filter(p => p.category === 'Sable')
  };

  if (submitted) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-layen-cream" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center p-12 bg-white shadow-2xl rounded-2xl max-w-lg mx-6 animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-3xl font-serif text-layen-dark mb-4">{t.order.successTitle}</h2>
          <p className="text-gray-600 mb-8">{t.order.successMsg}</p>
          <button onClick={() => setSubmitted(false)} className="text-layen-gold underline hover:text-layen-dark transition-colors">{t.order.newOrder}</button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-6 max-w-6xl">
        <FadeIn>
          <h2 className="text-center text-4xl font-serif text-layen-dark mb-12">{t.order.title}</h2>
        </FadeIn>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Menu Selection */}
          <div className="lg:col-span-2">
             {Object.entries(groupedProducts).map(([category, items]) => (
               items.length > 0 && (
                 <div key={category} className="mb-12">
                   <h3 className="text-2xl font-serif text-layen-dark mb-6 border-b pb-2">{category}s</h3>
                   <div className="space-y-4">
                     {items.map(product => (
                       <div key={product.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-layen-gold/30 hover:shadow-md transition-all">
                         <div className="flex items-center gap-4 flex-grow">
                           <img src={product.image} alt={product.name} className="w-16 h-16 rounded-full object-cover" />
                           <div>
                             <h4 className="font-serif text-lg text-layen-dark">{product.name}</h4>
                             <div className="flex gap-2 text-xs text-gray-500 uppercase tracking-wide">
                                <span>{product.price.toFixed(2)} TND</span>
                                {product.sableDressage && <span className="text-layen-gold border border-layen-gold/30 px-1 rounded">{t.order.dressageOption}</span>}
                             </div>
                           </div>
                         </div>
                         <div className="flex items-center gap-3">
                           <button onClick={() => updateQuantity(product.id, -1)} className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100">-</button>
                           <span className="w-4 text-center font-medium">{cart[product.id] || 0}</span>
                           <button onClick={() => updateQuantity(product.id, 1)} className="w-8 h-8 rounded-full bg-layen-dark text-white flex items-center justify-center hover:bg-layen-gold transition-colors">+</button>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )
             ))}
          </div>

          {/* Form Area - Sticky */}
          <div className="lg:col-span-1">
            <div className="bg-layen-cream p-8 rounded-2xl sticky top-24 shadow-sm border border-layen-gold/10">
              <h3 className="text-xl font-serif mb-6 text-layen-gold">{t.order.yourInfo}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                  required type="text" 
                  value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})}
                  className="w-full border-none p-3 rounded bg-white focus:ring-1 focus:ring-layen-gold outline-none" placeholder={t.order.namePlaceholder}
                />
                <input 
                  required type="tel" 
                  value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})}
                  className="w-full border-none p-3 rounded bg-white focus:ring-1 focus:ring-layen-gold outline-none" placeholder={t.order.phonePlaceholder}
                />
                <textarea 
                  value={customer.notes} onChange={e => setCustomer({...customer, notes: e.target.value})}
                  className="w-full border-none p-3 rounded bg-white focus:ring-1 focus:ring-layen-gold outline-none h-24 resize-none" placeholder={t.order.notesPlaceholder}
                />
                
                <div className="pt-6 border-t border-gray-200 mt-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-serif text-xl">{t.order.total}</span>
                    <span className="font-serif text-3xl text-layen-gold">{calculateTotal().toFixed(2)} TND</span>
                  </div>
                  <button 
                    type="submit" 
                    disabled={Object.keys(cart).length === 0}
                    className="w-full py-4 bg-layen-dark text-white rounded-full uppercase tracking-widest font-bold text-sm hover:bg-layen-gold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t.order.confirm}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};