import Box from "@/components/shared/Box";
import Section from "@/components/shared/Section";
import Header from "@/components/shared/header/Header";
import { Button, Table, type TableProps, Tag, message } from "antd";
import { FileWordOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useGetAgreementQuery } from "@/services/agreementApi";
import type { Order } from "@/interfaces/orders.interface";
import dayjs from "dayjs";
import { useState } from "react";
import { generateAgreementDocx } from "@/utils/generateAgreementDocx";

const AgreementViewOne = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language === "ru" ? "ru" : "tm";
  const [docxLoading, setDocxLoading] = useState(false);

  const { data: agreement, isLoading: agreementLoading } = useGetAgreementQuery(
    Number(id),
  );

  const handleDownloadDocx = async () => {
    if (!agreement) return;
    try {
      setDocxLoading(true);
      await generateAgreementDocx(agreement);
      message.success(t("download_success") || "Файл успешно скачан");
    } catch (error) {
      console.error("DOCX generation error:", error);
      message.error(t("download_error") || "Ошибка при скачивании");
    } finally {
      setDocxLoading(false);
    }
  };

  const orders: Order[] = agreement?.purchaseOrders || [];

  const columns: TableProps<Order>["columns"] = [
    {
      title: "№",
      dataIndex: "index",
      key: "index",
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: t("supplier"),
      dataIndex: "supplier",
      key: "supplier",
      render: (_, record) =>
        (i18n.language === "ru"
          ? record.supplier?.name_ru
          : record.supplier?.name_tm) || "-",
    },
    {
      title: t("type"),
      dataIndex: "type",
      key: "type",
      render: (type: string) => t(type?.toLowerCase()),
    },
    {
      title: t("totalPrice"),
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price: number) => `${Number(price).toFixed(2)} TMT`,
    },
    {
      title: t("status"),
      dataIndex: "isPaid",
      key: "isPaid",
      render: (isPaid: boolean) => (
        <Tag color={isPaid ? "green" : "red"}>
          {isPaid ? t("paid") : t("unpaid")}
        </Tag>
      ),
    },
  ];

  return (
    <section>
      <Header title={`${t("agreements")} - ${agreement?.agreementNumber || ""}`} />
      <Section>
        <Box>
          <div className="flex flex-col gap-6">
            <div className="flex justify-end">
              <Button
                type="primary"
                icon={<FileWordOutlined />}
                loading={docxLoading}
                onClick={handleDownloadDocx}
                disabled={!agreement}
              >
                {t("download_docx") || "Скачать DOCX"}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-gray-500 text-sm">{t("agreement_number")}</span>
                <span className="font-medium text-lg">{agreement?.agreementNumber || "-"}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-gray-500 text-sm">{t("registered_date")}</span>
                <span className="font-medium text-lg">
                  {agreement?.registeredDate ? dayjs(agreement.registeredDate).format("DD.MM.YYYY") : "-"}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-gray-500 text-sm">{t("valid_date")}</span>
                <span className="font-medium text-lg">
                  {agreement?.validDate ? dayjs(agreement.validDate).format("DD.MM.YYYY") : "-"}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-gray-500 text-sm">{t("buyer_client")}</span>
                <span className="font-medium text-lg">
                  {agreement?.buyerClient
                    ? (currentLang === "ru" ? agreement.buyerClient.name_ru : agreement.buyerClient.name_tm)
                    : "-"}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-gray-500 text-sm">{t("seller_client")}</span>
                <span className="font-medium text-lg">
                  {agreement?.sellerClient
                    ? (currentLang === "ru" ? agreement.sellerClient.name_ru : agreement.sellerClient.name_tm)
                    : "-"}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-gray-500 text-sm">{t("status")}</span>
                <div>
                  <Tag color={agreement?.status === "active" ? "green" : "red"}>
                    {t(agreement?.status || "")}
                  </Tag>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-4">{t("orders")}</h3>
              <Table
                loading={agreementLoading}
                columns={columns}
                dataSource={orders}
                rowKey="id"
                pagination={false}
                className="overflow-x-auto"
              />
            </div>
          </div>
        </Box>
      </Section>
    </section>
  );
};

export default AgreementViewOne;
