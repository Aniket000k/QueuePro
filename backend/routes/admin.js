import express from "express"
import nodemailer from "nodemailer"
import Token from "../models/Token.js"
import { authenticateToken, requireAdmin } from "../middleware/auth.js"

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
          <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; padding: 32px 0;">
            <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); overflow: hidden;">
              <div style="background: linear-gradient(90deg, #22c55e 0%, #2563eb 100%); padding: 24px 32px; text-align: center;">
                <h1 style="color: #fff; font-size: 2rem; margin: 0; letter-spacing: 1px;">QUEUE PRO</h1>
                <p style="color: #d1fae5; margin: 8px 0 0; font-size: 1.1rem;">Your Turn is Ready!</p>
              </div>
              <div style="padding: 32px;">
                <h2 style="color: #22c55e; margin-bottom: 12px;">Please Proceed to Service Counter ✅</h2>
                <p style="color: #222; font-size: 1.1rem; margin-bottom: 24px;">Dear <b>${token.userName}</b>,<br>Your token <b>${token.tokenNumber}</b> for <b>${token.serviceName}</b> is now ready. Please proceed to the service counter.</p>
                <div style="background: #dcfce7; border-radius: 10px; padding: 20px 24px; margin-bottom: 24px; border-left: 4px solid #22c55e;">
                  <table style="width: 100%; font-size: 1rem; color: #222;">
                    <tr><td style="padding: 6px 0;"><b>Token Number:</b></td><td>${token.tokenNumber}</td></tr>
                    <tr><td style="padding: 6px 0;"><b>Service:</b></td><td>${token.serviceName}</td></tr>
                    <tr><td style="padding: 6px 0;"><b>Branch:</b></td><td>${token.branchType.charAt(0).toUpperCase() + token.branchType.slice(1)}</td></tr>
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
