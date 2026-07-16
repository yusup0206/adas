import React, { useState, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  App,
  Checkbox,
  Collapse,
} from "antd";
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from "@/services/rolesApi";
import { useGetPermissionsQuery } from "@/services/permissionsApi";
import { useTranslation } from "react-i18next";
import Header from "@/components/shared/header/Header";
import Section from "@/components/shared/Section";
import Box from "@/components/shared/Box";
import { RiPencilFill } from "react-icons/ri";
import DeleteModal from "@/components/shared/DeleteModal";
import { IoSearch } from "react-icons/io5";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { usePermission } from "@/hooks/usePermission";

// ─── Permission group definitions ──────────────────────────────────────────────
const PERMISSION_GROUPS = [
  {
    key: "ORDERS",
    labelKey: "orders",
    color: "#6366f1",
    permissions: [
      "ORDERS_VIEW",
      "ORDERS_CREATE",
      "ORDERS_UPDATE",
      "ORDERS_DELETE",
    ],
  },
  {
    key: "WAREHOUSE",
    labelKey: "warehouses",
    color: "#0ea5e9",
    permissions: ["WAREHOUSE_VIEW", "WAREHOUSE_CREATE", "WAREHOUSE_DELETE"],
  },
  {
    key: "PRODUCTS",
    labelKey: "products",
    color: "#10b981",
    permissions: [
      "PRODUCTS_VIEW",
      "PRODUCTS_CREATE",
      "PRODUCTS_UPDATE",
      "PRODUCTS_DELETE",
    ],
  },
  {
    key: "UNITS",
    labelKey: "units",
    color: "#14b8a6",
    permissions: ["UNITS_VIEW", "UNITS_CREATE", "UNITS_UPDATE", "UNITS_DELETE"],
  },
  {
    key: "CLIENTS",
    labelKey: "clients",
    color: "#f59e0b",
    permissions: [
      "CLIENTS_VIEW",
      "CLIENTS_CREATE",
      "CLIENTS_UPDATE",
      "CLIENTS_DELETE",
    ],
  },
  {
    key: "SUPPLIERS",
    labelKey: "suppliers",
    color: "#f97316",
    permissions: [
      "SUPPLIERS_VIEW",
      "SUPPLIERS_CREATE",
      "SUPPLIERS_UPDATE",
      "SUPPLIERS_DELETE",
    ],
  },
  {
    key: "LOANS",
    labelKey: "loans",
    color: "#8b5cf6",
    permissions: ["LOANS_VIEW", "LOANS_UPDATE"],
  },
  {
    key: "INCOME",
    labelKey: "income",
    color: "#22c55e",
    permissions: ["INCOME_VIEW"],
  },
  {
    key: "USERS",
    labelKey: "users",
    color: "#ec4899",
    permissions: ["USERS_VIEW", "USERS_CREATE", "USERS_UPDATE", "USERS_DELETE"],
  },
  {
    key: "ROLES",
    labelKey: "roles",
    color: "#e11d48",
    permissions: ["ROLES_VIEW", "ROLES_CREATE", "ROLES_UPDATE", "ROLES_DELETE"],
  },
  {
    key: "SETTINGS",
    labelKey: "expense_formulas",
    color: "#64748b",
    permissions: [
      "SETTINGS_VIEW",
      "SETTINGS_CREATE",
      "SETTINGS_UPDATE",
      "SETTINGS_DELETE",
    ],
  },
];

// ─── Permission Group Picker Component ─────────────────────────────────────────
interface PermGroupPickerProps {
  allPermissions: { id: number; name: string }[];
  value?: number[];
  onChange?: (ids: number[]) => void;
  t: any;
}

const PermGroupPicker: React.FC<PermGroupPickerProps> = ({
  allPermissions,
  value = [],
  onChange,
  t,
}) => {
  const permByName = useMemo(
    () => Object.fromEntries(allPermissions.map((p) => [p.name, p])),
    [allPermissions],
  );

  const toggle = (id: number, checked: boolean) => {
    const next = checked ? [...value, id] : value.filter((v) => v !== id);
    onChange?.(next);
  };

  const toggleGroup = (names: string[], checked: boolean) => {
    const ids = names.map((n) => permByName[n]?.id).filter(Boolean) as number[];
    const next = checked
      ? [...new Set([...value, ...ids])]
      : value.filter((v) => !ids.includes(v));
    onChange?.(next);
  };

  const collapseItems = PERMISSION_GROUPS.map((group) => {
    const groupPerms = group.permissions
      .map((name) => permByName[name])
      .filter(Boolean);

    const groupIds = groupPerms.map((p) => p.id);
    const checkedCount = groupIds.filter((id) => value.includes(id)).length;
    const allChecked = checkedCount === groupIds.length && groupIds.length > 0;
    const indeterminate = checkedCount > 0 && checkedCount < groupIds.length;

    return {
      key: group.key,
      label: (
        <div
          className="flex items-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={allChecked}
            indeterminate={indeterminate}
            onChange={(e) => toggleGroup(group.permissions, e.target.checked)}
          />
          <span
            className="text-sm font-semibold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: group.color }}
          >
            {t(group.labelKey)}
          </span>
          <span className="text-xs text-gray-400">
            {checkedCount}/{groupIds.length}
          </span>
        </div>
      ),
      children: (
        <div className="flex flex-wrap gap-x-6 gap-y-2 pl-8 pb-2">
          {groupPerms.map((perm) => {
            const suffix = perm.name.split("_").pop() ?? perm.name;
            const translatedLabel = t(`permission_${suffix.toLowerCase()}`);
            return (
              <Checkbox
                key={perm.id}
                checked={value.includes(perm.id)}
                onChange={(e) => toggle(perm.id, e.target.checked)}
              >
                <span className="text-sm">
                  {translatedLabel === `permission_${suffix.toLowerCase()}`
                    ? suffix
                    : translatedLabel}
                </span>
              </Checkbox>
            );
          })}
        </div>
      ),
    };
  });

  return (
    <Collapse
      ghost
      size="small"
      items={collapseItems}
      className="border border-gray-200 rounded-lg overflow-hidden"
    />
  );
};

// ─── Roles Page ────────────────────────────────────────────────────────────────
const Roles = () => {
  const { message } = App.useApp();
  const { data: rolesData, isLoading } = useGetRolesQuery({});
  const { data: permissionsData } = useGetPermissionsQuery({});
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();
  const { t } = useTranslation();

  const { filters, setFilters } = useUrlFilters({ search: "" });

  const canCreate = usePermission("ROLES_CREATE");
  const canUpdate = usePermission("ROLES_UPDATE");
  const canDelete = usePermission("ROLES_DELETE");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [form] = Form.useForm();

  const allPermissions: { id: number; name: string }[] =
    permissionsData?.data || [];

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
    r.name.toLowerCase().includes(searchTerm),
  );

  // Group badges for the table display
  const getGroupBadges = (permissions: { id: number; name: string }[]) => {
    const permNames = new Set(permissions.map((p: any) => p.name));
    return PERMISSION_GROUPS.filter((g) =>
      g.permissions.some((pn) => permNames.has(pn)),
    );
  };

  const columns = [
    { title: t("id"), dataIndex: "id", key: "id", width: 60 },
    { title: t("role_name"), dataIndex: "name", key: "name", width: 160 },
    {
      title: t("permissions"),
      key: "permissions",
      render: (_: any, record: any) => {
        const groups = getGroupBadges(record.permissions);
        return (
          <div className="flex flex-wrap gap-1.5">
            {groups.map((g) => {
              const owned = record.permissions.filter((p: any) =>
                g.permissions.includes(p.name),
              ).length;
              return (
                <span
                  key={g.key}
                  className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: g.color }}
                >
                  {t(g.labelKey)} ({owned}/{g.permissions.length})
                </span>
              );
            })}
            {groups.length === 0 && (
              <span className="text-xs text-gray-400 italic">
                No permissions
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: t("actions"),
      key: "actions",
      width: 90,
      render: (_: any, record: any) => (
        <Space>
          {canUpdate && (
            <RiPencilFill
              size={20}
              onClick={() => handleOpenModal(record)}
              className="size-5 cursor-pointer hover:text-primary active:text-primary transition-all"
            />
          )}
          {canDelete && <DeleteModal id={record.id} onDelete={handleDelete} />}
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
            {canCreate && (
              <Button
                type="primary"
                size="large"
                onClick={() => handleOpenModal()}
              >
                {t("add_new")}
              </Button>
            )}
          </div>

          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredRoles}
            loading={isLoading}
            pagination={{
              position: ["bottomCenter"],
              pageSize: 10,
              showSizeChanger: true,
            }}
            className="overflow-x-auto"
          />

          <Modal
            title={editingRole ? t("edit_role") : t("add_role")}
            open={isModalVisible}
            onOk={handleSubmit}
            onCancel={handleCloseModal}
            width={680}
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
                <PermGroupPicker allPermissions={allPermissions} t={t} />
              </Form.Item>
            </Form>
          </Modal>
        </Box>
      </Section>
    </section>
  );
};

export default Roles;
