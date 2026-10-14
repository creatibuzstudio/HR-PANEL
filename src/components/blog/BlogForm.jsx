import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import TextField from "@/components/ui/input/TextField";
import TextareaField from "@/components/ui/input/TextareaField";
import SimpleRichTextEditor from "@/components/ui/simple-rich-text-editor.jsx";
import toast from "react-hot-toast";
import moment from "moment";
import {
  Upload,
  X,
  Sparkles,
  Globe,
  FileText,
  Tag,
  RefreshCw,
  Eye,
  Calendar,
  User,
  Clock,
  ArrowLeft,
} from "lucide-react";
import {
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useUploadBlogImageMutation,
} from "@/services/blog/blogApiSlice.js";

// Slug generation utility
const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const schema = yup.object({
  title: yup.string().required("Blog title is required").max(255, "Title is too long"),
  slug: yup.string().required("Slug is required").max(255, "Slug is too long"),
  author: yup.string().max(150, "Author name is too long").default("Admin"),
  shortDescription: yup.string().nullable().optional(),
  content: yup.string().required("Blog content is required"),
  seoTitle: yup.string().nullable().optional().max(255, "SEO title is too long"),
  seoDescription: yup.string().nullable().optional(),
  keywords: yup.string().nullable().optional(),
});

const BlogForm = ({ blogData = null, onSuccess, onCancel }) => {
  const [createBlog, { isLoading: createLoading }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: updateLoading }] = useUpdateBlogMutation();
  const [uploadImage, { isLoading: uploadLoading }] = useUploadBlogImageMutation();

  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [autoSlug, setAutoSlug] = useState(!blogData); // auto-generate slug unless editing existing
  const [activeTab, setActiveTab] = useState("general"); // 'general' | 'seo'

  const isEditing = !!blogData;
  const isLoading = createLoading || updateLoading || uploadLoading;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      slug: "",
      author: "Admin",
      shortDescription: "",
      content: "",
      seoTitle: "",
      seoDescription: "",
      keywords: "",
    },
  });

  const watchedTitle = watch("title");
  const watchedSlug = watch("slug");
  const watchedContent = watch("content");
  const watchedAuthor = watch("author");
  const watchedShortDesc = watch("shortDescription");
  const watchedKeywords = watch("keywords");

  // Auto-generate slug when title changes if autoSlug is enabled
  useEffect(() => {
    if (autoSlug && watchedTitle && (!isEditing || !blogData?.slug)) {
      const generated = slugify(watchedTitle);
      setValue("slug", generated, { shouldValidate: true });
    }
  }, [watchedTitle, autoSlug, setValue, isEditing, blogData]);

  // Populate form in edit mode
  useEffect(() => {
    if (blogData) {
      reset({
        title: blogData.title || "",
        slug: blogData.slug || "",
        author: blogData.author || "Admin",
        shortDescription: blogData.shortDescription || blogData.excerpt || "",
        content: blogData.content || "",
        seoTitle: blogData.seoTitle || blogData.metaTitle || "",
        seoDescription: blogData.seoDescription || blogData.metaDescription || "",
        keywords: blogData.keywords || blogData.seoKeywords || blogData.metaKeywords || "",
      });
      setCoverImageUrl(blogData.coverImage || "");
      setAutoSlug(false);
    } else {
      reset({
        title: "",
        slug: "",
        author: "Admin",
        shortDescription: "",
        content: "",
        seoTitle: "",
        seoDescription: "",
        keywords: "",
      });
      setCoverImageUrl("");
      setAutoSlug(true);
    }
  }, [blogData, reset]);

  const handleManualSlugChange = (e) => {
    setAutoSlug(false);
    setValue("slug", slugify(e.target.value), { shouldValidate: true });
  };

  const handleRegenerateSlug = () => {
    const generated = slugify(watchedTitle);
    setValue("slug", generated, { shouldValidate: true });
    toast.success("Slug generated from title");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await uploadImage(formData).unwrap();
      const uploadedUrl = res?.url || res?.data?.url;
      if (uploadedUrl) {
        setCoverImageUrl(uploadedUrl);
        toast.success("Cover image uploaded successfully");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to upload image");
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        title: data.title.trim(),
        slug: data.slug.trim(),
        author: data.author?.trim() || "Admin",
        coverImage: coverImageUrl || undefined,
        shortDescription: data.shortDescription?.trim() || undefined,
        excerpt: data.shortDescription?.trim() || undefined,
        content: data.content,
        seoTitle: data.seoTitle?.trim() || data.title.trim(),
        seoDescription: data.seoDescription?.trim() || data.shortDescription?.trim() || undefined,
        keywords: data.keywords?.trim() || undefined,
        seoKeywords: data.keywords?.trim() || undefined,
      };

      if (isEditing) {
        const result = await updateBlog({
          id: blogData.id,
          data: payload,
        });

        if (result?.error) {
          toast.error(result?.error?.data?.message || "Failed to update blog");
        } else {
          toast.success("Blog post updated successfully");
          reset();
          onSuccess?.();
        }
      } else {
        const result = await createBlog(payload);

        if (result?.error) {
          toast.error(result?.error?.data?.message || "Failed to create blog");
        } else {
          toast.success("Blog post created successfully");
          reset();
          onSuccess?.();
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 space-x-2">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "general"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          General & Content
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "preview"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <Eye className="w-4 h-4" />
          Live Preview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "seo"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <Globe className="w-4 h-4" />
          SEO & Meta Data
        </button>
      </div>

      {/* General & Content Tab */}
      {activeTab === "general" && (
        <div className="space-y-4">
          <TextField
            label="Blog Title *"
            type="text"
            placeholder="e.g. The Future of Branding in 2026"
            register={register}
            name="title"
            error={errors.title?.message}
            required
          />

          {/* Auto Slug Field */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-black font-[500] dark:text-white/75 text-[14px]">
                URL Slug *
              </label>
              <button
                type="button"
                onClick={handleRegenerateSlug}
                className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                title="Regenerate slug from current title"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auto-generate from title
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                {...register("slug")}
                onChange={handleManualSlugChange}
                placeholder="the-future-of-branding-in-2026"
                className={`border-[1px] border-[#E4E4E7] dark:border-white/10 py-2.5 px-4 rounded-[6px] bg-white dark:bg-gray-800 w-full outline-none transition-all duration-200 hover:border-primary/60 dark:hover:border-primary/60 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:border-primary dark:text-white/90 text-sm ${
                  errors.slug ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""
                }`}
              />
            </div>
            {errors.slug && (
              <p className="mt-1 text-sm text-red-500">{errors.slug.message}</p>
            )}
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Live preview: <span className="font-mono text-primary">/blog/{watchedSlug || "your-slug"}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Author Name"
              type="text"
              placeholder="e.g. Creatibuz Team"
              register={register}
              name="author"
              error={errors.author?.message}
            />

            {/* Cover Image Upload / Input */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cover Image
              </label>
              <div className="flex items-center gap-3">
                {coverImageUrl ? (
                  <div className="relative w-16 h-12 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <img
                      src={coverImageUrl}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl("")}
                      className="absolute top-1 right-1 p-0.5 bg-black/70 rounded-full text-white hover:bg-black"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-md cursor-pointer hover:border-primary text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                    <Upload className="w-3.5 h-3.5 text-gray-400" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploadLoading}
                      className="hidden"
                    />
                  </label>
                )}
                <input
                  type="text"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="Or paste image URL"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <TextareaField
            label="Short Description / Excerpt"
            placeholder="Brief summary of the blog post (shown in cards and search results)..."
            register={register}
            name="shortDescription"
            rows={2}
            error={errors.shortDescription?.message}
          />

          {/* Rich Text Editor for Blog Content */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-black font-[500] dark:text-white/75 text-[14px]">
                Content *
              </label>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium px-2.5 py-1 rounded bg-primary/10 hover:bg-primary/15 transition-colors"
                title="Preview this article with full styling"
              >
                <Eye className="w-3.5 h-3.5" />
                Live Preview
              </button>
            </div>
            <Controller
              name="content"
              control={control}
              render={({ field, fieldState }) => (
                <div>
                  <div
                    className={`rounded-lg overflow-hidden border ${
                      fieldState.error
                        ? "border-red-500"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <SimpleRichTextEditor
                      content={field.value || ""}
                      onChangeContent={(html) => field.onChange(html)}
                      height={360}
                    />
                  </div>
                  {fieldState.error && (
                    <p className="mt-1 text-sm text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </div>
      )}

      {/* Live Preview Tab */}
      {activeTab === "preview" && (
        <div className="space-y-6 bg-white dark:bg-gray-900/60 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 text-xs text-primary font-semibold uppercase tracking-wider">
              <Eye className="w-4 h-4" />
              Live Article Preview
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-200 hover:text-primary transition-colors font-medium px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Editor
            </button>
          </div>

          {/* Post Header */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-primary" />
                {watchedAuthor || "Admin"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {moment().format("MMMM DD, YYYY")}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {Math.max(
                  1,
                  Math.ceil(
                    (watchedContent?.replace(/<[^>]+>/g, "").split(/\s+/).length || 0) /
                      200
                  )
                )}{" "}
                min read
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug">
              {watchedTitle || "Untitled Blog Post"}
            </h1>

            {watchedShortDesc && (
              <p className="text-base text-gray-600 dark:text-gray-300 italic border-l-4 border-primary pl-4 py-1 bg-gray-50/50 dark:bg-gray-800/40 rounded-r-lg">
                {watchedShortDesc}
              </p>
            )}
          </div>

          {/* Cover Image */}
          {coverImageUrl && (
            <div className="rounded-xl overflow-hidden aspect-[16/9] max-h-[380px] w-full border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 shadow-sm">
              <img
                src={coverImageUrl}
                alt={watchedTitle || "Cover"}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Formatted Article Body */}
          <div className="pt-2 text-gray-800 dark:text-gray-200 leading-relaxed text-base min-h-[160px]">
            {watchedContent ? (
              <div
                dangerouslySetInnerHTML={{ __html: watchedContent }}
                className="blog-preview-content"
              />
            ) : (
              <div className="py-12 text-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="font-medium">No content written yet.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Switch to the "General & Content" tab to write in the text editor.
                </p>
              </div>
            )}
          </div>

          {/* Keywords / Tags */}
          {watchedKeywords && (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">Tags:</span>
                {watchedKeywords
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

      {/* SEO & Meta Data Tab */}
      {activeTab === "seo" && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg text-xs text-blue-800 dark:text-blue-300">
            <strong>SEO Tip:</strong> Fill in these metadata fields to maximize search engine visibility on Google and social media platforms.
          </div>

          <TextField
            label="SEO Meta Title"
            type="text"
            placeholder={watchedTitle || "Optimal title (approx 50-60 characters)"}
            register={register}
            name="seoTitle"
            error={errors.seoTitle?.message}
          />

          <TextareaField
            label="SEO Meta Description"
            placeholder="A compelling summary for search result snippets (recommended 120-160 characters)..."
            register={register}
            name="seoDescription"
            rows={3}
            error={errors.seoDescription?.message}
          />

          <div>
            <TextField
              label="Keywords (Comma separated)"
              type="text"
              placeholder="e.g. web design, branding, ui ux, digital marketing"
              register={register}
              name="keywords"
              error={errors.keywords?.message}
            />
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Separate keywords with commas for search engines and tagging.
            </p>
          </div>

          {/* Search Snippet Preview */}
          <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/60 dark:bg-gray-900/50">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Google Search Snippet Preview
            </h4>
            <div className="space-y-1">
              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-mono">
                https://creatibuzstudio.com/blog/{watchedSlug || "post-url"}
              </div>
              <div className="text-base text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer">
                {watch("seoTitle") || watchedTitle || "Your Blog Post Title"}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                {watch("seoDescription") ||
                  watch("shortDescription") ||
                  "This is how your blog description will appear in search engine search results."}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          * Indicates required field
        </div>
        <div className="flex items-center space-x-3">
          <PrimaryButton type="button" onClick={onCancel} variant="secondary">
            Cancel
          </PrimaryButton>
          <PrimaryButton type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : isEditing
              ? "Update Blog"
              : "Publish Blog"}
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
};

export default BlogForm;
