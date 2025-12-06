import { useFileHandler } from "6pp";
import { FormEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { Skeleton } from "../../../components/loader";
import {
  useDeleteProductMutation,
  useProductDetailsQuery,
  useUpdateProductMutation,
} from "../../../redux/api/productAPI";
import { RootState } from "../../../redux/store";
import { responseToast, transformImage } from "../../../utils/features";

const Productmanagement = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);

  const params = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useProductDetailsQuery(params.id!);

  const { price, photos, name, stock, category, description } =
    data?.product || {
      photos: [],
      category: "",
      name: "",
      stock: 0,
      price: 0,
      description: "",
    };
    
  // ... state declarations (unchanged)
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [priceUpdate, setPriceUpdate] = useState<number>(price);
  const [stockUpdate, setStockUpdate] = useState<number>(stock);
  const [nameUpdate, setNameUpdate] = useState<string>(name);
  const [categoryUpdate, setCategoryUpdate] = useState<string>(category);
  const [descriptionUpdate, setDescriptionUpdate] =
    useState<string>(description);

  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const photosFiles = useFileHandler("multiple", 10, 5);

  // ... useEffect, submitHandler, and deleteHandler (unchanged logic)
  useEffect(() => {
    if (data) {
      setNameUpdate(data.product.name);
      setPriceUpdate(data.product.price);
      setStockUpdate(data.product.stock);
      setCategoryUpdate(data.product.category);
      setDescriptionUpdate(data.product.description);
    }
  }, [data]);

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setBtnLoading(true);
    try {
      const formData = new FormData();

      if (nameUpdate) formData.set("name", nameUpdate);
      if (descriptionUpdate) formData.set("description", descriptionUpdate);
      if (priceUpdate) formData.set("price", priceUpdate.toString());
      if (stockUpdate !== undefined)
        formData.set("stock", stockUpdate.toString());

      if (categoryUpdate) formData.set("category", categoryUpdate);

      if (photosFiles.file && photosFiles.file.length > 0) {
        photosFiles.file.forEach((file) => {
          formData.append("photos", file);
        });
      }

      const res = await updateProduct({
        formData,
        userId: user?._id!,
        productId: data?.product._id!,
      });

      responseToast(res, navigate, "/admin/product");
    } catch (error) {
      console.log(error);
    } finally {
      setBtnLoading(false);
    }
  };

  const deleteHandler = async () => {
    const res = await deleteProduct({
      userId: user?._id!,
      productId: data?.product._id!,
    });

    responseToast(res, navigate, "/admin/product");
  };

  if (isError) return <Navigate to={"/404"} />;

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Product Management</h1>
        {isLoading ? (
          <Skeleton length={20} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Product Info Section */}
            <section className="lg:col-span-1 bg-white shadow-lg rounded-xl p-6 h-fit text-center">
              <strong className="text-sm font-semibold text-gray-500 block mb-4">ID - {data?.product._id}</strong>
              {/* Using a placeholder for the image if not available or transforming it */}
              <img 
                src={transformImage(photos[0]?.url)} 
                alt="Product" 
                className="w-48 h-48 object-contain mx-auto rounded-lg mb-4 border border-gray-200"
              />
              <p className="text-xl font-bold mb-2 text-gray-900">{name}</p>
              {stock > 0 ? (
                <span className="text-green-600 font-semibold bg-green-100 px-3 py-1 rounded-full inline-block">
                  {stock} Available
                </span>
              ) : (
                <span className="text-red-600 font-semibold bg-red-100 px-3 py-1 rounded-full inline-block">
                  Not Available
                </span>
              )}
              <h3 className="text-2xl font-extrabold mt-4 text-indigo-600">₹{price}</h3>
            </section>
            
            {/* Management Form Section */}
            <article className="lg:col-span-2 bg-white shadow-lg rounded-xl p-6 relative">
              <button 
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition duration-150 p-2 rounded-full hover:bg-red-50" 
                onClick={deleteHandler}
                title="Delete Product"
              >
                <FaTrash className="w-5 h-5" />
              </button>
              
              <form onSubmit={submitHandler} className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Product</h2>
                
                {/* Input Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      placeholder="Name"
                      value={nameUpdate}
                      onChange={(e) => setNameUpdate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      required
                      placeholder="Description"
                      value={descriptionUpdate}
                      onChange={(e) => setDescriptionUpdate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      placeholder="Price"
                      value={priceUpdate}
                      onChange={(e) => setPriceUpdate(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input
                      type="number"
                      placeholder="Stock"
                      value={stockUpdate}
                      onChange={(e) => setStockUpdate(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      placeholder="eg. laptop, camera etc"
                      value={categoryUpdate}
                      onChange={(e) => setCategoryUpdate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Photos</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={photosFiles.changeHandler}
                      className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                </div>

                {photosFiles.error && <p className="text-red-500 text-sm mt-2">{photosFiles.error}</p>}

                {/* Photo Preview */}
                {photosFiles.preview && (
                  <div className="flex gap-4 overflow-x-auto p-2 border border-gray-200 rounded-lg bg-gray-50">
                    {photosFiles.preview.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`New Image ${i + 1}`}
                        className="w-24 h-24 object-cover rounded-md flex-shrink-0 shadow-sm"
                      />
                    ))}
                  </div>
                )}

                {/* Submit Button */}
                <button 
                  disabled={btnLoading} 
                  type="submit"
                  className={`w-full py-3 mt-4 font-semibold rounded-lg transition duration-150 ${
                    btnLoading 
                      ? "bg-indigo-400 cursor-not-allowed" 
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                  }`}
                >
                  {btnLoading ? "Updating..." : "Update Product"}
                </button>
              </form>
            </article>
          </div>
        )}
      </main>
    </div>
  );
};

export default Productmanagement;