import { CarouselButtonType, MyntraCarousel, Slider, useRating } from "6pp";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import {
  FaArrowLeftLong,
  FaArrowRightLong,
  FaRegStar,
  FaStar,
} from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useParams } from "react-router-dom";
import { Skeleton } from "../components/loader";
import RatingsComponent from "../components/ratings";
import {
  useAllReviewsOfProductsQuery,
  useDeleteReviewMutation,
  useNewReviewMutation,
  useProductDetailsQuery,
} from "../redux/api/productAPI";
import { addToCart } from "../redux/reducer/cartReducer";
import { RootState } from "../redux/store";
import { CartItem, Review } from "../types/types";
import { responseToast } from "../utils/features";

// Helper components for the carousel (renamed for better Tailwind context)
const NextButton: CarouselButtonType = ({ onClick }) => (
  <button
    onClick={onClick}
    className="carousel-btn bg-white/70 hover:bg-white p-3 rounded-full shadow-lg transition absolute right-2 top-1/2 -translate-y-1/2 z-10"
  >
    <FaArrowRightLong className="w-5 h-5 text-gray-800" />
  </button>
);
const PrevButton: CarouselButtonType = ({ onClick }) => (
  <button
    onClick={onClick}
    className="carousel-btn bg-white/70 hover:bg-white p-3 rounded-full shadow-lg transition absolute left-2 top-1/2 -translate-y-1/2 z-10"
  >
    <FaArrowLeftLong className="w-5 h-5 text-gray-800" />
  </button>
);

const ReviewCard = ({
  review,
  userId,
  handleDeleteReview,
}: {
  userId?: string;
  review: Review;
  handleDeleteReview: (reviewId: string) => void;
}) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex-shrink-0 w-80 md:w-96 border border-gray-100 relative">
    <div className="mb-3">
      <RatingsComponent value={review.rating} />
    </div>
    <p className="text-gray-700 italic line-clamp-4 mb-4">"{review.comment}"</p>
    <div className="flex items-center space-x-3">
      <img
        src={review.user.photo}
        alt="User"
        className="w-10 h-10 rounded-full object-cover"
      />
      <small className="font-semibold text-gray-800">
        {review.user.name}
      </small>
    </div>
    {userId === review.user._id && (
      <button
        onClick={() => handleDeleteReview(review._id)}
        className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition p-2 rounded-full hover:bg-red-50"
        title="Delete Review"
      >
        <FaTrash className="w-4 h-4" />
      </button>
    )}
  </div>
);

// Loader Component (Tailwind-ified)
const ProductLoader = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4 lg:p-8 min-h-[80vh]">
      <section className="flex-1 max-w-full lg:max-w-xl">
        <Skeleton width="100%" containerHeight="100%" height="80vh" length={1} />
      </section>
      <section className="flex-1 flex flex-col gap-8 p-4">
        <Skeleton width="40%" length={3} />
        <Skeleton width="50%" length={4} />
        <Skeleton width="100%" length={2} />
        <Skeleton width="100%" length={10} />
      </section>
    </div>
  );
};


const ProductDetails = () => {
  const params = useParams();
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.userReducer);

  const { isLoading, isError, data } = useProductDetailsQuery(params.id!);
  const reviewsResponse = useAllReviewsOfProductsQuery(params.id!);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [reviewComment, setReviewComment] = useState("");
  const reviewDialogRef = useRef<HTMLDialogElement>(null);
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);

  const [createReview] = useNewReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const decrement = () => setQuantity((prev) => prev - 1);
  const increment = () => {
    if (data?.product?.stock === quantity)
      return toast.error(`${data?.product?.stock} available only`);
    setQuantity((prev) => prev + 1);
  };

  const addToCartHandler = (cartItem: CartItem) => {
    if (cartItem.stock < 1) return toast.error("Out of Stock");

    dispatch(addToCart(cartItem));
    toast.success("Added to cart");
  };

  if (isError) return <Navigate to="/404" />;

  const showDialog = () => {
    reviewDialogRef.current?.showModal();
  };

  const {
    Ratings: RatingsEditable,
    rating,
    setRating,
  } = useRating({
    IconFilled: <FaStar />,
    IconOutline: <FaRegStar />,
    value: 0,
    selectable: true,
    // Adjusted styles for Tailwind compatibility and better appearance
    styles: {
      fontSize: "2rem",
      color: "gold", // Used color name for better semantic meaning in this context
      justifyContent: "flex-start",
      display: "flex",
      gap: "0.25rem",
    },
  });

  const reviewCloseHandler = () => {
    reviewDialogRef.current?.close();
    setRating(0);
    setReviewComment("");
  };

  const submitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setReviewSubmitLoading(true);
    reviewCloseHandler();

    const res = await createReview({
      comment: reviewComment,
      rating,
      userId: user?._id,
      productId: params.id!,
    });

    setReviewSubmitLoading(false);

    responseToast(res, null, "Review submitted successfully!");

    // Re-fetch reviews to update the list immediately
    reviewsResponse.refetch(); 
  };

  const handleDeleteReview = async (reviewId: string) => {
    const res = await deleteReview({ reviewId, userId: user?._id });
    responseToast(res, null, "Review deleted successfully!");
    // Re-fetch reviews to update the list immediately
    reviewsResponse.refetch(); 
  };

  return (
    <div className="product-details p-4 lg:p-8 bg-gray-50 min-h-screen">
      {isLoading ? (
        <ProductLoader />
      ) : (
        <>
          <main className="flex flex-col lg:flex-row gap-8 bg-white p-6 rounded-xl shadow-lg">
            {/* Image Gallery Section */}
            <section className="w-full lg:w-1/2 relative h-96 lg:h-[600px] overflow-hidden rounded-lg shadow-xl cursor-pointer">
              <Slider
                showThumbnails
                showNav={false}
                onClick={() => setCarouselOpen(true)}
                images={data?.product?.photos.map((i) => i.url) || []}
              />
              {carouselOpen && (
                <MyntraCarousel
                  NextButton={NextButton}
                  PrevButton={PrevButton}
                  setIsOpen={setCarouselOpen}
                  images={data?.product?.photos.map((i) => i.url) || []}
                />
              )}
            </section>
            
            {/* Details Section */}
            <section className="w-full lg:w-1/2 p-4 lg:p-6 space-y-6">
              <code className="inline-block px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                {data?.product?.category}
              </code>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                {data?.product?.name}
              </h1>
              
              {/* Ratings and Review Count */}
              <div className="flex items-center space-x-2 text-lg text-gray-600">
                <RatingsComponent value={data?.product?.ratings || 0} />
                <span className="text-sm font-medium text-gray-500">
                  ({data?.product?.numOfReviews} reviews)
                </span>
              </div>
              
              {/* Price */}
              <h3 className="text-4xl font-bold text-red-600">
                ₹{data?.product?.price.toLocaleString("en-IN")}
              </h3>
              
              {/* Quantity and Add to Cart */}
              <article className="flex flex-col sm:flex-row gap-4">
                {/* Quantity Control */}
                <div className="flex items-center space-x-0 border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={decrement}
                    className="p-3 w-12 text-xl font-semibold bg-gray-100 hover:bg-gray-200 transition text-gray-700"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="p-3 w-12 text-center text-lg font-semibold border-x border-gray-300">
                    {quantity}
                  </span>
                  <button
                    onClick={increment}
                    className="p-3 w-12 text-xl font-semibold bg-gray-100 hover:bg-gray-200 transition text-gray-700"
                    disabled={quantity >= (data?.product?.stock || 0)}
                  >
                    +
                  </button>
                </div>
                
                {/* Add to Cart Button */}
                <button
                  onClick={() =>
                    addToCartHandler({
                      productId: data?.product?._id!,
                      name: data?.product?.name!,
                      price: data?.product?.price!,
                      stock: data?.product?.stock!,
                      quantity,
                      photo: data?.product?.photos[0].url || "",
                    })
                  }
                  disabled={(data?.product?.stock || 0) < 1}
                  className="flex-1 sm:flex-grow-0 bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-lg shadow-md"
                >
                  {(data?.product?.stock || 0) < 1 ? "Out of Stock" : "Add To Cart"}
                </button>
              </article>

              {/* Description */}
              <h4 className="text-xl font-semibold text-gray-800 pt-4">Product Description</h4>
              <p className="text-gray-600 leading-relaxed">
                {data?.product?.description}
              </p>
            </section>
          </main>
        </>
      )}

      {/* Review Dialog */}
      <dialog ref={reviewDialogRef} className="review-dialog backdrop:bg-black/50 p-6 rounded-xl shadow-2xl max-w-lg w-full">
        <button
          onClick={reviewCloseHandler}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 transition text-xl p-1"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Write a Review</h2>
        <form onSubmit={submitReview} className="space-y-4">
          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Share your thoughts on the product..."
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition resize-none"
          ></textarea>
          
          {/* Ratings component is styled via the useRating hook for consistency */}
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">Your Rating:</span>
            <RatingsEditable />
          </div>
          
          <button
            disabled={reviewSubmitLoading || rating === 0 || reviewComment.trim() === ""}
            type="submit"
            className="w-full bg-coral-600 text-white font-semibold py-3 rounded-lg hover:bg-coral-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {reviewSubmitLoading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </dialog>

      {/* Reviews Section */}
      <section className="mt-12 p-6 bg-white rounded-xl shadow-lg">
        <article className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          {reviewsResponse.isLoading
            ? null
            : user && (
                <button
                  onClick={showDialog}
                  className="flex items-center space-x-2 bg-green-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-600 transition shadow-md"
                >
                  <FiEdit className="w-4 h-4" />
                  <span>Write Review</span>
                </button>
              )}
        </article>
        
        {/* Reviews Carousel/List */}
        <div
          className="flex gap-4 overflow-x-auto p-2" // Added p-2 for inner spacing
          style={{ scrollbarWidth: "none" }} // Hide scrollbar for cleaner look
        >
          {reviewsResponse.isLoading ? (
            // Skeleton loader for reviews
            <>
              <Skeleton width="100%" height="200px" className="flex-shrink-0 w-80 md:w-96" />
              <Skeleton width="100%" height="200px" className="flex-shrink-0 w-80 md:w-96" />
              <Skeleton width="100%" height="200px" className="flex-shrink-0 w-80 md:w-96" />
            </>
          ) : reviewsResponse.data?.reviews && reviewsResponse.data.reviews.length > 0 ? (
            reviewsResponse.data?.reviews.map((review) => (
              <ReviewCard
                handleDeleteReview={handleDeleteReview}
                userId={user?._id}
                key={review._id}
                review={review}
              />
            ))
          ) : (
            <div className="text-center w-full py-10 text-gray-500">
              No reviews yet. Be the first to review this product!
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;