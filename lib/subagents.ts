import { ObjectId } from "mongodb"
import clientPromise from "./mongodb"
import type { ParsedTask } from "./file-parser"

export interface SubAgent {
  _id?: string
  ownerAgentId: string // parent Agent id
  name: string
  email: string
  mobile?: string
  active: boolean
  capacity?: number // optional max tasks per import cycle
  createdAt?: Date
  updatedAt?: Date
}

export interface DistributedSubTask {
  title: string
  description?: string
  status: "pending"
  uploadId: string
  ownerAgentId: string
  subAssignedTo: string // SubAgent id
  createdAt: Date
  updatedAt: Date
}

export interface SubTaskDistributionResult {
  totalTasks: number
  distributedTasks: DistributedSubTask[]
  subAgentTaskCounts: Record<string, number>
}

class SubAgentService {
  async getAllSubAgentTasks(
    page = 1,
    limit = 10,
  ): Promise<{ tasks: any[]; total: number; page: number; totalPages: number }> {
    const tasksCol = await this.getTasksCollection()

    const query = { subAssignedTo: { $exists: true, $ne: "" } }
    const total = await tasksCol.countDocuments(query)
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    const tasks = await tasksCol
      .aggregate([
        { $match: query },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $addFields: {
            subAssignedToObjId: {
              $cond: [
                { $and: [{ $ne: ["$subAssignedTo", null] }, { $ne: ["$subAssignedTo", ""] }] },
                { $toObjectId: "$subAssignedTo" },
                null,
              ],
            },
          },
        },
        {
          $lookup: {
            from: "subagents",
            localField: "subAssignedToObjId",
            foreignField: "_id",
            as: "subAgent",
          },
        },
        { $unwind: { path: "$subAgent", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            uploadId: 1,
            ownerAgentId: 1,
            subAgent: {
              $cond: [
                { $ifNull: ["$subAgent._id", false] },
                { _id: "$subAgent._id", name: "$subAgent.name", email: "$subAgent.email" },
                null,
              ],
            },
          },
        },
      ])
      .toArray()

    return {
      tasks: tasks.map((t: any) => ({ ...t, _id: t._id.toString() })),
      total,
      page,
      totalPages,
    }
  }
  private async getCollection() {
    const client = await clientPromise
    const db = client.db("agentx")
    return db.collection("subagents")
  }

  private async getRRCollection() {
    const client = await clientPromise
    const db = client.db("agentx")
    return db.collection("subagent_rr") // { ownerAgentId: string, lastIndex: number }
  }

  private async getTasksCollection() {
    const client = await clientPromise
    const db = client.db("agentx")
    return db.collection("tasks")
  }

  // CRUD
  async createSubAgent(data: Omit<SubAgent, "_id" | "createdAt" | "updatedAt">): Promise<SubAgent> {
    const col = await this.getCollection()

    const now = new Date()
    const doc = { ...data, email: data.email.toLowerCase(), createdAt: now, updatedAt: now }
    const result = await col.insertOne(doc)

    return { _id: result.insertedId.toString(), ...doc }
  }

  async listSubAgents(
    ownerAgentId: string,
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<{ subAgents: SubAgent[]; total: number; page: number; totalPages: number }> {
    const col = await this.getCollection()

    const query: any = { ownerAgentId }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ]
    }

    const total = await col.countDocuments(query)
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    const docs = await col
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return {
      subAgents: docs.map((d) => ({ ...d, _id: d._id.toString() } as SubAgent)),
      total,
      page,
      totalPages,
    }
  }

  async getSubAgentById(id: string): Promise<SubAgent | null> {
    const col = await this.getCollection()
    if (!ObjectId.isValid(id)) return null
    const doc = await col.findOne({ _id: new ObjectId(id) })
    return doc ? ({ ...doc, _id: doc._id.toString() } as SubAgent) : null
  }

  async updateSubAgent(
    id: string,
    data: Partial<Omit<SubAgent, "_id" | "ownerAgentId" | "createdAt" | "updatedAt">>,
  ): Promise<SubAgent | null> {
    const col = await this.getCollection()
    if (!ObjectId.isValid(id)) return null

    const update: any = { updatedAt: new Date() }
    if (typeof data.name === "string") update.name = data.name
    if (typeof data.email === "string") update.email = data.email.toLowerCase()
    if (typeof data.mobile === "string") update.mobile = data.mobile
    if (typeof data.active === "boolean") update.active = data.active
    if (typeof data.capacity === "number") update.capacity = data.capacity

    const res = await col.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: update }, { returnDocument: "after" })
    return res ? ({ ...res, _id: res._id.toString() } as SubAgent) : null
  }

  async deleteSubAgent(id: string): Promise<boolean> {
    const col = await this.getCollection()
    if (!ObjectId.isValid(id)) return false
    const res = await col.deleteOne({ _id: new ObjectId(id) })
    return res.deletedCount === 1
  }

  async getActiveSubAgents(ownerAgentId: string): Promise<Array<{ _id: string; name: string; email: string; capacity?: number }>> {
    const col = await this.getCollection()
    const subs = await col
      .find({ ownerAgentId, active: true })
      .project({ _id: 1, name: 1, email: 1, capacity: 1 })
      .toArray()

    return subs.map((s) => ({ _id: s._id.toString(), name: s.name, email: s.email, capacity: s.capacity }))
  }

  // Round-robin state
  private async getAndBumpRRIndex(ownerAgentId: string, modulo: number): Promise<number> {
    const rr = await this.getRRCollection()
    const doc = await rr.findOneAndUpdate(
      { ownerAgentId },
      { $inc: { lastIndex: 1 } },
      { upsert: true, returnDocument: "after" },
    )
    const idx = (doc?.lastIndex ?? 0) % Math.max(modulo, 1)
    return idx
  }

  private async setRRIndex(ownerAgentId: string, index: number) {
    const rr = await this.getRRCollection()
    await rr.updateOne({ ownerAgentId }, { $set: { lastIndex: index } }, { upsert: true })
  }

  // Distribution
  async distributeTasksToSubAgents(
    tasks: ParsedTask[],
    ownerAgentId: string,
    uploadId: string,
  ): Promise<SubTaskDistributionResult> {
    const subAgents = await this.getActiveSubAgents(ownerAgentId)
    if (subAgents.length === 0) {
      throw new Error("No active sub-agents available for distribution")
    }

    const distributedTasks: DistributedSubTask[] = []
    const counts: Record<string, number> = {}
    const capacityMap: Record<string, number> = {}
    subAgents.forEach((s) => {
      counts[s._id] = 0
      capacityMap[s._id] = typeof s.capacity === "number" && s.capacity > 0 ? s.capacity : Number.POSITIVE_INFINITY
    })

    let cursor = await this.getAndBumpRRIndex(ownerAgentId, subAgents.length)

    const nextIndex = () => {
      for (let step = 0; step < subAgents.length; step++) {
        cursor = (cursor + 1) % subAgents.length
        const candidate = subAgents[cursor]
        if (counts[candidate._id] < capacityMap[candidate._id]) {
          return cursor
        }
      }
      return -1 // all full
    }

    for (const t of tasks) {
      const index = nextIndex()
      if (index === -1) break // all sub-agents at capacity
      const sub = subAgents[index]
      distributedTasks.push({
        title: t.title,
        description: t.description,
        status: "pending",
        uploadId,
        ownerAgentId,
        subAssignedTo: sub._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      counts[sub._id]++
    }

    // persist rr pointer at the position that got the last task
    await this.setRRIndex(ownerAgentId, cursor)

    return { totalTasks: distributedTasks.length, distributedTasks, subAgentTaskCounts: counts }
  }

  async saveDistributedSubTasks(tasks: DistributedSubTask[]): Promise<void> {
    const col = await this.getTasksCollection()
    if (!tasks || tasks.length === 0) return
    await col.insertMany(tasks)
  }

  // Reporting helpers
  async getTasksByOwnerAgent(
    ownerAgentId: string,
    page = 1,
    limit = 10,
  ): Promise<{ tasks: any[]; total: number; page: number; totalPages: number }> {
    const tasksCol = await this.getTasksCollection()

    const total = await tasksCol.countDocuments({ ownerAgentId })
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    const tasks = await tasksCol
      .aggregate([
        { $match: { ownerAgentId } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $addFields: {
            subAssignedToObjId: {
              $cond: [
                { $and: [{ $ne: ["$subAssignedTo", null] }, { $ne: ["$subAssignedTo", ""] }] },
                { $toObjectId: "$subAssignedTo" },
                null,
              ],
            },
          },
        },
        {
          $lookup: {
            from: "subagents",
            localField: "subAssignedToObjId",
            foreignField: "_id",
            as: "subAgent",
          },
        },
        { $unwind: { path: "$subAgent", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            uploadId: 1,
            subAgent: {
              $cond: [
                { $ifNull: ["$subAgent._id", false] },
                { _id: "$subAgent._id", name: "$subAgent.name", email: "$subAgent.email" },
                null,
              ],
            },
          },
        },
      ])
      .toArray()

    return { tasks, total, page, totalPages }
  }
}

export const subAgentService = new SubAgentService()
