import { useState } from "react";
import axios from "axios"; // <--- Import Axios
import type { User } from "../types";
import { Link } from "react-router-dom";

const SignupPage = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [formData, setFormData] = useState({
    full_name: "",    // Changed from 'name' to 'username' to match Backend
    email: "",
    reg_number: "",
    password: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // <--- New Error State

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Send data to Django Backend
      const response = await axios.post("https://school-payment-system-jeaj.onrender.com/signup/", formData);

      // 2. Extract Token and User Data
      const { token, user } = response.data;

      // 3. Save to LocalStorage (So they stay logged in)
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // 4. Update App State
      onLogin(user);

    } catch (err: any) {
      console.error(err);
      // Display the specific error from Django (e.g., "Username already exists")
      const errorData = err.response?.data;
      let errorMessage = "Signup failed. Please try again.";
      
      if (errorData) {
        // Django returns errors as objects like { username: ["This field is required"] }
        // We grab the first error message we find
        const firstKey = Object.keys(errorData)[0];
        if (firstKey) {
             const firstError = errorData[firstKey];
             // Handle both array and string error formats
             errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mt-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold futo-text-maroon">Account Signup</h2>
        <p className="text-gray-500 mt-2">
          Register for the FUTO integrated payment system
        </p>
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
           Full name (Surname first, Middle name inclusive)
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-800 focus:border-transparent"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="e.g Okerekee Faith Nneoma "
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-800 focus:border-transparent"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="aminazainab@futo.edu.ng"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Reg Number
          </label>
          <input
            type="text"
            required
            placeholder="20231234567"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-800 focus:border-transparent"
            value={formData.reg_number}
            onChange={(e) =>
              setFormData({ ...formData, reg_number: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-800 focus:border-transparent"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>
        <button
          disabled={loading}
          className="w-full futo-maroon text-white font-bold py-4 rounded-xl hover:bg-red-900 transition-all shadow-md mt-4 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
             <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Creating Account...
             </span>
          ) : "Sign Up"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Already registered?{" "}
        <Link to="/login"
          className="futo-text-maroon font-bold hover:underline"
        >
          Log In
        </Link>
      </p>
    </div>
  );
};

export default SignupPage;