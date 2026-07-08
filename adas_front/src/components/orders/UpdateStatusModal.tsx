import {
  App,
  Button,
  DatePicker,
  Form,
  InputNumber,
  Modal,
  Select,
} from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUpdateOrderStatusMutation } from "@/services/ordersApi";
import type { Order } from "@/interfaces/orders.interface";
import dayjs from "dayjs";

interface Props {
  record: Order;
}

const UpdateStatusModal = ({ record }: Props) => {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(record.status);
  const [updateStatus, { isLoading }] = useUpdateOrderStatusMutation();

  // Selected product IDs for HALF_ARRIVED
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  const handleOpen = () => {
    setSelectedStatus(record.status);
    setSelectedProductIds([]);
    form.resetFields();
    form.setFieldsValue({
      status: record.status,
      arrivalDate: dayjs(),
    });
    setOpen(true);
  };

  const handleFinish = async (values: any) => {
    try {
      const arrivalDate: string = values.arrivalDate
        ? (values.arrivalDate as dayjs.Dayjs).toISOString()
        : new Date().toISOString();

      let partialItems: { productId: number; quantity: number }[] | undefined;

      if (values.status === "HALF_ARRIVED") {
        partialItems = selectedProductIds
          .map((productId) => ({
            productId,
            quantity: values[`qty_${productId}`] as number,
          }))
          .filter((item) => item.quantity > 0);

        if (!partialItems || partialItems.length === 0) {
          message.warning(t("select_at_least_one_product"));
          return;
        }
      }

      await updateStatus({
        orderId: record.id,
        status: values.status,
        arrivalDate,
        partialItems,
      }).unwrap();

      message.success(t("successfully_updated"));
      setOpen(false);
    } catch (error) {
      console.error(error);
      message.error(t("error_occurred"));
    }
  };

  const statusOptions = [
    { value: "PENDING", label: t("pending") || "Pending" },
    { value: "HALF_ARRIVED", label: t("half_arrived") || "Half Arrived" },
    { value: "RECEIVED", label: t("received") || "Received" },
  ];

  return (
    <>
      <Button size="small" onClick={handleOpen}>
        {t("change_status")}
      </Button>

      <Modal
        title={t("change_status")}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        centered
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          className="mt-4"
        >
          {/* Status select */}
          <Form.Item
            name="status"
            label={t("status")}
            rules={[{ required: true }]}
          >
            <Select
              options={statusOptions}
              onChange={(val) => {
                setSelectedStatus(val);
                setSelectedProductIds([]);
              }}
            />
          </Form.Item>

          {/* Arrival date — always shown */}
          <Form.Item
            name="arrivalDate"
            label={t("arrival_date") || "Arrival Date"}
            rules={[{ required: true, message: t("required_field") }]}
          >
            <DatePicker className="w-full" format="DD.MM.YYYY" />
          </Form.Item>

          {/* HALF_ARRIVED: product selector + quantity inputs */}
          {selectedStatus === "HALF_ARRIVED" && (
            <div className="border rounded-md p-3 mb-4 bg-gray-50 flex flex-col gap-4">
              <p className="text-sm font-medium ">
                {t("select_arrived_products") || "Select arrived products"}
              </p>

              {/* Multi-select of products from this order */}
              <Select
                mode="multiple"
                className="w-full "
                placeholder={t("select_product")}
                value={selectedProductIds}
                onChange={(ids: number[]) => setSelectedProductIds(ids)}
                options={record.items
                  .map((item) => {
                    const alreadyArrived =
                      record.warehouseArrivals
                        ?.filter((wa) => wa.productId === item.productId)
                        .reduce((sum, wa) => sum + wa.quantity, 0) || 0;
                    const remainingQty = Math.max(
                      0,
                      item.quantity - alreadyArrived,
                    );
                    return {
                      value: item.productId,
                      label:
                        i18n.language === "ru"
                          ? item.product?.name_ru
                          : item.product?.name_tm,
                      remainingQty,
                    };
                  })
                  .filter((opt) => opt.remainingQty > 0)}
                optionFilterProp="label"
              />

              {/* Quantity input per selected product */}
              {selectedProductIds.map((productId) => {
                const orderItem = record.items.find(
                  (i) => i.productId === productId,
                );
                const productName =
                  i18n.language === "ru"
                    ? orderItem?.product?.name_ru
                    : orderItem?.product?.name_tm;

                const alreadyArrived =
                  record.warehouseArrivals
                    ?.filter((wa) => wa.productId === productId)
                    .reduce((sum, wa) => sum + wa.quantity, 0) || 0;
                const remainingQty = Math.max(
                  0,
                  (orderItem?.quantity || 0) - alreadyArrived,
                );

                return (
                  <Form.Item
                    key={productId}
                    className="m-0"
                    name={`qty_${productId}`}
                    label={`${productName} — ${t("arrived_quantity") || "Arrived qty"} (max: ${remainingQty})`}
                    rules={[
                      { required: true, message: t("required_field") },
                      {
                        type: "number",
                        min: 1,
                        max: remainingQty,
                        message: `1 – ${remainingQty}`,
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      max={remainingQty}
                      className="w-full"
                      placeholder={t("quantity")}
                    />
                  </Form.Item>
                );
              })}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={() => setOpen(false)}>{t("cancel")}</Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              {t("save")}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default UpdateStatusModal;
