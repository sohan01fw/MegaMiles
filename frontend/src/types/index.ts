export type ApiError = {
  message: string
  status: number
  errors?: Record<string, string[]>
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}
