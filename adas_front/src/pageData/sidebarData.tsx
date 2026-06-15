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
} from "react-icons/fa6";

export const sidebarData = {
  sidebarElements: [
    {
      labelKey: "income",
      url: "/income",
      icon: <FaChartLine className="size-5 min-w-5" />,
      permission: "VIEW_INCOME",
    },
    {
      labelKey: "debt",
      url: "/debt",
      icon: <FaMoneyBillWave className="size-5 min-w-5" />,
      permission: "VIEW_INCOME",
    },
    {
      labelKey: "orders",
      url: "/orders",
      icon: <FaCartShopping className="size-5 min-w-5" />,
      permission: "MANAGE_ORDERS",
    },

    {
      labelKey: "warehouses",
      url: "/warehouses",
      icon: <FaWarehouse className="size-5 min-w-5" />,
      permission: "MANAGE_WAREHOUSE",
    },

    {
      labelKey: "settings",
      icon: <FaGear className="size-5 min-w-5" />,
      children: [
        {
          labelKey: "units",
          url: "/units",
          icon: <FaRuler className="size-5 min-w-5" />,
          permission: "MANAGE_PRODUCTS",
        },
        {
          labelKey: "clients",
          url: "/clients",
          icon: <FaUsers className="size-5 min-w-5" />,
          permission: "MANAGE_CLIENTS",
        },
        {
          labelKey: "suppliers",
          url: "/suppliers",
          icon: <FaHandshake className="size-5 min-w-5" />,
          permission: "MANAGE_SUPPLIERS",
        },
        {
          labelKey: "products",
          url: "/products",
          icon: <FaBoxArchive className="size-5 min-w-5" />,
          permission: "MANAGE_PRODUCTS",
        },
        {
          labelKey: "users",
          url: "/users",
          icon: <FaUser className="size-5 min-w-5" />,
          permission: "MANAGE_USERS",
        },
        {
          labelKey: "roles",
          url: "/roles",
          icon: <FaUserShield className="size-5 min-w-5" />,
          permission: "MANAGE_ROLES",
        },
      ],
    },
  ],
};
