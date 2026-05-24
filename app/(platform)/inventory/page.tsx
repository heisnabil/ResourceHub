"use client"

import { useState, useMemo, useEffect } from "react"
import { Package, Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { fetchInventory, createInventory } from "@/app/actions/inventory"
import { useServerAction } from "@/lib/hooks/use-server-action"
import { useAuth } from "@/lib/auth-context"
import { CATEGORY_LABELS, type InventoryCategory } from "@/types/erp"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { StockNumberInput } from "@/components/ui/stock-number-input"

export default function InventoryPage() {
  const { role } = useAuth()
  const canManage = role === "admin"
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const { data, loading, error, refresh } = useServerAction(
    () =>
      fetchInventory({
        search: search.trim() || undefined,
        category: categoryFilter === "all" ? undefined : categoryFilter,
      }),
    [search, categoryFilter]
  )

  const [showAdd, setShowAdd] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    itemName: "",
    description: "",
    category: "laptop" as InventoryCategory,
    totalStock: 0,
    minimumStock: 0,
  })

  const items = data?.items ?? []

  const stats = useMemo(() => ({
    total: items.length,
    inStock: items.filter((i) => i.availableStock > i.minimumStock).length,
    lowStock: items.filter((i) => i.isLowStock && i.availableStock > 0).length,
    outOfStock: items.filter((i) => i.availableStock === 0).length,
  }), [items])

  const handleCreate = async () => {
    if (!form.itemName.trim()) {
      toast.error("Item name is required")
      return
    }
    if (form.totalStock < 0 || form.minimumStock < 0) {
      toast.error("Stock values cannot be negative")
      return
    }
    setSubmitting(true)
    const result = await createInventory(form)
    setSubmitting(false)
    if (result.success) {
      toast.success("Inventory item created")
      setShowAdd(false)
      refresh()
    } else {
      toast.error(result.error)
    }
  }

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 sm:px-6 py-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="text-blue-500" /> Inventory</h1>
          <p className="text-sm text-zinc-500">Live stock from Supabase</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowAdd(true)} className="bg-blue-600 gap-2">
            <Plus className="size-4" /> Add Item
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Items", value: stats.total },
          { label: "Healthy Stock", value: stats.inStock },
          { label: "Low Stock", value: stats.lowStock },
          { label: "Out of Stock", value: stats.outOfStock },
        ].map((s) => (
          <div key={s.label} className="bg-[#0A0A0A] border border-white/5 rounded-xl p-4">
            <p className="text-[10px] text-zinc-500 uppercase font-bold">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{loading ? "—" : s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-[#0A0A0A] border-white/5" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-[#0A0A0A] border-white/5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl bg-white/5" />
      ) : items.length === 0 ? (
        <p className="text-center py-16 text-zinc-500">No inventory items found</p>
      ) : (
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl divide-y divide-white/5">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 items-center">
              <div className="md:col-span-2">
                <p className="font-medium">{item.itemName}</p>
                <p className="text-xs text-zinc-500 truncate">{item.description}</p>
              </div>
              <Badge variant="outline" className="w-fit border-white/5">{CATEGORY_LABELS[item.category]}</Badge>
              <div className="text-sm"><span className="text-zinc-500">Avail:</span> <strong>{item.availableStock}</strong> / {item.totalStock}</div>
              <div className="text-sm text-zinc-500">Min: {item.minimumStock}</div>
              {item.isLowStock ? (
                <Badge className="bg-orange-500/10 text-orange-400 border-none w-fit">Low Stock</Badge>
              ) : (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-none w-fit">OK</Badge>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={showAdd}
        onOpenChange={(open) => {
          setShowAdd(open)
          if (open) {
            setForm({
              itemName: "",
              description: "",
              category: "laptop",
              totalStock: 0,
              minimumStock: 0,
            })
          }
        }}
      >
        <DialogContent className="bg-[#0A0A0A] border-white/10">
          <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} className="bg-[#111] border-white/5 mt-1" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-[#111] border-white/5 mt-1" /></div>
            <div><Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as InventoryCategory })}>
                <SelectTrigger className="bg-[#111] border-white/5 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(CATEGORY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Total Stock</Label>
                <StockNumberInput
                  min={0}
                  value={form.totalStock}
                  onChange={(totalStock) => setForm({ ...form, totalStock })}
                  className="bg-[#111] border-white/5 mt-1"
                />
              </div>
              <div>
                <Label>Minimum Stock</Label>
                <StockNumberInput
                  min={0}
                  value={form.minimumStock}
                  onChange={(minimumStock) => setForm({ ...form, minimumStock })}
                  className="bg-[#111] border-white/5 mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>{submitting ? "Saving..." : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

