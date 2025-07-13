import express from "express"
import nodemailer from "nodemailer"
import Token from "../models/Token.js"
import { authenticateToken, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

// Email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
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

// Get queue for branch and service
router.get("/queue", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { branchType, serviceId } = req.query

    if (!branchType || !serviceId) {
      return res.status(400).json({ message: "Branch and service required" })
    }

    const tokens = await Token.find({
      branchType,
      serviceId,
    }).sort({ createdAt: 1 })

    // Calculate positions for waiting tokens
    const tokensWithPosition = tokens.map((token, index) => {
      if (token.status === "waiting") {
        const waitingTokensBefore = tokens.filter(
          (t) => t.status === "waiting" && t.createdAt <= token.createdAt,
        ).length
        return { ...token.toObject(), position: waitingTokensBefore }
      }
      return { ...token.toObject(), position: 0 }
    })

    res.json({ tokens: tokensWithPosition })
  } catch (error) {
    console.error("Queue fetch error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Serve next token
router.post("/serve-next", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { tokenId, branchType, serviceId } = req.body

    const token = await Token.findById(tokenId)
    if (!token) {
      return res.status(404).json({ message: "Token not found" })
    }

    if (token.status !== "waiting") {
      return res.status(400).json({ message: "Token already served" })
    }

    // Update token status
    token.status = "served"
    token.servedAt = new Date()
    await token.save()

    // Update positions of waiting tokens
    const waitingTokens = await Token.find({
      branchType,
      serviceId,
      status: "waiting",
    }).sort({ createdAt: 1 })

    // Calculate new positions and estimated wait times
    const updatedTokens = waitingTokens.map((t, index) => ({
      tokenNumber: t.tokenNumber,
      position: index + 1,
      estimatedWaitTime: (index + 1) * 10, // 10 minutes per token
    }))

    // Emit socket events
    req.io.emit("token_served", {
      tokenNumber: token.tokenNumber,
      branchType,
      serviceId,
    })

    req.io.emit("queue_updated", {
      branchType,
      serviceId,
      tokens: updatedTokens,
    })

    // Send notification email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: token.userEmail,
        subject: "Your Token is Ready - Please Proceed",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #22c55e;">Your Turn is Ready!</h2>
            <p>Dear ${token.userName},</p>
            <p>Your token <strong>${token.tokenNumber}</strong> for <strong>${token.serviceName}</strong> is now ready.</p>
            
            <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
              <h3 style="margin-top: 0; color: #15803d;">Please Proceed to Service Counter</h3>
              <p><strong>Token Number:</strong> ${token.tokenNumber}</p>
              <p><strong>Service:</strong> ${token.serviceName}</p>
              <p><strong>Branch:</strong> ${token.branchType.charAt(0).toUpperCase() + token.branchType.slice(1)}</p>
            </div>
            
            <p>Please proceed to the service counter immediately. Thank you for your patience!</p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error("Email sending failed:", emailError)
    }

    res.json({
      message: "Token served successfully",
      token,
    })
  } catch (error) {
    console.error("Serve token error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

export default router
