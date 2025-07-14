"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Calendar, Clock, Building2, User, Mail, Phone } from "lucide-react"
import axios from "axios"

const AppointmentPage = () => {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    purpose: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { user, token } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await axios.post(
        "/api/appointments",
        {
          ...formData,
          userId: user._id,
          branchType: "bank",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      setSuccess(true)
      // navigate("/dashboard") // Remove auto-redirect
    } catch (err) {
      setError(err.response?.data?.message || "Failed to schedule appointment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Schedule Bank Appointment</h1>
            <p className="text-gray-600">Book a meeting with our bank representatives</p>
          </div>

          {success ? (
            <div className="card animate-fade-in border border-blue-100 bg-white shadow-lg p-8 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#2563eb"/><path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h2 className="text-2xl font-bold text-blue-700 mb-2">Your Meeting is Scheduled!</h2>
                <p className="text-gray-700 mb-4">Thank you for using <span className="font-semibold text-blue-600">QUEUE PRO</span>.<br />A confirmation email has been sent to <span className="font-semibold">{user?.email}</span>.</p>
                <p className="text-gray-500 mb-6">You can view or manage your appointments from your dashboard.</p>
                <button
                  className="btn btn-primary px-8 py-3 text-base mt-2"
                  onClick={() => navigate("/dashboard")}
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="card">
              <form onSubmit={handleSubmit} className="space-y-6 p-6">
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        className="input pl-10 w-full"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Time</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="time"
                        className="input pl-10 w-full"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Purpose of Meeting</label>
                    <select
                      className="input w-full"
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      required
                    >
                      <option value="">Select purpose</option>
                      <option value="loan-application">Loan Application</option>
                      <option value="investment-advice">Investment Advice</option>
                      <option value="account-opening">Account Opening</option>
                      <option value="financial-planning">Financial Planning</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Additional Notes</label>
                    <textarea
                      className="input w-full h-32 resize-none"
                      placeholder="Any specific requirements or questions?"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                  <h3 className="font-medium text-gray-900 mb-4">Your Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{user?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4" />
                      <span>Bank Branch</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full text-base py-3 mt-6"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner w-5 h-5 mr-2"></div>
                      Scheduling...
                    </div>
                  ) : (
                    "Schedule Appointment"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AppointmentPage 