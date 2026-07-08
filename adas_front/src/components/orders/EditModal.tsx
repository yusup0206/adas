import type { OrderValues } from "@/interfaces/orders.interface";
import { App, Button, Divider, Form, Input, InputNumber, Modal, Select, Space } from "antd";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useUpdateOrderMutation } from "@/services/ordersApi";
import { useGetSuppliersQuery } from "@/services/suppliersApi";
import { useGetProductsQuery } from "@/services/productsApi";
import { RiPencilFill } from "react-icons/ri";
import { FaPlus, FaTrash } from "react-icons/fa6";

const EditModal = ({ record }: { record: any }) => {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  const { data: suppliers } = useGetSuppliersQuery();
  const { data: products } = useGetProductsQuery({ pageSize: "100" });
  const [updateOrder, { isLoading }] = useUpdateOrderMutation();

  const handleOpen = () => {
    form.setFieldsValue({
      orderName: record.orderName,
      supplierId: record.supplierId,
      items: record.items?.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })) ?? [{}],
    });
    setOpen(true);
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

  const handleUpdate = async (values: any) => {
    try {
      const payload: Partial<OrderValues> = {
        orderName: values.orderName,
        supplierId: values.supplierId,
        totalPrice,
        items: values.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };
      await updateOrder({ id: record.id, body: payload }).unwrap();
      message.success(t("successfully_updated"));
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <RiPencilFill
        size={20}
        onClick={handleOpen}
        className="size-5 cursor-pointer hover:text-primary active:text-primary transition-all"
      />
      <Modal
        title={t("update")}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        centered
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
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
                        options={products?.list?.map((p) => ({
                          value: p.id,
                          label: i18n.language === "ru" ? p.name_ru : p.name_tm,
                        }))}
                        showSearch
                        allowClear
                        optionFilterProp="label"
                        className="w-full"
                      />
                    </Form.Item>
                    <div className="w-full flex items-start gap-4">
                      <Form.Item
                        {...restField}
                        name={[name, "quantity"]}
                        rules={[{ required: true, message: t("required_field") }]}
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
                        rules={[{ required: true, message: t("required_field") }]}
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
              {t("total")}: {totalPrice.toFixed(2)} $
            </div>
            <Space>
              <Button size="large" onClick={() => setOpen(false)}>
                {t("cancel")}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isLoading}
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

export default EditModal;
