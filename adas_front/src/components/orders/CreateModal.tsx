import type { OrderValues } from "@/interfaces/orders.interface";
import { useGetSuppliersQuery } from "@/services/suppliersApi";
import { useCreateOrderMutation } from "@/services/ordersApi";
import { useGetProductsQuery } from "@/services/productsApi";
import {
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Divider,
} from "antd";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FaPlus, FaTrash } from "react-icons/fa6";

const CreateModal = () => {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const [openModal, setOpenModal] = useState(false);

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
      };
      form.setFieldsValue({ items: updatedItems });
    }
  };

  // Calculate total price dynamically
  const items = Form.useWatch("items", form);
  const totalPrice = useMemo(() => {
    return (
      items?.reduce((sum: number, item: any) => {
        return sum + (item?.quantity || 0) * (item?.unitPrice || 0);
      }, 0) || 0
    );
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
          initialValues={{ items: [{}] }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="orderName"
              label={t("order_name") || "Order Name"}
              rules={[{ required: true, message: t("required_field") }]}
            >
              <Input placeholder={t("order_name")} allowClear />
            </Form.Item>
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
                allowClear
              />
            </Form.Item>
          </div>

          <Divider orientation="center">{t("products")}</Divider>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div className="w-full flex flex-col gap-8">
                {fields.map(({ key, name, ...restField }) => (
                  <div
                    key={key}
                    className="w-full grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "productId"]}
                      rules={[{ required: true, message: t("required_field") }]}
                      className="w-full"
                    >
                      <Select
                        placeholder={t("select_product")}
                        style={{ width: 250 }}
                        options={products?.list?.map((p) => ({
                          value: p.id,
                          label: i18n.language === "ru" ? p.name_ru : p.name_tm,
                        }))}
                        showSearch
                        allowClear
                        optionFilterProp="label"
                        onSelect={(val: number) =>
                          handleProductSelect(val, name)
                        }
                        className="w-full"
                      />
                    </Form.Item>
                    <div className="w-full flex items-start gap-4">
                      <Form.Item
                        {...restField}
                        name={[name, "quantity"]}
                        rules={[
                          { required: true, message: t("required_field") },
                        ]}
                        className="w-full"
                      >
                        <InputNumber
                          min={1}
                          placeholder={t("quantity")}
                          className="w-full"
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "unitPrice"]}
                        rules={[
                          { required: true, message: t("required_field") },
                        ]}
                        className="w-full"
                      >
                        <InputNumber
                          min={0}
                          placeholder={t("unit_price")}
                          step={0.01}
                          className="w-full"
                        />
                      </Form.Item>
                      {fields.length > 1 && (
                        <div className="w-fit">
                          <Button
                            type="text"
                            icon={<FaTrash />}
                            onClick={() => remove(name)}
                            danger
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<FaPlus />}
                  >
                    {t("add_item")}
                  </Button>
                </Form.Item>
              </div>
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
