"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, CheckCircle } from "lucide-react"
import { api, type CV } from "@/lib/api"
import { format } from 'date-fns';

interface ApplyJobDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    jobId: string
    jobTitle: string
}

export function ApplyJobDialog({ open, onOpenChange, jobId, jobTitle }: ApplyJobDialogProps) {
    const [cvList, setCvList] = useState<CV[]>([])
    const [selectedCvId, setSelectedCvId] = useState<string>("")
    const [isLoadingCvs, setIsLoadingCvs] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")


    useEffect(() => {
        if (open) {
            loadCvList()
        }
    }, [open])

    const loadCvList = async () => {
        setIsLoadingCvs(true)
        try {
            const userId = localStorage.getItem("userId")
            if (!userId) return

            const response = await api.getCVsByApplicant(userId)
            if (response.data && response.data.content) {
                setCvList(response.data.content)
            }
        } catch (error) {
            console.error("Error loading CVs:", error)
        } finally {
            setIsLoadingCvs(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            setError("Kích thước file không được vượt quá 10MB")
            return
        }

        // Check file type
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/png",
            "image/jpeg",
        ]
        if (!allowedTypes.includes(file.type)) {
            setError("Chỉ chấp nhận file PDF, DOC, PNG, JPG")
            return
        }

        setIsUploading(true)
        setError("")

        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("applicantId", localStorage.getItem("userId") || "")
            formData.append("fileName", file.name)

            const response = await api.uploadCV(formData)
            if (response.data) {
                setSuccess("Tải lên CV thành công!")
                await loadCvList()
                setSelectedCvId(response.data.id)
                setTimeout(() => setSuccess(""), 2000)
            }
        } catch (error: any) {
            setError(error.message || "Không thể tải lên CV")
        } finally {
            setIsUploading(false)
        }
    }

    const handleSubmit = async () => {
        if (!selectedCvId) {
            setError("Vui lòng chọn CV để ứng tuyển")
            return
        }

        setIsSubmitting(true)
        setError("")

        try {
            await api.createApplication({
                jobId: jobId,
                cvId: selectedCvId,
                applicantId: localStorage.getItem("userId") || "",
            })

            setSuccess("Nộp đơn ứng tuyển thành công!")
            setTimeout(() => {
                onOpenChange(false)
            }, 1500)
        } catch (error: any) {
            setError(error.message || "Không thể nộp đơn ứng tuyển")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl animate-slide-down">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Chọn CV để ứng tuyển</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="border-green-200 bg-green-50 text-green-800">
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}

                    {/* CV List */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-base">CV đã tải lên</h3>
                        {isLoadingCvs ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : cvList.length > 0 ? (
                            <div className="space-y-2">
                                {cvList.map((cv) => (
                                    <div
                                        key={cv.id}
                                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <Checkbox
                                            id={cv.id}
                                            checked={selectedCvId === cv.id}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedCvId(cv.id)
                                                } else {
                                                    setSelectedCvId("")
                                                }
                                            }}
                                        />
                                        <label htmlFor={cv.id} className="flex-1 cursor-pointer">
                                            <p className="text-sm font-medium">{cv.fileName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                (Tải lên {format(new Date(cv.uploadedDate), 'yyyy-MM-dd HH:mm:ss')})
                                            </p>
                                        </label>
                                        <a
                                            href={cv.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Xem chi tiết
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )
                            : (
                                <p className="text-sm text-muted-foreground py-4">Chưa có CV nào được tải lên</p>
                            )
                        }
                    </div>

                    {/* Upload New CV */}
                    <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/20">
                        <input
                            type="file"
                            id="cv-upload"
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                            className="hidden"
                        />
                        <label htmlFor="cv-upload" className="cursor-pointer">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    {isUploading ? (
                                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                    ) : (
                                        <Upload className="h-8 w-8 text-primary" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-base">Tải lên CV mới</p>
                                    <p className="text-sm text-muted-foreground">(PDF, DOC, PNG, JPG)</p>
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Create CV Link */}
                    {/* <p className="text-sm text-center text-muted-foreground">
            Bạn chưa có sẵn CV hoặc muốn tạo thêm CV mới?{" "}
            <a href="/create-cv" className="text-primary font-semibold hover:underline">
              Tạo CV ngay
            </a>
          </p> */}

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || isUploading || !selectedCvId}
                        className="w-full h-12 text-base font-semibold"
                        size="lg"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Đang gửi...
                            </>
                        ) : (
                            "XÁC NHẬN ỨNG TUYỂN"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
