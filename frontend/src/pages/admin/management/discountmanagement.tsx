import { useFetchData } from "6pp";
import axios from "axios";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { Skeleton } from "../../../components/loader";
import { RootState, server } from "../../../redux/store";
import { SingleDiscountResponse } from "../../../types/api-types";

const DiscountManagement = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);
  const { id } = useParams();
  const navigate = useNavigate();

  const detailUrl = user?._id
    ? `${server}/api/v1/payment/coupon/${id}?id=${user._id}`
    : `${server}/api/v1/payment/coupon/${id}`;

  const {
    loading: isLoading,
    data,
    error,
  } = useFetchData<SingleDiscountResponse>(detailUrl, "discount-code");

  if (error) {
    toast.error(error);
  }

  const [btnLoading, setBtnLoading] = useState<boolean>(false);

  const [code, setCode] = useState("");
  const [amount, setAmount] = useState(0);

  // ... submitHandler, useEffect, and deleteHandler (logic unchanged)
  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setBtnLoading(true);

    try {
      const url = user?._id
        ? `${server}/api/v1/payment/coupon/${id}?id=${user._id}`
        : `${server}/api/v1/payment/coupon/${id}`;

      const { data: resData } = await axios.put(
        url,
        {
          code,
          amount,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (resData.success) {
        toast.success(resData.message);
        navigate("/admin/discount");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update coupon.");
    } finally {
      setBtnLoading(false);
    }
  };

  useEffect(() => {
    if (data) {
      setCode(data.coupon.code);
      setAmount(data.coupon.amount);
    }
  }, [data]);

  const deleteHandler = async () => {
    setBtnLoading(true);

    try {
      const deleteUrl = user?._id
        ? `${server}/api/v1/payment/coupon/${id}?id=${user._id}`
        : `${server}/api/v1/payment/coupon/${id}`;

      const { data: resData } = await axios.delete(deleteUrl, {
        withCredentials: true,
      });

      if (resData.success) {
        toast.success(resData.message);
        navigate("/admin/discount");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete coupon.");
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto flex justify-center items-start">
        {isLoading ? (
          <Skeleton length={20} />
        ) : (
          <article className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8 relative">
            <button 
              className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition duration-150 p-2 rounded-full hover:bg-red-50" 
              onClick={deleteHandler}
              disabled={btnLoading}
              title="Delete Coupon"
            >
              <FaTrash className="w-5 h-5" />
            </button>
            <form onSubmit={submitHandler} className="space-y-6">
              <h2 className="text-3xl font-bold mb-6 text-center text-indigo-700">Manage Coupon</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount (%)</label>
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <button
                disabled={btnLoading}
                type="submit"
                className={`w-full py-3 mt-8 font-semibold rounded-lg transition duration-150 ${
                  btnLoading 
                    ? "bg-indigo-400 cursor-not-allowed" 
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                }`}
              >
                {btnLoading ? "Updating..." : "Update"}
              </button>
            </form>
          </article>
        )}
      </main>
    </div>
  );
};

export default DiscountManagement;