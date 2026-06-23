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
import { FaArrowRight, FaTrash } from "react-icons/fa6";
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
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

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

  // Product map for label lookup
  const productMap = useMemo(() => {
    const map = new Map<number, string>();
    stock?.forEach((s) =>
      map.set(
        s.productId,
        (i18n.language === "ru" ? s.product?.name_ru : s.product?.name_tm) ??
          "",
      ),
    );
    return map;
  }, [stock, i18n.language]);

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

  const handleClose = () => {
    setOpen(false);
    setSelectedProductIds([]);
    form.resetFields();
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
      setSelectedProductIds([]);
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

  // When product selection changes, sync into form items
  const handleProductSelectionChange = (ids: number[]) => {
    setSelectedProductIds(ids);
    const currentItems: any[] = form.getFieldValue("items") || [];
    // Build a map of existing item data keyed by productId
    const existingMap = new Map<number, any>();
    currentItems.forEach((item) => {
      if (item?.productId) existingMap.set(item.productId, item);
    });
    // Produce new items list preserving existing quantity/sellPrice
    const newItems = ids.map((id) => {
      if (existingMap.has(id)) return existingMap.get(id);
      return { productId: id, quantity: undefined, sellPrice: undefined };
    });
    form.setFieldsValue({ items: newItems.length ? newItems : [] });
  };

  return (
    <>
      <Button
        icon={<FaArrowRight />}
        size="large"
        onClick={handleOpen}
        className="max-w-full md:max-w-fit w-full"
        type="primary"
      >
        {t("dispatch_product")}
      </Button>

      <Modal
        title={t("dispatch_product")}
        open={open}
        onCancel={handleClose}
        footer={null}
        centered
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ items: [] }}
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

          {/* Step 1: Multi-select products */}
          <Form.Item label={t("select_product")}>
            <Select
              mode="multiple"
              placeholder={t("select_product")}
              className="w-full"
              showSearch
              optionFilterProp="label"
              options={productOptions}
              value={selectedProductIds}
              onChange={handleProductSelectionChange}
              allowClear
            />
          </Form.Item>

          {/* Step 2: Items list — only shown when products are selected */}
          {selectedProductIds.length > 0 && (
            <Form.List name="items">
              {(fields, { remove }) => (
                <div className="w-full flex flex-col gap-4">
                  {/* Header row */}
                  <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
                    <span>{t("product")}</span>
                    <span>{t("quantity")}</span>
                    <span>{t("sell_price")}</span>
                    <span />
                  </div>

                  {fields.map(({ key, name, ...restField }) => {
                    const productId = items?.[name]?.productId;
                    const productName = productId
                      ? (productMap.get(productId) ?? "")
                      : "";
                    const maxQty = productId
                      ? (stockMap.get(productId) ?? undefined)
                      : undefined;

                    return (
                      <div
                        key={key}
                        className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-start"
                      >
                        {/* Product name (read-only display) */}
                        <div className="flex items-center h-8 px-3 rounded-md bg-gray-50 border border-gray-200 text-sm font-medium truncate">
                          {productName}
                        </div>

                        {/* Hidden productId field to keep form value */}
                        <Form.Item
                          {...restField}
                          name={[name, "productId"]}
                          hidden
                        >
                          <InputNumber />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          className="w-full mb-0"
                          name={[name, "quantity"]}
                          rules={[
                            { required: true, message: t("required_field") },
                            {
                              validator: (_, value) => {
                                if (!value) return Promise.resolve();
                                const pid = form.getFieldValue([
                                  "items",
                                  name,
                                  "productId",
                                ]);
                                if (!pid) return Promise.resolve();
                                const available = stockMap.get(pid) ?? 0;
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
                          className="w-full mb-0"
                        >
                          <InputNumber
                            min={0}
                            step={0.01}
                            placeholder={t("sell_price")}
                            addonAfter="$"
                            className="w-full"
                          />
                        </Form.Item>

                        <div className="pt-1">
                          <Button
                            type="text"
                            icon={<FaTrash />}
                            onClick={() => {
                              // Remove from both form list and selectedProductIds
                              const pid = form.getFieldValue([
                                "items",
                                name,
                                "productId",
                              ]);
                              remove(name);
                              setSelectedProductIds((prev) =>
                                prev.filter((id) => id !== pid),
                              );
                            }}
                            danger
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Form.List>
          )}

          {/* Total + buttons */}
          <div className="flex justify-between items-center mt-4 border-t pt-4">
            <div className="text-lg font-bold">
              {t("total")}: {totalSell.toFixed(2)} $
            </div>
            <Space>
              <Button size="large" onClick={handleClose}>
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
