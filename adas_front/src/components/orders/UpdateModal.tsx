import type { Order } from "@/interfaces/orders.interface";
import {
  useRecordPaymentMutation,
} from "@/services/ordersApi";
import { App, Button, Modal, Table, Tag, Divider } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RiEyeLine } from "react-icons/ri";

const UpdateModal = ({ record }: { record: Order }) => {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();

  const [openModal, setOpenModal] = useState(false);
  const [recordPayment, { isLoading: isPaying }] = useRecordPaymentMutation();

  const handlePay = async (installmentId: number) => {
    try {
      await recordPayment(installmentId).unwrap();
      message.success(t("payment_recorded"));
    } catch (error) {
      console.error(error);
    }
  };

  const itemColumns = [
    {
      title: t("product"),
      dataIndex: "product",
      render: (_: any, item: any) => (i18n.language === "ru" ? item.product?.name_ru : item.product?.name_tm) || "-",
    },
    {
      title: t("quantity"),
      dataIndex: "quantity",
    },
    {
      title: t("unit_price"),
      dataIndex: "unitPrice",
      render: (val: number) => `${val} TMT`,
    },
    {
      title: t("total"),
      dataIndex: "totalPrice",
      render: (val: number) => `${val} TMT`,
    },
  ];

  const installmentColumns = [
    {
      title: t("due_date"),
      dataIndex: "dueDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: t("amount"),
      dataIndex: "amount",
      render: (val: number) => `${Number(val).toFixed(2)} TMT`,
    },
    {
      title: t("status"),
      dataIndex: "status",
      render: (status: string) => (
        <Tag color={status === "PAID" ? "green" : "volcano"}>
          {t(status.toLowerCase())}
        </Tag>
      ),
    },
    {
      title: t("actions"),
      render: (_: any, inst: any) => (
        <Button
          type="primary"
          size="small"
          disabled={inst.status === "PAID"}
          loading={isPaying}
          onClick={() => handlePay(inst.id)}
        >
          {t("pay")}
        </Button>
      ),
    },
  ];

  return (
    <>
      <RiEyeLine
        size={20}
        onClick={(e) => {
          e.stopPropagation();
          setOpenModal(true);
        }}
        className="size-5 cursor-pointer hover:text-primary active:text-primary transition-all"
      />

      <Modal
        title={`${t("order_details")} #${record.id}`}
        open={openModal}
        onCancel={(e) => {
          e.stopPropagation();
          setOpenModal(false);
        }}
        footer={null}
        centered
        width={800}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>{t("supplier")}:</strong> {(i18n.language === "ru" ? record.supplier?.name_ru : record.supplier?.name_tm)}
            </div>
            <div>
              <strong>{t("type")}:</strong> {t(record.type.toLowerCase())}
            </div>
            <div>
              <strong>{t("total_price")}:</strong> {record.totalPrice} TMT
            </div>
            <div>
              <strong>{t("status")}:</strong> {record.isPaid ? t("paid") : t("unpaid")}
            </div>
          </div>

          <Divider orientation="left">{t("items")}</Divider>
          <Table
            dataSource={record.items}
            columns={itemColumns}
            pagination={false}
            rowKey="id"
            size="small"
          />

          {record.type === "INSTALLMENT" && (record as any).paymentPlan && (
            <>
              <Divider orientation="left">{t("payment_plan")}</Divider>
              <Table
                dataSource={(record as any).paymentPlan.installments}
                columns={installmentColumns}
                pagination={false}
                rowKey="id"
                size="small"
              />
            </>
          )}

          <div className="flex justify-end mt-4">
            <Button size="large" onClick={() => setOpenModal(false)}>
              {t("close")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UpdateModal;
