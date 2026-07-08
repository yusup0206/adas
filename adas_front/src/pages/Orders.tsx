import Box from "@/components/shared/Box";
import Section from "@/components/shared/Section";
import Header from "@/components/shared/header/Header";
import { Table, type TableProps } from "antd";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CreateModal from "@/components/orders/CreateModal";
import UpdateModal from "@/components/orders/UpdateModal";
import DeleteModal from "@/components/shared/DeleteModal";
import UpdateStatusModal from "@/components/orders/UpdateStatusModal";
import EditModal from "@/components/orders/EditModal";
import { useSearchParams } from "react-router-dom";
import { IoSearch } from "react-icons/io5";
import { Select, Tag, Input } from "antd";
import {
  useGetOrdersQuery,
  useDeleteOrderMutation,
} from "@/services/ordersApi";
import type { Order } from "@/interfaces/orders.interface";

const Orders = () => {
  const { t, i18n } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();

  // states
  const [filters, setFilters] = useState({
    page: searchParams.get("page") || "1",
    pageSize: searchParams.get("pageSize") || "10",
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "ALL",
  });

  useEffect(() => {
    const params: Record<string, string> = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value === "" || value === undefined || value === null) return;
      if (typeof value === "boolean") {
        params[key] = value ? "true" : "false";
      } else {
        params[key] = value.toString();
      }
    });

    setSearchParams(params);
  }, [filters, setSearchParams]);

  const { data: ordersData, isLoading: ordersLoading } =
    useGetOrdersQuery(filters);
  const [deleteOrder] = useDeleteOrderMutation();

  // table data
  const columns: TableProps<Order>["columns"] = [
    {
      title: t("order_name") || "Order Name",
      dataIndex: "orderName",
      key: "orderName",
      render: (orderName: string) => (
        <span className="font-semibold">{orderName}</span>
      ),
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
      title: t("status"),
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "RECEIVED" ? "green" : "orange"}>
          {t(`${status}`)}
        </Tag>
      ),
    },

    {
      title: t("totalPrice"),
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price: number) => `${Number(price).toFixed(2)} $`,
    },
    {
      title: t("additional_expenses"),
      dataIndex: "expenses",
      key: "expenses",
      render: (expenses: any) => {
        if (!expenses) return "0.00 $";

        const expenseFields = [
          "tax",
          "director",
          "customs",
          "transportation",
          "workers",
          "stockExchange",
          "forensics",
          "bank",
          "textileMinistry",
          "export",
          "minusConjugation",
          "additionalExpenses",
        ];

        const total = expenseFields.reduce((sum, key) => {
          const val = Number(expenses[key] ?? 0);
          return sum + (isNaN(val) ? 0 : val);
        }, 0);

        return (
          <span className="text-blue-600 font-medium">{`${total.toFixed(2)} $`}</span>
        );
      },
    },

    {
      title: t("payment"),
      dataIndex: "isPaid",
      key: "isPaid",
      render: (isPaid: boolean) => (
        <Tag color={isPaid ? "green" : "red"}>
          {isPaid ? t("paid") : t("unpaid")}
        </Tag>
      ),
    },

    {
      title: t("actions"),
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2 items-center justify-start text-textColor">
          <EditModal record={record} />
          <UpdateModal record={record} />
          <DeleteModal
            id={record.id}
            onDelete={async (id) => await deleteOrder(Number(id)).unwrap()}
          />
          {record.status !== "RECEIVED" && (
            <UpdateStatusModal record={record} />
          )}
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
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-fit max-w-full md:max-w-[566px]">
                <Input
                  prefix={<IoSearch />}
                  size="large"
                  placeholder={t("search_by_order_name")}
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                      page: "1",
                    }))
                  }
                  allowClear
                  className="w-full md:w-[350px]"
                />
                <Select
                  value={filters.status}
                  onChange={(val) =>
                    setFilters((prev) => ({ ...prev, status: val, page: "1" }))
                  }
                  size="large"
                  className="w-full md:w-[200px]"
                  options={[
                    { value: "ALL", label: t("all_orders") || "All Orders" },
                    { value: "PENDING", label: t("pending") || "Pending" },
                    { value: "RECEIVED", label: t("received") || "Received" },
                  ]}
                />
              </div>
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
