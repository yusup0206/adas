import {
  FaBoxArchive,
  FaCartShopping,
  FaFileContract,
  FaRuler,
  FaUsers,
  FaHandshake,
  FaWarehouse,
  FaChartLine,
} from "react-icons/fa6";

export const sidebarData = {
  sidebarElements: [
    {
      labelKey: "units",
      url: "/units",
      icon: <FaRuler className="size-5 min-w-5" />,
    },
    {
      labelKey: "clients",
      url: "/clients",
      icon: <FaUsers className="size-5 min-w-5" />,
    },
    {
      labelKey: "suppliers",
      url: "/suppliers",
      icon: <FaHandshake className="size-5 min-w-5" />,
    },
    {
      labelKey: "warehouses",
      url: "/warehouses",
      icon: <FaWarehouse className="size-5 min-w-5" />,
    },
    {
      labelKey: "products",
      url: "/products",
      icon: <FaBoxArchive className="size-5 min-w-5" />,
    },
    {
      labelKey: "orders",
      url: "/orders",
      icon: <FaCartShopping className="size-5 min-w-5" />,
    },
    {
      labelKey: "agreements",
      url: "/agreements",
      icon: <FaFileContract className="size-5 min-w-5" />,
    },
    {
      labelKey: "income",
      url: "/income",
      icon: <FaChartLine className="size-5 min-w-5" />,
    },
  ],
};
