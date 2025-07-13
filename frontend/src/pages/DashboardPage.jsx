"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Clock, CheckCircle, Hash, Calendar } from "lucide-react"
import axios from "axios"

const DashboardPage = () => {
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, token } = useAuth()

  useEffect(() => {
    fetchUserTokens()
  }, [])

  const fetchUserTokens = async () => {
    try {
      const response = await axios.get("/api/user/tokens", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setTokens(response.data.tokens)
    } catch (error) {
      console.error("Error fetching tokens:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "waiting":
        return "badge-waiting"
      case "served":
        return "badge-served"
      case "cancelled":
        return "badge-cancelled"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "waiting":
        return <Clock className="w-4 h-4" />
      case "served":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your tokens...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">Here are your queue tokens</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="card-header flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Total Tokens</h3>
              <Hash className="h-4 w-4 text-gray-500" />
            </div>
            <div className="card-content">
              <div className="text-2xl font-bold">{tokens.length}</div>
              <p className="text-xs text-gray-500">All time</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Waiting</h3>
              <Clock className="h-4 w-4 text-gray-500" />
            </div>
            <div className="card-content">
              <div className="text-2xl font-bold">{tokens.filter((t) => t.status === "waiting").length}</div>
              <p className="text-xs text-gray-500">In queue</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Completed</h3>
              <CheckCircle className="h-4 w-4 text-gray-500" />
            </div>
            <div className="card-content">
              <div className="text-2xl font-bold">{tokens.filter((t) => t.status === "served").length}</div>
              <p className="text-xs text-gray-500">Served</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Your Tokens</h2>
          <Link to="/">
            <button className="btn btn-primary">Book New Token</button>
          </Link>
        </div>

        {tokens.length === 0 ? (
          <div className="card">
            <div className="card-content text-center py-12">
              <Hash className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tokens yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't booked any tokens yet. Start by selecting a branch and service.
              </p>
              <Link to="/">
                <button className="btn btn-primary">Book Your First Token</button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokens.map((token) => (
              <div key={token._id} className="card hover:shadow-lg transition-shadow">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-mono font-bold">{token.tokenNumber}</h3>
                    <span className={`badge ${getStatusColor(token.status)}`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(token.status)}
                        {token.status}
                      </span>
                    </span>
                  </div>
                  <p className="text-gray-600 capitalize">
                    {token.branchType} - {token.serviceName}
                  </p>
                </div>
                <div className="card-content">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Calendar className="w-4 h-4" />
                    {new Date(token.createdAt).toLocaleString()}
                  </div>

                  {token.status === "waiting" && token.position && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                      <p className="text-sm font-medium text-blue-800">Position in queue: #{token.position}</p>
                    </div>
                  )}

                  <Link to={`/token/${token.tokenNumber}`}>
                    <button className="btn btn-outline w-full">View Details</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
