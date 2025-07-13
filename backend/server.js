import dotenv from "dotenv"
dotenv.config() 

import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import mongoose from "mongoose"
import path from "path"
import { fileURLToPath } from "url"

// Import routes
import authRoutes from "./routes/auth.js"
import tokenRoutes from "./routes/token.js"
import adminRoutes from "./routes/admin.js"
import userRoutes from "./routes/user.js"

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
})

// Test your env values
console.log("EMAIL_USER:", process.env.EMAIL_USER)
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded ✅" : "Missing ❌")

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true
}))
app.use(express.json())

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io
  next()
})

// Serve static files from the frontend build (public/dist)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const buildPath = path.join(__dirname, "public", "dist")
app.use(express.static(buildPath))

// Catch-all route to serve index.html for SPA
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) return next()
  res.sendFile(path.join(buildPath, "index.html"))
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/queue-management")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/token", tokenRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/user", userRoutes)

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // Emit a test event immediately after connection
  socket.emit("test_connection", {
    message: "Socket.IO connection successful",
    timestamp: new Date().toISOString()
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })

  // Add error handling
  socket.on("error", (error) => {
    console.error("Socket error:", error)
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err)
  res.status(500).json({ message: "Internal server error" })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Socket.IO server initialized`)
})
