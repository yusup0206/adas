import Box from "@/components/shared/Box";
import Section from "@/components/shared/Section";
import Header from "@/components/shared/header/Header";
import { Table, type TableProps } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import CreateModal from "@/components/orders/CreateModal";
import UpdateModal from "@/components/orders/UpdateModal";
import {
  useGetOrdersQuery,
} from "@/services/ordersApi";
import type { Order } from "@/interfaces/orders.interface";

const Orders = () => {
  const { t, i18n } = useTranslation();

  // states
  const [filters, setFilters] = useState({
    page: "1",
    pageSize: "10",
  });

  // queries
  const { data: ordersData, isLoading: ordersLoading } = useGetOrdersQuery(filters);

  // table data
  const columns: TableProps<Order>["columns"] = [
    {
      title: "№",
      dataIndex: "index",
      key: "index",
      render: (_: unknown, __: unknown, index: number) =>
        (Number(filters.page) - 1) * Number(filters.pageSize) + index + 1,
    },

    {
      title: t("supplier"),
      dataIndex: "supplier",
      key: "supplier",
      render: (_, record) => (i18n.language === "ru" ? record.supplier?.name_ru : record.supplier?.name_tm) || "-",
    },

    {
      title: t("type"),
      dataIndex: "type",
      key: "type",
      render: (type: string) => t(type.toLowerCase()),
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
        <span className={isPaid ? "text-green-500" : "text-red-500 font-bold"}>
          {isPaid ? t("paid") : t("unpaid")}
        </span>
      ),
    },

    {
      title: t("actions"),
      key: "action",
      render: (_, record) => (
        <div className="flex gap-4 items-center justify-start text-textColor">
          <UpdateModal record={record} />
          {/* Purchase orders usually aren't deleted directly in this flow */}
        </div>
      ),
    },
  ];

  return (
    <>
      <section>
        <Header title={t("orders")} />
        <Section>
          <Box>
            <div className="w-full flex flex-col md:flex-row items-center justify-end gap-4">
              <CreateModal />
            </div>
            <Table
              loading={ordersLoading}
              size="large"
              columns={columns}
              dataSource={ordersData?.list || []}
              rowKey="id"
              pagination={{
                position: ["bottomCenter"],
                current: Number(filters.page),
                pageSize: Number(filters.pageSize),
                total: ordersData?.total || 0,
                showSizeChanger: true,
                onChange: (page, pageSize) => {
                  setFilters((prev) => ({
                    ...prev,
                    page: page.toString(),
                    pageSize: pageSize.toString(),
                  }));
                },
              }}
              className="overflow-x-auto"
            />
          </Box>
        </Section>
      </section>
    </>
  );
};

export default Orders;
