import { useState } from "react";
import AdminSidebar from "../../../components/admin/AdminSidebar";

const Toss = () => {
  const [angle, setAngle] = useState<number>(0);

  const flipCoin = () => {
    // Adds either 180 degrees (for tail) or 360 degrees (for head)
    // plus a large number of full rotations (e.g., 10 * 360) for a spinning effect.
    const extraRotation = Math.random() > 0.5 ? 180 : 360;
    setAngle((prev) => prev + 360 * 10 + extraRotation);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto flex flex-col items-center justify-center">
        <h1 className="text-4xl font-extrabold mb-12 text-gray-800">The Coin Toss</h1>
        
        <section className="bg-white shadow-2xl rounded-full p-10 transform hover:scale-105 transition duration-300">
          <article
            className="tosscoin w-48 h-48 relative cursor-pointer preserve-3d transition-transform duration-[4000ms]" // Added transition for smooth spin
            onClick={flipCoin}
            style={{
              transform: `rotateY(${angle}deg)`,
            }}
          >
            {/* These divs need the original CSS/SCSS styling to create the 3D coin faces.
              Assuming 'tosscoin' class and its children (divs) have the required 
              perspective, faces, and backface-visibility CSS applied externally.
              We'll rely on the existing class definitions for the coin's appearance.
            */}
            <div className="front-face">Head</div> 
            <div className="back-face">Tail</div>
          </article>
        </section>
        
        <button
            onClick={flipCoin}
            className="mt-12 px-8 py-4 bg-indigo-600 text-white font-semibold text-lg rounded-full shadow-lg hover:bg-indigo-700 transition duration-300"
        >
            Flip Coin
        </button>
      </main>
    </div>
  );
};

export default Toss;