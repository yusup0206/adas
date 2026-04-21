import Box from "@/components/shared/Box";
import Section from "@/components/shared/Section";
import Header from "@/components/shared/header/Header";
import { Table } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

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

  // functions

  // const confirmDelete = (id: string) => {
  //   modal.confirm({
  //     title: t("delete_category"),
  //     content: t("confirm_delete_category"),
  //     okText: t("delete"),
  //     cancelText: t("cancel"),
  //     okType: "danger",
  //     centered: true,
  //     onOk: async () => {
  //       try {
  //         await deleteInfoHome(id);
  //         message.success(t("successfully_deleted"));
  //         homeRefetch();
  //       } catch (error) {
  //         console.error(error);
  //         message.error(t("error"));
  //       }
  //     },
  //   });
  // };

  // table data
  // const columns: TableProps<InfoHome>["columns"] = [
  //   {
  //     title: "№",
  //     dataIndex: "index",
  //     key: "index",
  //     className: "text-center",
  //     render: (_: unknown, __: unknown, index: number) =>
  //       (Number(filters.page) - 1) * Number(filters.pageSize) + index + 1,
  //   },

  //   {
  //     title: t("name"),
  //     dataIndex: "title",
  //     key: "title",
  //     render: (_, record) => record.title || "-",
  //   },
  //   {
  //     title: t("priority"),
  //     dataIndex: "order",
  //     key: "order",
  //     render: (_, record) => record.order || "-",
  //   },

  //   {
  //     title: t("actions"),
  //     key: "action",
  //     render: (_, record) => (
  //       <div className="flex gap-4 items-center justify-start text-textColor">
  //         <RiPencilFill
  //           onClick={() => openUpdate(record)}
  //           size={20}
  //           className="size-5 cursor-pointer hover:text-primary active:text-primary transition-all"
  //         />

  //         <RiDeleteBin7Fill
  //           onClick={(e) => {
  //             e.stopPropagation();
  //             confirmDelete(record.id);
  //           }}
  //           className="size-5 cursor-pointer hover:text-red-500 active:text-red-500 transition-all"
  //         />
  //       </div>
  //     ),
  //   },
  // ];

  return (
    <>
      <Section>
        <Header title={t("home")} />

        <Box>
          <Table
            // loading={homeLoading}
            // columns={columns}
            // dataSource={infoHome?.data.rows || []}
            rowKey="id"
            pagination={{
              position: ["bottomCenter"],
              current: Number(filters.page),
              pageSize: Number(filters.pageSize),
              // total: infoHome?.data.count || 0,
              showSizeChanger: true,
              onChange: (page, pageSize) => {
                setFilters((prev) => ({
                  ...prev,
                  page: page.toString(),
                  pageSize: pageSize.toString(),
                }));
              },
            }}
          />
        </Box>
      </Section>
    </>
  );
};

export default Home;
