import type { Client, ClientValues } from "@/interfaces/clients.interface";
import { useUpdateClientMutation } from "@/services/clientsApi";
import { App, Button, Form, Input, Modal } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RiPencilFill } from "react-icons/ri";

const UpdateModal = ({ record }: { record: Client }) => {
  const { t } = useTranslation();
  const { message } = App.useApp();

  const [form] = Form.useForm();

  //   states
  const [openModal, setOpenModal] = useState(false);

  // queries
  const [update] = useUpdateClientMutation();

  // handlers
  const handleUpdate = async (values: ClientValues) => {
    try {
      await update({ id: record.id, body: values }).unwrap();
      setOpenModal(false);
      message.success(t("successfully_updated"));
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = () => {
    form.setFieldsValue({
      name_tm: record.name_tm,
      name_ru: record.name_ru,
      directorName_tm: record.directorName_tm,
      directorName_ru: record.directorName_ru,
      address_tm: record.address_tm,
      address_ru: record.address_ru,
      bankName_tm: record.bankName_tm,
      bankName_ru: record.bankName_ru,
      swift: record.swift,
      accountNo: record.accountNo,
      currentAccount: record.currentAccount,
      correspondentAccount: record.correspondentAccount,
      bankIdCode: record.bankIdCode,
      individualIdNumber: record.individualIdNumber,
    });
    setOpenModal(true);
  };

  return (
    <>
      <RiPencilFill
        size={20}
        onClick={(e) => {
          e.stopPropagation();
          handleOpen();
        }}
        className="size-5 cursor-pointer hover:text-primary active:text-primary transition-all"
      />

      <Modal
        title={t("update")}
        open={openModal}
        onCancel={(e) => {
          e.stopPropagation();
          setOpenModal(false);
        }}
        footer={null}
        centered
        width={800}
      >
        <Form
          id={`client-update-form-${record.id}`}
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
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
              onClick={(e) => {
                e.stopPropagation();
                setOpenModal(false);
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              form={`client-update-form-${record.id}`}
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

export default UpdateModal;
