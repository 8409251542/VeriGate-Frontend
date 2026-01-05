import React from "react";
import { MessageCircle } from "lucide-react"; // optional icon lib

const WhatsAppButton = () => {
  const phoneNumber = "1812308dfdf"; // Replace with your WhatsApp number
  const message = "Hello, I’d like to know more about your services!"; // Default message

  const openWhatsApp = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={openWhatsApp}
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center z-50 transition duration-300"
    >
      <MessageCircle size={28} />
    </button>
  );
};

export default WhatsAppButton;
