import Box from "@/components/shared/Box";
import Section from "@/components/shared/Section";
import Header from "@/components/shared/header/Header";
import {
  Table,
  Tag,
  InputNumber,
  Button,
  App,
  Modal,
  Divider,
  DatePicker,
} from "antd";
import type { TableProps } from "antd";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  useGetOrdersQuery,
  useRecordPaymentMutation,
  useGetDebtSummaryQuery,
} from "@/services/ordersApi";
import type { Order } from "@/interfaces/orders.interface";
import {
  FaMoneyBillWave,
  FaCircleCheck,
  FaFileInvoiceDollar,
} from "react-icons/fa6";
import dayjs from "dayjs";

// ── Stat card ──────────────────────────────────────────────────────────────
const StatCard = ({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bg: string;
}) => (
  <div className="flex items-center gap-4 rounded-xl border border-borderColor bg-bgColor p-5 shadow-sm flex-1 min-w-0">
    <div
      className={`flex items-center justify-center rounded-full p-3 ${bg} shrink-0`}
    >
      <span className={`text-2xl ${color}`}>{icon}</span>
    </div>
    <div className="min-w-0">
      <p className="text-sm text-gray-500 truncate">{label}</p>
      <p className={`text-xl font-bold truncate ${color}`}>{value}</p>
    </div>
  </div>
);

// ── Pay modal ──────────────────────────────────────────────────────────────
const PayModal = ({
  record,
  open,
  onClose,
}: {
  record: Order | null;
  open: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [amount, setAmount] = useState<number | null>(null);
  const [payDate, setPayDate] = useState<ReturnType<typeof dayjs>>(dayjs());
  const [recordPayment, { isLoading: isPaying }] = useRecordPaymentMutation();

  if (!record) return null;

  const currentDebt =
    Number(record.totalPrice) - Number(record.paidAmount || 0);
  const debtLeft = currentDebt - (amount || 0);

  const handlePay = async () => {
    if (!amount || amount <= 0) {
      message.error(t("invalid_amount"));
      return;
    }
    try {
      await recordPayment({
        orderId: record.id,
        amount,
        payDate: payDate.format("YYYY-MM-DD"),
      }).unwrap();
      message.success(t("payment_recorded"));
      setAmount(null);
      setPayDate(dayjs());
      onClose();
    } catch {
      message.error(t("error"));
    }
  };

  const handleClose = () => {
    setAmount(null);
    setPayDate(dayjs());
    onClose();
  };

  return (
    <Modal
      title={`${t("payment")} — ${record.orderName}`}
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={460}
      destroyOnClose
    >
      <div className="space-y-4 pt-2">
        {/* Summary info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">{t("total_price")}</p>
            <p className="font-semibold">
              {Number(record.totalPrice).toFixed(2)} TMT
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">{t("paid_amount")}</p>
            <p className="font-semibold text-green-600">
              {Number(record.paidAmount || 0).toFixed(2)} TMT
            </p>
          </div>
        </div>

        <Divider className="my-3" />

        {/* Payment form */}
        <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold">{t("current_debt")}:</span>
            <span className="text-red-500 font-bold text-base">
              {currentDebt.toFixed(2)} TMT
            </span>
          </div>

          <div className="flex justify-between items-center gap-3">
            <span className="font-semibold whitespace-nowrap">
              {t("pay_date")}:
            </span>
            <DatePicker
              className="w-full"
              value={payDate}
              onChange={(date) => setPayDate(date ?? dayjs())}
              format="DD.MM.YYYY"
              allowClear={false}
            />
          </div>

          <div className="flex justify-between items-center gap-3">
            <span className="font-semibold whitespace-nowrap">
              {t("pay_amount")}:
            </span>
            <InputNumber
              className="w-full"
              min={0}
              max={currentDebt}
              step={0.01}
              value={amount}
              onChange={(val) => setAmount(val)}
              placeholder={t("enter_amount")}
              autoFocus
            />
          </div>

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
                {debtLeft <= 0 ? "0.00" : debtLeft.toFixed(2)} TMT
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <Button onClick={handleClose}>{t("cancel")}</Button>
          <Button
            type="primary"
            onClick={handlePay}
            loading={isPaying}
            disabled={!amount || amount <= 0}
          >
            {t("pay")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ── Main Debt page ─────────────────────────────────────────────────────────
const Debt = () => {
  const { t, i18n } = useTranslation();

  const { data: ordersData, isLoading } = useGetOrdersQuery({
    isPaid: false,
    pageSize: "50",
  });
  const { data: summary, isLoading: summaryLoading } = useGetDebtSummaryQuery();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const unpaidOrders = ordersData?.list ?? [];

  const columns: TableProps<Order>["columns"] = [
    {
      title: t("order_name"),
      dataIndex: "orderName",
      key: "orderName",
      render: (name: string) => <span className="font-semibold">{name}</span>,
    },
    {
      title: t("supplier"),
      key: "supplier",
      render: (_, record) =>
        (i18n.language === "ru"
          ? record.supplier?.name_ru
          : record.supplier?.name_tm) || "-",
    },
    {
      title: t("total_price"),
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (v: number) => (
        <span className="font-medium">{Number(v).toFixed(2)} TMT</span>
      ),
    },
    {
      title: t("paid_amount"),
      dataIndex: "paidAmount",
      key: "paidAmount",
      render: (v: number) => (
        <span className="text-green-600 font-medium">
          {Number(v || 0).toFixed(2)} TMT
        </span>
      ),
    },
    {
      title: t("current_debt"),
      key: "debt",
      render: (_, record) => {
        const debt = Number(record.totalPrice) - Number(record.paidAmount || 0);
        return (
          <span className="text-red-500 font-bold">{debt.toFixed(2)} TMT</span>
        );
      },
    },
    {
      title: t("order_status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "RECEIVED" ? "green" : "orange"}>
          {t(status)}
        </Tag>
      ),
    },
    {
      title: t("last_pay_date"),
      dataIndex: "lastPayDate",
      key: "lastPayDate",
      render: (lastPayDate: string) => (
        <p>{lastPayDate ? dayjs(lastPayDate).format("DD.MM.YYYY") : "-"}</p>
      ),
    },
    {
      title: t("actions"),
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<FaMoneyBillWave />}
          onClick={() => setSelectedOrder(record)}
        >
          {t("pay")}
        </Button>
      ),
    },
  ];

  return (
    <>
      <section>
        <Header title={t("debt")} />
        <Section>
          {/* ── 3 summary cards ── */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <StatCard
              icon={<FaMoneyBillWave />}
              label={t("total_debt")}
              value={
                summaryLoading
                  ? "..."
                  : `${Number(summary?.totalDebt ?? 0).toFixed(2)} TMT`
              }
              color="text-red-500"
              bg="bg-red-50"
            />
            <StatCard
              icon={<FaCircleCheck />}
              label={t("total_paid")}
              value={
                summaryLoading
                  ? "..."
                  : `${Number(summary?.totalPaid ?? 0).toFixed(2)} TMT`
              }
              color="text-green-600"
              bg="bg-green-50"
            />
            <StatCard
              icon={<FaFileInvoiceDollar />}
              label={t("unpaid_orders_count")}
              value={
                summaryLoading ? "..." : String(summary?.unpaidOrdersCount ?? 0)
              }
              color="text-orange-500"
              bg="bg-orange-50"
            />
          </div>

          {/* ── Unpaid orders table ── */}
          <Box>
            <Table
              loading={isLoading}
              size="large"
              columns={columns}
              dataSource={unpaidOrders}
              rowKey="id"
              pagination={{ position: ["bottomCenter"], pageSize: 10 }}
              className="overflow-x-auto"
            />
          </Box>
        </Section>
      </section>

      {/* ── Payment modal ── */}
      <PayModal
        record={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
};

export default Debt;
