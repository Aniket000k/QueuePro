import express from "express"
import nodemailer from "nodemailer"
import Token from "../models/Token.js"
import User from "../models/User.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Remove all console.log statements for route registration and debugging

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
    "investment": "Investment Services",
    "customer-service": "Customer Service",
  },
}

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
    // Extract the numeric part from the tokenNumber (before the dash)
    const match = lastToken.tokenNumber.match(/\d+(?=-\d{8}$)/);
    if (match) {
      nextNumber = parseInt(match[0], 10) + 1;
    }
  }
  // Add date string in DDMMYYYY format
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getFullYear()}`;
  return `${prefix}${serviceShort}${nextNumber.toString().padStart(3, "0")}-${dateStr}`;
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
          <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; padding: 32px 0;">
            <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); overflow: hidden;">
              <div style="background: linear-gradient(90deg, #2563eb 0%, #6366f1 100%); padding: 24px 32px; text-align: center;">
                <h1 style="color: #fff; font-size: 2rem; margin: 0; letter-spacing: 1px;">QUEUE PRO</h1>
                <p style="color: #e0e7ff; margin: 8px 0 0; font-size: 1.1rem;">Your Token is Confirmed!</p>
              </div>
              <div style="padding: 32px;">
                <h2 style="color: #2563eb; margin-bottom: 12px;">Token Generated 🎟️</h2>
                <p style="color: #222; font-size: 1.1rem; margin-bottom: 24px;">Dear <b>${user.name}</b>,<br>Your token <b>${tokenNumber}</b> for <b>${SERVICES[branchType][serviceId]}</b> at <b>${branchType.charAt(0).toUpperCase() + branchType.slice(1)}</b> has been <b>successfully generated</b> with QUEUE PRO. Please find your token details below:</p>
                <div style="background: #f1f5f9; border-radius: 10px; padding: 20px 24px; margin-bottom: 24px;">
                  <table style="width: 100%; font-size: 1rem; color: #222;">
                    <tr><td style="padding: 6px 0;"><b>Token Number:</b></td><td>${tokenNumber}</td></tr>
                    <tr><td style="padding: 6px 0;"><b>Branch:</b></td><td>${branchType.charAt(0).toUpperCase() + branchType.slice(1)}</td></tr>
                    <tr><td style="padding: 6px 0;"><b>Service:</b></td><td>${SERVICES[branchType][serviceId]}</td></tr>
                    <tr><td style="padding: 6px 0;"><b>Booked At:</b></td><td>${new Date().toLocaleString()}</td></tr>
                    <tr><td style="padding: 6px 0;"><b>Status:</b></td><td>Waiting</td></tr>
                    <tr><td style="padding: 6px 0;"><b>Position:</b></td><td>#${position}</td></tr>
                  </table>
                </div>
               
                <p style="color: #64748b; font-size: 0.97rem; text-align: center;">Thank you for choosing <b>QUEUE PRO</b>!<br>We look forward to serving you.</p>
              </div>
            </div>
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
