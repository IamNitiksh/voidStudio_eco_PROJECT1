const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }}></div>
      </div>
    </div>
  );
};

export const LoaderLayout = () => {
  return (
    <div className="flex items-center justify-center" style={{ height: "calc(100vh - 4rem)" }}>
      <div className="relative">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }}></div>
      </div>
    </div>
  );
};

export default Loader;

interface SkeletonProps {
  width?: string;
  length?: number;
  height?: string;
  containerHeight?: string;
}

export const Skeleton = ({
  width = "unset",
  length = 3,
  height = "30px",
  containerHeight = "unset",
}: SkeletonProps) => {
  const skeletons = Array.from({ length }, (_, idx) => (
    <div
      key={idx}
      className="bg-gray-200 rounded animate-pulse"
      style={{ height, marginBottom: idx < length - 1 ? '8px' : '0' }}
    ></div>
  ));

  return (
    <div style={{ width, height: containerHeight }}>
      {skeletons}
    </div>
  );
};
