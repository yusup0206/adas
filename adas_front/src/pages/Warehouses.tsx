import Box from "@/components/shared/Box";
import Section from "@/components/shared/Section";
import Header from "@/components/shared/header/Header";
import DeleteModal from "@/components/shared/DeleteModal";
import CreateArrivalModal from "@/components/warehouse/CreateArrivalModal";
import CreateDispatchModal from "@/components/warehouse/CreateDispatchModal";
import {
  useGetStockQuery,
  useGetArrivalsQuery,
  useGetDispatchesQuery,
  useDeleteArrivalMutation,
  useDeleteDispatchMutation,
} from "@/services/warehouseApi";
import { Table, Tabs, Tag, Typography, Modal, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import type { TabsProps, TableProps } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  WarehouseType,
  WarehouseArrival,
  WarehouseDispatch,
  WarehouseStockItem,
  DispatchGroup,
} from "@/interfaces/warehouses.interface";
import dayjs from "dayjs";

const { Text } = Typography;

const WarehousePanel = ({
  warehouseType,
}: {
  warehouseType: WarehouseType;
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [arrivalPage, setArrivalPage] = useState(1);
  const [dispatchPage, setDispatchPage] = useState(1);
  const pageSize = 10;

  const { data: stock, isLoading: stockLoading } = useGetStockQuery({
    type: warehouseType,
  });
  const { data: arrivals, isLoading: arrivalsLoading } = useGetArrivalsQuery({
    type: warehouseType,
    page: arrivalPage,
    pageSize,
  });
  const { data: dispatches, isLoading: dispatchesLoading } =
    useGetDispatchesQuery({
      type: warehouseType,
      page: dispatchPage,
      pageSize,
    });

  const [deleteArrival] = useDeleteArrivalMutation();
  const [deleteDispatch] = useDeleteDispatchMutation();

  const [viewProductsGroup, setViewProductsGroup] =
    useState<DispatchGroup | null>(null);

  // ── Stock columns ──────────────────────────────────────────────────────────
  const stockColumns: TableProps<WarehouseStockItem>["columns"] = [
    {
      title: "№",
      render: (_: unknown, __: unknown, i: number) => i + 1,
      width: 60,
    },
    {
      title: t("product"),
      render: (_, r) =>
        lang === "ru" ? r.product?.name_ru : r.product?.name_tm,
    },
    {
      title: t("unit"),
      render: (_, r) =>
        (lang === "ru" ? r.product?.unit?.name_ru : r.product?.unit?.name_tm) ||
        "-",
    },
    {
      title: t("total_arrived"),
      dataIndex: "totalArrived",
      render: (v: number) => <Text>{v}</Text>,
    },
    {
      title: t("total_dispatched"),
      dataIndex: "totalDispatched",
      render: (v: number) => <Text>{v}</Text>,
    },
    {
      title: t("in_stock"),
      dataIndex: "currentStock",
      render: (v: number) => <Tag color={v > 0 ? "green" : "red"}>{v}</Tag>,
    },
  ];

  // ── Arrival columns ────────────────────────────────────────────────────────
  const arrivalColumns: TableProps<WarehouseArrival>["columns"] = [
    {
      title: "№",
      render: (_: unknown, __: unknown, i: number) =>
        (arrivalPage - 1) * pageSize + i + 1,
      width: 60,
    },
    {
      title: t("date"),
      dataIndex: "arrivalDate",
      render: (v: string) => dayjs(v).format("DD.MM.YYYY"),
    },
    {
      title: t("product"),
      render: (_, r) =>
        lang === "ru" ? r.product?.name_ru : r.product?.name_tm,
    },
    {
      title: t("quantity"),
      dataIndex: "quantity",
    },
    {
      title: t("unit_price"),
      dataIndex: "unitPrice",
      render: (v: number) => `${Number(v).toFixed(2)} $`,
    },
    {
      title: t("total_price"),
      dataIndex: "totalPrice",
      render: (v: number) => `${Number(v).toFixed(2)} $`,
    },
    {
      title: warehouseType === "IMPORT" ? t("supplier") : t("client"),
      render: (_, r) => {
        const entity = warehouseType === "IMPORT" ? r.supplier : r.client;
        if (!entity) return "-";
        return lang === "ru" ? entity.name_ru : entity.name_tm;
      },
    },
    {
      title: t("note"),
      dataIndex: "note",
      render: (v: string) => v || "-",
    },
    {
      title: t("actions"),
      render: (_, r) => (
        <DeleteModal
          id={r.id}
          onDelete={async (id) => await deleteArrival(Number(id)).unwrap()}
        />
      ),
      width: 80,
    },
  ];

  // ── Dispatch columns ───────────────────────────────────────────────────────
  const dispatchColumns: TableProps<DispatchGroup>["columns"] = [
    {
      title: "№",
      render: (_: unknown, __: unknown, i: number) =>
        (dispatchPage - 1) * pageSize + i + 1,
      width: 60,
    },
    {
      title: t("dispatch_name"),
      dataIndex: "dispatchName",
      render: (v: string) => v || "-",
    },
    {
      title: t("date"),
      dataIndex: "dispatchDate",
      render: (v: string) => dayjs(v).format("DD.MM.YYYY"),
    },
    {
      title: t("client"),
      render: (_, r) => {
        if (!r.client) return "-";
        return lang === "ru" ? r.client.name_ru : r.client.name_tm;
      },
    },
    {
      title: t("items"),
      dataIndex: "itemCount",
    },
    {
      title: t("total_price"),
      dataIndex: "totalSellPrice",
      render: (v: number) => `${Number(v).toFixed(2)} $`,
    },
    {
      title: t("actions"),
      render: (_, r) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => setViewProductsGroup(r)}
        />
      ),
      width: 80,
    },
  ];

  // Inner columns for the products modal
  const innerDispatchColumns: TableProps<WarehouseDispatch>["columns"] = [
    {
      title: "№",
      render: (_: unknown, __: unknown, i: number) => i + 1,
      width: 60,
    },
    {
      title: t("product"),
      render: (_, r) =>
        lang === "ru" ? r.product?.name_ru : r.product?.name_tm,
    },
    {
      title: t("quantity"),
      dataIndex: "quantity",
    },
    {
      title: t("sell_price"),
      dataIndex: "sellPrice",
      render: (v: number) => `${Number(v).toFixed(2)} $`,
    },
    {
      title: t("total_price"),
      dataIndex: "totalSellPrice",
      render: (v: number) => `${Number(v).toFixed(2)} $`,
    },
    {
      title: t("note"),
      dataIndex: "note",
      render: (v: string) => v || "-",
    },
    {
      title: t("actions"),
      render: (_, r) => (
        <DeleteModal
          id={r.id}
          onDelete={async (id) => await deleteDispatch(Number(id)).unwrap()}
        />
      ),
      width: 80,
    },
  ];

  const innerTabs: TabsProps["items"] = [
    {
      key: "stock",
      label: t("stock"),
      children: (
        <Table
          loading={stockLoading}
          columns={stockColumns}
          dataSource={stock || []}
          rowKey="productId"
          size="middle"
          pagination={false}
        />
      ),
    },
    {
      key: "arrivals",
      label: t("arrivals"),
      children: (
        <>
          <div className="flex justify-end mb-4">
            <CreateArrivalModal warehouseType={warehouseType} />
          </div>
          <Table
            loading={arrivalsLoading}
            columns={arrivalColumns}
            dataSource={arrivals?.list || []}
            rowKey="id"
            size="middle"
            pagination={{
              position: ["bottomCenter"],
              current: arrivalPage,
              pageSize,
              total: arrivals?.total || 0,
              onChange: (p) => setArrivalPage(p),
            }}
          />
        </>
      ),
    },
    {
      key: "dispatches",
      label: t("dispatches"),
      children: (
        <>
          <div className="flex justify-end mb-4">
            <CreateDispatchModal warehouseType={warehouseType} />
          </div>
          <Table
            loading={dispatchesLoading}
            columns={dispatchColumns}
            dataSource={dispatches?.list || []}
            rowKey="id"
            size="middle"
            pagination={{
              position: ["bottomCenter"],
              current: dispatchPage,
              pageSize,
              total: dispatches?.total || 0,
              onChange: (p) => setDispatchPage(p),
            }}
          />
        </>
      ),
    },
  ];

  return (
    <>
      <Tabs defaultActiveKey="stock" items={innerTabs} />
      <Modal
        title={t("view_products")}
        open={!!viewProductsGroup}
        onCancel={() => setViewProductsGroup(null)}
        footer={null}
        width={800}
      >
        <Table
          columns={innerDispatchColumns}
          dataSource={viewProductsGroup?.items || []}
          rowKey="id"
          size="small"
          pagination={false}
        />
      </Modal>
    </>
  );
};

const Warehouses = () => {
  const { t } = useTranslation();

  const tabs: TabsProps["items"] = [
    {
      key: "IMPORT",
      label: t("import_warehouse"),
      children: <WarehousePanel warehouseType="IMPORT" />,
    },
    {
      key: "EXPORT",
      label: t("export_warehouse"),
      children: <WarehousePanel warehouseType="EXPORT" />,
    },
  ];

  return (
    <section>
      <Header title={t("warehouses")} />
      <Section>
        <Box>
          <Tabs defaultActiveKey="IMPORT" items={tabs} size="large" />
        </Box>
      </Section>
    </section>
  );
};

export default Warehouses;
