import Box from "@/components/shared/Box";
import Section from "@/components/shared/Section";
import Header from "@/components/shared/header/Header";
import { Input, Table, type TableProps } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { IoSearch } from "react-icons/io5";
import type { Supplier } from "@/interfaces/suppliers.interface";
import {
  useDeleteSupplierMutation,
  useGetSuppliersQuery,
} from "@/services/suppliersApi";
import DeleteModal from "@/components/shared/DeleteModal";
import CreateModal from "@/components/suppliers/CreateModal";

const Suppliers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language === "ru" ? "ru" : "tm";

  // states
  const [filters, setFilters] = useState({
    page: searchParams.get("page") || "1",
    pageSize: searchParams.get("pageSize") || "10",
    search: searchParams.get("search") || "",
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

  // queries
  const { data: suppliersData, isLoading: suppliersLoading } = useGetSuppliersQuery(filters);
  const [deleteSupplier] = useDeleteSupplierMutation();

  // table data
  const columns: TableProps<Supplier>["columns"] = [
    {
      title: "№",
      dataIndex: "index",
      key: "index",
      render: (_: unknown, __: unknown, index: number) =>
        (Number(filters.page) - 1) * Number(filters.pageSize) + index + 1,
    },

    {
      title: t("name"),
      dataIndex: `name_${currentLang}`,
      key: "name",
      render: (_, record) => (currentLang === "ru" ? record.name_ru : record.name_tm) || "-",
    },

    {
      title: t("totalAmount"),
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => `${Number(amount).toFixed(2)}`,
    },

    {
      title: t("remainingDebt"),
      dataIndex: "remainingDebt",
      key: "remainingDebt",
      render: (amount: number) => (
        <span className={Number(amount) > 0 ? "text-red-500 font-bold" : "text-green-500"}>
          {Number(amount).toFixed(2)}
        </span>
      ),
    },

    {
      title: t("actions"),
      key: "action",
      render: (_, record) => (
        <div className="flex gap-4 items-center justify-start text-textColor">
          {/* Add UpdateModal later */}
          <DeleteModal id={record.id} onDelete={deleteSupplier} />
        </div>
      ),
    },
  ];

  return (
    <>
      <section>
        <Header title={t("suppliers")} />
        <Section>
          <Box>
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="max-w-full md:max-w-[300px] w-full">
                <Input
                  prefix={<IoSearch />}
                  size="large"
                  placeholder={t("search")}
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: "1" }))}
                  allowClear
                />
              </div>
              <CreateModal />
            </div>
            <Table
              loading={suppliersLoading}
              size="large"
              columns={columns}
              dataSource={suppliersData?.list || []}
              rowKey="id"
              pagination={{
                position: ["bottomCenter"],
                current: Number(filters.page),
                pageSize: Number(filters.pageSize),
                total: suppliersData?.total || 0,
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

export default Suppliers;
