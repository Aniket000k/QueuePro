import express from "express"
import nodemailer from "nodemailer"
import Token from "../models/Token.js"
import User from "../models/User.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

const SERVICES = {
  hospital: {
    opd: "OPD (Out Patient Department)",
    emergency: "Emergency",
    cardiology: "Cardiology",
    orthopedic: "Orthopedic",
    pediatric: "Pediatric",
  },
  bank: {
    "cash-deposit": "Cash Deposit",
    "loan-inquiry": "Loan Inquiry",
    "account-opening": "Account Opening",
    investment: "Investment Services",
    "customer-service": "Customer Service",
  },
}

console.log("EMAIL_USER:", process.env.EMAIL_USER)
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Present" : "Missing")

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

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("Email configuration error:", error)
  } else {
    console.log("Email server is ready to send messages")
  }
})

// Generate token number (reset daily, per service)
const generateTokenNumber = async (branchType, serviceId) => {
  const prefix = branchType === "hospital" ? "H" : "B";
  // Use first 3 letters of serviceId as service short code (uppercased)
  const serviceShort = serviceId.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the latest token for this branchType+serviceId today
  const lastToken = await Token.findOne({
    branchType,
    serviceId,
    createdAt: { $gte: today },
  }).sort({ createdAt: -1 });

  let nextNumber = 1;
  if (lastToken) {
    // Extract the numeric part from the tokenNumber
    const match = lastToken.tokenNumber.match(/\d+$/);
    if (match) {
      nextNumber = parseInt(match[0], 10) + 1;
    }
  }
  return `${prefix}${serviceShort}${nextNumber.toString().padStart(3, "0")}`;
}

// Create token
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { branchType, serviceId } = req.body
    const userId = req.user.userId

    // Validate branch and service
    if (!SERVICES[branchType] || !SERVICES[branchType][serviceId]) {
      return res.status(400).json({ message: "Invalid branch or service" })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Generate token number (now per service, per day)
    const tokenNumber = await generateTokenNumber(branchType, serviceId);

    // Calculate position
    const waitingTokens = await Token.find({
      branchType,
      serviceId,
      status: "waiting",
    })

    const position = waitingTokens.length + 1

    // Create token
    const token = new Token({
      tokenNumber,
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      branchType,
      serviceId,
      serviceName: SERVICES[branchType][serviceId],
      position,
    })

    await token.save()

    // Send confirmation email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Your Token Booking Confirmation",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Token Booking Confirmation</h2>
            <p>Dear ${user.name},</p>
            <p>Your token <strong>${tokenNumber}</strong> for <strong>${SERVICES[branchType][serviceId]}</strong> at <strong>${branchType.charAt(0).toUpperCase() + branchType.slice(1)}</strong> has been confirmed.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Token Details:</h3>
              <p><strong>Token Number:</strong> ${tokenNumber}</p>
              <p><strong>Branch:</strong> ${branchType.charAt(0).toUpperCase() + branchType.slice(1)}</p>
              <p><strong>Service:</strong> ${SERVICES[branchType][serviceId]}</p>
              <p><strong>Booked At:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Status:</strong> Waiting</p>
              <p><strong>Position:</strong> #${position}</p>
            </div>
            
            <p>You will receive real-time updates about your queue status. Please keep this email for your records.</p>
            <p>Thank you for using our Queue Management System!</p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error("Email sending failed:", emailError)
    }

    // Emit socket event
    req.io.emit("new_token", {
      tokenNumber,
      branchType,
      serviceId,
      position,
    })

    res.status(201).json({
      message: "Token generated successfully",
      token,
    })
  } catch (error) {
    console.error("Token generation error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Get token by number (standard REST: /api/token/:tokenNumber)
router.get('/:tokenNumber', authenticateToken, async (req, res) => {
  try {
    const { tokenNumber } = req.params
    const userId = req.user.userId
    const userRole = req.user.role

    const token = await Token.findOne({ tokenNumber })
    if (!token) {
      return res.status(404).json({ message: "Token not found" })
    }

    // Check if user owns token or is admin
    if (token.userId.toString() !== userId && userRole !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    // Calculate current position and wait time
    const waitingTokens = await Token.find({
      branchType: token.branchType,
      serviceId: token.serviceId,
      status: "waiting",
      createdAt: { $lte: token.createdAt },
    }).sort({ createdAt: 1 })

    const position = waitingTokens.findIndex((t) => t._id.toString() === token._id.toString()) + 1
    const estimatedWaitTime = position * 10 // 10 minutes per token

    res.json({
      token: {
        ...token.toObject(),
        position: position > 0 ? position : 0,
        estimatedWaitTime,
      },
    })
  } catch (error) {
    console.error("Token fetch error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

export default router
