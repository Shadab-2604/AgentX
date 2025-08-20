import { ProtectedRoute } from "@/components/layout/protected-route"
import { Sidebar } from "@/components/layout/sidebar"
import { EnhancedFileUpload } from "@/components/upload/enhanced-file-upload"
import { UploadHistory } from "@/components/upload/upload-history"

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <Sidebar>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">File Upload</h1>
            <p className="text-muted-foreground">Upload CSV, XLS, or XLSX files to distribute tasks among agents</p>
          </div>

          <EnhancedFileUpload />

          <UploadHistory />
        </div>
      </Sidebar>
    </ProtectedRoute>
  )
}
