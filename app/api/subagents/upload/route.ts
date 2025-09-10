import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth"
import { parseFile, validateFileType } from "@/lib/file-parser"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { subAgentService } from "@/lib/subagents"
import { taskDistributionService } from "@/lib/task-distribution"

export async function POST(request: NextRequest) {
  try {
    const user = authenticateRequest(request)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 })

    if (!validateFileType(file.name)) {
      return NextResponse.json({ error: "Invalid file type. Please upload CSV, XLS, or XLSX files only." }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) return NextResponse.json({ error: "File size too large. Maximum size is 10MB." }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())

    let parseResult
    try {
      parseResult = parseFile(buffer, file.name)
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to parse file" }, { status: 400 })
    }

    // Upload to cloud for traceability
    let cloudinaryResult
    try {
      cloudinaryResult = await uploadToCloudinary(buffer, file.name)
    } catch (e) {
      return NextResponse.json({ error: "Failed to upload file to cloud storage" }, { status: 500 })
    }

    // Save upload record using existing service to maintain uniformity
    const uploadId = await taskDistributionService.saveUploadRecord({
      filename: cloudinaryResult.public_id,
      originalName: file.name,
      cloudinaryUrl: cloudinaryResult.secure_url,
      totalTasks: parseResult.totalTasks,
      uploadedBy: user._id,
    })

    // Distribute to sub-agents owned by the current agent (or admin as owner)
    const ownerAgentId = user._id
    const distribution = await subAgentService.distributeTasksToSubAgents(parseResult.tasks, ownerAgentId, uploadId)

    await subAgentService.saveDistributedSubTasks(distribution.distributedTasks)

    return NextResponse.json({
      success: true,
      upload: {
        id: uploadId,
        filename: file.name,
        totalTasks: parseResult.totalTasks,
        cloudinaryUrl: cloudinaryResult.secure_url,
      },
      distribution: {
        totalTasks: distribution.totalTasks,
        subAgentTaskCounts: distribution.subAgentTaskCounts,
      },
    })
  } catch (error) {
    console.error("Sub-agent upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
