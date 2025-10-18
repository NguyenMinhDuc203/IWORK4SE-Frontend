"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { api } from "@/lib/api"

interface SavedJobsContextType {
  savedJobIds: Set<string>
  isSaved: (jobId: string) => boolean
  toggleSaveJob: (jobId: string) => Promise<void>
  refreshSavedJobs: () => Promise<void>
  isLoading: boolean
}

const SavedJobsContext = createContext<SavedJobsContextType | undefined>(undefined)

export function SavedJobsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())
  const [updateTrigger, setUpdateTrigger] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const cached = localStorage.getItem("savedJobIds")
      if (cached) {
        const parsed = JSON.parse(cached)
        setSavedJobIds(new Set(parsed))
        console.log("[v0] Loaded saved jobs from cache:", parsed)
      }
    } catch (error) {
      console.error("[v0] Error parsing cached saved jobs:", error)
      localStorage.removeItem("savedJobIds")
    }
  }, [])

  const refreshSavedJobs = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId")
      const userType = localStorage.getItem("userType")

      if (!userId || userType !== "APPLICANT") {
        console.log("[v0] User not logged in or not an applicant, skipping saved jobs fetch")
        setIsLoading(false)
        return
      }

      console.log("[v0] Fetching saved jobs for user:", userId)
      const response = await api.getSavedJobsByApplicant({
        applicantId: userId,
        page: 0,
        size: 1000,
      })

      if (response && response.data && response.data.content) {
        const jobIds = response.data.content.map((job: any) => job.jobId)
        const newSet = new Set<string>(jobIds)
        setSavedJobIds(newSet)
        setUpdateTrigger((prev) => prev + 1)
        localStorage.setItem("savedJobIds", JSON.stringify(Array.from(newSet)))
        console.log("[v0] Refreshed saved jobs from API:", jobIds)
      } else {
        console.log("[v0] No saved jobs found or unexpected response structure")
      }
    } catch (error) {
      console.error("[v0] Error fetching saved jobs:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshSavedJobs()
  }, [refreshSavedJobs])

  const isSaved = useCallback(
    (jobId: string) => {
      const result = savedJobIds.has(jobId)
      console.log(`[v0] Checking if job ${jobId} is saved:`, result)
      return result
    },
    [savedJobIds, updateTrigger],
  )

  const toggleSaveJob = useCallback(
    async (jobId: string) => {
      try {
        console.log("[v0] Toggling save for job:", jobId)
        await api.toggleSaveJob(jobId)
        console.log("[v0] Toggle save job API call successful for job:", jobId)

        setSavedJobIds((prev) => {
          const newSet = new Set(prev)
          const wasSaved = newSet.has(jobId)

          if (wasSaved) {
            newSet.delete(jobId)
            console.log("[v0] Removed job from saved:", jobId)
          } else {
            newSet.add(jobId)
            console.log("[v0] Added job to saved:", jobId)
          }

          const newArray = Array.from(newSet)
          localStorage.setItem("savedJobIds", JSON.stringify(newArray))
          console.log("[v0] Updated localStorage with saved jobs:", newArray)

          return newSet
        })

        setUpdateTrigger((prev) => prev + 1)
        router.refresh()
      } catch (error) {
        console.error("[v0] Error toggling save job:", error)
        throw error
      }
    },
    [router],
  )

  const contextValue = useMemo(
    () => ({
      savedJobIds,
      isSaved,
      toggleSaveJob,
      refreshSavedJobs,
      isLoading,
    }),
    [savedJobIds, isSaved, toggleSaveJob, refreshSavedJobs, isLoading, updateTrigger],
  )

  return <SavedJobsContext.Provider value={contextValue}>{children}</SavedJobsContext.Provider>
}

export function useSavedJobs() {
  const context = useContext(SavedJobsContext)
  if (context === undefined) {
    throw new Error("useSavedJobs must be used within a SavedJobsProvider")
  }
  return context
}
