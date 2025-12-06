import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { FaSignInAlt } from "react-icons/fa"; // Added icon
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { getUser } from "../redux/api/userAPI"; // Using the exported getUser utility
import { useLoginMutation } from "../redux/api/authAPI"; // Assuming this is the Email/Password login
import { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { MessageResponse } from "../types/api-types";
import { userExist, userNotExist } from "../redux/reducer/userReducer";
import { useDispatch } from "react-redux";
import { useFirebaseLoginMutation } from "../redux/api/authAPI"; // Assuming the firebase login was moved here

const formInputStyle =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow duration-200 shadow-sm";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loginMode, setLoginMode] = useState<"email" | "google">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  // RTKQ hooks
  const [loginFirebase] = useFirebaseLoginMutation(); // Firebase login for new user creation/auth
  const [loginEmail] = useLoginMutation(); // Email/Password login

  // Email/Password Login
  const handleEmailLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("Please enter email and password");
    }

    setLoading(true);

    try {
      const res = await loginEmail({ email, password });

      if ("data" in res && res.data.success && res.data.user) {
        toast.success(res.data.message || "Login successful!");
        dispatch(userExist(res.data.user as any));
        navigate("/");
      } else if ("error" in res) {
        const errorMsg = (res.error as any)?.data?.message || "Login failed";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong during sign-in.");
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    if (!gender || !date) {
      return toast.error("Please select gender and date of birth to continue with Google.");
    }

    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);

      // 1. Send Firebase user data + mandatory fields (gender, dob) to backend
      const res = await loginFirebase({
        name: user.displayName!,
        email: user.email!,
        photo: user.photoURL!,
        gender,
        role: "user",
        dob: date,
        _id: user.uid,
      });

      if ("data" in res) {
        toast.success(res.data.message);
        
        // 2. Fetch the user details after successful login/registration
        const data = await getUser(user.uid); 
        
        if (data?.user) {
            dispatch(userExist(data.user));
            navigate("/");
        } else {
            // Should not happen if the loginFirebase call was successful, but good to handle
            toast.error("Failed to retrieve user data after successful sign-in.");
            dispatch(userNotExist());
        }
        
      } else {
        const error = res.error as FetchBaseQueryError;
        const message = (error.data as MessageResponse)?.message || "Google sign-in failed.";
        toast.error(message);
        dispatch(userNotExist());
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Google Sign In failed. Check your network or try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center justify-center gap-3">
            <FaSignInAlt className="text-indigo-600" /> Welcome Back
          </h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {/* Mode Switcher / Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setLoginMode("email")}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-200 text-sm ${
              loginMode === "email"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-transparent text-gray-700 hover:bg-white"
            }`}
          >
            Email & Password
          </button>
          <button
            onClick={() => setLoginMode("google")}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-200 text-sm ${
              loginMode === "google"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-transparent text-gray-700 hover:bg-white"
            }`}
          >
            Google Sign In
          </button>
        </div>

        {/* Email Login Form */}
        {loginMode === "email" && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={formInputStyle}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={formInputStyle}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition duration-200 text-lg mt-6 shadow-md hover:shadow-lg"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        {/* Google Login Form (Requires extra fields) */}
        {loginMode === "google" && (
          <form onSubmit={(e) => { e.preventDefault(); handleGoogleLogin(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                {/* Gender */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={formInputStyle}
                    required
                >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
                </div>

                {/* Date of Birth */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={formInputStyle}
                    required
                    max={new Date().toISOString().split("T")[0]} // Prevents future dates
                />
                </div>
            </div>
            
            <button
              type="submit"
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition duration-200 shadow-sm mt-6"
            >
              <FcGoogle size={20} />
              Sign in with Google
            </button>
          </form>
        )}

        {/* Register Link */}
        <p className="text-center mt-8 text-gray-600 text-sm">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-indigo-600 hover:text-indigo-700 font-bold"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;