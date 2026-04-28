import type { Order } from "@/interfaces/orders.interface";
import {
  useRecordPaymentMutation,
} from "@/services/ordersApi";
import { App, Button, Modal, Table, Divider, InputNumber } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RiEyeLine } from "react-icons/ri";

const UpdateModal = ({ record }: { record: Order }) => {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();

  const [openModal, setOpenModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [recordPayment, { isLoading: isPaying }] = useRecordPaymentMutation();

  const handlePay = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      message.error(t("invalid_amount"));
      return;
    }
    try {
      await recordPayment({ orderId: record.id, amount: paymentAmount }).unwrap();
      message.success(t("payment_recorded"));
      setPaymentAmount(null);
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

  const currentDebt = Number(record.totalPrice) - Number(record.paidAmount || 0);
  const debtLeft = currentDebt - (paymentAmount || 0);

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
          setPaymentAmount(null);
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
              <strong>{t("status")}:</strong> {record.isPaid ? t("paid") : t("unpaid")}
            </div>
            <div>
              <strong>{t("total_price")}:</strong> {record.totalPrice} TMT
            </div>
            <div>
              <strong>{t("paid_amount")}:</strong> {record.paidAmount || 0} TMT
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

          {!record.isPaid && (
            <>
              <Divider orientation="left">{t("payment")}</Divider>
              <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{t("current_debt")}:</span>
                  <span>{currentDebt.toFixed(2)} TMT</span>
                </div>
                
                <div className="flex justify-between items-center gap-4">
                  <span className="font-semibold whitespace-nowrap">{t("pay_amount")}:</span>
                  <InputNumber
                    className="w-full"
                    min={0}
                    max={currentDebt}
                    step={0.01}
                    value={paymentAmount}
                    onChange={(val) => setPaymentAmount(val)}
                    placeholder={t("enter_amount")}
                  />
                  <Button 
                    type="primary" 
                    onClick={handlePay} 
                    loading={isPaying}
                    disabled={!paymentAmount || paymentAmount <= 0}
                  >
                    {t("pay")}
                  </Button>
                </div>

                {paymentAmount !== null && paymentAmount > 0 && (
                  <div className="flex justify-between items-center text-blue-600">
                    <span className="font-semibold">{t("debt_left_after_payment")}:</span>
                    <span className="font-bold">{debtLeft.toFixed(2)} TMT</span>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end mt-4">
            <Button size="large" onClick={() => {
              setOpenModal(false);
              setPaymentAmount(null);
            }}>
              {t("close")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UpdateModal;
