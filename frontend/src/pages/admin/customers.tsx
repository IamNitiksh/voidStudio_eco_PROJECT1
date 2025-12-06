import { ReactElement, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Column } from "react-table";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TableHOC from "../../components/admin/TableHOC";
import { Skeleton } from "../../components/loader";
import {
  useAllUsersQuery,
  useDeleteUserMutation,
} from "../../redux/api/userAPI";
import { RootState } from "../../redux/store";
import { CustomError } from "../../types/api-types";
import { responseToast } from "../../utils/features";

interface DataType {
  avatar: ReactElement;
  name: string;
  email: string;
  gender: string;
  role: string;
  action: ReactElement;
}

const columns: Column<DataType>[] = [
  {
    Header: "Avatar",
    accessor: "avatar",
  },
  {
    Header: "Name",
    accessor: "name",
  },
  {
    Header: "Gender",
    accessor: "gender",
  },
  {
    Header: "Email",
    accessor: "email",
  },
  {
    Header: "Role",
    accessor: "role",
  },
  {
    Header: "Action",
    accessor: "action",
  },
];

const Customers = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);

  const { isLoading, data, isError, error } = useAllUsersQuery(user?._id ?? "");

  const [rows, setRows] = useState<DataType[]>([]);

  const [deleteUser] = useDeleteUserMutation();

  const deleteHandler = async (userId: string) => {
    // Assuming responseToast uses async/await internally
    const res = await deleteUser({ userId, adminUserId: user?._id! });
    responseToast(res, null, "User deleted successfully"); // Added success message
  };

  if (isError) {
    const err = error as CustomError;
    toast.error(err.data.message);
  }

  useEffect(() => {
    if (data)
      setRows(
        data.users.map((i) => ({
          avatar: (
            <img
              className="rounded-full w-12 h-12 object-cover" // Tailwind styles for avatar
              src={i.photo}
              alt={i.name}
            />
          ),
          name: i.name,
          email: i.email,
          gender: i.gender,
          role: i.role,
          action: (
            <button 
              onClick={() => deleteHandler(i._id)}
              className="text-red-500 hover:text-red-700 transition duration-150 p-2 rounded-full hover:bg-red-100" // Tailwind styles for trash button
            >
              <FaTrash />
            </button>
          ),
        }))
      );
  }, [data]);

  const Table = TableHOC<DataType>(
    columns,
    rows,
    "w-full overflow-x-auto shadow-lg rounded-lg p-6 bg-white", // Tailwind classes for the table container
    "Customers",
    rows.length > 6
  )();

  return (
    <div className="flex h-screen bg-gray-100"> {/* admin-container */}
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Customer Management</h1>
        {isLoading ? <Skeleton length={20} /> : <div className="max-w-full">{Table}</div>}
      </main>
    </div>
  );
};

export default Customers;