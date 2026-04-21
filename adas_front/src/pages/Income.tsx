import Box from "@/components/shared/Box";
import Section from "@/components/shared/Section";
import Header from "@/components/shared/header/Header";
import {
  Card,
  Spin,
  Table,
  type TableProps,
  Tag,
  Space,
  Typography,
  Tabs,
} from "antd";
import { useTranslation } from "react-i18next";
import { useGetIncomeSummaryQuery } from "@/services/incomeApi";
import type {
  IncomeProduct,
  IncomeTransaction,
} from "@/interfaces/income.interface";
import {
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaChartLine,
  FaBoxOpen,
  FaBookOpen,
} from "react-icons/fa6";

const { Title, Text } = Typography;

const Income = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language === "ru" ? "ru" : "tm";

  const { data, isLoading } = useGetIncomeSummaryQuery();

  const productColumns: TableProps<IncomeProduct>["columns"] = [
    {
      title: "№",
      key: "index",
      render: (_: unknown, __: unknown, index: number) => index + 1,
      width: 60,
    },
    {
      title: t("name"),
      key: "name",
      render: (_, record) =>
        currentLang === "ru" ? record.name_ru : record.name_tm,
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
    },
    {
      title: t("buy_price"),
      dataIndex: "buyPrice",
      key: "buyPrice",
      render: (val: number) => `${Number(val).toFixed(2)} TMT`,
    },
    {
      title: t("sell_price"),
      dataIndex: "sellPrice",
      key: "sellPrice",
      render: (val: number) => `${Number(val).toFixed(2)} TMT`,
    },
    {
      title: t("quantity_sold"),
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      render: (val: number) => (
        <Tag color="processing" style={{ borderRadius: 6 }}>
          {val}
        </Tag>
      ),
    },
    {
      title: t("total_cost"),
      dataIndex: "totalCost",
      key: "totalCost",
      render: (val: number) => (
        <Text type="danger" strong>
          {Number(val).toFixed(2)} TMT
        </Text>
      ),
    },
    {
      title: t("total_revenue"),
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (val: number) => (
        <Text type="success" strong>
          {Number(val).toFixed(2)} TMT
        </Text>
      ),
    },
    {
      title: t("total_profit"),
      dataIndex: "totalProfit",
      key: "totalProfit",
      render: (val: number) => (
        <Tag
          color={val >= 0 ? "success" : "error"}
          style={{ borderRadius: 6, fontWeight: "bold" }}
        >
          {val >= 0 ? "+" : ""}
          {Number(val).toFixed(2)} TMT
        </Tag>
      ),
    },
  ];

  const transactionColumns: TableProps<IncomeTransaction>["columns"] = [
    {
      title: t("id"),
      dataIndex: "orderId",
      key: "orderId",
      render: (id) => <Tag color="default">#{id}</Tag>,
      width: 100,
    },
    {
      title: t("date"),
      dataIndex: "date",
      key: "date",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: t("supplier"),
      key: "supplier",
      render: (_, record) =>
        record.supplier?.[currentLang as keyof typeof record.supplier] || "-",
    },
    {
      title: t("product"),
      key: "product",
      render: (_, record) =>
        currentLang === "ru" ? record.productName_ru : record.productName_tm,
    },
    {
      title: t("quantity"),
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: t("total_profit"),
      dataIndex: "profit",
      key: "profit",
      render: (val: number) => (
        <Text type={val >= 0 ? "success" : "danger"} strong>
          {val >= 0 ? "+" : ""}
          {Number(val).toFixed(2)} TMT
        </Text>
      ),
    },
  ];

  if (isLoading) {
    return (
      <section className="p-6">
        <Header title={t("income")} />
        <Section>
          <Box>
            <div className="flex items-center justify-center py-40">
              <Spin size="large" tip="Loading financial data..." />
            </div>
          </Box>
        </Section>
      </section>
    );
  }

  const items = [
    {
      key: "1",
      label: (
        <Space>
          <FaBoxOpen />
          {t("products")}
        </Space>
      ),
      children: (
        <Table
          columns={productColumns}
          dataSource={data?.products || []}
          rowKey="productId"
          pagination={{ position: ["bottomCenter"], pageSize: 12 }}
          className="overflow-x-auto"
        />
      ),
    },
    {
      key: "2",
      label: (
        <Space>
          <FaBookOpen />
          {t("history")}
        </Space>
      ),
      children: (
        <Table
          columns={transactionColumns}
          dataSource={data?.transactions || []}
          rowKey="id"
          pagination={{ position: ["bottomCenter"], pageSize: 12 }}
          className="overflow-x-auto"
        />
      ),
    },
  ];

  return (
    <section className="bg-gray-50 min-h-screen">
      <Header title={t("income")} />
      <Section>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card
            hoverable
            className="shadow-lg border-0 overflow-hidden"
            bodyStyle={{ padding: 0 }}
            style={{ borderRadius: 20 }}
          >
            <div className="p-6 bg-linear-to-br from-blue-600 to-indigo-700 h-full">
              <Space direction="vertical" size={0}>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 13,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {t("total_revenue")}
                </Text>
                <Title
                  level={2}
                  style={{ color: "#fff", margin: 0, marginTop: 4 }}
                >
                  {Number(data?.totalRevenue || 0).toLocaleString()}{" "}
                  <span className="text-sm font-normal">TMT</span>
                </Title>
              </Space>
              <div className="absolute right-6 bottom-6 opacity-20">
                <FaArrowTrendUp size={48} color="#fff" />
              </div>
            </div>
          </Card>

          <Card
            hoverable
            className="shadow-lg border-0 overflow-hidden"
            bodyStyle={{ padding: 0 }}
            style={{ borderRadius: 20 }}
          >
            <div className="p-6 bg-linear-to-br from-rose-500 to-orange-600 h-full">
              <Space direction="vertical" size={0}>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 13,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {t("total_cost")}
                </Text>
                <Title
                  level={2}
                  style={{ color: "#fff", margin: 0, marginTop: 4 }}
                >
                  {Number(data?.totalCost || 0).toLocaleString()}{" "}
                  <span className="text-sm font-normal">TMT</span>
                </Title>
              </Space>
              <div className="absolute right-6 bottom-6 opacity-20">
                <FaArrowTrendDown size={48} color="#fff" />
              </div>
            </div>
          </Card>

          <Card
            hoverable
            className="shadow-lg border-0 overflow-hidden"
            bodyStyle={{ padding: 0 }}
            style={{ borderRadius: 20 }}
          >
            <div
              className={`p-6 bg-linear-to-br ${(data?.totalProfit || 0) >= 0 ? "from-emerald-500 to-teal-600" : "from-red-600 to-red-800"} h-full`}
            >
              <Space direction="vertical" size={0}>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 13,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {t("total_profit")}
                </Text>
                <Title
                  level={2}
                  style={{ color: "#fff", margin: 0, marginTop: 4 }}
                >
                  {Number(data?.totalProfit || 0).toLocaleString()}{" "}
                  <span className="text-sm font-normal">TMT</span>
                </Title>
              </Space>
              <div className="absolute right-6 bottom-6 opacity-20">
                <FaChartLine size={48} color="#fff" />
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Box>
          <div className="p-6">
            <Tabs defaultActiveKey="1" items={items} size="large" />
          </div>
        </Box>
      </Section>
    </section>
  );
};

export default Income;
