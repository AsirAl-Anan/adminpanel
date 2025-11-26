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
  MoreHorizontal
} from "lucide-react"
import { useLocation, NavLink, useParams } from "react-router-dom"
import axios from "../../config/axios.js"
import LatexRenderer from "./LatexRenderer.jsx" // Assuming this exists
import { HashLoader } from "react-spinners"

/**
 * REFACTORED COMPONENT: BilingualContentRenderer
 * Changes: Removed bulky badges. Used subtle left-borders to denote language.
 * Added 'side-by-side' logic for larger screens if texts are short (optional, kept stacked for safety here).
 */
const BilingualContentRenderer = ({ blocks }) => {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return null;

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => (
        <div key={index} className="flex flex-col gap-1.5 group">
          {/* English Content - Blue Accent */}
          {block.text?.en && (
            <div className="relative pl-3 border-l-2 border-blue-400/30 transition-colors group-hover:border-blue-400">
              <div className="text-sm text-foreground/90 leading-relaxed">
                <LatexRenderer latex={block.text.en} />
              </div>
            </div>
          )}

          {/* Bangla Content - Green Accent */}
          {block.text?.bn && (
            <div className="relative pl-3 border-l-2 border-green-400/30 transition-colors group-hover:border-green-400">
              <div className="text-sm text-foreground/80 font-bengali leading-relaxed">
                <LatexRenderer latex={block.text.bn} />
              </div>
            </div>
          )}

          {/* Images */}
          {block.images && block.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 pl-3">
              {block.images.map((img, imgIndex) => (
                <img
                  key={imgIndex}
                  src={img.url}
                  alt={img.caption?.english || "Question Image"}
                  className="max-w-full h-auto rounded-md border border-border max-h-48 object-contain"
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const QuestionBankPage = () => {
  const [loading, setLoading] = useState(true)
  const { level, subjectId, group } = useParams()
  const [questions, setQuestions] = useState([])
  const [error, setError] = useState(null)

  // Filter States
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBoard, setSelectedBoard] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedExamType, setSelectedExamType] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [selectedChapter, setSelectedChapter] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [expandedAnswers, setExpandedAnswers] = useState({})

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`/qb/subject/${subjectId}`)
      if (!response.data.success) {
        setError(response.data.message)
      } else {
        setQuestions(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  // --- Helper Functions for Filtering (Unchanged logic, kept for functionality) ---
  const getTextFromBlock = (blocks) => {
    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return "";
    return blocks.map(block => `${block.text?.en || ""} ${block.text?.bn || ""}`).join(" ");
  };

  const getTextFromPart = (part, type = 'question') => {
    if (!part) return "";
    return getTextFromBlock(part[type]);
  };

  const filterOptions = useMemo(() => {
    return {
      boards: [...new Set(questions.map((q) => q.source?.source?.value).filter(Boolean))].sort(),
      years: [...new Set(questions.map((q) => q.source?.year).filter(Boolean))].sort((a, b) => b - a),
      examTypes: [...new Set(questions.map((q) => q.source?.examType).filter(Boolean))].sort(),
      topics: [...new Set(questions.flatMap((q) => [
        ...(q.c?.topics || []).map(t => t.topicId?.name?.en),
        ...(q.d?.topics || []).map(t => t.topicId?.name?.en)
      ]).filter(Boolean))].sort(),
      chapters: [...new Set(questions.map((q) => q.meta?.mainChapter?.name).filter(Boolean))].sort(),
    }
  }, [questions])

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const stemText = getTextFromBlock(question.stem);
      const fullText = `${stemText} ${getTextFromPart(question.a)} ${getTextFromPart(question.b)} ${getTextFromPart(question.c)} ${getTextFromPart(question.d)}`;

      const matchesSearch = searchQuery === "" || fullText.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBoard = selectedBoard === "" || question.source?.source?.value === selectedBoard
      const matchesYear = selectedYear === "" || question.source?.year?.toString() === selectedYear
      const matchesExamType = selectedExamType === "" || question.source?.examType === selectedExamType
      const matchesTopic = selectedTopic === "" ||
        question.c?.topics?.some(t => t.topicId?.name?.en === selectedTopic) ||
        question.d?.topics?.some(t => t.topicId?.name?.en === selectedTopic)
      const matchesChapter = selectedChapter === "" || question.meta?.mainChapter?.name === selectedChapter

      return matchesSearch && matchesBoard && matchesYear && matchesExamType && matchesTopic && matchesChapter
    })
  }, [searchQuery, selectedBoard, selectedYear, selectedExamType, selectedTopic, selectedChapter, questions])

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedBoard("")
    setSelectedYear("")
    setSelectedExamType("")
    setSelectedTopic("")
    setSelectedChapter("")
  }

  const toggleAnswer = (questionId, part) => {
    const key = `${questionId}-${part}`
    setExpandedAnswers((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const isAnswerExpanded = (questionId, part) => expandedAnswers[`${questionId}-${part}`] || false

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-50">
        <HashLoader color="hsl(var(--primary))" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50" style={{ fontFamily: '"Noto Sans Bengali", "Inter", sans-serif' }}>

      {/* --- Filter & Header Section (Kept mostly similar, slight cleanup) --- */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-800">Question Bank</h1>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-md text-gray-600">
                {filteredQuestions.length} Items
              </span>
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-colors shadow-sm"
              >
                <Filter size={16} />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-5xl mx-auto px-4 py-6">

        {filteredQuestions?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <Search className="text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900">No questions found</h3>
            <p className="text-sm text-gray-500 mt-1">Adjust your filters to see results</p>
            <button onClick={clearAllFilters} className="mt-4 text-primary hover:underline text-sm font-medium">Clear filters</button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQuestions?.map((question) => (
              <div
                key={question?._id}
                className="bg-white rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden group hover:shadow-md transition-all duration-300"
              >
                {/* --- CARD HEADER: Actions & Status --- */}
                <div className="px-5 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                  <div className="flex items-center gap-2">
                    {/* Question Number/ID could go here */}
                    <span className="text-xs font-mono text-gray-400">#{question._id.slice(-6)}</span>
                    {question?.isNew && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">New</span>}
                    {question?.isRecent && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Recent</span>}
                  </div>

                  {/* Top Right Actions */}
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <NavLink to={`/questions/edit/${question._id}`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                      <Edit size={16} />
                    </NavLink>
                    <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* --- CARD BODY: Stem --- */}
                <div className="px-5 py-4">
                  <div className="text-base text-gray-800 mb-6">
                    <BilingualContentRenderer blocks={question.stem} />
                  </div>

                  {/* --- CARD BODY: Options / Sub-questions --- */}
                  <div className="space-y-3 pl-1">
                    {['a', 'b', 'c', 'd'].map((partKey) => {
                      const partData = question[partKey];
                      if (!partData) return null;
                      const isExpanded = isAnswerExpanded(question._id, partKey);

                      return (
                        <div key={partKey} className="group/part">
                          {/* Flex container to keep Label + Toggle + Text together */}
                          <div className="flex items-start gap-3">
                            {/* Left Control: Label + Toggle */}
                            <button
                              onClick={() => toggleAnswer(question._id, partKey)}
                              className={`flex-shrink-0 flex items-center justify-center gap-1 w-14 h-8 rounded-full border transition-all duration-200 
                                            ${isExpanded
                                  ? 'bg-primary/10 border-primary/20 text-primary'
                                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-primary/30 hover:text-primary'
                                }`}
                            >
                              <span className="font-semibold uppercase text-xs">{partKey}</span>
                              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>

                            {/* Right Content: Question Text */}
                            <div className="flex-1 pt-1">
                              <div className="text-sm">
                                <BilingualContentRenderer blocks={partData.question} />
                              </div>
                            </div>
                          </div>

                          {/* Expanded Answer Section */}
                          {isExpanded && partData.answer && (
                            <div className="ml-[3.75rem] mt-3 mr-2 p-3 bg-green-50/50 rounded-lg border border-green-100/50 animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider bg-green-100 px-1.5 py-0.5 rounded">Answer</span>
                              </div>
                              <div className="text-sm text-gray-700">
                                <BilingualContentRenderer blocks={partData.answer} />
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* --- CARD FOOTER: Metadata Chips --- */}
                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-1 text-xs text-gray-500">

                    {/* Subject & Chapter */}
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded-full shadow-sm">
                      <BookOpen size={12} className="text-blue-500" />
                      <span className="font-medium text-gray-700">{question.meta?.subject?.name}</span>
                      <span className="text-gray-300">•</span>
                      <span className="truncate max-w-[150px]" title={question.meta?.mainChapter?.name}>{question.meta?.mainChapter?.name}</span>
                    </div>

                    {/* Topic */}
                    {question.c?.topics?.[0]?.topicId?.name?.en && (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded-full shadow-sm">
                        <Target size={12} className="text-purple-500" />
                        <span className="truncate max-w-[150px]">{question.c.topics[0].topicId.name.en}</span>
                      </div>
                    )}

                    {/* Board & Year */}
                    {(question.source?.source?.value || question.source?.year) && (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded-full shadow-sm">
                        <Building size={12} className="text-orange-500" />
                        <span>{question.source?.source?.value}</span>
                        {question.source?.year && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span className="font-semibold">{question.source.year}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <NavLink to={"/add-cq"} className="fixed bottom-8 right-8 z-40">
        <button className="bg-primary hover:bg-primary/90 text-white p-4 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center">
          <Plus size={24} />
        </button>
      </NavLink>

      {/* --- Filter Drawer (Unchanged Logic, just styling consistency) --- */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" onClick={() => setShowFilters(false)}>
          <div
            className="absolute inset-y-0 right-0 w-full sm:w-80 bg-background shadow-2xl transform transition-transform duration-300 ease-out"
            onClick={e => e.stopPropagation()}
          >
            {/* ... Keep existing Filter Drawer JSX ... */}
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-lg flex items-center gap-2"><Filter size={18} /> Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                <button onClick={clearAllFilters} className="text-sm text-red-500 hover:underline w-full text-right">Reset All</button>
                {/* Search */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-gray-500">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      placeholder="Keywords..."
                    />
                  </div>
                </div>
                {/* Selects */}
                {[
                  { label: "Board", value: selectedBoard, setter: setSelectedBoard, options: filterOptions.boards },
                  { label: "Year", value: selectedYear, setter: setSelectedYear, options: filterOptions.years },
                  { label: "Exam Type", value: selectedExamType, setter: setSelectedExamType, options: filterOptions.examTypes },
                  { label: "Topic", value: selectedTopic, setter: setSelectedTopic, options: filterOptions.topics },
                  { label: "Chapter", value: selectedChapter, setter: setSelectedChapter, options: filterOptions.chapters },
                ].map((filter, i) => (
                  <div key={i} className="space-y-1">
                    <label className="text-xs font-semibold uppercase text-gray-500">{filter.label}</label>
                    <select
                      value={filter.value}
                      onChange={(e) => filter.setter(e.target.value)}
                      className="w-full p-2 text-sm border rounded-md bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="">All {filter.label}s</option>
                      {filter.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuestionBankPage