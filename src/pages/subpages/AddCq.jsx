"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import {
  Upload,
  RotateCcw,
  BookOpen,
  ImageIcon,
  Plus,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react"
import LatexRenderer from "./LatexRenderer"
import "katex/dist/katex.min.css"
import axios from "../../config/axios.js"
import { useNavigate } from "react-router-dom"
import { showSuccessToast, showErrorToast, showWarningToast } from "../../../lib/toast"

// --- Reusable, Restyled Sub-Components ---

const FormCard = ({ children, title }) => (
  <div className="bg-white rounded-xl shadow-sm">
    <div className="p-5 border-b border-slate-200">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
    </div>
    <div className="p-6 space-y-6">{children}</div>
  </div>
)

const FormField = ({ label, children, error, isRequired }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {label} {isRequired && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
  </div>
)

const StyledInput = (props) => (
  <input
    {...props}
    className={`block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                    disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
                    ${props.className || ""} ${props.error ? "border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500" : ""}`}
  />
)

const StyledSelect = (props) => (
  <select
    {...props}
    className={`block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm
                    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                    disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200
                    ${props.className || ""} ${props.error ? "border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500" : ""}`}
  >
    {props.children}
  </select>
)

const StyledTextarea = (props) => (
  <textarea
    {...props}
    className={`block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                    ${props.className || ""} ${props.error ? "border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500" : ""}`}
  />
)

const PreviewBox = ({ label, children }) => (
  <div className="mt-4 p-4 bg-slate-100 border border-slate-200 rounded-lg">
    <label className="block text-sm font-bold text-slate-600 mb-2">{label}</label>
    <div className="prose prose-sm max-w-none text-slate-800">{children}</div>
  </div>
)

const QuestionPartInput = ({ partLabel, type, value, onChange, error, isRequired }) => (
  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
    <FormField label={`${partLabel}) ${type}`} error={error} isRequired={isRequired}>
      <StyledTextarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter option ${partLabel} content...`}
        rows="4"
      />
    </FormField>
    <PreviewBox label={`Preview ${partLabel}`}>
      <LatexRenderer latex={value} />
    </PreviewBox>
  </div>
)

const AnswerPartInput = ({
  partLabel,
  value,
  onChange,
  error,
  isRequired,
  imageFile,
  imagePreview,
  onImageChange,
  showImageUploader,
}) => (
  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
    <FormField label={`Answer for Option ${partLabel}`} error={error} isRequired={isRequired}>
      <StyledTextarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter the answer for option ${partLabel}...`}
        rows="4"
      />
    </FormField>
    <PreviewBox label={`Preview Answer ${partLabel}`}>
      <LatexRenderer latex={value} />
    </PreviewBox>
    {showImageUploader && (
      <ImageUploader
        imageFile={imageFile}
        imagePreview={imagePreview}
        onImageChange={(file, preview) => onImageChange(file, preview)}
        label={`Answer Image for ${partLabel} (Optional)`}
      />
    )}
  </div>
)

const ImageUploader = ({ imageFile, imagePreview, onImageChange, label }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => onImageChange(file, reader.result)
      reader.readAsDataURL(file)
    }
  }
  const clearImage = () => onImageChange(null, null)

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {!imagePreview ? (
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-slate-500" />
              <p className="mb-1 text-sm text-slate-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-slate-500">PNG, JPG, GIF (MAX. 10MB)</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        </div>
      ) : (
        <div className="relative w-40 h-40">
          <img
            src={imagePreview || "/placeholder.svg"}
            alt="Preview"
            className="object-cover w-full h-full rounded-md border border-slate-200"
          />
          <button
            type="button"
            className="absolute top-1.5 right-1.5 bg-white rounded-full p-1 shadow-md text-slate-600 hover:text-red-500 transition-colors"
            onClick={clearImage}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

const ImageUploadModal = ({ isOpen, onClose, onSubmit, isLoading, title, buttonText, maxImages }) => {
  const [selectedImages, setSelectedImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const fileInputRef = useRef(null)

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + selectedImages.length > maxImages) {
      showErrorToast(`You can only upload up to ${maxImages} images.`)
      return
    }
    setSelectedImages((prev) => [...prev, ...files])
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setImagePreviews((prev) => [...prev, ...newPreviews])
  }

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index])
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (selectedImages.length === 0) {
      showErrorToast("Please select at least one image.")
      return
    }
    onSubmit(selectedImages)
  }

  const handleClose = () => {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url))
    setSelectedImages([])
    setImagePreviews([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden bg-white rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 text-gray-500 rounded-full hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center p-6 mb-4 border-2 border-dashed rounded-lg bg-slate-50">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              multiple
              className="hidden"
              disabled={isLoading || selectedImages.length >= maxImages}
            />
            <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || selectedImages.length >= maxImages}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} className="mr-2" />
              <span>Add Images</span>
            </button>
            <p className="mt-2 text-xs text-gray-500">
              Max {maxImages} images. ({selectedImages.length}/{maxImages} selected)
            </p>
          </div>
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <div className="overflow-hidden bg-gray-100 border rounded-lg aspect-square">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    disabled={isLoading}
                    className="absolute -top-2 -right-2 p-1 text-white bg-red-500 rounded-full opacity-0 group-hover:opacity-100 disabled:opacity-50 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end p-4 space-x-3 border-t bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || selectedImages.length === 0}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              buttonText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
const AnswerUploadModal = (props) => <ImageUploadModal {...props} />

const Stepper = ({ currentStep, steps }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4">
        {steps.map((stepName, stepIdx) => {
          const isCompleted = stepIdx < currentStep
          const isCurrent = stepIdx === currentStep

          return (
            <li key={stepName} className="relative">
              {stepIdx !== steps.length - 1 && (
                <div
                  className={`absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 ${isCompleted ? "bg-blue-600" : "bg-slate-300"}`}
                />
              )}
              <div className="relative flex items-start group">
                <span className="flex items-center h-9">
                  <span
                    className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full 
                                        ${isCompleted ? "bg-blue-600" : isCurrent ? "border-2 border-blue-600 bg-white" : "border-2 border-slate-300 bg-white"}`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <span className={`h-2.5 w-2.5 rounded-full ${isCurrent ? "bg-blue-600" : "bg-slate-300"}`} />
                    )}
                  </span>
                </span>
                <span className="ml-4 flex min-w-0 flex-col mt-1">
                  <span className={`text-sm font-medium ${isCurrent ? "text-blue-600" : "text-slate-500"}`}>
                    {stepName}
                  </span>
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

const QuestionEntryStep = ({ version, data, handlers, errors, dynamicTopics, isMathSubject, onAiClick }) => {
  const versionTitle = version.charAt(0).toUpperCase() + version.slice(1)
  const { onInputChange, onImageChange, onTopicChange } = handlers

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onAiClick}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <ImageIcon className="w-16 h-16 mr-2" /> Add Question from Image
      </button>

      <div>
        <FormField label={`${versionTitle} Stem`} isRequired>
          <StyledTextarea
            value={data.stem}
            onChange={(e) => onInputChange("stem", e.target.value)}
            placeholder={`Enter the main question in ${versionTitle}...`}
            rows="6"
            error={errors.stem}
          />
        </FormField>
        <PreviewBox label={`${versionTitle} Stem Preview`}>
          <LatexRenderer latex={data.stem} />
        </PreviewBox>
      </div>

      <ImageUploader
        imageFile={data.stemImageFile}
        imagePreview={data.stemImagePreview}
        onImageChange={(file, preview) => onImageChange("stem", file, preview)}
        label="Stem Image (Optional)"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <QuestionPartInput
          partLabel="A"
          type="Knowledge-based"
          value={data.a}
          onChange={(val) => onInputChange("a", val)}
          error={errors.a}
          isRequired
        />
        <QuestionPartInput
          partLabel="B"
          type="Comprehension"
          value={data.b}
          onChange={(val) => onInputChange("b", val)}
          error={errors.b}
          isRequired
        />

        <div className="space-y-6">
          {/* MODIFICATION START: Updated C part to be optional and conditionally required */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
            <FormField label={`C) Application (Optional)`} error={errors.c}>
              <StyledTextarea
                value={data.c}
                onChange={(e) => onInputChange("c", e.target.value)}
                placeholder={`Enter option C content...`}
                rows="4"
              />
            </FormField>
            <PreviewBox label="Preview C">
              <LatexRenderer latex={data.c} />
            </PreviewBox>

            <FormField label="Topic for C" isRequired={!!data.c.trim()} error={errors.cTopic}>
              <StyledSelect
                value={data.cTopic?.value?._id || ""}
                onChange={(e) => onTopicChange("cTopic", e.target.value)}
                disabled={dynamicTopics.length === 0}
                error={errors.cTopic}
              >
                <option value="">Select Topic</option>
                {dynamicTopics.map((topic) => (
                  <option key={topic.value._id} value={topic.value._id}>
                    {topic.label}
                  </option>
                ))}
              </StyledSelect>
            </FormField>
            <FormField label="Question Type for C" isRequired={!!data.c.trim()} error={errors.cQuestionType}>
              <StyledSelect
                value={data.cQuestionType || ""}
                onChange={(e) => onInputChange("cQuestionType", e.target.value)}
                disabled={
                  !data.cTopic || !data.cTopic.value.questionTypes || data.cTopic.value.questionTypes.length === 0
                }
                error={errors.cQuestionType}
              >
                <option value="">Select Question Type</option>
                {data.cTopic?.value?.questionTypes?.map((qType) => (
                  <option key={qType._id} value={qType.english}>
                    {qType.english}
                  </option>
                ))}
              </StyledSelect>
            </FormField>
          </div>

          {/* MODIFICATION START: Updated D part to be optional and conditionally required */}
          {!isMathSubject && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
              <FormField label={`D) Higher Order (Optional)`} error={errors.d}>
                <StyledTextarea
                  value={data.d}
                  onChange={(e) => onInputChange("d", e.target.value)}
                  placeholder={`Enter option D content...`}
                  rows="4"
                />
              </FormField>
              <PreviewBox label="Preview D">
                <LatexRenderer latex={data.d} />
              </PreviewBox>

              <FormField label="Topic for D" isRequired={!!data.d.trim()} error={errors.dTopic}>
                <StyledSelect
                  value={data.dTopic?.value?._id || ""}
                  onChange={(e) => onTopicChange("dTopic", e.target.value)}
                  disabled={dynamicTopics.length === 0}
                  error={errors.dTopic}
                >
                  <option value="">Select Topic</option>
                  {dynamicTopics.map((topic) => (
                    <option key={topic.value._id} value={topic.value._id}>
                      {topic.label}
                    </option>
                  ))}
                </StyledSelect>
              </FormField>
              <FormField label="Question Type for D" isRequired={!!data.d.trim()} error={errors.dQuestionType}>
                <StyledSelect
                  value={data.dQuestionType || ""}
                  onChange={(e) => onInputChange("dQuestionType", e.target.value)}
                  disabled={
                    !data.dTopic || !data.dTopic.value.questionTypes || data.dTopic.value.questionTypes.length === 0
                  }
                  error={errors.dQuestionType}
                >
                  <option value="">Select Question Type</option>
                  {data.dTopic?.value?.questionTypes?.map((qType) => (
                    <option key={qType._id} value={qType.english}>
                      {qType.english}
                    </option>
                  ))}
                </StyledSelect>
              </FormField>
            </div>
          )}
          {/* MODIFICATION END */}
        </div>
      </div>
    </div>
  )
}

const AnswerEntryStep = ({ data, handlers, errors, isMathSubject, onAiClick }) => {
  const { onInputChange, onImageChange } = handlers
  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onAiClick}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <ImageIcon className="w-16 h-16 mr-2" /> Add Answers from Image
      </button>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnswerPartInput
          partLabel="A"
          value={data.aAnswer}
          onChange={(val) => onInputChange("aAnswer", val)}
          error={errors.aAnswer}
          isRequired
        />
        <AnswerPartInput
          partLabel="B"
          value={data.bAnswer}
          onChange={(val) => onInputChange("bAnswer", val)}
          error={errors.bAnswer}
          isRequired
        />
        {/* MODIFICATION START: Answer C is now required only if Question C has text */}
        <AnswerPartInput
          partLabel="C"
          value={data.cAnswer}
          onChange={(val) => onInputChange("cAnswer", val)}
          error={errors.cAnswer}
          isRequired={!!data.c.trim()}
          showImageUploader
          onImageChange={(file, preview) => onImageChange("cAnswer", file, preview)}
          imageFile={data.cAnswerImageFile}
          imagePreview={data.cAnswerImagePreview}
        />
        {/* MODIFICATION END */}

        {/* MODIFICATION START: Answer D is now required only if Question D has text */}
        {!isMathSubject && (
          <AnswerPartInput
            partLabel="D"
            value={data.dAnswer}
            onChange={(val) => onInputChange("dAnswer", val)}
            error={errors.dAnswer}
            isRequired={!!data.d.trim()}
            showImageUploader
            onImageChange={(file, preview) => onImageChange("dAnswer", file, preview)}
            imageFile={data.dAnswerImageFile}
            imagePreview={data.dAnswerImagePreview}
          />
        )}
        {/* MODIFICATION END */}
      </div>
    </div>
  )
}

// --- Main Page Component ---
const createInitialVersionState = () => ({
  stem: "",
  stemImageFile: null,
  stemImagePreview: null,
  a: "",
  aAnswer: "",
  b: "",
  bAnswer: "",
  c: "",
  cAnswer: "",
  cTopic: null,
  cQuestionType: "",
  cAnswerImageFile: null,
  cAnswerImagePreview: null,
  cType: "Application",
  d: "",
  dAnswer: "",
  dTopic: null,
  dQuestionType: "",
  dAnswerImageFile: null,
  dAnswerImagePreview: null,
  dType: "Higher Order",
})

const AddCreativeQuestionPage = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    group: "",
    board: "",
    institution: { name: "", examType: "" },
    year: new Date().getFullYear(),
    subject: "",
    level: "",
    chapter: null,
    english: createInitialVersionState(),
    bangla: createInitialVersionState(),
  })
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState({})

  // Data fetching states
  const [dynamicSubjects, setDynamicSubjects] = useState([])
  const [dynamicChapters, setDynamicChapters] = useState([])
  const [dynamicTopics, setDynamicTopics] = useState([])
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(false)
  const [subjectsError, setSubjectsError] = useState(null)

  // Modal and loading states
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false)
  const [isAnswerUploadModalOpen, setIsAnswerUploadModalOpen] = useState(false)
  const [isImageUploadLoading, setIsImageUploadLoading] = useState(false)
  const [isAnswerUploadLoading, setIsAnswerUploadLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionSuccess, setSubmissionSuccess] = useState(false)
  const [submissionError, setSubmissionError] = useState("")

  // --- Data Fetching ---
  useEffect(() => {
    const fetchSubjects = async () => {
      if (formData.group && formData.level) {
        setIsSubjectsLoading(true)
        setSubjectsError(null)
        setDynamicSubjects([])
        setDynamicChapters([])
        setDynamicTopics([])
        setFormData((prev) => ({ ...prev, subject: "", chapter: null }))
        try {
          const response = await axios.get(`/subject/filter?group=${formData.group}&level=${formData.level}`)
          console.log(response.data.data)
          setDynamicSubjects(response.data.data || [])
        } catch (err) {
          setSubjectsError(err.message || "An error occurred.")
        } finally {
          setIsSubjectsLoading(false)
        }
      }
    }
    fetchSubjects()
  }, [formData.group, formData.level])

  useEffect(() => {
    if (formData.subject) {
      const selectedSubject = dynamicSubjects.find((sub) => sub._id === formData.subject)
      setDynamicChapters(selectedSubject?.chapters || [])
      setFormData((prev) => ({ ...prev, chapter: null }))
      setDynamicTopics([])
    }
  }, [formData.subject, dynamicSubjects])

  useEffect(() => {
    if (formData.chapter) {
      const topics =
        formData.chapter?.topics.map((t) => ({ value: t, label: `${t.englishName} (${t.banglaName})` })) || []
      setDynamicTopics(topics)
    }
  }, [formData.chapter])

  const isMathSubject = useMemo(() => {
    if (!formData.subject || !dynamicSubjects.length) return false
    const subject = dynamicSubjects.find((s) => s._id === formData.subject)
    return [
      "General Mathematics",
      "Higher Mathematics",
      "Higher Mathematics 1st Paper",
      "Higher Mathematics 2nd Paper",
    ].includes(subject?.englishName)
  }, [formData.subject, dynamicSubjects])

  // --- State Handlers ---
  const handleRootChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }
  const handleVersionedInputChange = (version, field, value) =>
    setFormData((prev) => ({ ...prev, [version]: { ...prev[version], [field]: value } }))
  const handleVersionedImageChange = (version, fieldPrefix, file, preview) =>
    setFormData((prev) => ({
      ...prev,
      [version]: { ...prev[version], [`${fieldPrefix}ImageFile`]: file, [`${fieldPrefix}ImagePreview`]: preview },
    }))
  const handleVersionedTopicChange = (version, field, topicId) => {
    const selectedTopic = dynamicTopics.find((t) => t.value._id === topicId) || null
    const questionTypeField = field === "cTopic" ? "cQuestionType" : "dQuestionType"

    setFormData((prev) => ({
      ...prev,
      [version]: {
        ...prev[version],
        [field]: selectedTopic,
        [questionTypeField]: "",
      },
    }))
  }

  // --- AI Integration ---
  const handleAiResponse = (responseData, version) => {
    setFormData((prev) => ({
      ...prev,
      [version]: {
        ...prev[version],
        stem: responseData.stem || prev[version].stem,
        a: responseData.a || prev[version].a,
        aAnswer: responseData.aAnswer || prev[version].aAnswer,
        b: responseData.b || prev[version].b,
        bAnswer: responseData.bAnswer || prev[version].bAnswer,
        c: responseData.c || prev[version].c,
        cAnswer: responseData.cAnswer || prev[version].cAnswer,
        d: responseData.d || prev[version].d,
        dAnswer: responseData.dAnswer || prev[version].dAnswer,
      },
    }))
  }
  const handleImageUploadSubmit = async (images) => {
    setIsImageUploadLoading(true)
    try {
      const formDataToSend = new FormData()
      images.forEach((image) => formDataToSend.append("qb", image))
      const response = await axios.post("/ai/extract-cq", formDataToSend)
      handleAiResponse(response.data.data[0], "english")
      handleAiResponse(response.data.data[1], "bangla")
      setIsImageUploadModalOpen(false)
      showSuccessToast("Questions generated successfully!")
    } catch (error) {
      showErrorToast("Failed to generate questions.")
    } finally {
      setIsImageUploadLoading(false)
    }
  }
  const handleAnswerUploadSubmit = async (images) => {
    setIsAnswerUploadLoading(true)
    try {
      const formDataToSend = new FormData()
      images.forEach((image) => formDataToSend.append("qb", image))
      const response = await axios.post("/ai/extract-cq-answers", formDataToSend)
      handleAiResponse(response.data.data[0], "english")
      handleAiResponse(response.data.data[1], "bangla")
      setIsAnswerUploadModalOpen(false)
      showSuccessToast("Answers generated successfully!")
    } catch (error) {
      showErrorToast("Failed to generate answers.")
    } finally {
      setIsAnswerUploadLoading(false)
    }
  }

  // --- Validation Logic ---
  const validateCurrentStep = () => {
    const missingFields = []
    switch (step) {
      case 0:
        if (!formData.level) missingFields.push("Level")
        if (!formData.group) missingFields.push("Group")
        break
      case 1:
        if (!formData.subject) missingFields.push("Subject")
        if (!formData.chapter) missingFields.push("Chapter")
        if (!formData.board && !formData.institution.name) missingFields.push("Board or Institution")
        if (!formData.year) missingFields.push("Year")
        break
      case 2: // English Question
      case 3: // Bangla Question
        const version = step === 2 ? "english" : "bangla"
        const data = formData[version]
        if (!data.stem.trim()) missingFields.push("Stem")
        if (!data.a.trim()) missingFields.push("Question A")
        if (!data.b.trim()) missingFields.push("Question B")

        // MODIFICATION START: Updated validation for optional C and D parts
        // Validate C part only if user started filling it
        if (data.c.trim()) {
          if (!data.cTopic) missingFields.push("Topic for C")
          if (!data.cQuestionType.trim()) missingFields.push("Question Type for C")
        }

        // Validate D part only if not Math and user started filling it
        if (!isMathSubject && data.d.trim()) {
          if (!data.dTopic) missingFields.push("Topic for D")
          if (!data.dQuestionType.trim()) missingFields.push("Question Type for D")
        }
        // MODIFICATION END
        break
      case 4: // English Answer
      case 5: // Bangla Answer
        const ansVersion = step === 4 ? "english" : "bangla"
        const ansData = formData[ansVersion]
        if (!ansData.aAnswer.trim()) missingFields.push("Answer for A")
        if (!ansData.bAnswer.trim()) missingFields.push("Answer for B")

        // MODIFICATION START: Answer for C/D is required only if the respective question exists
        // If question C exists, its answer is required
        if (ansData.c.trim() && !ansData.cAnswer.trim()) {
          missingFields.push("Answer for C")
        }

        // If not math and question D exists, its answer is required
        if (!isMathSubject && ansData.d.trim() && !ansData.dAnswer.trim()) {
          missingFields.push("Answer for D")
        }
        // MODIFICATION END
        break
      default:
        break
    }
    return missingFields
  }

  const handleNext = () => {
    const missingFields = validateCurrentStep()
    if (missingFields.length > 0) {
      const fieldNames = missingFields.join(", ")
      const message = `Please fill the required fields: ${fieldNames}`
      showWarningToast(message)
    } else {
      setStep((s) => s + 1)
    }
  }

  const handlePrev = () => setStep((s) => s - 1)

  // --- Form Submission ---
  const buildSubmissionPayload = (versionName, linkingId) => {
    const payload = new FormData()
    const versionData = formData[versionName]

    payload.append("linkingId", linkingId)
    payload.append("group", formData.group)
    payload.append("year", formData.year)
    payload.append("subject", formData.subject)
    payload.append("level", formData.level)
    payload.append("version", versionName.charAt(0).toUpperCase() + versionName.slice(1))

    if (formData.board) payload.append("board", formData.board)
    if (formData.institution && formData.institution.name) {
      payload.append("institution", JSON.stringify(formData.institution))
    }
    if (formData.chapter) {
      const chapterPayload = {
        chapterId: formData.chapter._id,
        englishName: formData.chapter.englishName,
        banglaName: formData.chapter.banglaName,
      }
      payload.append("chapter", JSON.stringify(chapterPayload))
    }

    payload.append("stem", versionData.stem)
    if (versionData.stemImageFile) payload.append("stemImage", versionData.stemImageFile)

    payload.append("a", versionData.a)
    payload.append("aAnswer", versionData.aAnswer)
    payload.append("b", versionData.b)
    payload.append("bAnswer", versionData.bAnswer)

    // MODIFICATION START: Conditionally append C part data
    if (versionData.c && versionData.c.trim() !== "") {
      payload.append("c", versionData.c)
      payload.append("cAnswer", versionData.cAnswer)
      payload.append("cQuestionType", versionData.cQuestionType)
      payload.append("cType", versionData.cType)
      if (versionData.cAnswerImageFile) payload.append("cAnswerImage", versionData.cAnswerImageFile)
      if (versionData.cTopic && versionData.cTopic.value) {
        const cTopicPayload = {
          topicId: versionData.cTopic.value._id,
          englishName: versionData.cTopic.value.englishName,
          banglaName: versionData.cTopic.value.banglaName,
        }
        payload.append("cTopic", JSON.stringify(cTopicPayload))
      }
    }
    // MODIFICATION END

    // This part was already correctly conditional
    if (versionData.d && versionData.d.trim() !== "") {
      payload.append("d", versionData.d)
      payload.append("dAnswer", versionData.dAnswer)
      payload.append("dQuestionType", versionData.dQuestionType)
      payload.append("dType", versionData.dType)
      if (versionData.dAnswerImageFile) payload.append("dAnswerImage", versionData.dAnswerImageFile)
      if (versionData.dTopic && versionData.dTopic.value) {
        const dTopicPayload = {
          topicId: versionData.dTopic.value._id,
          englishName: versionData.dTopic.value.englishName,
          banglaName: versionData.dTopic.value.banglaName,
        }
        payload.append("dTopic", JSON.stringify(dTopicPayload))
      }
    }
    return payload
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const missingFields = validateCurrentStep()
    if (missingFields.length > 0) {
      const fieldNames = missingFields.join(", ")
      showErrorToast(`Please fill all required fields: ${fieldNames}.`)
      return
    }

    setIsSubmitting(true)
    setSubmissionSuccess(false)
    setSubmissionError("")

    const linkingId = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}`

    try {
      const englishPayload = buildSubmissionPayload("english", linkingId)
      const banglaPayload = buildSubmissionPayload("bangla", linkingId)

      await Promise.all([
        axios.post("/qb", englishPayload, { headers: { "Content-Type": "multipart/form-data" } }),
        axios.post("/qb", banglaPayload, { headers: { "Content-Type": "multipart/form-data" } }),
      ])

      setSubmissionSuccess(true)
      showSuccessToast("Questions created successfully!")
      resetForm()
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An unexpected error occurred."
      setSubmissionError(errorMessage)
      showErrorToast(`Submission Error: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      group: "",
      board: "",
      institution: { name: "", examType: "" },
      year: new Date().getFullYear(),
      subject: "",
      level: "",
      chapter: null,
      english: createInitialVersionState(),
      bangla: createInitialVersionState(),
    })
    setStep(0)
    setErrors({})
    setDynamicSubjects([])
    setDynamicChapters([])
    setDynamicTopics([])
    setSubmissionSuccess(false)
    setSubmissionError("")
  }

  const formTitles = [
    "Basic Details",
    "Subject & Context",
    "English Question",
    "Bangla Question",
    "English Answer",
    "Bangla Answer",
  ]

  return (
    <div className="min-h-screen bg-slate-100">
      <ImageUploadModal
        isOpen={isImageUploadModalOpen}
        onClose={() => setIsImageUploadModalOpen(false)}
        onSubmit={handleImageUploadSubmit}
        isLoading={isImageUploadLoading}
        title="Upload Question Images"
        buttonText="Generate Question"
        maxImages={6}
      />
      <AnswerUploadModal
        isOpen={isAnswerUploadModalOpen}
        onClose={() => setIsAnswerUploadModalOpen(false)}
        onSubmit={handleAnswerUploadSubmit}
        isLoading={isAnswerUploadLoading}
        title="Upload Answer Images"
        buttonText="Generate Answers"
        maxImages={6}
      />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-blue-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Go back
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mt-2 flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-blue-600" />
            Add Creative Question
          </h1>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <aside className="lg:col-span-3 xl:col-span-2 mb-8 lg:mb-0">
            <Stepper currentStep={step} steps={formTitles} />
          </aside>

          <main className="lg:col-span-9 xl:col-span-10">
            <form onSubmit={handleSubmit}>
              <FormCard title={formTitles[step]}>
                {submissionSuccess && (
                  <div className="p-4 mb-4 text-green-800 bg-green-100 rounded flex items-center">
                    <CheckCircle className="mr-2" />
                    Success! Question created.
                  </div>
                )}
                {submissionError && (
                  <div className="p-4 mb-4 text-red-800 bg-red-100 rounded flex items-center">
                    <AlertCircle className="mr-2" />
                    Error! {submissionError}
                  </div>
                )}

                {step === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Level" isRequired error={errors.level}>
                      <StyledSelect
                        value={formData.level}
                        onChange={(e) => handleRootChange("level", e.target.value)}
                        error={errors.level}
                      >
                        <option value="">Select Level</option>
                        <option value="SSC">SSC</option>
                        <option value="HSC">HSC</option>
                      </StyledSelect>
                    </FormField>
                    <FormField label="Group" isRequired error={errors.group}>
                      <StyledSelect
                        value={formData.group}
                        onChange={(e) => handleRootChange("group", e.target.value)}
                        error={errors.group}
                      >
                        <option value="">Select Group</option>
                        <option value="science">Science</option>
                        <option value="arts">Arts</option>
                        <option value="commerce">Commerce</option>
                      </StyledSelect>
                    </FormField>
                    {isSubjectsLoading && <p className="text-sm text-slate-500 col-span-2">Loading subjects...</p>}
                    {subjectsError && <p className="text-sm text-red-600 col-span-2">Error: {subjectsError}</p>}
                  </div>
                )}
                {step === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Subject" isRequired error={errors.subject}>
                      <StyledSelect
                        value={formData.subject}
                        onChange={(e) => handleRootChange("subject", e.target.value)}
                        error={errors.subject}
                      >
                        <option value="">Select Subject</option>
                        {dynamicSubjects.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.englishName}
                          </option>
                        ))}
                      </StyledSelect>
                    </FormField>
                    <FormField label="Chapter" isRequired error={errors.chapter}>
                      <StyledSelect
                        value={formData.chapter?._id || ""}
                        onChange={(e) =>
                          handleRootChange(
                            "chapter",
                            dynamicChapters.find((c) => c._id === e.target.value),
                          )
                        }
                        disabled={!formData.subject}
                        error={errors.chapter}
                      >
                        <option value="">Select Chapter</option>
                        {dynamicChapters.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.englishName}
                          </option>
                        ))}
                      </StyledSelect>
                    </FormField>
                    <FormField label="Board (Optional)" error={errors.board}>
                      <StyledSelect
                        value={formData.board}
                        onChange={(e) => handleRootChange("board", e.target.value)}
                        error={errors.board}
                      >
                        <option value="">Select Board</option>
                        {[
                          "Dhaka",
                          "Chittagong",
                          "Rajshahi",
                          "Sylhet",
                          "Comilla",
                          "Jessore",
                          "Dinajpur",
                          "Mymensingh",
                          "Madrasah",
                          "Barishal",
                        ].map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </StyledSelect>
                    </FormField>
                    <FormField label="Year" isRequired error={errors.year}>
                      <StyledInput
                        type="number"
                        min="2000"
                        max="2099"
                        value={formData.year}
                        onChange={(e) => handleRootChange("year", e.target.value)}
                        error={errors.year}
                      />
                    </FormField>

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField label="Institution Name (Optional)">
                        <StyledInput
                          type="text"
                          value={formData.institution.name}
                          onChange={(e) =>
                            handleRootChange("institution", { ...formData.institution, name: e.target.value })
                          }
                          placeholder="e.g., Notre Dame College"
                        />
                      </FormField>
                      <FormField label="Exam Type (Optional)">
                        <StyledSelect
                          value={formData.institution.examType}
                          onChange={(e) =>
                            handleRootChange("institution", { ...formData.institution, examType: e.target.value })
                          }
                          disabled={!formData.institution.name}
                        >
                          <option value="">Select Exam Type</option>
                          <option value="Test">Test</option>
                          <option value="Pre-Test">Pre-Test</option>
                          <option value="Half-Yearly">Half-Yearly</option>
                          <option value="Annual">Annual</option>
                          <option value="Model Test">Model Test</option>
                        </StyledSelect>
                      </FormField>
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <QuestionEntryStep
                    version="english"
                    data={formData.english}
                    errors={errors.english || {}}
                    dynamicTopics={dynamicTopics}
                    isMathSubject={isMathSubject}
                    handlers={{
                      onInputChange: (f, v) => handleVersionedInputChange("english", f, v),
                      onImageChange: (f, file, p) => handleVersionedImageChange("english", f, file, p),
                      onTopicChange: (f, v) => handleVersionedTopicChange("english", f, v),
                    }}
                    onAiClick={() => setIsImageUploadModalOpen(true)}
                  />
                )}
                {step === 3 && (
                  <QuestionEntryStep
                    version="bangla"
                    data={formData.bangla}
                    errors={errors.bangla || {}}
                    dynamicTopics={dynamicTopics}
                    isMathSubject={isMathSubject}
                    handlers={{
                      onInputChange: (f, v) => handleVersionedInputChange("bangla", f, v),
                      onImageChange: (f, file, p) => handleVersionedImageChange("bangla", f, file, p),
                      onTopicChange: (f, v) => handleVersionedTopicChange("bangla", f, v),
                    }}
                    onAiClick={() => setIsImageUploadModalOpen(true)}
                  />
                )}
                {step === 4 && (
                  <AnswerEntryStep
                    version="english"
                    data={formData.english}
                    errors={errors.english || {}}
                    isMathSubject={isMathSubject}
                    handlers={{
                      onInputChange: (f, v) => handleVersionedInputChange("english", f, v),
                      onImageChange: (f, file, p) => handleVersionedImageChange("english", f, file, p),
                    }}
                    onAiClick={() => setIsAnswerUploadModalOpen(true)}
                  />
                )}
                {step === 5 && (
                  <AnswerEntryStep
                    version="bangla"
                    data={formData.bangla}
                    errors={errors.bangla || {}}
                    isMathSubject={isMathSubject}
                    handlers={{
                      onInputChange: (f, v) => handleVersionedInputChange("bangla", f, v),
                      onImageChange: (f, file, p) => handleVersionedImageChange("bangla", f, file, p),
                    }}
                    onAiClick={() => setIsAnswerUploadModalOpen(true)}
                  />
                )}

                <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-transparent rounded-md hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" /> Reset Form
                  </button>
                  <div className="flex items-center space-x-3">
                    {step > 0 && (
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Previous
                      </button>
                    )}
                    {step === 5 ? (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center px-5 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Question"
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex justify-center px-5 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Next
                      </button>
                    )}
                  </div>
                </div>
              </FormCard>
            </form>
          </main>
        </div>
      </div>
    </div>
  )
}

export default AddCreativeQuestionPage
