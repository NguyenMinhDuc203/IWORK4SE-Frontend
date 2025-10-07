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

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  // Add timeout and better error handling
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "An error occurred" }))
      throw new ApiError(response.status, error.message || "An error occurred")
    }

    return response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof ApiError) {
      throw error
    }
    
    // Handle network errors
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError(408, "Request timeout - Server không phản hồi")
      }
      if (error.message.includes('Failed to fetch')) {
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
  jobType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP"
  updateAt: string
  employerId: string
  employerName: string
  categoryId: string
  categoryName: string
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

export interface CV {
  id: string
  applicantId: string
  fileName: string
  filePath: string
  uploadedAt: string
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

export interface Applicant {
  id: string
  userId: string
  phoneNumber?: string
  address?: string
  dateOfBirth?: string
  gender?: "MALE" | "FEMALE" | "OTHER"
  experience?: string
  skills?: string
  education?: string
}

export const api = {
  // Authentication
  login: (credentials: { username: string; password: string; platform?: string }) =>
    fetchApi<ApiResponse<{ accessToken: string; refreshToken: string }>>("/auth/login", {
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

  getJobById: (id: string) => 
    fetchApi<ApiResponse<JobPost>>(`/job-post/${id}`),

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
    fetchApi<ApiResponse<any>>(`/job-post/salary-range?minSalary=${minSalary}&maxSalary=${maxSalary}&page=${page}&size=${size}`),

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
    requirements: string
    responsibilities: string
    location: string
    salary: number
    jobType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP"
    categoryId: number
  }) =>
    fetchApi<ApiResponse<any>>("/job-post/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateJobPost: (data: {
    id: string
    title?: string
    description?: string
    requirements?: string
    responsibilities?: string
    location?: string
    salary?: number
    jobType?: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP"
    status?: "ACTIVE" | "INACTIVE" | "EXPIRED"
    categoryId?: number
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
    jobPostId: string
    cvId: string
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

  getApplicationById: (id: string) =>
    fetchApi<ApiResponse<any>>(`/application/${id}`),

  getApplicationsByApplicant: (applicantId: string, page = 0, size = 10) =>
    fetchApi<ApiResponse<any>>(`/application/applicant/${applicantId}?page=${page}&size=${size}`),

  getApplicationsByJob: (jobId: string, page = 0, size = 10) =>
    fetchApi<ApiResponse<any>>(`/application/job/${jobId}?page=${page}&size=${size}`),

  getApplicationsByEmployer: (employerId: string, page = 0, size = 10) =>
    fetchApi<ApiResponse<any>>(`/application/employer/${employerId}?page=${page}&size=${size}`),

  getApplicationsByStatus: (status: string, page = 0, size = 10) =>
    fetchApi<ApiResponse<any>>(`/application/status/${status}?page=${page}&size=${size}`),

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
    fetchApi<ApiResponse<any>>("/cv/upload", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
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

  getSavedJobsByApplicant: (applicantId: string, page = 0, size = 10) =>
    fetchApi<ApiResponse<any>>(`/saved-job/applicant/${applicantId}?page=${page}&size=${size}`),

  deleteSavedJob: (id: string) =>
    fetchApi<ApiResponse<any>>(`/saved-job/${id}`, {
      method: "DELETE",
    }),

  // Employer Management
  updateEmployer: (data: {
    userId: string
    companyName?: string
    companyDescription?: string
    website?: string
    phoneNumber?: string
    address?: string
    industry?: string
    companySize?: string
  }) =>
    fetchApi<ApiResponse<any>>("/employer/update", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getEmployerById: (id: string) =>
    fetchApi<ApiResponse<Employer>>(`/employer/${id}`),

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

  deleteEmployer: (id: string) =>
    fetchApi<ApiResponse<any>>(`/employer/del/${id}`, {
      method: "DELETE",
    }),

  // Applicant Management
  updateApplicant: (data: {
    userId: string
    phoneNumber?: string
    address?: string
    dateOfBirth?: string
    gender?: "MALE" | "FEMALE" | "OTHER"
    experience?: string
    skills?: string
    education?: string
  }) =>
    fetchApi<ApiResponse<any>>("/applicant/update", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getApplicantById: (id: string) =>
    fetchApi<ApiResponse<Applicant>>(`/applicant/${id}`),

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

  deleteApplicant: (id: string) =>
    fetchApi<ApiResponse<any>>(`/applicant/del/${id}`, {
      method: "DELETE",
    }),

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

  getAllJobCategories: () =>
    fetchApi<ApiResponse<JobCategory[]>>("/job-category/all"),

  getJobCategoryById: (id: number) =>
    fetchApi<ApiResponse<JobCategory>>(`/job-category/${id}`),

  getJobCategoryByName: (name: string) =>
    fetchApi<ApiResponse<JobCategory>>(`/job-category/exact-name/${name}`),

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
}
