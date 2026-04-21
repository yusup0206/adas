import i18n from "@/i18n";
import { Button, Modal } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MdLanguage } from "react-icons/md";

const LangModal = () => {
  const { t } = useTranslation();

  const languageOptions = [
    { value: "tk", label: "Türkmen" },
    { value: "ru", label: "Русский" },
    { value: "en", label: "English" },
  ];

  //   states
  const [openLangModal, setOpenLangModal] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setOpenLangModal(false);
  };

  return (
    <>
      <button
        onClick={() => setOpenLangModal(true)}
        className="text-textColor hover:text-primary active:text-primary transition-all cursor-pointer"
      >
        <MdLanguage className="size-6" />
      </button>

      <Modal
        title={t("select_language")}
        open={openLangModal}
        onCancel={() => setOpenLangModal(false)}
        footer={null}
        centered
      >
        <div className="flex flex-col gap-3 pt-4">
          {languageOptions.map((option) => (
            <Button
              key={option.value}
              type={i18n.language === option.value ? "primary" : "default"}
              onClick={() => changeLanguage(option.value)}
              block
            >
              {option.label}
            </Button>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default LangModal;
