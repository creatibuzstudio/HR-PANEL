import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import CaseStudyForm from "@/components/casestudy/CaseStudyForm";
import { useGetCasestudyByIdQuery } from "@/services/casestudy/casestudyApiSlice";
import { ArrowLeft, Layers, Loader2 } from "lucide-react";

export default function EditCaseStudy() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: casestudy, isLoading, error } = useGetCasestudyByIdQuery(id);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b dark:border-gray-800">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => navigate("/case-studies")}
            className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-primary transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Case Studies Table
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {isLoading ? "Loading Case Study..." : `Edit: ${casestudy?.title || "Case Study"}`}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Update project details, gallery photos, metrics, and visual challenge/solution analyses
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/case-studies")}
          className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
        >
          Cancel & Exit
        </button>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <Card className="p-16 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-gray-500 font-medium">Fetching case study data...</span>
        </Card>
      ) : error || !casestudy ? (
        <Card className="p-12 text-center space-y-4">
          <p className="text-red-500 font-medium text-base">Failed to load case study</p>
          <button
            onClick={() => navigate("/case-studies")}
            className="px-4 py-2 text-xs bg-primary text-white rounded-lg font-semibold"
          >
            Return to Case Studies Table
          </button>
        </Card>
      ) : (
        <Card className="p-6 sm:p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <CaseStudyForm
            casestudyData={casestudy}
            onSuccess={() => navigate("/case-studies")}
            onCancel={() => navigate("/case-studies")}
          />
        </Card>
      )}
    </div>
  );
}
