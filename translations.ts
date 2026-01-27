import { Language } from './types';

export const translations = {
  fr: {
    nav: {
      home: 'Accueil',
      about: 'À Propos',
      gallery: 'Galerie',
      order: 'Commander',
      recipes: 'Recettes',
      contact: 'Contact',
      admin: 'Admin'
    },
    hero: {
      discover: 'Découvrir les Saveurs'
    },
    about: {
      story: 'Notre Histoire',
      handmade: 'Fait Main',
      flavors: 'Saveurs Uniques',
      preservatives: 'Sans Conservateurs'
    },
    gallery: {
      title: 'Nos Créations',
      outOfStock: 'Rupture de Stock',
      dressage: '+ Dressage',
      addToOrder: 'Commander →',
      comingSoon: 'Nouvelle collection arrive bientôt...'
    },
    order: {
      title: 'Passer Votre Commande',
      yourInfo: 'Vos Informations',
      namePlaceholder: 'Nom Complet',
      phonePlaceholder: 'Numéro de Téléphone',
      notesPlaceholder: 'Notes (Allergies, Date...)',
      total: 'Total Estimé',
      confirm: 'Confirmer la Commande',
      successTitle: 'Commande Reçue',
      successMsg: 'Merci. Nous vous contacterons bientôt pour confirmer.',
      newOrder: 'Nouvelle Commande',
      dressageOption: 'Avec Dressage'
    },
    recipes: {
      title: 'Les Coulisses',
      readStory: 'Lire l\'histoire',
      secretTitle: 'Secret de Chef'
    },
    footer: {
      designed: 'Conçu avec élégance.',
      rights: 'Tous droits réservés.'
    },
    ai: {
      placeholder: 'Posez une question sur nos douceurs...',
      thinking: 'Layen réfléchit...',
      welcome: 'Bonjour! Je suis Layen AI. Comment puis-je vous aider à choisir vos gourmandises aujourd\'hui?'
    }
  },
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      gallery: 'Gallery',
      order: 'Order',
      recipes: 'Recipes',
      contact: 'Contact',
      admin: 'Admin'
    },
    hero: {
      discover: 'Discover Flavors'
    },
    about: {
      story: 'Our Story',
      handmade: 'Handmade',
      flavors: 'Unique Flavors',
      preservatives: 'Preservatives'
    },
    gallery: {
      title: 'Our Creations',
      outOfStock: 'Out of Stock',
      dressage: '+ Dressage',
      addToOrder: 'Order Now →',
      comingSoon: 'New collection coming soon...'
    },
    order: {
      title: 'Place Your Order',
      yourInfo: 'Your Information',
      namePlaceholder: 'Full Name',
      phonePlaceholder: 'Phone Number',
      notesPlaceholder: 'Notes (Allergies, Date...)',
      total: 'Estimated Total',
      confirm: 'Confirm Order',
      successTitle: 'Order Received',
      successMsg: 'Thank you. We will contact you shortly to confirm.',
      newOrder: 'Start New Order',
      dressageOption: 'With Dressage'
    },
    recipes: {
      title: 'Behind the Scenes',
      readStory: 'Read Story',
      secretTitle: 'Chef\'s Secret'
    },
    footer: {
      designed: 'Designed with elegance.',
      rights: 'All rights reserved.'
    },
    ai: {
      placeholder: 'Ask about our sweets...',
      thinking: 'Layen is thinking...',
      welcome: 'Hello! I am Layen AI. How can I assist you in choosing your treats today?'
    }
  },
  ar: {
    nav: {
      home: 'الرئيسية',
      about: 'قصتنا',
      gallery: 'المعرض',
      order: 'الطلب',
      recipes: 'الوصفات',
      contact: 'اتصل بنا',
      admin: 'إدارة'
    },
    hero: {
      discover: 'اكتشف النكهات'
    },
    about: {
      story: 'قصتنا',
      handmade: 'صناعة يدوية',
      flavors: 'نكهات فريدة',
      preservatives: 'مواد حافظة'
    },
    gallery: {
      title: 'إبداعاتنا',
      outOfStock: 'نفذت الكمية',
      dressage: '+ تزيين',
      addToOrder: 'اطلب الآن ←',
      comingSoon: 'مجموعة جديدة قريباً...'
    },
    order: {
      title: 'أكمل طلبك',
      yourInfo: 'معلوماتك',
      namePlaceholder: 'الاسم الكامل',
      phonePlaceholder: 'رقم الهاتف',
      notesPlaceholder: 'ملاحظات (حساسية، تاريخ...)',
      total: 'المجموع التقديري',
      confirm: 'تأكيد الطلب',
      successTitle: 'تم استلام الطلب',
      successMsg: 'شكراً لك. سنتصل بك قريباً للتأكيد.',
      newOrder: 'طلب جديد',
      dressageOption: 'مع تزيين'
    },
    recipes: {
      title: 'خلف الكواليس',
      readStory: 'اقرأ القصة',
      secretTitle: 'سر الشيف'
    },
    footer: {
      designed: 'صمم بأناقة.',
      rights: 'جميع الحقوق محفوظة.'
    },
    ai: {
      placeholder: 'اسأل عن حلوياتنا...',
      thinking: 'لاين يفكر...',
      welcome: 'مرحباً! أنا لاين الذكي. كيف يمكنني مساعدتك في اختيار حلوياتك اليوم؟'
    }
  }
};

export const getTranslation = (lang: Language) => translations[lang];