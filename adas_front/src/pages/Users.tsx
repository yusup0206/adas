import { Table, Button, Modal, Form, Input, Select, Space, App } from "antd";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/services/usersApi";
import { useGetRolesQuery } from "@/services/rolesApi";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/shared/header/Header";
import Section from "@/components/shared/Section";
import Box from "@/components/shared/Box";
import { RiPencilFill } from "react-icons/ri";
import DeleteModal from "@/components/shared/DeleteModal";
import { IoSearch } from "react-icons/io5";
import { useUrlFilters } from "@/hooks/useUrlFilters";

const Users = () => {
  const { message } = App.useApp();
  const { data: users, isLoading } = useGetUsersQuery({});
  const { data: rolesData } = useGetRolesQuery({});
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const { t } = useTranslation();

  const { filters, setFilters } = useUrlFilters({ search: "" });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form] = Form.useForm();

  const handleOpenModal = (user: any | null = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue({
        username: user.username,
        roleId: user.roleId,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await updateUser({ id: editingUser.id, body: values }).unwrap();
        message.success("User updated successfully");
      } else {
        await createUser(values).unwrap();
        message.success("User created successfully");
      }
      handleCloseModal();
    } catch (error: any) {
      message.error(error?.data?.message || "Error saving user");
    }
  };

  const handleDelete = async (id: number | string) => {
    await deleteUser(id as number).unwrap();
  };

  const searchTerm = filters.search.toLowerCase();
  const filteredUsers = (users?.data || []).filter((u: any) =>
    u.username.toLowerCase().includes(searchTerm)
  );

  const columns = [
    { title: t("id"), dataIndex: "id", key: "id", width: 60 },
    { title: t("username"), dataIndex: "username", key: "username" },
    { title: t("role"), dataIndex: ["role", "name"], key: "role" },
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
      <Header title={t("users")} />
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
              {t("add_user")}
            </Button>
          </div>

          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredUsers}
            loading={isLoading}
            pagination={{ position: ["bottomCenter"], pageSize: 10, showSizeChanger: true }}
            className="overflow-x-auto"
          />

          <Modal
            title={editingUser ? t("edit_user") : t("add_user")}
            open={isModalVisible}
            onOk={handleSubmit}
            onCancel={handleCloseModal}
            centered
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="username"
                label={t("username")}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="password"
                label={t("password")}
                rules={[{ required: !editingUser }]}
                help={editingUser ? t("leave_blank_password") : ""}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                name="roleId"
                label={t("role")}
                rules={[{ required: true }]}
              >
                <Select
                  options={(rolesData?.data || []).map((r: any) => ({
                    label: r.name,
                    value: r.id,
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

export default Users;
