import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { parseFile, validateFileType } from "@/lib/file-parser"
import { taskDistributionService } from "@/lib/task-distribution"

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validate file type
    if (!validateFileType(file.name)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload CSV, XLS, or XLSX files only." },
        { status: 400 },
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size too large. Maximum size is 10MB." }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Parse file content
    let parseResult
    try {
      parseResult = parseFile(buffer, file.name)
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to parse file" },
        { status: 400 },
      )
    }

    // Get available agents
    const agents = await taskDistributionService.getAvailableAgents()
    if (agents.length === 0) {
      return NextResponse.json(
        { error: "No agents available. Please create agents before uploading tasks." },
        { status: 400 },
      )
    }

    // Upload file to Cloudinary
    let cloudinaryResult
    try {
      cloudinaryResult = await uploadToCloudinary(buffer, file.name)
    } catch (error) {
      return NextResponse.json({ error: "Failed to upload file to cloud storage" }, { status: 500 })
    }

    // Save upload record
    const uploadId = await taskDistributionService.saveUploadRecord({
      filename: cloudinaryResult.public_id,
      originalName: file.name,
      cloudinaryUrl: cloudinaryResult.secure_url,
      totalTasks: parseResult.totalTasks,
      uploadedBy: user._id,
    })

    // Distribute tasks among agents
    const distributionResult = taskDistributionService.distributeTasks(parseResult.tasks, agents, uploadId)

    // Save distributed tasks to database
    await taskDistributionService.saveTasks(distributionResult.distributedTasks)

    return NextResponse.json(
      {
        success: true,
        upload: {
          id: uploadId,
          filename: file.name,
          totalTasks: parseResult.totalTasks,
          cloudinaryUrl: cloudinaryResult.secure_url,
        },
        distribution: {
          totalTasks: distributionResult.totalTasks,
          agentTaskCounts: distributionResult.agentTaskCounts,
          agents: agents.map((agent) => ({
            ...agent,
            taskCount: distributionResult.agentTaskCounts[agent._id],
          })),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
