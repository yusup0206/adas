import type { ProductValues } from "@/interfaces/products.interface";
import { useCreateProductMutation } from "@/services/productsApi";
import { useGetUnitsQuery } from "@/services/unitsApi";
import { App, Button, Form, Input, Modal, Select, InputNumber } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPlus } from "react-icons/fa6";

const CreateModal = () => {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();

  const [form] = Form.useForm();

  //   states
  const [openModal, setOpenModal] = useState(false);

  // queries
  const { data: units } = useGetUnitsQuery();
  const [create] = useCreateProductMutation();

  // handlers
  const handleCreate = async (values: ProductValues) => {
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
          id="product-create-form"
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
            name="unitId"
            className="col-span-6 m-0"
            label={t("unit")}
          >
            <Select
              placeholder={t("select_unit")}
              options={units?.list?.map((u: any) => ({
                value: u.id,
                label: i18n.language === "ru" ? u.name_ru : u.name_tm,
              }))}
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="productionCountry_tm"
            className="col-span-6 m-0"
            label={`${t("production_country")} (TM)`}
          >
            <Input className="w-full" allowClear />
          </Form.Item>
          <Form.Item
            name="productionCountry_ru"
            className="col-span-6 m-0"
            label={`${t("production_country")} (RU)`}
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
            <Button type="primary" htmlType="submit" form="product-create-form" size="large">
              {t("save")}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default CreateModal;
