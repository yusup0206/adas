import type { ClientValues } from "@/interfaces/clients.interface";
import { useCreateClientMutation } from "@/services/clientsApi";
import { App, Button, Form, Input, Modal } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPlus } from "react-icons/fa6";

const CreateModal = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();

  const [form] = Form.useForm();

  //   states
  const [openModal, setOpenModal] = useState(false);

  // queries
  const [create] = useCreateClientMutation();

  // handlers
  const handleCreate = async (values: ClientValues) => {
    try {
      await create(values).unwrap();
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
        title={t("add_new")}
        open={openModal}
        onCancel={() => setOpenModal(false)}
        footer={null}
        centered
        width={800}
      >
        <Form
          id="client-create-form"
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          className="grid grid-cols-12 gap-4"
        >
          <Form.Item
            name="name_tm"
            className="col-span-6 m-0"
            label={`${t("name")} (TM)`}
            rules={[{ required: true, message: t("required_field") }]}
          >
            <Input className="w-full" allowClear />
          </Form.Item>

          <Form.Item
            name="name_ru"
            className="col-span-6 m-0"
            label={`${t("name")} (RU)`}
            rules={[{ required: true, message: t("required_field") }]}
          >
            <Input className="w-full" allowClear />
          </Form.Item>

          <Form.Item
            name="directorName_tm"
            className="col-span-6 m-0"
            label={`${t("director_name")} (TM)`}
          >
            <Input className="w-full" allowClear />
          </Form.Item>

          <Form.Item
            name="directorName_ru"
            className="col-span-6 m-0"
            label={`${t("director_name")} (RU)`}
          >
            <Input className="w-full" allowClear />
          </Form.Item>

          <Form.Item
            name="address_tm"
            className="col-span-6 m-0"
            label={`${t("address")} (TM)`}
          >
            <Input className="w-full" allowClear />
          </Form.Item>

          <Form.Item
            name="address_ru"
            className="col-span-6 m-0"
            label={`${t("address")} (RU)`}
          >
            <Input className="w-full" allowClear />
          </Form.Item>

          <Form.Item
            name="bankName_tm"
            className="col-span-6 m-0"
            label={`${t("bank_name")} (TM)`}
          >
            <Input className="w-full" allowClear />
          </Form.Item>

          <Form.Item
            name="bankName_ru"
            className="col-span-6 m-0"
            label={`${t("bank_name")} (RU)`}
          >
            <Input className="w-full" allowClear />
          </Form.Item>

          <Form.Item
            name="swift"
            className="col-span-6 m-0"
            label={t("swift")}
          >
            <Input className="w-full" allowClear />
          </Form.Item>

          <Form.Item
            name="accountNo"
            className="col-span-6 m-0"
            label={t("account_no")}
          >
            <Input className="w-full" allowClear />
          </Form.Item>

          <Form.Item
            name="currentAccount"
            className="col-span-6 m-0"
            label={t("current_account")}
          >
            <Input className="w-full" allowClear />
          </Form.Item>

          <Form.Item
            name="correspondentAccount"
            className="col-span-6 m-0"
            label={t("correspondent_account")}
          >
            <Input className="w-full" allowClear />
          </Form.Item>

          <Form.Item
            name="bankIdCode"
            className="col-span-6 m-0"
            label={t("bank_id_code")}
          >
            <Input className="w-full" allowClear />
          </Form.Item>

          <Form.Item
            name="individualIdNumber"
            className="col-span-6 m-0"
            label={t("individual_id_number")}
          >
            <Input className="w-full" allowClear />
          </Form.Item>

          <div className="col-span-12 w-full grid grid-cols-2 items-center gap-4 mt-4">
            <Button
              type="default"
              size="large"
              onClick={() => setOpenModal(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="primary" htmlType="submit" form="client-create-form" size="large">
              {t("save")}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default CreateModal;
