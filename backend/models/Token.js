import mongoose from "mongoose"

const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    branchType: {
      type: String,
      required: true,
      enum: ["hospital", "bank"],
    },
    serviceId: {
      type: String,
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["waiting", "served", "cancelled"],
      default: "waiting",
    },
    position: {
      type: Number,
      default: 0,
    },
    servedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Token", tokenSchema)
