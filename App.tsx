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

// --- LUXURY ENTRANCE COMPONENT ---
interface SplashScreenProps {
  isReady: boolean;
  onEnter: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isReady, onEnter }) => {
  const [showButton, setShowButton] = useState(false);

  // Delay button appearance slightly for dramatic effect
  useEffect(() => {
    if (isReady) {
      const timer = setTimeout(() => setShowButton(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden flex flex-col items-center justify-center transition-all duration-1000 bg-[#FDFBF7]">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-radial from-yellow-50/50 via-[#FDFBF7] to-[#FDFBF7] z-0 pointer-events-none"></div>
      
      {/* Animated Golden Particles (CSS implementation inline for simplicity) */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-layen-gold rounded-full opacity-60 animate-float"
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDuration: Math.random() * 10 + 10 + 's',
              animationDelay: Math.random() * 5 + 's'
            }}
          />
        ))}
      </div>

      <div className={`relative z-10 flex flex-col items-center transition-all duration-1000 transform ${isReady ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}`}>
        
        {/* Brand Header */}
        <div className="text-center mb-8">
           <h1 className="text-5xl md:text-7xl font-serif tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] mb-3 drop-shadow-sm">
             LAYEN SWEETS
           </h1>
           <p className="font-serif text-gray-500 italic text-lg tracking-wider">
             Douceurs Artisanales, Faites avec Amour.
           </p>
        </div>

        {/* Central Visual Card */}
        <div className="relative group perspective-1000 mb-12">
           {/* Glow Effect */}
           <div className="absolute -inset-4 bg-layen-gold/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
           
           <div className="relative w-80 h-64 md:w-[500px] md:h-[350px] bg-white p-2 rounded-sm shadow-2xl transform transition-transform duration-700 hover:rotate-1">
              <div className="w-full h-full border border-[#D4AF37]/20 relative overflow-hidden">
                {!isReady ? (
                  // Loading State (Pulse)
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                    <div className="w-12 h-12 border-2 border-layen-gold border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  // Loaded Image
                  <>
                   <img 
                      src="https://i.ibb.co/9mYr2xRD/Gemini-Generated-Image-6uo3yg6uo3yg6uo3.png"
                      alt="Luxury Sweets" 
                      className="w-full h-full object-cover animate-fade-in grayscale-[10%] group-hover:grayscale-0 transition-all duration-1000"
                   />
                   {/* Shine effect overlay */}
                   <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                  </>
                )}
              </div>
           </div>
        </div>

        {/* Enter Button */}
        <div className={`transition-all duration-1000 delay-300 transform ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
           <button 
             onClick={onEnter}
             className="relative overflow-hidden group px-12 py-4 bg-gradient-to-r from-[#C5A028] to-[#E5C558] text-white font-serif tracking-[0.2em] text-sm uppercase rounded-full shadow-[0_10px_30px_rgba(212,175,55,0.3)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.5)] transition-all duration-500 hover:-translate-y-1"
           >
             <span className="relative z-10 font-bold">Entrer Sur Le Site</span>
             {/* Button Shine Animation */}
             <div className="absolute top-0 -left-full w-1/2 h-full bg-white/30 -skew-x-12 group-hover:animate-shine" />
           </button>
        </div>

      </div>

      {/* Footer minimal */}
      <div className={`absolute bottom-8 text-[10px] text-gray-400 uppercase tracking-[0.3em] transition-opacity duration-1000 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
        Tunisian Excellence
      </div>
    </div>
  );
};

function App() {
  // isLoading = Fetching data
  // hasEntered = User clicked "Enter"
  const [isLoading, setIsLoading] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [siteContent, setSiteContent] = useState<SiteContent>(INITIAL_CONTENT);
  const [language, setLanguage] = useState<Language>('fr');
  const [products, setProducts] = useState<Product[]>([]);

  // Initial Data Load
  useEffect(() => {
    const initData = async () => {
      try {
        const [content, prods] = await Promise.all([
          dataService.getSiteContent(),
          dataService.getProducts()
        ]);
        setSiteContent(content);
        setProducts(prods);
      } catch (e) {
        console.error("Failed to load live data", e);
      } finally {
        // Data is ready, show the visual card on splash screen
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  // Refresh content whenever we switch views
  useEffect(() => {
    if (hasEntered) {
      const refreshData = async () => {
        const content = await dataService.getSiteContent();
        const prods = await dataService.getProducts();
        setSiteContent(content);
        setProducts(prods);
      };
      refreshData();
    }
  }, [currentView, hasEntered]);

  // If user hasn't clicked enter yet, show the upgraded Splash Screen
  // We pass !isLoading as 'isReady' so the card appears only when data is fetched
  if (!hasEntered) {
    return (
      <SplashScreen 
        isReady={!isLoading} 
        onEnter={() => setHasEntered(true)} 
      />
    );
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