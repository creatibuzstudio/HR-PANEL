import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import TextField from "@/components/ui/input/TextField";
import TextareaField from "@/components/ui/input/TextareaField";
import Dropdown from "@/components/ui/dropdown/dropdown.jsx";
import SimpleRichTextEditor from "@/components/ui/simple-rich-text-editor.jsx";
import toast from "react-hot-toast";
import moment from "moment";
import {
  Upload,
  X,
  Sparkles,
  Plus,
  Trash2,
  FileText,
  BarChart3,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Eye,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";
import {
  useCreateCasestudyMutation,
  useUpdateCasestudyMutation,
  useUploadCasestudyImageMutation,
} from "@/services/casestudy/casestudyApiSlice.js";
import { useGetAllCategoriesQuery } from "@/services/category/categoryApiSlice.js";

// Preset colors from featured works
const PRESET_BG_COLORS = [
  { label: "Dark Amber (#1D0C01)", value: "#1D0C01" },
  { label: "Deep Violet (#0D012A)", value: "#0D012A" },
  { label: "Plum Purple (#1B0121)", value: "#1B0121" },
  { label: "Midnight Navy (#010725)", value: "#010725" },
  { label: "Teal Cyan (#01171B)", value: "#01171B" },
  { label: "Wine Berry (#1B000F)", value: "#1B000F" },
  { label: "Dark Indigo (#09011C)", value: "#09011C" },
];

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
  title: yup.string().required("Case study title is required").max(255),
  slug: yup.string().required("Slug is required").max(255),
  categoryId: yup.string().nullable().optional(),
  tag: yup.string().nullable().optional().max(100),
  bgColor: yup.string().nullable().optional().max(50),
  projectLink: yup.string().nullable().optional(),
  shortDescription: yup.string().nullable().optional(),
  fullDescription: yup.string().nullable().optional(),
  challenge: yup.string().nullable().optional(),
  challengePhoto: yup.string().nullable().optional(),
  challengePhotoDescription: yup.string().nullable().optional(),
  solution: yup.string().nullable().optional(),
  solutionPhoto: yup.string().nullable().optional(),
  solutionPhotoDescription: yup.string().nullable().optional(),
  technologies: yup.string().nullable().optional(),
  order: yup.number().typeError("Order must be a number").default(0),
  isActive: yup.boolean().default(true),
});

const CaseStudyForm = ({ casestudyData = null, onSuccess, onCancel }) => {
  const [createCasestudy, { isLoading: createLoading }] = useCreateCasestudyMutation();
  const [updateCasestudy, { isLoading: updateLoading }] = useUpdateCasestudyMutation();
  const [uploadImage, { isLoading: uploadLoading }] = useUploadCasestudyImageMutation();

  const { data: categories = [] } = useGetAllCategoriesQuery();

  const [mainPhoto, setMainPhoto] = useState("");
  const [autoSlug, setAutoSlug] = useState(!casestudyData);
  const [activeTab, setActiveTab] = useState("general"); // 'general' | 'stats' | 'challengeSolution' | 'preview'

  // Multi-images list
  const [galleryImages, setGalleryImages] = useState([]);
  const [newGalleryInput, setNewGalleryInput] = useState("");

  // Dynamic stats list: [{ name, count }]
  const [statsList, setStatsList] = useState([
    { name: "Workflow efficiency", count: "76%" },
    { name: "Team productivity", count: "78%" },
    { name: "Client workflows optimized", count: "1.2M+" },
  ]);

  // Multi Challenge & Solution Photos lists
  const [challengePhotosList, setChallengePhotosList] = useState([]);
  const [solutionPhotosList, setSolutionPhotosList] = useState([]);

  const isEditing = !!casestudyData;
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
      categoryId: "",
      tag: "",
      bgColor: "#1D0C01",
      projectLink: "",
      shortDescription: "",
      fullDescription: "",
      challenge: "",
      challengePhoto: "",
      challengePhotoDescription: "",
      solution: "",
      solutionPhoto: "",
      solutionPhotoDescription: "",
      technologies: "",
      order: 0,
      isActive: true,
    },
  });

  const watchedTitle = watch("title");
  const watchedSlug = watch("slug");
  const watchedTag = watch("tag");
  const watchedBgColor = watch("bgColor");
  const watchedShortDesc = watch("shortDescription");
  const watchedFullDesc = watch("fullDescription");
  const watchedChallenge = watch("challenge");
  const watchedChallengePhoto = watch("challengePhoto");
  const watchedChallengePhotoDesc = watch("challengePhotoDescription");
  const watchedSolution = watch("solution");
  const watchedSolutionPhoto = watch("solutionPhoto");
  const watchedSolutionPhotoDesc = watch("solutionPhotoDescription");
  const watchedTechnologies = watch("technologies");

  // Auto-generate slug when title changes
  useEffect(() => {
    if (autoSlug && watchedTitle && (!isEditing || !casestudyData?.slug)) {
      setValue("slug", slugify(watchedTitle), { shouldValidate: true });
    }
  }, [watchedTitle, autoSlug, setValue, isEditing, casestudyData]);

  // Populate data when editing
  useEffect(() => {
    if (casestudyData) {
      reset({
        title: casestudyData.title || "",
        slug: casestudyData.slug || "",
        categoryId: casestudyData.categoryId || casestudyData.category?.id || "",
        tag: casestudyData.tag || "",
        bgColor: casestudyData.bgColor || "#1D0C01",
        projectLink: casestudyData.projectLink || "",
        shortDescription: casestudyData.shortDescription || "",
        fullDescription: casestudyData.fullDescription || "",
        challenge: casestudyData.challenge || "",
        challengePhoto: casestudyData.challengePhoto || "",
        challengePhotoDescription: casestudyData.challengePhotoDescription || "",
        solution: casestudyData.solution || "",
        solutionPhoto: casestudyData.solutionPhoto || "",
        solutionPhotoDescription: casestudyData.solutionPhotoDescription || "",
        technologies: casestudyData.technologies || "",
        order: casestudyData.order ?? 0,
        isActive: casestudyData.isActive !== false,
      });

      setMainPhoto(casestudyData.photoUrl || "");

      // Populate gallery images
      if (Array.isArray(casestudyData.images)) {
        setGalleryImages(casestudyData.images);
      } else if (casestudyData.images?.hero) {
        const arr = [];
        if (casestudyData.images.hero?.src) arr.push(casestudyData.images.hero.src);
        if (casestudyData.images.rightTop?.src) arr.push(casestudyData.images.rightTop.src);
        if (casestudyData.images.rightBottom?.src) arr.push(casestudyData.images.rightBottom.src);
        setGalleryImages(arr);
      } else {
        setGalleryImages([]);
      }

      // Populate stats
      if (Array.isArray(casestudyData.stats) && casestudyData.stats.length > 0) {
        setStatsList(
          casestudyData.stats.map((s) => ({
            name: s.name || s.label || "",
            count: s.count || s.value || "",
          }))
        );
      } else if (Array.isArray(casestudyData.metrics) && casestudyData.metrics.length > 0) {
        setStatsList(
          casestudyData.metrics.map((m) => ({
            name: m.label || m.name || "",
            count: m.value || m.count || "",
          }))
        );
      }
      // Populate challengePhotos
      if (Array.isArray(casestudyData.challengePhotos) && casestudyData.challengePhotos.length > 0) {
        setChallengePhotosList(
          casestudyData.challengePhotos.map((item) => ({
            photoUrl: item.photoUrl || "",
            title: item.title || "",
            description: item.description || "",
          }))
        );
      } else if (casestudyData.challengePhoto || casestudyData.challengePhotoDescription) {
        setChallengePhotosList([
          {
            photoUrl: casestudyData.challengePhoto || "",
            title: "",
            description: casestudyData.challengePhotoDescription || "",
          },
        ]);
      } else {
        setChallengePhotosList([]);
      }

      // Populate solutionPhotos
      if (Array.isArray(casestudyData.solutionPhotos) && casestudyData.solutionPhotos.length > 0) {
        setSolutionPhotosList(
          casestudyData.solutionPhotos.map((item) => ({
            photoUrl: item.photoUrl || "",
            title: item.title || "",
            description: item.description || "",
          }))
        );
      } else if (casestudyData.solutionPhoto || casestudyData.solutionPhotoDescription) {
        setSolutionPhotosList([
          {
            photoUrl: casestudyData.solutionPhoto || "",
            title: "",
            description: casestudyData.solutionPhotoDescription || "",
          },
        ]);
      } else {
        setSolutionPhotosList([]);
      }

      setAutoSlug(false);
    }
  }, [casestudyData, reset]);

  const handleFileUpload = async (e, callback) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await uploadImage(formData).unwrap();
      const uploadedUrl = res?.url || res?.data?.url;
      if (uploadedUrl) {
        callback(uploadedUrl);
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to upload image");
    }
  };

  // Stats handlers
  const handleAddStat = () => {
    setStatsList([...statsList, { name: "", count: "" }]);
  };

  const handleUpdateStat = (index, field, value) => {
    const updated = [...statsList];
    updated[index][field] = value;
    setStatsList(updated);
  };

  const handleRemoveStat = (index) => {
    setStatsList(statsList.filter((_, i) => i !== index));
  };

  // Gallery handlers
  const handleAddGalleryImage = (url) => {
    if (!url) return;
    setGalleryImages([...galleryImages, url]);
    setNewGalleryInput("");
  };

  const handleRemoveGalleryImage = (index) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  // Multi challenge photos handlers
  const handleAddChallengePhoto = () => {
    setChallengePhotosList([
      ...challengePhotosList,
      { photoUrl: "", title: "", description: "" },
    ]);
  };

  const handleUpdateChallengePhoto = (index, field, value) => {
    const updated = [...challengePhotosList];
    updated[index][field] = value;
    setChallengePhotosList(updated);
  };

  const handleRemoveChallengePhoto = (index) => {
    setChallengePhotosList(challengePhotosList.filter((_, i) => i !== index));
  };

  // Multi solution photos handlers
  const handleAddSolutionPhoto = () => {
    setSolutionPhotosList([
      ...solutionPhotosList,
      { photoUrl: "", title: "", description: "" },
    ]);
  };

  const handleUpdateSolutionPhoto = (index, field, value) => {
    const updated = [...solutionPhotosList];
    updated[index][field] = value;
    setSolutionPhotosList(updated);
  };

  const handleRemoveSolutionPhoto = (index) => {
    setSolutionPhotosList(solutionPhotosList.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        title: data.title.trim(),
        slug: data.slug.trim(),
        photoUrl: mainPhoto || undefined,
        images: galleryImages.length > 0 ? galleryImages : undefined,
        categoryId: data.categoryId || null,
        tag: data.tag?.trim() || undefined,
        bgColor: data.bgColor?.trim() || undefined,
        projectLink: data.projectLink?.trim() || undefined,
        shortDescription: data.shortDescription?.trim() || undefined,
        fullDescription: data.fullDescription || undefined,
        stats: statsList.filter((s) => s.name && s.count),
        metrics: statsList
          .filter((s) => s.name && s.count)
          .map((s) => ({ label: s.name, value: s.count })),
        challenge: data.challenge || undefined,
        challengePhoto: challengePhotosList[0]?.photoUrl || data.challengePhoto || undefined,
        challengePhotoDescription: challengePhotosList[0]?.description || data.challengePhotoDescription || undefined,
        challengePhotos: challengePhotosList.filter((p) => p.photoUrl || p.description || p.title),
        solution: data.solution || undefined,
        solutionPhoto: solutionPhotosList[0]?.photoUrl || data.solutionPhoto || undefined,
        solutionPhotoDescription: solutionPhotosList[0]?.description || data.solutionPhotoDescription || undefined,
        solutionPhotos: solutionPhotosList.filter((p) => p.photoUrl || p.description || p.title),
        technologies: data.technologies || undefined,
        order: Number(data.order) || 0,
        isActive: data.isActive,
      };

      if (isEditing) {
        const result = await updateCasestudy({
          id: casestudyData.id,
          data: payload,
        });

        if (result?.error) {
          toast.error(result?.error?.data?.message || "Failed to update case study");
        } else {
          toast.success("Case study updated successfully");
          reset();
          onSuccess?.();
        }
      } else {
        const result = await createCasestudy(payload);

        if (result?.error) {
          toast.error(result?.error?.data?.message || "Failed to create case study");
        } else {
          toast.success("Case study created successfully");
          reset();
          onSuccess?.();
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  const categoryOptions = [
    { value: "", label: "None / Select Category" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

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
          General & Media
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("stats")}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "stats"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Stats & Metrics ({statsList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("challengeSolution")}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "challengeSolution"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          Challenge & Solution Photos
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
      </div>

      {/* Tab 1: General & Media */}
      {activeTab === "general" && (
        <div className="space-y-4">
          <TextField
            label="Case Study Title *"
            placeholder="e.g. Medical Healthcare Website - Patient-Centered Experience"
            register={register}
            name="title"
            error={errors.title?.message}
            required
          />

          {/* Slug */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-black font-[500] dark:text-white/75 text-[14px]">
                URL Slug *
              </label>
              <button
                type="button"
                onClick={() => setValue("slug", slugify(watchedTitle), { shouldValidate: true })}
                className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auto-generate
              </button>
            </div>
            <input
              type="text"
              {...register("slug")}
              onChange={(e) => {
                setAutoSlug(false);
                setValue("slug", slugify(e.target.value), { shouldValidate: true });
              }}
              placeholder="medical-healthcare-website"
              className="border-[1px] border-[#E4E4E7] dark:border-white/10 py-2.5 px-4 rounded-[6px] bg-white dark:bg-gray-800 w-full outline-none text-sm text-gray-900 dark:text-white focus:border-primary"
            />
            {errors.slug && <p className="mt-1 text-sm text-red-500">{errors.slug.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Dropdown
                  LabelName="Category"
                  options={categoryOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select Category"
                />
              )}
            />

            <TextField
              label="Tag / Industry"
              placeholder="e.g. Healthcare & Telemedicine"
              register={register}
              name="tag"
              error={errors.tag?.message}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Card Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  {...register("bgColor")}
                  className="w-10 h-10 p-0.5 rounded border border-gray-300 dark:border-gray-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  {...register("bgColor")}
                  placeholder="#1D0C01"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent uppercase font-mono"
                />
              </div>
            </div>
          </div>

          {/* Quick Bg Color Presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-500">Preset Themes:</span>
            {PRESET_BG_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setValue("bgColor", color.value)}
                style={{ backgroundColor: color.value }}
                className={`w-6 h-6 rounded-full border border-white/20 transition-transform hover:scale-110 ${
                  watchedBgColor === color.value ? "ring-2 ring-primary ring-offset-2" : ""
                }`}
                title={color.label}
              />
            ))}
          </div>

          {/* Main Cover Image */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Featured Display Image (Hero Photo)
            </label>
            <div className="flex items-center gap-3">
              {mainPhoto ? (
                <div className="relative w-20 h-14 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <img src={mainPhoto} alt="Cover" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setMainPhoto("")}
                    className="absolute top-1 right-1 p-0.5 bg-black/70 rounded-full text-white hover:bg-black"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-md cursor-pointer hover:border-primary text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                  <Upload className="w-3.5 h-3.5 text-gray-400" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setMainPhoto)}
                    disabled={uploadLoading}
                    className="hidden"
                  />
                </label>
              )}
              <input
                type="text"
                value={mainPhoto}
                onChange={(e) => setMainPhoto(e.target.value)}
                placeholder="Or paste image URL"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Multi-Images Gallery */}
          <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Multi-Images Gallery ({galleryImages.length})
              </label>
              <label className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer font-medium">
                <Upload className="w-3 h-3" />
                Upload New Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileUpload(e, (url) => setGalleryImages([...galleryImages, url]))
                  }
                  disabled={uploadLoading}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newGalleryInput}
                onChange={(e) => setNewGalleryInput(e.target.value)}
                placeholder="Or paste additional image URL and click Add"
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent"
              />
              <button
                type="button"
                onClick={() => handleAddGalleryImage(newGalleryInput)}
                className="px-3 py-1.5 text-xs bg-primary text-white rounded-md font-medium hover:bg-primary/90"
              >
                Add Image
              </button>
            </div>

            {/* Gallery Thumbnails */}
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                {galleryImages.map((imgUrl, i) => (
                  <div
                    key={i}
                    className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group"
                  >
                    <img src={imgUrl} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(i)}
                      className="absolute top-1 right-1 p-0.5 bg-red-600 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <TextareaField
            label="Short Description"
            placeholder="A compelling summary of the case study and key outcomes..."
            register={register}
            name="shortDescription"
            rows={2}
          />

          <div className="space-y-1.5">
            <label className="text-black font-[500] dark:text-white/75 text-[14px]">
              Full Overview & Case Study Story
            </label>
            <Controller
              name="fullDescription"
              control={control}
              render={({ field }) => (
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <SimpleRichTextEditor
                    content={field.value || ""}
                    onChangeContent={(html) => field.onChange(html)}
                    height={300}
                  />
                </div>
              )}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Stats & Metrics */}
      {activeTab === "stats" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                Key Performance Stats & Metrics
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                Add metrics like <strong>76% Workflow efficiency</strong>, <strong>78% Team productivity</strong>, <strong>1.2M+ Client workflows optimized</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddStat}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Stat
            </button>
          </div>

          <div className="space-y-3">
            {statsList.map((stat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                  #{idx + 1}
                </div>
                <div className="w-1/3">
                  <label className="text-[11px] font-medium text-gray-500 uppercase">
                    Count / Value *
                  </label>
                  <input
                    type="text"
                    value={stat.count}
                    onChange={(e) => handleUpdateStat(idx, "count", e.target.value)}
                    placeholder="e.g. 76% or 1.2M+"
                    className="w-full px-3 py-1.5 text-sm font-bold border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-medium text-gray-500 uppercase">
                    Metric Name / Label *
                  </label>
                  <input
                    type="text"
                    value={stat.name}
                    onChange={(e) => handleUpdateStat(idx, "name", e.target.value)}
                    placeholder="e.g. Workflow efficiency or Team productivity"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveStat(idx)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md mt-4"
                  title="Remove stat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Live Stats Preview */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-900 text-white mt-4">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold block mb-3">
              Stats Display Preview
            </span>
            <div className="grid grid-cols-3 gap-4">
              {statsList.map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    {stat.count || "0%"}
                  </span>
                  <span className="text-xs md:text-sm text-gray-400 mt-1">
                    {stat.name || "Metric label"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Challenge & Solution Photos */}
      {activeTab === "challengeSolution" && (
        <div className="space-y-6">
          {/* Challenge Section */}
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              The Challenge Section
            </div>

            <div className="space-y-1.5">
              <label className="text-black font-[500] dark:text-white/75 text-[14px]">
                Challenge Overview
              </label>
              <Controller
                name="challenge"
                control={control}
                render={({ field }) => (
                  <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <SimpleRichTextEditor
                      content={field.value || ""}
                      onChangeContent={(html) => field.onChange(html)}
                      height={240}
                    />
                  </div>
                )}
              />
            </div>

            {/* Multi Challenge Visuals Section */}
            <div className="space-y-4 pt-4 border-t border-amber-200/60 dark:border-amber-900/40">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                    Challenge Visuals & Photo-wise Analyses ({challengePhotosList.length})
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Add multiple screenshots, diagrams, and attach detailed rich-text analyses to each
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddChallengePhoto}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Challenge Visual
                </button>
              </div>

              {challengePhotosList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-white/80 dark:bg-gray-900/80 shadow-sm space-y-3 relative"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                      Challenge Visual #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChallengePhoto(idx)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                      title="Remove visual"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Photo Upload & URL */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Visual / Diagram Photo
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-md cursor-pointer hover:border-primary text-xs bg-gray-50 dark:bg-gray-800">
                        <Upload className="w-3.5 h-3.5 text-gray-400" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileUpload(e, (url) =>
                              handleUpdateChallengePhoto(idx, "photoUrl", url)
                            )
                          }
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={item.photoUrl}
                        onChange={(e) =>
                          handleUpdateChallengePhoto(idx, "photoUrl", e.target.value)
                        }
                        placeholder="Or paste photo URL"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent"
                      />
                    </div>
                    {item.photoUrl && (
                      <div className="mt-2 h-24 w-40 rounded-lg overflow-hidden border">
                        <img
                          src={item.photoUrl}
                          alt={`Challenge visual ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Title / Caption */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Visual Title / Caption (Optional)
                    </label>
                    <input
                      type="text"
                      value={item.title || ""}
                      onChange={(e) =>
                        handleUpdateChallengePhoto(idx, "title", e.target.value)
                      }
                      placeholder="e.g. Navigation Architecture Bottleneck"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent"
                    />
                  </div>

                  {/* Description with SimpleRichTextEditor */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Photo-wise Detailed Description
                    </label>
                    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <SimpleRichTextEditor
                        content={item.description || ""}
                        onChangeContent={(html) =>
                          handleUpdateChallengePhoto(idx, "description", html)
                        }
                        height={180}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {challengePhotosList.length === 0 && (
                <div className="text-center py-6 border border-dashed border-amber-300 dark:border-amber-900/40 rounded-xl bg-amber-50/10">
                  <p className="text-xs text-gray-500 mb-2">No challenge visual photos added yet</p>
                  <button
                    type="button"
                    onClick={handleAddChallengePhoto}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add First Challenge Visual
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Solution Section */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-sm">
              <Lightbulb className="w-4 h-4" />
              The Solution Section
            </div>

            <div className="space-y-1.5">
              <label className="text-black font-[500] dark:text-white/75 text-[14px]">
                Solution Overview
              </label>
              <Controller
                name="solution"
                control={control}
                render={({ field }) => (
                  <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <SimpleRichTextEditor
                      content={field.value || ""}
                      onChangeContent={(html) => field.onChange(html)}
                      height={240}
                    />
                  </div>
                )}
              />
            </div>

            {/* Multi Solution Visuals Section */}
            <div className="space-y-4 pt-4 border-t border-emerald-200/60 dark:border-emerald-900/40">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                    Solution Visuals & Photo-wise Analyses ({solutionPhotosList.length})
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Add multiple screenshots, mockups, and attach detailed rich-text analyses to each
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSolutionPhoto}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Solution Visual
                </button>
              </div>

              {solutionPhotosList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-white/80 dark:bg-gray-900/80 shadow-sm space-y-3 relative"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                      Solution Visual #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSolutionPhoto(idx)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                      title="Remove visual"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Photo Upload & URL */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Visual / Mockup Photo
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-md cursor-pointer hover:border-primary text-xs bg-gray-50 dark:bg-gray-800">
                        <Upload className="w-3.5 h-3.5 text-gray-400" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileUpload(e, (url) =>
                              handleUpdateSolutionPhoto(idx, "photoUrl", url)
                            )
                          }
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={item.photoUrl}
                        onChange={(e) =>
                          handleUpdateSolutionPhoto(idx, "photoUrl", e.target.value)
                        }
                        placeholder="Or paste photo URL"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent"
                      />
                    </div>
                    {item.photoUrl && (
                      <div className="mt-2 h-24 w-40 rounded-lg overflow-hidden border">
                        <img
                          src={item.photoUrl}
                          alt={`Solution visual ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Title / Caption */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Visual Title / Caption (Optional)
                    </label>
                    <input
                      type="text"
                      value={item.title || ""}
                      onChange={(e) =>
                        handleUpdateSolutionPhoto(idx, "title", e.target.value)
                      }
                      placeholder="e.g. Modernized Responsive Workspace"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent"
                    />
                  </div>

                  {/* Description with SimpleRichTextEditor */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Photo-wise Detailed Description
                    </label>
                    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <SimpleRichTextEditor
                        content={item.description || ""}
                        onChangeContent={(html) =>
                          handleUpdateSolutionPhoto(idx, "description", html)
                        }
                        height={180}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {solutionPhotosList.length === 0 && (
                <div className="text-center py-6 border border-dashed border-emerald-300 dark:border-emerald-900/40 rounded-xl bg-emerald-50/10">
                  <p className="text-xs text-gray-500 mb-2">No solution visual photos added yet</p>
                  <button
                    type="button"
                    onClick={handleAddSolutionPhoto}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add First Solution Visual
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Live Project Link"
              placeholder="e.g. https://www.behance.net/gallery/..."
              register={register}
              name="projectLink"
            />
            <TextField
              label="Technologies Used"
              placeholder="e.g. Next.js, Figma, Tailwind CSS, TypeORM"
              register={register}
              name="technologies"
            />
          </div>
        </div>
      )}

      {/* Tab 4: Live Preview */}
      {activeTab === "preview" && (
        <div
          className="rounded-xl p-6 transition-colors space-y-6 text-white border border-white/10"
          style={{ backgroundColor: watchedBgColor || "#1D0C01" }}
        >
          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              [ Case Study Live Card Preview ]
            </span>
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className="flex items-center gap-1 text-xs text-gray-300 hover:text-white px-3 py-1 rounded bg-white/10"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Form
            </button>
          </div>

          {/* Hero Showcase Photo */}
          {mainPhoto && (
            <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
              <img src={mainPhoto} alt="Hero" className="w-full h-auto object-cover max-h-[380px]" />
            </div>
          )}

          {/* Info */}
          <div>
            {watchedTag && (
              <span className="text-xs uppercase tracking-wider text-primary font-bold block mb-2">
                {watchedTag}
              </span>
            )}
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
              {watchedTitle || "Case Study Title"}
            </h2>
            {watchedShortDesc && (
              <p className="text-base text-gray-300 leading-relaxed mt-3">
                {watchedShortDesc}
              </p>
            )}
          </div>

          {/* Stats Metrics Row */}
          <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/10">
            {statsList.map((stat, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="text-xl md:text-2xl font-bold text-white">
                  {stat.count || "0%"}
                </span>
                <span className="text-xs md:text-sm text-gray-300 mt-1">
                  {stat.name || "Metric"}
                </span>
              </div>
            ))}
          </div>

          {/* Challenge & Solution Preview */}
          {(watchedChallenge || watchedSolution || challengePhotosList.length > 0 || solutionPhotosList.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
              {/* Challenge column */}
              {(watchedChallenge || challengePhotosList.length > 0) && (
                <div className="p-4 rounded-lg bg-black/30 border border-white/5 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase">Challenge Overview</h4>
                  {watchedChallenge && (
                    <div
                      dangerouslySetInnerHTML={{ __html: watchedChallenge }}
                      className="blog-preview-content text-xs text-gray-300 line-clamp-4 space-y-1"
                    />
                  )}
                  {challengePhotosList.map((cp, i) => (
                    <div key={i} className="p-2.5 rounded bg-white/5 border border-white/5 space-y-2">
                      {cp.title && (
                        <span className="text-[11px] font-semibold text-amber-300 block">{cp.title}</span>
                      )}
                      {cp.photoUrl && (
                        <img src={cp.photoUrl} alt={`Challenge ${i + 1}`} className="rounded h-24 w-full object-cover" />
                      )}
                      {cp.description && (
                        <div
                          dangerouslySetInnerHTML={{ __html: cp.description }}
                          className="blog-preview-content text-[11px] text-gray-400 italic line-clamp-3 space-y-1"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Solution column */}
              {(watchedSolution || solutionPhotosList.length > 0) && (
                <div className="p-4 rounded-lg bg-black/30 border border-white/5 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase">Solution Overview</h4>
                  {watchedSolution && (
                    <div
                      dangerouslySetInnerHTML={{ __html: watchedSolution }}
                      className="blog-preview-content text-xs text-gray-300 line-clamp-4 space-y-1"
                    />
                  )}
                  {solutionPhotosList.map((sp, i) => (
                    <div key={i} className="p-2.5 rounded bg-white/5 border border-white/5 space-y-2">
                      {sp.title && (
                        <span className="text-[11px] font-semibold text-emerald-300 block">{sp.title}</span>
                      )}
                      {sp.photoUrl && (
                        <img src={sp.photoUrl} alt={`Solution ${i + 1}`} className="rounded h-24 w-full object-cover" />
                      )}
                      {sp.description && (
                        <div
                          dangerouslySetInnerHTML={{ __html: sp.description }}
                          className="blog-preview-content text-[11px] text-gray-400 italic line-clamp-3 space-y-1"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-4 border-t dark:border-gray-800">
        <div className="text-xs text-gray-500">
          * Required fields
        </div>
        <div className="flex items-center space-x-3">
          <PrimaryButton type="button" onClick={onCancel} variant="secondary">
            Cancel
          </PrimaryButton>
          <PrimaryButton type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEditing ? "Update Case Study" : "Create Case Study"}
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
};

export default CaseStudyForm;
