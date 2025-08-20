import { ObjectId } from "mongodb"
import clientPromise from "./mongodb"
import type { ParsedTask } from "./file-parser"

export interface DistributedTask {
  title: string
  description?: string
  assignedTo: string
  status: "pending"
  uploadId: string
  createdAt: Date
  updatedAt: Date
}

export interface TaskDistributionResult {
  totalTasks: number
  distributedTasks: DistributedTask[]
  agentTaskCounts: Record<string, number>
}

export class TaskDistributionService {
  private async getCollection(collectionName: string) {
    const client = await clientPromise
    const db = client.db("agentx")
    return db.collection(collectionName)
  }

  async getAvailableAgents(): Promise<Array<{ _id: string; name: string; email: string }>> {
    const agentsCollection = await this.getCollection("agents")
    const agents = await agentsCollection
      .find({})
      .project({ _id: 1, name: 1, email: 1 })
      .limit(5) // Get up to 5 agents
      .toArray()

    return agents.map((agent) => ({
      _id: agent._id.toString(),
      name: agent.name,
      email: agent.email,
    }))
  }

  distributeTasks(tasks: ParsedTask[], agents: Array<{ _id: string }>, uploadId: string): TaskDistributionResult {
    if (agents.length === 0) {
      throw new Error("No agents available for task distribution")
    }

    const distributedTasks: DistributedTask[] = []
    const agentTaskCounts: Record<string, number> = {}

    // Initialize agent task counts
    agents.forEach((agent) => {
      agentTaskCounts[agent._id] = 0
    })

    // Distribute tasks equally among agents
    tasks.forEach((task, index) => {
      const agentIndex = index % agents.length
      const assignedAgent = agents[agentIndex]

      distributedTasks.push({
        title: task.title,
        description: task.description,
        assignedTo: assignedAgent._id,
        status: "pending",
        uploadId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      agentTaskCounts[assignedAgent._id]++
    })

    return {
      totalTasks: tasks.length,
      distributedTasks,
      agentTaskCounts,
    }
  }

  async saveTasks(tasks: DistributedTask[]): Promise<void> {
    const tasksCollection = await this.getCollection("tasks")
    await tasksCollection.insertMany(tasks)
  }

  async saveUploadRecord(uploadData: {
    filename: string
    originalName: string
    cloudinaryUrl: string
    totalTasks: number
    uploadedBy: string
  }): Promise<string> {
    const uploadsCollection = await this.getCollection("uploads")
    const result = await uploadsCollection.insertOne({
      ...uploadData,
      createdAt: new Date(),
    })
    return result.insertedId.toString()
  }

  async getTasksByUploadId(uploadId: string): Promise<any[]> {
    const tasksCollection = await this.getCollection("tasks")
    const agentsCollection = await this.getCollection("agents")

    const tasks = await tasksCollection
      .aggregate([
        { $match: { uploadId } },
        {
          $lookup: {
            from: "agents",
            localField: "assignedTo",
            foreignField: "_id",
            as: "agent",
          },
        },
        {
          $unwind: "$agent",
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            agent: {
              _id: "$agent._id",
              name: "$agent.name",
              email: "$agent.email",
            },
          },
        },
      ])
      .toArray()

    return tasks
  }

  async getTasksByAgentId(
    agentId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    tasks: any[]
    total: number
    page: number
    totalPages: number
  }> {
    const tasksCollection = await this.getCollection("tasks")

    if (!ObjectId.isValid(agentId)) {
      throw new Error("Invalid agent ID")
    }

    const total = await tasksCollection.countDocuments({ assignedTo: agentId })
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    const tasks = await tasksCollection
      .find({ assignedTo: agentId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return {
      tasks: tasks.map((task) => ({
        ...task,
        _id: task._id.toString(),
      })),
      total,
      page,
      totalPages,
    }
  }

  async getAllTasks(
    page = 1,
    limit = 10,
  ): Promise<{
    tasks: any[]
    total: number
    page: number
    totalPages: number
  }> {
    const tasksCollection = await this.getCollection("tasks")
    const agentsCollection = await this.getCollection("agents")

    const total = await tasksCollection.countDocuments()
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    const tasks = await tasksCollection
      .aggregate([
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "agents",
            localField: "assignedTo",
            foreignField: "_id",
            as: "agent",
          },
        },
        {
          $unwind: "$agent",
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            agent: {
              _id: "$agent._id",
              name: "$agent.name",
              email: "$agent.email",
            },
          },
        },
      ])
      .toArray()

    return {
      tasks: tasks.map((task) => ({
        ...task,
        _id: task._id.toString(),
      })),
      total,
      page,
      totalPages,
    }
  }

  async getFilteredTasks(
    filters: {
      uploadId?: string
      agentId?: string
      status?: string
      priority?: string
      search?: string
    },
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  ): Promise<{
    tasks: any[]
    total: number
    page: number
    totalPages: number
  }> {
    const tasksCollection = await this.getCollection("tasks")

    // Build MongoDB query from filters
    const query: any = {}

    if (filters.uploadId) {
      query.uploadId = filters.uploadId
    }

    if (filters.agentId && ObjectId.isValid(filters.agentId)) {
      query.assignedTo = filters.agentId
    }

    if (filters.status) {
      query.status = filters.status
    }

    if (filters.priority) {
      query.priority = filters.priority
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ]
    }

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === "asc" ? 1 : -1

    const total = await tasksCollection.countDocuments(query)
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    const tasks = await tasksCollection
      .aggregate([
        { $match: query },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "agents",
            localField: "assignedTo",
            foreignField: "_id",
            as: "agent",
          },
        },
        {
          $unwind: {
            path: "$agent",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            status: 1,
            priority: 1,
            dueDate: 1,
            createdAt: 1,
            updatedAt: 1,
            uploadId: 1,
            agent: {
              _id: "$agent._id",
              name: "$agent.name",
              email: "$agent.email",
            },
          },
        },
      ])
      .toArray()

    return {
      tasks: tasks.map((task) => ({
        ...task,
        _id: task._id.toString(),
        agent: task.agent || null,
      })),
      total,
      page,
      totalPages,
    }
  }
}

export const taskDistributionService = new TaskDistributionService()
