import type { LinkedLoan, Order } from "@/interfaces/orders.interface";
import { Modal, Table, Divider, Tabs, InputNumber, Form, Button, App, Tag } from "antd";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { RiEyeLine } from "react-icons/ri";
import { useUpsertOrderExpensesMutation } from "@/services/ordersApi";
import dayjs from "dayjs";

// ── Expense field definitions ──────────────────────────────────────────────
const EXPENSE_FIELDS: { key: string; labelKey: string }[] = [
  { key: "tax", labelKey: "expense_tax" },
  { key: "director", labelKey: "expense_director" },
  { key: "customs", labelKey: "expense_customs" },
  { key: "transportation", labelKey: "expense_transportation" },
  { key: "workers", labelKey: "expense_workers" },
  { key: "stockExchange", labelKey: "expense_stockExchange" },
  { key: "forensics", labelKey: "expense_forensics" },
  { key: "bank", labelKey: "expense_bank" },
  { key: "textileMinistry", labelKey: "expense_textileMinistry" },
  { key: "export", labelKey: "expense_export" },
  { key: "minusConjugation", labelKey: "expense_minusConjugation" },
  { key: "additionalExpenses", labelKey: "expense_additionalExpenses" },
];

// ── Loans Tab ───────────────────────────────────────────────────────────────
const LoansTab = ({ loans }: { loans?: LinkedLoan[] }) => {
  const { t, i18n } = useTranslation();

  if (!loans || loans.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p className="text-base">{t("no_linked_loans")}</p>
      </div>
    );
  }

  const totalLoan = loans.reduce((s, l) => s + Number(l.totalAmount), 0);
  const totalPaid = loans.reduce((s, l) => s + Number(l.paidAmount), 0);
  const totalDebt = totalLoan - totalPaid;

  const columns = [
    {
      title: "№",
      render: (_: any, __: any, i: number) => i + 1,
      width: 50,
    },
    {
      title: t("client"),
      render: (_: any, r: LinkedLoan) =>
        i18n.language === "ru" ? r.client?.name_ru : r.client?.name_tm,
    },
    {
      title: t("total_price"),
      dataIndex: "totalAmount",
      render: (v: number) => `${Number(v).toFixed(2)} TMT`,
    },
    {
      title: t("paid_amount"),
      dataIndex: "paidAmount",
      render: (v: number) => (
        <span className="text-green-600 font-medium">{Number(v).toFixed(2)} TMT</span>
      ),
    },
    {
      title: t("current_debt"),
      render: (_: any, r: LinkedLoan) => {
        const debt = Number(r.totalAmount) - Number(r.paidAmount);
        return <span className="text-red-500 font-bold">{debt.toFixed(2)} TMT</span>;
      },
    },
    {
      title: t("status"),
      dataIndex: "status",
      render: (s: string) => (
        <Tag color={s === "CLOSED" ? "green" : s === "PARTIAL" ? "blue" : "orange"}>
          {t(`loan_status_${s}`)}
        </Tag>
      ),
    },
    {
      title: t("last_pay_date"),
      dataIndex: "lastPayDate",
      render: (d: string) => (d ? dayjs(d).format("DD.MM.YYYY") : "-"),
    },
  ];

  return (
    <div className="space-y-4">
      <Table
        dataSource={loans}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
      />
      <Divider />
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">{t("total_price")}</p>
          <p className="font-bold text-gray-800">{totalLoan.toFixed(2)} TMT</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">{t("paid_amount")}</p>
          <p className="font-bold text-green-600">{totalPaid.toFixed(2)} TMT</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">{t("current_debt")}</p>
          <p className="font-bold text-red-500">{totalDebt.toFixed(2)} TMT</p>
        </div>
      </div>
    </div>
  );
};

// ── Expenses Tab ────────────────────────────────────────────────────────────
const ExpensesTab = ({ record }: { record: Order }) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [upsertExpenses, { isLoading }] = useUpsertOrderExpensesMutation();

  // Populate form with existing expenses when modal opens
  useEffect(() => {
    if (record.expenses) {
      form.setFieldsValue(record.expenses);
    }
  }, [record.expenses, form]);

  // Compute total of all filled fields
  const allValues = Form.useWatch([], form) ?? {};
  const total = EXPENSE_FIELDS.reduce((sum, f) => {
    const val = Number(allValues[f.key] ?? 0);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const handleSave = async (values: Record<string, number | null>) => {
    // Convert undefined to null for clean DB storage
    const cleaned: Record<string, number | null> = {};
    EXPENSE_FIELDS.forEach(({ key }) => {
      cleaned[key] = values[key] ?? null;
    });
    try {
      await upsertExpenses({ id: record.id, body: cleaned }).unwrap();
      message.success(t("successfully_saved"));
    } catch {
      message.error(t("error_occurred"));
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSave}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        {EXPENSE_FIELDS.map(({ key, labelKey }) => (
          <Form.Item key={key} name={key} label={t(labelKey)}>
            <InputNumber
              className="w-full"
              step={0.01}
              min={0}
              placeholder="0.00"
              suffix="TMT"
            />
          </Form.Item>
        ))}
      </div>

      <Divider />

      <div className="flex items-center justify-between">
        <div className="text-base font-semibold">
          {t("total_expenses")}:{" "}
          <span className="text-blue-600">{total.toFixed(2)} TMT</span>
        </div>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          {t("save")}
        </Button>
      </div>
    </Form>
  );
};

// ── Main Modal Component ────────────────────────────────────────────────────
const UpdateModal = ({ record }: { record: Order }) => {
  const { t, i18n } = useTranslation();
  const [openModal, setOpenModal] = useState(false);

  const itemColumns = [
    {
      title: t("product"),
      dataIndex: "product",
      render: (_: any, item: any) =>
        (i18n.language === "ru"
          ? item.product?.name_ru
          : item.product?.name_tm) || "-",
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

  const currentDebt =
    Number(record.totalPrice) - Number(record.paidAmount || 0);

  const tabItems = [
    {
      key: "items",
      label: t("items"),
      children: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>{t("supplier")}:</strong>{" "}
              {i18n.language === "ru"
                ? record.supplier?.name_ru
                : record.supplier?.name_tm}
            </div>
            <div>
              <strong>{t("status")}:</strong>{" "}
              {record.isPaid ? t("paid") : t("unpaid")}
            </div>
            <div>
              <strong>{t("total_price")}:</strong> {record.totalPrice} TMT
            </div>
            <div>
              <strong>{t("paid_amount")}:</strong>{" "}
              {record.paidAmount || 0} TMT
            </div>
            {!record.isPaid && (
              <div className="col-span-2">
                <strong className="text-red-500">{t("current_debt")}:</strong>{" "}
                <span className="text-red-500 font-bold">
                  {currentDebt.toFixed(2)} TMT
                </span>
              </div>
            )}
          </div>

          <Divider orientation="left">{t("order_items")}</Divider>
          <Table
            dataSource={record.items}
            columns={itemColumns}
            pagination={false}
            rowKey="id"
            size="small"
          />
        </div>
      ),
    },
    {
      key: "expenses",
      label: t("additional_expenses"),
      children: <ExpensesTab record={record} />,
    },
    {
      key: "loans",
      label: (
        <span>
          {t("loans")}
          {record.loans && record.loans.length > 0 && (
            <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
              {record.loans.length}
            </span>
          )}
        </span>
      ),
      children: <LoansTab loans={record.loans} />,
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

      <App>
        <Modal
          title={`${t("order_details")} — ${record.orderName}`}
          open={openModal}
          onCancel={(e) => {
            e.stopPropagation();
            setOpenModal(false);
          }}
          footer={null}
          centered
          width={860}
        >
          <Tabs items={tabItems} defaultActiveKey="items" size="middle" />

          <div className="flex justify-end mt-4">
            <Button size="large" onClick={() => setOpenModal(false)}>
              {t("close")}
            </Button>
          </div>
        </Modal>
      </App>
    </>
  );
};

export default UpdateModal;
