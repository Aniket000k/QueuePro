"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Users, Clock, CheckCircle, ArrowRight } from "lucide-react"
import axios from "axios"
import { io } from "socket.io-client"

const BRANCHES = [
  { id: "hospital", name: "Hospital" },
  { id: "bank", name: "Bank" },
]

const SERVICES = {
  hospital: [
    { id: "opd", name: "OPD (Out Patient Department)" },
    { id: "emergency", name: "Emergency" },
    { id: "cardiology", name: "Cardiology" },
    { id: "orthopedic", name: "Orthopedic" },
    { id: "pediatric", name: "Pediatric" },
  ],
  bank: [
    { id: "cash-deposit", name: "Cash Deposit" },
    { id: "loan-inquiry", name: "Loan Inquiry" },
    { id: "account-opening", name: "Account Opening" },
    { id: "investment", name: "Investment Services" },
    { id: "customer-service", name: "Customer Service" },
  ],
}

const AdminPage = () => {
  const [selectedBranch, setSelectedBranch] = useState("")
  const [selectedService, setSelectedService] = useState("")
  const [queueTokens, setQueueTokens] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { token } = useAuth()

  useEffect(() => {
    // Set up Socket.IO connection
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

    socket.on("new_token", (data) => {
      if (data.branchType === selectedBranch && data.serviceId === selectedService) {
        fetchQueue()
      }
    })

    socket.on("token_served", (data) => {
      if (data.branchType === selectedBranch && data.serviceId === selectedService) {
        fetchQueue()
      }
    })

    socket.on("queue_updated", (data) => {
      if (data.branchType === selectedBranch && data.serviceId === selectedService) {
        fetchQueue()
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [selectedBranch, selectedService])

  const fetchQueue = async () => {
    if (!selectedBranch || !selectedService) return

    setLoading(true)
    try {
      const response = await axios.get(`/api/admin/queue?branchType=${selectedBranch}&serviceId=${selectedService}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setQueueTokens(response.data.tokens)
    } catch (err) {
      setError("Failed to fetch queue data")
    } finally {
      setLoading(false)
    }
  }

  const handleNextToken = async () => {
    const nextToken = queueTokens.find((token) => token.status === "waiting")
    if (!nextToken) return

    try {
      await axios.post(
        "/api/admin/serve-next",
        {
          tokenId: nextToken._id,
          branchType: selectedBranch,
          serviceId: selectedService,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      fetchQueue() // Refresh the queue
    } catch (err) {
      setError("Failed to serve next token")
    }
  }

  useEffect(() => {
    if (selectedBranch && selectedService) {
      fetchQueue()
    }
  }, [selectedBranch, selectedService])

  const waitingTokens = queueTokens.filter((token) => token.status === "waiting")
  const servedTokens = queueTokens.filter((token) => token.status === "served")
  const nextToken = waitingTokens[0]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Queue Management</h1>
          <p className="text-gray-600">Manage and serve tokens in real-time</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="card-header flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Waiting</h3>
              <Users className="h-4 w-4 text-gray-500" />
            </div>
            <div className="card-content">
              <div className="text-2xl font-bold">{waitingTokens.length}</div>
              <p className="text-xs text-gray-500">Tokens in queue</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Served Today</h3>
              <CheckCircle className="h-4 w-4 text-gray-500" />
            </div>
            <div className="card-content">
              <div className="text-2xl font-bold">{servedTokens.length}</div>
              <p className="text-xs text-gray-500">Completed tokens</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Avg Wait Time</h3>
              <Clock className="h-4 w-4 text-gray-500" />
            </div>
            <div className="card-content">
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-gray-500">Minutes</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-bold">Queue Selection</h2>
              <p className="text-gray-600">Select branch and service to manage</p>
            </div>
            <div className="card-content space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Branch</label>
                <select className="input" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                  <option value="">Select branch</option>
                  {BRANCHES.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBranch && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Service</label>
                  <select
                    className="input"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                  >
                    <option value="">Select service</option>
                    {SERVICES[selectedBranch]?.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {nextToken && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Next Token to Serve</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-lg">{nextToken.tokenNumber}</p>
                      <p className="text-sm text-gray-600">{nextToken.userName}</p>
                    </div>
                    <button 
                      onClick={handleNextToken} 
                      className="btn btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      Serve Token <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-bold">Current Queue</h2>
              <p className="text-gray-600">
                {selectedBranch && selectedService
                  ? `${BRANCHES.find((b) => b.id === selectedBranch)?.name} - ${SERVICES[selectedBranch]?.find((s) => s.id === selectedService)?.name}`
                  : "Select branch and service to view queue"}
              </p>
            </div>
            <div className="card-content">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
              )}

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Loading queue...</p>
                </div>
              ) : queueTokens.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {selectedBranch && selectedService ? "No tokens in queue" : "Select branch and service"}
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {queueTokens.map((token, index) => (
                    <div
                      key={token._id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        token.status === "waiting" ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="font-mono font-bold">{token.tokenNumber}</div>
                          <div className="text-xs text-gray-500">#{index + 1}</div>
                        </div>
                        <div>
                          <p className="font-medium">{token.userName}</p>
                          <p className="text-sm text-gray-600">{token.userEmail}</p>
                          <p className="text-xs text-gray-500">{new Date(token.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <span className={`badge ${token.status === "waiting" ? "badge-waiting" : "badge-served"}`}>
                        {token.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage
