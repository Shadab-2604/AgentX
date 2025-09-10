"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { Search, Plus, Edit, Trash2, Loader2 } from "lucide-react"

interface SubAgent {
  _id: string
  name: string
  email: string
  mobile?: string
  active: boolean
  capacity?: number
  createdAt: string
  updatedAt: string
}

export function SubAgentsManager() {
  const { token } = useAuth()
  const [items, setItems] = useState<SubAgent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [showAdd, setShowAdd] = useState(false)
  const [editItem, setEditItem] = useState<SubAgent | null>(null)
  const [deleteItem, setDeleteItem] = useState<SubAgent | null>(null)

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({ page: String(page), limit: "10", ...(search && { search }) })
      const res = await fetch(`/api/subagents?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setItems(data.subAgents)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } catch (e) {
      console.error("Failed to fetch sub-agents", e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchItems()
  }, [token, page, search])

  const AddDialog = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [mobile, setMobile] = useState("")
    const [active, setActive] = useState(true)
    const [capacity, setCapacity] = useState<number | undefined>(undefined)
    const [submitting, setSubmitting] = useState(false)

    const submit = async () => {
      setSubmitting(true)
      try {
        const res = await fetch(`/api/subagents`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name, email, mobile, active, capacity }),
        })
        if (res.ok) {
          setShowAdd(false)
          fetchItems()
        }
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sub-Agent</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
            <div className="flex items-center gap-2">
              <Switch checked={active} onCheckedChange={setActive} />
              <span>Active</span>
            </div>
            <Input
              placeholder="Capacity (optional)"
              value={capacity ?? ""}
              onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <DialogFooter>
            <Button onClick={submit} disabled={submitting}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const EditDialog = () => {
    const [name, setName] = useState(editItem?.name ?? "")
    const [email, setEmail] = useState(editItem?.email ?? "")
    const [mobile, setMobile] = useState(editItem?.mobile ?? "")
    const [active, setActive] = useState(editItem?.active ?? true)
    const [capacity, setCapacity] = useState<number | undefined>(editItem?.capacity)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
      setName(editItem?.name ?? "")
      setEmail(editItem?.email ?? "")
      setMobile(editItem?.mobile ?? "")
      setActive(editItem?.active ?? true)
      setCapacity(editItem?.capacity)
    }, [editItem])

    const submit = async () => {
      if (!editItem) return
      setSubmitting(true)
      try {
        const res = await fetch(`/api/subagents/${editItem._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name, email, mobile, active, capacity }),
        })
        if (res.ok) {
          setEditItem(null)
          fetchItems()
        }
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Sub-Agent</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
            <div className="flex items-center gap-2">
              <Switch checked={active} onCheckedChange={setActive} />
              <span>Active</span>
            </div>
            <Input
              placeholder="Capacity (optional)"
              value={capacity ?? ""}
              onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <DialogFooter>
            <Button onClick={submit} disabled={submitting}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const DeleteDialog = () => {
    const [submitting, setSubmitting] = useState(false)

    const submit = async () => {
      if (!deleteItem) return
      setSubmitting(true)
      try {
        const res = await fetch(`/api/subagents/${deleteItem._id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          setDeleteItem(null)
          fetchItems()
        }
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <Dialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sub-Agent</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete {deleteItem?.name}?</p>
          <DialogFooter>
            <Button variant="destructive" onClick={submit} disabled={submitting}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sub-Agents ({total})</CardTitle>
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Sub-Agent
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search sub-agents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading sub-agents...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">No sub-agents found.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((s) => (
                    <TableRow key={s._id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>{s.mobile || "-"}</TableCell>
                      <TableCell>{s.active ? <Badge variant="secondary">Active</Badge> : <Badge variant="destructive">Inactive</Badge>}</TableCell>
                      <TableCell>{typeof s.capacity === "number" ? s.capacity : "∞"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setEditItem(s)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteItem(s)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddDialog />
      <EditDialog />
      <DeleteDialog />
    </div>
  )
}
