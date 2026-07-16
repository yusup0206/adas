import {
  FaBoxArchive,
  FaCartShopping,
  FaRuler,
  FaUsers,
  FaHandshake,
  FaChartLine,
  FaWarehouse,
  FaGear,
  FaMoneyBillWave,
  FaUserShield,
  FaUser,
  FaPercent,
} from "react-icons/fa6";

export const sidebarData = {
  sidebarElements: [
    {
      labelKey: "income",
      url: "/income",
      icon: <FaChartLine className="size-5 min-w-5" />,
      permission: "INCOME_VIEW",
    },
    {
      labelKey: "debt",
      url: "/debt",
      icon: <FaMoneyBillWave className="size-5 min-w-5" />,
      permission: "INCOME_VIEW",
    },
    {
      labelKey: "orders",
      url: "/orders",
      icon: <FaCartShopping className="size-5 min-w-5" />,
      permission: "ORDERS_VIEW",
    },

    {
      labelKey: "warehouses",
      url: "/warehouses",
      icon: <FaWarehouse className="size-5 min-w-5" />,
      permission: "WAREHOUSE_VIEW",
    },
    {
      labelKey: "users",
      url: "/users",
      icon: <FaUser className="size-5 min-w-5" />,
      permission: "USERS_VIEW",
    },
    {
      labelKey: "settings",
      icon: <FaGear className="size-5 min-w-5" />,
      children: [
        {
          labelKey: "units",
          url: "/units",
          icon: <FaRuler className="size-5 min-w-5" />,
          permission: "UNITS_VIEW",
        },
        {
          labelKey: "clients",
          url: "/clients",
          icon: <FaUsers className="size-5 min-w-5" />,
          permission: "CLIENTS_VIEW",
        },
        {
          labelKey: "suppliers",
          url: "/suppliers",
          icon: <FaHandshake className="size-5 min-w-5" />,
          permission: "SUPPLIERS_VIEW",
        },
        {
          labelKey: "products",
          url: "/products",
          icon: <FaBoxArchive className="size-5 min-w-5" />,
          permission: "PRODUCTS_VIEW",
        },

        {
          labelKey: "roles",
          url: "/roles",
          icon: <FaUserShield className="size-5 min-w-5" />,
          permission: "ROLES_VIEW",
        },
        {
          labelKey: "expense_formulas",
          url: "/expense-formulas",
          icon: <FaPercent className="size-5 min-w-5" />,
          permission: "SETTINGS_VIEW",
        },
      ],
    },
  ],
};
