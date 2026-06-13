import Box from "@/components/shared/Box";
import Section from "@/components/shared/Section";
import Header from "@/components/shared/header/Header";
import { Table, Tag, Tabs, Space } from "antd";
import type { TableProps } from "antd";
import { useTranslation } from "react-i18next";
import { useGetIncomeSummaryQuery } from "@/services/incomeApi";
import type {
  IncomeProduct,
  IncomeSale,
  IncomePurchase,
} from "@/interfaces/income.interface";
import {
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaChartLine,
  FaBoxOpen,
  FaCartShopping,
  FaTruckFast,
} from "react-icons/fa6";

// ── Stat card (matches Debt page pattern) ─────────────────────────────────
const StatCard = ({
  icon,
  label,
  value,
  color,
  bg,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bg: string;
  sub?: string;
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
      {sub && <p className="text-xs text-gray-400 truncate mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Main Income page ───────────────────────────────────────────────────────
const Income = () => {
  const { t, i18n } = useTranslation();
  const isRu = i18n.language === "ru";

  const { data, isLoading } = useGetIncomeSummaryQuery();

  // ── Products table columns ───────────────────────────────────────────────
  const productColumns: TableProps<IncomeProduct>["columns"] = [
    {
      title: "№",
      key: "index",
      width: 55,
      render: (_: unknown, __: unknown, i: number) => (
        <span className="text-gray-400 font-medium">{i + 1}</span>
      ),
    },
    {
      title: t("name"),
      key: "name",
      render: (_, r) => (
        <span className="font-semibold">
          {isRu ? r.name_ru : r.name_tm}
        </span>
      ),
    },
    {
      title: t("quantity_sold"),
      dataIndex: "quantitySold",
      key: "quantitySold",
      render: (v: number) => (
        <Tag color="processing" style={{ borderRadius: 6 }}>
          {v}
        </Tag>
      ),
    },
    {
      title: t("quantity_purchased"),
      dataIndex: "quantityPurchased",
      key: "quantityPurchased",
      render: (v: number) => (
        <Tag color="default" style={{ borderRadius: 6 }}>
          {v}
        </Tag>
      ),
    },
    {
      title: t("total_revenue"),
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (v: number) => (
        <span className="text-green-600 font-semibold">
          {Number(v).toFixed(2)} TMT
        </span>
      ),
    },
    {
      title: t("total_cost"),
      dataIndex: "totalCost",
      key: "totalCost",
      render: (v: number) => (
        <span className="text-red-500 font-semibold">
          {Number(v).toFixed(2)} TMT
        </span>
      ),
    },
    {
      title: t("total_profit"),
      dataIndex: "totalProfit",
      key: "totalProfit",
      render: (v: number) => (
        <Tag
          color={v >= 0 ? "success" : "error"}
          style={{ borderRadius: 6, fontWeight: "bold" }}
        >
          {v >= 0 ? "+" : ""}
          {Number(v).toFixed(2)} TMT
        </Tag>
      ),
    },
  ];

  // ── Sales table columns ──────────────────────────────────────────────────
  const salesColumns: TableProps<IncomeSale>["columns"] = [
    {
      title: "№",
      key: "index",
      width: 55,
      render: (_: unknown, __: unknown, i: number) => (
        <span className="text-gray-400 font-medium">{i + 1}</span>
      ),
    },
    {
      title: t("date"),
      dataIndex: "date",
      key: "date",
      render: (d: string) => (
        <span className="text-gray-600">
          {new Date(d).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: t("product"),
      key: "product",
      render: (_, r) => (
        <span className="font-semibold">
          {isRu ? r.productName_ru : r.productName_tm}
        </span>
      ),
    },
    {
      title: t("client"),
      key: "client",
      render: (_, r) =>
        r.client ? (isRu ? r.client.ru : r.client.tm) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: t("quantity"),
      dataIndex: "quantity",
      key: "quantity",
      render: (v: number) => (
        <Tag color="processing" style={{ borderRadius: 6 }}>
          {v}
        </Tag>
      ),
    },
    {
      title: t("sell_price"),
      dataIndex: "sellPrice",
      key: "sellPrice",
      render: (v: number) => `${Number(v).toFixed(2)} TMT`,
    },
    {
      title: t("total_sell_price"),
      dataIndex: "totalSellPrice",
      key: "totalSellPrice",
      render: (v: number) => (
        <span className="text-green-600 font-bold">
          {Number(v).toFixed(2)} TMT
        </span>
      ),
    },
    {
      title: t("note"),
      dataIndex: "note",
      key: "note",
      render: (v: string) =>
        v ? v : <span className="text-gray-400">—</span>,
    },
  ];

  // ── Purchases table columns ──────────────────────────────────────────────
  const purchaseColumns: TableProps<IncomePurchase>["columns"] = [
    {
      title: "№",
      key: "index",
      width: 55,
      render: (_: unknown, __: unknown, i: number) => (
        <span className="text-gray-400 font-medium">{i + 1}</span>
      ),
    },
    {
      title: t("date"),
      dataIndex: "date",
      key: "date",
      render: (d: string) => (
        <span className="text-gray-600">
          {new Date(d).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: t("order"),
      dataIndex: "orderId",
      key: "orderId",
      render: (id: number) => <Tag color="default">#{id}</Tag>,
    },
    {
      title: t("product"),
      key: "product",
      render: (_, r) => (
        <span className="font-semibold">
          {isRu ? r.productName_ru : r.productName_tm}
        </span>
      ),
    },
    {
      title: t("supplier"),
      key: "supplier",
      render: (_, r) =>
        r.supplier ? (isRu ? r.supplier.ru : r.supplier.tm) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: t("quantity"),
      dataIndex: "quantity",
      key: "quantity",
      render: (v: number) => (
        <Tag color="default" style={{ borderRadius: 6 }}>
          {v}
        </Tag>
      ),
    },
    {
      title: t("unit_price"),
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (v: number) => `${Number(v).toFixed(2)} TMT`,
    },
    {
      title: t("total_cost"),
      dataIndex: "totalCost",
      key: "totalCost",
      render: (v: number) => (
        <span className="text-red-500 font-bold">
          {Number(v).toFixed(2)} TMT
        </span>
      ),
    },
  ];

  const tabs = [
    {
      key: "products",
      label: (
        <Space>
          <FaBoxOpen />
          {t("products")}
        </Space>
      ),
      children: (
        <Table
          loading={isLoading}
          columns={productColumns}
          dataSource={data?.products || []}
          rowKey="productId"
          size="large"
          pagination={{ position: ["bottomCenter"], pageSize: 10 }}
          className="overflow-x-auto"
        />
      ),
    },
    {
      key: "sales",
      label: (
        <Space>
          <FaTruckFast />
          {t("sales")}
        </Space>
      ),
      children: (
        <Table
          loading={isLoading}
          columns={salesColumns}
          dataSource={data?.sales || []}
          rowKey="id"
          size="large"
          pagination={{ position: ["bottomCenter"], pageSize: 10 }}
          className="overflow-x-auto"
        />
      ),
    },
    {
      key: "purchases",
      label: (
        <Space>
          <FaCartShopping />
          {t("purchases")}
        </Space>
      ),
      children: (
        <Table
          loading={isLoading}
          columns={purchaseColumns}
          dataSource={data?.purchases || []}
          rowKey="id"
          size="large"
          pagination={{ position: ["bottomCenter"], pageSize: 10 }}
          className="overflow-x-auto"
        />
      ),
    },
  ];

  const profit = data?.totalProfit ?? 0;

  return (
    <>
      <section>
        <Header title={t("income")} />
        <Section>
          {/* ── 3 Stat cards ── */}
          <div className="flex flex-col sm:flex-row gap-4">
            <StatCard
              icon={<FaArrowTrendUp />}
              label={t("total_revenue")}
              value={
                isLoading
                  ? "..."
                  : `${Number(data?.totalRevenue ?? 0).toFixed(2)} TMT`
              }
              sub={`${t("total_sales")}: ${data?.sales?.length ?? 0}`}
              color="text-green-600"
              bg="bg-green-50"
            />
            <StatCard
              icon={<FaArrowTrendDown />}
              label={t("total_cost")}
              value={
                isLoading
                  ? "..."
                  : `${Number(data?.totalCost ?? 0).toFixed(2)} TMT`
              }
              sub={`${t("total_purchases")}: ${data?.purchases?.length ?? 0}`}
              color="text-red-500"
              bg="bg-red-50"
            />
            <StatCard
              icon={<FaChartLine />}
              label={t("total_profit")}
              value={
                isLoading
                  ? "..."
                  : `${profit >= 0 ? "+" : ""}${Number(profit).toFixed(2)} TMT`
              }
              color={profit >= 0 ? "text-blue-600" : "text-red-500"}
              bg={profit >= 0 ? "bg-blue-50" : "bg-red-50"}
            />
          </div>

          {/* ── Tables ── */}
          <Box>
            <Tabs
              defaultActiveKey="products"
              items={tabs}
              size="large"
            />
          </Box>
        </Section>
      </section>
    </>
  );
};

export default Income;
