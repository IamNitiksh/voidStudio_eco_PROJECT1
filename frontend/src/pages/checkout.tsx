import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useNewOrderMutation } from "../redux/api/orderAPI";
import { resetCart } from "../redux/reducer/cartReducer";
import { RootState } from "../redux/store";
import { NewOrderRequest } from "../types/api-types";
import { responseToast } from "../utils/features";

// ⚠️ COMMENT OUT ALL STRIPE-RELATED IMPORTS AND CONFIGURATION
// import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
// import { loadStripe } from "@stripe/stripe-js";

// const stripeKey = "pk_test_51OHpE1SEOz14slwcBOcGOweicHk9XITWgND9NAvr7ZJXIYdUiNyOHQtrbCsdQTLQqVAgDNeaDpPshuIO1PnHthtq00AJdf3gtG";
// const stripePromise = loadStripe(stripeKey);

// -------------------------------------------------------------------------
// *** MODIFIED COMPONENT: Bypass Stripe and proceed directly to order API ***
// -------------------------------------------------------------------------

const CheckOutForm = () => {
  // ⚠️ STRIPE HOOKS ARE REMOVED
  // const stripe = useStripe();
  // const elements = useElements();
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

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ⚠️ STRIPE CHECKS ARE REMOVED
    // if (!stripe || !elements) return;

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

    // ⚠️ STRIPE PAYMENT CONFIRMATION LOGIC IS REMOVED/BYPASSED

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
  
  // NOTE: PaymentElement is removed as it's a Stripe component
  return (
    <div className="checkout-container">
      <form onSubmit={submitHandler}>
        {/* <PaymentElement /> ⚠️ Removed Stripe's PaymentElement */}
        <h2>Simulated Payment Checkout</h2>
        <p>This form bypasses Stripe to test order submission.</p>
        <button type="submit" disabled={isProcessing}>
          {isProcessing ? "Submitting Order..." : "Place Order (Bypass Payment)"}
        </button>
      </form>
    </div>
  );
};

const Checkout = () => {
  const location = useLocation();

  // ⚠️ The clientSecret is still checked, but is effectively ignored, 
  // ensuring the user arrived from the shipping page.
  const clientSecret: string | undefined = location.state;

  if (!clientSecret) return <Navigate to={"/shipping"} />;

  // ⚠️ ELEMENTS WRAPPER IS REMOVED SINCE WE ARE NOT USING STRIPE
  return <CheckOutForm />;
  
  // ⚠️ ORIGINAL CODE COMMENTED OUT FOR FUTURE USE:
  // return (
  //   <Elements
  //     options={{
  //       clientSecret,
  //     }}
  //     stripe={stripePromise}
  //   >
  //     <CheckOutForm />
  //   </Elements>
  // );
};

export default Checkout;