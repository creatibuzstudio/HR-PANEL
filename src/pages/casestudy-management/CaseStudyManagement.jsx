import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReusableTable from "@/components/ui/table/reusable-table";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import IconButton from "@/components/ui/buttons/icon-button";

import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Eye,
  ExternalLink,
  Layers,
  BarChart3,
  Calendar,
  Tag,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import {
  useSearchCasestudiesQuery,
  useDeleteCasestudyMutation,
} from "@/services/casestudy/casestudyApiSlice.js";
import Modal from "@/components/ui/modal.jsx";
import DeleteConfirmModal from "@/components/ui/modal/DeleteConfirmModal.jsx";
import { Card } from "@/components/ui/card";
import useAuth from "@/hooks/useAuth.js";

export default function CaseStudyManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();

  const [deleteConfirmState, setDeleteConfirmState] = useState({
    isOpen: false,
    idsToDelete: [],
  });

  const [previewCase, setPreviewCase] = useState(null);

  const { user, permissions } = useAuth();

  const hasPermission = () => {
    if (
      user?.type === "Super-Admin" ||
      user?.type === "coo" ||
      user?.role === "admin" ||
      user?.role === "ceo" ||
      user?.role === "cto" ||
      user?.role === "founder" ||
      !permissions ||
      permissions?.length === 0
    ) {
      return true;
    }
    return true;
  };

  const {
    data: searchResult = { items: [], meta: {} },
    isLoading,
    refetch,
  } = useSearchCasestudiesQuery({
    page: currentPage,
    limit: pageSize,
    query: searchTerm,
  });

  const [deleteCasestudy, { isLoading: deleteLoading }] = useDeleteCasestudyMutation();

  useEffect(() => {
    if (
      searchResult?.meta?.currentPage &&
      searchResult.meta.currentPage !== currentPage
    ) {
      setCurrentPage(searchResult.meta.currentPage);
    }
  }, [searchResult.meta.currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (searchResult?.meta?.itemsPerPage) {
      setPageSize(searchResult.meta.itemsPerPage);
    }
  }, [searchResult]);

  const casestudies = searchResult.items || [];
  const total = searchResult.meta?.totalItems || 0;

  const headers = [
    { header: "SL", field: "sl" },
    { header: "Photo", field: "photo" },
    { header: "Project Title", field: "title" },
    { header: "Category / Tag", field: "category" },
    { header: "Key Stats", field: "stats" },
    { header: "Order", field: "order" },
    { header: "Status", field: "status" },
    { header: "Created At", field: "created_at" },
    { header: "Actions", field: "actions" },
  ];

  const transformedData = casestudies?.map((item, i) => {
    const statsArr = item.stats || item.metrics || [];

    return {
      sl: (currentPage - 1) * pageSize + i + 1,
      id: item.id,
      photo: item.photoUrl ? (
        <img
          src={item.photoUrl}
          alt={item.title}
          className="w-14 h-10 rounded-lg object-cover border border-gray-100 dark:border-gray-800"
        />
      ) : (
        <div className="w-14 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
          <Layers className="w-4 h-4" />
        </div>
      ),
      title: (
        <div className="max-w-xs">
          <p className="font-semibold text-gray-900 dark:text-white truncate" title={item.title}>
            {item.title || "Untitled Case Study"}
          </p>
          <span className="font-mono text-[11px] text-gray-500 truncate block">
            /{item.slug}
          </span>
        </div>
      ),
      category: (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
            {item.category?.name || "General"}
          </span>
          {item.tag && (
            <span className="text-[11px] text-primary font-medium truncate max-w-[120px]">
              {item.tag}
            </span>
          )}
        </div>
      ),
      stats: (
        <div className="flex flex-col gap-1 max-w-[160px]">
          {statsArr.slice(0, 2).map((s, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 truncate"
            >
              <strong className="text-primary">{s.count || s.value}</strong> {s.name || s.label}
            </span>
          ))}
          {statsArr.length > 2 && (
            <span className="text-[10px] text-gray-400 font-medium">
              +{statsArr.length - 2} more stats
            </span>
          )}
          {statsArr.length === 0 && (
            <span className="text-xs text-gray-400 italic">None</span>
          )}
        </div>
      ),
      order: (
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          {item.order ?? 0}
        </span>
      ),
      status: (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.isActive !== false
              ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
          }`}
        >
          {item.isActive !== false ? "Active" : "Inactive"}
        </span>
      ),
      created_at: item.createdAt
        ? moment(item.createdAt).format("MMM DD, YYYY")
        : "N/A",
      actions: (
        <div className="flex items-center justify-center gap-2">
          <IconButton
            icon={Eye}
            onClick={() => setPreviewCase(item)}
            className="text-blue-600 hover:text-blue-700"
            title="Preview Details"
          />

          {hasPermission() && (
            <IconButton
              icon={Edit}
              onClick={() => handleEdit(item.id)}
              className="text-green-600 hover:text-green-700"
              title="Edit Case Study"
            />
          )}

          {hasPermission() && (
            <IconButton
              icon={Trash2}
              onClick={() => openDeleteModal([item.id])}
              className="text-red-600 hover:text-red-700"
              title="Delete Case Study"
            />
          )}
        </div>
      ),
    };
  });

  const handleEdit = (id) => {
    navigate(`/case-studies/edit/${id}`);
  };

  const handleAddNew = () => {
    navigate("/case-studies/create");
  };

  const openDeleteModal = (ids) => {
    setDeleteConfirmState({ isOpen: true, idsToDelete: ids });
  };

  const cancelDelete = () => {
    setDeleteConfirmState({ isOpen: false, idsToDelete: [] });
  };

  const confirmDelete = async () => {
    try {
      for (const id of deleteConfirmState.idsToDelete) {
        await deleteCasestudy(id).unwrap();
      }
      toast.success(
        `${deleteConfirmState.idsToDelete.length} case study(s) deleted successfully`
      );
      setSelectedItems((prev) =>
        prev.filter((id) => !deleteConfirmState.idsToDelete.includes(id))
      );
      refetch();
    } catch (err) {
      toast.error("Failed to delete case study(s)");
    } finally {
      cancelDelete();
    }
  };

  const handleBulkDelete = (action, selectedIds) => {
    if (action === "delete" && selectedIds.length > 0) {
      openDeleteModal(selectedIds);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Case Studies Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your featured projects, client metrics, challenge/solution photos, and stories
          </p>
        </div>
        {hasPermission() && (
          <PrimaryButton onClick={handleAddNew} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Case Study
          </PrimaryButton>
        )}
      </div>

      {/* Table Card */}
      <Card className="p-8">
        <ReusableTable
          data={transformedData}
          headers={headers}
          isLoading={isLoading}
          total={total}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          enableSearch={true}
          enableSorting={true}
          enableSelection={true}
          enableBulkActions={true}
          searchPlaceholder="Search case studies by title, tag, or technology..."
          externalSearchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectionChange={setSelectedItems}
          onBulkAction={handleBulkDelete}
          externalTotal={total}
          externalTotalPages={searchResult.meta?.totalPages}
          setPageSize={setPageSize}
        />
      </Card>



      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirmState.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        count={deleteConfirmState.idsToDelete.length}
        itemName="case study"
        loading={deleteLoading}
      />

      {/* Details Preview Modal */}
      <Modal
        isOpen={Boolean(previewCase)}
        onClose={() => setPreviewCase(null)}
        title="Case Study Full Details Preview"
        size="xl"
      >
        {previewCase && (
          <div
            className="rounded-xl p-6 text-white space-y-6"
            style={{ backgroundColor: previewCase.bgColor || "#1D0C01" }}
          >
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300 mb-2">
                {previewCase.tag && (
                  <span className="text-primary font-bold uppercase tracking-wider">
                    [{previewCase.tag}]
                  </span>
                )}
                {previewCase.category?.name && (
                  <span>Category: {previewCase.category.name}</span>
                )}
                {previewCase.projectLink && (
                  <a
                    href={previewCase.projectLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    Live Project <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {previewCase.title}
              </h2>
              {previewCase.shortDescription && (
                <p className="text-sm md:text-base text-gray-300 leading-relaxed mt-3">
                  {previewCase.shortDescription}
                </p>
              )}
            </div>

            {/* Featured Image */}
            {previewCase.photoUrl && (
              <div className="rounded-xl overflow-hidden border border-white/10 max-h-[380px]">
                <img src={previewCase.photoUrl} alt="Hero" className="w-full h-auto object-cover" />
              </div>
            )}

            {/* Multi-Images */}
            {Array.isArray(previewCase.images) && previewCase.images.length > 0 && (
              <div>
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold block mb-2">
                  Gallery Showcase
                </span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {previewCase.images.map((img, i) => (
                    <div key={i} className="aspect-video rounded-lg overflow-hidden border border-white/10">
                      <img src={img} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Metrics Banner */}
            {previewCase.stats && previewCase.stats.length > 0 && (
              <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-black/40 border border-white/10">
                {previewCase.stats.map((stat, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-2xl font-bold text-white tracking-tight">
                      {stat.count || stat.value}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      {stat.name || stat.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Challenge & Solution */}
            {(previewCase.challenge || previewCase.solution) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {(previewCase.challenge || previewCase.challengePhoto || (Array.isArray(previewCase.challengePhotos) && previewCase.challengePhotos.length > 0)) && (
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                    <h4 className="text-sm font-bold text-amber-400 uppercase flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Challenge
                    </h4>
                    {previewCase.challenge && (
                      <div
                        dangerouslySetInnerHTML={{ __html: previewCase.challenge }}
                        className="blog-preview-content text-xs text-gray-300 leading-relaxed space-y-2"
                      />
                    )}
                    {Array.isArray(previewCase.challengePhotos) && previewCase.challengePhotos.length > 0 ? (
                      <div className="space-y-3 pt-2">
                        {previewCase.challengePhotos.map((cp, idx) => (
                          <div key={idx} className="p-2.5 rounded bg-white/5 border border-white/5 space-y-2">
                            {cp.title && (
                              <span className="text-xs font-semibold text-amber-300 block">{cp.title}</span>
                            )}
                            {cp.photoUrl && (
                              <div className="rounded-lg overflow-hidden border border-white/10">
                                <img src={cp.photoUrl} alt={`Challenge ${idx + 1}`} className="w-full h-32 object-cover" />
                              </div>
                            )}
                            {cp.description && (
                              <div
                                dangerouslySetInnerHTML={{ __html: cp.description }}
                                className="blog-preview-content text-[11px] text-gray-400 italic pt-1 space-y-1"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {previewCase.challengePhoto && (
                          <div className="rounded-lg overflow-hidden border border-white/10 mt-2">
                            <img src={previewCase.challengePhoto} alt="Challenge" className="w-full h-32 object-cover" />
                          </div>
                        )}
                        {previewCase.challengePhotoDescription && (
                          <div
                            dangerouslySetInnerHTML={{ __html: previewCase.challengePhotoDescription }}
                            className="blog-preview-content text-[11px] text-gray-400 italic pt-1 space-y-1"
                          />
                        )}
                      </>
                    )}
                  </div>
                )}

                {(previewCase.solution || previewCase.solutionPhoto || (Array.isArray(previewCase.solutionPhotos) && previewCase.solutionPhotos.length > 0)) && (
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                    <h4 className="text-sm font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4" /> Solution
                    </h4>
                    {previewCase.solution && (
                      <div
                        dangerouslySetInnerHTML={{ __html: previewCase.solution }}
                        className="blog-preview-content text-xs text-gray-300 leading-relaxed space-y-2"
                      />
                    )}
                    {Array.isArray(previewCase.solutionPhotos) && previewCase.solutionPhotos.length > 0 ? (
                      <div className="space-y-3 pt-2">
                        {previewCase.solutionPhotos.map((sp, idx) => (
                          <div key={idx} className="p-2.5 rounded bg-white/5 border border-white/5 space-y-2">
                            {sp.title && (
                              <span className="text-xs font-semibold text-emerald-300 block">{sp.title}</span>
                            )}
                            {sp.photoUrl && (
                              <div className="rounded-lg overflow-hidden border border-white/10">
                                <img src={sp.photoUrl} alt={`Solution ${idx + 1}`} className="w-full h-32 object-cover" />
                              </div>
                            )}
                            {sp.description && (
                              <div
                                dangerouslySetInnerHTML={{ __html: sp.description }}
                                className="blog-preview-content text-[11px] text-gray-400 italic pt-1 space-y-1"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {previewCase.solutionPhoto && (
                          <div className="rounded-lg overflow-hidden border border-white/10 mt-2">
                            <img src={previewCase.solutionPhoto} alt="Solution" className="w-full h-32 object-cover" />
                          </div>
                        )}
                        {previewCase.solutionPhotoDescription && (
                          <div
                            dangerouslySetInnerHTML={{ __html: previewCase.solutionPhotoDescription }}
                            className="blog-preview-content text-[11px] text-gray-400 italic pt-1 space-y-1"
                          />
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Full Story Content if exists */}
            {previewCase.fullDescription && (
              <div className="pt-2 border-t border-white/10">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold block mb-2">
                  Full Overview
                </span>
                <div
                  dangerouslySetInnerHTML={{ __html: previewCase.fullDescription }}
                  className="blog-preview-content text-sm text-gray-200"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
