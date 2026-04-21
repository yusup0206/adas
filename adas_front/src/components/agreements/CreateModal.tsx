import type { AgreementValues } from "@/interfaces/agreement.interface";
import { useCreateAgreementMutation } from "@/services/agreementApi";
import { useGetOrdersQuery } from "@/services/ordersApi";
import { useGetClientsQuery } from "@/services/clientsApi";
import { App, Button, DatePicker, Form, Input, Modal, Select } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPlus } from "react-icons/fa6";

const CreateModal = () => {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();

  const [form] = Form.useForm();

  // states
  const [openModal, setOpenModal] = useState(false);

  // queries
  const { data: orders } = useGetOrdersQuery();
  const { data: clients } = useGetClientsQuery();
  const [create] = useCreateAgreementMutation();

  // handlers
  const handleCreate = async (values: any) => {
    try {
      const payload: AgreementValues = {
        agreementNumber: values.agreementNumber,
        registeredDate: values.registeredDate?.toISOString(),
        validDate: values.validDate?.toISOString(),
        status: values.status,
        buyerClientId: values.buyerClientId || null,
        sellerClientId: values.sellerClientId || null,
        order_ids: values.order_ids,
      };
      await create(payload).unwrap();
      setOpenModal(false);
      message.success(t("successfully_created"));
      form.resetFields();
    } catch (error) {
      console.error(error);
    }
  };

  const clientOptions = clients?.list?.map((c) => ({
    value: c.id,
    label: i18n.language === "ru" ? c.name_ru : c.name_tm,
  }));

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
        title={t("add_new")}
        open={openModal}
        onCancel={() => setOpenModal(false)}
        footer={null}
        centered
        width={700}
      >
        <Form
          id="agreement-create-form"
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          className="grid grid-cols-12 gap-4"
        >
          <Form.Item
            name="agreementNumber"
            className="col-span-12 m-0"
            label={t("agreement_number")}
            rules={[{ required: true, message: t("required_field") }]}
          >
            <Input className="w-full" allowClear />
          </Form.Item>

          <Form.Item
            name="registeredDate"
            className="col-span-6 m-0"
            label={t("registered_date")}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="validDate"
            className="col-span-6 m-0"
            label={t("valid_date")}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="status"
            className="col-span-12 m-0"
            label={t("status")}
            rules={[{ required: true, message: t("required_field") }]}
          >
            <Select
              placeholder={t("status")}
              options={[
                { value: "active", label: t("active") },
                { value: "closed", label: t("closed") },
              ]}
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="buyerClientId"
            className="col-span-6 m-0"
            label={t("buyer_client")}
          >
            <Select
              placeholder={t("select_buyer_client")}
              options={clientOptions}
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="sellerClientId"
            className="col-span-6 m-0"
            label={t("seller_client")}
          >
            <Select
              placeholder={t("select_seller_client")}
              options={clientOptions}
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="order_ids"
            className="col-span-12 m-0"
            label={t("orders")}
          >
            <Select
              mode="multiple"
              placeholder={t("select_orders")}
              options={orders?.list?.map((order) => ({
                value: order.id,
                label: `${t("order")} #${order.id}`,
              }))}
              allowClear
            />
          </Form.Item>

          <div className="col-span-12 w-full grid grid-cols-2 items-center gap-4 mt-4">
            <Button
              type="default"
              size="large"
              onClick={() => setOpenModal(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              form="agreement-create-form"
              size="large"
            >
              {t("save")}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default CreateModal;
