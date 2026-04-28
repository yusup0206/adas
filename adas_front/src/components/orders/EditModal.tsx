import { App, Button, Form, InputNumber, Modal, Select } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUpdateOrderMutation } from "@/services/ordersApi";
import { useGetSuppliersQuery } from "@/services/suppliersApi";
import { RiPencilFill } from "react-icons/ri";

const EditModal = ({ record }: { record: any }) => {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const { data: suppliers } = useGetSuppliersQuery();
  const [updateOrder, { isLoading }] = useUpdateOrderMutation();

  const handleOpen = () => {
    form.setFieldsValue({
      supplierId: record.supplierId,
      totalPrice: record.totalPrice,
    });
    setOpen(true);
  };

  const handleUpdate = async (values: any) => {
    try {
      await updateOrder({ id: record.id, body: values }).unwrap();
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
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            name="supplierId"
            label={t("supplier")}
            rules={[{ required: true }]}
          >
            <Select
              options={suppliers?.list?.map((s) => ({
                value: s.id,
                label: i18n.language === "ru" ? s.name_ru : s.name_tm,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="totalPrice"
            label={t("total_price")}
            rules={[{ required: true }]}
          >
            <InputNumber className="w-full" step={0.01} />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setOpen(false)}>{t("cancel")}</Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              {t("save")}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default EditModal;
