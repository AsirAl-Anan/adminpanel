// src/pages/ViewQuestion.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../config/axios.js';
import { HashLoader } from 'react-spinners';
import { ChevronDown, ChevronUp, Edit, Save, X, Trash2, GraduationCap, BookOpen, Target, Calendar, Building, Award, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import LatexRenderer from './LatexRenderer.jsx';
import { toast } from 'react-toastify';

// Helper Component: Accordion for Sub-questions (No changes needed here)
const AccordionItem = ({ part, title, children, isEditing }) => {
  const [isOpen, setIsOpen] = useState(isEditing);

  useEffect(() => {
    setIsOpen(isEditing);
  }, [isEditing]);

  const partColors = {
    a: 'bg-blue-100 text-blue-800',
    b: 'bg-indigo-100 text-indigo-800',
    c: 'bg-purple-100 text-purple-800',
    d: 'bg-pink-100 text-pink-800',
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 text-left bg-slate-50 hover:bg-slate-100 transition"
      >
        <div className="flex items-center gap-3">
          <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold ${partColors[part]}`}>
            {part.toUpperCase()}
          </span>
          <span className="font-medium text-slate-800 text-sm flex-1"><LatexRenderer latex={title} /></span>
        </div>
        {isOpen ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
      </button>
      {isOpen && (
        <div className="p-4 bg-white border-t border-slate-200">
          {children}
        </div>
      )}
    </div>
  );
};


// Helper Component: Image Uploader (No changes needed here)
const ImageUploader = ({ field, imageUrl, onUpload, onDelete }) => {
  return (
    <div className="mt-2">
      <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-lg border border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={`${field} preview`} className="h-full w-full object-contain" />
          ) : (
            <ImageIcon size={24} className="text-slate-400" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="text-sm bg-white border border-slate-300 rounded-md px-3 py-1.5 hover:bg-slate-50 transition"
            onClick={() => document.getElementById(`${field}-input`).click()}
          >
            Change
          </button>
          <input
            id={`${field}-input`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onUpload(field, e.target.files[0])}
          />
          {imageUrl && (
            <button
              type="button"
              className="text-sm text-red-600 hover:text-red-800 transition"
              onClick={() => onDelete(field)}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


const ViewQuestion = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState({});
  const [topics, setTopics] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState({ _id: '', englishName: '', banglaName: '' });
  const [selectedChapter, setSelectedChapter] = useState({ _id: '', englishName: '', banglaName: '', topics: [] });
  const [selectedATopic, setSelectedATopic] = useState({ _id: '', englishName: '', banglaName: '' })
  const [selectedBTopic, setSelectedBTopic] = useState({ _id: '', englishName: '', banglaName: '' })
  const [selectedBSubTopic, setSelectedBSubTopic] = useState({ _id: '', englishName: '', banglaName: '' })
  const [selectedCTopic, setSelectedCTopic] = useState({ _id: '', englishName: '', banglaName: '' })
  const [selectedDTopic, setSelectedDTopic] = useState({ _id: '', englishName: '', banglaName: '' })
  const [selectedCSubTopic, setSelectedCSubTopic] = useState({ _id: '', englishName: '', banglaName: '' })
  const [selectedDSubTopic, setSelectedDSubTopic] = useState({ _id: '', englishName: '', banglaName: '' })
  const [remainingTopicsForA, setRemainingTopicsForA] = useState([]);
  const [remainingTopicsForB, setRemainingTopicsForB] = useState([]);
  const [remainingSubTopicsForB, setRemainingSubTopicsForB] = useState([]);
  const [remainingTopicsForC, setRemainingTopicsForC] = useState([]);
  const [remainingTopicsForD, setRemainingTopicsForD] = useState([]);
  const [remainingSubTopicsForC, setRemainingSubTopicsForC] = useState([]);
  const [remainingSubTopicsForD, setRemainingSubTopicsForD] = useState([]);
  const [formData, setFormData] = useState({
    stem: '',
    level: '',
    a: '', b: '', c: '', d: '',
    aAnswer: '', bAnswer: '', cAnswer: '', dAnswer: '',
    stemImage: null, aAnswerImage: null, bAnswerImage: null, cAnswerImage: null, dAnswerImage: null,
    year: '', board: '', version: '',
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

  const resetFormData = (q) => {
    setFormData({
      stem: q.stem || '', level: q.level || '', a: q.a || '', b: q.b || '', c: q.c || '', d: q.d || '', aAnswer: q.aAnswer || '', bAnswer: q.bAnswer || '', cAnswer: q.cAnswer || '', dAnswer: q.dAnswer || '', stemImage: q.stemImage || null, aAnswerImage: q.aAnswerImage || null, bAnswerImage: q.bAnswerImage || null, cAnswerImage: q.cAnswerImage || null, dAnswerImage: q.dAnswerImage || null, year: q.year || '', board: q.board || '', version: q.version || '', aTopic: q.aTopic || { topicId: '', englishName: '', banglaName: '' }, bTopic: q.bTopic || { topicId: '', englishName: '', banglaName: '' }, bSubTopic: q.bSubTopic || { topicId: '', englishName: '', banglaName: '' }, cTopic: q.cTopic || { topicId: '', englishName: '', banglaName: '' }, dTopic: q.dTopic || { topicId: '', englishName: '', banglaName: '' }, cSubTopic: q.cSubTopic || { topicId: '', englishName: '', banglaName: '' }, dSubTopic: q.dSubTopic || { topicId: '', englishName: '', banglaName: '' }, subject: q.subject || { _id: '', englishName: '', banglaName: '' }, chapter: q.chapter || { chapterId: '', englishName: '', banglaName: '' },
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      try {
        const response = await axios.delete(`/qb/${questionId}`);
        if (response.data.success) {
          toast.success("Question deleted successfully");
          navigate(-1);
        } else {
          toast.error("Failed to delete question");
        }
      } catch (error) {
        toast.error("An error occurred while deleting the question.");
        console.log(error);
      }
    }
  };

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axios.get(`/qb/${questionId}`);
        if (response.data.success) {
          const q = response.data.data;
          setQuestion(q);
          resetFormData(q);

          // Initialize topic states
          setSelectedATopic({ _id: q.aTopic?.topicId || '', englishName: q.aTopic?.englishName || '', banglaName: q.aTopic?.banglaName || '' });
          setSelectedBTopic({ _id: q.bTopic?.topicId || '', englishName: q.bTopic?.englishName || '', banglaName: q.bTopic?.banglaName || '' });
          setSelectedBSubTopic({ _id: q.bSubTopic?.topicId || '', englishName: q.bSubTopic?.englishName || '', banglaName: q.bSubTopic?.banglaName || '' });
          setSelectedCTopic({ _id: q.cTopic?.topicId || '', englishName: q.cTopic?.englishName || '', banglaName: q.cTopic?.banglaName || '' });
          setSelectedCSubTopic({ _id: q.cSubTopic?.topicId || '', englishName: q.cSubTopic?.englishName || '', banglaName: q.cSubTopic?.banglaName || '' });
          setSelectedDTopic({ _id: q.dTopic?.topicId || '', englishName: q.dTopic?.englishName || '', banglaName: q.dTopic?.banglaName || '' });
          setSelectedDSubTopic({ _id: q.dSubTopic?.topicId || '', englishName: q.dSubTopic?.englishName || '', banglaName: q.dSubTopic?.banglaName || '' });
          
          setSelectedSubject(q.subject || { _id: '', englishName: '', banglaName: '' });
          setSelectedChapter({ _id: q.chapter?.chapterId || '', englishName: q.chapter?.englishName || '', banglaName: q.chapter?.banglaName || '' });

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
  
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!question?.group || !question?.level) return;
      try {
        const response = await axios.get(`/subject/filter?group=${question.group}&level=${question.level}`);
        if (response.data.success) setAllSubjects(response.data.data);
      } catch (err) { console.error('Error fetching subjects:', err); }
    };
    fetchSubjects();
  }, [question?.group, question?.level]);

  useEffect(() => {
    if (selectedSubject?._id && allSubjects.length > 0 && selectedChapter?._id) {
      const currentSubjectData = allSubjects.find(s => s._id === selectedSubject._id);
      const currentChapterData = currentSubjectData?.chapters.find(c => c._id === selectedChapter._id);
      const chapterTopics = currentChapterData?.topics || [];
      setTopics(chapterTopics);

      setRemainingTopicsForA(chapterTopics.filter(t => t._id !== selectedATopic._id));
      setRemainingTopicsForB(chapterTopics.filter(t => t._id !== selectedBTopic._id && t._id !== selectedBSubTopic._id));
      setRemainingSubTopicsForB(chapterTopics.filter(t => t._id !== selectedBTopic._id && t._id !== selectedBSubTopic._id));
      setRemainingTopicsForC(chapterTopics.filter(t => t._id !== selectedCTopic._id && t._id !== selectedCSubTopic._id));
      setRemainingSubTopicsForC(chapterTopics.filter(t => t._id !== selectedCTopic._id && t._id !== selectedCSubTopic._id));
      setRemainingTopicsForD(chapterTopics.filter(t => t._id !== selectedDTopic._id && t._id !== selectedDSubTopic._id));
      setRemainingSubTopicsForD(chapterTopics.filter(t => t._id !== selectedDTopic._id && t._id !== selectedDSubTopic._id));
    }
  }, [selectedSubject, allSubjects, selectedChapter, selectedATopic, selectedBTopic, selectedBSubTopic, selectedCTopic, selectedCSubTopic, selectedDTopic, selectedDSubTopic]);

  const toggleAnswer = (part) => setExpandedAnswers(prev => ({ ...prev, [part]: !prev[part] }));
  const isAnswerExpanded = (part) => expandedAnswers[part];
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const handleImageUpload = async (field, file) => {
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);
    try {
      const response = await axios.post(`/upload`, uploadFormData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.data.success) {
        setFormData(prev => ({ ...prev, [field]: response.data.url }));
        toast.success("Image uploaded!");
      } else {
        toast.error('Failed to upload image.');
      }
    } catch (err) {
      toast.error('Error uploading image.');
    }
  };

  const handleImageDelete = (field) => setFormData(prev => ({ ...prev, [field]: null }));
  const isModified = (initialValue, currentValue) => JSON.stringify(initialValue) !== JSON.stringify(currentValue);

  const handlePublish = async () => {
    try {
      const formDataToSend = new FormData();
      let hasChanges = false;
      const fields = ['stem', 'a', 'b', 'c', 'd', 'aAnswer', 'bAnswer', 'cAnswer', 'dAnswer', 'year', 'board', 'version', 'stemImage', 'cAnswerImage', 'dAnswerImage', 'aAnswerImage', 'bAnswerImage'];
      fields.forEach(field => {
        if (isModified(question[field], formData[field])) {
          formDataToSend.append(field, formData[field] || '');
          hasChanges = true;
        }
      });
      const topicFields = ['aTopic', 'bTopic', 'bSubTopic', 'cTopic', 'cSubTopic', 'dTopic', 'dSubTopic'];
      topicFields.forEach(field => {
        if (isModified(question[field], formData[field])) {
          formDataToSend.append(field, JSON.stringify(formData[field]));
          hasChanges = true;
        }
      });
      if (isModified(question.subject?._id, formData.subject._id)) { formDataToSend.append('subject', JSON.stringify(formData.subject)); hasChanges = true; }
      if (isModified(question.chapter?.chapterId, formData.chapter.chapterId)) { formDataToSend.append('chapter', JSON.stringify(formData.chapter)); hasChanges = true; }
      if (!hasChanges) { toast.info("No changes were made."); setIsEditing(false); return; }
      const response = await axios.put(`/qb/${questionId}`, formDataToSend, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.data.success) {
        setQuestion(response.data.data);
        resetFormData(response.data.data);
        setIsEditing(false);
        toast.success('Question published successfully!');
      } else {
        toast.error('Failed to publish: ' + response.data.message);
      }
    } catch (err) { console.error('Error updating question:', err); toast.error('An error occurred while publishing.'); }
  };

  const handleTopicChange = (value, field) => {
    const selectedTopicData = topics.find(topic => topic._id === value) || { _id: '', englishName: '', banglaName: '' };
    const topicSetterMap = { aTopic: setSelectedATopic, bTopic: setSelectedBTopic, bSubTopic: setSelectedBSubTopic, cTopic: setSelectedCTopic, cSubTopic: setSelectedCSubTopic, dTopic: setSelectedDTopic, dSubTopic: setSelectedDSubTopic };
    if (topicSetterMap[field]) { topicSetterMap[field](selectedTopicData); }
    setFormData(prev => ({ ...prev, [field]: { topicId: value, englishName: selectedTopicData.englishName, banglaName: selectedTopicData.banglaName } }));
  };

  if (loading) return <div className="fixed inset-0 flex items-center justify-center bg-white z-50"><HashLoader color="#4f46e5" /></div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!question) return <div className="p-8 text-center text-slate-600">Question not found.</div>;
  
  // =================================================================
  // START: MODIFIED SECTION
  // =================================================================
  const metadataItems = [
    { icon: GraduationCap, label: "Level", value: question.level, field: 'level', options: [question.level], disabled: true },
    {
      icon: BookOpen, label: "Subject", field: 'subject', disabled: true,
      options: allSubjects.map(s => ({ value: s._id, label: formData.version === 'English' ? s.englishName : s.banglaName }))
    },
    {
      icon: Award, label: "Chapter", field: 'chapter', disabled: true,
      options: (allSubjects.find(s => s._id === formData.subject?._id)?.chapters || []).map(c => ({ value: c._id, label: formData.version === 'English' ? c.englishName : c.banglaName }))
    },
    { icon: Calendar, label: "Year", value: question.year, field: 'year', type: 'number' },
    { icon: Building, label: "Board", value: question.board, field: 'board', options: ["Dhaka", "Rajshahi", "Chittagong", "Sylhet", "Comilla", "Jessore", "Dinajpur", "Mymensingh", "Madrasah", "Barishal"] },
    { icon: Target, label: "Version", value: question.version, field: 'version', options: [question.version], disabled: true },
  ];

  
  const questionParts = [
      { part: 'a', question: formData.a, answer: formData.aAnswer, image: formData.aAnswerImage, topic: selectedATopic, subTopic: null, remainingTopics: remainingTopicsForA, remainingSubTopics: [] },
      { part: 'b', question: formData.b, answer: formData.bAnswer, image: formData.bAnswerImage, topic: selectedBTopic, subTopic: selectedBSubTopic, remainingTopics: remainingTopicsForB, remainingSubTopics: remainingSubTopicsForB },
      { part: 'c', question: formData.c, answer: formData.cAnswer, image: formData.cAnswerImage, topic: selectedCTopic, subTopic: selectedCSubTopic, remainingTopics: remainingTopicsForC, remainingSubTopics: remainingSubTopicsForC },
      { part: 'd', question: formData.d, answer: formData.dAnswer, image: formData.dAnswerImage, topic: selectedDTopic, subTopic: selectedDSubTopic, remainingTopics: remainingTopicsForD, remainingSubTopics: remainingSubTopicsForD },
  ];

  const renderViewMode = () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="p-6">
          <div className="mb-4 prose prose-slate max-w-none">
            <LatexRenderer latex={question.stem} />
          </div>
          {question.stemImage && <img src={question.stemImage} alt="Stem" className="mt-4 rounded-lg max-w-full h-auto mx-auto" />}
          <div className="space-y-4 mt-6">
            {['a', 'b', 'c', 'd'].map(p => question[p] && (
              <div key={p}>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-slate-600">{p}).</span>
                  <div className="flex-1 text-slate-800"><LatexRenderer latex={question[p]} /></div>
                  {(question[`${p}Answer`] || question[`${p}AnswerImage`]) && (
                    <button onClick={() => toggleAnswer(p)} className="text-slate-400 hover:text-indigo-600 transition">
                      {isAnswerExpanded(p) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  )}
                </div>
                {isAnswerExpanded(p) && (
                  <div className="mt-2 pl-8 p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                    <p className="font-semibold text-green-800 text-sm mb-2">Answer:</p>
                    <div className="prose prose-sm max-w-none text-green-900">
                        <LatexRenderer latex={question[`${p}Answer`]} />
                    </div>
                    {question[`${p}AnswerImage`] && <img src={question[`${p}AnswerImage`]} alt={`Answer for ${p}`} className="mt-3 rounded-md" />}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 bg-slate-50/70 border-t border-slate-100 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metadataItems.map(item => (
            <div key={item.label} className="flex items-start gap-2">
              <item.icon className="w-5 h-5 mt-0.5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                <p className="text-sm font-semibold text-slate-800">
                    {item.field === 'subject' ? question.subject?.englishName :
                     item.field === 'chapter' ? question.chapter?.englishName :
                     question[item.field]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  const renderEditMode = () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto px-4 py-8">
        {/* LEFT COLUMN: Workspace */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Question Stem</h3>
                <textarea name="stem" value={formData.stem} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg resize-y text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" rows="6" placeholder="Enter the main question stem here..."/>
                <ImageUploader field="stemImage" imageUrl={formData.stemImage} onUpload={handleImageUpload} onDelete={handleImageDelete} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Sub-questions</h3>
                <div className="space-y-3">
                  {questionParts.filter(qp => question[qp.part]).map(qp => (
                    <AccordionItem key={qp.part} part={qp.part} title={qp.question} isEditing={isEditing}>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700">Question Text</label>
                          <textarea name={qp.part} value={qp.question} onChange={handleChange} rows="3" className="mt-1 w-full p-2 border border-slate-300 rounded-md text-sm" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700">Answer Text</label>
                          <textarea name={`${qp.part}Answer`} value={qp.answer} onChange={handleChange} rows="4" className="mt-1 w-full p-2 border border-slate-300 rounded-md text-sm" />
                        </div>
                        <ImageUploader field={`${qp.part}AnswerImage`} imageUrl={qp.image} onUpload={handleImageUpload} onDelete={handleImageDelete} />
                        <div>
                          <label className="text-sm font-medium text-slate-700">Topic</label>
                          <select value={qp.topic._id} onChange={(e) => handleTopicChange(e.target.value, `${qp.part}Topic`)} className="mt-1 w-full p-2 border border-slate-300 rounded-md text-sm">
                              {qp.topic._id ? <option value={qp.topic._id}>{qp.topic.englishName}</option> : <option value="">Select Topic</option>}
                              {qp.remainingTopics.map(topic => <option key={topic._id} value={topic._id}>{topic.englishName}</option>)}
                          </select>
                        </div>
                        {qp.subTopic !== null && (
                          <div>
                            <label className="text-sm font-medium text-slate-700">Sub-topic</label>
                            <select value={qp.subTopic._id} onChange={(e) => handleTopicChange(e.target.value, `${qp.part}SubTopic`)} className="mt-1 w-full p-2 border border-slate-300 rounded-md text-sm">
                                {qp.subTopic._id ? <option value={qp.subTopic._id}>{qp.subTopic.englishName}</option> : <option value="">Select Sub-topic</option>}
                                {qp.remainingSubTopics.map(topic => <option key={topic._id} value={topic._id}>{topic.englishName}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    </AccordionItem>
                  ))}
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Preview & Settings */}
        <div className="space-y-6 lg:sticky lg:top-24 h-max">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Live Preview</h3>
                <div className="prose prose-sm max-w-none">
                    <LatexRenderer latex={formData.stem} />
                    {formData.stemImage && <img src={formData.stemImage} alt="Stem Preview" />}
                    <ol type="a" className="mt-4">
                      {['a', 'b', 'c', 'd'].map(p => formData[p] && ( <li key={p} className='flex gap-4`'> {p} <LatexRenderer latex={formData[p]}/></li> ))}
                    </ol>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Question Details</h3>
                <div className="space-y-4">
                    {metadataItems.map(item => (
                        <div key={item.label}>
                            <label className="text-sm font-medium text-slate-700">{item.label}</label>
                            {item.options ? (
                             
                                <select 
                                    name={item.field} 
                                    value={
                                        item.field === 'subject' ? formData.subject?._id :
                                        item.field === 'chapter' ? formData.chapter?.chapterId :
                                        formData[item.field]
                                    } 
                                    onChange={handleChange} 
                                    disabled={item.disabled}
                                    className="mt-1 w-full p-2 border border-slate-300 rounded-md text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                                >
                                    {item.options.map(opt => {
                                        const val = typeof opt === 'object' ? opt.value : opt;
                                        const label = typeof opt === 'object' ? opt.label : opt;
                                        return <option key={val} value={val}>{label}</option>;
                                    })}
                                </select>
                                // =================================================================
                                // END: MODIFIED SECTION
                                // =================================================================
                            ) : (
                                <input type={item.type || 'text'} name={item.field} value={formData[item.field]} onChange={handleChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md text-sm"/>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: '"Inter", sans-serif' }}>
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className='flex items-center gap-4'>
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition">
              <ArrowLeft size={16} /> Back
            </button>
            <h1 className="text-lg font-bold text-slate-900"> {isEditing ? "Editing Question" : "Question Details"} </h1>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <>
                <button onClick={handleDelete} className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition"> <Trash2 size={16} /> </button>
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"> <Edit size={16} /> Edit </button>
              </>
            ) : (
              <>
                <button onClick={() => { setIsEditing(false); resetFormData(question); }} className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"> Cancel </button>
                <button onClick={handlePublish} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition shadow-sm"> <Save size={16} /> Publish Changes </button>
              </>
            )}
          </div>
        </div>
      </header>
      <main>
        {isEditing ? renderEditMode() : renderViewMode()}
      </main>
    </div>
  );
};

export default ViewQuestion;
