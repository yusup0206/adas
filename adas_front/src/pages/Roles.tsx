import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
} from "antd";
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from "@/services/rolesApi";
import { useGetPermissionsQuery } from "@/services/permissionsApi";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/shared/header/Header";
import Section from "@/components/shared/Section";
import Box from "@/components/shared/Box";

const Roles = () => {
  const { data: rolesData, isLoading } = useGetRolesQuery({});
  const { data: permissionsData } = useGetPermissionsQuery({});
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();
  const { t } = useTranslation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [form] = Form.useForm();

  const handleOpenModal = (role = null) => {
    setEditingRole(role);
    if (role) {
      form.setFieldsValue({
        name: role.name,
        permissionIds: role.permissions.map((p: any) => p.id),
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingRole(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRole) {
        await updateRole({ id: editingRole.id, body: values }).unwrap();
        message.success("Role updated successfully");
      } else {
        await createRole(values).unwrap();
        message.success("Role created successfully");
      }
      handleCloseModal();
    } catch (error: any) {
      message.error(error?.data?.message || "Error saving role");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteRole(id).unwrap();
      message.success("Role deleted successfully");
    } catch (error: any) {
      message.error(error?.data?.message || "Error deleting role");
    }
  };

  const columns = [
    { title: t("id"), dataIndex: "id", key: "id" },
    { title: t("role_name"), dataIndex: "name", key: "name" },
    {
      title: t("permissions"),
      key: "permissions",
      render: (_: any, record: any) => (
        <div className="max-w-xs flex flex-wrap gap-1">
          {record.permissions.map((p: any) => (
            <span key={p.id} className="bg-gray-200 text-xs px-2 py-1 rounded">
              {p.name}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: t("actions"),
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button onClick={() => handleOpenModal(record)}>{t("edit")}</Button>
          <Popconfirm
            title={t("delete_role_confirm")}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>{t("delete")}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <section>
      <Header title={t("roles")} />
      <Section>
        <Box>
          <div className="flex justify-end items-center mb-4">
            <Button
              type="primary"
              size="large"
              onClick={() => handleOpenModal()}
            >
              {t("add_role")}
            </Button>
          </div>

          <Table
            rowKey="id"
            columns={columns}
            dataSource={rolesData?.data || []}
            loading={isLoading}
          />

          <Modal
            title={editingRole ? t("edit_role") : t("add_role")}
            open={isModalVisible}
            onOk={handleSubmit}
            onCancel={handleCloseModal}
            width={600}
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="name"
                label={t("role_name")}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item name="permissionIds" label={t("permissions")}>
                <Select
                  mode="multiple"
                  allowClear
                  placeholder={t("select_permissions")}
                  options={(permissionsData?.data || []).map((perm: any) => ({
                    label: perm.name,
                    value: perm.id,
                  }))}
                />
              </Form.Item>
            </Form>
          </Modal>
        </Box>
      </Section>
    </section>
  );
};

export default Roles;
