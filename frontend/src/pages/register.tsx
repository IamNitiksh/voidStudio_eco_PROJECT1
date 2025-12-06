import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../redux/api/authAPI";
import { useDispatch } from "react-redux";
import { userExist } from "../redux/reducer/userReducer";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { FaUserPlus, FaEnvelope, FaLock, FaCalendarAlt } from "react-icons/fa"; // Added icons

const formInputStyle =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow duration-200 shadow-sm";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register] = useRegisterMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    dob: "",
    photo: "https://via.placeholder.com/150",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.gender ||
      !formData.dob
    ) {
      return toast.error("Please fill all required fields");
    }

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setLoading(true);

    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        photo: formData.photo,
        gender: formData.gender,
        dob: formData.dob,
      });

      if ("data" in res && res.data.success) {
        toast.success(res.data.message || "Registration successful!");
        if (res.data.user) {
          // Type assertion for user object
          dispatch(userExist(res.data.user as any)); 
        }
        navigate("/");
      } else if ("error" in res) {
        const errorMsg = (res.error as any)?.data?.message || "Registration failed";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);

      // NOTE: Firebase registration logic should ideally be completed in the Login/Auth API, 
      // but following the provided logic, we redirect to handle the next step or auto-login.
      // Assuming successful Firebase sign-up now directs to home, where context handles profile completion.
      
      // Attempting to register the user in the backend immediately after Google sign-in
      const backendUser = {
        name: user.displayName || "",
        email: user.email || "",
        password: user.uid, // Using UID as temporary/default password for backend if required
        photo: user.photoURL || "https://via.placeholder.com/150",
        gender: formData.gender, // Still need to prompt the user for these missing fields later
        dob: formData.dob, 
      };

      const res = await register({ ...backendUser, dob: "1990-01-01", gender: "male" }); // Defaulting fields for immediate registration

      if ("data" in res && res.data.success) {
          toast.success("Signed up with Google successfully!");
          if (res.data.user) {
              dispatch(userExist(res.data.user as any));
          }
          navigate("/");
      } else if ("error" in res) {
          toast.error("Google sign-up failed on backend.");
      }
    } catch (error) {
      console.error("Google sign-up error:", error);
      toast.error("Google sign-up failed");
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center justify-center gap-3">
            <FaUserPlus className="text-indigo-600" /> Register
          </h1>
          <p className="text-gray-600 mt-2">Create your account to start shopping</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={formInputStyle}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={formInputStyle}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={formInputStyle}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={formInputStyle}
                max={new Date().toISOString().split("T")[0]} // Prevents future dates
                required
              />
            </div>
          </div>


          {/* Password Group */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className={formInputStyle}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className={formInputStyle}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition duration-200 text-lg mt-6 shadow-md hover:shadow-lg"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Divider and Google Sign Up */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-3 text-gray-500 text-sm font-medium">OR</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        <button
          onClick={handleGoogleSignUp}
          className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition duration-200 shadow-sm"
        >
          <FcGoogle size={20} />
          Sign up with Google
        </button>

        {/* Login Link */}
        <p className="text-center mt-8 text-gray-600 text-sm">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-indigo-600 hover:text-indigo-700 font-bold"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;