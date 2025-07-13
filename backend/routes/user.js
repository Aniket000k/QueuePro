import express from "express"
import Token from "../models/Token.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Get user's tokens
router.get("/tokens", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId

    const tokens = await Token.find({ userId }).sort({ createdAt: -1 })

    // Calculate positions for waiting tokens
    const tokensWithPosition = await Promise.all(
      tokens.map(async (token) => {
        if (token.status === "waiting") {
          const waitingTokens = await Token.find({
            branchType: token.branchType,
            serviceId: token.serviceId,
            status: "waiting",
            createdAt: { $lte: token.createdAt },
          })
          return { ...token.toObject(), position: waitingTokens.length }
        }
        return token.toObject()
      }),
    )

    res.json({ tokens: tokensWithPosition })
  } catch (error) {
    console.error("User tokens fetch error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

export default router
