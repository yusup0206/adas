import {
  App,
  Button,
  DatePicker,
  Divider,
  Form,
  InputNumber,
  Modal,
  Select,
  Space,
  Tabs,
} from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPlus, FaTrash } from "react-icons/fa6";
import {
  usePayLoanGroupByMoneyMutation,
  usePayLoanGroupByProductMutation,
} from "@/services/loansApi";
import { useGetProductsQuery } from "@/services/productsApi";
import type { LoanGroup } from "@/interfaces/loans.interface";
import dayjs from "dayjs";

interface Props {
  loanGroup: LoanGroup | null;
  open: boolean;
  onClose: () => void;
}

const ImportLoanPayModal = ({ loanGroup, open, onClose }: Props) => {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();
  const [moneyForm] = Form.useForm();
  const [productForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState("money");

  const [payByMoney, { isLoading: payingMoney }] =
    usePayLoanGroupByMoneyMutation();
  const [payByProduct, { isLoading: payingProduct }] =
    usePayLoanGroupByProductMutation();

  const { data: productsData } = useGetProductsQuery({ pageSize: "200" });

  const productOptions = useMemo(
    () =>
      productsData?.list?.map((p) => ({
        value: p.id,
        label: i18n.language === "ru" ? p.name_ru : p.name_tm,
      })) ?? [],
    [productsData, i18n.language],
  );

  if (!loanGroup) return null;

  const currentDebt =
    Number(loanGroup.totalAmount) - Number(loanGroup.paidAmount ?? 0);

  const handleClose = () => {
    moneyForm.resetFields();
    productForm.resetFields();
    setActiveTab("money");
    onClose();
  };

  // ── Pay by money ────────────────────────────────────────────────────────────
  const handlePayMoney = async (values: any) => {
    try {
      await payByMoney({
        groupId: loanGroup.dispatchGroupId,
        amount: values.amount,
        payDate: values.payDate
          ? dayjs(values.payDate).format("YYYY-MM-DD")
          : undefined,
      }).unwrap();
      message.success(t("payment_recorded"));
      handleClose();
    } catch {
      message.error(t("error"));
    }
  };

  // ── Pay by product ───────────────────────────────────────────────────────────
  const handlePayProduct = async (values: any) => {
    try {
      await payByProduct({
        groupId: loanGroup.dispatchGroupId,
        items: values.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        payDate: values.payDate
          ? dayjs(values.payDate).format("YYYY-MM-DD")
          : undefined,
      }).unwrap();
      message.success(t("payment_recorded"));
      handleClose();
    } catch {
      message.error(t("error"));
    }
  };

  const clientName =
    i18n.language === "ru"
      ? loanGroup.client?.name_ru
      : loanGroup.client?.name_tm;

  return (
    <Modal
      title={`${t("loan_repayment")} — ${clientName}`}
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={600}
      destroyOnClose
    >
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 mb-1">{t("total_price")}</p>
          <p className="font-semibold">
            {Number(loanGroup.totalAmount).toFixed(2)} $
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <p className="text-gray-500 mb-1">{t("current_debt")}</p>
          <p className="font-semibold text-red-500">
            {currentDebt.toFixed(2)} $
          </p>
        </div>
      </div>

      <Divider className="my-3" />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "money",
            label: t("pay_by_money"),
            children: (
              <Form
                form={moneyForm}
                layout="vertical"
                onFinish={handlePayMoney}
              >
                <div className="flex gap-4">
                  <Form.Item
                    name="payDate"
                    label={t("pay_date")}
                    className="flex-1"
                    initialValue={dayjs()}
                  >
                    <DatePicker
                      className="w-full"
                      format="DD.MM.YYYY"
                      allowClear={false}
                    />
                  </Form.Item>
                  <Form.Item
                    name="amount"
                    label={t("pay_amount")}
                    className="flex-1"
                    rules={[{ required: true, message: t("required_field") }]}
                  >
                    <InputNumber
                      className="w-full"
                      min={0.01}
                      max={currentDebt}
                      step={0.01}
                      placeholder={t("enter_amount")}
                      addonAfter="$"
                    />
                  </Form.Item>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button onClick={handleClose}>{t("cancel")}</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={payingMoney}
                  >
                    {t("pay")}
                  </Button>
                </div>
              </Form>
            ),
          },
          {
            key: "product",
            label: t("pay_by_product"),
            children: (
              <Form
                form={productForm}
                layout="vertical"
                onFinish={handlePayProduct}
                initialValues={{ items: [{}] }}
              >
                <Form.Item
                  name="payDate"
                  label={t("pay_date")}
                  initialValue={dayjs()}
                >
                  <DatePicker
                    className="w-full"
                    format="DD.MM.YYYY"
                    allowClear={false}
                  />
                </Form.Item>

                <Divider orientation="center">{t("products")}</Divider>

                <Form.List name="items">
                  {(fields, { add, remove }) => (
                    <div className="w-full flex flex-col gap-8">
                      {fields.map(({ key, name, ...restField }) => {
                        return (
                          <div
                            key={key}
                            className="w-full grid grid-cols-1 md:grid-cols-2 gap-4"
                          >
                            <Form.Item
                              {...restField}
                              name={[name, "productId"]}
                              rules={[
                                {
                                  required: true,
                                  message: t("required_field"),
                                },
                              ]}
                              className="w-full"
                            >
                              <Select
                                placeholder={t("select_product")}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                options={productOptions}
                                onChange={() => {
                                  const current =
                                    productForm.getFieldValue("items") || [];
                                  const updated = [...current];
                                  updated[name] = {
                                    ...updated[name],
                                    quantity: undefined,
                                  };
                                  productForm.setFieldsValue({
                                    items: updated,
                                  });
                                }}
                                className="w-full"
                              />
                            </Form.Item>
                            <div className="w-full flex items-start gap-4">
                              <Form.Item
                                {...restField}
                                name={[name, "quantity"]}
                                rules={[
                                  {
                                    required: true,
                                    message: t("required_field"),
                                  },
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
                                  {
                                    required: true,
                                    message: t("required_field"),
                                  },
                                ]}
                                className="w-full"
                              >
                                <InputNumber
                                  min={0}
                                  step={0.01}
                                  placeholder={t("unit_price")}
                                  className="w-full"
                                  addonAfter="$"
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

                <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                  <Button onClick={handleClose}>{t("cancel")}</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={payingProduct}
                  >
                    {t("save")}
                  </Button>
                </div>
              </Form>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default ImportLoanPayModal;
