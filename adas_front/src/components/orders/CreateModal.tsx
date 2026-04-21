import type { OrderValues } from "@/interfaces/orders.interface";
import { useGetSuppliersQuery } from "@/services/suppliersApi";
import { useCreateOrderMutation } from "@/services/ordersApi";
import { useGetProductsQuery } from "@/services/productsApi";
import { App, Button, Form, InputNumber, Modal, Select, Space, Divider } from "antd";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FaPlus, FaTrash } from "react-icons/fa6";

const CreateModal = () => {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const [openModal, setOpenModal] = useState(false);
  const [orderType, setOrderType] = useState<"CASH" | "INSTALLMENT">("CASH");

  // queries
  const { data: products } = useGetProductsQuery({ pageSize: "100" });
  const { data: suppliers } = useGetSuppliersQuery();
  const [create, { isLoading: isCreating }] = useCreateOrderMutation();

  const handleProductSelect = (productId: number, fieldIndex: number) => {
    const product = products?.list?.find((p) => p.id === productId);
    if (product) {
      const currentItems = form.getFieldValue("items") || [];
      const updatedItems = [...currentItems];
      updatedItems[fieldIndex] = {
        ...updatedItems[fieldIndex],
        unitPrice: product.buyPrice, // Default to buyPrice as it's a purchase order
      };
      form.setFieldsValue({ items: updatedItems });
    }
  };

  // Calculate total price dynamically
  const items = Form.useWatch("items", form);
  const totalPrice = useMemo(() => {
    return items?.reduce((sum: number, item: any) => {
      return sum + (item?.quantity || 0) * (item?.unitPrice || 0);
    }, 0) || 0;
  }, [items]);

  const handleCreate = async (values: any) => {
    try {
      const payload: OrderValues = {
        ...values,
        totalPrice,
        items: values.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };
      await create(payload).unwrap();
      setOpenModal(false);
      message.success(t("successfully_created"));
      form.resetFields();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Button
        type="primary"
        size="large"
        icon={<FaPlus />}
        onClick={() => setOpenModal(true)}
        className="max-w-full md:max-w-fit w-full"
      >
        {t("add_new")}
      </Button>
      <Modal
        title={t("create_purchase_order")}
        open={openModal}
        onCancel={() => setOpenModal(false)}
        footer={null}
        centered
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ type: "CASH", items: [{}] }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="supplierId"
              label={t("supplier")}
              rules={[{ required: true, message: t("required_field") }]}
            >
              <Select
                placeholder={t("select_supplier")}
                options={suppliers?.list?.map((s) => ({
                  value: s.id,
                  label: i18n.language === "ru" ? s.name_ru : s.name_tm,
                }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>

            <Form.Item
              name="type"
              label={t("payment_type")}
              rules={[{ required: true }]}
            >
              <Select
                onChange={(val) => setOrderType(val)}
                options={[
                  { value: "CASH", label: t("cash") },
                  { value: "INSTALLMENT", label: t("installment") },
                ]}
              />
            </Form.Item>

            {orderType === "INSTALLMENT" && (
              <Form.Item
                name="durationMonths"
                label={t("duration_months")}
                rules={[{ required: true, message: t("required_field") }]}
              >
                <Select
                  options={[
                    { value: 3, label: `3 ${t("months")}` },
                    { value: 6, label: `6 ${t("months")}` },
                    { value: 9, label: `9 ${t("months")}` },
                    { value: 12, label: `12 ${t("months")}` },
                  ]}
                />
              </Form.Item>
            )}
          </div>

          <Divider orientation="left">{t("products")}</Divider>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, "productId"]}
                      rules={[{ required: true, message: t("required_field") }]}
                    >
                      <Select
                        placeholder={t("select_product")}
                        style={{ width: 250 }}
                        options={products?.list?.map((p) => ({
                          value: p.id,
                          label: i18n.language === "ru" ? p.name_ru : p.name_tm,
                        }))}
                        showSearch
                        optionFilterProp="label"
                        onSelect={(val: number) => handleProductSelect(val, name)}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "quantity"]}
                      rules={[{ required: true, message: t("required_field") }]}
                    >
                      <InputNumber min={1} placeholder={t("quantity")} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "unitPrice"]}
                      rules={[{ required: true, message: t("required_field") }]}
                    >
                      <InputNumber min={0} placeholder={t("unit_price")} step={0.01} />
                    </Form.Item>
                    {fields.length > 1 && (
                      <FaTrash
                        className="text-red-500 cursor-pointer mb-2"
                        onClick={() => remove(name)}
                      />
                    )}
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<FaPlus />}>
                    {t("add_item")}
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <div className="flex justify-between items-center mt-4 border-t pt-4">
            <div className="text-lg font-bold">
              {t("total")}: {totalPrice.toFixed(2)} TMT
            </div>
            <Space>
              <Button size="large" onClick={() => setOpenModal(false)}>
                {t("cancel")}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isCreating}
              >
                {t("save")}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default CreateModal;
