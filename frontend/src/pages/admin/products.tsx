import { ReactElement, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Column } from "react-table";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TableHOC from "../../components/admin/TableHOC";
import { Skeleton } from "../../components/loader";
import { useAllProductsQuery } from "../../redux/api/productAPI";
import { RootState } from "../../redux/store";
import { CustomError } from "../../types/api-types";

interface DataType {
  photo: ReactElement;
  name: string;
  price: number;
  stock: number;
  action: ReactElement;
}

const columns: Column<DataType>[] = [
  {
    Header: "Photo",
    accessor: "photo",
  },
  {
    Header: "Name",
    accessor: "name",
  },
  {
    Header: "Price",
    accessor: "price",
  },
  {
    Header: "Stock",
    accessor: "stock",
  },
  {
    Header: "Action",
    accessor: "action",
  },
];

const Products = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);

  const { isLoading, isError, error, data } = useAllProductsQuery(user?._id ?? "");

  const [rows, setRows] = useState<DataType[]>([]);

  if (isError) {
    const err = error as CustomError;
    toast.error(err.data.message);
  }

  useEffect(() => {
    if (data)
      setRows(
        data.products.map((i) => ({
          photo: <img src={i.photos?.[0]?.url} className="w-16 h-16 object-cover rounded-md" alt={i.name} />,
          name: i.name,
          price: i.price,
          stock: i.stock,
          action: (
            <Link 
              to={`/admin/product/${i._id}`}
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
    "Products",
    rows.length > 6
  )();

  return (
    <div className="flex h-screen bg-gray-100 relative"> {/* admin-container + relative for button */}
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Product Management</h1>
        {isLoading ? <Skeleton length={20} /> : <div className="max-w-full">{Table}</div>}
      </main>
      
      {/* create-product-btn (Floating Button) */}
      <Link 
        to="/admin/product/new" 
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition duration-300 z-10"
      >
        <FaPlus className="text-xl" />
      </Link>
    </div>
  );
};

export default Products;