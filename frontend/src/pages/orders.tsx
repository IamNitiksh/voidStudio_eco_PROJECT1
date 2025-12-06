import { ReactElement, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Column } from "react-table";
import TableHOC from "../components/admin/TableHOC";
import { Skeleton } from "../components/loader";
import { useMyOrdersQuery } from "../redux/api/orderAPI";
import { RootState } from "../redux/store";
import { CustomError } from "../types/api-types";
import { Link } from "react-router-dom"; // Import Link for better table functionality

type DataType = {
  _id: string;
  amount: number;
  quantity: number;
  discount: number;
  status: ReactElement;
  action: ReactElement; // Added action column for viewing details
};

const column: Column<DataType>[] = [
  {
    Header: "Order ID", // Changed to be more descriptive
    accessor: "_id",
  },
  {
    Header: "Items Qty", // Changed to be more descriptive
    accessor: "quantity",
  },
  {
    Header: "Discount (₹)", // Added unit
    accessor: "discount",
  },
  {
    Header: "Amount (₹)", // Added unit
    accessor: "amount",
  },
  {
    Header: "Status",
    accessor: "status",
  },
  {
    Header: "Action", // New column for action
    accessor: "action",
  },
];

const Orders = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);

  const { isLoading, data, isError, error } = useMyOrdersQuery(user?._id!);

  const [rows, setRows] = useState<DataType[]>([]);

  if (isError) {
    const err = error as CustomError;
    toast.error(err.data.message);
  }

  useEffect(() => {
    if (data)
      setRows(
        data.orders.map((i) => ({
          _id: i._id,
          amount: i.total,
          discount: i.discount,
          quantity: i.orderItems.length,
          status: (
            <span
              className={`font-semibold ${
                i.status === "Processing"
                  ? "text-red-600 bg-red-100 px-3 py-1 rounded-full"
                  : i.status === "Shipped"
                  ? "text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full"
                  : "text-green-600 bg-green-100 px-3 py-1 rounded-full"
              }`}
            >
              {i.status}
            </span>
          ),
          action: (
            <Link 
                to={`/order/${i._id}`} 
                className="text-blue-600 hover:text-blue-800 font-medium transition"
            >
                View
            </Link>
          ),
        }))
      );
  }, [data]);

  const Table = TableHOC<DataType>(
    column,
    rows,
    "bg-white shadow-lg rounded-xl overflow-hidden", // Tailwind class for container
    "My Orders",
    rows.length > 10 // Increased pagination size
  )();
  
  return (
    <div className="container max-w-7xl mx-auto p-4 lg:p-8 min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">My Orders</h1>
      {isLoading ? <Skeleton length={20} /> : Table}
    </div>
  );
};

export default Orders;