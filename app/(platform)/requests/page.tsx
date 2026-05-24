"use client"

import { useState, useEffect } from "react"
import { ClipboardList, Search, Plus, CheckCircle2, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  fetchRequests,
  fetchInventoryForRequest,
  createRequest,
  approveRequest,
  rejectRequest,
  uploadReceipt,
} from "@/app/actions/requests"
import { useServerAction } from "@/lib/hooks/use-server-action"
import { useAuth } from "@/lib/auth-context"
import { CATEGORY_LABELS } from "@/types/erp"
import { format } from "date-fns"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { StockNumberInput } from "@/components/ui/stock-number-input"

const statusStyles = {
  pending: "bg-amber-500/10 text-amber-500",
  approved: "bg-emerald-500/10 text-emerald-500",
  rejected: "bg-red-500/10 text-red-400",
} as const

export default function RequestsPage() {
  const { role } = useAuth()
  const canApprove = role === "admin" || role === "manager"
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")

  const { data, loading, error, refresh } = useServerAction(
    () => fetchRequests({ status: statusFilter }),
    [statusFilter]
  )

  const { data: inventoryOptions } = useServerAction(() => fetchInventoryForRequest(), [])

  const [showNew, setShowNew] = useState(false)
  const [itemId, setItemId] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [remarks, setRemarks] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  const requests = (data?.requests ?? []).filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.itemName.toLowerCase().includes(q) || r.employeeName.toLowerCase().includes(q)
  })

  const handleSubmit = async () => {
    if (!itemId) {
      toast.error("Select an item")
      return
    }
    setSubmitting(true)
    let attachmentPath: string | undefined
    if (file) {
      const fd = new FormData()
      fd.append("file", file)
      const upload = await uploadReceipt(fd)
      if (!upload.success) {
        toast.error(upload.error)
        setSubmitting(false)
        return
      }
      attachmentPath = upload.data.path
    }
    const result = await createRequest({ itemId, quantity, remarks, attachmentPath })
    setSubmitting(false)
    if (result.success) {
      toast.success("Request submitted")
      setShowNew(false)
      setItemId("")
      setRemarks("")
      setFile(null)
      refresh()
    } else {
      toast.error(result.error)
    }
  }

  const handleApprove = async (id: string) => {
    const result = await approveRequest(id)
    if (result.success) {
      toast.success("Request approved")
      refresh()
    } else toast.error(result.error)
  }

  const handleReject = async (id: string) => {
    const result = await rejectRequest(id)
    if (result.success) {
      toast.success("Request rejected")
      refresh()
    } else toast.error(result.error)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 sm:px-6 py-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardList className="text-blue-500" /> Requests</h1>
          <p className="text-sm text-zinc-500">{data?.total ?? 0} total requests</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="bg-blue-600 gap-2"><Plus className="size-4" /> New Request</Button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-[#0A0A0A] border-white/5" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-[#0A0A0A] border-white/5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl bg-white/5" />
      ) : requests.length === 0 ? (
        <p className="text-center py-16 text-zinc-500">No requests found</p>
      ) : (
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl divide-y divide-white/5">
          {requests.map((req) => (
            <div key={req.id} className="p-4 grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
              <div className="md:col-span-2">
                <p className="font-medium">{req.itemName}</p>
                <p className="text-xs text-zinc-500">{req.remarks}</p>
              </div>
              <Badge variant="outline" className="w-fit border-white/5">{CATEGORY_LABELS[req.itemCategory]}</Badge>
              <span className="text-sm">Qty: {req.quantity}</span>
              <Badge className={`w-fit border-none ${statusStyles[req.status]}`}>{req.status}</Badge>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-zinc-500">{format(new Date(req.createdAt), "MMM d")} · {req.employeeName}</span>
                {req.status === "pending" && canApprove && (
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => handleApprove(req.id)} className="h-7 bg-emerald-600"><CheckCircle2 className="size-3" /></Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(req.id)} className="h-7 border-red-500/30 text-red-400"><XCircle className="size-3" /></Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="bg-[#0A0A0A] border-white/10">
          <DialogHeader><DialogTitle>New Resource Request</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Item</Label>
              <Select value={itemId} onValueChange={setItemId}>
                <SelectTrigger className="bg-[#111] border-white/5 mt-1"><SelectValue placeholder="Select item" /></SelectTrigger>
                <SelectContent>
                  {(inventoryOptions ?? []).map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.itemName} ({item.availableStock} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantity</Label>
              <StockNumberInput
                min={1}
                value={quantity}
                onChange={setQuantity}
                className="bg-[#111] border-white/5 mt-1"
              />
            </div>
            <div>
              <Label>Remarks</Label>
              <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className="bg-[#111] border-white/5 mt-1" />
            </div>
            <div>
              <Label>Receipt (optional)</Label>
              <Input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="bg-[#111] border-white/5 mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
