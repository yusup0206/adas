import { useCreateSupplierMutation } from "@/services/suppliersApi";
import { App, Button, Form, Input, Modal } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPlus } from "react-icons/fa6";
import type { SupplierValues } from "@/interfaces/suppliers.interface";

const CreateModal = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();

  const [form] = Form.useForm();

  //   states
  const [openModal, setOpenModal] = useState(false);

  // queries
  const [create] = useCreateSupplierMutation();

  // handlers
  const handleCreate = async (values: SupplierValues) => {
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
      >
        <Form
          id="supplier-form"
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          className="grid grid-cols-12 gap-4"
        >
          <Form.Item
            name="name_tm"
            className="col-span-12 m-0"
            label={`${t("name")} (TM)`}
            rules={[{ required: true, message: t("required_field") }]}
          >
            <Input className="w-full" allowClear />
          </Form.Item>
          <Form.Item
            name="name_ru"
            className="col-span-12 m-0"
            label={`${t("name")} (RU)`}
            rules={[{ required: true, message: t("required_field") }]}
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
            <Button type="primary" htmlType="submit" form="supplier-form" size="large">
              {t("save")}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default CreateModal;
