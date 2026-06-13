import type { Order } from "@/interfaces/orders.interface";
import { Modal, Table, Divider } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RiEyeLine } from "react-icons/ri";
import { Button } from "antd";

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

      <Modal
        title={`${t("order_details")} — ${record.orderName}`}
        open={openModal}
        onCancel={(e) => {
          e.stopPropagation();
          setOpenModal(false);
        }}
        footer={null}
        centered
        width={800}
      >
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

          <Divider orientation="left">{t("items")}</Divider>
          <Table
            dataSource={record.items}
            columns={itemColumns}
            pagination={false}
            rowKey="id"
            size="small"
          />

          <div className="flex justify-end mt-4">
            <Button
              size="large"
              onClick={() => setOpenModal(false)}
            >
              {t("close")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UpdateModal;

