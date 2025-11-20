"use client"
import { Building2, Users } from "lucide-react"

interface StepOneAccountTypeProps {
  selectedType: "APPLICANT" | "EMPLOYER" | null
  onSelectType: (type: "APPLICANT" | "EMPLOYER") => void
  isDisabled: boolean
}

export default function StepOneAccountType({ selectedType, onSelectType, isDisabled }: StepOneAccountTypeProps) {
  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">Vui lòng chọn loại tài khoản phù hợp với bạn</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Applicant Card */}
        <button
          onClick={() => onSelectType("APPLICANT")}
          disabled={isDisabled}
          className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
            selectedType === "APPLICANT" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">Ứng viên</h3>
              <p className="text-xs text-muted-foreground">Tìm kiếm & ứng tuyển công việc</p>
            </div>
            {selectedType === "APPLICANT" && <div className="text-primary font-medium text-xs">✓ Đã chọn</div>}
          </div>
        </button>

        {/* Employer Card */}
        <button
          onClick={() => onSelectType("EMPLOYER")}
          disabled={isDisabled}
          className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
            selectedType === "EMPLOYER" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">Nhà tuyển dụng</h3>
              <p className="text-xs text-muted-foreground">Đăng tin & quản lý ứng viên</p>
            </div>
            {selectedType === "EMPLOYER" && <div className="text-primary font-medium text-xs">✓ Đã chọn</div>}
          </div>
        </button>
      </div>
    </div>
  )
}
