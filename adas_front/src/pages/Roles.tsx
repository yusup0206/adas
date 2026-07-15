import { Table, Button, Modal, Form, Input, Select, Space, App } from "antd";
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
import { RiPencilFill } from "react-icons/ri";
import DeleteModal from "@/components/shared/DeleteModal";
import { IoSearch } from "react-icons/io5";
import { useUrlFilters } from "@/hooks/useUrlFilters";

const Roles = () => {
  const { message } = App.useApp();
  const { data: rolesData, isLoading } = useGetRolesQuery({});
  const { data: permissionsData } = useGetPermissionsQuery({});
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();
  const { t } = useTranslation();

  const { filters, setFilters } = useUrlFilters({ search: "" });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [form] = Form.useForm();

  const handleOpenModal = (role: any | null = null) => {
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

  const handleDelete = async (id: number | string) => {
    await deleteRole(id as number).unwrap();
  };

  const searchTerm = filters.search.toLowerCase();
  const filteredRoles = (rolesData?.data || []).filter((r: any) =>
    r.name.toLowerCase().includes(searchTerm)
  );

  const columns = [
    { title: t("id"), dataIndex: "id", key: "id", width: 60 },
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
          <RiPencilFill
            size={20}
            onClick={() => handleOpenModal(record)}
            className="size-5 cursor-pointer hover:text-primary active:text-primary transition-all"
          />
          <DeleteModal id={record.id} onDelete={handleDelete} />
        </Space>
      ),
    },
  ];

  return (
    <section>
      <Header title={t("roles")} />
      <Section>
        <Box>
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="max-w-full md:max-w-[300px] w-full">
              <Input
                prefix={<IoSearch />}
                size="large"
                placeholder={t("search")}
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                allowClear
              />
            </div>
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
            dataSource={filteredRoles}
            loading={isLoading}
            pagination={{ position: ["bottomCenter"], pageSize: 10, showSizeChanger: true }}
            className="overflow-x-auto"
          />

          <Modal
            title={editingRole ? t("edit_role") : t("add_role")}
            open={isModalVisible}
            onOk={handleSubmit}
            onCancel={handleCloseModal}
            width={600}
            centered
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
