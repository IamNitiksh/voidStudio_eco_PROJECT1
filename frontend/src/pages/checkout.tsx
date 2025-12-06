import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useNewOrderMutation } from "../redux/api/orderAPI";
import { resetCart } from "../redux/reducer/cartReducer";
import { RootState } from "../redux/store";
import { NewOrderRequest } from "../types/api-types";
import { responseToast } from "../utils/features";
import { FaCreditCard, FaShieldAlt, FaTruck, FaMapMarkerAlt, FaShoppingCart } from "react-icons/fa";

// ... (Imports from original file)

const CheckOutForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.userReducer);

  const {
    shippingInfo,
    cartItems,
    subtotal,
    tax,
    discount,
    shippingCharges,
    total,
  } = useSelector((state: RootState) => state.cartReducer);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [newOrder] = useNewOrderMutation();

  // LOGIC FIX/CONFIRMATION: Correctly uses NewOrderRequest structure and dispatches resetCart.
  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsProcessing(true);

    const orderData: NewOrderRequest = {
      shippingInfo,
      orderItems: cartItems,
      subtotal,
      tax,
      discount,
      shippingCharges,
      total,
      user: user?._id!,
    };

    try {
      // ** SIMULATE SUCCESSFUL PAYMENT / USE CASH ON DELIVERY LOGIC **
      toast.success("Payment simulated successfully (Cash on Delivery/Bypass)");

      // Proceed to create the new order via the backend API
      const res = await newOrder(orderData);
      dispatch(resetCart());
      responseToast(res, navigate, "/orders");
    } catch (error) {
      toast.error("Order submission failed.");
      console.error(error);
    }

    setIsProcessing(false);
  };

  // UI Refactor with Tailwind CSS
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Finalize Order</h1>
          <p className="text-gray-600">Review your order details and place your order.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details Column (Two-thirds width on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Shipping Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4 border-b pb-3">
                <FaMapMarkerAlt className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
              </div>
              <div className="text-gray-700 space-y-1 pl-1">
                <p className="font-bold text-gray-900">{shippingInfo.name}</p>
                <p>{shippingInfo.address}, {shippingInfo.city}</p>
                <p>{shippingInfo.state} - {shippingInfo.pinCode}</p>
                <p className="font-medium">{shippingInfo.country}</p>
              </div>
            </div>

            {/* Order Items Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4 border-b pb-3">
                <FaShoppingCart className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Order Items ({cartItems.length})</h2>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-4 border-b last:border-b-0 pb-3">
                    <img
                      src={item.photo}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">Unit Price: ₹{item.price.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-700 font-medium">Qty: {item.quantity}</p>
                      <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* Payment & Summary Column (One-third width on large screens) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Order Summary Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky lg:top-8 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-5 border-b pb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>₹{shippingCharges.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>₹{tax.toLocaleString("en-IN")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <hr className="border-gray-200 mt-4" />
                <div className="flex justify-between text-2xl font-bold text-gray-900 pt-2">
                  <span>Total Due</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>
              
              {/* Payment Method */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Payment Option</h3>
                <div className="flex items-center space-x-3 p-4 border border-blue-400 bg-blue-50 rounded-lg shadow-sm">
                  <FaCreditCard className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-bold text-gray-900">Cash on Delivery (COD)</p>
                    <p className="text-sm text-gray-600">Pay when you receive your order</p>
                  </div>
                </div>
              </div>

              <form onSubmit={submitHandler} className="space-y-4">
                
                {/* Secure Checkout Badge */}
                <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FaShieldAlt className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-900">Secure Checkout</h3>
                      <p className="text-xs text-green-700 mt-1">
                        Your data is protected. Placing order via Cash on Delivery.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={isProcessing || cartItems.length === 0}
                  className="w-full bg-red-600 text-white py-4 px-6 rounded-lg font-bold hover:bg-red-700 focus:ring-4 focus:ring-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg shadow-lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <FaTruck className="mr-2 w-5 h-5" />
                      Place Order (₹{total.toLocaleString("en-IN")})
                    </>
                  )}
                </button>
              </form>
            </div>
            
            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
                <FaShieldAlt className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-900">Secure</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
                <FaTruck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-900">Fast Shipping</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
                <FaCreditCard className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-900">COD Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  const location = useLocation();

  // The clientSecret check ensures the user arrived from the shipping page.
  const clientSecret: string | undefined = location.state;

  // LOGIC CONFIRMATION: Correctly redirects if shipping info wasn't set (via no clientSecret).
  if (!clientSecret) return <Navigate to={"/shipping"} />;

  return <CheckOutForm />;
};

export default Checkout;