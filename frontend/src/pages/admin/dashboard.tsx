import { BiMaleFemale } from "react-icons/bi";
import { BsSearch } from "react-icons/bs";
import { FaRegBell } from "react-icons/fa";
import { HiTrendingDown, HiTrendingUp } from "react-icons/hi";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { BarChart, DoughnutChart } from "../../components/admin/Charts";
import Table from "../../components/admin/DashboardTable";
import { Skeleton } from "../../components/loader";
import { useStatsQuery } from "../../redux/api/dashboardAPI";
import { RootState } from "../../redux/store";
import { getLastMonths } from "../../utils/features";

const userImg =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJxA5cTf-5dh5Eusm0puHbvAhOrCRPtckzjA&usqp";

const { last6Months: months } = getLastMonths();

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);

  const { isLoading, data, isError } = useStatsQuery(user?._id ?? "");

  const stats = data?.stats;

  if (isError) return <Navigate to={"/"} />;
  
  // Guard clause for stats being undefined while loading
  if (!stats && !isLoading) return <Navigate to={"/"} />;


  return (
    <div className="flex h-screen bg-gray-100"> {/* admin-container */}
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto"> {/* dashboard */}
        {isLoading ? (
          <Skeleton length={20} />
        ) : (
          <>
            {/* Bar/Header Section */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md mb-6 space-x-4"> {/* bar */}
              <div className="flex items-center flex-grow bg-gray-50 rounded-lg border border-gray-200 p-2">
                <BsSearch className="text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search for data, users, docs" 
                  className="flex-grow bg-transparent outline-none text-gray-700"
                />
              </div>
              <FaRegBell className="text-xl text-gray-600 cursor-pointer hover:text-blue-500 transition duration-150" />
              <img src={user?.photo || userImg} alt="User" className="w-10 h-10 rounded-full object-cover cursor-pointer" />
            </div>

            {/* Widget Section */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"> {/* widget-container */}
              <WidgetItem
                percent={stats!.changePercent.revenue}
                amount={true}
                value={stats!.count.revenue}
                heading="Revenue"
                color="rgb(0, 115, 255)"
              />
              <WidgetItem
                percent={stats!.changePercent.user}
                value={stats!.count.user}
                color="rgb(0 198 202)"
                heading="Users"
              />
              <WidgetItem
                percent={stats!.changePercent.order}
                value={stats!.count.order}
                color="rgb(255 196 0)"
                heading="Transactions"
              />
              <WidgetItem
                percent={stats!.changePercent.product}
                value={stats!.count.product}
                color="rgb(76 0 255)"
                heading="Products"
              />
            </section>

            {/* Graph Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"> {/* graph-container */}
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md"> {/* revenue-chart */}
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Revenue & Transaction</h2>
                <div className="h-96"> {/* Added height for chart */}
                  <BarChart
                    labels={months}
                    data_1={stats!.chart.revenue}
                    data_2={stats!.chart.order}
                    title_1="Revenue"
                    title_2="Transaction"
                    bgColor_1="rgb(0, 115, 255)"
                    bgColor_2="rgba(53, 162, 235, 0.8)"
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md"> {/* dashboard-categories */}
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Inventory</h2>
                <div className="space-y-4">
                  {stats!.categoryCount.map((i) => {
                    const [heading, value] = Object.entries(i)[0];
                    return (
                      <CategoryItem
                        key={heading}
                        value={value}
                        heading={heading}
                        color={`hsl(${value * 4}, ${value}%, 50%)`}
                      />
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Transaction/Ratio Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6"> {/* transaction-container */}
              <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md flex flex-col items-center"> {/* gender-chart */}
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Gender Ratio</h2>
                <div className="w-full max-w-xs h-64 flex justify-center items-center relative">
                    <DoughnutChart
                      labels={["Female", "Male"]}
                      data={[stats!.userRatio.female, stats!.userRatio.male]}
                      backgroundColor={[
                        "hsl(340, 82%, 56%)",
                        "rgba(53, 162, 235, 0.8)",
                      ]}
                      cutout={90}
                    />
                  <p className="absolute text-5xl text-gray-400">
                    <BiMaleFemale />
                  </p>
                </div>
              </div>
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Latest Transactions</h2>
                <Table data={stats!.latestTransaction} />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

interface WidgetItemProps {
  heading: string;
  value: number;
  percent: number;
  color: string;
  amount?: boolean;
}

const WidgetItem = ({
  heading,
  value,
  percent,
  color,
  amount = false,
}: WidgetItemProps) => {
  const isPositive = percent > 0;
  const clampedPercent = isPositive 
    ? (percent > 10000 ? 9999 : percent)
    : (percent < -10000 ? -9999 : percent);
  const degree = (Math.abs(clampedPercent) / 100) * 360;

  return (
    <article className="flex p-4 bg-white rounded-lg shadow-md items-center justify-between space-x-4 transition duration-300 hover:shadow-xl"> {/* widget */}
      <div className="flex flex-col space-y-1"> {/* widget-info */}
        <p className="text-sm font-medium text-gray-500">{heading}</p>
        <h4 className="text-2xl font-bold text-gray-900">
          {amount ? `₹${value.toLocaleString()}` : value.toLocaleString()}
        </h4>
        <span className={`${isPositive ? "text-green-500" : "text-red-500"} flex items-center text-sm font-semibold`}>
          {isPositive ? <HiTrendingUp className="mr-1" /> : <HiTrendingDown className="mr-1" />}
          {`${isPositive ? '+' : ''}${clampedPercent}%`}
        </span>
      </div>

      <div
        className="relative w-16 h-16 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: `conic-gradient(
            ${color} ${degree}deg,
            rgb(243 244 246) 0deg
          )`,
        }}
      >
        <div className="absolute w-14 h-14 bg-white rounded-full flex items-center justify-center">
          <span
            className="text-xs font-bold"
            style={{ color }}
          >
            {clampedPercent !== 0 && `${clampedPercent}%`}
          </span>
        </div>
      </div>
    </article>
  );
};


interface CategoryItemProps {
  color: string;
  value: number;
  heading: string;
}

const CategoryItem = ({ color, value, heading }: CategoryItemProps) => (
  <div className="space-y-1"> {/* category-item */}
    <h5 className="text-sm font-medium text-gray-700 capitalize">{heading}</h5>
    <div className="relative h-2 bg-gray-200 rounded-full">
      <div
        className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
        style={{
          backgroundColor: color,
          width: `${value}%`,
        }}
      ></div>
    </div>
    <span className="text-xs font-semibold text-gray-500 block text-right">{value}%</span>
  </div>
);

export default Dashboard;