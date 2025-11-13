import { useState } from "react";
import { loginUser } from "../api/api";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "/src/assets/quickcv-logo.svg"; 

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const { data } = await loginUser(form);

    localStorage.setItem("token", data.token);

    toast.success("Login successful! Redirecting...", {
      position: "top-right",
      autoClose: 3000,
       color: "white"
    });

    setTimeout(() => navigate("/dashboard"), 3000);
  } catch (err) {
    toast.error(err.response?.data?.message || "Invalid credentials", {
      position: "top-right",
      color: "white",
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${logo})`, 
      }}
    >
      <ToastContainer />  
      <div className="bg-white/35 backdrop-blur-md rounded-3xl shadow-2xl p-10 w-full max-w-md z-10 border border-white/30 transition-transform duration-300 hover:scale-[1.02]">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-wide drop-shadow-md">
            Quick<span className="text-indigo-700">CV</span>
          </h1>
          <p className="text-gray-800 text-sm mt-1 drop-shadow">
            Create and manage resumes effortlessly
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3.5 text-gray-800" />
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white/60 text-gray-900 placeholder-gray-700 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>
<div className="relative">
  <FaLock className="absolute left-3 top-3.5 text-gray-800 z-10" />

  <input
    name="password"
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={form.password}
    onChange={handleChange}
    required
    className="w-full pl-10 pr-12 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-700 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
  />

  <div
    className="absolute right-3 top-3.5 text-gray-800 cursor-pointer hover:text-indigo-600 z-20"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </div>
</div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-3 rounded-lg font-semibold transition duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-gray-900 text-center mt-4">
          Don’t have an account?{" "}
          <span
            className="text-indigo-700 font-medium cursor-pointer hover:underline"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
