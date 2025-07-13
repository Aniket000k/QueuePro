"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { CheckCircle, Clock, Hash, MapPin, Calendar } from "lucide-react"
import axios from "axios"
import { io } from "socket.io-client"

const TokenPage = () => {
  const { tokenNumber } = useParams()
  const { token } = useAuth()
  const [tokenData, setTokenData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const response = await axios.get(`/api/token/${tokenNumber}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setTokenData(response.data.token)
      } catch (error) {
        console.error("Error fetching token data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTokenData()

    // Set up Socket.IO connection for real-time updates
    const socket = io("http://localhost:5000", {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
      autoConnect: true
    })

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id)
    })

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
    })

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)
    })

    socket.on("error", (error) => {
      console.error("Socket error:", error)
    })

    // Add test event listener
    socket.on("test_connection", (data) => {
      console.log("Test connection received:", data)
    })

    socket.on("token_served", (data) => {
      if (data.tokenNumber === tokenNumber) {
        setTokenData((prev) => (prev ? { ...prev, status: "served" } : null))
      }
    })

    socket.on("queue_updated", (data) => {
      if (tokenData && data.branchType === tokenData.branchType && data.serviceId === tokenData.serviceId) {
        const updatedToken = data.tokens.find(t => t.tokenNumber === tokenNumber)
        if (updatedToken) {
          setTokenData((prev) =>
            prev
              ? {
                  ...prev,
                  position: updatedToken.position,
                  estimatedWaitTime: updatedToken.estimatedWaitTime,
                }
              : null,
          )
        }
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [tokenNumber, token, tokenData?.branchType, tokenData?.serviceId, tokenNumber])

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
        return <Clock className="w-5 h-5" />
      case "served":
        return <CheckCircle className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading token information...</p>
        </div>
      </div>
    )
  }

  if (!tokenData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card">
          <div className="card-content text-center p-8">
            <h2 className="text-xl font-semibold mb-4">Token not found</h2>
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
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="card mb-6">
          <div className="card-header text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <Hash className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">{tokenData.tokenNumber}</h1>
            <p className="text-lg text-gray-600">Your queue token for {tokenData.serviceName}</p>
          </div>
          <div className="card-content space-y-6">
            <div className="flex justify-center">
              <span className={`badge ${getStatusColor(tokenData.status)} px-4 py-2 text-lg`}>
                <span className="flex items-center gap-2">
                  {getStatusIcon(tokenData.status)}
                  {tokenData.status.charAt(0).toUpperCase() + tokenData.status.slice(1)}
                </span>
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">Branch</p>
                  <p className="text-gray-600 capitalize">{tokenData.branchType}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">Booked At</p>
                  <p className="text-gray-600">{new Date(tokenData.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {tokenData.status === "waiting" && (
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <h3 className="text-xl font-semibold mb-2">Queue Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-3xl font-bold text-blue-600">{tokenData.position}</p>
                    <p className="text-sm text-gray-600">Position in queue</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-600">{tokenData.estimatedWaitTime}</p>
                    <p className="text-sm text-gray-600">Minutes (estimated)</p>
                  </div>
                </div>
              </div>
            )}

            {tokenData.status === "served" && (
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">Your turn is ready!</h3>
                <p className="text-green-700">Please proceed to the service counter now.</p>
              </div>
            )}

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                This page will automatically update when your status changes. You will also receive an email
                notification.
              </p>

              <div className="space-x-4">
                <Link to="/dashboard">
                  <button className="btn btn-outline">View All Tokens</button>
                </Link>
                <Link to="/">
                  <button className="btn btn-primary">Book Another Token</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TokenPage
