import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from '../../axios/axiosCalls'
import { useAuth } from "../../context/useAuth";

function Login() {

  const [form, setForm] = useState({email: "",password: ""});
  const [error, setError] = useState("");
  const { setCustomer } = useAuth();
  const navigate = useNavigate()
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axiosInstance.post("/customers/login", form);

      const response = await axiosInstance.get("/customers/me");
      setCustomer(response.data.customerData);
      navigate("/home", { replace: true });
    
    } catch {
      setError("Invalid Credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Login to your Account
          </h1>

          <p className="text-gray-500 mt-2">
            Welcome back! Please login to continue.
          </p>
        </div>

        {error && <p role="alert" className="text-red-600 mb-4">{error}</p>}

        <form
          className="space-y-4"
          onSubmit={handleSubmit}
        >

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>

        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}

          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;