import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Upload, Users, Shield, Phone, Zap, BarChart3 } from "lucide-react";

export default function NavigationTab() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Effect to handle mobile menu height for smooth transition
  useEffect(() => {
    if (mobileMenuRef.current) {
      if (mobileMenuOpen) {
        mobileMenuRef.current.style.height =
          mobileMenuRef.current.scrollHeight + "px";
      } else {
        mobileMenuRef.current.style.height = "0";
      }
    }
  }, [mobileMenuOpen]);

  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-lg py-4 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <a
          href="#"
          className="flex items-center text-primary hover:text-secondary"
        >
          <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                          <Phone className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">VariGate</span>
                      </div>
        </a>

        {/* Mobile Menu Button (Hidden on larger screens) */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-800 hover:text-primary focus:outline-none transition-colors duration-300"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>

        {/* Desktop Navigation (Hidden on smaller screens) */}
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
           
            
            <li>
              <a onClick={handleLoginClick} className="bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded-md transition-colors duration-300">
              Login
            </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile Menu (Hidden by default) */}
      <nav
        ref={mobileMenuRef}
        className={`md:hidden bg-gray-50 border-t border-gray-200 overflow-hidden transition-height duration-300 ease-in-out ${
          mobileMenuOpen ? "" : "hidden"
        }`}
        style={{ height: 0 }}
      >
        <ul className="px-4 py-2">
          
          <li>
            {/* Change including primary class from: */}
            {/* bg-primary hover:bg-secondary text-white */}

           <a onClick={handleLoginClick} href="#" className="block py-2 hover:text-primary">
              Login
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
