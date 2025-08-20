"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Download, FileText, Users, Upload } from "lucide-react"

interface ExportButtonProps {
  type: "agents" | "tasks" | "uploads"
  data?: any[]
}

export function ExportButton({ type, data }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { token } = useAuth()
  const { toast } = useToast()

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast({
        title: "Export Failed",
        description: "No data available to export",
        variant: "destructive",
      })
      return
    }

    const headers = Object.keys(data[0]).filter((key) => !key.startsWith("_"))
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            if (typeof value === "object" && value !== null) {
              return `"${JSON.stringify(value).replace(/"/g, '""')}"`
            }
            return `"${String(value).replace(/"/g, '""')}"`
          })
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export Successful",
      description: `${filename} exported successfully`,
    })
  }

  const handleExport = async (format: "csv" | "json") => {
    setIsExporting(true)

    try {
      if (data) {
        if (format === "csv") {
          exportToCSV(data, type)
        } else {
          const jsonContent = JSON.stringify(data, null, 2)
          const blob = new Blob([jsonContent], { type: "application/json" })
          const link = document.createElement("a")
          const url = URL.createObjectURL(blob)
          link.setAttribute("href", url)
          link.setAttribute("download", `${type}-${new Date().toISOString().split("T")[0]}.json`)
          link.style.visibility = "hidden"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          toast({
            title: "Export Successful",
            description: `${type} exported as JSON successfully`,
          })
        }
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting data",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getIcon = () => {
    switch (type) {
      case "agents":
        return Users
      case "tasks":
        return FileText
      case "uploads":
        return Upload
      default:
        return Download
    }
  }

  const Icon = getIcon()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          <Icon className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")}>
          <Download className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
