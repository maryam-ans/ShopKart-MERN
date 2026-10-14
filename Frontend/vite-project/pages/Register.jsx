import { Link ,useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { axiosInstance } from '../../axios/axiosCalls'

function Register() {
 const [form , setForm] = useState({fullName : "" ,email : "", password: "", phone: ""})
 const [error, setError] = useState("");
 const navigate = useNavigate()

    const handleChange = (e)=>{
        setForm((prev)=>({...prev , [e.target.name]: e.target.value}))

    }

    const handleSubmit = async(e)=>{
        e.preventDefault()
        setError("");
        try{
            await axiosInstance.post("/customers/register",form)
            navigate('/login')
        }catch(error){
            setError(error.response?.data?.message || "Unable to create account. Please try again.");
        }
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Create Account
          </h1>
          <p className="text-gray-500 mt-2">
            Sign up to get started
          </p>
        </div>

        {error && <p role="alert" className="text-red-600 mb-4">{error}</p>}

        <form className="space-y-4"  onSubmit={handleSubmit}>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="fullName"
               value={form.fullName}
               onChange={handleChange}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
               value={form.phone}
               onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
           // onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Register
          </button>

        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Register