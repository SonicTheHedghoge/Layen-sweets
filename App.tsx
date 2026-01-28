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

// --- LOADING COMPONENT ---
const SplashScreen = () => (
  <div className="fixed inset-0 z-[100] bg-layen-cream flex flex-col items-center justify-center transition-opacity duration-1000">
    <div className="text-center animate-pulse">
      <div className="w-16 h-16 border-2 border-layen-gold rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="font-serif text-2xl text-layen-gold italic">L</span>
      </div>
      <h1 className="text-3xl font-serif text-layen-dark tracking-[0.2em] uppercase mb-2">Layen Sweets</h1>
      <div className="h-[1px] w-12 bg-layen-gold mx-auto"></div>
    </div>
  </div>
);

function App() {
  // Start with loading = true to block the default images
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [siteContent, setSiteContent] = useState<SiteContent>(INITIAL_CONTENT);
  const [language, setLanguage] = useState<Language>('fr');
  const [products, setProducts] = useState<Product[]>([]);

  // Initial Data Load - BLOCKING
  useEffect(() => {
    const initData = async () => {
      try {
        // Fetch everything in parallel
        const [content, prods] = await Promise.all([
          dataService.getSiteContent(),
          dataService.getProducts()
        ]);
        
        setSiteContent(content);
        setProducts(prods);
      } catch (e) {
        console.error("Failed to load live data", e);
      } finally {
        // Fade out loader after data is ready
        // Small timeout to ensure the browser has time to paint the images
        setTimeout(() => setIsLoading(false), 800);
      }
    };

    initData();
  }, []);

  // Refresh content whenever we switch views (in case Admin updated it)
  // Non-blocking refresh
  useEffect(() => {
    if (!isLoading) {
      const refreshData = async () => {
        const content = await dataService.getSiteContent();
        const prods = await dataService.getProducts();
        setSiteContent(content);
        setProducts(prods);
      };
      refreshData();
    }
  }, [currentView]);

  if (isLoading) {
    return <SplashScreen />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'HOME':
        return (
          <>
            <Hero onOrder={() => setCurrentView('ORDER')} content={siteContent} language={language} />
            <About content={siteContent} language={language} />
            <Gallery language={language} />
            <Recipes language={language} content={siteContent} />
          </>
        );
      case 'ABOUT':
        return <About content={siteContent} language={language} />;
      case 'GALLERY':
        return <Gallery language={language} />;
      case 'ORDER':
        return <OrderForm language={language} />;
      case 'RECIPES':
        return <Recipes language={language} content={siteContent} />;
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
    <div className={`min-h-screen flex flex-col font-sans text-layen-dark ${language === 'ar' ? 'font-arabic' : ''} animate-fade-in`}>
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