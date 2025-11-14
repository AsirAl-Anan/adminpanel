"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Search,
  Filter,
  X,
  Edit,
  Trash2,
  Plus,
  BookOpen,
  Calendar,
  Award,
  Building,
  Target,
  GraduationCap,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useLocation } from "react-router-dom"
import { NavLink } from "react-router-dom"
import { useParams } from "react-router-dom"
import axios from "../../config/axios.js"
import LatexRenderer from "../../components/LatexRenderer"
import { HashLoader } from "react-spinners"

const QuestionBankPage = () => {
  const [loading, setLoading] = useState(true)
  const { level, subjectId, group } = useParams()
  // State for questions and error handling
  const [questions, setQuestions] = useState([])
  const [error, setError] = useState(null)
  // Fetch questions from the API
  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`/qb/subject/${subjectId}/level?group=${group}&level=${level}`)
      if (!response.data.success) {
        setError(response.data.message)
      } else {
        setLoading(false)
        console.log(response.data.data)
        setQuestions(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
    }
  }
  useEffect(() => {
    fetchQuestions()
  }, [])
  // Filter states
  const location = useLocation()
  console.log("Location:", location)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBoard, setSelectedBoard] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [selectedChapter, setSelectedChapter] = useState("")
  const [selectedVersion, setSelectedVersion] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [expandedAnswers, setExpandedAnswers] = useState({})
  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    return {
      boards: [...new Set(questions.map((q) => q.board))].sort(),
      years: [...new Set(questions.map((q) => q.year))].sort((a, b) => b - a),
      topics: [...new Set(questions.map((q) => q.cTopic?.englishName).filter(Boolean))].sort(),
      chapters: [...new Set(questions.map((q) => q.chapter?.englishName).filter(Boolean))].sort(),
      versions: [...new Set(questions.map((q) => q.version))].sort(),
    }
  }, [questions])
  // Filter questions based on search and filters
  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const matchesSearch =
        searchQuery === "" ||
        question.stem.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.a?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.b?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.c?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.d?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesBoard = selectedBoard === "" || question.board === selectedBoard
      const matchesYear = selectedYear === "" || question.year.toString() === selectedYear
      const matchesTopic = selectedTopic === "" || question.cTopic?.englishName === selectedTopic
      const matchesChapter = selectedChapter === "" || question.chapter?.englishName === selectedChapter
      const matchesVersion = selectedVersion === "" || question.version === selectedVersion
      return matchesSearch && matchesBoard && matchesYear && matchesTopic && matchesChapter && matchesVersion
    })
  }, [searchQuery, selectedBoard, selectedYear, selectedTopic, selectedChapter, questions, selectedVersion])
  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedBoard("")
    setSelectedYear("")
    setSelectedTopic("")
    setSelectedChapter("")
    setSelectedVersion("")
  }

  const toggleAnswer = (questionId, part) => {
    const key = `${questionId}-${part}`
    setExpandedAnswers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }
  const isAnswerExpanded = (questionId, part) => {
    const key = `${questionId}-${part}`
    return expandedAnswers[key] || false
  }

  // Function to truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return ""
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  if (loading) {
    return (
      <>
        {/* Updated to use design tokens */}
        <div className="fixed inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-50">
          <HashLoader color="hsl(var(--primary))" />
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: '"Noto Sans Bengali", "Inter", sans-serif' }}>
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(true)}
                className="sm:hidden p-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              >
                <Filter size={18} />
              </button>
              <div className="text-xs text-muted-foreground hidden sm:block">
                {filteredQuestions.length} of {questions.length} questions
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground sm:hidden">
                {filteredQuestions.length}/{questions.length}
              </div>
              <button
                onClick={() => setShowFilters(true)}
                className="hidden sm:flex bg-primary text-primary-foreground px-3 py-1.5 rounded-lg items-center gap-1 hover:opacity-90 transition-colors text-sm"
              >
                <Filter size={14} />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Drawer Overlay */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="fixed inset-y-0 right-0 w-full sm:w-80 bg-card shadow-xl">
            <div className="h-full flex flex-col">
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
                <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                  <Filter size={18} className="text-primary" />
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1.5 sm:p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Filter Content */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                {/* Clear All Button */}
                <button
                  onClick={clearAllFilters}
                  className="w-full text-sm text-primary hover:opacity-80 font-medium text-left"
                >
                  Clear All Filters
                </button>

                {/* Search Bar */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">
                    Search Questions
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      size={14}
                    />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg focus:ring-1 focus:ring-ring focus:border-ring transition-colors bg-background text-foreground"
                    />
                  </div>
                </div>

                {/* Version Filter */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">Version</label>
                  <select
                    value={selectedVersion}
                    onChange={(e) => setSelectedVersion(e.target.value)}
                    className="w-full p-1.5 text-sm border border-border rounded-lg focus:ring-1 focus:ring-ring focus:border-ring bg-background text-foreground"
                  >
                    <option value="">All versions</option>
                    {filterOptions.versions.map((version) => (
                      <option key={version} value={version}>
                        {version}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Board Filter */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">Board</label>
                  <select
                    value={selectedBoard}
                    onChange={(e) => setSelectedBoard(e.target.value)}
                    className="w-full p-1.5 text-sm border border-border rounded-lg focus:ring-1 focus:ring-ring focus:border-ring bg-background text-foreground"
                  >
                    <option value="">All Boards</option>
                    {filterOptions.boards.map((board) => (
                      <option key={board} value={board}>
                        {board}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full p-1.5 text-sm border border-border rounded-lg focus:ring-1 focus:ring-ring focus:border-ring bg-background text-foreground"
                  >
                    <option value="">All Years</option>
                    {filterOptions.years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Topic Filter */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">Topic</label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full p-1.5 text-sm border border-border rounded-lg focus:ring-1 focus:ring-ring focus:border-ring bg-background text-foreground"
                  >
                    <option value="">All Topics</option>
                    {filterOptions.topics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chapter Filter */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">Chapter</label>
                  <select
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    className="w-full p-1.5 text-sm border border-border rounded-lg focus:ring-1 focus:ring-ring focus:border-ring bg-background text-foreground"
                  >
                    <option value="">All Chapters</option>
                    {filterOptions.chapters.map((chapter) => (
                      <option key={chapter} value={chapter}>
                        {chapter}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
        <div className="flex flex-col gap-3">
          {/* Questions Grid */}
          <div className="flex-1">
            {filteredQuestions?.length === 0 ? (
              <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6 text-center">
                <BookOpen className="mx-auto text-muted-foreground mb-2" size={32} />
                <h3 className="text-base font-medium text-foreground mb-1">No questions found</h3>
                <p className="text-xs text-muted-foreground">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredQuestions?.map((question) => (
                  <div
                    key={question?._id}
                    className="bg-card rounded-lg shadow-sm border border-border transition-all duration-200 hover:shadow-md hover:border-primary/50"
                  >
                    {/* Question Header */}
                    <div className="p-3 sm:p-4 border-b border-border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-2 flex-wrap justify-between">
                            {question?.isNew && (
                              <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                                New
                              </span>
                            )}
                            {question?.isRecent && (
                              <span className="bg-success/10 text-success px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                                Recent
                              </span>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                              <NavLink
                                to={`${location.pathname}/${question._id}`}
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-all duration-200"
                              >
                                <Edit size={14} />
                              </NavLink>
                              <button className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="text-sm sm:text-base font-medium text-foreground mb-3 leading-relaxed">
                            <LatexRenderer latex={question.stem} />
                            {question?.stemImage && (
                              <div className="flex justify-center">
                                {" "}
                                <img
                                  src={question.stemImage || "/placeholder.svg"}
                                  alt="Question Stem"
                                  className="mt-4 rounded-lg "
                                />{" "}
                              </div>
                            )}
                          </div>
                          {/* Question Parts */}
                          <div className="space-y-2">
                            {question.a && (
                              <div className="space-y-1.5">
                                <div className="flex items-start gap-2">
                                  <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-medium min-w-[20px] text-center flex-shrink-0">
                                    a
                                  </span>
                                  <p className="text-foreground flex-1 text-xs sm:text-sm">
                                    {" "}
                                    <LatexRenderer latex={question.a} />{" "}
                                  </p>
                                  <button
                                    onClick={() => toggleAnswer(question._id, "a")}
                                    className="p-0.5 text-muted-foreground hover:text-primary hover:bg-secondary rounded transition-all duration-200 flex-shrink-0"
                                  >
                                    {isAnswerExpanded(question._id, "a") ? (
                                      <ChevronUp size={14} />
                                    ) : (
                                      <ChevronDown size={14} />
                                    )}
                                  </button>
                                </div>
                                {isAnswerExpanded(question._id, "a") && question.aAnswer && (
                                  <div className="ml-7 p-2 bg-success/10 border border-success/20 rounded-lg">
                                    <div className="text-[10px] text-success font-medium mb-0.5">Answer:</div>
                                    <div className="text-xs text-success whitespace-pre-line">
                                      <LatexRenderer latex={question.aAnswer} />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            {question.b && (
                              <div className="space-y-1.5">
                                <div className="flex items-start gap-2">
                                  <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-medium min-w-[20px] text-center flex-shrink-0">
                                    b
                                  </span>
                                  <p className="text-foreground flex-1 text-xs sm:text-sm">
                                    {" "}
                                    <LatexRenderer latex={question.b} />{" "}
                                  </p>
                                  <button
                                    onClick={() => toggleAnswer(question._id, "b")}
                                    className="p-0.5 text-muted-foreground hover:text-primary hover:bg-secondary rounded transition-all duration-200 flex-shrink-0"
                                  >
                                    {isAnswerExpanded(question._id, "b") ? (
                                      <ChevronUp size={14} />
                                    ) : (
                                      <ChevronDown size={14} />
                                    )}
                                  </button>
                                </div>
                                {isAnswerExpanded(question._id, "b") && question.bAnswer && (
                                  <div className="ml-7 p-2 bg-success/10 border border-success/20 rounded-lg">
                                    <div className="text-[10px] text-success font-medium mb-0.5">Answer:</div>
                                    <div className="text-xs text-success whitespace-pre-line">
                                      <LatexRenderer latex={question.bAnswer} />{" "}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            {question.c && (
                              <div className="space-y-1.5">
                                <div className="flex items-start gap-2">
                                  <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-medium min-w-[20px] text-center flex-shrink-0">
                                    c
                                  </span>
                                  <p className="text-foreground flex-1 text-xs sm:text-sm">
                                    {" "}
                                    <LatexRenderer latex={question.c} />{" "}
                                  </p>
                                  <button
                                    onClick={() => toggleAnswer(question._id, "c")}
                                    className="p-0.5 text-muted-foreground hover:text-primary hover:bg-secondary rounded transition-all duration-200 flex-shrink-0"
                                  >
                                    {isAnswerExpanded(question._id, "c") ? (
                                      <ChevronUp size={14} />
                                    ) : (
                                      <ChevronDown size={14} />
                                    )}
                                  </button>
                                </div>
                                {isAnswerExpanded(question._id, "c") && question.cAnswer && (
                                  <div className="ml-7 p-2 bg-success/10 border border-success/20 rounded-lg">
                                    <div className="text-[10px] text-success font-medium mb-0.5">Answer:</div>
                                    <div className="text-xs text-success whitespace-pre-line">
                                      <LatexRenderer latex={question.cAnswer} />
                                    </div>
                                    {question?.cAnswerImage && (
                                      <div className="flex justify-center">
                                        {" "}
                                        <img
                                          src={question.cAnswerImage || "/placeholder.svg"}
                                          alt="Answer Image"
                                          className="mt-4 rounded-lg "
                                        />{" "}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                            {question.d && (
                              <div className="space-y-1.5">
                                <div className="flex items-start gap-2">
                                  <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-medium min-w-[20px] text-center flex-shrink-0">
                                    d
                                  </span>
                                  <p className="text-foreground flex-1 text-xs sm:text-sm">
                                    <LatexRenderer latex={question.d} />{" "}
                                  </p>
                                  <button
                                    onClick={() => toggleAnswer(question._id, "d")}
                                    className="p-0.5 text-muted-foreground hover:text-primary hover:bg-secondary rounded transition-all duration-200 flex-shrink-0"
                                  >
                                    {isAnswerExpanded(question._id, "d") ? (
                                      <ChevronUp size={14} />
                                    ) : (
                                      <ChevronDown size={14} />
                                    )}
                                  </button>
                                </div>
                                {isAnswerExpanded(question._id, "d") && question.dAnswer && (
                                  <div className="ml-7 p-2 bg-success/10 border border-success/20 rounded-lg">
                                    <div className="text-[10px] text-success font-medium mb-0.5">Answer:</div>
                                    <div className="text-xs text-success whitespace-pre-line">
                                      <LatexRenderer latex={truncateText(question.dAnswer, 100)} />{" "}
                                    </div>
                                    {question?.dAnswerImage && (
                                      <div className="flex justify-center">
                                        {" "}
                                        <img
                                          src={question.dAnswerImage || "/placeholder.svg"}
                                          alt="Answer Image"
                                          className="mt-4 rounded-lg "
                                        />{" "}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Question Metadata */}
                    <div className="p-3 sm:p-4 bg-secondary/30">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="text-primary flex-shrink-0" size={14} />
                          <div className="min-w-0">
                            <div className="text-muted-foreground text-[10px]">Level</div>
                            <div className="font-medium text-foreground truncate">{question.level}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="text-primary flex-shrink-0" size={14} />
                          <div className="min-w-0">
                            <div className="text-muted-foreground text-[10px]">Subject</div>
                            <div className="font-medium text-foreground truncate text-xs">
                              {question.subject?.englishName}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Target className="text-success flex-shrink-0" size={14} />
                          <div className="min-w-0">
                            <div className="text-muted-foreground text-[10px]">Topic</div>
                            <div className="font-medium text-foreground truncate text-xs">
                              {question.cTopic?.englishName}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="text-primary flex-shrink-0" size={14} />
                          <div className="min-w-0">
                            <div className="text-muted-foreground text-[10px]">Year</div>
                            <div className="font-medium text-foreground">{question.year}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Building className="text-primary flex-shrink-0" size={14} />
                          <div className="min-w-0">
                            <div className="text-muted-foreground text-[10px]">Board</div>
                            <div className="font-medium text-foreground truncate">{question.board}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Award className="text-primary flex-shrink-0" size={14} />
                          <div className="min-w-0">
                            <div className="text-muted-foreground text-[10px]">Chapter</div>
                            <div className="font-medium text-foreground truncate text-xs">
                              {question.chapter?.englishName}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Add Button */}
      <button className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-primary text-primary-foreground p-2.5 sm:p-3 rounded-full shadow-lg hover:opacity-90 hover:scale-110 transition-all duration-200 group z-40">
        <NavLink to={"/add-cq"}>
          {" "}
          <Plus size={18} />
        </NavLink>
      </button>
    </div>
  )
}

export default QuestionBankPage
