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
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Bank Appointment Confirmation</h2>
              <p>Dear ${user.name},</p>
              <p>Your bank appointment has been scheduled successfully. Here are the details:</p>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Appointment Details:</h3>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Time:</strong> ${time}</p>
                <p><strong>Purpose:</strong> ${purpose}</p>
                <p><strong>Notes:</strong> ${notes || "-"}</p>
                <p><strong>Booked At:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <p>Thank you for using our QueuePro!</p>
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