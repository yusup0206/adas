import Box from "@/components/shared/Box";
import Section from "@/components/shared/Section";
import Header from "@/components/shared/header/Header";
import { Input, Table, type TableProps, Tag } from "antd";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IoEyeOutline, IoSearch } from "react-icons/io5";

import CreateModal from "@/components/agreements/CreateModal";
import UpdateModal from "@/components/agreements/UpdateModal";
import { useGetAgreementsQuery } from "@/services/agreementApi";
import type { Agreement } from "@/interfaces/agreement.interface";
import dayjs from "dayjs";

const Agreements = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const { data: agreements, isLoading: agreementsLoading } =
    useGetAgreementsQuery(filters);

  // table data
  const columns: TableProps<Agreement>["columns"] = [
    {
      title: "№",
      dataIndex: "index",
      key: "index",
      render: (_: unknown, __: unknown, index: number) =>
        (Number(filters.page) - 1) * Number(filters.pageSize) + index + 1,
    },

    {
      title: t("agreement_number"),
      dataIndex: "agreementNumber",
      key: "agreementNumber",
      render: (_, record) => record.agreementNumber || "-",
    },

    {
      title: t("registered_date"),
      dataIndex: "registeredDate",
      key: "registeredDate",
      render: (date: string) => date ? dayjs(date).format("DD.MM.YYYY") : "-",
    },

    {
      title: t("valid_date"),
      dataIndex: "validDate",
      key: "validDate",
      render: (date: string) => date ? dayjs(date).format("DD.MM.YYYY") : "-",
    },

    {
      title: t("buyer_client"),
      key: "buyerClient",
      render: (_, record) => {
        if (!record.buyerClient) return "-";
        return currentLang === "ru" ? record.buyerClient.name_ru : record.buyerClient.name_tm;
      },
    },

    {
      title: t("seller_client"),
      key: "sellerClient",
      render: (_, record) => {
        if (!record.sellerClient) return "-";
        return currentLang === "ru" ? record.sellerClient.name_ru : record.sellerClient.name_tm;
      },
    },

    {
      title: t("status"),
      dataIndex: "status",
      key: "status",
      render: (_, record) => {
        if (!record.status) return "-";
        return (
          <Tag color={record.status === "active" ? "green" : "red"}>
            {t(record.status)}
          </Tag>
        );
      },
    },

    {
      title: t("actions"),
      key: "action",
      render: (_, record) => (
        <div className="flex gap-4 items-center justify-start text-textColor">
          <IoEyeOutline
            className="text-xl cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate(`/agreements/${record.id}`)}
          />
          <UpdateModal record={record} />
        </div>
      ),
    },
  ];

  return (
    <>
      <section>
        <Header title={t("agreements")} />
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
              loading={agreementsLoading}
              size="large"
              columns={columns}
              dataSource={agreements?.list || []}
              rowKey="id"
              pagination={{
                position: ["bottomCenter"],
                current: Number(filters.page),
                pageSize: Number(filters.pageSize),
                total: agreements?.total || 0,
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

export default Agreements;
