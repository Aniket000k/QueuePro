import express from "express"
import Appointment from "../models/Appointment.js"
import { authenticateToken } from "../middleware/auth.js"
import nodemailer from "nodemailer"
import User from "../models/User.js"

const router = express.Router()

// Email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
})

// Schedule a new bank appointment
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { date, time, purpose, notes, branchType } = req.body
    const userId = req.user.userId

    // Only allow bank appointments for now
    if (branchType !== "bank") {
      return res.status(400).json({ message: "Only bank appointments are supported." })
    }

    if (!date || !time || !purpose) {
      return res.status(400).json({ message: "Date, time, and purpose are required." })
    }

    const appointment = new Appointment({
      userId,
      branchType,
      date,
      time,
      purpose,
      notes: notes || "",
    })
    await appointment.save()

    // Fetch user details for email
    const user = await User.findById(userId)
    if (user && user.email) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Your Bank Appointment is Scheduled",
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; padding: 32px 0;">
              <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); overflow: hidden;">
                <div style="background: linear-gradient(90deg, #2563eb 0%, #6366f1 100%); padding: 24px 32px; text-align: center;">
                  <h1 style="color: #fff; font-size: 2rem; margin: 0; letter-spacing: 1px;">QUEUE PRO</h1>
                  <p style="color: #e0e7ff; margin: 8px 0 0; font-size: 1.1rem;">Your Bank Appointment is Confirmed!</p>
                </div>
                <div style="padding: 32px;">
                  <h2 style="color: #2563eb; margin-bottom: 12px;">Meeting Scheduled 🎉</h2>
                  <p style="color: #222; font-size: 1.1rem; margin-bottom: 24px;">Dear <b>${user.name}</b>,<br>Your bank appointment has been <b>successfully scheduled</b> with QUEUE PRO. Please find your appointment details below:</p>
                  <div style="background: #f1f5f9; border-radius: 10px; padding: 20px 24px; margin-bottom: 24px;">
                    <table style="width: 100%; font-size: 1rem; color: #222;">
                      <tr><td style="padding: 6px 0;"><b>Date:</b></td><td>${date}</td></tr>
                      <tr><td style="padding: 6px 0;"><b>Time:</b></td><td>${time}</td></tr>
                      <tr><td style="padding: 6px 0;"><b>Purpose:</b></td><td>${purpose}</td></tr>
                      <tr><td style="padding: 6px 0;"><b>Notes:</b></td><td>${notes || "-"}</td></tr>
                      <tr><td style="padding: 6px 0;"><b>Booked At:</b></td><td>${new Date().toLocaleString()}</td></tr>
                    </table>
                  </div>
                 
                  <p style="color: #64748b; font-size: 0.97rem; text-align: center;">Thank you for choosing <b>QUEUE PRO</b>!<br>We look forward to serving you.</p>
                </div>
              </div>
            </div>
          `,
        })
      } catch (emailError) {
        console.error("Appointment email sending failed:", emailError)
        // Don't fail the request if email fails
      }
    }

    res.status(201).json({ message: "Appointment scheduled successfully", appointment })
  } catch (error) {
    console.error("Appointment scheduling error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

export default router 