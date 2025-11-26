"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "../../config/axios.js"
import {
    ArrowLeft,
    Edit,
    Trash2,
    BookOpen,
    Calendar,
    Award,
    Building,
    Target,
    GraduationCap,
    Loader2
} from "lucide-react"
import LatexRenderer from "./LatexRenderer.jsx"
import { showSuccessToast, showErrorToast } from "../../../lib/toast"

const SubjectQuestions = () => {
    const { subjectId } = useParams()
    const navigate = useNavigate()
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get(`/qb/subject/${subjectId}`)
                if (response.data.success) {
                    setQuestions(response.data.data)
                } else {
                    setError(response.data.message)
                }
            } catch (err) {
                console.error("Error fetching questions:", err)
                setError("Failed to fetch questions.")
            } finally {
                setLoading(false)
            }
        }

        if (subjectId) {
            fetchQuestions()
        }
    }, [subjectId])

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this question?")) {
            try {
                const response = await axios.delete(`/qb/${id}`)
                if (response.data.success) {
                    setQuestions(questions.filter(q => q._id !== id))
                    showSuccessToast("Question deleted successfully")
                }
            } catch (err) {
                showErrorToast("Failed to delete question")
            }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-red-600">
                <p>{error}</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">
                    Go Back
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50/80">
            <div className="max-w-7xl mx-auto py-4 px-2 sm:py-10 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <button onClick={() => navigate(-1)} className="group inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-2">
                            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Subjects
                        </button>
                        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center tracking-tight">
                            <span className="bg-blue-600 text-white p-2 rounded-lg mr-3 shadow-lg shadow-blue-200">
                                <BookOpen className="w-6 h-6" />
                            </span>
                            Subject Questions
                        </h1>
                    </div>
                </div>

                <div className="grid gap-4">
                    {questions.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            No questions found for this subject.
                        </div>
                    ) : (
                        questions.map((question) => (
                            <div
                                key={question._id}
                                className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200"
                            >
                                <div className="p-4 sm:p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm sm:text-base font-medium text-slate-900 mb-3 leading-relaxed">
                                                <LatexRenderer latex={question.stem} />
                                                {question.stemImage && (
                                                    <img
                                                        src={question.stemImage}
                                                        alt="Question Stem"
                                                        className="mt-4 rounded-lg max-h-48 object-contain"
                                                    />
                                                )}
                                            </div>

                                            {/* Metadata Badges */}
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    <GraduationCap className="w-3 h-3 mr-1" />
                                                    {question.meta?.level}
                                                </span>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    <Award className="w-3 h-3 mr-1" />
                                                    {question.meta?.mainChapter?.name}
                                                </span>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {question.source?.year}
                                                </span>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                    <Building className="w-3 h-3 mr-1" />
                                                    {question.source?.source?.value}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 ml-4">
                                            <button
                                                onClick={() => navigate(`/questions/edit/${question._id}`)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit Question"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(question._id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Question"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default SubjectQuestions
