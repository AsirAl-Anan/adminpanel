"use client"

import { useEffect, useState } from "react"
import axios from "../../config/axios"
import { showSuccessToast, showErrorToast } from "../../../lib/toast"
import TopicAddOrEditModal from "../modals/topicEditOrAddModal/TopicEditOrAddModal"

const TopicList = ({ subjectId, chapterId, topics, onUpdate, subjectLevel, subjectGroup }) => {
  const [isTopicsModalOpen, setIsTopicsModalOpen] = useState(false)

  // --- STEP 1: RESTORED ---
  // We are back to initializing the modal's state from localStorage. This is CORRECT for your refresh requirement.
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(() => {
    try {
      const storedState = localStorage.getItem("isAddEditTopicModalOpen")
      return storedState ? JSON.parse(storedState) : false
    } catch (error) {
      console.error("Failed to read isAddEditTopicModalOpen from localStorage", error)
      return false
    }
  })

  const [isEditMode, setIsEditMode] = useState(false)
  const [editingTopicId, setEditingTopicId] = useState(null)
  const [loading, setLoading] = useState(false)

  const getInitialTopicState = () => ({
    name: { en: "", bn: "" },
    topicNumber: "",
    description: { en: "", bn: "" },
    aliases: { english: [""], bangla: [], banglish: [] },
    importance: "MEDIUM",
    tags: [],
    level: subjectLevel,
    group: subjectGroup,
    articles: [],
    questionTypes: [],
  })

  // The draft logic remains correct and untouched.
  const [newTopic, setNewTopic] = useState(() => {
    try {
      const storedDraft = localStorage.getItem("unsavedTopicDraft")
      return storedDraft ? JSON.parse(storedDraft) : getInitialTopicState()
    } catch (error) {
      console.error("Failed to read unsavedTopicDraft from localStorage", error)
      return getInitialTopicState()
    }
  })

  const initializeForm = (topic = null) => {
    if (topic) {
      setIsEditMode(true)
      setEditingTopicId(topic._id)
      setNewTopic({
        _id: topic._id,
        name: { en: topic.name?.en || "", bn: topic.name?.bn || "" },
        topicNumber: topic.topicNumber || "",
        description: { en: topic.description?.en || "", bn: topic.description?.bn || "" },
        aliases: topic.aliases || { english: [], bangla: [], banglish: [] },
        importance: topic.importance || "MEDIUM",
        tags: topic.tags || [],
        level: subjectLevel,
        group: subjectGroup,
        questionTypes: topic.questionTypes || [],
        articles:
          topic.articles?.length > 0
            ? topic.articles.map((article) => ({
                learningOutcomes: article.learningOutcomes || { en: "", bn: "" },
                body: article.body || { en: "", bn: "" },
                formulas: article.formulas || [],
                sections:
                  article.sections?.length > 0
                    ? article.sections.map((sec) => ({
                        ...sec,
                        images:
                          sec.images?.map((img) => ({
                            url: img.url,
                            caption: img.caption || { en: "", bn: "" },
                            description: img.description || { en: "", bn: "" },
                            order: img.order || 0,
                          })) || [],
                        videos: sec.videos || [],
                        examples: sec.examples || [],
                        formulas: sec.formulas || [],
                      }))
                    : getInitialTopicState().articles[0].sections,
                relatedCreativeQuestions: article.relatedCreativeQuestions || [],
                relatedMCQs: article.relatedMCQs || [],
                relatedQuestions: [],
              }))
            : getInitialTopicState().articles,
      })
      try {
        localStorage.removeItem("unsavedTopicDraft")
      } catch (error) {
        console.error("Failed to clear unsavedTopicDraft from localStorage", error)
      }
    } else {
      setIsEditMode(false)
      setEditingTopicId(null)
      try {
        const storedDraft = localStorage.getItem("unsavedTopicDraft")
        setNewTopic(storedDraft ? JSON.parse(storedDraft) : getInitialTopicState())
      } catch (error) {
        console.error("Failed to read unsavedTopicDraft from localStorage", error)
        setNewTopic(getInitialTopicState())
      }
    }
  }

  // --- STEP 2: RESTORED ---
  // This useEffect is also CORRECT for your refresh requirement. It saves the modal state.
  useEffect(() => {
    try {
      localStorage.setItem("isAddEditTopicModalOpen", JSON.stringify(isAddEditModalOpen))
    } catch (error) {
      console.error("Failed to write isAddEditTopicModalOpen to localStorage", error)
    }
  }, [isAddEditModalOpen])

  const openAddEditModal = (topic = null) => {
    initializeForm(topic)
    setIsAddEditModalOpen(true)
    setIsTopicsModalOpen(false)
  }

  // --- STEP 3: THE CRITICAL FIX IS HERE ---
  // This function is now responsible for cleaning up everything.
  const closeAddEditModal = () => {
    setIsAddEditModalOpen(false) // Update React state
    setNewTopic(getInitialTopicState()) // Reset the form
    try {
      // Immediately remove the item from localStorage. This prevents the modal
      // from re-opening during the re-render caused by a successful submission.
      localStorage.removeItem("isAddEditTopicModalOpen")
    } catch (error) {
      console.error("Failed to clear isAddEditTopicModalOpen from localStorage", error)
    }
  }

  const openTopicsModal = () => setIsTopicsModalOpen(true)
  const closeTopicsModal = () => setIsTopicsModalOpen(false)

  const handleAddTopic = async (topicPayload) => {
    setLoading(true)
    try {
      const response = await axios.post(`/subject/chapters/${chapterId}/topics`, {
        ...topicPayload,
        subjectId,
        chapterId,
      })
      console.log("response adding topic", response)
      if (response.status === 201) {
        console.log("response adding topic", response)
        onUpdate()
        try {
          localStorage.removeItem("unsavedTopicDraft")
        } catch (error) {
          console.error("Failed to clear unsavedTopicDraft from localStorage", error)
        }
        return response.data
      } else {
        throw new Error(response.data.message || "Failed to add topic")
      }
    } catch (error) {
      console.log("error adding topic", error)
      console.error("Failed to add topic:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleEditTopic = async (topicPayload) => {
    setLoading(true)
    try {
      const response = await axios.put(`/subject/topics/${editingTopicId}`, {
        ...topicPayload,
        subjectId,
        chapterId,
      })

      if (response.status === 200) {
        onUpdate()
        return response.data
      } else {
        throw new Error(response.data.message || "Failed to update topic")
      }
    } catch (error) {
      console.error("Failed to update topic:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // ... (rest of the component is unchanged)
  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm("Are you sure you want to delete this topic?")) return
    setLoading(true)
    try {
      const response = await axios.delete(`/subject/topics/${topicId}`)
      if (response.status === 200) {
        showSuccessToast("Topic deleted successfully")
        onUpdate()
      } else {
        showErrorToast(response.data.message || "Failed to delete topic")
      }
    } catch (error) {
      console.error("Failed to delete topic:", error)
      showErrorToast(error.response?.data?.message || "Failed to delete topic")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-card rounded-lg shadow-sm border hover:shadow-md transition-all duration-200">
        <div className="mb-6">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary font-medium text-lg">{topics?.length || 0}</p>
                <p className="text-primary/80 text-sm font-medium">Total Topics</p>
              </div>
              <div className="w-8 h-8 bg-primary/20 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={openTopicsModal}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-card border-2 border-muted text-foreground rounded-lg hover:border-primary/50 hover:bg-primary/10 transition-all duration-200 font-medium group"
          >
            <svg
              className="w-5 h-5 mr-2 text-muted-foreground group-hover:text-primary transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Show Topics
          </button>
          <button
            onClick={() => openAddEditModal()}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-lg hover:from-primary/90 hover:to-primary/80 transition-all duration-200 shadow-lg hover:shadow-xl font-medium transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Topic
          </button>
        </div>
      </div>

      {isTopicsModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-primary to-primary/90 px-6 py-4 text-primary-foreground">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Topics List</h2>
                  <p className="text-primary-foreground/80 text-sm">{topics?.length || 0} topics available</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => openAddEditModal()}
                    className="px-4 py-2 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground rounded-md transition-colors text-sm font-medium"
                  >
                    {" "}
                    Add Topic{" "}
                  </button>
                  <button
                    onClick={closeTopicsModal}
                    className="p-2 hover:bg-primary/80 rounded-md transition-colors"
                    aria-label="Close modal"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {topics?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topics.map((topic) => (
                    <div
                      key={topic._id}
                      className="bg-muted/50 border rounded-lg p-5 hover:bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
                    >
                      <h3 className="font-semibold text-foreground text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {topic.name?.en}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-2 line-clamp-1">{topic.name?.bn}</p>
                      <div className="flex gap-2 pt-3 border-t mt-4">
                        <button
                          onClick={() => openAddEditModal(topic)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors text-sm font-medium"
                        >
                          {" "}
                          Edit{" "}
                        </button>
                        <button
                          onClick={() => handleDeleteTopic(topic._id)}
                          className="flex items-center justify-center px-3 py-2 bg-red-500 text-destructive-foreground rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          {" "}
                          Delete{" "}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-foreground mb-2">No topics yet</h3>
                  <p className="text-muted-foreground mb-6">Get started by creating your first topic.</p>
                  <button
                    onClick={() => openAddEditModal()}
                    className="px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-lg"
                  >
                    {" "}
                    Create First Topic{" "}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isAddEditModalOpen && (
        <TopicAddOrEditModal
          isEditMode={isEditMode}
          closeAddEditModal={closeAddEditModal}
          newTopic={newTopic}
          setNewTopic={setNewTopic}
          handleAddTopic={handleAddTopic}
          handleEditTopic={handleEditTopic}
          loading={loading}
          subjectLevel={newTopic.level}
          subjectGroup={newTopic.group}
        />
      )}
    </>
  )
}

export default TopicList
