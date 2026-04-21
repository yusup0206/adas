import Router from "./routes/Router";
import { ConfigProvider, App as AntdApp } from "antd";

import tkTK from "antd/es/locale/tk_TK";
import ruRU from "antd/es/locale/ru_RU";
import enUS from "antd/es/locale/en_US";
import type { Locale } from "antd/es/locale";

type LanguageKey = "tk" | "ru" | "en";

import { useTranslation } from "react-i18next";

const localeMap: Record<LanguageKey, Locale> = {
  tk: tkTK,
  ru: ruRU,
  en: enUS,
};

const App = () => {
  const { i18n } = useTranslation();
  const language = (i18n.language as LanguageKey) || "tk";

  const currentLocale = localeMap[language] || tkTK;

  return (
    <ConfigProvider
      locale={currentLocale}
      theme={{
        token: {
          colorPrimary: "#272827",
          borderRadius: 6,
          colorText: "#344054",
        },
      }}
    >
      <AntdApp>
        <Router />
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
