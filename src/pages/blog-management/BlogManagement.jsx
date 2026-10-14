import React, { useEffect, useState } from "react";
import ReusableTable from "@/components/ui/table/reusable-table";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import IconButton from "@/components/ui/buttons/icon-button";
import BlogForm from "@/components/blog/BlogForm";

import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Globe,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  User,
  Calendar,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import {
  useSearchBlogsQuery,
  useDeleteBlogMutation,
} from "@/services/blog/blogApiSlice.js";
import Modal from "@/components/ui/modal.jsx";
import DeleteConfirmModal from "@/components/ui/modal/DeleteConfirmModal.jsx";
import { Card } from "@/components/ui/card";
import useAuth from "@/hooks/useAuth.js";

export default function BlogManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  // Delete modal state
  const [deleteConfirmState, setDeleteConfirmState] = useState({
    isOpen: false,
    idsToDelete: [],
  });

  // Preview modal state
  const [previewBlog, setPreviewBlog] = useState(null);

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
  } = useSearchBlogsQuery({
    page: currentPage,
    limit: pageSize,
    query: searchTerm,
  });

  const [deleteBlog, { isLoading: deleteLoading }] = useDeleteBlogMutation();

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

  const blogs = searchResult.items || [];
  const total = searchResult.meta?.totalItems || 0;

  // Table headers matching previous design
  const headers = [
    { header: "SL", field: "sl" },
    { header: "Cover", field: "cover" },
    { header: "Blog Title", field: "title" },
    { header: "URL Slug", field: "slug" },
    { header: "SEO Meta", field: "seo" },
    { header: "Author", field: "author" },
    { header: "Created At", field: "created_at" },
    { header: "Actions", field: "actions" },
  ];

  // Transform data for ReusableTable
  const transformedData = blogs?.map((blog, i) => {
    const hasSeo = Boolean(blog.seoTitle || blog.seoDescription || blog.keywords);

    return {
      sl: (currentPage - 1) * pageSize + i + 1,
      id: blog.id,
      cover: blog.coverImage ? (
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="w-12 h-9 rounded-lg object-cover border border-gray-100 dark:border-gray-800"
        />
      ) : (
        <div className="w-12 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
          <FileText className="w-4 h-4" />
        </div>
      ),
      title: (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 dark:text-white truncate" title={blog.title}>
            {blog.title || "Untitled Blog"}
          </p>
          {blog.shortDescription && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {blog.shortDescription}
            </p>
          )}
        </div>
      ),
      slug: (
        <span className="font-mono text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 max-w-[160px] truncate inline-block">
          {blog.slug || "N/A"}
        </span>
      ),
      seo: hasSeo ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="w-3 h-3" />
          Configured
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertCircle className="w-3 h-3" />
          Missing
        </span>
      ),
      author: (
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {blog.author || "Admin"}
        </span>
      ),
      created_at: blog.createdAt
        ? moment(blog.createdAt).format("MMM DD, YYYY")
        : "N/A",
      actions: (
        <div className="flex items-center justify-center gap-2">
          <IconButton
            icon={Eye}
            onClick={() => setPreviewBlog(blog)}
            className="text-blue-600 hover:text-blue-700"
            title="Preview Blog"
          />

          {hasPermission() && (
            <IconButton
              icon={Edit}
              onClick={() => handleEdit(blog.id)}
              className="text-green-600 hover:text-green-700"
              title="Edit Blog"
            />
          )}

          {hasPermission() && (
            <IconButton
              icon={Trash2}
              onClick={() => openDeleteModal([blog.id])}
              className="text-red-600 hover:text-red-700"
              title="Delete Blog"
            />
          )}
        </div>
      ),
    };
  });

  // Edit handlers
  const handleEdit = (id) => {
    const blogData = blogs.find((b) => b.id === id);
    setModalState({ isOpen: true, type: "edit", data: blogData });
  };

  const handleAddNew = () => {
    setModalState({ isOpen: true, type: "add", data: null });
  };

  const handleModalClose = () => {
    setModalState({ isOpen: false, type: null, data: null });
  };

  const handleFormSuccess = () => {
    handleModalClose();
    refetch();
  };

  // Delete modal open / close
  const openDeleteModal = (ids) => {
    setDeleteConfirmState({ isOpen: true, idsToDelete: ids });
  };

  const cancelDelete = () => {
    setDeleteConfirmState({ isOpen: false, idsToDelete: [] });
  };

  // Confirm delete (single or bulk)
  const confirmDelete = async () => {
    try {
      for (const id of deleteConfirmState.idsToDelete) {
        await deleteBlog(id).unwrap();
      }
      toast.success(
        `${deleteConfirmState.idsToDelete.length} blog post(s) deleted successfully`
      );
      setSelectedItems((prev) =>
        prev.filter((id) => !deleteConfirmState.idsToDelete.includes(id))
      );
      refetch();
    } catch (err) {
      toast.error("Failed to delete blog post(s)");
    } finally {
      cancelDelete();
    }
  };

  // Bulk delete handler
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
            Blog Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Publish and manage blog posts, auto-generated slugs, and SEO metadata
          </p>
        </div>
        {hasPermission() && (
          <PrimaryButton
            onClick={handleAddNew}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Blog
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
          searchPlaceholder="Search blogs by title, slug, or keywords..."
          externalSearchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectionChange={setSelectedItems}
          onBulkAction={handleBulkDelete}
          externalTotal={total}
          externalTotalPages={searchResult.meta?.totalPages}
          setPageSize={setPageSize}
        />
      </Card>

      {/* Add / Edit Blog Modal */}
      <Modal
        isOpen={
          modalState.isOpen &&
          (modalState.type === "add" || modalState.type === "edit")
        }
        onClose={handleModalClose}
        title={
          modalState.type === "add"
            ? "Create New Blog Post"
            : "Edit Blog Post"
        }
        size="xl"
      >
        <BlogForm
          blogData={modalState.data}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirmState.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        count={deleteConfirmState.idsToDelete.length}
        itemName="blog post"
        loading={deleteLoading}
      />

      {/* Blog Preview Modal */}
      <Modal
        isOpen={Boolean(previewBlog)}
        onClose={() => setPreviewBlog(null)}
        title="Article Preview"
        size="xl"
      >
        {previewBlog && (
          <div className="space-y-6 p-2">
            {/* Post Header */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-primary" />
                  {previewBlog.author || "Admin"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {previewBlog.createdAt
                    ? moment(previewBlog.createdAt).format("MMMM DD, YYYY")
                    : moment().format("MMMM DD, YYYY")}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {Math.max(
                    1,
                    Math.ceil(
                      (previewBlog.content
                        ?.replace(/<[^>]+>/g, "")
                        .split(/\s+/).length || 0) / 200
                    )
                  )}{" "}
                  min read
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug">
                {previewBlog.title}
              </h1>

              {previewBlog.shortDescription && (
                <p className="text-base text-gray-600 dark:text-gray-300 italic border-l-4 border-primary pl-4 py-1 bg-gray-50/50 dark:bg-gray-800/40 rounded-r-lg">
                  {previewBlog.shortDescription}
                </p>
              )}
            </div>

            {/* Cover Image */}
            {previewBlog.coverImage && (
              <div className="rounded-xl overflow-hidden aspect-[16/9] max-h-[380px] w-full border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 shadow-sm">
                <img
                  src={previewBlog.coverImage}
                  alt={previewBlog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Formatted Article Content */}
            <div className="pt-2 text-gray-800 dark:text-gray-200 leading-relaxed text-base min-h-[160px]">
              <div
                dangerouslySetInnerHTML={{
                  __html: previewBlog.content || "<p>No content written.</p>",
                }}
                className="blog-preview-content"
              />
            </div>

            {/* Tags / Keywords */}
            {(previewBlog.keywords || previewBlog.seoKeywords) && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">Tags:</span>
                  {(previewBlog.keywords || previewBlog.seoKeywords)
                    .split(",")
                    .filter(Boolean)
                    .map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium"
                      >
                        #{kw.trim()}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
