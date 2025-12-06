import { FaExpandAlt, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { CartItem } from "../types/types";
import { transformImage } from "../utils/features";

type ProductsProps = {
  productId: string;
  photos: {
    url: string;
    public_id: string;
  }[];
  name: string;
  price: number;
  stock: number;
  handler: (cartItem: CartItem) => string | undefined;
};

const ProductCard = ({
  productId,
  price,
  name,
  photos,
  stock,
  handler,
}: ProductsProps) => {
  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100">
      <div className="relative overflow-hidden">
        <img
          src={transformImage(photos?.[0]?.url, 400)}
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <button
              onClick={() =>
                handler({
                  productId,
                  price,
                  name,
                  photo: photos[0].url,
                  stock,
                  quantity: 1,
                })
              }
              className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            >
              <FaPlus className="w-4 h-4" />
            </button>
            <Link
              to={`/product/${productId}`}
              className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            >
              <FaExpandAlt className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">{name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">₹{price}</span>
          <span className="text-sm text-gray-500">{stock} left</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
