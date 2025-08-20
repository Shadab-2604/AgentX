"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, CheckCircle, X, Eye, Users, BarChart3 } from "lucide-react"

interface FilePreview {
  name: string
  size: number
  type: string
  data: any[]
  headers: string[]
}

interface UploadResult {
  success: boolean
  message: string
  uploadId?: string
  tasksCreated?: number
  distribution?: { [agentId: string]: number }
}

export function EnhancedFileUpload() {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<FilePreview[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedPreview, setSelectedPreview] = useState<FilePreview | null>(null)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const { token } = useAuth()
  const { toast } = useToast()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles(acceptedFiles)

      // Generate previews for each file
      const newPreviews: FilePreview[] = []

      for (const file of acceptedFiles) {
        try {
          const preview = await generateFilePreview(file)
          newPreviews.push(preview)
        } catch (error) {
          toast({
            title: "Preview Error",
            description: `Failed to preview ${file.name}`,
            variant: "destructive",
          })
        }
      }

      setPreviews(newPreviews)
      if (newPreviews.length > 0) {
        setShowPreview(true)
      }
    },
    [toast],
  )

  const generateFilePreview = async (file: File): Promise<FilePreview> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          let data: any[] = []
          let headers: string[] = []

          if (file.type === "text/csv" || file.name.endsWith(".csv")) {
            const text = e.target?.result as string
            const lines = text.split("\n").filter((line) => line.trim())
            if (lines.length > 0) {
              headers = lines[0].split(",").map((h) => h.trim())
              data = lines.slice(1, 6).map((line) => {
                const values = line.split(",").map((v) => v.trim())
                const row: any = {}
                headers.forEach((header, index) => {
                  row[header] = values[index] || ""
                })
                return row
              })
            }
          } else {
            // For Excel files, we'll show a simplified preview
            headers = ["Column A", "Column B", "Column C", "Column D"]
            data = [{ "Column A": "Sample data will be processed...", "Column B": "", "Column C": "", "Column D": "" }]
          }

          resolve({
            name: file.name,
            size: file.size,
            type: file.type,
            data: data.slice(0, 5), // Show only first 5 rows
            headers,
          })
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsText(file)
    })
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          setUploadResult(result)
          setUploadProgress(((i + 1) / files.length) * 100)

          toast({
            title: "Upload Successful",
            description: `${file.name} uploaded and ${result.tasksCreated} tasks created`,
          })
        } else {
          throw new Error(`Failed to upload ${file.name}`)
        }
      }

      // Clear files after successful upload
      setFiles([])
      setPreviews([])
      setShowPreview(false)
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Upload failed",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            File Upload & Task Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-lg">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">Drag & drop files here, or click to select</p>
                <p className="text-sm text-muted-foreground">Supports CSV, XLS, XLSX files up to 10MB each</p>
              </div>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="font-medium">Selected Files:</h3>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPreview(previews[index])
                        setShowPreview(true)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newFiles = files.filter((_, i) => i !== index)
                        const newPreviews = previews.filter((_, i) => i !== index)
                        setFiles(newFiles)
                        setPreviews(newPreviews)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm text-muted-foreground">{uploadProgress.toFixed(0)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Upload Button */}
          {files.length > 0 && !isUploading && (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleUpload} className="flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                Upload & Distribute Tasks
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Result */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Upload Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{uploadResult.tasksCreated}</p>
                  <p className="text-sm text-muted-foreground">Tasks Created</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-accent" />
                <div>
                  <p className="font-medium">{Object.keys(uploadResult.distribution || {}).length}</p>
                  <p className="text-sm text-muted-foreground">Agents Assigned</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Equal</p>
                  <p className="text-sm text-muted-foreground">Distribution</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>File Preview: {selectedPreview?.name}</DialogTitle>
          </DialogHeader>
          {selectedPreview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">{formatFileSize(selectedPreview.size)}</Badge>
                  <Badge variant="outline">{selectedPreview.headers.length} columns</Badge>
                  <Badge variant="outline">{selectedPreview.data.length}+ rows</Badge>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {selectedPreview.headers.map((header, index) => (
                        <TableHead key={index}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPreview.data.map((row, index) => (
                      <TableRow key={index}>
                        {selectedPreview.headers.map((header, cellIndex) => (
                          <TableCell key={cellIndex}>{row[header]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <p className="text-sm text-muted-foreground">
                Showing first 5 rows. Full file will be processed during upload.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
