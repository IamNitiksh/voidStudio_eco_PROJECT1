import axios from "axios";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { RootState, server } from "../../../redux/store";

const NewDiscount = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);
  const navigate = useNavigate();

  const [btnLoading, setBtnLoading] = useState<boolean>(false);

  const [code, setCode] = useState("");
  const [amount, setAmount] = useState(0);

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    // submit handler
    e.preventDefault();

    setBtnLoading(true);

    try {
      const { data } = await axios.post(
        `${server}/api/v1/payment/coupon/new?id=${user?._id}`,
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

      if (data.success) {
        setAmount(0);
        setCode("");
        toast.success(data.message);
        navigate("/admin/discount");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to create coupon.");
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto flex justify-center items-start">
        <article className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8">
          <form onSubmit={submitHandler} className="space-y-6">
            <h2 className="text-3xl font-bold mb-6 text-center text-indigo-700">New Coupon</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
              <input
                type="text"
                placeholder="e.g., BLACKFRIDAY20"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount (%)</label>
              <input
                type="number"
                placeholder="e.g., 20, 50"
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
                  : "bg-green-600 text-white hover:bg-green-700 shadow-md"
              }`}
            >
              {btnLoading ? "Creating..." : "Create Coupon"}
            </button>
          </form>
        </article>
      </main>
    </div>
  );
};

export default NewDiscount;