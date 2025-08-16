import React, { useState, useMemo, useEffect } from 'react';
import { Search, BookOpen, Calculator, Globe, Users, Beaker, TrendingUp, PenTool, Filter, ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import axios from "../../config/axios.js";
import { ClipLoader } from 'react-spinners';

const SubjectsPage = () => {
  const [activeLevel, setActiveLevel] = useState('HSC');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [languageMode, setLanguageMode] = useState('both');
  const [error, setError] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/subject');
      
      if (res?.data?.success !== true) {
        setError(res?.data?.message);
        return;
      }
      setSubjects(res.data.data);
    } catch (err) {
      setError('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const getIcon = (group) => {
    const icons = {
      science: Beaker,
      commerce: Calculator,
      humanities: Globe,
    };
    return icons[group.toLowerCase()] || BookOpen;
  };

  const getGroupColor = (group) => {
    const colors = {
      science: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      commerce: 'bg-blue-50 border-blue-200 text-blue-800',
      humanities: 'bg-orange-50 border-orange-200 text-orange-800',
    };
    return colors[group.toLowerCase()] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const filteredSubjects = useMemo(() => {
    let subjectsList = [...subjects];

    subjectsList = subjectsList.filter(subject => 
      subject.level.toUpperCase() === activeLevel.toUpperCase()
    );

    if (selectedGroup !== 'All') {
      subjectsList = subjectsList.filter(subject => subject.group.toLowerCase() === selectedGroup.toLowerCase());
    }

    if (searchTerm) {
      subjectsList = subjectsList.filter(subject =>
        subject.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.banglaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.subjectCode.toString().includes(searchTerm)
      );
    }

    return subjectsList;
  }, [subjects, activeLevel, selectedGroup, searchTerm]);

  const currentLevelSubjects = useMemo(() => {
    return subjects.filter(subject => 
      subject.level.toUpperCase() === activeLevel.toUpperCase()
    );
  }, [subjects, activeLevel]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <ClipLoader 
          color="#3B82F6" 
          size={60} 
          speedMultiplier={0.8}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 font-sans">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Level Tabs */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-1 rounded-2xl">
              {['SSC', 'HSC'].map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setActiveLevel(level);
                    setSelectedGroup('All');
                  }}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeLevel === level
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search subjects... / বিষয় খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            {/* Language Toggle */}
            <div className="flex bg-gray-100 rounded-2xl p-1">
              {[
                { key: 'both', label: 'Both' },
                { key: 'english', label: 'EN' },
                { key: 'bangla', label: 'বাং' },
              ].map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => setLanguageMode(mode.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    languageMode === mode.key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Group Filters */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {['All', 'Science', 'Commerce', 'Humanities'].map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                selectedGroup === group
                  ? group === 'All'
                    ? 'bg-gray-900 text-white shadow-lg'
                    : `${getGroupColor(group)} shadow-lg ring-2 ring-opacity-50`
                  : 'bg-white text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-2">
                {group !== 'All' && <Filter className="w-4 h-4" />}
                {group === 'All' ? 'সকল বিষয়' :
                 group === 'Science' ? 'বিজ্ঞান' :
                 group === 'Commerce' ? 'বাণিজ্য' : 'মানবিক'}
                <span className="text-sm opacity-75">({group})</span>
              </div>
            </button>
          ))}
        </div>
        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredSubjects.map((subject, index) => {
            const IconComponent = getIcon(subject.group);
            return (
              <div
                key={`${subject._id}-${index}`}
                className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:border-gray-200 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
              >
                {/* Card Header with Icon */}
                <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${getGroupColor(subject.group)} group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getGroupColor(subject.group)} shadow-sm`}>
                      {subject.group === 'science' ? 'বিজ্ঞান' :
                       subject.group === 'commerce' ? 'বাণিজ্য' : 'মানবিক'}
                    </span>
                  </div>
                </div>
                {/* Card Body */}
                <div className="p-6">
                  {/* Subject Name */}
                  <div className="mb-4">
                    {(languageMode === 'both' || languageMode === 'bangla') && (
                      <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                        {subject.banglaName}
                      </h3>
                    )}
                    {(languageMode === 'both' || languageMode === 'english') && (
                      <h4 className={`font-semibold text-gray-700 group-hover:text-blue-500 transition-colors ${languageMode === 'both' ? 'text-sm' : 'text-lg'}`}>
                        {subject.englishName}
                      </h4>
                    )}
                  </div>
                  {/* Subject Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">কোড / Code:</span>
                      <span className="bg-white px-3 py-1 rounded-lg font-mono text-sm font-bold text-gray-800 shadow-sm">
                        {subject.subjectCode}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">স্তর / Level:</span>
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold text-sm shadow-sm">
                        {subject.level}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">গ্রুপ / Group:</span>
                      <span className={`px-3 py-1 rounded-lg font-bold text-sm shadow-sm ${
                        subject.group === 'Science' ? 'bg-emerald-600 text-white' :
                        subject.group === 'Commerce' ? 'bg-blue-600 text-white' : 'bg-orange-600 text-white'
                      }`}>
                        {subject.group}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Card Footer */}
                <div className="px-6 pb-6">
                  <div className="mb-4">
                    <NavLink
                      to={`/subject/${subject._id}`}
                      className="inline-flex my-4 items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg group/button"
                    >
                      <span className="text-sm">বিষয় সম্পাদনা করুন/ Edit Subject</span>
                      <ArrowRight className="w-4 h-4 ml-2 transform group-hover/button:translate-x-1 transition-transform" />
                    </NavLink>
                    <NavLink
                      to={`/questions/${subject.level}/${subject.group}/${subject._id}`}
                      className="inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg group/button"
                    >
                      <span className="text-sm">প্রশ্ন দেখুন / View Questions</span>
                      <ArrowRight className="w-4 h-4 ml-2 transform group-hover/button:translate-x-1 transition-transform" />
                    </NavLink>
                     <NavLink
                      to={'/add-cq'}
                      className="inline-flex items-center justify-center mt-4 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg group/button"
                    >
                      <span className="text-sm">প্রশ্ন যোগ করুন  / Add  Questions</span>
                      <ArrowRight className="w-4 h-4 ml-2 transform group-hover/button:translate-x-1 transition-transform" />
                    </NavLink>
                  </div>
                  <div className="w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            );
          })}
        </div>
        {/* No Results */}
        {filteredSubjects.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No {activeLevel} subjects found
            </h3>
            <p className="text-gray-600 mb-4">
              {activeLevel} স্তরে কোনো বিষয় পাওয়া যায়নি। অনুসন্ধান শর্ত পরিবর্তন করে আবার চেষ্টা করুন।
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedGroup('All');
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-colors font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
        {/* Stats */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {filteredSubjects.length}
              </div>
              <div className="text-sm text-gray-600">Current Results</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600 mb-1">
                {new Set(currentLevelSubjects.map(subject => subject.group)).size}
              </div>
              <div className="text-sm text-gray-600">Groups Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {currentLevelSubjects.length}
              </div>
              <div className="text-sm text-gray-600">Total {activeLevel} Subjects</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {subjects.length}
              </div>
              <div className="text-sm text-gray-600">All Subjects</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectsPage;