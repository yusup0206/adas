import type { Product, ProductValues } from "@/interfaces/products.interface";
import { useUpdateProductMutation } from "@/services/productsApi";
import { useGetUnitsQuery } from "@/services/unitsApi";
import { App, Button, Form, Input, Modal, Select, InputNumber } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RiPencilFill } from "react-icons/ri";

const UpdateModal = ({ record }: { record: Product }) => {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();

  const [form] = Form.useForm();

  //   states
  const [openModal, setOpenModal] = useState(false);

  // queries
  const { data: units } = useGetUnitsQuery();
  const [update] = useUpdateProductMutation();

  // handlers
  const handleUpdate = async (values: ProductValues) => {
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
      unitId: record.unitId,
      productionCountry_tm: record.productionCountry_tm,
      productionCountry_ru: record.productionCountry_ru,
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
        
      >
        <Form
          id={`product-update-form-${record.id}`}
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          className="grid grid-cols-12 gap-4"
        >
          <Form.Item name="name_tm" className="col-span-6 m-0" label={`${t("name")} (TM)`}>
            <Input className="w-full" allowClear />
          </Form.Item>
          <Form.Item name="name_ru" className="col-span-6 m-0" label={`${t("name")} (RU)`}>
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
                form={`product-update-form-${record.id}`}
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
