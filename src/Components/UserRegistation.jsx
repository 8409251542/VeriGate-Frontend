import React, { useState } from "react";
import NavigationTab from "./Navigation";
import { toast } from "react-toastify";

export default function UserRegistration() {
 
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

 const [form, setForm] = useState({
  email: "",
  password: "",
  confirmPassword: "",
});
const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };
const validate = () => {
  const newErrors = {};
  if (!form.email.trim() || !/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(form.email))
    newErrors.email = "Please enter a valid email.";
  if (!form.password) newErrors.password = "Password is required.";
  if (form.password !== form.confirmPassword)
    newErrors.confirmPassword = "Passwords do not match.";
  return newErrors;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const foundErrors = validate();
  if (Object.keys(foundErrors).length > 0) {
    setErrors(foundErrors);
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("https://verigate-backend.onrender.com/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error("Registration failed: " + data.message);
    } else {
      toast.success(data.message);
      setForm({ email: "", password: "", confirmPassword: "" });
      setErrors({});
      setRegistered(true); // show "check email" note
    }
  } catch (error) {
    toast.error("An error occurred: " + error.message);
  } finally {
    setLoading(false);
  }
};


  return (<>
    <NavigationTab/>
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full animate-fade-in">
        <h2 className="text-2xl font-bold text-center text-gray-950 mb-8">
          Create an Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {[
            
            { label: "Email", name: "email", type: "email", placeholder: "Enter your email" },
           
            { label: "Password", name: "password", type: "password", placeholder: "Enter your password" },
            { label: "Confirm Password", name: "confirmPassword", type: "password", placeholder: "Confirm your password" },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label htmlFor={name} className="block text-red-700 font-semibold mb-2">
                {label}
              </label>
              <input
                type={type}
                id={name}
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-300 ${
                  errors[name] ? "border-red-500 focus:ring-red-800" : "border-gray-200 focus:ring-red-800"
                }`}
                required
              />
              {errors[name] && (
                <p className="text-red-600 text-sm mt-2">{errors[name]}</p>
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg cursor-pointer font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] ${
              loading
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-red-600 font-semibold hover:text-red-800 transition-colors duration-300"
          >
            Sign In
          </a>
        </p>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div></>
  );
}
