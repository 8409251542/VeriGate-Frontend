import React, { useState } from "react";
import { toast } from "react-toastify";

export default function AddUser({ setUsers }) {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");       // email instead of username
  const [password, setPassword] = useState("");
  const [maxLimit, setMaxLimit] = useState(1000);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const authData = JSON.parse(localStorage.getItem("user"));
      const requesterId = authData?.user?.id;

      const res = await fetch("https://nexauthapi.vercel.app/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterId,
          email,
          password,
          max_limit: maxLimit
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to add user");
        return;
      }

      toast.success("User added successfully 🎉");
      setUsers(data.users);
    } catch (err) {
      console.error("Add user error:", err);
      toast.error("Something went wrong");
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full"
        required
      />
      <input
        type="number"
        placeholder="Max Limit"
        value={maxLimit}
        onChange={(e) => setMaxLimit(Number(e.target.value))}
        className="border p-2 w-full"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Add User
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
