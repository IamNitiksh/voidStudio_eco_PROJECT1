import { useEffect, useState } from "react";
import { AiFillFileText } from "react-icons/ai";
import {
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaGamepad,
  FaStopwatch,
} from "react-icons/fa";
import { HiMenuAlt4 } from "react-icons/hi";
import { IoIosPeople } from "react-icons/io";
import {
  RiCoupon3Fill,
  RiDashboardFill,
  RiShoppingBag3Fill,
} from "react-icons/ri";
import { Link, Location, useLocation } from "react-router-dom";
import { IconType } from "react-icons";
import { MdDiscount } from "react-icons/md";

const AdminSidebar = () => {
  const location = useLocation();

  const [showModal, setShowModal] = useState<boolean>(false);
  
  // Adjusted breakpoint to typically match md/lg in Tailwind
  const [phoneActive, setPhoneActive] = useState<boolean>(window.innerWidth < 1024);

  const resizeHandler = () => {
    setPhoneActive(window.innerWidth < 1024);
  };

  useEffect(() => {
    window.addEventListener("resize", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  return (
    <>
      {/* Hamburger Button for Mobile */}
      {phoneActive && (
        <button 
          id="hamburger" 
          onClick={() => setShowModal(true)}
          className="fixed top-4 left-4 z-50 p-3 bg-indigo-600 text-white rounded-full shadow-lg lg:hidden"
        >
          <HiMenuAlt4 className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`bg-white text-gray-800 shadow-xl p-6 flex flex-col transition-all duration-500 z-40 
          ${phoneActive ? "fixed h-screen top-0" : "sticky h-full top-0 w-64 flex-shrink-0"}`
        }
        style={
          phoneActive
            ? {
                transform: showModal ? "translateX(0)" : "translateX(-100%)",
                width: "20rem",
              }
            : {}
        }
      >
        <h2 className="text-3xl font-extrabold text-indigo-600 mb-8">Logo.</h2>
        
        <DivOne location={location} />
        <DivTwo location={location} />
        <DivThree location={location} />

        {/* Close Button for Mobile */}
        {phoneActive && (
          <button 
            id="close-sidebar" 
            onClick={() => setShowModal(false)}
            className="absolute bottom-4 right-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition"
          >
            Close
          </button>
        )}
      </aside>
    </>
  );
};

// --- Sidebar Sections ---

const DivOne = ({ location }: { location: Location }) => (
  <div className="mb-8">
    <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Dashboard</h5>
    <ul className="space-y-1">
      <Li url="/admin/dashboard" text="Dashboard" Icon={RiDashboardFill} location={location} />
      <Li url="/admin/product" text="Product" Icon={RiShoppingBag3Fill} location={location} />
      <Li url="/admin/customer" text="Customer" Icon={IoIosPeople} location={location} />
      <Li url="/admin/transaction" text="Transaction" Icon={AiFillFileText} location={location} />
      <Li url="/admin/discount" text="Discount" Icon={MdDiscount} location={location} />
    </ul>
  </div>
);

const DivTwo = ({ location }: { location: Location }) => (
  <div className="mb-8">
    <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Charts</h5>
    <ul className="space-y-1">
      <Li url="/admin/chart/bar" text="Bar" Icon={FaChartBar} location={location} />
      <Li url="/admin/chart/pie" text="Pie" Icon={FaChartPie} location={location} />
      <Li url="/admin/chart/line" text="Line" Icon={FaChartLine} location={location} />
    </ul>
  </div>
);

const DivThree = ({ location }: { location: Location }) => (
  <div className="mb-8">
    <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Apps</h5>
    <ul className="space-y-1">
      <Li url="/admin/app/stopwatch" text="Stopwatch" Icon={FaStopwatch} location={location} />
      <Li url="/admin/app/coupon" text="Coupon" Icon={RiCoupon3Fill} location={location} />
      <Li url="/admin/app/toss" text="Toss" Icon={FaGamepad} location={location} />
    </ul>
  </div>
);

// --- Sidebar List Item ---

interface LiProps {
  url: string;
  text: string;
  location: Location;
  Icon: IconType;
}

const Li = ({ url, text, location, Icon }: LiProps) => {
  const isActive = location.pathname.includes(url);
  
  return (
    <li
      className={`p-3 rounded-lg transition duration-200 ${
        isActive 
          ? "bg-indigo-100 text-indigo-700 font-semibold" 
          : "hover:bg-gray-100 text-gray-700"
      }`}
    >
      <Link
        to={url}
        className="flex items-center space-x-3"
      >
        <Icon className="w-5 h-5" />
        <span className="text-base">{text}</span>
      </Link>
    </li>
  );
};

export default AdminSidebar;