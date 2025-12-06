import { Column } from "react-table";
import TableHOC from "./TableHOC";

interface DataType {
  _id: string;
  quantity: number;
  discount: number;
  amount: number;
  status: string;
}

const columns: Column<DataType>[] = [
  {
    Header: "Id",
    accessor: "_id",
  },
  {
    Header: "Quantity",
    accessor: "quantity",
  },
  {
    Header: "Discount",
    accessor: "discount",
  },
  {
    Header: "Amount",
    accessor: "amount",
  },
  {
    Header: "Status",
    accessor: "status",
  },
];

const DashboardTable = ({ data = [] }: { data: DataType[] }) => {
  // The old "transaction-box" class is replaced by a Tailwind utility
  return TableHOC<DataType>(
    columns,
    data,
    "lg:col-span-2 col-span-full", // Tailwind class to fit common dashboard layouts
    "Top Transactions" // Renamed from "Top Transaction" for better plural usage
  )();
};

export default DashboardTable;