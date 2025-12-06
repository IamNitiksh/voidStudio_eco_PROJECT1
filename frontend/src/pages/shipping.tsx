import axios from "axios";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiArrowBack } from "react-icons/bi";
import { FaCreditCard, FaMapMarkerAlt } from "react-icons/fa"; // Changed FaTruck to FaCreditCard for payment step
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { saveShippingInfo } from "../redux/reducer/cartReducer";
import { RootState, server } from "../redux/store";

const inputFieldStyle =
  "w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-300 shadow-sm placeholder-gray-400";

const Shipping = () => {
  const { cartItems, coupon, shippingInfo: existingShippingInfo } = useSelector(
    (state: RootState) => state.cartReducer
  );
  const { user } = useSelector((state: RootState) => state.userReducer);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [shippingInfo, setShippingInfo] = useState({
    address: existingShippingInfo.address || "",
    city: existingShippingInfo.city || "",
    state: existingShippingInfo.state || "",
    country: existingShippingInfo.country || "India", // Defaulted to India if your select box only has India
    pinCode: existingShippingInfo.pinCode || "",
  });

  const changeHandler = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setShippingInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Save info to Redux state
    dispatch(saveShippingInfo(shippingInfo));

    // 2. Proceed to create payment intent
    try {
      // Clean up URL structure - RTKQ handles base URL, but for standalone axios calls, this is fine.
      const url = user?._id
        ? `${server}/api/v1/payment/create?id=${user._id}`
        : `${server}/api/v1/payment/create`;

      const { data } = await axios.post(
        url,
        {
          items: cartItems,
          shippingInfo,
          coupon,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      navigate("/pay", {
        state: data.clientSecret, // Pass client secret for stripe payment
      });
      toast.success("Proceeding to payment...");
    } catch (error) {
      console.error("Payment Intent Creation Error:", error);
      toast.error("Failed to proceed to payment. Please try again.");
    }
  };

  // Check if cart is empty on load
  useEffect(() => {
    if (cartItems.length <= 0) {
      toast.error("Your cart is empty. Please add items first.");
      navigate("/cart");
    }
  }, [cartItems, navigate]);


  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button and Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/cart")}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition-colors mb-6 text-sm"
          >
            <BiArrowBack className="mr-2 w-4 h-4" />
            Back to Cart
          </button>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <FaMapMarkerAlt className="w-8 h-8 text-indigo-600" />
            Shipping Details
          </h1>
          <p className="text-gray-600 mt-2">Enter your address to continue checkout</p>
        </div>

        {/* Shipping Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-10 border border-gray-100">
          <form onSubmit={submitHandler} className="space-y-6">

            {/* Group 1: Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                Street Address
              </label>
              <input
                id="address"
                required
                type="text"
                placeholder="Flat No, Building, Street Name..."
                name="address"
                value={shippingInfo.address}
                onChange={changeHandler}
                className={inputFieldStyle}
              />
            </div>

            {/* Group 2: City and State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>
                <input
                  id="city"
                  required
                  type="text"
                  placeholder="e.g., Mumbai, New Delhi"
                  name="city"
                  value={shippingInfo.city}
                  onChange={changeHandler}
                  className={inputFieldStyle}
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
                  State / Province
                </label>
                <input
                  id="state"
                  required
                  type="text"
                  placeholder="e.g., Maharashtra"
                  name="state"
                  value={shippingInfo.state}
                  onChange={changeHandler}
                  className={inputFieldStyle}
                />
              </div>
            </div>

            {/* Group 3: Country and Pin Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  required
                  value={shippingInfo.country}
                  onChange={changeHandler}
                  className={inputFieldStyle}
                >
                  <option value="" disabled>Choose Country</option>
                  <option value="india">India</option>
                  {/* Add more countries here if needed */}
                </select>
              </div>

              <div>
                <label htmlFor="pinCode" className="block text-sm font-semibold text-gray-700 mb-2">
                  Pin Code / ZIP Code
                </label>
                <input
                  id="pinCode"
                  required
                  type="number"
                  placeholder="e.g., 400001"
                  name="pinCode"
                  value={shippingInfo.pinCode}
                  onChange={changeHandler}
                  className={inputFieldStyle}
                />
              </div>
            </div>

            {/* Info Block - Simplified and uses stronger contrast */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-6">
              <div className="flex items-start space-x-3">
                <FaCreditCard className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-indigo-900">Next Step: Payment</h3>
                  <p className="text-sm text-indigo-700 mt-1">
                    After confirming your address, you will be directed to the secure payment page.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3.5 px-6 rounded-lg font-bold text-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <FaCreditCard className="w-5 h-5" />
              Proceed to Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Shipping;