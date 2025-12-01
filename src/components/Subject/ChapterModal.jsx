"use client"

import { useState, useEffect } from "react"
import axios from "../../config/axios"
import { showSuccessToast, showErrorToast } from "../../../lib/toast"
import TranslationButton from "../ui/TranslationButton"

const ChapterModal = ({ subject, chapter, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: { en: "", bn: "" },
    chapterNo: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (chapter) {
      setFormData({
        name: {
          en: chapter.name?.en || "",
          bn: chapter.name?.bn || "",
        },
        chapterNo: chapter.chapterNo || "",
      })
    } else {
      setFormData({
        name: { en: "", bn: "" },
        chapterNo: subject?.chapters?.length + 1 || 1,
      })
    }
  }, [chapter, subject])

  const handleChange = (field, lang, value) => {
    if (lang) {
      setFormData((prev) => ({
        ...prev,
        name: { ...prev.name, [lang]: value },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.en || !formData.name.bn || !formData.chapterNo) {
      showErrorToast("Please fill in all required fields.")
      setError("Please fill in all required fields.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (chapter) {
        // Update existing chapter
        await axios.put(`/subject/chapters/${chapter._id}`, formData)
        showSuccessToast("Chapter updated successfully!")
      } else {
        // Create new chapter
        await axios.post(`/subject/subjects/${subject._id}/chapters`, formData)
        showSuccessToast("Chapter created successfully!")
      }
      onSave()
      onClose()
    } catch (err) {
      console.error("Failed to save chapter:", err)
      const errorMessage = "Failed to save chapter. Please try again."
      setError(errorMessage)
      showErrorToast(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{chapter ? "Edit Chapter" : "Add New Chapter"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            &times;
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">Chapter Name (English)</label>
              <TranslationButton
                text={formData.name.en}
                targetLang="bn"
                onTranslate={(text) => handleChange("name", "bn", text)}
              />
            </div>
            <input
              type="text"
              value={formData.name.en}
              onChange={(e) => handleChange("name", "en", e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Enter English Chapter Name"
            />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">Chapter Name (Bangla)</label>
              <TranslationButton
                text={formData.name.bn}
                targetLang="en"
                onTranslate={(text) => handleChange("name", "en", text)}
              />
            </div>
            <input
              type="text"
              value={formData.name.bn}
              onChange={(e) => handleChange("name", "bn", e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Enter Bangla Chapter Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Chapter Number</label>
            <input
              type="number"
              value={formData.chapterNo}
              onChange={(e) => handleChange("chapterNo", null, Number.parseInt(e.target.value))}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Enter Chapter Number"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Saving..." : "Save Chapter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChapterModal
