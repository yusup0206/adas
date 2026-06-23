import {
  App,
  Button,
  DatePicker,
  Divider,
  Form,
  InputNumber,
  Modal,
} from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePayLoanGroupByMoneyMutation } from "@/services/loansApi";
import type { LoanGroup } from "@/interfaces/loans.interface";
import dayjs from "dayjs";

interface Props {
  loanGroup: LoanGroup | null;
  open: boolean;
  onClose: () => void;
}

const ExportLoanPayModal = ({ loanGroup, open, onClose }: Props) => {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [payByMoney, { isLoading }] = usePayLoanGroupByMoneyMutation();

  const [amount, setAmount] = useState<number | null>(null);

  if (!loanGroup) return null;

  const currentDebt =
    Number(loanGroup.totalAmount) - Number(loanGroup.paidAmount ?? 0);
  const debtLeft = currentDebt - (amount || 0);
  const clientName =
    i18n.language === "ru"
      ? loanGroup.client?.name_ru
      : loanGroup.client?.name_tm;

  const handleClose = () => {
    form.resetFields();
    setAmount(null);
    onClose();
  };

  const handlePay = async (values: any) => {
    if (!values.amount || values.amount <= 0) {
      message.error(t("invalid_amount"));
      return;
    }
    try {
      await payByMoney({
        groupId: loanGroup.dispatchGroupId,
        amount: values.amount,
        payDate: values.payDate
          ? dayjs(values.payDate).format("YYYY-MM-DD")
          : undefined,
      }).unwrap();
      message.success(t("payment_recorded"));
      handleClose();
    } catch {
      message.error(t("error"));
    }
  };

  return (
    <Modal
      title={`${t("loan_repayment")} — ${clientName}`}
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={460}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handlePay}
        initialValues={{ payDate: dayjs() }}
      >
        <div className="space-y-4 pt-2">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-gray-500 mb-1">{t("total_price")}</p>
              <p className="font-semibold">
                {Number(loanGroup.totalAmount).toFixed(2)} $
              </p>
            </div>
            <div className="bg-green-50 rounded-md p-3">
              <p className="text-gray-500 mb-1">{t("paid_amount")}</p>
              <p className="font-semibold text-green-600">
                {Number(loanGroup.paidAmount ?? 0).toFixed(2)} $
              </p>
            </div>
          </div>

          <Divider className="my-3" />

          <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{t("current_debt")}:</span>
              <span className="text-red-500 font-bold text-base">
                {currentDebt.toFixed(2)} $
              </span>
            </div>

            <Form.Item name="payDate" label={t("pay_date")} className="mb-0">
              <DatePicker
                className="w-full"
                format="DD.MM.YYYY"
                allowClear={false}
              />
            </Form.Item>

            <Form.Item
              name="amount"
              label={t("pay_amount")}
              className="mb-0"
              rules={[{ required: true, message: t("required_field") }]}
            >
              <InputNumber
                className="w-full"
                min={0.01}
                max={currentDebt}
                step={0.01}
                placeholder={t("enter_amount")}
                onChange={(val) => setAmount(val)}
              />
            </Form.Item>

            {/* Live preview */}
            {amount !== null && amount > 0 && (
              <div
                className={`flex justify-between items-center rounded-md px-3 py-2 ${
                  debtLeft <= 0
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                <span className="font-semibold">
                  {t("debt_left_after_payment")}:
                </span>
                <span className="font-bold">
                  {debtLeft <= 0 ? "0.00" : debtLeft.toFixed(2)} $
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button onClick={handleClose}>{t("cancel")}</Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              {t("pay")}
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default ExportLoanPayModal;
