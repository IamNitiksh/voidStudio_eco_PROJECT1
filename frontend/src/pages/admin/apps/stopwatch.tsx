import AdminSidebar from "../../../components/admin/AdminSidebar";
import { useState, useEffect } from "react";

const formatTime = (timeInSeconds: number) => {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;

  const hoursInString = hours.toString().padStart(2, "0");
  const minutesInString = minutes.toString().padStart(2, "0");
  const secondsInString = seconds.toString().padStart(2, "0");

  return `${hoursInString}:${minutesInString}:${secondsInString}`;
};

const Stopwatch = () => {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const resetHandler = () => {
    setTime(0);
    setIsRunning(false);
  };

  useEffect(() => {
    let intervalID: NodeJS.Timeout;
    if (isRunning)
      intervalID = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);

    return () => {
      clearInterval(intervalID);
    };
  }, [isRunning]);

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Stopwatch</h1>
        
        <section className="flex-grow flex items-center justify-center w-full">
          <div className="bg-white shadow-xl rounded-2xl p-10 max-w-sm w-full text-center space-y-8">
            <div className="stopwatch">
              <h2 className="text-6xl font-mono font-extrabold text-indigo-600">
                {formatTime(time)}
              </h2>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => setIsRunning((prev) => !prev)}
                className={`px-6 py-3 font-semibold rounded-full transition duration-300 ${
                  isRunning 
                    ? "bg-red-500 text-white hover:bg-red-600" 
                    : "bg-green-500 text-white hover:bg-green-600"
                } shadow-md`}
              >
                {isRunning ? "Stop" : "Start"}
              </button>
              <button 
                onClick={resetHandler}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition duration-300 shadow-md"
              >
                Reset
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Stopwatch;