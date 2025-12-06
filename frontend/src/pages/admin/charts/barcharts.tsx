import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { BarChart } from "../../../components/admin/Charts";
import { Skeleton } from "../../../components/loader";
import { useBarQuery } from "../../../redux/api/dashboardAPI";
import { RootState } from "../../../redux/store";
import { CustomError } from "../../../types/api-types";
import { getLastMonths } from "../../../utils/features";

const { last12Months, last6Months } = getLastMonths();

const Barcharts = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);

  const { isLoading, data, error, isError } = useBarQuery(user?._id!);

  const products = data?.charts.products || [];
  const orders = data?.charts.orders || [];
  const users = data?.charts.users || [];

  if (isError) {
    const err = error as CustomError;
    toast.error(err.data.message);
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Bar Charts</h1>
        {isLoading ? (
          <Skeleton length={20} />
        ) : (
          <div className="space-y-8">
            {/* Products & Users Comparison (Last 6 Months) */}
            <section className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Products & Users (Last 6 Months)</h2>
              <div className="h-96 w-full">
                <BarChart
                  data_1={products}
                  data_2={users}
                  labels={last6Months}
                  title_1="Products"
                  title_2="Users"
                  bgColor_1={`hsl(260, 50%, 30%)`}
                  bgColor_2={`hsl(360, 90%, 90%)`}
                />
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">Top Products & Top Customers</p>
            </section>

            {/* Orders Throughout the Year (Last 12 Months) */}
            <section className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Orders Throughout the Year (Last 12 Months)</h2>
              {/* Horizontal Bar Chart for Orders */}
              <div className="h-96 w-full">
                <BarChart
                  horizontal={true}
                  data_1={orders}
                  data_2={[]}
                  title_1="Orders"
                  title_2=""
                  bgColor_1={`hsl(180, 40%, 50%)`}
                  bgColor_2=""
                  labels={last12Months}
                />
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">Monthly Order Count</p>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default Barcharts;