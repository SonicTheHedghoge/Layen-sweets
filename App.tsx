import React, { useState, useEffect } from 'react';
import { ViewState, SiteContent, Language, Product } from './types';
import { dataService, INITIAL_CONTENT } from './services/dataService';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Gallery } from './components/Gallery';
import { OrderForm } from './components/OrderForm';
import { Recipes } from './components/Recipes';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { LayenAI } from './components/LayenAI';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [siteContent, setSiteContent] = useState<SiteContent>(INITIAL_CONTENT);
  const [language, setLanguage] = useState<Language>('fr');
  const [products, setProducts] = useState<Product[]>([]);

  // Refresh content whenever we switch views (in case Admin updated it)
  useEffect(() => {
    const loadContent = async () => {
      const content = await dataService.getSiteContent();
      const prods = await dataService.getProducts();
      setSiteContent(content);
      setProducts(prods);
    };
    loadContent();
  }, [currentView]);

  const renderView = () => {
    switch (currentView) {
      case 'HOME':
        return (
          <>
            <Hero onOrder={() => setCurrentView('ORDER')} content={siteContent} language={language} />
            <About content={siteContent} language={language} />
            <Gallery language={language} />
            <Recipes language={language} />
          </>
        );
      case 'ABOUT':
        return <About content={siteContent} language={language} />;
      case 'GALLERY':
        return <Gallery language={language} />;
      case 'ORDER':
        return <OrderForm language={language} />;
      case 'RECIPES':
        return <Recipes language={language} />;
      case 'ADMIN':
        return <AdminDashboard onExit={() => setCurrentView('HOME')} />;
      case 'CONTACT':
        return (
          <div className="min-h-[60vh] flex items-center justify-center bg-layen-cream" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="text-center p-12">
               <h2 className="text-4xl font-serif text-layen-dark mb-4">{language === 'ar' ? 'اتصل بنا' : language === 'fr' ? 'Contactez-nous' : 'Get in Touch'}</h2>
               <p className="text-xl text-gray-600 mb-8">{language === 'ar' ? 'اتصل بنا على' : 'Call us at'} {siteContent.contactPhone}</p>
               <a href={siteContent.facebookUrl} target="_blank" rel="noreferrer" className="text-layen-gold underline">
                 {language === 'ar' ? 'زيارة صفحة الفيسبوك' : language === 'fr' ? 'Visitez notre page Facebook' : 'Visit Facebook Page'}
               </a>
            </div>
          </div>
        );
      default:
        return <Hero onOrder={() => setCurrentView('ORDER')} content={siteContent} language={language} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans text-layen-dark ${language === 'ar' ? 'font-arabic' : ''}`}>
      {currentView !== 'ADMIN' && (
        <Header 
          currentView={currentView} 
          onChangeView={setCurrentView} 
          logoText={siteContent.logoText} 
          logoImage={siteContent.logoImage}
          language={language}
          setLanguage={setLanguage}
        />
      )}
      
      <main className="flex-grow">
        {renderView()}
      </main>

      {currentView !== 'ADMIN' && (
        <>
          <LayenAI products={products} siteContent={siteContent} language={language} />
          <Footer 
            onAdminClick={() => setCurrentView('ADMIN')} 
            content={siteContent}
            language={language}
          />
        </>
      )}
    </div>
  );
}

export default App;