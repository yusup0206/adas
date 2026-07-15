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
import UpdateModal from "@/components/suppliers/UpdateModal";

import { useUrlFilters } from "@/hooks/useUrlFilters";

const Suppliers = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language === "ru" ? "ru" : "tm";

  // states
  const { filters, setFilters } = useUrlFilters({
    page: "1",
    pageSize: "10",
    search: "",
  });

  // queries
  const { data: suppliersData, isLoading: suppliersLoading } =
    useGetSuppliersQuery(filters);
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
      render: (_, record) =>
        (currentLang === "ru" ? record.name_ru : record.name_tm) || "-",
    },

    {
      title: t("actions"),
      key: "action",
      render: (_, record) => (
        <div className="flex gap-4 items-center justify-start text-textColor">
          <UpdateModal record={record} />
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
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                      page: "1",
                    }))
                  }
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
