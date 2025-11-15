"use client"

import { useState, useEffect } from "react"
import axios from "../../../config/axios.js"
import { showErrorToast, showSuccessToast, showWarningToast } from "../../../../lib/toast"
import ImageStudioModal from "./modals/ImageStudioModal.jsx"
import ExtractTopicModal from "./modals/ExtractTopicModal.jsx"
import ExtractArticleModal from "./modals/ExtractArticleModal.jsx"
import BasicInfoTab from "./tabs/BasicInfoTab.jsx"
import ArticlesTab from "./tabs/ArticlesTab.jsx"
import TopicFormulasTab from "./tabs/TopicFormulasTab.jsx"
import { v4 as uuid } from "uuid"
import { Expand, Minimize, Menu, X } from "lucide-react"

const TopicAddOrEditModal = ({
  isEditMode,
  closeAddEditModal,
  newTopic,
  setNewTopic,
  handleAddTopic,
  handleEditTopic,
}) => {
  const [activeTab, setActiveTab] = useState("basic")
  const [loading, setLoading] = useState(false) // Internal loading state for the modal
  const [isMaximized, setIsMaximized] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)
  const [isImageStudioOpen, setImageStudioOpen] = useState(false)
  const [imageStudioConfig, setImageStudioConfig] = useState({
    type: null,
    index: null,
    articleIndex: null,
    sectionIndex: null,
  }) // Added articleIndex
  const [isExtractTopicModalOpen, setExtractTopicModalOpen] = useState(false)
  const [isExtractArticleModalOpen, setExtractArticleModalOpen] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const articleTabs = (newTopic.articles || []).map((article, index) => ({
    id: `article-${index}`,
    label: `Article ${index + 1}`,
  }))

  const tabs = [{ id: "basic", label: "Basic Info" }, ...articleTabs]

  useEffect(() => {
    const validate = () => {
      if (!newTopic.name?.en?.trim() || !newTopic.name?.bn?.trim() || !newTopic.topicNumber?.trim()) {
        return false
      }

      // Validate articles and sections
      const articles = newTopic.articles || []
      if (articles.length === 0) {
        return false // No articles, so invalid
      }

      for (const article of articles) {
        const sections = article.sections || []
        if (sections.length === 0) {
          return false // Article has no sections, so invalid
        }
        for (const section of sections) {
          if (
            !section.title?.en?.trim() ||
            !section.title?.bn?.trim() ||
            !section.body?.en?.trim() ||
            !section.body?.bn?.trim()
          ) {
            return false
          } else {
             for(const formula of section.formulas || []){
              console.log("inside")
            if(formula.name?.en?.trim() || formula.name?.bn?.trim() || formula.description?.en?.trim() || formula.description?.bn?.trim()|| formula.equation?.trim() ){
              console.log("yay")
              if(!formula.name?.en?.trim() || !formula.name?.bn?.trim() || !formula.description?.en?.trim() || !formula.description?.bn?.trim()|| !formula.equation?.trim()){
                console.log("formula", formula)
                console.log("nay")
                return false
            } else {
              return true
            }
            }
          
          }
          }
         
        }
      }
      return true
    }
    setIsFormValid(validate())
  }, [newTopic])

  useEffect(() => {
    // Save newTopic to localStorage if it's a new topic (not in edit mode)
    if (!isEditMode) {
      try {
        localStorage.setItem("unsavedTopicDraft", JSON.stringify(newTopic))
      } catch (error) {
        console.error("Failed to write unsavedTopicDraft to localStorage", error)
      }
    }
  }, [newTopic, isEditMode])

  const handleUpdate = (path, value) => {
    console.log("handleUpdate called with path:", path, "value:", value)
    setNewTopic((prev) => {
      const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".")

      const updateNested = (obj, pathParts, val) => {
        if (pathParts.length === 0) {
          return val // Base case: reached the target property
        }

        const currentKey = pathParts[0]
        const remainingPath = pathParts.slice(1)

        let newObj
        if (Array.isArray(obj)) {
          // If current obj is an array, create a new array
          newObj = [...obj]
          const index = Number.parseInt(currentKey, 10)
          if (!isNaN(index) && index >= 0 && index < newObj.length) {
            newObj[index] = updateNested(newObj[index], remainingPath, val)
          } else if (!isNaN(index) && index === newObj.length) {
            // Handle adding to array
            newObj.push(updateNested(undefined, remainingPath, val))
          }
        } else if (typeof obj === "object" && obj !== null) {
          // If current obj is an object, create a new object
          newObj = { ...obj }
          newObj[currentKey] = updateNested(newObj[currentKey], remainingPath, val)
        } else {
          // If current obj is primitive or null/undefined, initialize it
          newObj = String(Number(currentKey)) === currentKey ? [] : {}
          newObj[currentKey] = updateNested(newObj[currentKey], remainingPath, val)
        }
        return newObj
      }

      const newState = updateNested(prev, keys, value)
      return newState
    })
  }

  // Topic-level aliases
  const addAliasField = (aliasType) => {
    setNewTopic((prev) => ({
      ...prev,
      aliases: {
        ...prev.aliases,
        [aliasType]: [...(prev.aliases[aliasType] || []), ""],
      },
    }))
  }
  const removeAliasField = (aliasType, index) => {
    setNewTopic((prev) => ({
      ...prev,
      aliases: {
        ...prev.aliases,
        [aliasType]: prev.aliases[aliasType].filter((_, i) => i !== index),
      },
    }))
  }

  // Article management
  const addArticle = () => {
    setNewTopic((prev) => {
      const updatedArticles = [
        ...(prev.articles || []),
        {
          id: uuid(), // Add unique ID
          learningOutcomes: { en: [], bn: [] },
          formulas: [],
          sections: [
            {
              id: uuid(), // Add unique ID
              title: { en: "", bn: "" },
              body: { en: "", bn: "" },
              images: [],
              videos: [],
              examples: [],
              formulas: [],
            },
          ],
          relatedCreativeQuestions: [],
          relatedMCQs: [],
          relatedQuestions: [],
        },
      ]
      setActiveTab(`article-${updatedArticles.length - 1}`)
      return {
        ...prev,
        articles: updatedArticles,
      }
    })
  }

  const removeArticle = (artIdx) => {
    setNewTopic((prev) => ({
      ...prev,
      articles: (prev.articles || []).filter((_, i) => i !== artIdx),
    }))
    if (activeTab === `article-${artIdx}`) {
      setActiveTab("basic")
    }
  }

  const removeTopicFormula = (formulaIdx) => {
    setNewTopic((prev) => {
      const newState = structuredClone(prev)
      const activeArticleIndex = parseInt(activeTab.split("-")[1], 10)
      if (
        newState.articles &&
        newState.articles[activeArticleIndex] &&
        newState.articles[activeArticleIndex].formulas
      ) {
        newState.articles[activeArticleIndex].formulas = newState.articles[activeArticleIndex].formulas.filter(
          (_, i) => i !== formulaIdx,
        )
      }
      return newState
    })
  }

  // Sections
  const addSection = (artIdx) =>
    setNewTopic((p) => {
      const newState = structuredClone(p)
      if (!newState.articles[artIdx].sections) {
        newState.articles[artIdx].sections = []
      }
      newState.articles[artIdx].sections.push({
        id: uuid(), // Add unique ID
        title: { en: "", bn: "" },
        body: { en: "", bn: "" },
        images: [],
        videos: [],
        examples: [],
        formulas: [],
      })
      return newState
    })
  const removeSection = (artIdx, secIdx) =>
    setNewTopic((p) => {
      const newState = structuredClone(p)
      newState.articles[artIdx].sections = newState.articles[artIdx].sections.filter((_, i) => i !== secIdx)
      return newState
    })

  // Section-level images
  const openImageStudio = (type, index, articleIndex, sectionIndex = null) => {
    setImageStudioConfig({ type, index, articleIndex, sectionIndex })
    setImageStudioOpen(true)
  }

  const handleImageConfirm = async ({ file, metadata }) => {
    const { type, index, articleIndex, sectionIndex } = imageStudioConfig
    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("image", file)

      const uploadResponse = await axios.post("/ai/upload-single-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      if (uploadResponse.data.success && uploadResponse.data.data.url) {
        const newImageObject = {
          url: uploadResponse.data.data.url,
          caption: { en: metadata.title.english, bn: metadata.title.bangla }, // Standardize to caption with en/bn
          description: { en: metadata.description.english, bn: metadata.description.bangla }, // Standardize to description with en/bn
          order: index,
        }

        setNewTopic((prev) => {
          const newState = structuredClone(prev)
          if (type === "section" && newState.articles[articleIndex].sections[sectionIndex]) {
            if (!newState.articles[articleIndex].sections[sectionIndex].images) {
              newState.articles[articleIndex].sections[sectionIndex].images = []
            }
            newState.articles[articleIndex].sections[sectionIndex].images[index] = newImageObject
          }
          return newState
        })
        showSuccessToast("Image uploaded and added successfully!")
        setImageStudioOpen(false) // Close modal only on success
      } else {
        showErrorToast("Failed to get image URL from upload.")
        setImageStudioOpen(false) // Close modal on error
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      showErrorToast(`Image upload failed: ${error.response?.data?.message || error.message}`)
      setImageStudioOpen(false) // Close modal on error
    } finally {
      setIsUploadingImage(false)
    }
  }

  const removeImage = (type, index, articleIndex, sectionIndex = null) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return
    setNewTopic((prev) => {
      if (type === "section") {
        return {
          ...prev,
          articles: prev.articles.map((article, artIdx) => {
            if (artIdx !== articleIndex) return article
            return {
              ...article,
              sections: article.sections.map((section, secIdx) => {
                if (secIdx !== sectionIndex) return section
                return { ...section, images: section.images.filter((_, j) => j !== index) }
              }),
            }
          }),
        }
      }
      return prev
    })
    showWarningToast("Image removed from form.")
  }

  const getImageDataForStudio = () => {
    const { type, index, articleIndex, sectionIndex } = imageStudioConfig
    if (type === "section" && newTopic.articles[articleIndex].sections[sectionIndex]?.images[index]) {
      const img = newTopic.articles[articleIndex].sections[sectionIndex].images[index]
      return {
        file: img.file,
        url: img.url,
        title: { english: img.caption?.en || "", bangla: img.caption?.bn || "" }, // Convert back to english/bangla for ImageStudioModal
        description: { english: img.description?.en || "", bangla: img.description?.bn || "" }, // Convert back to english/bangla for ImageStudioModal
      }
    }
    return {}
  }

  // Section-level formulas (full formula objects)
  const addSectionFormula = (artIdx, secIdx) => {
    setNewTopic((p) => {
      const newState = structuredClone(p)
      // Ensure articles, sections, and the specific section exist
      if (
        !newState.articles ||
        !newState.articles[artIdx] ||
        !newState.articles[artIdx].sections ||
        !newState.articles[artIdx].sections[secIdx]
      ) {
        showErrorToast("Cannot add formula: Article or section not found.")
        return p // Return previous state if path is invalid
      }
      if (!newState.articles[artIdx].sections[secIdx].formulas) {
        newState.articles[artIdx].sections[secIdx].formulas = []
      }
      newState.articles[artIdx].sections[secIdx].formulas.push({
        equation: "",
        description: { en: "", bn: "" },
        variables: [],
      })
      return newState
    })
  }
  const removeSectionFormula = (artIdx, secIdx, formulaIdx) => {
    setNewTopic((p) => {
      const newState = structuredClone(p)
      if (
        newState.articles &&
        newState.articles[artIdx] &&
        newState.articles[artIdx].sections &&
        newState.articles[artIdx].sections[secIdx] &&
        newState.articles[artIdx].sections[secIdx].formulas
      ) {
        newState.articles[artIdx].sections[secIdx].formulas = newState.articles[artIdx].sections[
          secIdx
        ].formulas.filter((_, i) => i !== formulaIdx)
      }
      return newState
    })
  }

  const handleTopicExtractComplete = (extractedTopic) => {
    setNewTopic((prev) => ({
      ...prev,
      ...extractedTopic,
    }))
  }

  const handleArticleExtractComplete = (extractedArticleData) => {
    // Validate that extractedArticleData is an object and contains a sections array
    if (!extractedArticleData || !Array.isArray(extractedArticleData.sections)) {
      showErrorToast("Invalid article data received from AI.")
      return
    }

    const newFormattedSections = extractedArticleData.sections.map((section) => {
      return {
        id: uuid(), // Add unique ID for new sections
        title: section.title || { en: "", bn: "" },
        body: section.body || { en: "", bn: "" },
        images: section.images || [],
        videos: section.videos || [],
        examples: section.examples || [],
        formulas: section.formulas || [],
      }
    })

    setNewTopic((prev) => {
      const newState = structuredClone(prev)
      const activeArticleIndex = parseInt(activeTab.split("-")[1], 10)

      // Ensure the active article exists before updating its properties
      if (!newState.articles[activeArticleIndex]) {
        // If for some reason the article doesn't exist, create a new one
        // This scenario should ideally be prevented by UI logic, but good for robustness
        newState.articles[activeArticleIndex] = {
          id: uuid(),
          learningOutcomes: { en: [], bn: [] },
          formulas: [],
          sections: [],
          relatedCreativeQuestions: [],
          relatedMCQs: [],
          relatedQuestions: [],
        };
      }

      // Update article name, body, and learning outcomes
      newState.articles[activeArticleIndex].name = extractedArticleData.name || { en: "", bn: "" };
      newState.articles[activeArticleIndex].body = extractedArticleData.body || { en: "", bn: "" };
      newState.articles[activeArticleIndex].learningOutcomes = extractedArticleData.learningOutcomes || { en: [], bn: [] };


      // Ensure sections array exists and push new sections
      if (!newState.articles[activeArticleIndex].sections) {
        newState.articles[activeArticleIndex].sections = []
      }
      newState.articles[activeArticleIndex].sections.push(...newFormattedSections)
      return newState
    })
  }

  const handleSubmit = async () => {
    if (!isFormValid) {
      showErrorToast("Please fill in all required fields.")
      return
    }
    setLoading(true) // Start loading

    try {
      let createdOrUpdatedTopic
      if (isEditMode) {
        // Send the full newTopic object for update
        createdOrUpdatedTopic = await handleEditTopic(newTopic)
        showSuccessToast("Topic updated successfully!")
      } else {
        // Send the full newTopic object for creation
        createdOrUpdatedTopic = await handleAddTopic(newTopic)
        showSuccessToast("Topic created successfully!")
      }
      closeAddEditModal()
    } catch (error) {
      console.error("Topic submission failed:", error)
      const errorMessage = error.response?.data?.message || `Failed to ${isEditMode ? "update" : "create"} topic.`
      showErrorToast(errorMessage)
    } finally {
      setLoading(false) // End loading
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div
          className={`bg-card shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out ${isMaximized ? "w-screen h-screen max-w-full max-h-full rounded-none" : "rounded-lg w-full max-w-6xl max-h-[90vh]"}`}
        >
          <div className="bg-gradient-to-r from-primary to-primary/90 px-6 py-4 text-primary-foreground flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">{isEditMode ? "Edit Topic" : "Create New Topic"}</h2>
              <button
                onClick={() => setExtractTopicModalOpen(true)}
                className="px-3 py-1 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground rounded-md transition-colors text-sm font-medium"
              >
                Import Topic
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-1 hover:bg-primary/80 rounded-md transition-colors"
                aria-label={isMaximized ? "Minimize" : "Maximize"}
              >
                {isMaximized ? <Minimize /> : <Expand />}
              </button>
              <button
                onClick={closeAddEditModal}
                className="p-1 hover:bg-primary/80 rounded-md transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Bar */}
          <div className="md:hidden border-b bg-muted/30 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="p-2 hover:bg-muted rounded-md transition-colors border bg-card shadow-sm"
                aria-label="Toggle navigation menu"
              >
                {isDrawerOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <span className="ml-3 text-sm font-medium text-muted-foreground">
                {tabs.find(t => t.id === activeTab)?.label || "Navigation"}
              </span>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden relative">
            {/* Sidebar (Visible on medium screens and up) */}
            <div className="hidden md:block w-48 bg-muted/30 border-r p-4">
              <nav className="flex flex-col space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-left text-sm font-medium rounded-md transition-colors ${activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    {tab.label}
                  </button>
                ))}
                <button
                  onClick={addArticle}
                  className="px-4 py-2 text-left text-sm font-medium rounded-md transition-colors text-muted-foreground hover:bg-muted"
                >
                  + Add Article
                </button>
              </nav>
            </div>

            {/* Drawer (Visible on small screens when open) */}
            {isDrawerOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="absolute inset-0 bg-black/20 z-20 md:hidden"
                  onClick={() => setIsDrawerOpen(false)}
                />
                
                {/* Drawer Panel */}
                <div className="absolute top-0 left-0 bottom-0 w-64 bg-card shadow-2xl z-30 md:hidden animate-in slide-in-from-left duration-200 border-r">
                  {/* Drawer Header */}
                  <div className="bg-gradient-to-r from-primary to-primary/90 px-4 py-3 text-primary-foreground flex items-center justify-between">
                    <h3 className="font-semibold">Navigation</h3>
                    <button
                      onClick={() => setIsDrawerOpen(false)}
                      className="p-1 hover:bg-primary/80 rounded-md transition-colors"
                      aria-label="Close navigation"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  
                  {/* Drawer Content */}
                  <nav className="flex flex-col p-3 space-y-1 overflow-y-auto h-[calc(100%-3.5rem)]">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id)
                          setIsDrawerOpen(false)
                        }}
                        className={`px-4 py-2.5 text-left text-sm font-medium rounded-lg transition-all ${activeTab === tab.id ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-muted"}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                    <div className="pt-2 mt-2 border-t">
                      <button
                        onClick={() => {
                          addArticle()
                          setIsDrawerOpen(false)
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium rounded-lg transition-colors text-primary hover:bg-primary/10 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Article
                      </button>
                    </div>
                  </nav>
                </div>
              </>
            )}

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              {activeTab === "basic" && (
                <BasicInfoTab
                  newTopic={newTopic}
                  handleUpdate={handleUpdate}
                  addAliasField={addAliasField}
                  removeAliasField={removeAliasField}
                />
              )}
              {activeTab.startsWith("article-") && (
                <ArticlesTab
                  article={newTopic.articles[parseInt(activeTab.split("-")[1], 10)]}
                  articleIndex={parseInt(activeTab.split("-")[1], 10)}
                  handleUpdate={handleUpdate}
                  removeArticle={removeArticle}
                  addSection={addSection}
                  removeSection={removeSection}
                  openImageStudio={openImageStudio}
                  removeImage={removeImage}
                  addSectionFormula={addSectionFormula}
                  removeSectionFormula={removeSectionFormula}
                  openExtractArticleModal={() => setExtractArticleModalOpen(true)}
                />
              )}
            </div>
          </div>

          <div className="bg-muted/30 px-6 py-4 border-t flex justify-end space-x-3">
            <button
              onClick={closeAddEditModal}
              className="px-4 py-2 bg-card border text-foreground rounded-md hover:bg-muted transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !isFormValid || isUploadingImage}
              className="px-4 py-2 rounded-md text-primary-foreground font-medium transition-colors text-sm disabled:bg-primary/50 disabled:cursor-not-allowed bg-primary hover:bg-primary/90"
            >
              {loading || isUploadingImage ? "Saving..." : isEditMode ? "Update Topic" : "Create Topic"}
            </button>
          </div>
        </div>
      </div>

      <ImageStudioModal
        isOpen={isImageStudioOpen}
        onClose={() => setImageStudioOpen(false)}
        onConfirm={handleImageConfirm}
        initialData={getImageDataForStudio()}
      />
      <ExtractTopicModal
        isOpen={isExtractTopicModalOpen}
        onClose={() => setExtractTopicModalOpen(false)}
        onExtractComplete={handleTopicExtractComplete}
      />
      <ExtractArticleModal
        isOpen={isExtractArticleModalOpen}
        onClose={() => setExtractArticleModalOpen(false)}
        onExtractComplete={handleArticleExtractComplete}
      />
    </>
  )
}

export default TopicAddOrEditModal
