export type UserRole = 'employee' | 'manager' | 'admin'

export type InventoryCategory =
  | 'laptop'
  | 'monitor'
  | 'software_license'
  | 'desktop'
  | 'accessories'

export type RequestStatus = 'pending' | 'approved' | 'rejected'

export interface Profile {
  id: string
  name: string
  email: string
  avatar: string | null
  department: string | null
  role: UserRole
  createdAt: string
}

export interface InventoryItem {
  id: string
  itemName: string
  description: string | null
  category: InventoryCategory
  totalStock: number
  availableStock: number
  minimumStock: number
  createdBy: string | null
  createdAt: string
  isLowStock: boolean
}

export interface ResourceRequest {
  id: string
  employeeId: string
  employeeName: string
  employeeEmail: string
  itemId: string
  itemName: string
  itemCategory: InventoryCategory
  quantity: number
  status: RequestStatus
  attachmentPath: string | null
  remarks: string | null
  approvedBy: string | null
  approverName: string | null
  createdAt: string
}

export interface ActivityLog {
  id: string
  userId: string | null
  userName: string | null
  action: string
  metadata: Record<string, unknown>
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface DashboardStats {
  pendingRequests: number
  approvedRequests: number
  inventoryCount: number
  lowStockCount: number
}

export interface MonthlyStats {
  month: string
  submitted: number
  approved: number
  rejected: number
}

export interface CategoryUsage {
  category: InventoryCategory
  count: number
}

export interface MonthlyReportData {
  periodDays: number
  totalRequests: number
  approved: number
  rejected: number
  pending: number
  approvalRate: number
  inventoryUsage: CategoryUsage[]
  topRequestedItems: { itemName: string; count: number }[]
  generatedAt: string
}

export interface MonthlyReport {
  id: string
  generatedBy: string
  generatorName: string
  reportData: MonthlyReportData
  createdAt: string
}

export const CATEGORY_LABELS: Record<InventoryCategory, string> = {
  laptop: 'Laptop',
  monitor: 'Monitor',
  software_license: 'Software License',
  desktop: 'Desktop',
  accessories: 'Accessories',
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }
