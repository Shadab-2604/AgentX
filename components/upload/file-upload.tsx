"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/lib/auth-context"
import { Upload, FileText, CheckCircle, AlertCircle, Eye, X } from "lucide-react"

interface UploadResult {
  success: boolean
  upload?: {
    id: string
    filename: string
    totalTasks: number
    cloudinaryUrl: string
  }
  distribution?: {
    totalTasks: number
    agentTaskCounts: Record<string, number>
    agents: Array<{
      _id: string
      name: string
      email: string
      taskCount: number
    }>
  }
  error?: string
}

interface FilePreview {
  file: File
  data: Array<Record<string, any>>
  totalRows: number
}

export function FileUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null)
  const [error, setError] = useState("")
  const { token } = useAuth()

  const parseFileForPreview = async (file: File): Promise<Array<Record<string, any>>> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          if (file.name.endsWith(".csv")) {
            const lines = text.split("\n").filter((line) => line.trim())
            const headers = lines[0].split(",").map((h) => h.trim())
            const data = lines.slice(1, 6).map((line) => {
              const values = line.split(",")
              const row: Record<string, any> = {}
              headers.forEach((header, index) => {
                row[header] = values[index]?.trim() || ""
              })
              return row
            })
            resolve(data)
          } else {
            // For XLS/XLSX, show basic file info
            resolve([
              {
                "File Name": file.name,
                "File Size": `${(file.size / 1024).toFixed(2)} KB`,
                "File Type": file.type || "Excel File",
                Note: "Excel files will be processed after upload",
              },
            ])
          }
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsText(file)
    })
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setError("")
    setUploadResult(null)

    try {
      const previewData = await parseFileForPreview(file)
      setFilePreview({
        file,
        data: previewData,
        totalRows: file.name.endsWith(".csv")
          ? file.size / 50
          : // Rough estimate for CSV
            100, // Default estimate for Excel
      })
    } catch (error) {
      setError("Failed to preview file. Please check the file format.")
    }
  }, [])

  const confirmUpload = async () => {
    if (!filePreview) return

    setIsUploading(true)
    setUploadProgress(0)
    setError("")

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const formData = new FormData()
      formData.append("file", filePreview.file)

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()

      if (response.ok) {
        setUploadResult(data)
        setFilePreview(null)
      } else {
        setError(data.error || "Upload failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading || !!filePreview,
  })

  const resetUpload = () => {
    setUploadResult(null)
    setFilePreview(null)
    setError("")
    setUploadProgress(0)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Task File</CardTitle>
          <CardDescription>
            Upload CSV, XLS, or XLSX files to automatically distribute tasks among your agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!uploadResult && !filePreview && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : isUploading
                    ? "border-muted bg-muted/50 cursor-not-allowed"
                    : "border-border hover:border-primary hover:bg-primary/5"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                {isDragActive ? (
                  <p className="text-lg font-medium">Drop the file here...</p>
                ) : (
                  <>
                    <div>
                      <p className="text-lg font-medium">Drag & drop your file here</p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                    </div>
                    <Button variant="outline" disabled={isUploading}>
                      Choose File
                    </Button>
                  </>
                )}
                <div className="text-xs text-muted-foreground">Supported formats: CSV, XLS, XLSX (max 10MB)</div>
              </div>
            </div>
          )}

          {filePreview && !isUploading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <span className="font-medium">File Preview: {filePreview.file.name}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={resetUpload}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(filePreview.data[0] || {}).map((header) => (
                        <TableHead key={header}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filePreview.data.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <TableCell key={cellIndex} className="max-w-xs truncate">
                            {String(value)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">
                  Estimated {Math.floor(filePreview.totalRows)} rows will be processed and distributed among agents
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetUpload}>
                    Cancel
                  </Button>
                  <Button onClick={confirmUpload} className="bg-primary hover:bg-primary/90">
                    Confirm Upload
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-medium">Uploading and processing file...</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {uploadProgress < 90 ? "Uploading file..." : "Processing and distributing tasks..."}
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {fileRejections.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {fileRejections[0].errors[0].message}. Please upload a valid CSV, XLS, or XLSX file under 10MB.
              </AlertDescription>
            </Alert>
          )}

          {uploadResult?.success && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  File uploaded successfully! {uploadResult.upload?.totalTasks} tasks have been distributed among{" "}
                  {uploadResult.distribution?.agents.length} agents.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Upload Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">File:</span>
                      <span className="text-sm font-medium">{uploadResult.upload?.filename}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Tasks:</span>
                      <span className="text-sm font-medium">{uploadResult.upload?.totalTasks}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Task Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {uploadResult.distribution?.agents.map((agent) => (
                        <div key={agent._id} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{agent.name}</span>
                          <span className="text-sm text-muted-foreground">{agent.taskCount} tasks</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2">
                <Button onClick={resetUpload} variant="outline">
                  Upload Another File
                </Button>
                <Button asChild>
                  <a href="/dashboard/tasks">View Tasks</a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
