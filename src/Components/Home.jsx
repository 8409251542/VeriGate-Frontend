import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Upload, Users, Shield, Phone, Zap, BarChart3 } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("features");
  const navigate = useNavigate();
  const pricingRef = useRef(null);

  const features = [
    { icon: <Phone className="w-8 h-8 text-red-600" />, title: "Bulk Number Verification", description: "Upload CSV files and verify thousands of phone numbers instantly using VariGate API" },
    { icon: <Shield className="w-8 h-8 text-red-600" />, title: "Mobile vs Landline Detection", description: "Automatically categorize numbers into mobile and landline with carrier information" },
    { icon: <Upload className="w-8 h-8 text-red-600" />, title: "CSV Processing", description: "Easy upload and download of processed results in organized CSV format" },
    { icon: <Users className="w-8 h-8 text-red-600" />, title: "User Management", description: "Admin dashboard to manage users, set limits, and track usage" },
    { icon: <BarChart3 className="w-8 h-8 text-red-600" />, title: "Usage Analytics", description: "Track verification counts, user limits, and system performance" },
    { icon: <Zap className="w-8 h-8 text-red-600" />, title: "Token-Based System", description: "Purchase tokens via USDT to access verification services" }
  ];

  const stats = [
    { number: "99.9%", label: "Accuracy Rate" },
    { number: "10K+", label: "Numbers Verified Daily" },
    { number: "50+", label: "Countries Supported" },
    { number: "24/7", label: "Service Uptime" }
  ];

  const pricingPlans = [
    { name: "Starter", price: "10 USDT", tokens: "1,000 Tokens", features: ["Basic verification", "CSV upload/download", "Email support"] },
    { name: "Professional", price: "50 USDT", tokens: "5,000 Tokens", features: ["Advanced verification", "Bulk processing", "Priority support", "API access"], popular: true },
    { name: "Enterprise", price: "200 USDT", tokens: "25,000 Tokens", features: ["Unlimited verification", "Custom integration", "Dedicated support", "SLA guarantee"] }
  ];

  // 🔽 Scroll to pricing section
  const scrollToPricing = () => {
    setActiveTab("pricing");
    setTimeout(() => {
      pricingRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">VariGate</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setActiveTab("features")}
                className={`text-sm cursor-pointer  font-medium transition-colors ${activeTab === "features" ? "text-red-600" : "text-gray-600 hover:text-red-600"}`}
              >
                Features
              </button>
              <button
                onClick={scrollToPricing}
                className={`text-sm cursor-pointer font-medium transition-colors ${activeTab === "pricing" ? "text-red-600" : "text-gray-600 hover:text-red-600"}`}
              >
                Pricing
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="bg-red-600 text-white cursor-pointer px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Verify Phone Numbers
            <span className="block text-red-600">At Scale</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professional phone number verification service with bulk CSV processing, 
            mobile/landline detection, and comprehensive analytics. Powered by VariGate API.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => navigate("/signup")}
              className="bg-gradient-to-r cursor-pointer from-red-600 to-red-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/login")}
              className="border-2 border-red-600 cursor-pointer text-red-600 px-8 py-4 rounded-xl font-semibold hover:bg-red-50 transition-all"
            >
              Login
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4">
        {activeTab === "features" && (
          <section className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Everything you need for professional phone number verification and management
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "pricing" && (
          <section className="py-16" ref={pricingRef}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple Pricing</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Pay with USDT and get tokens for phone number verification
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <div key={index} className={`bg-white/70 backdrop-blur-sm rounded-2xl p-8 border-2 transition-all hover:shadow-xl ${
                  plan.popular ? "border-red-600 ring-2 ring-red-200" : "border-gray-200"
                }`}>
                  {plan.popular && (
                    <div className="bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded-full mb-4 inline-block">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-red-600 mb-1">{plan.price}</div>
                  <div className="text-gray-600 mb-6">{plan.tokens}</div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => navigate("/signup")}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      plan.popular 
                        ? "bg-red-600 text-white hover:bg-red-700" 
                        : "border-2 border-red-600 text-red-600 hover:bg-red-50"
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
        
      </div>
      <section className="py-16 bg-white/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple 4-step process to verify your phone numbers
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Upload CSV", desc: "Upload your phone number list in CSV format" },
              { step: "2", title: "Process", desc: "Our system verifies each number using VariGate API" },
              { step: "3", title: "Categorize", desc: "Numbers are sorted into mobile and landline categories" },
              { step: "4", title: "Download", desc: "Download the organized results with carrier details" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Verify Your Numbers?
          </h2>
          <p className="text-red-100 text-lg mb-8">
            Join thousands of businesses using our verification service
          </p>
          <button onClick={() => navigate("/signup")} className="bg-white cursor-pointer text-red-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg">
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">VariGate</span>
            </div>
            <p className="text-sm text-gray-400">
              © 2025 VariGate. Professional phone verification service.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
