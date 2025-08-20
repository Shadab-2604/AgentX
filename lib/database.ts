import { ObjectId } from "mongodb"
import clientPromise from "./mongodb"
import { hashPassword } from "./auth"
import type { Agent, CreateAgentData, UpdateAgentData } from "./models"

export class AgentService {
  private async getCollection() {
    const client = await clientPromise
    const db = client.db("agentx")
    return db.collection("agents")
  }

  async createAgent(data: CreateAgentData): Promise<Agent> {
    const collection = await this.getCollection()

    // Check if email already exists
    const existingAgent = await collection.findOne({ email: data.email })
    if (existingAgent) {
      throw new Error("Agent with this email already exists")
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password)

    const newAgent = {
      name: data.name.trim(),
      email: data.email.toLowerCase(),
      mobile: data.mobile,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(newAgent)

    return {
      _id: result.insertedId.toString(),
      ...newAgent,
    }
  }

  async getAgents(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<{
    agents: Omit<Agent, "password">[]
    total: number
    page: number
    totalPages: number
  }> {
    const collection = await this.getCollection()

    let query = {}
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { mobile: { $regex: search, $options: "i" } },
        ],
      }
    }

    const total = await collection.countDocuments(query)
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    const agents = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .project({ password: 0 }) // Exclude password from results
      .toArray()

    return {
      agents: agents.map((agent) => ({
        ...agent,
        _id: agent._id.toString(),
      })) as Omit<Agent, "password">[],
      total,
      page,
      totalPages,
    }
  }

  async getAgentById(id: string): Promise<Omit<Agent, "password"> | null> {
    const collection = await this.getCollection()

    if (!ObjectId.isValid(id)) {
      return null
    }

    const agent = await collection.findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } })

    if (!agent) {
      return null
    }

    return {
      ...agent,
      _id: agent._id.toString(),
    } as Omit<Agent, "password">
  }

  async updateAgent(id: string, data: UpdateAgentData): Promise<Omit<Agent, "password"> | null> {
    const collection = await this.getCollection()

    if (!ObjectId.isValid(id)) {
      return null
    }

    // Check if email already exists (if email is being updated)
    if (data.email) {
      const existingAgent = await collection.findOne({
        email: data.email.toLowerCase(),
        _id: { $ne: new ObjectId(id) },
      })
      if (existingAgent) {
        throw new Error("Agent with this email already exists")
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (data.name) updateData.name = data.name.trim()
    if (data.email) updateData.email = data.email.toLowerCase()
    if (data.mobile) updateData.mobile = data.mobile
    if (data.password) updateData.password = await hashPassword(data.password)

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after", projection: { password: 0 } },
    )

    if (!result) {
      return null
    }

    return {
      ...result,
      _id: result._id.toString(),
    } as Omit<Agent, "password">
  }

  async deleteAgent(id: string): Promise<boolean> {
    const collection = await this.getCollection()

    if (!ObjectId.isValid(id)) {
      return false
    }

    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount === 1
  }

  async getAgentCount(): Promise<number> {
    const collection = await this.getCollection()
    return collection.countDocuments()
  }
}

export const agentService = new AgentService()
