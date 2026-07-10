import { useState } from "react";
import { Table, Button, App, Modal, Form, Input, Space } from "antd";
import { useTranslation } from "react-i18next";
import Header from "@/components/shared/header/Header";
import Section from "@/components/shared/Section";
import Box from "@/components/shared/Box";
import {
  useGetFormulasQuery,
  useCreateFormulaMutation,
  useUpdateFormulaMutation,
  useDeleteFormulaMutation,
} from "@/services/expenseFormulasApi";
import type { ExpenseFormula } from "@/services/expenseFormulasApi";
import { FaPlus } from "react-icons/fa6";
import { RiPencilFill } from "react-icons/ri";
import DeleteModal from "@/components/shared/DeleteModal";

const ExpenseFormulas = () => {
  const { message } = App.useApp();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data, isLoading } = useGetFormulasQuery();
  const [createFormula, { isLoading: isCreating }] = useCreateFormulaMutation();
  const [updateFormula, { isLoading: isUpdating }] = useUpdateFormulaMutation();
  const [deleteFormula, { isLoading: isDeleting }] = useDeleteFormulaMutation();

  const handleOpenAdd = () => {
    form.resetFields();
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: ExpenseFormula) => {
    form.setFieldsValue({
      name: record.name || t(`expense_${record.key}`),
      formula: record.formula,
    });
    setEditingId(record.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number | string) => {
    try {
      await deleteFormula(Number(id)).unwrap();
      message.success(t("successfully_deleted"));
    } catch {
      message.error(t("error_occurred"));
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await updateFormula({ id: editingId, ...values }).unwrap();
        message.success(t("successfully_updated"));
      } else {
        await createFormula(values).unwrap();
        message.success(t("successfully_created"));
      }
      setIsModalOpen(false);
    } catch (err: any) {
      if (err?.data?.message) {
        message.error(err.data.message);
      } else if (err?.errorFields) {
        // Validation error
      } else {
        message.error(t("error_occurred"));
      }
    }
  };

  const columns = [
    {
      title: "№",
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
    },
    {
      title: t("name"),
      dataIndex: "name",
      render: (name: string, record: ExpenseFormula) => name || t(`expense_${record.key}`),
    },
    {
      title: t("formula"),
      dataIndex: "formula",
      render: (formula: string) => <span className="font-mono bg-gray-100 px-2 py-1 rounded">{formula}</span>,
    },
    {
      title: t("actions"),
      width: 120,
      render: (_: any, record: ExpenseFormula) => (
        <Space>
          <RiPencilFill
            size={20}
            onClick={() => handleOpenEdit(record)}
            className="size-5 cursor-pointer hover:text-primary active:text-primary transition-all"
          />
          <DeleteModal id={record.id} onDelete={handleDelete} />
        </Space>
      ),
    },
  ];

  return (
    <section>
      <Header title={t("expense_formulas")} />
      <Section>
        <Box>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{t("expense_formulas")}</h2>
            <Button type="primary" icon={<FaPlus />} onClick={handleOpenAdd}>
              {t("add_new")}
            </Button>
          </div>
          
          <Table
            loading={isLoading || isDeleting}
            columns={columns}
            dataSource={data?.data || []}
            rowKey="id"
            pagination={false}
          />
        </Box>
      </Section>

      <Modal
        title={editingId ? t("edit") : t("add_new")}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={form.submit}
        confirmLoading={isCreating || isUpdating}
        okText={t("save")}
        cancelText={t("cancel")}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label={t("name")}
            rules={[{ required: true, message: t("required_field") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="formula"
            label={t("formula")}
            rules={[
              { required: true, message: t("required_field") },
              {
                validator(_, value) {
                  if (!value || value === "") return Promise.resolve();
                  const isPercent =
                    String(value).endsWith("%") &&
                    !isNaN(parseFloat(String(value)));
                  const isFlat = !isNaN(Number(value));
                  if (isPercent || isFlat) return Promise.resolve();
                  return Promise.reject(new Error(t("formula_invalid")));
                },
              },
            ]}
          >
            <Input placeholder="5% or 12.50" suffix="$ / %" className="font-mono" />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
};

export default ExpenseFormulas;
