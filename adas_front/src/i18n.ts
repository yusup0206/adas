import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./lang/en.json";
import ru from "./lang/ru.json";
import tk from "./lang/tk.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      tk: { translation: tk },
    },
    fallbackLng: "tk",
    interpolation: {
      escapeValue: false,
      prefix: "{",
      suffix: "}",
    },
    detection: {
      order: ["localStorage"],
      lookupLocalStorage: "language",
      caches: ["localStorage"],
    },
  });

export default i18n;
