import { App, Button, Form, Modal } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RiDeleteBin7Fill } from "react-icons/ri";

interface DeleteModalProps {
  id: number | string;
  onDelete: (id: number | string) => Promise<any>;
}

const DeleteModal = ({ id, onDelete }: DeleteModalProps) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  // states
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // handlers
  const handleDelete = async () => {
    try {
      setLoading(true);
      await onDelete(id);
      setOpenModal(false);
      message.success(t("successfully_deleted"));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <RiDeleteBin7Fill
        onClick={(e) => {
          e.stopPropagation();
          setOpenModal(true);
        }}
        className="size-5 cursor-pointer hover:text-red-500 active:text-red-500 transition-all"
      />
      <Modal
        title={t("delete")}
        open={openModal}
        onCancel={(e) => {
          e.stopPropagation();
          setOpenModal(false);
        }}
        footer={null}
        centered
        
      >
        <Form form={form} layout="vertical" onFinish={handleDelete}>
          <div className="text-center my-6">
            <p className="text-lg">{t("delete_message")}</p>
          </div>

          <div className="col-span-12 w-full grid grid-cols-2 items-center gap-4 mt-4">
            <Button
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
              danger
              htmlType="submit"
              size="large"
              loading={loading}
              onClick={(e) => e.stopPropagation()}
            >
              {t("delete")}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default DeleteModal;
