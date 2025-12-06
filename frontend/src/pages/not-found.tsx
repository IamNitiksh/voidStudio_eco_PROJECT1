import { MdError } from "react-icons/md";

const NotFound = () => {
  return (
    <div className="container min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center">
      <div className="p-10 bg-white rounded-xl shadow-2xl">
        <MdError className="text-8xl text-red-600 mx-auto mb-6 animate-pulse" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
          404 - Page Not Found
        </h1>
        <p className="text-xl text-gray-600">
          The page you are looking for does not exist.
        </p>
        <a 
          href="/" 
          className="mt-8 inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          Go to Homepage
        </a>
      </div>
    </div>
  );
};

export default NotFound;