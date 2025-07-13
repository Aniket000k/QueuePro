"use client"

import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { ArrowLeft, Hospital, Building2, Calendar } from "lucide-react"
import axios from "axios"

const SERVICES = {
  hospital: [
    { id: "opd", name: "OPD (Out Patient Department)", description: "General consultation and check-ups" },
    { id: "emergency", name: "Emergency", description: "Urgent medical care" },
    { id: "cardiology", name: "Cardiology", description: "Heart and cardiovascular care" },
    { id: "orthopedic", name: "Orthopedic", description: "Bone and joint treatment" },
    { id: "pediatric", name: "Pediatric", description: "Child healthcare" },
  ],
  bank: [
    { id: "cash-deposit", name: "Cash Deposit", description: "Deposit money into your account" },
    { id: "loan-inquiry", name: "Loan Inquiry", description: "Apply for loans and get information" },
    { id: "account-opening", name: "Account Opening", description: "Open new bank accounts" },
    { id: "investment", name: "Investment Services", description: "Investment and wealth management" },
    { id: "customer-service", name: "Customer Service", description: "General banking assistance" },
  ],
}

const BranchPage = () => {
  const { branchType } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [processingService, setProcessingService] = useState(null)

  const services = SERVICES[branchType] || []
  const branchName = branchType === "hospital" ? "Hospital" : "Bank"
  const BranchIcon = branchType === "hospital" ? Hospital : Building2

  const handleServiceSelect = async (serviceId) => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    setProcessingService(serviceId)
    setLoading(true)
    setError("")

    try {
      const response = await axios.post(
        "/api/token",
        {
          branchType,
          serviceId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      navigate(`/token/${response.data.token.tokenNumber}`)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate token")
    } finally {
      setLoading(false)
      setProcessingService(null)
    }
  }

  if (!services.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card">
          <div className="card-content text-center p-8">
            <h2 className="text-xl font-semibold mb-4">Branch not found</h2>
            <Link to="/">
              <button className="btn btn-primary">Go Home</button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link to="/">
            <button className="btn btn-outline mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </button>
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <BranchIcon className="w-12 h-12 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">{branchName} Services</h1>
              <p className="text-gray-600">Select a service to generate your token</p>
            </div>
          </div>

          {branchType === "bank" && (
            <div className="mb-6">
              <Link to="/appointment">
                <button className="btn btn-outline flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule a Meeting
                </button>
              </Link>
            </div>
          )}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="card hover:shadow-lg transition-shadow">
              <div className="card-header">
                <h3 className="text-lg font-bold">{service.name}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
              <div className="card-content">
                <button
                  className="btn btn-primary w-full"
                  onClick={() => handleServiceSelect(service.id)}
                  disabled={loading && processingService === service.id}
                >
                  {loading && processingService === service.id ? "Generating Token..." : "Get Token"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BranchPage
