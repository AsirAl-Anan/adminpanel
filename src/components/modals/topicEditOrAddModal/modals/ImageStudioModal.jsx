"use client"

import { useState, useEffect, useRef } from "react"
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import axios from "../../../../config/axios.js"
import { showErrorToast, showSuccessToast, showWarningToast } from "../../../../../lib/toast"
import { useDebounceEffect, getCroppedImg } from "../utils/imageUtils.js"
import BilingualInput from "../ui/BilingualInput.jsx"
// the data is not saved in the database due to mismatch between the structure of of data in the topic.model.js

const ImageStudioModal = ({ isOpen, onClose, onConfirm, initialData = {} }) => {
  const [imgSrc, setImgSrc] = useState("")
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState(null)
  const [aspect, setAspect] = useState(16 / 9)
  const [metadata, setMetadata] = useState({
    title: { english: "", bangla: "" },
    description: { english: "", bangla: "" },
  })
  const [originalFile, setOriginalFile] = useState(null)
  const [isExtractingDescription, setIsExtractingDescription] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false) // New state for loading indicator

  const imgRef = useRef(null)
  const previewCanvasRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      if (initialData.file) {
        // Editing an existing new file
        const reader = new FileReader()
        reader.addEventListener("load", () => setImgSrc(reader.result.toString() || ""))
        reader.readAsDataURL(initialData.file)
        setOriginalFile(initialData.file)
      } else if (initialData.url) {
        // Editing a file from URL
        setImgSrc(initialData.url)
      } else {
        setImgSrc("")
        setOriginalFile(null)
      }
      setMetadata({
        title: initialData.title || { english: "", bangla: "" },
        description: initialData.description || { english: "", bangla: "" },
      })
      setCrop(undefined)
      setCompletedCrop(null)
    }
  }, [isOpen, initialData])

  useDebounceEffect(
    async () => {
      if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current) {
        getCroppedImg(imgRef.current, completedCrop, originalFile?.name || "cropped-image.jpg")
      }
    },
    100,
    [completedCrop],
  )

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined)
      const file = e.target.files[0]
      setOriginalFile(file)
      const reader = new FileReader()
      reader.addEventListener("load", () => setImgSrc(reader.result.toString() || ""))
      reader.readAsDataURL(file)
    }
  }

  function onImageLoad(e) {
    if (aspect) {
      const { width, height } = e.currentTarget
      setCrop(centerCrop(makeAspectCrop({ unit: "%", width: 90 }, aspect, width, height), width, height))
      setCompletedCrop(centerCrop(makeAspectCrop({ unit: "%", width: 90 }, aspect, width, height), width, height))
    }
  }

  const handleGetDescription = async () => {
    let imageToSend = originalFile

    if (!imageToSend && !imgRef.current) {
      showWarningToast("Please select an image first.")
      return
    }

    setIsExtractingDescription(true)

    try {
      if (completedCrop?.width && completedCrop?.height && imgRef.current) {
        const { blob } = await getCroppedImg(imgRef.current, completedCrop, originalFile?.name || "cropped-image.jpg")
        imageToSend = new File([blob], blob.name, { type: blob.type })
      }

      if (!imageToSend) {
        showErrorToast("Could not process the image for AI analysis.")
        setIsExtractingDescription(false)
        return
      }

      const formData = new FormData()
      formData.append("image", imageToSend)

      const response = await axios.post("/ai/extract-image-data", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      console.log(response)
      if (response.data.data && (response.data.data.description || response.data.data.title)) {
        console.log("Extracted description:", response.data.data.description.bangla, response.data.data.title.bangla)
        setMetadata((prev) => ({
          ...prev,
          description: {
            english: response.data.data.description.english || prev.description.english,
            bangla: response.data.data.description.bangla || prev.description.bangla,
          },
          title: {
            english: response.data.data.title.english || prev.title.english,
            bangla: response.data.data.title.bangla || prev.title.bangla,
          },
        }))
        showSuccessToast("Description extracted successfully!")
      } else {
        showWarningToast("Could not extract a valid description from the response.")
      }
    } catch (error) {
      console.error("Error getting description from image:", error)
      showErrorToast(`Failed to get description: ${error.response?.data?.message || error.message}`)
    } finally {
      setIsExtractingDescription(false)
    }
  }

  const handleConfirm = async () => {
    if (
      !metadata.title.english.trim() ||
      !metadata.title.bangla.trim() ||
      !metadata.description.english.trim() ||
      !metadata.description.bangla.trim()
    ) {
      showWarningToast("Please fill in all required fields for the image.")
      return
    }

    setIsConfirming(true) // Set loading state to true

    try {
      if (!completedCrop || !imgRef.current) {
        if (originalFile) {
        await onConfirm({ file: originalFile, metadata })
        showSuccessToast("Image added with metadata.")
        onClose()
        return
        }
        showWarningToast("Please select and crop an image.")
        return
      }

      const { blob } = await getCroppedImg(imgRef.current, completedCrop, originalFile?.name || "cropped-image.jpg")
      const croppedFile = new File([blob], blob.name, { type: blob.type })
      await onConfirm({ file: croppedFile, metadata })
      showSuccessToast("Cropped image added with metadata.")
      onClose()
    } catch (e) {
      console.error(e)
      showErrorToast("Failed to crop the image.")
    } finally {
      setIsConfirming(false) // Set loading state to false
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="bg-gray-100 p-4 border-b border-gray-200 rounded-t-2xl">
          <h3 className="text-lg font-semibold text-gray-800">Image Studio</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col items-center bg-gray-50 p-4 rounded-lg">
            {!imgSrc ? (
              <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            ) : (
              <>
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                >
                  <img
                    ref={imgRef}
                    src={imgSrc || "/placeholder.svg"}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    style={{ maxHeight: "400px" }}
                    crossOrigin="anonymous"
                  />
                </ReactCrop>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => setAspect(16 / 9)}
                    className={`px-3 py-1 text-xs rounded ${aspect === 16 / 9 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                  >
                    16:9
                  </button>
                  <button
                    onClick={() => setAspect(4 / 3)}
                    className={`px-3 py-1 text-xs rounded ${aspect === 4 / 3 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                  >
                    4:3
                  </button>
                  <button
                    onClick={() => setAspect(1)}
                    className={`px-3 py-1 text-xs rounded ${aspect === 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                  >
                    1:1
                  </button>
                  <button
                    onClick={() => setAspect(undefined)}
                    className={`px-3 py-1 text-xs rounded ${!aspect ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                  >
                    Free
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            <BilingualInput
              label="Image Title"
              englishValue={metadata.title.english}
              banglaValue={metadata.title.bangla}
              onUpdate={(field, value) => {
                const langKey = field.split(".")[1] === "en" ? "english" : "bangla"
                setMetadata((prev) => ({ ...prev, title: { ...prev.title, [langKey]: value } }))
              }}
              fieldName="title"
              required
            />
            <BilingualInput
              label="Image Description"
              isTextarea
              englishValue={metadata.description.english}
              banglaValue={metadata.description.bangla}
              onUpdate={(field, value) => {
                const langKey = field.split(".")[1] === "en" ? "english" : "bangla"
                setMetadata((prev) => ({ ...prev, description: { ...prev.description, [langKey]: value } }))
              }}
              fieldName="description"
              required
            />
            <button
              type="button"
              onClick={handleGetDescription}
              disabled={!imgSrc || isExtractingDescription}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {isExtractingDescription ? (
                <>
                  {" "}
                  <svg
                    className="animate-spin h-4 w-4"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>{" "}
                  Getting Description...{" "}
                </>
              ) : (
                <>
                  {" "}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>{" "}
                  Get Description from Image (AI){" "}
                </>
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
            onClick={handleConfirm}
            disabled={isConfirming} // Disable button when confirming
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isConfirming && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isConfirming ? "Adding Image..." : "Confirm & Add Image"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImageStudioModal
