import { FormEvent, useEffect, useState } from "react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import toast from "react-hot-toast";
import { FaCopy } from "react-icons/fa";

const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const allNumbers = "1234567890";
const allSymbols = "!@#$%^&*()_+";

const Coupon = () => {
  const [size, setSize] = useState<number>(8);
  const [prefix, setPrefix] = useState<string>("");
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(false);
  const [includeCharacters, setIncludeCharacters] = useState<boolean>(true); // Defaulted to true for usability
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const [coupon, setCoupon] = useState<string>("");

  const copyText = async (coupon: string) => {
    await window.navigator.clipboard.writeText(coupon);
    setIsCopied(true);
    toast.success("Coupon copied!");
  };

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!includeNumbers && !includeCharacters && !includeSymbols) {
      toast.error("Please select at least one option (Numbers, Characters, or Symbols)");
      return;
    }

    let result: string = prefix || "";
    const loopLength: number = size - result.length;

    if (loopLength < 0) {
        toast.error(`Prefix length exceeds coupon length of ${size}`);
        return;
    }

    for (let i = 0; i < loopLength; i++) {
      let entireString: string = "";
      if (includeCharacters) entireString += allLetters;
      if (includeNumbers) entireString += allNumbers;
      if (includeSymbols) entireString += allSymbols;

      const randomNum: number = ~~(Math.random() * entireString.length);
      result += entireString[randomNum];
    }

    setCoupon(result);
  };

  useEffect(() => {
    setIsCopied(false);
  }, [coupon]);

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Coupon Generator</h1>
        
        <section className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8 space-y-6">
          <form className="space-y-6" onSubmit={submitHandler}>
            {/* Prefix Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prefix Text (Optional)</label>
                <input
                    type="text"
                    placeholder="e.g., SALE20"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                    maxLength={size}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">Max length is determined by the Coupon Length.</p>
            </div>

            {/* Length Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Length (8-25)</label>
                <input
                    type="number"
                    placeholder="Coupon Length"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    min={8}
                    max={25}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            {/* Checkboxes */}
            <fieldset className="p-4 border border-gray-200 rounded-lg space-y-3">
              <legend className="text-lg font-semibold text-indigo-700 px-2">Include</legend>

              <div className="flex items-center space-x-4">
                <input
                  id="numbers"
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={() => setIncludeNumbers((prev) => !prev)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="numbers" className="text-gray-700">Numbers (0-9)</label>
              </div>

              <div className="flex items-center space-x-4">
                <input
                  id="characters"
                  type="checkbox"
                  checked={includeCharacters}
                  onChange={() => setIncludeCharacters((prev) => !prev)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="characters" className="text-gray-700">Characters (a-Z)</label>
              </div>

              <div className="flex items-center space-x-4">
                <input
                  id="symbols"
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={() => setIncludeSymbols((prev) => !prev)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="symbols" className="text-gray-700">Symbols (!@#...)</label>
              </div>
            </fieldset>

            <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md">
              Generate Coupon
            </button>
          </form>

          {/* Generated Coupon Display */}
          {coupon && (
            <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex justify-between items-center text-xl font-mono font-bold text-indigo-800 break-all">
              <code className="select-text">{coupon}</code>
              <button 
                onClick={() => copyText(coupon)}
                className={`ml-4 p-2 rounded-full transition duration-150 ${isCopied ? "bg-green-500 text-white" : "bg-indigo-200 text-indigo-700 hover:bg-indigo-300"}`}
              >
                <FaCopy />
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Coupon;