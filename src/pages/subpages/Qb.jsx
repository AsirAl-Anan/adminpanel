import React, { useState, useMemo, useEffect } from 'react';
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
  Menu,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axios from '../../config/axios.js';
import LatexRenderer from './LatexRenderer.jsx';
import { HashLoader } from 'react-spinners';

 
const QuestionBankPage = () => {
  const [loading, setLoading] = useState(true);
  const { level, subjectId, group } = useParams();
  // State for questions and error handling
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  // Fetch questions from the API
  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`/qb/subject/${subjectId}/level?group=${group}&level=${level}`);
      if (!response.data.success) {
        setError(response.data.message);
      } else {
          setLoading(false);
          console.log(response.data.data);
        setQuestions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };
  useEffect(() => {
    fetchQuestions();
  }, []);
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState({});
  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    return {
      boards: [...new Set(questions.map((q) => q.board))].sort(),
      years: [...new Set(questions.map((q) => q.year))].sort((a, b) => b - a),
      topics: [...new Set(questions.map((q) => q.cTopic?.englishName).filter(Boolean))].sort(),
      chapters: [...new Set(questions.map((q) => q.chapter?.englishName).filter(Boolean))].sort(),
      versions: [...new Set(questions.map((q) => q.version))].sort(),
      difficulties: ['easy', 'medium', 'hard'],
    };
  }, [questions]);
  // Filter questions based on search and filters
  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const matchesSearch =
        searchQuery === '' ||
        question.stem.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.a?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.b?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.c?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.d?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBoard = selectedBoard === '' || question.board === selectedBoard;
      const matchesYear = selectedYear === '' || question.year.toString() === selectedYear;
      const matchesTopic = selectedTopic === '' || question.cTopic?.englishName === selectedTopic;
      const matchesChapter = selectedChapter === '' || question.chapter?.englishName === selectedChapter;
      const matchesDifficulty = selectedDifficulty === '' || question.difficulty === selectedDifficulty;
      const matchesVersion = selectedVersion === '' || question.version === selectedVersion;
      return (
        matchesSearch &&
        matchesBoard &&
        matchesYear &&
        matchesTopic &&
        matchesChapter &&
        matchesDifficulty &&
        matchesVersion
      );
    });
  }, [
    searchQuery,
    selectedBoard,
    selectedYear,
    selectedTopic,
    selectedChapter,
    selectedDifficulty,
    questions,
    selectedVersion
  ]);
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedBoard('');
    setSelectedYear('');
    setSelectedTopic('');
    setSelectedChapter('');
    setSelectedDifficulty('');
    setSelectedVersion('');
  };
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return '●';
      case 'medium':
        return '●●';
      case 'hard':
        return '●●●';
      default:
        return '●';
    }
  };
  const toggleAnswer = (questionId, part) => {
    const key = `${questionId}-${part}`;
    setExpandedAnswers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  const isAnswerExpanded = (questionId, part) => {
    const key = `${questionId}-${part}`;
    return expandedAnswers[key] || false;
  };

  // Function to truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };


  if (loading) {
 return <>
<div className="fixed inset-0 flex items-center justify-center bg-white/10 backdrop-blur-md z-50">
  <HashLoader color="#36d7b7" />
</div>

 </> 
  }
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
      style={{ fontFamily: '"Noto Sans Bengali", "Inter", sans-serif' }}
    >
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(true)}
                className="sm:hidden p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <Filter size={18} />
              </button>
              <div className="text-xs text-gray-500 hidden sm:block">
                {filteredQuestions.length} of {questions.length} questions
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500 sm:hidden">
                {filteredQuestions.length}/{questions.length}
              </div>
              <button
                onClick={() => setShowFilters(true)}
                className="hidden sm:flex bg-blue-600 text-white px-3 py-1.5 rounded-lg items-center gap-1 hover:bg-blue-700 transition-colors text-sm"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed inset-y-0 right-0 w-full sm:w-80 bg-white shadow-xl">
            <div className="h-full flex flex-col">
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Filter size={18} className="text-blue-600" />
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              {/* Filter Content */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                {/* Clear All Button */}
                <button
                  onClick={clearAllFilters}
                  className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium text-left"
                >
                  Clear All Filters
                </button>
                {/* Search Bar */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Search Questions</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                {/* Version Filter */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Version</label>
                  <select
                    value={selectedVersion}
                    onChange={(e) => setSelectedVersion(e.target.value)}
                    className="w-full p-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Board</label>
                  <select
                    value={selectedBoard}
                    onChange={(e) => setSelectedBoard(e.target.value)}
                    className="w-full p-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full p-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Topic</label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full p-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Chapter</label>
                  <select
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    className="w-full p-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Chapters</option>
                    {filterOptions.chapters.map((chapter) => (
                      <option key={chapter} value={chapter}>
                        {chapter}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Difficulty Filter */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Difficulty</label>
                  <div className="space-y-1.5">
                    {filterOptions.difficulties.map((difficulty) => (
                      <label key={difficulty} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="difficulty"
                          value={difficulty}
                          checked={selectedDifficulty === difficulty}
                          onChange={(e) => setSelectedDifficulty(e.target.value)}
                          className="mr-2 text-blue-600 w-3.5 h-3.5"
                        />
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(difficulty)}`}>
                          {getDifficultyIcon(difficulty)} {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                  {selectedDifficulty && (
                    <button
                      onClick={() => setSelectedDifficulty('')}
                      className="text-xs text-blue-600 hover:text-blue-700 mt-1.5"
                    >
                      Clear difficulty filter
                    </button>
                  )}
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 text-center">
                <BookOpen className="mx-auto text-gray-300 mb-2" size={32} />
                <h3 className="text-base font-medium text-gray-900 mb-1">No questions found</h3>
                <p className="text-xs text-gray-500">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredQuestions?.map((question) => (
                  <div
                    key={question._id}
                    className={`bg-white rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md ${
                      question.isNew ? 'border-blue-200 bg-blue-50/30' :
                        question.isRecent ? 'border-green-200 bg-green-50/30' : 'border-gray-100'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="p-3 sm:p-4 border-b border-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-2 flex-wrap justify-between">
                            {question?.isNew && (
                              <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                                New
                              </span>
                            )}
                            {question?.isRecent && (
                              <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                                Recent
                              </span>
                            )}
                            
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${getDifficultyColor(question.difficulty)}`}>
                              {getDifficultyIcon(question.difficulty)} {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                            </span>
                            {/* Action Buttons */}
                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                          <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                            <Edit size={14} />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200">
                            <Trash2 size={14} />
                          </button>
                        </div>
                          </div>
                          <div className="text-sm sm:text-base font-medium text-gray-900 mb-3 leading-relaxed">
                           <LatexRenderer latex={question.stem} />
                           {
                            question?.stemImage && 
                            ( <div className="flex justify-center"> <img src={question.stemImage} alt="Question Stem" className="mt-4 rounded-lg " /> </div> )
                           }
                          </div>
                          {/* Question Parts */}
                          <div className="space-y-2">
                            {question.a && (
                              <div className="space-y-1.5">
                                <div className="flex items-start gap-2">
                                  <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px] font-medium min-w-[20px] text-center flex-shrink-0">a</span>
                                  <p className="text-gray-700 flex-1 text-xs sm:text-sm"> <LatexRenderer  latex={question.a} />  </p>
                                  <button
                                    onClick={() => toggleAnswer(question._id, 'a')}
                                    className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200 flex-shrink-0"
                                  >
                                    {isAnswerExpanded(question._id, 'a') ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </button>
                                </div>
                                {isAnswerExpanded(question._id, 'a') && question.aAnswer && (
                                  <div className="ml-7 p-2 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="text-[10px] text-green-600 font-medium mb-0.5">Answer:</div>
                                    <div className="text-xs text-green-800 whitespace-pre-line"><LatexRenderer latex={question.aAnswer} /></div>
                                  </div>
                                )}
                              </div>
                            )}
                            {question.b && (
                              <div className="space-y-1.5">
                                <div className="flex items-start gap-2">
                                  <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px] font-medium min-w-[20px] text-center flex-shrink-0">b</span>
                                  <p className="text-gray-700 flex-1 text-xs sm:text-sm"> <LatexRenderer latex={question.b} /> </p>
                                  <button
                                    onClick={() => toggleAnswer(question._id, 'b')}
                                    className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200 flex-shrink-0"
                                  >
                                    {isAnswerExpanded(question._id, 'b') ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </button>
                                </div>
                                {isAnswerExpanded(question._id, 'b') && question.bAnswer && (
                                  <div className="ml-7 p-2 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="text-[10px] text-green-600 font-medium mb-0.5">Answer:</div>
                                    <div className="text-xs text-green-800 whitespace-pre-line"><LatexRenderer  latex={question.bAnswer}/> </div>
                                  </div>
                                )}
                              </div>
                            )}
                            {question.c && (
                              <div className="space-y-1.5">
                                <div className="flex items-start gap-2">
                                  <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px] font-medium min-w-[20px] text-center flex-shrink-0">c</span>
                                  <p className="text-gray-700 flex-1 text-xs sm:text-sm"> <LatexRenderer latex={question.c} /> </p>
                                  <button
                                    onClick={() => toggleAnswer(question._id, 'c')}
                                    className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200 flex-shrink-0"
                                  >
                                    {isAnswerExpanded(question._id, 'c') ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </button>
                                </div>
                                {isAnswerExpanded(question._id, 'c') && question.cAnswer && (
                                  <div className="ml-7 p-2 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="text-[10px] text-green-600 font-medium mb-0.5">Answer:</div>
                                    <div className="text-xs text-green-800 whitespace-pre-line"><LatexRenderer latex={question.cAnswer} /></div>
                                    {question?.cAnswerImage && 
                                     ( <div className="flex justify-center"> <img src={question.cAnswerImage} alt="Answer Image" className="mt-4 rounded-lg " /> </div> )
                                    }
                                  </div>
                                )}
                              </div>
                            )}
                            {question.d && (
                              <div className="space-y-1.5">
                                <div className="flex items-start gap-2">
                                  <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px] font-medium min-w-[20px] text-center flex-shrink-0">d</span>
                                  <p className="text-gray-700 flex-1 text-xs sm:text-sm"><LatexRenderer latex={question.d} /> </p>
                                  <button
                                    onClick={() => toggleAnswer(question._id, 'd')}
                                    className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200 flex-shrink-0"
                                  >
                                    {isAnswerExpanded(question._id, 'd') ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </button>
                                </div>
                                {isAnswerExpanded(question._id, 'd') && question.dAnswer && (
                                  <div className="ml-7 p-2 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="text-[10px] text-green-600 font-medium mb-0.5">Answer:</div>
                                    <div className="text-xs text-green-800 whitespace-pre-line"><LatexRenderer latex={truncateText(question.dAnswer, 100)} /> </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                      </div>
                    </div>
                    {/* Question Metadata */}
                    <div className="p-3 sm:p-4 bg-gray-50/50">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="text-purple-600 flex-shrink-0" size={14} />
                          <div className="min-w-0">
                            <div className="text-gray-500 text-[10px]">Level</div>
                            <div className="font-medium text-gray-900 truncate">{question.level}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="text-blue-600 flex-shrink-0" size={14} />
                          <div className="min-w-0">
                            <div className="text-gray-500 text-[10px]">Subject</div>
                            <div className="font-medium text-gray-900 truncate text-xs">{question.subject?.englishName}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Target className="text-green-600 flex-shrink-0" size={14} />
                          <div className="min-w-0">
                            <div className="text-gray-500 text-[10px]">Topic</div>
                            <div className="font-medium text-gray-900 truncate text-xs">{question.cTopic?.englishName}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="text-orange-600 flex-shrink-0" size={14} />
                          <div className="min-w-0">
                            <div className="text-gray-500 text-[10px]">Year</div>
                            <div className="font-medium text-gray-900">{question.year}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Building className="text-indigo-600 flex-shrink-0" size={14} />
                          <div className="min-w-0">
                            <div className="text-gray-500 text-[10px]">Board</div>
                            <div className="font-medium text-gray-900 truncate">{question.board}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Award className="text-red-600 flex-shrink-0" size={14} />
                          <div className="min-w-0">
                            <div className="text-gray-500 text-[10px]">Chapter</div>
                            <div className="font-medium text-gray-900 truncate text-xs">{question.chapter?.englishName}</div>
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
      <button className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-blue-600 text-white p-2.5 sm:p-3 rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition-all duration-200 group z-40">
       <NavLink to={'/add-cq'}> <Plus size={18} /></NavLink>  
      </button>
    </div>
  );
};

export default QuestionBankPage;