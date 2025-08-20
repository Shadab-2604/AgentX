import mongoose from "mongoose"

const AgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Agent", required: true },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
  uploadId: { type: mongoose.Schema.Types.ObjectId, ref: "Upload", required: true },
  notes: { type: String },
  estimatedHours: { type: Number },
  actualHours: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

TaskSchema.virtual("agent", {
  ref: "Agent",
  localField: "assignedTo",
  foreignField: "_id",
  justOne: true,
})

TaskSchema.set("toJSON", { virtuals: true })
TaskSchema.set("toObject", { virtuals: true })

const UploadSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  cloudinaryUrl: { type: String, required: true },
  totalTasks: { type: Number, required: true },
  uploadedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

const AdminUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
  createdAt: { type: Date, default: Date.now },
})

export const Agent = mongoose.models.Agent || mongoose.model("Agent", AgentSchema)
export const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema)
export const Upload = mongoose.models.Upload || mongoose.model("Upload", UploadSchema)
export const AdminUser = mongoose.models.AdminUser || mongoose.model("AdminUser", AdminUserSchema)

export interface Agent {
  _id?: string
  name: string
  email: string
  mobile: string
  password: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Task {
  _id?: string
  title: string
  description?: string
  assignedTo: string // Agent ID
  agent?: Agent // Add agent field for populated data
  status: "pending" | "in-progress" | "completed"
  priority?: "low" | "medium" | "high" | "urgent"
  uploadId: string // Reference to the upload batch
  notes?: string
  estimatedHours?: number
  actualHours?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface Upload {
  _id?: string
  filename: string
  originalName: string
  cloudinaryUrl: string
  totalTasks: number
  uploadedBy: string // Admin ID
  createdAt?: Date
}

export interface AdminUser {
  _id?: string
  name: string
  email: string
  password: string
  role: "admin"
  createdAt?: Date
}

export interface CreateAgentData {
  name: string
  email: string
  mobile: string
  password: string
}

export interface UpdateAgentData {
  name?: string
  email?: string
  mobile?: string
  password?: string
}
