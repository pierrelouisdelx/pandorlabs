/** Sort direction accepted by every paginated backend endpoint. */
export type SortOrder = 'ASC' | 'DESC'

/** Query parameters accepted by every paginated backend endpoint. */
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: SortOrder
}

/** Envelope returned by every paginated backend endpoint. */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/** Envelope returned by non-paginated backend endpoints. */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
