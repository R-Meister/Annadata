import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---------------------------------------------------------------------------
// Translation dictionary — key labels used across the app
// ---------------------------------------------------------------------------

export const translations = {
  en: {
    // Landing page
    "landing.badge": "11 AI-Powered Microservices for Agriculture",
    "landing.tagline":
      "A multi-service AI agriculture platform empowering Indian farmers with quantum-aware yield forecasting, market intelligence, soil analysis, crop protection, smart irrigation, fintech credit scoring, cold chain optimization, seed verification, and hyper-local weather.",
    "landing.cta": "Open Dashboard",
    "landing.signin": "Sign In",
    "landing.services": "Platform Services",
    "landing.servicesDesc":
      "Each service runs as an independent FastAPI microservice with shared PostgreSQL, Redis, and Celery background workers.",
    "landing.team": "Team",
    "landing.tech":
      "Built with FastAPI + SQLAlchemy 2.0 + PostgreSQL + Redis + Celery | Next.js 16 + React 19 + TypeScript + Tailwind v4 | Docker Compose",

    // Stats
    "stat.services": "Services",
    "stat.models": "ML Models",
    "stat.records": "Data Records",
    "stat.quantum": "Quantum Strategies",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Platform overview and service status",
    "dashboard.serviceHealth": "Service Health",
    "dashboard.serviceHealthDesc":
      "Real-time health status across all platform services",
    "dashboard.services": "Services",
    "dashboard.recentActivity": "Recent Activity",
    "dashboard.healthy": "healthy",
    "dashboard.activeServices": "Active Services",
    "dashboard.dataRecords": "Data Records",
    "dashboard.mlModels": "ML Models",
    "dashboard.quantumStrategies": "Quantum Strategies",

    // Header
    "header.search": "Search...",
    "header.profile": "Profile",
    "header.settings": "Settings",
    "header.signout": "Sign out",

    // Sidebar nav
    "nav.dashboard": "Dashboard",
    "nav.mspMitra": "MSP Mitra",
    "nav.soilscan": "SoilScan AI",
    "nav.fasalRakshak": "Fasal Rakshak",
    "nav.jalShakti": "Jal Shakti",
    "nav.harvestShakti": "Harvest Shakti",
    "nav.kisaanSahayak": "Kisaan Sahayak",
    "nav.proteinEngineering": "Protein Engineering",
    "nav.kisanCredit": "Kisan Credit",
    "nav.harvestToCart": "Harvest-to-Cart",
    "nav.beejSuraksha": "Beej Suraksha",
    "nav.mausamChakra": "Mausam Chakra",
    "nav.digitalTwin": "Digital Twin",
    "nav.settings": "Settings",

    // Common
    "common.healthy": "Healthy",
    "common.unhealthy": "Down",
    "common.unknown": "Unknown",
  },
  hi: {
    // Landing page
    "landing.badge": "कृषि के लिए 11 AI-संचालित माइक्रोसर्विसेज",
    "landing.tagline":
      "क्वांटम-सक्षम उपज पूर्वानुमान, बाज़ार बुद्धिमत्ता, मृदा विश्लेषण, फसल सुरक्षा, स्मार्ट सिंचाई, फिनटेक क्रेडिट स्कोरिंग, कोल्ड चेन अनुकूलन, बीज सत्यापन और हाइपर-लोकल मौसम से भारतीय किसानों को सशक्त बनाने वाला बहु-सेवा AI कृषि मंच।",
    "landing.cta": "डैशबोर्ड खोलें",
    "landing.signin": "साइन इन करें",
    "landing.services": "प्लेटफ़ॉर्म सेवाएँ",
    "landing.servicesDesc":
      "प्रत्येक सेवा साझा PostgreSQL, Redis और Celery बैकग्राउंड वर्कर्स के साथ एक स्वतंत्र FastAPI माइक्रोसर्विस के रूप में चलती है।",
    "landing.team": "टीम",
    "landing.tech":
      "FastAPI + SQLAlchemy 2.0 + PostgreSQL + Redis + Celery | Next.js 16 + React 19 + TypeScript + Tailwind v4 | Docker Compose से निर्मित",

    // Stats
    "stat.services": "सेवाएँ",
    "stat.models": "ML मॉडल",
    "stat.records": "डेटा रिकॉर्ड",
    "stat.quantum": "क्वांटम रणनीतियाँ",

    // Dashboard
    "dashboard.title": "डैशबोर्ड",
    "dashboard.subtitle": "प्लेटफ़ॉर्म अवलोकन और सेवा स्थिति",
    "dashboard.serviceHealth": "सेवा स्वास्थ्य",
    "dashboard.serviceHealthDesc":
      "सभी प्लेटफ़ॉर्म सेवाओं की रियल-टाइम स्वास्थ्य स्थिति",
    "dashboard.services": "सेवाएँ",
    "dashboard.recentActivity": "हालिया गतिविधि",
    "dashboard.healthy": "स्वस्थ",
    "dashboard.activeServices": "सक्रिय सेवाएँ",
    "dashboard.dataRecords": "डेटा रिकॉर्ड",
    "dashboard.mlModels": "ML मॉडल",
    "dashboard.quantumStrategies": "क्वांटम रणनीतियाँ",

    // Header
    "header.search": "खोजें...",
    "header.profile": "प्रोफ़ाइल",
    "header.settings": "सेटिंग्स",
    "header.signout": "साइन आउट",

    // Sidebar nav
    "nav.dashboard": "डैशबोर्ड",
    "nav.mspMitra": "MSP मित्र",
    "nav.soilscan": "सॉइलस्कैन AI",
    "nav.fasalRakshak": "फसल रक्षक",
    "nav.jalShakti": "जल शक्ति",
    "nav.harvestShakti": "हार्वेस्ट शक्ति",
    "nav.kisaanSahayak": "किसान सहायक",
    "nav.proteinEngineering": "प्रोटीन इंजीनियरिंग",
    "nav.kisanCredit": "किसान क्रेडिट",
    "nav.harvestToCart": "हार्वेस्ट-टू-कार्ट",
    "nav.beejSuraksha": "बीज सुरक्षा",
    "nav.mausamChakra": "मौसम चक्र",
    "nav.digitalTwin": "डिजिटल ट्विन",
    "nav.settings": "सेटिंग्स",

    // Common
    "common.healthy": "स्वस्थ",
    "common.unhealthy": "बंद",
    "common.unknown": "अज्ञात",
  },
} as const;

export type Language = "en" | "hi";
export type TranslationKey = keyof (typeof translations)["en"];

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: "en",

      setLanguage: (lang) => set({ language: lang }),

      t: (key) => {
        const lang = get().language;
        return translations[lang][key] ?? translations.en[key] ?? key;
      },
    }),
    {
      name: "annadata-language",
      partialize: (state) => ({ language: state.language }),
    },
  ),
);
