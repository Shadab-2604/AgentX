"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { Loader2, AlertTriangle } from "lucide-react"

interface Agent {
  _id: string
  name: string
  email: string
}

interface DeleteAgentDialogProps {
  agent: Agent
  open: boolean
  onOpenChange: (open: boolean) => void
  onAgentDeleted: () => void
}

export function DeleteAgentDialog({ agent, open, onOpenChange, onAgentDeleted }: DeleteAgentDialogProps) {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { token } = useAuth()

  const handleDelete = async () => {
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch(`/api/agents/${agent._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        onAgentDeleted()
      } else {
        setError(data.error || "Failed to delete agent")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Agent
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{agent.name}</strong>? This action cannot be undone and will remove
            all associated tasks.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Agent"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
