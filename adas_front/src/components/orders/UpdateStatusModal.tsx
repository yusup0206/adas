import { App, Button, Modal, Select } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUpdateOrderStatusMutation } from "@/services/ordersApi";

const UpdateStatusModal = ({ orderId, currentStatus }: { orderId: number, currentStatus: string }) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [updateStatus, { isLoading }] = useUpdateOrderStatusMutation();

  const handleUpdate = async () => {
    try {
      await updateStatus({ orderId, status }).unwrap();
      message.success(t("successfully_updated"));
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Button size="small" onClick={() => setOpen(true)}>
        {t("change_status")}
      </Button>
      <Modal
        title={t("change_status")}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleUpdate}
        confirmLoading={isLoading}
        centered
      >
        <Select
          className="w-full mt-4 mb-4"
          value={status}
          onChange={(val) => setStatus(val)}
          options={[
            { value: "PENDING", label: t("pending") || "Pending" },
            { value: "RECEIVED", label: t("received") || "Received" },
          ]}
        />
      </Modal>
    </>
  );
};

export default UpdateStatusModal;
