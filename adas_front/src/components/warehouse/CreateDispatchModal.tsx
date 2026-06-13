import {
  App,
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
} from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaArrowRight, FaPlus, FaTrash } from "react-icons/fa6";
import { useCreateDispatchMutation, useGetStockQuery } from "@/services/warehouseApi";
import { useGetClientsQuery } from "@/services/clientsApi";
import type { WarehouseType } from "@/interfaces/warehouses.interface";
import dayjs from "dayjs";

interface Props {
  warehouseType: WarehouseType;
}

const CreateDispatchModal = ({ warehouseType }: Props) => {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  const { data: stock, refetch: refetchStock } = useGetStockQuery({ type: warehouseType });
  const { data: clients } = useGetClientsQuery();
  const [createDispatch, { isLoading }] = useCreateDispatchMutation();

  // Stock map for quick lookup
  const stockMap = useMemo(() => {
    const map = new Map<number, number>();
    stock?.forEach((s) => map.set(s.productId, s.currentStock));
    return map;
  }, [stock]);

  // Live total calculation
  const items = Form.useWatch("items", form);
  const totalSell = useMemo(() => {
    return (
      items?.reduce((sum: number, item: any) => {
        return sum + (item?.quantity || 0) * (item?.sellPrice || 0);
      }, 0) || 0
    );
  }, [items]);

  const handleOpen = () => {
    refetchStock();
    setOpen(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      await createDispatch({
        warehouseType,
        clientId: values.clientId || null,
        note: values.note || "",
        dispatchDate: values.dispatchDate
          ? dayjs(values.dispatchDate).toISOString()
          : undefined,
        items: values.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          sellPrice: item.sellPrice,
        })),
      }).unwrap();
      message.success(t("successfully_created"));
      form.resetFields();
      setOpen(false);
    } catch (err: any) {
      message.error(err?.data?.message || t("error"));
    }
  };

  const productOptions = stock
    ?.filter((s) => s.currentStock > 0)
    .map((s) => ({
      value: s.productId,
      label: `${
        i18n.language === "ru" ? s.product?.name_ru : s.product?.name_tm
      } (${t("in_stock")}: ${s.currentStock})`,
    })) || [];

  return (
    <>
      <Button
        icon={<FaArrowRight />}
        size="large"
        onClick={handleOpen}
        className="max-w-full md:max-w-fit w-full"
      >
        {t("dispatch_product")}
      </Button>

      <Modal
        title={t("dispatch_product")}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        centered
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ items: [{}] }}
        >
          {/* Client & date */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="clientId" label={t("client")}>
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

            <Form.Item name="dispatchDate" label={t("date")}>
              <DatePicker className="w-full" />
            </Form.Item>
          </div>

          <Form.Item name="note" label={t("note")}>
            <Input.TextArea rows={2} placeholder={t("note")} />
          </Form.Item>

          <Divider orientation="left">{t("products")}</Divider>

          {/* Multi-item list */}
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => {
                  const selectedProductId = items?.[name]?.productId;
                  const maxQty = selectedProductId
                    ? (stockMap.get(selectedProductId) ?? undefined)
                    : undefined;

                  return (
                    <Space
                      key={key}
                      style={{ display: "flex", marginBottom: 8 }}
                      align="baseline"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "productId"]}
                        rules={[{ required: true, message: t("required_field") }]}
                      >
                        <Select
                          placeholder={t("select_product")}
                          style={{ width: 260 }}
                          showSearch
                          optionFilterProp="label"
                          options={productOptions}
                          onChange={() => {
                            // Reset quantity when product changes
                            const currentItems = form.getFieldValue("items") || [];
                            const updated = [...currentItems];
                            updated[name] = { ...updated[name], quantity: undefined };
                            form.setFieldsValue({ items: updated });
                            // Re-validate quantity field
                            form.validateFields([["items", name, "quantity"]]);
                          }}
                        />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, "quantity"]}
                        rules={[
                          { required: true, message: t("required_field") },
                          {
                            validator: (_, value) => {
                              if (!value) return Promise.resolve();
                              const selectedProductId = form.getFieldValue([
                                "items",
                                name,
                                "productId",
                              ]);
                              if (!selectedProductId) return Promise.resolve();
                              const available = stockMap.get(selectedProductId) ?? 0;
                              if (value > available) {
                                return Promise.reject(
                                  new Error(
                                    `${t("max_stock")}: ${available}`
                                  )
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <InputNumber
                          min={1}
                          max={maxQty}
                          placeholder={t("quantity")}
                          style={{ width: 110 }}
                        />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, "sellPrice"]}
                        rules={[{ required: true, message: t("required_field") }]}
                      >
                        <InputNumber
                          min={0}
                          step={0.01}
                          placeholder={t("sell_price")}
                          style={{ width: 130 }}
                          addonAfter="TMT"
                        />
                      </Form.Item>

                      {fields.length > 1 && (
                        <FaTrash
                          className="text-red-500 cursor-pointer mb-2"
                          onClick={() => remove(name)}
                        />
                      )}
                    </Space>
                  );
                })}

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
              </>
            )}
          </Form.List>

          {/* Total + buttons */}
          <div className="flex justify-between items-center mt-4 border-t pt-4">
            <div className="text-lg font-bold">
              {t("total")}: {totalSell.toFixed(2)} TMT
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

export default CreateDispatchModal;
