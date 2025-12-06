const Loader = () => {
  return (
    <section className="flex items-center justify-center w-full h-screen bg-gray-50">
      <div 
        className="w-12 h-12 border-4 border-t-4 border-indigo-600 border-t-transparent rounded-full animate-spin"
        // The animate-spin class handles the rotation animation
      ></div>
    </section>
  );
};

export default Loader;