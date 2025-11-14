"use client"

import { useState, useEffect, useRef } from "react"
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { showErrorToast, showSuccessToast, showInfoToast } from "../../../../../lib/toast"
import { getCroppedImg } from "../utils/imageUtils.js"

const ImageCropModal = ({ isOpen, onClose, onConfirm, imageFile }) => {
  const [imgSrc, setImgSrc] = useState("")
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState(null)
  const [aspect, setAspect] = useState(undefined) // Default to free aspect
  const imgRef = useRef(null)

  useEffect(() => {
    if (isOpen && imageFile) {
      setCrop(undefined)
      setCompletedCrop(null)
      const reader = new FileReader()
      reader.addEventListener("load", () => setImgSrc(reader.result?.toString() || ""))
      reader.readAsDataURL(imageFile)
    }
  }, [isOpen, imageFile])

  function onImageLoad(e) {
    if (aspect) {
      const { width, height } = e.currentTarget
      const initialCrop = centerCrop(makeAspectCrop({ unit: "%", width: 90 }, aspect, width, height), width, height)
      setCrop(initialCrop)
      setCompletedCrop(initialCrop)
    }
  }

  const handleConfirm = async () => {
    if (!completedCrop?.width || !imgRef.current) {
      onConfirm(imageFile)
      showInfoToast("Original image used (no crop).")
      onClose()
      return
    }

    try {
      const { blob } = await getCroppedImg(imgRef.current, completedCrop, imageFile.name)
      onConfirm(blob)
      showSuccessToast("Image cropped successfully.")
      onClose()
    } catch (e) {
      console.error("Cropping failed: ", e)
      showErrorToast("Cropping failed. Please try again.")
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="bg-gray-100 p-4 border-b border-gray-200 rounded-t-2xl flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Crop Image</h3>
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
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-gray-50">
          {imgSrc && (
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
                  style={{ maxHeight: "60vh" }}
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
        <div className="bg-gray-100 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Confirm Crop
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImageCropModal
