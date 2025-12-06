import { FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { CartItem } from "../types/types";
import { transformImage } from "../utils/features";

type CartItemProps = {
  cartItem: CartItem;
  incrementHandler: (cartItem: CartItem) => void;
  decrementHandler: (cartItem: CartItem) => void;
  removeHandler: (id: string) => void;
};

const CartItemComponent = ({
  cartItem,
  incrementHandler,
  decrementHandler,
  removeHandler,
}: CartItemProps) => {
  const { photo, productId, name, price, quantity } = cartItem;

  return (
    <div className="flex items-center border border-gray-200 p-4 rounded-lg shadow-sm bg-white space-x-4 transition duration-200 hover:shadow-md">
      {/* Product Image */}
      <img 
        src={transformImage(photo)} 
        alt={name} 
        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
      />
      
      {/* Product Details */}
      <article className="flex-grow min-w-0">
        <Link 
          to={`/product/${productId}`} 
          className="text-lg font-semibold text-gray-800 hover:text-indigo-600 transition-colors truncate block"
        >
          {name}
        </Link>
        <span className="text-indigo-600 font-bold">₹{price}</span>
      </article>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2 border border-gray-300 rounded-full p-1 flex-shrink-0">
        <button 
          onClick={() => decrementHandler(cartItem)}
          className="w-6 h-6 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center text-sm"
        >
          -
        </button>
        <p className="text-sm font-medium w-6 text-center">{quantity}</p>
        <button 
          onClick={() => incrementHandler(cartItem)}
          className="w-6 h-6 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center text-sm"
        >
          +
        </button>
      </div>

      {/* Remove Button */}
      <button 
        onClick={() => removeHandler(productId)}
        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
      >
        <FaTrash className="w-5 h-5" />
      </button>
    </div>
  );
};

export default CartItemComponent;