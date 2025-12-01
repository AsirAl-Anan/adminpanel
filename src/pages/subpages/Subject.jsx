"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, BookOpen, Calculator, Globe, Beaker, Filter, ArrowRight, Plus } from "lucide-react"
import { NavLink } from "react-router-dom"
import axios from "../../config/axios.js"
import { ClipLoader } from "react-spinners"

const SubjectsPage = () => {
  const [activeLevel, setActiveLevel] = useState("HSC")
  const [selectedGroup, setSelectedGroup] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [languageMode, setLanguageMode] = useState("both")
  const [error, setError] = useState("")
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSubjects = async () => {
    try {
      console.log(true)
      console.log("fetching subjects")
      setLoading(true)
      const res = await axios.get("/subject/subjects")
      console.log(res)
      if (res?.status !== 200) {
        console.log("error", res)
        setError(res?.data?.message)
        return
      }
      setSubjects(res.data)
    } catch (err) {
      setError("Failed to fetch subjects")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  const getIcon = (group) => {
    const icons = {
      science: Beaker,
      commerce: Calculator,
      humanities: Globe,
    }
    return icons[group.toLowerCase()] || BookOpen
  }

  const filteredSubjects = useMemo(() => {
    let subjectsList = [...subjects]

    subjectsList = subjectsList.filter((subject) => subject.level.toUpperCase() === activeLevel.toUpperCase())

    if (selectedGroup !== "All") {
      subjectsList = subjectsList.filter((subject) => subject.group.toLowerCase() === selectedGroup.toLowerCase())
    }

    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase()
      subjectsList = subjectsList.filter(
        (subject) =>
          subject.name?.en?.toLowerCase().includes(lowercasedSearchTerm) ||
          subject.name?.bn?.toLowerCase().includes(lowercasedSearchTerm) ||
          subject.subjectCode.toString().includes(searchTerm) ||
          subject.aliases?.english?.some((alias) => alias.toLowerCase().includes(lowercasedSearchTerm)) ||
          subject.aliases?.bangla?.some((alias) => alias.toLowerCase().includes(lowercasedSearchTerm)) ||
          subject.aliases?.banglish?.some((alias) => alias.toLowerCase().includes(lowercasedSearchTerm)),
      )
    }

    return subjectsList
  }, [subjects, activeLevel, selectedGroup, searchTerm])

  const currentLevelSubjects = useMemo(() => {
    return subjects.filter((subject) => subject.level.toUpperCase() === activeLevel.toUpperCase())
  }, [subjects, activeLevel])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ClipLoader color="hsl(var(--primary))" size={40} speedMultiplier={0.8} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
        {/* Stats */}
        <div className="mt-12 border border-border rounded-lg p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-base font-bold text-foreground mb-1">{filteredSubjects.length}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Results</div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold text-foreground mb-1">
                {new Set(currentLevelSubjects.map((subject) => subject.group)).size}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Groups</div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold text-foreground mb-1">{currentLevelSubjects.length}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{activeLevel} Subjects</div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold text-foreground mb-1">{subjects.length}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Total</div>
            </div>
          </div>
        </div>
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Level Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex border border-border rounded-lg p-1">
              {["SSC", "HSC"].map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setActiveLevel(level)
                    setSelectedGroup("All")
                  }}
                  className={`px-8 py-2 rounded-md font-medium text-sm transition-all ${
                    activeLevel === level
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm bg-card text-foreground"
              />
            </div>

            {/* Language Toggle */}
            <div className="flex border border-border rounded-lg p-1">
              {[
                { key: "both", label: "Both" },
                { key: "english", label: "EN" },
                { key: "bangla", label: "বাং" },
              ].map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => setLanguageMode(mode.key)}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                    languageMode === mode.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Group Filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {["All", "Science", "Commerce", "Humanities"].map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-5 py-2 rounded-full text-xs font-medium transition-all ${
                selectedGroup === group
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-muted"
              }`}
            >
              {group === "All"
                ? "All Subjects"
                : group}
            </button>
          ))}
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSubjects.map((subject, index) => {
            const IconComponent = getIcon(subject.group)
            return (
              <div
                key={`${subject._id}-${index}`}
                className="group bg-card border border-border rounded-lg hover:border-primary transition-all duration-200"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
                      <IconComponent className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wide font-medium text-muted-foreground bg-secondary px-2 py-1 rounded">
                      {subject.group}
                    </span>
                  </div>

                  {/* Subject Name */}
                  <div className="space-y-1">
                    {(languageMode === "both" || languageMode === "bangla") && (
                      <h3 className="text-base font-semibold text-foreground leading-tight">
                        {subject.name?.bn || "..."}
                      </h3>
                    )}
                    {(languageMode === "both" || languageMode === "english") && (
                      <h4 className="text-xs text-muted-foreground font-medium">
                        {subject.name?.en || "..."}
                      </h4>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Code</span>
                    <span className="text-xs font-mono font-semibold text-foreground">
                      {subject.subjectCode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Level</span>
                    <span className="text-xs font-semibold text-foreground">
                      {subject.level}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Group</span>
                    <span className="text-xs font-semibold text-foreground capitalize">
                      {subject.group}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 pb-5 space-y-2">
                  <div className="w-full h-px bg-border mb-3"></div>
                  
                  <NavLink
                    to={`/subject/${subject._id}`}
                    className="flex items-center justify-between w-full px-4 py-2.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 transition-opacity group/btn"
                  >
                    <span>Edit Subject</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </NavLink>
                  
                  <NavLink
                    to={`/questions/${subject?.level}/${subject?.group}/${subject?._id}`}
                    className="flex items-center justify-between w-full px-4 py-2.5 bg-secondary text-foreground text-xs font-medium rounded-md hover:bg-muted transition-colors group/btn"
                  >
                    <span>View Questions</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </NavLink>
                  
                  <NavLink
                    to={`/add-cq?subject=${subject?._id}&level=${subject?.level}&group=${subject?.group}`}
                    className="flex items-center justify-between w-full px-4 py-2.5 border border-border text-foreground text-xs font-medium rounded-md hover:border-primary hover:bg-secondary transition-colors group/btn"
                  >
                    <span>Add Questions</span>
                    <Plus className="w-3.5 h-3.5 group-hover/btn:rotate-90 transition-transform" />
                  </NavLink>
                </div>
              </div>
            )
          })}
        </div>

        {/* No Results */}
        {filteredSubjects.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No subjects found</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchTerm("")
                setSelectedGroup("All")
              }}
              className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Clear Filters
            </button>
          </div>
        )}

      
      </div>
    </div>
  )
}

export default SubjectsPage
