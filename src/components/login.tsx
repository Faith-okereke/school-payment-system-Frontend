import { useState } from "react";
import axios from "axios"; // <--- Import Axios
import type { User } from "../types";
import logo from "../../public/FUTOLOGO.png";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate for redirection if needed

const LoginPage = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const naviagte = useNavigate();
  const [username, setUsername] = useState(""); // Changed from email to username
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Add error state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Send data to Django Backend
      const response = await axios.post("http://127.0.0.1:8000/login/", {
        username: username,
        password: pass,
      });

      // 2. Extract Token and User Data
      const { token, user } = response.data;

      // 3. Save to LocalStorage (Crucial for keeping them logged in)
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // 4. Update App State
      onLogin(user);
      naviagte('/dashboard'); 
    } catch (err: any) {
      console.error(err);
      // Show error message from backend or a generic one
      setError(err.response?.data?.error || "Invalid Username or Password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mt-12 z-50">
      <div className="text-center mb-8">
        <div className="inline-block p-3 rounded-full mb-4">
          <img src={logo} alt="FUTO Logo" className="size-12" />
        </div>
        <h2 className="text-3xl font-bold futo-text-maroon">Student Portal</h2>
        <p className="text-gray-500 mt-2">Log in to manage your school fees</p>
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Reg Number
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-800 focus:border-transparent transition-all"
            placeholder="Enter your regnumber/matric number"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-800 focus:border-transparent transition-all"
            placeholder="••••••••"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
        </div>
        <button
          disabled={loading}
          className="w-full futo-maroon text-white font-bold py-4 rounded-xl hover:bg-red-900 transition-all transform hover:-translate-y-0.5 active:scale-95 shadow-md disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Logging in...
            </span>
          ) : (
            "Sign In to Portal"
          )}
        </button>
      </form>
      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-600">
          New student?{" "}
          <Link
            to="/signup"
            className="futo-text-maroon font-bold hover:underline"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
