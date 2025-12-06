import { FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { Skeleton } from "../../../components/loader";
import {
  useDeleteOrderMutation,
  useOrderDetailsQuery,
  useUpdateOrderMutation,
} from "../../../redux/api/orderAPI";
import { RootState } from "../../../redux/store";
import { Order, OrderItem } from "../../../types/types";
import { responseToast, transformImage } from "../../../utils/features";

// ... defaultData and other imports (unchanged)

const defaultData: Order = {
  // ... default data unchanged
  shippingInfo: {
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  },
  status: "",
  subtotal: 0,
  discount: 0,
  shippingCharges: 0,
  tax: 0,
  total: 0,
  orderItems: [],
  user: { name: "", _id: "" },
  _id: "",
};

const TransactionManagement = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);

  const params = useParams();
  const navigate = useNavigate();

  const { isLoading, data, isError } = useOrderDetailsQuery(params.id!);
  
  // ... destructuring and mutation handlers (unchanged)

  const {
    shippingInfo: { address, city, state, country, pinCode },
    orderItems,
    user: { name },
    status,
    tax,
    subtotal,
    total,
    discount,
    shippingCharges,
  } = data?.order || defaultData;

  const [updateOrder] = useUpdateOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  const updateHandler = async () => {
    const res = await updateOrder({
      userId: user?._id!,
      orderId: data?.order._id!,
    });
    responseToast(res, navigate, "/admin/transaction");
  };

  const deleteHandler = async () => {
    const res = await deleteOrder({
      userId: user?._id!,
      orderId: data?.order._id!,
    });
    responseToast(res, navigate, "/admin/transaction");
  };

  if (isError) return <Navigate to={"/404"} />;

  // Determine status color class
  const statusColorClass =
    status === "Delivered"
      ? "text-purple-600"
      : status === "Shipped"
      ? "text-green-600"
      : "text-red-600";

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {isLoading ? (
          <Skeleton />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Order Items Section */}
            <section className="lg:col-span-2 bg-white shadow-lg rounded-xl p-4 sm:p-6 h-fit">
              <h2 className="text-2xl font-semibold mb-6 border-b pb-2 text-gray-800">Order Items</h2>

              <div className="space-y-4">
                {orderItems.map((i) => (
                  <ProductCard
                    key={i._id}
                    name={i.name}
                    photo={i.photo}
                    productId={i.productId}
                    _id={i._id}
                    quantity={i.quantity}
                    price={i.price}
                  />
                ))}
              </div>
            </section>
            
            {/* Shipping Info Card */}
            <article className="lg:col-span-1 bg-white shadow-lg rounded-xl p-6 relative h-fit">
              <button
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition duration-150"
                onClick={deleteHandler}
                title="Delete Order"
              >
                <FaTrash className="w-5 h-5" />
              </button>
              
              <h1 className="text-3xl font-bold mb-6 text-indigo-700">Order Info</h1>

              <h5 className="text-lg font-semibold mt-4 mb-2 text-gray-700">User Info</h5>
              <p className="text-gray-600">Name: <span className="font-medium">{name}</span></p>
              <p className="text-gray-600 break-words">
                Address:{" "}
                {`${address}, ${city}, ${state}, ${country} ${pinCode}`}
              </p>

              <h5 className="text-lg font-semibold mt-6 mb-2 pt-2 border-t text-gray-700">Amount Info</h5>
              <div className="space-y-1 text-sm">
                <p>Subtotal: <span className="font-mono float-right">₹{subtotal}</span></p>
                <p>Shipping Charges: <span className="font-mono float-right">₹{shippingCharges}</span></p>
                <p>Tax: <span className="font-mono float-right">₹{tax}</span></p>
                <p>Discount: <span className="font-mono float-right text-red-500">-₹{discount}</span></p>
                <div className="pt-2 border-t border-gray-200 font-bold text-base mt-2">
                    <p>Total: <span className="font-mono float-right">₹{total}</span></p>
                </div>
              </div>

              <h5 className="text-lg font-semibold mt-6 mb-2 pt-2 border-t text-gray-700">Status Info</h5>
              <p className="text-gray-600">
                Status:{" "}
                <span className={`font-bold ${statusColorClass}`}>
                  {status}
                </span>
              </p>
              
              <button
                className="w-full mt-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md"
                onClick={updateHandler}
              >
                Process Status
              </button>
            </article>
          </div>
        )}
      </main>
    </div>
  );
};

// Converted ProductCard for TransactionManagement
const ProductCard = ({
  name,
  photo,
  price,
  quantity,
  productId,
}: OrderItem) => (
  <div className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:shadow-md transition bg-gray-50">
    <img 
        src={transformImage(photo)} 
        alt={name} 
        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
    />
    <div className="flex-1 min-w-0">
        <Link 
            to={`/product/${productId}`} 
            className="text-lg font-medium text-indigo-600 hover:text-indigo-800 truncate"
            title={name}
        >
            {name}
        </Link>
        <span className="text-sm text-gray-500 block">
            ₹{price} x {quantity} = <span className="font-semibold text-gray-700">₹{price * quantity}</span>
        </span>
    </div>
  </div>
);

export default TransactionManagement;