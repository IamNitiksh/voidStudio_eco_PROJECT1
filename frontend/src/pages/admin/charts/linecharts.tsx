import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { LineChart } from "../../../components/admin/Charts";
import { Skeleton } from "../../../components/loader";
import { useLineQuery } from "../../../redux/api/dashboardAPI";
import { RootState } from "../../../redux/store";
import { CustomError } from "../../../types/api-types";
import { getLastMonths } from "../../../utils/features";

const { last12Months: months } = getLastMonths();

const Linecharts = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);

  const { isLoading, data, error, isError } = useLineQuery(user?._id!);

  const products = data?.charts.products || [];
  const users = data?.charts.users || [];
  const revenue = data?.charts.revenue || [];
  const discount = data?.charts.discount || [];

  if (isError) {
    const err = error as CustomError;
    toast.error(err.data.message);
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Line Charts</h1>

        {isLoading ? (
          <Skeleton length={15} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Active Users */}
            <section className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Active Users (Last 12 Months)</h2>
              <div className="h-80 w-full">
                <LineChart
                  data={users}
                  label="Users"
                  borderColor="rgb(53, 162, 255)"
                  labels={months}
                  backgroundColor="rgba(53, 162, 255, 0.5)"
                />
              </div>
            </section>

            {/* Total Products (SKU) */}
            <section className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Total Products (SKU) (Last 12 Months)</h2>
              <div className="h-80 w-full">
                <LineChart
                  data={products}
                  backgroundColor={"hsla(269,80%,40%,0.4)"}
                  borderColor={"hsl(269,80%,40%)"}
                  labels={months}
                  label="Products"
                />
              </div>
            </section>

            {/* Total Revenue */}
            <section className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Total Revenue (Last 12 Months)</h2>
              <div className="h-80 w-full">
                <LineChart
                  data={revenue}
                  backgroundColor={"hsla(129,80%,40%,0.4)"}
                  borderColor={"hsl(129,80%,40%)"}
                  label="Revenue"
                  labels={months}
                />
              </div>
            </section>

            {/* Discount Allotted */}
            <section className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Discount Allotted (Last 12 Months)</h2>
              <div className="h-80 w-full">
                <LineChart
                  data={discount}
                  backgroundColor={"hsla(29,80%,40%,0.4)"}
                  borderColor={"hsl(29,80%,40%)"}
                  label="Discount"
                  labels={months}
                />
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default Linecharts;