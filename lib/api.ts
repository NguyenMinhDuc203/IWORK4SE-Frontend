const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export interface ApiResponse<T> {
  status: number
  message: string
  data: T
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback)
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null

    if (!refreshToken) {
      // No refresh token, redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
      return null
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(refreshToken),
    })

    if (!response.ok) {
      // Refresh failed, redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
        window.location.href = "/login"
      }
      return null
    }

    const data = await response.json()
    const newToken = data.data.token
    const newRefreshToken = data.data.refreshToken

    if (typeof window !== "undefined") {
      localStorage.setItem("token", newToken)
      localStorage.setItem("refreshToken", newRefreshToken)
    }

    return newToken
  } catch (error) {
    console.error("[v0] Token refresh failed:", error)
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      window.location.href = "/login"
    }
    return null
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  } else {
    delete headers["Content-Type"]
  }

  // Add timeout and better error handling
  const controller = new AbortController()
  // Increase timeout for specific endpoints that might take longer
  let timeoutDuration = 10000 // Default 10 seconds
  if (endpoint.includes("/api/ai-chat/")) {
    timeoutDuration = 30000 // 30 seconds for AI chat (Gemini API can be slow)
  } else if (endpoint.includes("/job-category/")) {
    timeoutDuration = 30000 // 30 seconds for job categories
  } else if (endpoint.includes("/job-post/") && options.method === "POST") {
    timeoutDuration = 45000 // 45 seconds for creating job posts
  } else if (endpoint.includes("/job-post/") && options.method === "PUT") {
    timeoutDuration = 30000 // 30 seconds for updating job posts
  }
  const timeoutId = setTimeout(() => controller.abort(), timeoutDuration)

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.status === 403) {
      const error = await response.json().catch(() => ({ message: "An error occurred" }))

      // Check if it's a JWT expired error
      if (error.message && error.message.includes("JWT expired")) {
        console.log("[v0] JWT expired, attempting to refresh token...")

        // If already refreshing, wait for the new token
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            subscribeTokenRefresh(async (newToken: string) => {
              // Retry the original request with new token
              const retryHeaders = {
                ...headers,
                Authorization: `Bearer ${newToken}`,
              }

              try {
                const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
                  ...options,
                  headers: retryHeaders,
                  signal: controller.signal,
                })

                if (!retryResponse.ok) {
                  const retryError = await retryResponse.json().catch(() => ({ message: "An error occurred" }))
                  reject(new ApiError(retryResponse.status, retryError.message || "An error occurred"))
                } else {
                  resolve(retryResponse.json())
                }
              } catch (err) {
                reject(err)
              }
            })
          })
        }

        // Start token refresh
        isRefreshing = true
        const newToken = await refreshAccessToken()
        isRefreshing = false

        if (newToken) {
          onTokenRefreshed(newToken)

          // Retry the original request with new token
          const retryHeaders = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          }

          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: retryHeaders,
            signal: controller.signal,
          })

          if (!retryResponse.ok) {
            const retryError = await retryResponse.json().catch(() => ({ message: "An error occurred" }))
            throw new ApiError(retryResponse.status, retryError.message || "An error occurred")
          }

          return retryResponse.json()
        }
      }

      throw new ApiError(response.status, error.message || "An error occurred")
    }

    if (!response.ok) {
      // Try parse JSON first
      let message = response.statusText || "An error occurred"
      try {
        const errJson = await response.json()
        // Common shapes: { message }, { error: { message } }, wrapped { status, message, data }
        message = errJson?.message || errJson?.error?.message || errJson?.data?.message || message
      } catch {
        // Fallback to raw text body if not JSON
        try {
          const text = await response.text()
          if (text) message = text
        } catch {
          // ignore
        }
      }
      throw new ApiError(response.status, message)
    }

    // Happy path
    return response.json()
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof ApiError) {
      throw error
    }

    // Handle network errors
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        let timeoutMsg = "Request timeout - Server không phản hồi"
        if (endpoint.includes("/api/ai-chat/")) {
          timeoutMsg = "Request timeout (30s) - AI đang xử lý, vui lòng thử lại sau."
        } else if (endpoint.includes("/job-category/")) {
          timeoutMsg = "Request timeout (30s) - Server không phản hồi. Vui lòng thử lại sau."
        } else if (endpoint.includes("/job-post/") && options.method === "POST") {
          timeoutMsg = "Request timeout (45s) - Tạo tin tuyển dụng mất quá nhiều thời gian. Vui lòng kiểm tra lại."
        } else if (endpoint.includes("/job-post/") && options.method === "PUT") {
          timeoutMsg = "Request timeout (30s) - Cập nhật tin tuyển dụng mất quá nhiều thời gian. Vui lòng thử lại."
        }
        throw new ApiError(408, timeoutMsg)
      }
      if (error.message.includes("Failed to fetch")) {
        throw new ApiError(0, "Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.")
      }
    }

    throw new ApiError(500, "Lỗi không xác định: " + (error as Error).message)
  }
}

// Types
export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  userName: string
  userType: "APPLICANT" | "EMPLOYER"
  status: "ACTIVE" | "INACTIVE" | "PENDING"
  createdAt: string
  updatedAt: string
}

export interface JobPost {
  id: string
  title: string
  description: string
  jobPosition: string
  location: string
  experience: string
  minSalary: number
  maxSalary: number
  postedDate: string
  closingDate: string
  vacancies: number
  jobStatus: "ACCEPTED" | "PENDING" | "REJECTED" | "EXPIRED"
  jobType: "INTERNSHIP" | "FRESHER" | "JUNIOR" | "SENIOR" | "MANAGER"
  updateAt: string
  employerId: string
  employerName: string
  companyName?: string
  logoUrl?: string
  categoryId: string
  categoryName: string
  searchableText?: string
}

export interface JobCategory {
  id: number
  categoryName: string
  description: string
  createAt: string
  updateAt: string
  jobPostCount?: number
}

export interface JobCategoryPageResponse {
  content: JobCategory[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalElements: number
}

export interface JobPostPageResponse {
  content: JobPost[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalElements: number
}

export interface PageMeta {
  pageNumber: number
  pageSize: number
  totalPages: number
  totalElements: number
}

export interface PageResponse<T> extends PageMeta {
  content: T[]
}

export const normalizePageResponse = <T,>(payload: any): PageResponse<T> => {
  const fallback: PageResponse<T> = {
    content: [],
    pageNumber: 0,
    pageSize: 0,
    totalPages: 0,
    totalElements: 0,
  }

  if (!payload) {
    return fallback
  }

  const data = (payload as any)?.data ?? payload

  if (Array.isArray(data?.content)) {
    return {
      content: data.content,
      pageNumber: data.pageNumber ?? data.page ?? 0,
      pageSize: data.pageSize ?? data.size ?? data.content.length ?? 0,
      totalPages: data.totalPages ?? data.totalPage ?? 1,
      totalElements: data.totalElements ?? data.total ?? data.content.length ?? 0,
    }
  }

  if (Array.isArray(data)) {
    return {
      content: data,
      pageNumber: 0,
      pageSize: data.length,
      totalPages: 1,
      totalElements: data.length,
    }
  }

  return {
    content: [],
    pageNumber: data?.pageNumber ?? data?.page ?? 0,
    pageSize: data?.pageSize ?? data?.size ?? 0,
    totalPages: data?.totalPages ?? data?.totalPage ?? 0,
    totalElements: data?.totalElements ?? data?.total ?? 0,
  }
}

export interface CV {
  id: string
  applicantId: string
  fileName: string
  url: string
  uploadedDate: string
}

export interface SavedJob {
  id: string
  applicantId: string
  jobPostId: string
  savedAt: string
}

export interface Employer {
  firstName: string
  lastName: string
  email: string
  address?: string
  birthday?: string
  phone?: string
  gender?: "MALE" | "FEMALE" | "OTHER"
  companyName: string
  location?: string
  industry?: string
  description?: string
  logoUrl?: string
}

export interface Certificate {
  certificateId: string
  certificateName: string
  issuingOrganization: string
  issueDate: string
  expirationDate?: string
  certificateUrl?: string
  notes?: string
}

export interface Applicant {
  id?: string
  userId?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  birthday: string
  gender: "MALE" | "FEMALE"
  careerObjective?: string
  yearsOfExperience: number
  skills: string[]
  certificates: Certificate[]
  universityName: string
  major: string
  degreeLevel: string
  graduationYear: number
  gpa: number
}

export interface ApplicantDocument {
  id: string
  firstName: string
  lastName: string
  email: string
  userName: string
  address: string
  birthday: string
  phone: string
  gender: "MALE" | "FEMALE"
  userStatus: "ACTIVE" | "INACTIVE" | "PENDING"
  createAt: string
  updateAt: string
  yearsOfExperience: number
  careerObjective: string
  universityName: string
  degreeLevel: string
  graduationYear: number
  gpa: number
  major: string
  skills: string[]
  certificateNames: string[]
  issuingOrganizations: string[]
  savedInListIds: string[]
  searchableText: string
}

export interface ApplicantSearchRequest {
  keywords?: string
  minExperience?: number
  minGpa?: number
  skill?: string
  major?: string
  university?: string
  gender?: "MALE" | "FEMALE"
  userStatus?: "ACTIVE" | "INACTIVE" | "PENDING"
  savedApplicantListId?: string
  page?: number
  size?: number
}

export interface ApplicantSearchResponse {
  content: ApplicantDocument[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalElements: number
}

// Saved Applicants / Lists
export interface SavedApplicantList {
  id: string
  listName: string
  description?: string
  isDefault: boolean
  applicantCount?: number
  createdDate?: string
}

export interface SavedApplicant {
  id: string
  listId: string
  applicantId: string
  isContacted: boolean
  notes?: string
  createdDate?: string
}

export interface Application {
  id: string
  applicantId: string
  applicantName: string
  jobId: string
  jobTitle: string
  jobPosition: string
  logoUrl: string
  companyName: string
  location: string
  minSalary: number
  maxSalary: number
  closingDate: string
  appliedDate: string
  status: "PENDING" | "VIEWED" | "APPROVED" | "REJECTED" | "WITHDRAWN"
  cvFileName: string
  cvId: string
  cvUrl: string
  updateAt: string
}

export const api = {
  // Authentication
  login: (credentials: {
    username: string
    password: string
    platform?: string
    versionApp?: string
    deviceToken?: string
  }) =>
    fetchApi<
      ApiResponse<{
        accessToken: string
        refreshToken: string
        role: string
        userId: string
        fullName: string
        email: string
        phone: string
      }>
    >("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  refreshToken: (refreshToken: string) =>
    fetchApi<ApiResponse<{ token: string; refreshToken: string }>>("/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify(refreshToken),
    }),

  logout: () =>
    fetchApi<ApiResponse<string>>("/auth/logout", {
      method: "POST",
    }),

  logoutAll: () =>
    fetchApi<ApiResponse<string>>("/auth/logout-all", {
      method: "POST",
    }),

  // User Management
  register: (data: {
    firstName: string
    lastName: string
    email: string
    userName: string
    password: string
    userType: "APPLICANT" | "EMPLOYER"
  }) =>
    fetchApi<ApiResponse<any>>("/user/sign-up", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  registerEmployer: (data: {
    firstName: string
    lastName: string
    email: string
    userName: string
    password: string
    phone: string
    companyName: string
    industry: string
    address: string
  }) =>
    fetchApi<ApiResponse<any>>("/user/sign-up/employer", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  changePassword: (data: {
    currentPassword: string
    newPassword: string
  }) =>
    fetchApi<ApiResponse<any>>("/user/change-pwd", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  confirmEmail: (email: string, secretCode: string) =>
    fetchApi<ApiResponse<any>>(`/user/confirm-email?email=${email}&secretCode=${secretCode}`),

  // Job Posts
  getJobs: (params?: {
    keyword?: string
    sort?: string
    page?: number
    size?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.keyword) queryParams.append("keyword", params.keyword)
    if (params?.sort) queryParams.append("sort", params.sort)
    if (params?.page !== undefined) queryParams.append("page", params.page.toString())
    if (params?.size !== undefined) queryParams.append("size", params.size.toString())

    return fetchApi<ApiResponse<JobPostPageResponse>>(`/job-post/?${queryParams.toString()}`)
  },

  getJobById: (id: string) => fetchApi<ApiResponse<JobPost>>(`/job-post/${id}`),

  getActiveJobs: (params?: {
    keyword?: string
    sort?: string
    page?: number
    size?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.keyword) queryParams.append("keyword", params.keyword)
    if (params?.sort) queryParams.append("sort", params.sort)
    if (params?.page !== undefined) queryParams.append("page", params.page.toString())
    if (params?.size !== undefined) queryParams.append("size", params.size.toString())

    return fetchApi<ApiResponse<JobPostPageResponse>>(`/job-post/active?${queryParams.toString()}`)
  },

  getJobsByEmployer: (employerId: string, page = 0, size = 10) =>
    fetchApi<ApiResponse<any>>(`/job-post/employer/${employerId}?page=${page}&size=${size}`),

  getJobsByStatus: (status: string, page = 0, size = 10) =>
    fetchApi<ApiResponse<any>>(`/job-post/status/${status}?page=${page}&size=${size}`),

  getJobsByType: (jobType: string, page = 0, size = 10) =>
    fetchApi<ApiResponse<any>>(`/job-post/type/${jobType}?page=${page}&size=${size}`),

  getJobsByLocation: (location: string, page = 0, size = 10) =>
    fetchApi<ApiResponse<any>>(`/job-post/location/${location}?page=${page}&size=${size}`),

  getJobsBySalaryRange: (minSalary: number, maxSalary: number, page = 0, size = 10) =>
    fetchApi<ApiResponse<any>>(
      `/job-post/salary-range?minSalary=${minSalary}&maxSalary=${maxSalary}&page=${page}&size=${size}`,
    ),

  getJobsByCategory: (categoryId: number, page = 0, size = 10) =>
    fetchApi<ApiResponse<any>>(`/job-post/category/${categoryId}?page=${page}&size=${size}`),

  searchJobs: (params: {
    keyword?: string
    status?: string
    jobType?: string
    location?: string
    minSalary?: number
    maxSalary?: number
    sort?: string
    page?: number
    size?: number
  }) => {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString())
      }
    })

    return fetchApi<ApiResponse<any>>(`/job-post/search?${queryParams.toString()}`)
  },

  createJobPost: (data: {
    title: string
    description: string
    jobPosition: string
    location: string
    experience: string
    minSalary: number
    maxSalary: number
    vacancies: number
    jobType: "INTERNSHIP" | "FRESHER" | "JUNIOR" | "SENIOR" | "MANAGER"
    employerId: string
    categoryId?: string
  }) =>
    fetchApi<ApiResponse<any>>("/job-post/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateJobPost: (data: {
    id: string
    employerId: string
    title: string
    description: string
    jobPosition: string
    location: string
    experience: string
    minSalary: number
    maxSalary: number
    vacancies: number
    jobType: "INTERNSHIP" | "FRESHER" | "JUNIOR" | "SENIOR" | "MANAGER"
    categoryId?: string
  }) =>
    fetchApi<ApiResponse<any>>("/job-post/update", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  updateJobPostStatus: (id: string, status: string) =>
    fetchApi<ApiResponse<any>>(`/job-post/${id}/status?status=${status}`, {
      method: "PUT",
    }),

  deleteJobPost: (id: string) =>
    fetchApi<ApiResponse<any>>(`/job-post/${id}`, {
      method: "DELETE",
    }),

  // Applications
  createApplication: (data: {
    jobId: string
    cvId: string
    applicantId: string
    coverLetter?: string
  }) =>
    fetchApi<ApiResponse<any>>("/application/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateApplication: (data: {
    id: string
    coverLetter?: string
  }) =>
    fetchApi<ApiResponse<any>>("/application/update", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getApplicationById: (id: string) => fetchApi<ApiResponse<Application>>(`/application/${id}`),

  getApplicationsByApplicant: (applicantId: string, page = 0, size = 10) =>
    fetchApi<ApiResponse<PageResponse<Application>>>(
      `/application/applicant/${applicantId}?page=${page}&size=${size}`,
      {
        method: "GET",
      },
    ),

  getApplicationsByJob: (jobId: string, page = 0, size = 10) =>
    fetchApi<ApiResponse<Application[]>>(`/application/job/${jobId}?page=${page}&size=${size}`),

  getApplicationsByEmployer: (
    employerId: string,
    pageOrOptions?: number | { page?: number; size?: number; status?: Application["status"] },
    size?: number,
  ) => {
    let page = 0
    let pageSize = 10
    let status: Application["status"] | undefined

    if (typeof pageOrOptions === "object") {
      page = pageOrOptions.page ?? 0
      pageSize = pageOrOptions.size ?? 10
      status = pageOrOptions.status
    } else {
      page = pageOrOptions ?? 0
      pageSize = size ?? 10
    }

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: pageSize.toString(),
    })

    if (status) {
      queryParams.append("status", status)
    }

    return fetchApi<ApiResponse<PageResponse<Application>>>(
      `/application/employer/${employerId}?${queryParams.toString()}`,
    )
  },

  getApplicationsByStatus: (status: string, page = 0, size = 10) =>
    fetchApi<ApiResponse<PageResponse<Application>>>(`/application/status/${status}?page=${page}&size=${size}`),

  updateApplicationStatus: (id: string, status: string) =>
    fetchApi<ApiResponse<any>>(`/application/${id}/status?status=${status}`, {
      method: "PUT",
    }),

  approveApplication: (id: string) =>
    fetchApi<ApiResponse<any>>(`/application/${id}/approve`, {
      method: "PUT",
    }),

  rejectApplication: (id: string) =>
    fetchApi<ApiResponse<any>>(`/application/${id}/reject`, {
      method: "PUT",
    }),

  withdrawApplication: (id: string) =>
    fetchApi<ApiResponse<any>>(`/application/${id}/withdraw`, {
      method: "PUT",
    }),

  hasApplicantApplied: (applicantId: string, jobId: string) =>
    fetchApi<ApiResponse<boolean>>(`/application/check?applicantId=${applicantId}&jobId=${jobId}`),

  deleteApplication: (id: string) =>
    fetchApi<ApiResponse<any>>(`/application/${id}`, {
      method: "DELETE",
    }),

  // CV Management
  uploadCV: (formData: FormData) =>
    fetchApi<ApiResponse<any>>("/cv/", {
      method: "POST",
      body: formData,
    }),

  getCVsByApplicant: (applicantId: string, page = 0, size = 10) =>
    fetchApi<ApiResponse<any>>(`/cv/applicant/${applicantId}?page=${page}&size=${size}`),

  updateCV: (data: {
    id: string
    fileName?: string
  }) =>
    fetchApi<ApiResponse<any>>("/cv/update", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteCV: (id: string) =>
    fetchApi<ApiResponse<any>>(`/cv/${id}`, {
      method: "DELETE",
    }),

  // Saved Jobs
  saveJob: (data: { jobPostId: string }) =>
    fetchApi<ApiResponse<any>>("/saved-job/save", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  toggleSaveJob: async (jobPostId: string) => {
    const applicantId = localStorage.getItem("userId")
    if (!applicantId) throw new Error("Missing applicantId in localStorage")

    const url = `/saved-job/toggle?applicantId=${applicantId}&jobId=${jobPostId}`

    return fetchApi<ApiResponse<any>>(url, {
      method: "POST",
    })
  },
  getSavedJobsByApplicant: ({
    applicantId,
    page = 0,
    size = 10,
  }: {
    applicantId: string
    page?: number
    size?: number
  }) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })

    const url = `/saved-job/applicant/${applicantId}?${queryParams.toString()}`

    return fetchApi<ApiResponse<any>>(url, {
      method: "GET",
    })
  },

  // getSavedJobsByApplicant: (applicantId: string, page = 0, size = 10) =>
  //   fetchApi<ApiResponse<any>>(`/saved-job/applicant/${applicantId}?page=${page}&size=${size}`),

  deleteSavedJob: (id: string) =>
    fetchApi<ApiResponse<any>>(`/saved-job/${id}`, {
      method: "DELETE",
    }),

  // Employer Management
  updateEmployer: (data: {
    id: string
    firstName: string
    lastName: string
    email: string
    address?: string
    birthday?: string
    phone?: string
    gender?: "MALE" | "FEMALE" | "OTHER"
    companyName: string
    location?: string
    industry?: string
    description?: string
    logoUrl?: string
  }) =>
    fetchApi<ApiResponse<any>>("/employer/update", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getEmployerById: (id: string) => fetchApi<ApiResponse<Employer>>(`/employer/${id}`),

  getAllEmployers: (params?: {
    keyword?: string
    sort?: string
    page?: number
    size?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.keyword) queryParams.append("keyword", params.keyword)
    if (params?.sort) queryParams.append("sort", params.sort)
    if (params?.page !== undefined) queryParams.append("page", params.page.toString())
    if (params?.size !== undefined) queryParams.append("size", params.size.toString())

    return fetchApi<ApiResponse<any>>(`/employer/list?${queryParams.toString()}`)
  },

  // Alternative endpoint for getting all employers
  getAllEmployersAlt: (params?: {
    keyword?: string
    sort?: string
    page?: number
    size?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.keyword) queryParams.append("keyword", params.keyword)
    if (params?.sort) queryParams.append("sort", params.sort)
    if (params?.page !== undefined) queryParams.append("page", params.page.toString())
    if (params?.size !== undefined) queryParams.append("size", params.size.toString())

    return fetchApi<ApiResponse<any>>(`/employer?${queryParams.toString()}`)
  },

  deleteEmployer: (id: string) =>
    fetchApi<ApiResponse<any>>(`/employer/del/${id}`, {
      method: "DELETE",
    }),

  // Update employer status
  updateEmployerStatus: (id: string, status: "ACTIVE" | "INACTIVE" | "BANNED" | "DELETED") =>
    fetchApi<ApiResponse<any>>(`/employer/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  // Get employer statistics
  getEmployerStatistics: (id: string) => fetchApi<ApiResponse<any>>(`/employer/${id}/statistics`),

  // Applicant Management
  updateApplicant: (data: Applicant) =>
    fetchApi<ApiResponse<any>>("/applicant/update", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getApplicantById: (id: string) => fetchApi<ApiResponse<Applicant>>(`/applicant/${id}`),

  getAllApplicants: (params?: {
    keyword?: string
    sort?: string
    page?: number
    size?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.keyword) queryParams.append("keyword", params.keyword)
    if (params?.sort) queryParams.append("sort", params.sort)
    if (params?.page !== undefined) queryParams.append("page", params.page.toString())
    if (params?.size !== undefined) queryParams.append("size", params.size.toString())

    return fetchApi<ApiResponse<any>>(`/applicant/list?${queryParams.toString()}`)
  },

  // Alternative endpoint for getting all applicants
  getAllApplicantsAlt: (params?: {
    keyword?: string
    sort?: string
    page?: number
    size?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.keyword) queryParams.append("keyword", params.keyword)
    if (params?.sort) queryParams.append("sort", params.sort)
    if (params?.page !== undefined) queryParams.append("page", params.page.toString())
    if (params?.size !== undefined) queryParams.append("size", params.size.toString())

    return fetchApi<ApiResponse<any>>(`/applicant?${queryParams.toString()}`)
  },

  deleteApplicant: (id: string) =>
    fetchApi<ApiResponse<any>>(`/applicant/del/${id}`, {
      method: "DELETE",
    }),

  // Update applicant status
  updateApplicantStatus: (id: string, status: "ACTIVE" | "INACTIVE" | "BANNED" | "DELETED") =>
    fetchApi<ApiResponse<any>>(`/applicant/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  // Get applicant statistics
  getApplicantStatistics: (id: string) => fetchApi<ApiResponse<any>>(`/applicant/${id}/statistics`),

  // Job Categories
  getJobCategories: (params?: {
    keyword?: string
    sort?: string
    page?: number
    size?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.keyword) queryParams.append("keyword", params.keyword)
    if (params?.sort) queryParams.append("sort", params.sort)
    if (params?.page !== undefined) queryParams.append("page", params.page.toString())
    if (params?.size !== undefined) queryParams.append("size", params.size.toString())

    return fetchApi<ApiResponse<JobCategoryPageResponse>>(`/job-category/?${queryParams.toString()}`)
  },

  getAllJobCategories: () => fetchApi<ApiResponse<JobCategory[]>>("/job-category/all"),

  getJobCategoryById: (id: number) => fetchApi<ApiResponse<JobCategory>>(`/job-category/${id}`),

  getJobCategoryByName: (name: string) => fetchApi<ApiResponse<JobCategory>>(`/job-category/exact-name/${name}`),

  // Enhanced Job Posts with Categories
  getJobsByCategoryId: (categoryId: number, page = 0, size = 10) =>
    fetchApi<ApiResponse<JobPostPageResponse>>(`/job-post/category/${categoryId}?page=${page}&size=${size}`),

  // Enhanced Search with Categories
  searchJobsWithCategory: (params: {
    keyword?: string
    categoryId?: number
    status?: string
    jobType?: string
    location?: string
    minSalary?: number
    maxSalary?: number
    sort?: string
    page?: number
    size?: number
  }) => {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString())
      }
    })

    return fetchApi<ApiResponse<JobPostPageResponse>>(`/job-post/search?${queryParams.toString()}`)
  },

  searchJobPosts: (params: {
    keywords?: string
    jobStatus?: "ACCEPTED" | "PENDING" | "REJECTED" | "EXPIRED"
    jobType?: "INTERNSHIP" | "FRESHER" | "JUNIOR" | "SENIOR" | "MANAGER"
    location?: string
    minSalary?: number
    maxSalary?: number
    experience?: string
    categoryId?: number
    employerId?: string
    postedAfter?: string
    closingBefore?: string
    page?: number
    size?: number
  }) => {
    // Lọc bỏ các field null/undefined/chuỗi rỗng để tránh gửi dữ liệu thừa
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== ""),
    )

    return fetchApi<ApiResponse<JobPostPageResponse>>(`/search/job-posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filteredParams),
    })
  },

  // Applicant Search APIs
  searchApplicants: (params: ApplicantSearchRequest) => {
    // Lọc bỏ các field null/undefined/chuỗi rỗng để tránh gửi dữ liệu thừa
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== ""),
    )

    // Backend trả về trực tiếp Spring Boot Page object, không có ApiResponse wrapper
    return fetch(`${API_BASE_URL}/search/applicants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(filteredParams),
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    })
  },

  searchApplicantsByKeywords: (keywords: string, page = 0, size = 20) => {
    const queryParams = new URLSearchParams({
      keywords,
      page: page.toString(),
      size: size.toString(),
    })

    return fetchApi<ApiResponse<ApplicantSearchResponse>>(`/search/applicants/keywords?${queryParams.toString()}`)
  },

  // Saved Applicant Lists
  createApplicantList: (data: { employerId: string; listName: string; description?: string }) =>
    fetchApi<ApiResponse<SavedApplicantList>>("/saved-applicant-list/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getApplicantListsByEmployer: (employerId: string) =>
    fetchApi<ApiResponse<SavedApplicantList[]>>(`/saved-applicant-list/employer/${employerId}`),

  getApplicantListById: (listId: string) =>
    fetchApi<ApiResponse<SavedApplicantList>>(`/saved-applicant-list/${listId}`),

  deleteApplicantList: (listId: string) =>
    fetchApi<ApiResponse<any>>(`/saved-applicant-list/${listId}`, { method: "DELETE" }),

  // Saved Applicants
  saveApplicantToList: (data: { listId: string; applicantId: string; notes?: string }) =>
    fetchApi<ApiResponse<any>>("/saved-applicant/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getApplicantsInList: (listId: string, page = 0, size = 20) =>
    fetchApi<ApiResponse<any>>(`/saved-applicant/list/${listId}?page=${page}&size=${size}`),

  removeApplicantFromList: (savedApplicantId: string) =>
    fetchApi<ApiResponse<any>>(`/saved-applicant/${savedApplicantId}`, { method: "DELETE" }),

  isApplicantSavedInList: (listId: string, applicantId: string) =>
    fetchApi<ApiResponse<boolean>>(`/saved-applicant/check?listId=${listId}&applicantId=${applicantId}`),

  updateSavedApplicantContactStatus: (savedApplicantId: string, isContacted: boolean) =>
    fetchApi<ApiResponse<any>>(`/saved-applicant/${savedApplicantId}/contact-status?isContacted=${isContacted}`, {
      method: "PUT",
    }),

  getAllSavedApplicantsByEmployer: (employerId: string, page = 0, size = 10) =>
    fetchApi<ApiResponse<any>>(`/saved-applicant/employer/${employerId}?page=${page}&size=${size}`),

  getApplicantsByListAndContactStatus: (listId: string, isContacted: boolean, page = 0, size = 10) =>
    fetchApi<ApiResponse<any>>(
      `/saved-applicant/list/${listId}/contact-status?isContacted=${isContacted}&page=${page}&size=${size}`,
    ),

  // Message/Chat APIs
  sendMessage: (data: { receiverId: string; content: string }) =>
    fetchApi<ApiResponse<any>>("/messages/send", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  sendImageMessage: (receiverId: string, file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("receiverId", receiverId)
    return fetchApi<ApiResponse<any>>("/messages/send-image", {
      method: "POST",
      body: formData,
    })
  },

  getConversationMessages: (conversationId: number, page = 0, size = 20) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })
    // Backend returns Page<MessageResponse> directly, not wrapped in ApiResponse
    return fetchApi<any>(`/messages/conversation/${conversationId}?${queryParams.toString()}`)
  },

  getUserConversations: (page = 0, size = 10) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })
    return fetchApi<ApiResponse<any>>(`/messages/conversations?${queryParams.toString()}`)
  },

  getActiveConversations: () => fetchApi<any[]>("/messages/conversations/active"),

  markMessagesAsRead: async (conversationId: number) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/messages/conversation/${conversationId}/mark-as-read`, {
      method: "PUT",
      headers,
    })

    // 204 No Content - no body to parse
    if (response.status === 204 || response.status === 200) {
      return null
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Failed to mark messages as read")
      throw new ApiError(response.status, errorText)
    }

    return null
  },

  getUnreadMessageCount: () => fetchApi<ApiResponse<number>>("/messages/unread-count"),

  deleteMessage: (messageId: number) =>
    fetchApi<ApiResponse<any>>(`/messages/${messageId}`, {
      method: "DELETE",
    }),

  getAdminAndEmployerUsers: (keyword?: string) => {
    const queryParams = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ""
    return fetchApi<any[]>(`/messages/users/admin-employer${queryParams}`)
  },

  // AI Chat APIs
  sendAIMessage: (message: string, conversationHistory?: string) =>
    fetchApi<AIChatResponse | ApiResponse<AIChatResponse>>("/api/ai-chat/send", {
      method: "POST",
      body: JSON.stringify({ message, conversationHistory }),
    }),

  // Notification APIs
  getNotifications: (page = 0, size = 20) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })
    return fetchApi<ApiResponse<NotificationPageResponse>>(`/notification/search?${queryParams.toString()}`)
  },

  getNotificationsByUser: (userId: string, page = 0, size = 20) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })
    return fetchApi<ApiResponse<NotificationPageResponse>>(`/notification/user/${userId}?${queryParams.toString()}`)
  },

  getNotificationById: (id: string) => fetchApi<ApiResponse<NotificationResponse>>(`/notification/${id}`),

  deleteNotification: (id: string) =>
    fetchApi<ApiResponse<any>>(`/notification/${id}`, {
      method: "DELETE",
    }),

  getUnreadNotificationCount: () => {
    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
    if (!userId) {
      return Promise.resolve({ status: 200, message: "OK", data: 0 })
    }
    // Use total count as unread count for now (can be enhanced later with isRead field)
    return fetchApi<ApiResponse<number>>(`/notification/user/${userId}/count`)
  },

  // Fetch distinct companies
  getDistinctCompanies: () =>
    fetchApi<
      ApiResponse<
        Array<{
          companyName: string
          industry: string
          location: string
          logoUrl: string
          description: string
        }>
      >
    >("/employer/companies"),
  // Fetch company details by name
    getCompanyDetailByName: (companyName: string) =>
    fetchApi<
      ApiResponse<{
        companyName: string
        industry: string
        location: string
        logoUrl: string
        description: string
        employers: Array<{
          id: string
          firstName: string
          lastName: string
          email: string
          phone: string
          companyName: string
          location: string
          industry: string
          description: string
          logoUrl: string
          userStatus: string
          jobPosts: JobPost[]
        }>
        totalEmployers: number
        totalJobPosts: number
      }>
    >(`/employer/company-detail?companyName=${encodeURIComponent(companyName)}`),

}


// Message types
export interface MessageResponse {
  id: number
  conversationId: number
  senderId: string
  senderName: string
  receiverId: string
  content?: string
  imageUrl?: string
  messageType: "TEXT" | "IMAGE"
  sentAt: string
  isRead: boolean
}

export interface ConversationResponse {
  id: number
  user1Id: string
  user1Name: string
  user2Id: string
  user2Name: string
  lastMessageTime: string
  unreadCount: number
  isActive: boolean
}

// AI Chat types
export interface AIChatResponse {
  response: string
  conversationHistory?: string
}

// Notification types
export interface NotificationResponse {
  id: string
  userId: string
  userName: string
  applicationId?: string
  type: string
  message: string
  createdAt: string
}

export interface NotificationPageResponse {
  content: NotificationResponse[]
  page: number
  size: number
  totalPages: number
  totalElements: number
}
