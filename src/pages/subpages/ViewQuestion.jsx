// src/pages/ViewQuestion.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink, useLocation } from 'react-router-dom'; // Added useLocation, NavLink
import axios from '../../config/axios.js';
import { HashLoader } from 'react-spinners';
import { ChevronDown, ChevronUp, Edit, Save, X, Trash2, GraduationCap, BookOpen, Target, Calendar, Building, Award } from 'lucide-react'; // Added icons
import LatexRenderer from './LatexRenderer.jsx';
import { toast } from 'react-toastify';
const ViewQuestion = () => {
  const { level, group, subjectId, questionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Added useLocation
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState({});
  const [allChapter, setAllChapter] = useState([])
  const [topics, setTopics] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState({
    _id: '',
    englishName: '',
    banglaName: '',
  });
  const [selectedChapter, setSelectedChapter] = useState({
    _id: '',
    englishName: '',
    banglaName: '',
    topics: []
  });
  const [selectedATopic, setSelectedATopic] = useState({
    _id: '',
    englishName: '',
    banglaName: '',
  })
  const [selectedBTopic, setSelectedBTopic] = useState({
    _id: '',
    englishName: '',
    banglaName: '',
  })
  const [selectedBSubTopic, setSelectedBSubTopic] = useState({
    _id: '',
    englishName: '',
    banglaName: '',
  })
  const [selectedCTopic, setSelectedCTopic] = useState({
    _id: '',
    englishName: '',
    banglaName: '',
  })
  const [selectedDTopic, setSelectedDTopic] = useState({
    _id: '',
    englishName: '',
    banglaName: '',
  })
  const [selectedCSubTopic, setSelectedCSubTopic] = useState({
    _id: '',
    englishName: '',
    banglaName: '',
  })
  const [selectedDSubTopic, setSelectedDSubTopic] = useState({
    _id: '',
    englishName: '',
    banglaName: '',
  })
  const [remainingTopicsForA, setRemainingTopicsForA] = useState([]);
  const [remainingTopicsForB, setRemainingTopicsForB] = useState([]);
  const [remainingSubTopicsForB, setRemainingSubTopicsForB] = useState([]);
  const [remainingTopicsForC, setRemainingTopicsForC] = useState([]);
  const [remainingTopicsForD, setRemainingTopicsForD] = useState([]);
  const [remainingSubTopicsForC, setRemainingSubTopicsForC] = useState([]);
  const [remainingSubTopicsForD, setRemainingSubTopicsForD] = useState([]);
  const [formData, setFormData] = useState({
    stem: '',
    level:'',
    a: '',
    b: '',
    c: '',
    d: '',
    aAnswer: '',
    bAnswer: '',
    cAnswer: '',
    dAnswer: '',
    stemImage: null,
    aAnswerImage: null,
    bAnswerImage: null,
    cAnswerImage: null,
    dAnswerImage: null,
    difficulty: '',
    year: '',
    board: '',
    version: '',
    aTopic: { topicId: '', englishName: '', banglaName: '' },
    bTopic: { topicId: '', englishName: '', banglaName: '' },
    bSubTopic: { topicId: '', englishName: '', banglaName: '' },
    cTopic: { topicId: '', englishName: '', banglaName: '' },
    dTopic: { topicId: '', englishName: '', banglaName: '' },
    cSubTopic: { topicId: '', englishName: '', banglaName: '' },
    dSubTopic: { topicId: '', englishName: '', banglaName: '' },
    subject: { _id: '', englishName: '', banglaName: '' },
    chapter: { chapterId: '', englishName: '', banglaName: '' },
  });

  // Helper function to get difficulty color classes
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'hard':
        return 'border-red-200 bg-red-50 text-red-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  // Helper function to get difficulty icon (simplified)
  const getDifficultyIcon = (difficulty) => {
    // You can add icons here if needed, e.g., using Lucide React icons
    return null; // Or return an icon component
  };
 const handleDelete = async () => { 
  try{
 const response = await axios.delete(`/qb/${questionId}`)
 if(response.data.success){
   toast("Question deleted successfully")
   navigate(-1)
 } else {
   toast("Failed to delete question")
 }
  }catch(error){
    console.log(error)
  }
 }
  // Fetch the question
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axios.get(`/qb/${questionId}`);
        if (response.data.success) {
          const q = response.data.data;
          console.log('Fetched questionA:', q);
          setQuestion(q);
          setQuestion((prev) => ({
            ...prev,
            aTopic: q.aTopic ? q.aTopic : { topicId: '', englishName: '', banglaName: '' },
            bTopic: q.bTopic ? q.bTopic : { topicId: '', englishName: '', banglaName: '' },
            bSubTopic: q.bSubTopic ? q.bSubTopic : { topicId: '', englishName: '', banglaName: '' },
            cSubTopic: q.cSubTopic ? q.cSubTopic : { topicId: '', englishName: '', banglaName: '' },
            dSubTopic: q.dSubTopic ? q.dSubTopic : { topicId: '', englishName: '', banglaName: '' },
          }))
          setSelectedATopic({
            _id: q.aTopic ? q.aTopic.topicId : '',
            englishName: q.aTopic ? q.aTopic.englishName : '',
            banglaName: q.aTopic ? q.aTopic.banglaName : ''
          });
          setSelectedBTopic({
            _id: q.bTopic ? q.bTopic.topicId : '',
            englishName: q.bTopic ? q.bTopic.englishName : '',
            banglaName: q.bTopic ? q.bTopic.banglaName : ''
          });
          setSelectedBSubTopic({
            _id: q.bSubTopic ? q.bSubTopic.topicId : '',
            englishName: q.bSubTopic ? q.bSubTopic.englishName : '',
            banglaName: q.bSubTopic ? q.bSubTopic.banglaName : ''
          });
          setSelectedSubject(q.subject || { _id: '', englishName: '', banglaName: '' });
          setSelectedChapter({
            _id: q.chapter ? q.chapter.chapterId : '',
            englishName: q.chapter ? q.chapter.englishName : '',
            banglaName: q.chapter ? q.chapter.banglaName : ''
          });
          setSelectedCTopic({
            _id: q.cTopic ? q.cTopic.topicId : '',
            englishName: q.cTopic ? q.cTopic.englishName : '',
            banglaName: q.cTopic ? q.cTopic.banglaName : ''
          });
          setSelectedDTopic({
            _id: q.dTopic ? q.dTopic.topicId : '',
            englishName: q.dTopic ? q.dTopic.englishName : '',
            banglaName: q.dTopic ? q.dTopic.banglaName : ''
          });
          setSelectedCSubTopic({
            _id: q.cSubTopic ? q.cSubTopic.topicId : '',
            englishName: q.cSubTopic ? q.cSubTopic.englishName : '',
            banglaName: q.cSubTopic ? q.cSubTopic.banglaName : ''
          });
          setSelectedDSubTopic({
            _id: q.dSubTopic ? q.dSubTopic.topicId : '',
            englishName: q.dSubTopic ? q.dSubTopic.englishName : '',
            banglaName: q.dSubTopic ? q.dSubTopic.banglaName : ''
          });
          setFormData((prev) => ({
            ...prev,
            stem: q.stem || '',
            level: q.level || '',
            a: q.a || '',
            b: q.b || '',
            c: q.c || '',
            d: q.d || '',
            aAnswer: q.aAnswer || '',
            bAnswer: q.bAnswer || '',
            cAnswer: q.cAnswer || '',
            dAnswer: q.dAnswer || '',
            stemImage: q.stemImage || null,
            cAnswerImage: q.cAnswerImage || null,
            dAnswerImage: q.dAnswerImage || null,
            difficulty: q.difficulty || '',
            year: q.year || '',
            board: q.board || '',
            version: q.version || '',
            aTopic: q.aTopic || { topicId: '', englishName: '', banglaName: '' },
            bTopic: q.bTopic || { topicId: '', englishName: '', banglaName: '' },
            cTopic: q.cTopic || { topicId: '', englishName: '', banglaName: '' },
            dTopic: q.dTopic || { topicId: '', englishName: '', banglaName: '' },
            cSubTopic: q.cSubTopic || { topicId: '', englishName: '', banglaName: '' },
            dSubTopic: q.dSubTopic || { topicId: '', englishName: '', banglaName: '' },
            subject: q.subject || { _id: '', englishName: '', banglaName: '' },
            chapter: q.chapter || { chapterId: '', englishName: '', banglaName: '' },
          }));
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error('Error fetching question:', err);
        setError('Failed to load question.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [questionId]);

  // Fetch subjects based on group and level
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(`/subject/filter?group=${question?.group}&level=${question?.level}`);
        if (response.data.success) {
          const subjects = response.data.data;
          console.log('Fetched subjects:', subjects);
          setAllSubjects(subjects);
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
      }
    };
    if (question?.group && question?.level) {
      fetchSubjects();
    }
  }, [question?.group, question?.level]);

  useEffect(() => {
    if (selectedSubject && allSubjects.length > 0 && selectedChapter) {
      console.log(selectedChapter, selectedSubject, allSubjects, selectedATopic, selectedBTopic, selectedBSubTopic, selectedCTopic, selectedDTopic, selectedCSubTopic, selectedDSubTopic)
      const currentSelectedSubjectData = allSubjects.find(subject => subject._id === selectedSubject._id);
      const currentSelectedChapterData = currentSelectedSubjectData?.chapters.find((chapter, index) => chapter._id === selectedChapter._id);
      console.log(currentSelectedChapterData)
      const selectedChapterTopics = currentSelectedChapterData?.topics;
      setTopics(selectedChapterTopics)

      if (selectedATopic) {
        const topicsExceptSelectedATopic = currentSelectedChapterData?.topics.filter(topic => topic?._id !== selectedATopic?._id);
        setRemainingTopicsForA(topicsExceptSelectedATopic)
      }
      if (selectedBTopic) {
        const topicsExceptSelectedBTopic = currentSelectedChapterData?.topics.filter(topic => topic?._id !== selectedBTopic?._id && topic?._id !== selectedBSubTopic?._id);
        if (selectedBSubTopic) {
          const topicsExceptSelectedBSubTopic = currentSelectedChapterData?.topics.filter(topic => topic?._id !== selectedBSubTopic?._id && topic?._id !== selectedBTopic?._id);
          setRemainingSubTopicsForB(topicsExceptSelectedBSubTopic)
        }
        setRemainingTopicsForB(topicsExceptSelectedBTopic)
      }
      if (selectedCTopic && selectedCSubTopic) {
        console.log(selectedCTopic, selectedCSubTopic)
        const topicsExceptSelectedCTopic = currentSelectedChapterData?.topics.filter(topic => topic?._id !== selectedCTopic?._id && topic?._id !== selectedCSubTopic?._id);
        const topicsExceptSelectedCSubTopic = currentSelectedChapterData?.topics.filter(topic => topic?._id !== selectedCSubTopic?._id && topic?._id !== selectedCTopic?._id);
        setRemainingTopicsForC(topicsExceptSelectedCTopic)
        setRemainingSubTopicsForC(topicsExceptSelectedCSubTopic)
      }
      if (selectedDTopic) {
        const topicsExceptSelectedDTopic = currentSelectedChapterData?.topics.filter(topic => topic?._id !== selectedDTopic?._id && topic?._id !== selectedDSubTopic?._id);
        setRemainingTopicsForD(topicsExceptSelectedDTopic)
        if (selectedDSubTopic) {
          const topicsExceptSelectedDSubTopic = currentSelectedChapterData?.topics.filter(topic => topic?._id !== selectedDSubTopic?._id && topic?._id !== selectedDTopic?._id);
          setRemainingSubTopicsForD(topicsExceptSelectedDSubTopic)
        }
      }
    }
  }, [formData, selectedSubject, allSubjects, selectedChapter, selectedCTopic, selectedDTopic, selectedCSubTopic, selectedDSubTopic, selectedATopic, selectedBTopic, selectedBSubTopic])

  useEffect(() => {
    console.log("updated formdata", formData)
  }, [formData])

  // Toggle answer visibility
  const toggleAnswer = (part) => {
    setExpandedAnswers((prev) => ({
      ...prev,
      [part]: !prev[part],
    }));
  };

  const isAnswerExpanded = (part) => expandedAnswers[part];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image uploads
  const handleImageUpload = async (field, file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await axios.post(`/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        setFormData((prev) => ({
          ...prev,
          [field]: response.data.url,
        }));
      } else {
        alert('Failed to upload image.');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Error uploading image.');
    }
  };

  // Handle image deletion
  const handleImageDelete = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: null,
    }));
  };

  // Save edited question
  const handleSave = async () => {
    try {
      const formDataToSend = new FormData();
      let hasChanges = false; // Flag to check if there are changes

      if (isModified(question.a, formData.a)) {
        formDataToSend.append('a', formData.a);
        hasChanges = true;
      }
      if (isModified(question.b, formData.b)) {
        formDataToSend.append('b', formData.b);
        hasChanges = true;
      }
      if (isModified(question.c, formData.c)) {
        formDataToSend.append('c', formData.c);
        hasChanges = true;
      }
      if (isModified(question.d, formData.d)) {
        formDataToSend.append('d', formData.d);
        hasChanges = true;
      }
      if (isModified(question.aTopic, formData.aTopic)) {
        formDataToSend.append('aTopic', JSON.stringify(formData.aTopic));
        hasChanges = true;
      }
      if (isModified(question.bTopic, formData.bTopic)) {
        formDataToSend.append('bTopic', JSON.stringify(formData.bTopic));
        hasChanges = true;
      }
      if (isModified(question.bSubTopic, formData.bSubTopic)) {
        formDataToSend.append('bSubTopic', JSON.stringify(formData.bSubTopic));
        hasChanges = true;
      }
      if (isModified(question.cTopic, formData.cTopic)) {
        console.log("is it is true", true)
        console.log(formData.cTopic)
        formDataToSend.append('cTopic', JSON.stringify(formData.cTopic));
        hasChanges = true;
        console.log(formDataToSend)
      }
      if (isModified(question.cSubTopic, formData.cSubTopic)) {
        formDataToSend.append('cSubTopic', JSON.stringify(formData.cSubTopic));
        hasChanges = true;
      }
      if (isModified(question.dTopic, formData.dTopic)) {
        formDataToSend.append('dTopic', JSON.stringify(formData.dTopic));
        hasChanges = true;
      }
      // Add other fields that might change (metadata)
      if (isModified(question.stem, formData.stem)) {
        formDataToSend.append('stem', formData.stem);
        hasChanges = true;
      }
      if (isModified(question.stemImage, formData.stemImage)) {
        formDataToSend.append('stemImage', formData.stemImage || ''); // Send empty string if deleted
        hasChanges = true;
      }
      if (isModified(question.aAnswer, formData.aAnswer)) {
        formDataToSend.append('aAnswer', formData.aAnswer);
        hasChanges = true;
      }
      if (isModified(question.bAnswer, formData.bAnswer)) {
        formDataToSend.append('bAnswer', formData.bAnswer);
        hasChanges = true;
      }
      if (isModified(question.cAnswer, formData.cAnswer)) {
        formDataToSend.append('cAnswer', formData.cAnswer);
        hasChanges = true;
      }
      if (isModified(question.dAnswer, formData.dAnswer)) {
        formDataToSend.append('dAnswer', formData.dAnswer);
        hasChanges = true;
      }
      if (isModified(question.cAnswerImage, formData.cAnswerImage)) {
        formDataToSend.append('cAnswerImage', formData.cAnswerImage || '');
        hasChanges = true;
      }
      if (isModified(question.dAnswerImage, formData.dAnswerImage)) {
        formDataToSend.append('dAnswerImage', formData.dAnswerImage || '');
        hasChanges = true;
      }
      if (isModified(question.difficulty, formData.difficulty)) {
        formDataToSend.append('difficulty', formData.difficulty);
        hasChanges = true;
      }
      if (isModified(question.year, formData.year)) {
        formDataToSend.append('year', formData.year);
        hasChanges = true;
      }
      if (isModified(question.board, formData.board)) {
        formDataToSend.append('board', formData.board);
        hasChanges = true;
      }
      if (isModified(question.version, formData.version)) {
        formDataToSend.append('version', formData.version);
        hasChanges = true;
      }
      // Subject and Chapter changes
      if (isModified(question.subject?._id, formData.subject._id)) {
        formDataToSend.append('subject._id', formData.subject._id);
        hasChanges = true;
      }
      if (isModified(question.chapter?.chapterId, formData.chapter.chapterId)) {
        formDataToSend.append('chapter.chapterId', formData.chapter.chapterId);
        hasChanges = true;
      }


      // Log changes if any
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      // If no changes, don't make the API call
      if (!hasChanges) {
        console.log("No changes detected, not saving.");
        setIsEditing(false);
        return;
      }

      const response = await axios.put(`/qb/${questionId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      if (response.data.success) {
        console.log('Successfully updated question:', response.data.data);
        // Update the question state with the new data
        setQuestion(prevQuestion => ({ ...prevQuestion, ...response.data.data }));
        setIsEditing(false);
      } else {
        alert('Failed to update: ' + response.data.message);
      }
    } catch (err) {
      console.error('Error updating question:', err);
      alert('Error saving question.');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/10 backdrop-blur-md z-50">
        <HashLoader color="#36d7b7" />
      </div>
    );
  }

  const handleTopicChange = (value, field) => {
    const selectedTopicData = topics.find(topic => topic._id === value);
    if (field === 'aTopic') {
      setSelectedATopic(selectedTopicData)
    }
    if (field === 'bTopic') {
      setSelectedBTopic(selectedTopicData)
    }
    if (field === 'bSubTopic') {
      setSelectedBSubTopic(selectedTopicData)
    }
    if (field === 'cTopic') {
      setSelectedCTopic(selectedTopicData)
    }
    if (field === 'cSubTopic') {
      setSelectedCSubTopic(selectedTopicData)
    }
    if (field === 'dTopic') {
      setSelectedDTopic(selectedTopicData)
    }
    if (field === 'dSubTopic') {
      setSelectedDSubTopic(selectedTopicData)
    }
    console.log(selectedTopicData)
    setFormData(prev => ({ ...prev, [field]: { topicId: value, englishName: selectedTopicData?.englishName || '', banglaName: selectedTopicData?.banglaName || '' } }));
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="p-6 bg-white rounded-lg shadow text-center">
          <X className="mx-auto text-red-500 mb-2" size={32} />
          <h3 className="text-lg font-medium text-red-900">Error</h3>
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Question not found.</p>
      </div>
    );
  }

  const isModified = (initialValue, currentValue) => {
    if (typeof (initialValue) === 'object' && typeof (currentValue) === 'object') {
      return JSON.stringify(initialValue) !== JSON.stringify(currentValue)
    } else {
      return initialValue !== currentValue
    }
  }

  // Main return block with simplified structure
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" style={{ fontFamily: '"Noto Sans Bengali", "Inter", sans-serif' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">Question Details</h1>
          <div className="flex gap-2">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition">
                <Edit size={14} /> Edit
              </button>
            ) : (
              <>
                <button onClick={handleSave} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition">
                  <Save size={14} /> Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      stem: question.stem || '',
                      a: question.a || '',
                      b: question.b || '',
                      c: question.c || '',
                      d: question.d || '',
                      aAnswer: question.aAnswer || '',
                      bAnswer: question.bAnswer || '',
                      cAnswer: question.cAnswer || '',
                      dAnswer: question.dAnswer || '',
                      stemImage: question.stemImage || null,
                      aAnswerImage: question.aAnswerImage || null,
                      bAnswerImage: question.bAnswerImage || null,
                      cAnswerImage: question.cAnswerImage || null,
                      dAnswerImage: question.dAnswerImage || null,
                      difficulty: question.difficulty || '',
                      year: question.year || '',
                      board: question.board || '',
                      version: question.version || '',
                      aTopic: question.aTopic || { topicId: '', englishName: '', banglaName: '' },
                      bTopic: question.bTopic || { topicId: '', englishName: '', banglaName: '' },
                      bSubTopic: question.bSubTopic || { topicId: '', englishName: '', banglaName: '' },
                      cTopic: question.cTopic || { topicId: '', englishName: '', banglaName: '' },
                      dTopic: question.dTopic || { topicId: '', englishName: '', banglaName: '' },
                      cSubTopic: question.cSubTopic || { topicId: '', englishName: '', banglaName: '' },
                      dSubTopic: question.dSubTopic || { topicId: '', englishName: '', banglaName: '' },
                      subject: question.subject || { _id: '', englishName: '', banglaName: '' },
                      chapter: question.chapter || { chapterId: '', englishName: '', banglaName: '' },
                    });
                  }}
                  className="flex items-center gap-1 bg-gray-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Question Container - Mimicking the design */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {/* Question Header - Mimicking the design */}
          <div className="p-3 sm:p-4 border-b border-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Tags and Action Buttons - Mimicking the design */}
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
                  {/* Action Buttons - Only shown in view mode */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    
                      <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Question Stem - Mimicking the design */}
                <div className="text-sm sm:text-base font-medium text-gray-900 mb-3 leading-relaxed">
                  {isEditing ? (
                    <div>
                      <div className="mb-2">
                        <strong>Preview:</strong>
                        <LatexRenderer latex={formData.stem} />
                      </div>
                      <textarea
                        name="stem"
                        value={formData.stem}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-200 rounded-lg resize-none text-sm focus:ring-1 focus:ring-blue-500 mb-4"
                        rows="4"
                        placeholder="Enter question stem..."
                      />
                    </div>
                  ) : (
                    <>
                      <LatexRenderer latex={question.stem} />
                      {
                        question?.stemImage &&
                        (<div className="flex justify-center"> <img src={question.stemImage} alt="Question Stem" className="mt-4 rounded-lg " /> </div>)
                      }
                    </>
                  )}
                </div>

                {/* Stem Image Upload - Mimicking the design */}
                {isEditing && (
                  <div className="mt-4">
                    <label htmlFor="stemImage" className="block text-sm font-medium text-gray-700">
                      Stem Image
                    </label>
                    <div className="mt-1 flex items-center">
                      <span className="inline-block h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                        {formData.stemImage && (
                          <img src={formData.stemImage} alt="Current Stem Image" className="h-full w-full object-cover" />
                        )}
                      </span>
                      <button
                        type="button"
                        className="ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={() => document.getElementById('stemImageInput').click()}
                      >
                        Change
                      </button>
                      <input
                        id="stemImageInput"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleImageUpload('stemImage', e.target.files[0])}
                      />
                      {formData.stemImage && (
                        <button
                          type="button"
                          className="ml-2 rounded-md border border-red-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          onClick={() => handleImageDelete('stemImage')}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Question Parts - Mimicking the design */}
                <div className="space-y-2">
                  {/* Part A */}
                  {question.a && (
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px] font-medium min-w-[20px] text-center flex-shrink-0">a</span>
                        {isEditing ? (
                          <textarea
                            name="a"
                            value={formData.a}
                            onChange={handleChange}
                            className="flex-1 p-2 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500"
                            rows="2"
                            placeholder="Enter option a..."
                          />
                        ) : (
                          <p className="text-gray-700 flex-1 text-xs sm:text-sm"> <LatexRenderer latex={question.a} />  </p>
                        )}
                        <button
                          onClick={() => toggleAnswer('a')}
                          className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200 flex-shrink-0"
                        >
                          {isAnswerExpanded('a') ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                      {/* Topic Selector for A - Only in edit mode */}
                      {isEditing && selectedATopic && (
                        <div className="ml-7 mt-1">
                          <select name="" value={selectedATopic?._id} onChange={(e) => handleTopicChange(e.target.value, `aTopic`)} className="text-xs p-1 border rounded">
                            {selectedATopic._id ? <option value={selectedATopic?._id}>{question?.version === 'English' ? selectedATopic?.englishName : selectedATopic?.banglaName}</option> : <option value="">Select Topic</option>}
                            {
                              remainingTopicsForA?.map((topic, index) => {
                                return <option key={index} value={topic?._id}>{question?.version === 'English' ? topic?.englishName : topic?.banglaName}</option>
                              })
                            }
                          </select>
                        </div>
                      )}
                      {isAnswerExpanded('a') && (question.aAnswer || isEditing) && (
                        <div className="ml-7 p-2 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-[10px] text-green-600 font-medium mb-0.5">Answer:</div>
                          {isEditing ? (
                            <textarea
                              name="aAnswer"
                              value={formData.aAnswer}
                              onChange={handleChange}
                              className="w-full p-1 border border-green-300 rounded text-xs focus:ring-1 focus:ring-green-500"
                              rows="2"
                              placeholder="Enter answer for a..."
                            />
                          ) : (
                            <div className="text-xs text-green-800 whitespace-pre-line"><LatexRenderer latex={question.aAnswer} /></div>
                          )}
                          {/* Answer Image Upload for A - Only in edit mode */}
                          {isEditing && (
                            <div className="mt-2">
                              <label htmlFor="aAnswerImageInput" className="block text-xs font-medium text-gray-700">
                                Answer Image
                              </label>
                              <div className="mt-1 flex items-center">
                                <span className="inline-block h-8 w-8 overflow-hidden rounded bg-gray-100">
                                  {formData.aAnswerImage && (
                                    <img src={formData.aAnswerImage} alt="Current Answer Image A" className="h-full w-full object-cover" />
                                  )}
                                </span>
                                <button
                                  type="button"
                                  className="ml-2 rounded border border-gray-300 bg-white py-1 px-2 text-xs font-medium leading-3 text-gray-700 shadow-sm hover:bg-gray-50"
                                  onClick={() => document.getElementById('aAnswerImageInput').click()}
                                >
                                  Change
                                </button>
                                <input
                                  id="aAnswerImageInput"
                                  type="file"
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                  onChange={(e) => handleImageUpload('aAnswerImage', e.target.files[0])}
                                />
                                {formData.aAnswerImage && (
                                  <button
                                    type="button"
                                    className="ml-1 rounded border border-red-300 bg-white py-1 px-2 text-xs font-medium leading-3 text-red-700 shadow-sm hover:bg-red-50"
                                    onClick={() => handleImageDelete('aAnswerImage')}
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Part B */}
                  {question.b && (
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px] font-medium min-w-[20px] text-center flex-shrink-0">b</span>
                        {isEditing ? (
                          <>
                            <textarea
                            name="b"
                            value={formData.b}
                            onChange={handleChange}
                            className="flex-1 p-2 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500"
                            rows="2"
                            placeholder="Enter option b..."
                          />
                          </>
                        
                        ) : (
                          <p className="text-gray-700 flex-1 text-xs sm:text-sm"> <LatexRenderer latex={question.b} /> </p>
                        )}
                        <button
                          onClick={() => toggleAnswer('b')}
                          className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200 flex-shrink-0"
                        >
                          {isAnswerExpanded('b') ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                      {/* Topic Selector for B - Only in edit mode */}
                      {isEditing && selectedBTopic && (
                        <div className="ml-7 mt-1 flex flex-col gap-1">
                          <select name="" value={selectedBTopic?._id} onChange={(e) => handleTopicChange(e.target.value, `bTopic`)} className="text-xs p-1 border rounded">
                            {selectedBTopic._id ? <option value={selectedBTopic?._id}>{question?.version === 'English' ? selectedBTopic?.englishName : selectedBTopic?.banglaName}</option> : <option value="">Select Topic</option>}
                            {
                              remainingTopicsForB?.map((topic, index) => {
                                return <option key={index} value={topic?._id}>{question?.version === 'English' ? topic?.englishName : topic?.banglaName}</option>
                              })
                            }
                          </select>
                          {selectedBTopic._id && (
                            <select name="" value={selectedBSubTopic?._id} onChange={(e) => handleTopicChange(e.target.value, `bSubTopic`)} className="text-xs p-1 border rounded">
                              {selectedBSubTopic._id ? <option value={selectedBSubTopic?._id}>{question?.version === 'English' ? selectedBSubTopic?.englishName : selectedBSubTopic?.banglaName}</option> : <option value="">Select Sub Topic</option>}
                              {
                                remainingSubTopicsForB?.map((topic, index) => {
                                  return <option key={index} value={topic?._id}>{question?.version === 'English' ? topic?.englishName : topic?.banglaName}</option>
                                })
                              }
                            </select>
                          )}
                        </div>
                      )}
                      {isAnswerExpanded('b') && (question.bAnswer || isEditing) && (
                        <div className="ml-7 p-2 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-[10px] text-green-600 font-medium mb-0.5">Answer:</div>
                          {isEditing ? (
                            <textarea
                              name="bAnswer"
                              value={formData.bAnswer}
                              onChange={handleChange}
                              className="w-full p-1 border border-green-300 rounded text-xs focus:ring-1 focus:ring-green-500"
                              rows="2"
                              placeholder="Enter answer for b..."
                            />
                          ) : (
                            <div className="text-xs text-green-800 whitespace-pre-line"><LatexRenderer latex={question.bAnswer} /></div>
                          )}
                          {/* Answer Image Upload for B - Only in edit mode */}
                          {isEditing && (
                            <div className="mt-2">
                              <label htmlFor="bAnswerImageInput" className="block text-xs font-medium text-gray-700">
                                Answer Image
                              </label>
                              <div className="mt-1 flex items-center">
                                <span className="inline-block h-8 w-8 overflow-hidden rounded bg-gray-100">
                                  {formData.bAnswerImage && (
                                    <img src={formData.bAnswerImage} alt="Current Answer Image B" className="h-full w-full object-cover" />
                                  )}
                                </span>
                                <button
                                  type="button"
                                  className="ml-2 rounded border border-gray-300 bg-white py-1 px-2 text-xs font-medium leading-3 text-gray-700 shadow-sm hover:bg-gray-50"
                                  onClick={() => document.getElementById('bAnswerImageInput').click()}
                                >
                                  Change
                                </button>
                                <input
                                  id="bAnswerImageInput"
                                  type="file"
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                  onChange={(e) => handleImageUpload('bAnswerImage', e.target.files[0])}
                                />
                                {formData.bAnswerImage && (
                                  <button
                                    type="button"
                                    className="ml-1 rounded border border-red-300 bg-white py-1 px-2 text-xs font-medium leading-3 text-red-700 shadow-sm hover:bg-red-50"
                                    onClick={() => handleImageDelete('bAnswerImage')}
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Part C */}
                  {question.c && (
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px] font-medium min-w-[20px] text-center flex-shrink-0">c</span>
                        {isEditing ? (
                          <textarea
                            name="c"
                            value={formData.c}
                            onChange={handleChange}
                            className="flex-1 p-2 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500"
                            rows="2"
                            placeholder="Enter option c..."
                          />
                        ) : (
                          <p className="text-gray-700 flex-1 text-xs sm:text-sm"> <LatexRenderer latex={question.c} /> </p>
                        )}
                        <button
                          onClick={() => toggleAnswer('c')}
                          className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200 flex-shrink-0"
                        >
                          {isAnswerExpanded('c') ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                      {/* Topic Selector for C - Only in edit mode */}
                      {isEditing && (
                        <div className="ml-7 mt-1 flex flex-col gap-1">
                          <select name="" value={selectedCTopic?._id} onChange={(e) => handleTopicChange(e.target.value, `cTopic`)} className="text-xs p-1 border rounded">
                            {selectedCTopic._id ? <option value={selectedCTopic?._id}>{question?.version === 'English' ? selectedCTopic?.englishName : selectedCTopic?.banglaName}</option> : <option value="">Select Topic</option>}
                            {
                              remainingTopicsForC?.map((topic, index) => {
                                return <option key={index} value={topic?._id}>{question?.version === 'English' ? topic?.englishName : topic?.banglaName}</option>
                              })
                            }
                          </select>
                          <select name="" value={selectedCSubTopic?._id} onChange={(e) => handleTopicChange(e.target.value, `cSubTopic`)} className="text-xs p-1 border rounded">
                            {selectedCSubTopic._id ? <option value={selectedCSubTopic?._id}>{question?.version === 'English' ? selectedCSubTopic?.englishName : selectedCSubTopic?.banglaName}</option> : <option value="">Select Sub Topic</option>}
                            {
                              remainingSubTopicsForC?.map((topic, index) => {
                                return <option key={index} value={topic?._id}>{question?.version === 'English' ? topic?.englishName : topic?.banglaName}</option>
                              })
                            }
                          </select>
                        </div>
                      )}
                      {isAnswerExpanded('c') && (question.cAnswer || isEditing) && (
                        <div className="ml-7 p-2 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-[10px] text-green-600 font-medium mb-0.5">Answer:</div>
                          {isEditing ? (
                            <textarea
                              name="cAnswer"
                              value={formData.cAnswer}
                              onChange={handleChange}
                              className="w-full p-1 border border-green-300 rounded text-xs focus:ring-1 focus:ring-green-500"
                              rows="2"
                              placeholder="Enter answer for c..."
                            />
                          ) : (
                            <div className="text-xs text-green-800 whitespace-pre-line"><LatexRenderer latex={question.cAnswer} /></div>
                          )}
                          {question?.cAnswerImage &&
                            (<div className="flex justify-center"> <img src={question.cAnswerImage} alt="Answer Image" className="mt-4 rounded-lg " /> </div>)
                          }
                          {/* Answer Image Upload for C - Only in edit mode */}
                          {isEditing && (
                            <div className="mt-2">
                              <label htmlFor="cAnswerImageInput" className="block text-xs font-medium text-gray-700">
                                Answer Image
                              </label>
                              <div className="mt-1 flex items-center">
                                <span className="inline-block h-8 w-8 overflow-hidden rounded bg-gray-100">
                                  {formData.cAnswerImage && (
                                    <img src={formData.cAnswerImage} alt="Current Answer Image C" className="h-full w-full object-cover" />
                                  )}
                                </span>
                                <button
                                  type="button"
                                  className="ml-2 rounded border border-gray-300 bg-white py-1 px-2 text-xs font-medium leading-3 text-gray-700 shadow-sm hover:bg-gray-50"
                                  onClick={() => document.getElementById('cAnswerImageInput').click()}
                                >
                                  Change
                                </button>
                                <input
                                  id="cAnswerImageInput"
                                  type="file"
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                  onChange={(e) => handleImageUpload('cAnswerImage', e.target.files[0])}
                                />
                                {formData.cAnswerImage && (
                                  <button
                                    type="button"
                                    className="ml-1 rounded border border-red-300 bg-white py-1 px-2 text-xs font-medium leading-3 text-red-700 shadow-sm hover:bg-red-50"
                                    onClick={() => handleImageDelete('cAnswerImage')}
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Part D */}
                  {question.d && (
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px] font-medium min-w-[20px] text-center flex-shrink-0">d</span>
                        {isEditing ? (
                          <textarea
                            name="d"
                            value={formData.d}
                            onChange={handleChange}
                            className="flex-1 p-2 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500"
                            rows="2"
                            placeholder="Enter option d..."
                          />
                        ) : (
                          <p className="text-gray-700 flex-1 text-xs sm:text-sm"><LatexRenderer latex={question.d} /> </p>
                        )}
                        <button
                          onClick={() => toggleAnswer('d')}
                          className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200 flex-shrink-0"
                        >
                          {isAnswerExpanded('d') ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                      {/* Topic Selector for D - Only in edit mode */}
                      {isEditing && (
                        <div className="ml-7 mt-1 flex flex-col gap-1">
                          <select name="" value={selectedDTopic?._id} onChange={(e) => handleTopicChange(e.target.value, `dTopic`)} className="text-xs p-1 border rounded">
                            {selectedDTopic._id ? <option value={selectedDTopic?._id}>{question?.version === 'English' ? selectedDTopic?.englishName : selectedDTopic?.banglaName}</option> : <option value="">Select Topic</option>}
                            {
                              remainingTopicsForD?.map((topic, index) => {
                                return <option key={index} value={topic?._id}>{question?.version === 'English' ? topic?.englishName : topic?.banglaName}</option>
                              })
                            }
                          </select>
                          <select name="" value={selectedDSubTopic?._id} onChange={(e) => handleTopicChange(e.target.value, `dSubTopic`)} className="text-xs p-1 border rounded">
                            {selectedDSubTopic._id ? <option value={selectedDSubTopic?._id}>{question?.version === 'English' ? selectedDSubTopic?.englishName : selectedDSubTopic?.banglaName}</option> : <option value="">Select Sub Topic</option>}
                            {
                              remainingSubTopicsForD?.map((topic, index) => {
                                return <option key={index} value={topic?._id}>{question?.version === 'English' ? topic?.englishName : topic?.banglaName}</option>
                              })
                            }
                          </select>
                        </div>
                      )}
                      {isAnswerExpanded('d') && (question.dAnswer || isEditing) && (
                        <div className="ml-7 p-2 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-[10px] text-green-600 font-medium mb-0.5">Answer:</div>
                          {isEditing ? (
                            <textarea
                              name="dAnswer"
                              value={formData.dAnswer}
                              onChange={handleChange}
                              className="w-full p-1 border border-green-300 rounded text-xs focus:ring-1 focus:ring-green-500"
                              rows="2"
                              placeholder="Enter answer for d..."
                            />
                          ) : (
                            <div className="text-xs text-green-800 whitespace-pre-line"><LatexRenderer latex={question.dAnswer} /> </div>
                          )}
                          {question?.dAnswerImage &&
                            (<div className="flex justify-center"> <img src={question.dAnswerImage} alt="Answer Image" className="mt-4 rounded-lg " /> </div>)
                          }
                          {/* Answer Image Upload for D - Only in edit mode */}
                          {isEditing && (
                            <div className="mt-2">
                              <label htmlFor="dAnswerImageInput" className="block text-xs font-medium text-gray-700">
                                Answer Image
                              </label>
                              <div className="mt-1 flex items-center">
                                <span className="inline-block h-8 w-8 overflow-hidden rounded bg-gray-100">
                                  {formData.dAnswerImage && (
                                    <img src={formData.dAnswerImage} alt="Current Answer Image D" className="h-full w-full object-cover" />
                                  )}
                                </span>
                                <button
                                  type="button"
                                  className="ml-2 rounded border border-gray-300 bg-white py-1 px-2 text-xs font-medium leading-3 text-gray-700 shadow-sm hover:bg-gray-50"
                                  onClick={() => document.getElementById('dAnswerImageInput').click()}
                                >
                                  Change
                                </button>
                                <input
                                  id="dAnswerImageInput"
                                  type="file"
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                  onChange={(e) => handleImageUpload('dAnswerImage', e.target.files[0])}
                                />
                                {formData.dAnswerImage && (
                                  <button
                                    type="button"
                                    className="ml-1 rounded border border-red-300 bg-white py-1 px-2 text-xs font-medium leading-3 text-red-700 shadow-sm hover:bg-red-50"
                                    onClick={() => handleImageDelete('dAnswerImage')}
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
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

          {/* Question Metadata - Mimicking the design */}
          <div className="p-3 sm:p-4 bg-gray-50/50">
            <div className="grid lg:grid-cols-4 sm:grid-cols-2  gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="text-purple-600 flex-shrink-0" size={14} />
                <div className="min-w-0">
                  <div className="text-gray-500 text-[10px]">Level</div>
                  <div className="font-medium text-gray-900 truncate">
                    {isEditing ? (
                      <select
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        disabled={true}
                        className="w-full p-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-gray-100"
                      >
                        <option value={formData.level}>{formData.level}</option>
                       
                      </select>
                    ) : (
                      question.level
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="text-blue-600 flex-shrink-0" size={14} />
                <div className="min-w-0">
                  <div className="text-gray-500 text-[10px]">Subject</div>
                  <div className="font-medium text-gray-900 truncate text-xs">
                    {isEditing ? (
                      <select
                        name="subject._id"
                        value={formData.subject._id}
                        // onChange={handleChange}
                        disabled={true}
                        className="w-full p-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500"
                      >
                        {allSubjects.map((subject) => (
                          <option key={subject._id} value={subject._id}>
                            {question.version === 'English' ? subject.englishName : subject.banglaName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      question.subject?.englishName
                    )}
                  </div>
                </div>
              </div>
          
              <div className="flex items-center gap-1.5">
                <Calendar className="text-orange-600 flex-shrink-0" size={14} />
                <div className="min-w-0">
                  <div className="text-gray-500 text-[10px]">Year</div>
                  <div className="font-medium text-gray-900">
                    {isEditing ? (
                      <input
                        type="number"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full p-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      question.year
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Building className="text-indigo-600 flex-shrink-0" size={14} />
                <div className="min-w-0">
                  <div className="text-gray-500 text-[10px]">Board</div>
                  <div className="font-medium text-gray-900 truncate">
                    {isEditing ? (
                      <select
                        name="board"
                        value={formData.board}
                        onChange={handleChange}
                        className="w-full p-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Dhaka">Dhaka</option>
                        <option value="Rajshahi">Rajshahi</option>
                        <option value="Chittagong">Chittagong</option>
                        <option value="Sylhet">Sylhet</option>
                        <option value="Comilla">Comilla</option>
                        <option value="Jessore">Jessore</option>
                        <option value="Dinajpur">Dinajpur</option>
                        <option value="Mymensingh">Mymensingh</option>
                        <option value="Madrasah">Madrasah</option>
                        <option value="Barishal">Barishal</option>
                      </select>
                    ) : (
                      question.board
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="text-red-600 flex-shrink-0" size={14} />
                <div className="min-w-0">
                  <div className="text-gray-500 text-[10px]">Chapter</div>
                  <div className="font-medium text-gray-900 truncate text-xs">
                    {isEditing ? (
                      <select
                        name="chapter.chapterId" // This name is duplicated, but the value is bound to formData.chapter.chapterId
                        value={formData.chapter.chapterId}
                        onChange={handleChange}
                        disabled={true}
                        className="w-full p-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500"
                      >
                        {allSubjects
                          .find(s => s._id === formData.subject._id)
                          ?.chapters.map((chapter) => (
                            <option key={chapter._id} value={chapter._id}>
                              {question.version === 'English' ? chapter.englishName : chapter.banglaName}
                            </option>
                          ))}
                      </select>
                    ) : (
                      question.chapter?.englishName
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 text-[10px]">Version:</span>
                <span className="font-medium">
                  {isEditing ? (
                    <select
                      name="version"
                      value={formData.version}
                      onChange={handleChange}
                      disabled={true}
                      className="w-full p-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Bangla">Bangla</option>
                      <option value="English">English</option>
                    </select>
                  ) : (
                    question.version
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 text-[10px]">Difficulty:</span>
                <span className="font-medium">
                  {isEditing ? (
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                      className="w-full p-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  ) : (
                    question.difficulty
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewQuestion;