import { App, Button, DatePicker, Divider, Form, Input, InputNumber, Modal, Select } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPlus } from "react-icons/fa6";
import { useCreateArrivalMutation } from "@/services/warehouseApi";
import { useGetProductsQuery } from "@/services/productsApi";
import { useGetSuppliersQuery } from "@/services/suppliersApi";
import { useGetClientsQuery } from "@/services/clientsApi";
import type { WarehouseType } from "@/interfaces/warehouses.interface";
import dayjs from "dayjs";

interface Props {
  warehouseType: WarehouseType;
}

const CreateArrivalModal = ({ warehouseType }: Props) => {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  const { data: products } = useGetProductsQuery({ pageSize: "200" });
  const { data: suppliers } = useGetSuppliersQuery();
  const { data: clients } = useGetClientsQuery();
  const [createArrival, { isLoading }] = useCreateArrivalMutation();

  const isExport = warehouseType === "EXPORT";

  const handleSubmit = async (values: any) => {
    try {
      await createArrival({
        warehouseType,
        productId: values.productId,
        quantity: values.quantity,
        unitPrice: values.unitPrice,
        supplierId: values.supplierId || null,
        clientId: values.clientId || null,
        note: values.note || "",
        arrivalDate: values.arrivalDate
          ? dayjs(values.arrivalDate).toISOString()
          : undefined,
      }).unwrap();
      message.success(t("successfully_created"));
      form.resetFields();
      setOpen(false);
    } catch (err: any) {
      message.error(err?.data?.message || t("error"));
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<FaPlus />}
        size="large"
        onClick={() => setOpen(true)}
        className="max-w-full md:max-w-fit w-full"
      >
        {t("add_arrival")}
      </Button>

      <Modal
        title={isExport ? t("add_arrival_export") : t("add_arrival_import")}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        centered
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="productId"
              label={t("product")}
              rules={[{ required: true, message: t("required_field") }]}
              className="col-span-2"
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder={t("select_product")}
                options={products?.list?.map((p) => ({
                  value: p.id,
                  label: i18n.language === "ru" ? p.name_ru : p.name_tm,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="quantity"
              label={t("quantity")}
              rules={[{ required: true, message: t("required_field") }]}
            >
              <InputNumber min={1} className="w-full" placeholder={t("quantity")} />
            </Form.Item>

            <Form.Item
              name="unitPrice"
              label={t("unit_price")}
              rules={[{ required: true, message: t("required_field") }]}
            >
              <InputNumber min={0} step={0.01} className="w-full" placeholder={t("unit_price")} />
            </Form.Item>

            {!isExport && (
              <Form.Item name="supplierId" label={t("supplier")} className="col-span-2">
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder={t("select_supplier")}
                  allowClear
                  options={suppliers?.list?.map((s) => ({
                    value: s.id,
                    label: i18n.language === "ru" ? s.name_ru : s.name_tm,
                  }))}
                />
              </Form.Item>
            )}

            {isExport && (
              <Form.Item name="clientId" label={t("client")} className="col-span-2">
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder={t("select_client")}
                  allowClear
                  options={clients?.list?.map((c) => ({
                    value: c.id,
                    label: i18n.language === "ru" ? c.name_ru : c.name_tm,
                  }))}
                />
              </Form.Item>
            )}

            <Form.Item name="arrivalDate" label={t("date")} className="col-span-2">
              <DatePicker className="w-full" format="DD.MM.YYYY" />
            </Form.Item>

            <Form.Item name="note" label={t("note")} className="col-span-2">
              <Input.TextArea rows={2} placeholder={t("note")} />
            </Form.Item>
          </div>

          <Divider />
          <div className="flex justify-end gap-3">
            <Button size="large" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="primary" htmlType="submit" size="large" loading={isLoading}>
              {t("save")}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default CreateArrivalModal;
