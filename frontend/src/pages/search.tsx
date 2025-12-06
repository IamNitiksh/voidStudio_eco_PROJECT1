import { useState } from "react";
import ProductCard from "../components/product-card";
import {
  useCategoriesQuery,
  useSearchProductsQuery,
} from "../redux/api/productAPI";
import { CustomError } from "../types/api-types";
import toast from "react-hot-toast";
import { Skeleton } from "../components/loader";
import { CartItem } from "../types/types";
import { addToCart } from "../redux/reducer/cartReducer";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { FaFilter, FaSearch } from "react-icons/fa";

const filterInputStyle = "w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors";

const Search = () => {
  const searchQuery = useSearchParams()[0];
  const dispatch = useDispatch();

  const {
    data: categoriesResponse,
    isLoading: loadingCategories,
    isError,
    error,
  } = useCategoriesQuery("");

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  // Set initial maxPrice to the actual max price from the searched data if available, otherwise keep it high.
  const [maxPrice, setMaxPrice] = useState(100000); 
  const [category, setCategory] = useState(searchQuery.get("category") || "");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Mobile filter state

  const {
    isLoading: productLoading,
    data: searchedData,
    isError: productIsError,
    error: productError,
  } = useSearchProductsQuery({
    search,
    sort,
    category,
    page,
    price: maxPrice,
  });

  // Correct pagination logic
  const totalPages = searchedData?.totalPage || 1;
  const isPrevPage = page > 1;
  const isNextPage = page < totalPages;

  const addToCartHandler = (cartItem: CartItem) => {
    if (cartItem.stock < 1) return toast.error("Out of Stock");
    dispatch(addToCart(cartItem));
    toast.success("Added to cart");
  };

  // Error handling moved to a more concise format
  if (isError) {
    const err = error as CustomError;
    toast.error(err?.data?.message || "Failed to load categories");
  }
  if (productIsError) {
    const err = productError as CustomError;
    toast.error(err?.data?.message || "Failed to load products");
  }

  // Set the max price from data if available, but only once initially
  // You might need a slightly more complex useEffect to correctly set the initial max price based on product data.
  /*
  useEffect(() => {
    if (searchedData?.products.length > 0) {
      const highestPrice = Math.max(...searchedData.products.map(p => p.price));
      setMaxPrice(highestPrice > maxPrice ? highestPrice : maxPrice); // Simple heuristic
    }
  }, [searchedData]);
  */


  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsFilterOpen(prev => !prev)}
        className="lg:hidden w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg mb-4 flex items-center justify-center gap-2"
      >
        <FaFilter /> {isFilterOpen ? "Hide Filters" : "Show Filters"}
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filter */}
        <aside 
          className={`lg:w-1/4 w-full bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 ${
            isFilterOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-2">
            <FaFilter className="text-indigo-600" /> Filter Products
          </h2>

          <div className="space-y-6">
            {/* Search Input */}
            <div>
                <h4 className="font-semibold text-gray-700 mb-2">Search by Name</h4>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`${filterInputStyle} pl-10`}
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
            </div>

            {/* Sort Dropdown */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Sort By Price</h4>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className={filterInputStyle}>
                <option value="">Default</option>
                <option value="asc">Price (Low to High)</option>
                <option value="dsc">Price (High to Low)</option>
              </select>
            </div>

            {/* Max Price Range */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">
                Max Price: <span className="text-indigo-600 font-bold">₹{maxPrice.toLocaleString()}</span>
              </h4>
              <input
                type="range"
                min={100}
                max={100000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg transition-colors"
                style={{accentColor: '#4f46e5'}}
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Category</h4>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={filterInputStyle}
              >
                <option value="">ALL Categories</option>
                {loadingCategories ? (
                    <option disabled>Loading...</option>
                ) : (
                    categoriesResponse?.categories.map((i) => (
                        <option key={i} value={i}>
                            {i.toUpperCase()}
                        </option>
                    ))
                )}
              </select>
            </div>
          </div>
        </aside>

        {/* Main Product Display */}
        <main className="lg:w-3/4 w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Search Results ({searchedData?.products.length || 0} items)
          </h1>

          {productLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <Skeleton length={8} width="100%" height="280px" />
            </div>
          ) : searchedData?.products.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl shadow-md border border-gray-100">
                <p className="text-xl text-gray-500 font-medium">
                    No products found matching your criteria. 😥
                </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchedData?.products.map((i) => (
                <ProductCard
                  key={i._id}
                  productId={i._id}
                  name={i.name}
                  price={i.price}
                  stock={i.stock}
                  handler={addToCartHandler}
                  photos={i.photos}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-10 space-x-4">
              <button
                disabled={!isPrevPage}
                onClick={() => setPage((prev) => prev - 1)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold disabled:bg-gray-400 transition-colors hover:bg-indigo-700"
              >
                Previous
              </button>
              <span className="text-gray-700 font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={!isNextPage}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold disabled:bg-gray-400 transition-colors hover:bg-indigo-700"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Search;