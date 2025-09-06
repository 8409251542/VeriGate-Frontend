import React from 'react';
import { Check, Phone, Zap, Star, Coins } from 'lucide-react';

const UserPlans = () => {
  const plans = [
    {
      name: "Basic",
      price: "₹499",
      originalPrice: "₹749",
      tokens: "2,500",
      perToken: "₹0.20",
      features: [
        "Number Validation",
        "Carrier Detection",
        "Country Detection",
        "24/7 Support"
      ],
      buttonStyle: "outline",
      popular: false
    },
    {
      name: "Pro", 
      price: "₹1,999",
      originalPrice: "₹2,999",
      tokens: "12,500",
      perToken: "₹0.16",
      features: [
        "Number Validation",
        "Carrier & Line Type",
        "Location Detection",
        "Priority Support",
        "Usage Analytics"
      ],
      buttonStyle: "primary",
      popular: true
    },
    {
      name: "Enterprise",
      price: "₹4,999", 
      originalPrice: "₹7,499",
      tokens: "45,000",
      perToken: "₹0.11",
      features: [
        "Number Validation",
        "Advanced Analytics",
        "Custom Integration",
        "Dedicated Support",
        "Bulk Processing"
      ],
      buttonStyle: "outline",
      popular: false
    }
  ];

  return (
    <section className="py-8 leading-7 text-gray-900">
      <div className="box-border px-4 mx-auto border-solid sm:px-6 max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-red-600 to-red-800 p-3 rounded-xl shadow-lg">
              <Coins className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            Buy Verification Tokens
          </h2>
          <p className="mt-2 text-lg text-gray-600 max-w-2xl">
            Purchase tokens to verify phone numbers instantly
          </p>
          <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
            <Zap className="w-3 h-3" />
            Save up to 33%
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col p-6 bg-white border-2 border-solid rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-red-500 ring-2 ring-red-100 scale-105' 
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-600 to-red-800 text-white text-xs font-bold rounded-full shadow-lg">
                    <Star className="w-3 h-3" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-xl font-bold text-gray-900 text-center mb-4">
                {plan.name}
              </h3>

              {/* Pricing */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-lg text-gray-400 line-through">
                    {plan.originalPrice}
                  </span>
                  <p className="text-3xl font-bold text-gray-900">
                    {plan.price}
                  </p>
                </div>
              </div>

              {/* Token Details */}
              <div className="w-full mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{plan.tokens}</p>
                  <p className="text-sm text-gray-600 font-medium">Verification Tokens</p>
                  <div className="mt-1 text-xs text-gray-500">
                    <span>{plan.perToken} per token</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <ul className="flex-1 mb-6 space-y-2">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm">
                    <div className="flex-shrink-0 w-4 h-4 mr-2 bg-red-100 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-red-600 font-bold" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className={`w-full cursor-pointer px-4 py-3 font-semibold text-sm rounded-lg transition-all duration-200 transform hover:scale-105 ${
                  plan.buttonStyle === 'primary'
                    ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg hover:from-red-700 hover:to-red-900'
                    : 'bg-white text-red-600 border-2 border-red-600 hover:bg-red-600 hover:text-white'
                }`}
              >
                Purchase Tokens
              </button>

              {/* Additional Info */}
              <div className="mt-3 text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <Phone className="w-3 h-3" />
                  <span>Instant verification</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Info */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Need more tokens?
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              Contact us for bulk token packages and enterprise solutions
            </p>
            <button className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-200 text-sm">
              Contact Sales
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <Phone className="w-6 h-6 text-red-600 mx-auto mb-1" />
            <p className="text-xs font-semibold text-gray-700">Instant Results</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <Zap className="w-6 h-6 text-red-700 mx-auto mb-1" />
            <p className="text-xs font-semibold text-gray-700">Fast Processing</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <Check className="w-6 h-6 text-red-800 mx-auto mb-1" />
            <p className="text-xs font-semibold text-gray-700">99% Accuracy</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <Coins className="w-6 h-6 text-red-600 mx-auto mb-1" />
            <p className="text-xs font-semibold text-gray-700">No Expiry</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserPlans;