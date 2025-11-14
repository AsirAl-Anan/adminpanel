"use client"

import { useState, useEffect, useRef } from "react"
import axios from "../../../../config/axios.js"
import { showErrorToast, showSuccessToast, showWarningToast } from "../../../../../lib/toast"
import ImageCropModal from "./ImageCropModal.jsx"

const ExtractArticleModal = ({ isOpen, onClose, onExtractComplete }) => {
  const [selectedImages, setSelectedImages] = useState([])
  const [extractedArticle, setExtractedArticle] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const [filesToCropQueue, setFilesToCropQueue] = useState([])
  const [currentImageToCrop, setCurrentImageToCrop] = useState(null)
  const [editingImage, setEditingImage] = useState(null)

  useEffect(() => {
    if (filesToCropQueue.length > 0 && !isCropModalOpen) {
      const nextFile = filesToCropQueue[0]
      setCurrentImageToCrop(nextFile)
      setEditingImage(null)
      setIsCropModalOpen(true)
    }
  }, [filesToCropQueue, isCropModalOpen])

  useEffect(() => {
    if (isOpen) {
      selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl))
      setSelectedImages([])
      setExtractedArticle(null)
      setIsLoading(false)
      setError("")
      setFilesToCropQueue([])
      setCurrentImageToCrop(null)
      setEditingImage(null)
    }
  }, [isOpen])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + selectedImages.length > 6) {
      showWarningToast("You can select up to 6 images in total.")
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }
    setError("")
    setFilesToCropQueue((prev) => [...prev, ...files])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleCropConfirm = (croppedBlob) => {
    const originalFile = editingImage ? editingImage.originalFile : currentImageToCrop

    if (editingImage) {
      URL.revokeObjectURL(editingImage.previewUrl)
      const updatedImage = {
        ...editingImage,
        croppedBlob: croppedBlob,
        previewUrl: URL.createObjectURL(croppedBlob),
      }
      setSelectedImages((prev) => prev.map((img) => (img.id === editingImage.id ? updatedImage : img)))
      setEditingImage(null)
    } else {
      const newImage = {
        id: Date.now() + Math.random(),
        originalFile: originalFile,
        croppedBlob: croppedBlob,
        previewUrl: URL.createObjectURL(croppedBlob),
      }
      setSelectedImages((prev) => [...prev, newImage])
      setFilesToCropQueue((prev) => prev.slice(1))
    }

    setIsCropModalOpen(false)
    setCurrentImageToCrop(null)
  }

  const handleCropCancel = () => {
    if (!editingImage) {
      setFilesToCropQueue((prev) => prev.slice(1))
    }
    setEditingImage(null)
    setIsCropModalOpen(false)
    setCurrentImageToCrop(null)
  }

  const handleEdit = (imageToEdit) => {
    setEditingImage(imageToEdit)
    setCurrentImageToCrop(imageToEdit.originalFile)
    setIsCropModalOpen(true)
  }

  const removeImage = (idToRemove) => {
    const imageToRemove = selectedImages.find((img) => img.id === idToRemove)
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.previewUrl)
    }
    setSelectedImages((prev) => prev.filter((img) => img.id !== idToRemove))
  }

  const handleExtract = async () => {
    if (selectedImages.length === 0) {
      showWarningToast("Please select at least one image.")
      return
    }
    setIsLoading(true)
    setError("")
    setExtractedArticle(null)
    const formData = new FormData()
    selectedImages.forEach((image) => {
      formData.append("article", image.croppedBlob, image.originalFile.name)
    })
    try {
      const response = await axios.post("/ai/extract-articles", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      console.log(response)

      const articleData = response.data?.result?.data
      if (articleData) {
        console.log("Extracted article:", articleData)
        setExtractedArticle(articleData)
        showSuccessToast("Article extracted successfully from images!")
      } else {
        console.log(response.data)
        console.error("Unexpected API response structure:", response.data)
        showErrorToast("Could not parse the extracted article data from the server.")
      }
    } catch (err) {
      console.error("Error extracting article:", err)
      showErrorToast(err.response?.data?.message || "Failed to extract article. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmImport = () => {
    if (extractedArticle) {
      onExtractComplete(extractedArticle)
      showSuccessToast("Article imported into the form.")
      onClose()
    } else {
      showWarningToast("No article data to import.")
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
          <div className="bg-gray-100 p-4 border-b border-gray-200 rounded-t-2xl flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Extract Article from Images</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images (up to 6)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {selectedImages.map((image) => (
                  <div key={image.id} className="relative group bg-gray-100 rounded-lg">
                    <img
                      src={image.previewUrl || "/placeholder.svg"}
                      alt={`preview ${image.originalFile.name}`}
                      className="w-full h-28 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                      <button
                        type="button"
                        onClick={() => handleEdit(image)}
                        className="p-2 bg-white/80 rounded-full text-blue-600 hover:bg-white"
                        title="Edit Crop"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="p-2 bg-white/80 rounded-full text-red-600 hover:bg-white"
                        title="Remove Image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                {selectedImages.length < 6 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs text-gray-500 mt-1">Add Image</span>
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept="image/*"
                className="hidden"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleExtract}
                disabled={isLoading || selectedImages.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    {" "}
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>{" "}
                    Extracting...{" "}
                  </>
                ) : (
                  "Extract Article"
                )}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={!extractedArticle}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:bg-green-300 disabled:cursor-not-allowed"
            >
              Import Article
            </button>
          </div>
        </div>
      </div>
      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={handleCropCancel}
        onConfirm={handleCropConfirm}
        imageFile={currentImageToCrop}
      />
    </>
  )
}

export default ExtractArticleModal
