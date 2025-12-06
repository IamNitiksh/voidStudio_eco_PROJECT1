import { ReactElement, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Column } from "react-table";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TableHOC from "../../components/admin/TableHOC";
import { Skeleton } from "../../components/loader";
import { useAllOrdersQuery } from "../../redux/api/orderAPI";
import { RootState } from "../../redux/store";
import { CustomError } from "../../types/api-types";

interface DataType {
  user: string;
  amount: number;
  discount: number;
  quantity: number;
  status: ReactElement;
  action: ReactElement;
}

const columns: Column<DataType>[] = [
  {
    Header: "Avatar",
    accessor: "user",
  },
  {
    Header: "Amount",
    accessor: "amount",
  },
  {
    Header: "Discount",
    accessor: "discount",
  },
  {
    Header: "Quantity",
    accessor: "quantity",
  },
  {
    Header: "Status",
    accessor: "status",
  },
  {
    Header: "Action",
    accessor: "action",
  },
];

const Transaction = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);

  // Use optional chaining and nullish coalescing for safety if user is null/undefined
  const { isLoading, data, isError, error } = useAllOrdersQuery(user?._id ?? ""); 

  const [rows, setRows] = useState<DataType[]>([]);

  if (isError) {
    const err = error as CustomError;
    toast.error(err.data.message);
  }

  useEffect(() => {
    if (data)
      setRows(
        data.orders.map((i) => ({
          user: i.user.name,
          amount: i.total,
          discount: i.discount,
          quantity: i.orderItems.length,
          status: (
            <span
              className={
                i.status === "Processing"
                  ? "text-red-500 font-semibold"
                  : i.status === "Shipped"
                  ? "text-green-500 font-semibold"
                  : "text-purple-500 font-semibold"
              }
            >
              {i.status}
            </span>
          ),
          action: (
            <Link 
              to={`/admin/transaction/${i._id}`}
              className="text-blue-500 hover:text-blue-700 font-medium transition duration-150"
            >
              Manage
            </Link>
          ),
        }))
      );
  }, [data]);

  const Table = TableHOC<DataType>(
    columns,
    rows,
    "w-full overflow-x-auto shadow-lg rounded-lg p-6 bg-white", // Tailwind classes for the table container
    "Transactions",
    rows.length > 6
  )();
  
  return (
    <div className="flex h-screen bg-gray-100"> {/* admin-container */}
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto"> {/* main content area */}
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Transaction Management</h1>
        {isLoading ? (
          <Skeleton length={20} />
        ) : (
          <div className="max-w-full"> {/* Wrapper for the TableHOC */}
            {Table}
          </div>
        )}
      </main>
    </div>
  );
};

export default Transaction;