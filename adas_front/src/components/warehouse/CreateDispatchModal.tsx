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
  Switch,
} from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaArrowRight, FaPlus, FaTrash } from "react-icons/fa6";
import {
  useCreateDispatchMutation,
  useGetStockQuery,
} from "@/services/warehouseApi";
import { useGetClientsQuery } from "@/services/clientsApi";
import { useGetOrdersQuery } from "@/services/ordersApi";
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

  const { data: stock, refetch: refetchStock } = useGetStockQuery({
    type: warehouseType,
  });
  const { data: clients } = useGetClientsQuery();
  const { data: ordersData } = useGetOrdersQuery({ isPaid: false });
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
        dispatchName: values.dispatchName || "",
        clientId: values.clientId || null,
        note: values.note || "",
        dispatchDate: values.dispatchDate
          ? dayjs(values.dispatchDate).toISOString()
          : undefined,
        isLoan: values.isLoan || false,
        purchaseOrderId: values.purchaseOrderId || null,
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

  const productOptions =
    stock
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
          {/* Client, date & isLoan */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="dispatchName" label={t("dispatch_name")}>
              <Input placeholder={t("dispatch_name")} />
            </Form.Item>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="dispatchDate" label={t("date")}>
              <DatePicker className="w-full" format="DD.MM.YYYY" />
            </Form.Item>
            <div className="flex items-center gap-3">
              <Form.Item name="isLoan" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
              <span className="font-medium text-sm">{t("is_loan")}</span>
            </div>
          </div>

          {/* Link to purchase order */}
          <Form.Item name="purchaseOrderId" label={t("link_to_order")}>
            <Select
              showSearch
              allowClear
              optionFilterProp="label"
              placeholder={t("select_order")}
              options={ordersData?.list?.map((o) => ({
                value: o.id,
                label: `${o.orderName}`,
              }))}
            />
          </Form.Item>

          <Form.Item name="note" label={t("note")}>
            <Input.TextArea rows={2} placeholder={t("note")} />
          </Form.Item>

          <Divider orientation="center">{t("products")}</Divider>

          {/* Multi-item list */}
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div className="w-full flex flex-col gap-8">
                {fields.map(({ key, name, ...restField }) => {
                  const selectedProductId = items?.[name]?.productId;
                  const maxQty = selectedProductId
                    ? (stockMap.get(selectedProductId) ?? undefined)
                    : undefined;

                  return (
                    <div
                      key={key}
                      className="w-full grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "productId"]}
                        rules={[
                          { required: true, message: t("required_field") },
                        ]}
                        className="w-full"
                      >
                        <Select
                          placeholder={t("select_product")}
                          className="w-full"
                          showSearch
                          optionFilterProp="label"
                          options={productOptions}
                          onChange={() => {
                            // Reset quantity when product changes
                            const currentItems =
                              form.getFieldValue("items") || [];
                            const updated = [...currentItems];
                            updated[name] = {
                              ...updated[name],
                              quantity: undefined,
                            };
                            form.setFieldsValue({ items: updated });
                            // Re-validate quantity field
                            form.validateFields([["items", name, "quantity"]]);
                          }}
                        />
                      </Form.Item>
                      <div className="w-full flex items-start gap-4">
                        <Form.Item
                          {...restField}
                          className="w-full"
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
                                if (!selectedProductId)
                                  return Promise.resolve();
                                const available =
                                  stockMap.get(selectedProductId) ?? 0;
                                if (value > available) {
                                  return Promise.reject(
                                    new Error(
                                      `${t("max_stock")}: ${available}`,
                                    ),
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
                            className="w-full"
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "sellPrice"]}
                          rules={[
                            { required: true, message: t("required_field") },
                          ]}
                          className="w-full"
                        >
                          <InputNumber
                            min={0}
                            step={0.01}
                            placeholder={t("sell_price")}
                            addonAfter="$"
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
              </div>
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
