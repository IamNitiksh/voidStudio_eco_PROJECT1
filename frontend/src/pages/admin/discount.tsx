import { useFetchData } from "6pp";
import { ReactElement, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Column } from "react-table";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TableHOC from "../../components/admin/TableHOC";
import { Skeleton } from "../../components/loader";
import { RootState, server } from "../../redux/store";
import { AllDiscountResponse } from "../../types/api-types";

interface DataType {
  code: string;
  amount: number;
  _id: string;
  action: ReactElement;
}

const columns: Column<DataType>[] = [
  {
    Header: "Id",
    accessor: "_id",
  },
  {
    Header: "Code",
    accessor: "code",
  },
  {
    Header: "Amount",
    accessor: "amount",
  },
  {
    Header: "Action",
    accessor: "action",
  },
];

const Discount = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);

  const url = user?._id
    ? `${server}/api/v1/payment/coupon/all?id=${user._id}`
    : `${server}/api/v1/payment/coupon/all`;

  const {
    data,
    loading: isLoading,
    error,
  } = useFetchData<AllDiscountResponse>(url, "discount-codes");

  const [rows, setRows] = useState<DataType[]>([]);

  if (error) toast.error(error);

  useEffect(() => {
    if (data)
      setRows(
        data.coupons.map((i) => ({
          _id: i._id,
          code: i.code,
          amount: i.amount,
          action: (
            <Link 
              to={`/admin/discount/${i._id}`}
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
    "Discount Codes", // Renamed title from "Products"
    rows.length > 6
  )();

  return (
    <div className="flex h-screen bg-gray-100 relative"> {/* admin-container + relative for button */}
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Discount Code Management</h1>
        {isLoading ? <Skeleton length={20} /> : <div className="max-w-full">{Table}</div>}
      </main>
      
      {/* create-product-btn (Floating Button) */}
      <Link 
        to="/admin/discount/new" 
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition duration-300 z-10"
      >
        <FaPlus className="text-xl" />
      </Link>
    </div>
  );
};

export default Discount;