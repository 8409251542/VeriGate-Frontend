import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationTab from "./Navigation";

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleSignup=(e)=>{
    e.preventDefault();
    navigate("/signup");
  }

  const handleLogin = async (e) => {
     e.preventDefault(); 
    const res = await fetch("https://verigate-backend.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

   if (res.ok) {
  const data = await res.json();
  localStorage.setItem("user", JSON.stringify(data));
  setUser(data);

  // Redirect based on user role
  if (data.role === "admin") {
    navigate("/admin");
  } else if (data.role === "user") {
    navigate("/profile");
  } else {
    // Default fallback
    navigate("/");
  }
} else {
  alert("Invalid login");
}

  };

  return (
    <>
    <NavigationTab/>
      <div className="w-full h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full text-gray-600 space-y-5">
          <div className="text-center pb-8">
                        <div className="mt-5">
              <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">
                Log in to your account
              </h3>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="font-medium"> Email </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-red-600 shadow-sm rounded-lg"
              />
            </div>
            <div>
              <label className="font-medium"> Password </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-red-600 shadow-sm rounded-lg"
              />
            </div>
            
            <button
            type="submit"
              className="w-full cursor-pointer px-4 py-2 text-white font-medium bg-red-600 hover:bg-red-500 active:bg-red-600 rounded-lg duration-150"
             
            >
              Sign in
            </button>
          </form>
          
          <p className="text-center">
            Don't have an account?
            <a
              onClick={handleSignup}
              className="font-medium cursor-pointer text-red-600 hover:text-red-500"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
