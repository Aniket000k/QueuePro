import { Link } from "react-router-dom"
import { Hospital, Building2, Users, Clock, CheckCircle, ArrowRight, Star, Shield, Zap, Hash } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

const HomePage = () => {
  const { isAuthenticated, user } = useAuth()

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Smart Queue Management",
      description: "Advanced algorithms to optimize wait times and improve service efficiency",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Real-time Updates",
      description: "Live notifications and queue status updates via email and dashboard",
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Instant Confirmation",
      description: "Immediate token generation with detailed service information",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Book your token in under 30 seconds with our streamlined process",
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Premium Experience",
      description: "Professional service with dedicated customer support",
    },
  ]

  const stats = [
    { number: "50K+", label: "Happy Customers" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" },
    { number: "< 30s", label: "Booking Time" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Next-Generation Queue Management
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Queue Management Made Simple
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed">
              Revolutionary online queue management system that transforms how you access services. Get real-time
              updates, skip physical queues, and manage your time efficiently.
            </p>

            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link to="/register">
                  <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2 inline" />
                  </button>
                </Link>
                <Link to="/login">
                  <button className="bg-white text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-200">
                    Sign In
                  </button>
                </Link>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-gray-600 text-sm lg:text-base">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Service Cards */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Choose Your Service</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select from our premium service categories and experience seamless queue management
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Hospital Card */}
          <div className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 opacity-50"></div>
            <div className="relative p-8 lg:p-10">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-red-500 to-pink-600 p-4 rounded-2xl shadow-lg">
                  <Hospital className="w-8 h-8 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">Healthcare Services</h3>
                  <p className="text-gray-600">Professional medical care</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                Book appointments for OPD consultations, emergency services, specialized treatments, and comprehensive
                healthcare solutions with our advanced scheduling system.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Emergency & OPD Services</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Specialist Consultations</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Real-time Queue Updates</span>
                </div>
              </div>

              <Link to="/branch/hospital">
                <button className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 rounded-xl text-lg font-semibold hover:from-red-600 hover:to-pink-700 transform group-hover:scale-105 transition-all duration-200 shadow-lg">
                  Book Healthcare Token
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </button>
              </Link>
            </div>
          </div>

          {/* Bank Card */}
          <div className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50"></div>
            <div className="relative p-8 lg:p-10">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">Banking Services</h3>
                  <p className="text-gray-600">Complete financial solutions</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                Access comprehensive banking services including account management, loan processing, investment
                consultations, and customer support with minimal wait times.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Account & Transaction Services</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Loan & Investment Advisory</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Priority Customer Support</span>
                </div>
              </div>

              <Link to="/branch/bank">
                <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transform group-hover:scale-105 transition-all duration-200 shadow-lg">
                  Book Banking Token
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {isAuthenticated ? "Quick Actions" : "Why Choose QueuePro?"}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {isAuthenticated
                ? "Access all your services in one place"
                : "Experience the future of queue management with our cutting-edge features designed for efficiency and convenience"}
            </p>
          </div>

          {isAuthenticated ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Link to="/dashboard" className="group p-6 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl w-fit mb-4 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300">
                  <div className="text-blue-600"><Hash className="w-8 h-8" /></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">View Your Tokens</h3>
                <p className="text-gray-600 leading-relaxed">Check the status of your queue tokens and appointments</p>
              </Link>

              <Link to="/branch/hospital" className="group p-6 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl w-fit mb-4 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300">
                  <div className="text-blue-600"><Hospital className="w-8 h-8" /></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Hospital Services</h3>
                <p className="text-gray-600 leading-relaxed">Book tokens for medical consultations and treatments</p>
              </Link>

              <Link to="/branch/bank" className="group p-6 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl w-fit mb-4 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300">
                  <div className="text-blue-600"><Building2 className="w-8 h-8" /></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Banking Services</h3>
                <p className="text-gray-600 leading-relaxed">Access banking services and schedule appointments</p>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group p-6 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl w-fit mb-4 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300">
                    <div className="text-blue-600">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            {isAuthenticated 
              ? `Welcome back, ${user?.name}!`
              : "Ready to Transform Your Experience?"}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {isAuthenticated
              ? "Manage your queue tokens and appointments efficiently"
              : "Join thousands of satisfied customers who have revolutionized their service experience with QueuePro"}
          </p>
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <button className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg">
                  Start Free Today
                </button>
              </Link>
              <Link to="/admin">
                <button className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200">
                  Admin Access
                </button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <button className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg">
                  Go to Dashboard
                </button>
              </Link>
              <Link to="/branch/hospital">
                <button className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200">
                  Book Hospital Token
                </button>
              </Link>
              <Link to="/branch/bank">
                <button className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200">
                  Book Bank Token
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomePage
