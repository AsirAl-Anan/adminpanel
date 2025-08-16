import React, { useState, useEffect, useRef } from 'react';
import { Upload, Save, RotateCcw, BookOpen, Image, Plus, X, Loader2, CheckCircle, AlertCircle, ArrowLeftIcon } from 'lucide-react';
import LatexRenderer from './LatexRenderer';
import "../../css/AddCq.css";
import 'katex/dist/katex.min.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import { useMemo } from 'react';
import axios from '../../config/axios.js';
import { useNavigate } from 'react-router-dom';
// --- Modal Component for Image Upload (Tailwind Styled) ---
const ImageUploadModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  title = "Upload Images",
  buttonText = "Upload Images",
  maxImages = 5,
  formDataKey = "qb",
}) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images.`);
      return;
    }
    const newSelectedImages = [...selectedImages, ...files];
    setSelectedImages(newSelectedImages);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };
  const removeImage = (index) => {
    const newSelectedImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newSelectedImages);
    setImagePreviews(newPreviews);
    URL.revokeObjectURL(imagePreviews[index]);
  };
  const handleSubmit = () => {
    if (selectedImages.length === 0) {
      toast.error("Please select at least one image.");
      return;
    }
    onSubmit(selectedImages, formDataKey);
  };
  const handleClose = () => {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setSelectedImages([]);
    setImagePreviews([]);
    onClose();
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden bg-white rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 text-gray-500 transition-colors duration-200 rounded-full hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center p-6 mb-4 border-2 border-dashed border-gray-300 rounded-lg transition-colors duration-200 hover:border-blue-400 bg-gray-50">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              multiple
              className="hidden"
              disabled={isLoading || selectedImages.length >= maxImages}
            />
            <Image className="w-10 h-10 mb-3 text-gray-400" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || selectedImages.length >= maxImages}
              className={`flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedImages.length >= maxImages ? 'bg-gray-400 hover:bg-gray-400' : ''
              }`}
            >
              <Plus size={16} className="mr-2" />
              <span>Add Images</span>
            </button>
            <p className="mt-2 text-xs text-gray-500">
             Only PNG, JPG, JPEG up to 10MB each. Max {maxImages} images. (At least 1 required)
            </p>
          </div>
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4 sm:grid-cols-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <div className="overflow-hidden bg-gray-100 border border-gray-200 rounded-lg aspect-square">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    disabled={isLoading}
                    className="absolute top-0 right-0 flex items-center justify-center w-6 h-6 p-1 text-white transition-opacity duration-200 bg-red-500 rounded-full opacity-0 cursor-pointer group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end p-4 space-x-3 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || selectedImages.length === 0}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              selectedImages.length === 0 || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              buttonText
            )}
          </button>
        </div>
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};
const AnswerUploadModal = (props) => <ImageUploadModal {...props} />;
const AddCreativeQuestionPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    stem: '',
    a: '',
    aAnswer: '',
    aTopic: '',
    b: '',
    bAnswer: '',
    bAnswerImage:null,
    bTopic: '',
    bSubTopic: '',
    c: '',
    cImage: null,
    cAnswer: '',

    cTopic: '',
    cSubTopic: '',
    d: '',
    dImage: null,
    dAnswer: '',

    dTopic: '',
    dSubTopic: '',
    difficulty: '',
    group: '',
    board: '',
    institution: '',
    uniqueKey:'',
    year: new Date().getFullYear(),
    subject: '',
    level: '',
    chapter: '',
    banglaStem: '',
    banglaA: '',
    banglaB: '',
    banglaC: '',
    banglaD: '',
    banglaAAnswer: '',
    banglaBAnswer: '',
    banglaCAnswer: '',
    banglaDAnswer: '',
    

    version: 'English',
  });
  const [step, setStep] = useState(0);
  
  const [errors, setErrors] = useState({});
  const [dynamicSubjects, setDynamicSubjects] = useState([]);
  const [dynamicChapters, setDynamicChapters] = useState([]);
  const [dynamicTopics, setDynamicTopics] = useState([]);
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState(null);
  const [subTopicForB, setSubTopicForB] = useState([]);
  const [subTopicForC, setSubTopicForC] = useState([]);
  const [subTopicForD, setSubTopicForD] = useState([]);
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
  const [isAnswerUploadModalOpen, setIsAnswerUploadModalOpen] = useState(false);
  const [isImageUploadLoading, setIsImageUploadLoading] = useState(false);
  const [isAnswerUploadLoading, setIsAnswerUploadLoading] = useState(false);
  const [englishCqUploadResponse, setEnglishCqUploadResponse] = useState(null);
  const [banglaCqUploadResponse, setBanglaCqUploadResponse] = useState(null);
  const [englishAnswerUploadResponse, setEnglishAnswerUploadResponse] = useState(null);
  const [banglaAnswerUploadResponse, setBanglaAnswerUploadResponse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [cAnswerImage, setCAnswerImage] = useState(null);
  const [cAnswerImagePreview, setCAnswerImagePreview] = useState(null);
  const [dAnswerImage, setDAnswerImage] = useState(null);
  const [dAnswerImagePreview, setDAnswerImagePreview] = useState(null);
  const [cAnswerImageBangla, setCAnswerImageBangla] = useState(null);
  const [cAnswerImageBanglaPreview, setCAnswerImageBanglaPreview] = useState(null);
  const [dAnswerImageBangla, setDAnswerImageBangla] = useState(null);
  const [dAnswerImageBanglaPreview, setDAnswerImageBanglaPreview] = useState(null);
  const [stemImagePreview, setStemImagePreview] = useState(null);
  const [stemImage, setStemImage] = useState(null);
  const [banglaStemImagePreview, setBanglaStemImagePreview] = useState(null);
  const [banglaStemImage, setBanglaStemImage] = useState(null);
  useEffect(() => {
    const fetchSubjects = async () => {
      if (formData.group && formData.level) {
        setIsSubjectsLoading(true);
        setSubjectsError(null);
        setDynamicSubjects([]);
        setDynamicChapters([]);
        setDynamicTopics([]);
        setFormData(prev => ({
          ...prev,
          subject: '',
          chapter: '',
          aTopic: '',
          bTopic: '',
          cTopic: '',
          dTopic: ''
        }));
        try {
          const response = await axios.get(`/subject/filter?group=${formData.group}&level=${formData.level}`);
          console.log("inside subject")
          console.log("Fetched subjects:", response.data);
          if (response.data.success) {
            setDynamicSubjects(response.data.data || []);
          } else {
            throw new Error(response.data.message || 'Failed to fetch subjects');
          }
        } catch (err) {
          console.error("Error fetching subjects:", err);
          setSubjectsError(err.message || 'An error occurred while fetching subjects.');
          setDynamicSubjects([]);
        } finally {
          setIsSubjectsLoading(false);
        }
      } else {
        setDynamicSubjects([]);
        setDynamicChapters([]);
        setDynamicTopics([]);
        setFormData(prev => ({
          ...prev,
          subject: '',
          chapter: '',
          aTopic: '',
          bTopic: '',
          cTopic: '',
          dTopic: ''
        }));
      }
    };
    fetchSubjects();
  }, [formData.group, formData.level]);
  useEffect(() => {
    if (formData.subject && dynamicSubjects.length > 0) {
      const selectedSubjectObj = dynamicSubjects.find(sub => sub._id === formData.subject);
      if (selectedSubjectObj) {
        setDynamicChapters(selectedSubjectObj.chapters || []);
        setFormData(prev => ({
          ...prev,
          chapter: '',
          aTopic: '',
          bTopic: '',
          cTopic: '',
          dTopic: ''
        }));
        setDynamicTopics([]);
      } else {
        setDynamicChapters([]);
        setDynamicTopics([]);
        setFormData(prev => ({
          ...prev,
          chapter: '',
          aTopic: '',
          bTopic: '',
          cTopic: '',
          dTopic: ''
        }));
      }
    } else {
      setDynamicChapters([]);
      setDynamicTopics([]);
      setFormData(prev => ({
        ...prev,
        chapter: '',
        aTopic: '',
        bTopic: '',
        cTopic: '',
        dTopic: ''
      }));
    }
  }, [formData.subject, dynamicSubjects]);
  const mathSubjects = [
    "General Mathematics",
    "Higher Mathematics",
    "Higher Mathematics 1st Paper",
    "Higher Mathematics 2nd Paper"
  ];
  const isMathSubject = mathSubjects.includes(formData.subject);
  useEffect(() => {
    if (formData.chapter && dynamicChapters.length > 0) {
      const selectedChapterObj = dynamicChapters.find(chap => chap._id === formData.chapter);
      if (selectedChapterObj && selectedChapterObj.topics) {
        const topicsForDropdown = selectedChapterObj.topics.map(topic => ({
            value: topic.englishName,
            banglaValue: topic.banglaName,
            label: `${topic.englishName} (${topic.banglaName})`
        }));
        setDynamicTopics(topicsForDropdown);
         setFormData(prev => ({
          ...prev,
          aTopic: '',
          bTopic: '',
          cTopic: '',
          dTopic: ''
        }));
      } else {
        setDynamicTopics([]);
        setFormData(prev => ({
          ...prev,
          aTopic: '',
          bTopic: '',
          cTopic: '',
          dTopic: ''
        }));
      }
    } else {
      setDynamicTopics([]);
       setFormData(prev => ({
        ...prev,
        aTopic: '',
        bTopic: '',
        cTopic: '',
        dTopic: ''
      }));
    }
  }, [formData.chapter, dynamicChapters]);
  useEffect(() => {
    console.log("englishAnswerUploadResponse updated:", englishAnswerUploadResponse);
    if (englishAnswerUploadResponse) {
      setFormData(prev => ({
        ...prev,
        aAnswer: englishAnswerUploadResponse.aAnswer,
        bAnswer: englishAnswerUploadResponse.bAnswer,
        cAnswer: englishAnswerUploadResponse.cAnswer,
        dAnswer: englishAnswerUploadResponse.dAnswer
      }))
    }
  }, [englishAnswerUploadResponse]);
  useEffect(() => {
    console.log("in use effect", englishCqUploadResponse)
    if (englishCqUploadResponse) {
      setFormData(prev => ({
        ...prev,
        stem: englishCqUploadResponse.stem,
        a: englishCqUploadResponse.a,
        b: englishCqUploadResponse.b,
        c: englishCqUploadResponse.c,
        d: englishCqUploadResponse.d
      }));
    }
  }, [englishCqUploadResponse]);
  useEffect(() => {
    console.log("banglaCqUploadResponse updated:", banglaCqUploadResponse);
    if (banglaCqUploadResponse) {
      setFormData(prev => ({
        ...prev,
        banglaStem: banglaCqUploadResponse.stem,
        banglaA: banglaCqUploadResponse.a,
        banglaB: banglaCqUploadResponse.b,
        banglaC: banglaCqUploadResponse.c,
        banglaD: banglaCqUploadResponse.d
      }));
    }
  }, [banglaCqUploadResponse]);
  useEffect(() => {
    console.log("banglaAnswerUploadResponse updated:", banglaAnswerUploadResponse);
    if (banglaAnswerUploadResponse) {
      setFormData(prev => ({
        ...prev,
        banglaAAnswer: banglaAnswerUploadResponse.aAnswer,
        banglaBAnswer: banglaAnswerUploadResponse.bAnswer,
        banglaCAnswer: banglaAnswerUploadResponse.cAnswer,
        banglaDAnswer: banglaAnswerUploadResponse.dAnswer
      }));
    }
  }, [banglaAnswerUploadResponse]);
  // Helper function to validate current step
  const validateCurrentStep = () => {
    const newErrors = {};
    let isValid = true;
    if (step === 0) {
      if (!formData.level) {
        newErrors.level = 'Level is required';
        isValid = false;
      }
      if (!formData.group) {
        newErrors.group = 'Group is required';
        isValid = false;
      }
    } else if (step === 1) {
      if (!formData.subject) {
        newErrors.subject = 'Subject is required';
        isValid = false;
      }
      if (!formData.chapter) {
        newErrors.chapter = 'Chapter is required';
        isValid = false;
      }
      if (!formData.difficulty) {
        newErrors.difficulty = 'Difficulty is required';
        isValid = false;
      }
      if (!formData.board) {
        newErrors.board = 'Board is required';
        isValid = false;
      }
      if (!formData.year || formData.year < 2000 || formData.year > 2099) {
        newErrors.year = 'Valid year is required';
        isValid = false;
      }
    } else if (step === 2) {
      if (!formData.stem?.trim()) {
        newErrors.stem = 'English Stem is required';
        isValid = false;
      }
      if (!formData.a?.trim()) {
        newErrors.a = 'Option A (Knowledge-based) is required';
        isValid = false;
      }
      if (!formData.b?.trim()) {
        newErrors.b = 'Option B (Comprehension) is required';
        isValid = false;
      }
      if (!formData.bTopic) {
        newErrors.bTopic = 'Topic for Option B is required';
        isValid = false;
      }
      if (!formData.c?.trim()) {
        newErrors.c = 'Option C (Application) is required';
        isValid = false;
      }
      if (!formData.cTopic) {
        newErrors.cTopic = 'Topic for Option C is required';
        isValid = false;
      }
      // Only validate D if it's NOT a math subject
      if (!isMathSubject) {
        const isDContentPresent = formData.d?.trim();
        if (!isDContentPresent) {
            newErrors.d = 'Option D (Higher Order Thinking) is required for this subject';
            isValid = false;
        }
        if (isDContentPresent || formData.dTopic) {
            if (!formData.dTopic) {
                newErrors.dTopic = 'Topic for Option D is required when content or subtopic is provided';
                isValid = false;
            }
        }
      }
    } else if (step === 3) {
      if (!formData.banglaStem?.trim()) {
        newErrors.banglaStem = 'Bangla Stem is required';
        isValid = false;
      }
      if (!formData.banglaA?.trim()) {
        newErrors.banglaA = 'Option A (Knowledge-based, Bangla) is required';
        isValid = false;
      }
      if (!formData.banglaB?.trim()) {
        newErrors.banglaB = 'Option B (Comprehension, Bangla) is required';
        isValid = false;
      }
      if (!formData.banglaC?.trim()) {
        newErrors.banglaC = 'Option C (Application, Bangla) is required';
        isValid = false;
      }
      // Only validate D if it's NOT a math subject
      if (!isMathSubject) {
        const isDEnglishContentPresent = formData.d?.trim();
        const isDBanglaContentPresent = formData.banglaD?.trim();
        if (!isDEnglishContentPresent && !isDBanglaContentPresent) {
            newErrors.banglaD = 'Option D (Higher Order Thinking, Bangla) is required for this subject';
            isValid = false;
        }
      }
    } else if (step === 4) {
      if (!formData.aAnswer?.trim()) {
        newErrors.aAnswer = 'Answer for Option A is required';
        isValid = false;
      }
      if (!formData.bAnswer?.trim()) {
        newErrors.bAnswer = 'Answer for Option B is required';
        isValid = false;
      }
      if (!formData.cAnswer?.trim()) {
        newErrors.cAnswer = 'Answer for Option C is required';
        isValid = false;
      }
      // Only validate D if it's NOT a math subject
      if (!isMathSubject) {
        const isDEnglishContentPresent = formData.d?.trim();
        const isDBanglaContentPresent = formData.banglaD?.trim();
        const isDContentPresent = isDEnglishContentPresent || isDBanglaContentPresent;
        if (isDContentPresent && !formData.dAnswer?.trim()) {
           newErrors.dAnswer = 'Answer for Option D is required';
           isValid = false;
        }
      }
    } else if (step === 5) {
      if (!formData.banglaAAnswer?.trim()) {
        newErrors.banglaAAnswer = 'Answer for Option A (Bangla) is required';
        isValid = false;
      }
      if (!formData.banglaBAnswer?.trim()) {
        newErrors.banglaBAnswer = 'Answer for Option B (Bangla) is required';
        isValid = false;
      }
      if (!formData.banglaCAnswer?.trim()) {
        newErrors.banglaCAnswer = 'Answer for Option C (Bangla) is required';
        isValid = false;
      }
      // Only validate D if it's NOT a math subject
      if (!isMathSubject) {
        const isDEnglishContentPresent = formData.d?.trim();
        const isDBanglaContentPresent = formData.banglaD?.trim();
        const isDContentPresent = isDEnglishContentPresent || isDBanglaContentPresent;
        if (isDContentPresent && !formData.banglaDAnswer?.trim()) {
           newErrors.banglaDAnswer = 'Answer for Option D (Bangla) is required';
           isValid = false;
        }
      }
    }
    setErrors(newErrors);
    return isValid;
  };
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  const handleImageUpload = (e, setImage, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };
  const clearImagePreview = (setImage, setPreview) => {
    setImage(null);
    setPreview(null);
   }
  const handleTopicChange = (field, value) => {
    setFormData(prev => {
      const updatedData = { ...prev, [field]: value };
      if (field === 'bTopic') {
         const selectedChapterObj = dynamicChapters.find(c => c._id === prev.chapter);
        const selectedTopicObj = selectedChapterObj?.topics?.find(t => t.englishName === value);
       let topicsExceptSelectedTopic  =  selectedChapterObj?.topics?.filter(t => t.englishName !== value);
        topicsExceptSelectedTopic = topicsExceptSelectedTopic.map(t=>{
          return {
            value: t.englishName,
            banglaValue: t.banglaName,
            label: `${t.englishName} (${t.banglaName})`
          }
        })
        setSubTopicForB(topicsExceptSelectedTopic);
      } else if (field === 'cTopic') {
        const selectedChapterObj = dynamicChapters.find(c => c._id === prev.chapter);
        const selectedTopicObj = selectedChapterObj?.topics?.find(t => t.englishName === value);
        let topicsExceptSelectedTopic  =  selectedChapterObj?.topics?.filter(t => t.englishName !== value);
        topicsExceptSelectedTopic = topicsExceptSelectedTopic.map(t=>{
          return {
            value: t.englishName,
            banglaValue: t.banglaName,
            label: `${t.englishName} (${t.banglaName})`
          }
        })
        setSubTopicForC(topicsExceptSelectedTopic);
      } else if (field === 'dTopic') {
         const selectedChapterObj = dynamicChapters.find(c => c._id === prev.chapter);
        const selectedTopicObj = selectedChapterObj?.topics?.find(t => t.englishName === value);
       let topicsExceptSelectedTopic  =  selectedChapterObj?.topics?.filter(t => t.englishName !== value);
        topicsExceptSelectedTopic = topicsExceptSelectedTopic.map(t=>{
          return {
            value: t.englishName,
            banglaValue: t.banglaName,
            label: `${t.englishName} (${t.banglaName})`
          }
        })
        setSubTopicForD(topicsExceptSelectedTopic);
      }
      return updatedData;
    });
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  const selectedEnglishATopicObj = useMemo(() => {
    if (!formData.aTopic || !formData.chapter || dynamicChapters.length === 0) return null;
    const selectedChapter = dynamicChapters.find(c => c._id === formData.chapter);
    return selectedChapter?.topics?.find(t => t.englishName === formData.aTopic);
  }, [formData.aTopic, formData.chapter, dynamicChapters]);
  const selectedEnglishBTopicObj = useMemo(() => {
    if (!formData.bTopic || !formData.chapter || dynamicChapters.length === 0) return null;
    const selectedChapter = dynamicChapters.find(c => c._id === formData.chapter);
    return selectedChapter?.topics?.find(t => t.englishName === formData.bTopic);
  }, [formData.bTopic, formData.chapter, dynamicChapters]);
  const selectedEnglishCTopicObj = useMemo(() => {
    if (!formData.cTopic || !formData.chapter || dynamicChapters.length === 0) return null;
    const selectedChapter = dynamicChapters.find(c => c._id === formData.chapter);
    return selectedChapter?.topics?.find(t => t.englishName === formData.cTopic);
  }, [formData.cTopic, formData.chapter, dynamicChapters]);
  const selectedEnglishDTopicObj = useMemo(() => {
    if (!formData.d || !formData.dTopic || !formData.chapter || dynamicChapters.length === 0) return null;
    const selectedChapter = dynamicChapters.find(c => c._id === formData.chapter);
    return selectedChapter?.topics?.find(t => t.englishName === formData.dTopic);
  }, [formData.d, formData.dTopic, formData.chapter, dynamicChapters]);
  const selectedEnglishBSubTopicObj = useMemo(() => {
    if (!formData.bSubTopic || !selectedEnglishBTopicObj) return null;
    return selectedEnglishBTopicObj?.subTopics?.find(st => st.englishName === formData.bSubTopic);
  }, [formData.bSubTopic, selectedEnglishBTopicObj]);
  const selectedEnglishCSubTopicObj = useMemo(() => {
    if (!formData.cSubTopic || !selectedEnglishCTopicObj) return null;
    return selectedEnglishCTopicObj?.subTopics?.find(st => st.englishName === formData.cSubTopic);
  }, [formData.cSubTopic, selectedEnglishCTopicObj]);
  const selectedEnglishDSubTopicObj = useMemo(() => {
    if (!formData.d || !formData.dSubTopic || !selectedEnglishDTopicObj) return null;
    return selectedEnglishDTopicObj?.subTopics?.find(st => st.englishName === formData.dSubTopic);
  }, [formData.d, formData.dSubTopic, selectedEnglishDTopicObj]);
  const resetForm = () => {
    setFormData({
      stem: '',
      stemImage: null,
      a: '',
      b: '',
      c: '',
      cTopic: '',
      d: '',
      dTopic: '',
      difficulty: '',
      group: '',
      board: '',
      institution: '',
      year: new Date().getFullYear(),
      subject: '',
      level: '',
      aAnswer: '',
      bAnswer: '',
      cAnswer: '',
      dAnswer: '',
      chapter: '',
      aTopic: '',
      bTopic: '',
      bSubTopic: '',
    });
    setErrors({});
    setStep(0);
    setDynamicSubjects([]);
    setDynamicChapters([]);
    setDynamicTopics([]);
    setSubjectsError(null);
    setEnglishCqUploadResponse(null);
    setEnglishAnswerUploadResponse(null);
    setSubmissionSuccess(false);
    setSubmissionError('');
  };
  const handleOpenImageUploadModal = () => {
    setIsImageUploadModalOpen(true);
  };
  const handleCloseImageUploadModal = () => {
    setIsImageUploadModalOpen(false);
  };
  const handleOpenAnswerUploadModal = () => {
    setIsAnswerUploadModalOpen(true);
  };
  const handleCloseAnswerUploadModal = () => {
    setIsAnswerUploadModalOpen(false);
  };
  const handleImageUploadSubmit = async (images, key) => {
    setIsImageUploadLoading(true);
    setEnglishCqUploadResponse(null);
    setBanglaCqUploadResponse(null);
    try {
      const formDataToSend = new FormData();
      images.forEach((image) => {
        formDataToSend.append(key, image);
      });
      const response = await axios.post('/ai/extract-cq', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setEnglishCqUploadResponse(response?.data?.data?.[0]);
      setBanglaCqUploadResponse(response?.data?.data?.[1]);
      handleCloseImageUploadModal();
      toast.success("Questions (English & Bangla) generated successfully!");
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images and generate questions. Please try again.');
    } finally {
      setIsImageUploadLoading(false);
    }
  };
  const handleAnswerUploadSubmit = async (images, key = "qb") => {
    setIsAnswerUploadLoading(true);
    setEnglishAnswerUploadResponse(null);
    setBanglaAnswerUploadResponse(null);
    try {
      const formDataToSend = new FormData();
      images.forEach((image, index) => {
        formDataToSend.append(key, image);
      });
      if (englishCqUploadResponse) {
        formDataToSend.append('question', JSON.stringify(englishCqUploadResponse));
      } else {
        console.warn("No question data found in englishCqUploadResponse to send with answers.");
      }
      const response = await axios.post('/ai/extract-cq-answers', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data && response.data.data) {
        setEnglishAnswerUploadResponse(response.data.data[0]);
        setBanglaAnswerUploadResponse(response.data.data[1]);
      }
      handleCloseAnswerUploadModal();
      toast.success("Answers (English & Bangla) generated successfully!");
      return response.data;
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
      console.error('Request config:', error.config);
      toast.error('Failed to upload answer images and generate answers. Please try again.');
      throw error;
    } finally {
      setIsAnswerUploadLoading(false);
    }
  };
  const handleNext = (e) => {
    e.preventDefault();
    if (validateCurrentStep()) {
      setStep(step + 1);
    } else {
      toast.error("Please fill in all required fields correctly before proceeding.");
    }
  };
  const handlePrev = (e) => {
    e.preventDefault();
    setStep(step - 1);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) {
        toast.error("Please correct the errors in the form before submitting.");
        return;
    }
    setIsSubmitting(true);
    setSubmissionSuccess(false);
    setSubmissionError('');
    try {
      const uniqueKey = `${formData.subject}-${formData.chapter}-${formData.year}-${Math.random()}-${Date.now()}`;
      const selectedSubjectObj = dynamicSubjects.find((s) => s._id === formData.subject);
      const selectedChapterObj = dynamicChapters.find((c) => c._id === formData.chapter);
      const findTopicByName = (topicName) => {
        return selectedChapterObj?.topics?.find((t) => t.englishName === topicName);
      };
      const selectedATopicObj = findTopicByName(formData.aTopic);
      const selectedBTopicObj = findTopicByName(formData.bTopic);
      const selectedCTopicObj = findTopicByName(formData.cTopic);
      const selectedDTopicObj = formData.d ? findTopicByName(formData.dTopic) : null;
      let selectedBSubTopicObj = null;
      let selectedCSubTopicObj = null;
      let selectedDSubTopicObj = null;
      if (formData.bSubTopic && selectedBTopicObj) {
        selectedBSubTopicObj = selectedChapterObj.topics.find(
          (sub) => sub.englishName === formData.bSubTopic
        );
      }
      if (formData.cSubTopic && selectedCTopicObj) {
        selectedCSubTopicObj = selectedChapterObj.topics.find(
          (sub) => sub.englishName === formData.cSubTopic
        );
      }
      if (formData.d && formData.dSubTopic && selectedDTopicObj) {
        selectedDSubTopicObj = selectedChapterObj.topics.find(
          (sub) => sub.englishName === formData.dSubTopic
        );
      }
  


      const englishQuestionAnswerDataForUpload = new FormData();
      englishQuestionAnswerDataForUpload.append('uniqueKey', uniqueKey);
      englishQuestionAnswerDataForUpload.append('stem', formData.stem);
      englishQuestionAnswerDataForUpload.append('a', formData.a);
      englishQuestionAnswerDataForUpload.append('aAnswer', formData.aAnswer); 
      if(selectedATopicObj){
      englishQuestionAnswerDataForUpload.append('aTopic', selectedATopicObj ? JSON.stringify({
        topicId: selectedATopicObj._id,
        englishName: selectedATopicObj.englishName,
        banglaName: selectedATopicObj.banglaName,
      }) : null); 

      }
      englishQuestionAnswerDataForUpload.append('b', formData.b);
      if(selectedBTopicObj){
      englishQuestionAnswerDataForUpload.append('bTopic', selectedBTopicObj ? JSON.stringify({
        topicId: selectedBTopicObj._id,
        englishName: selectedBTopicObj.englishName,
        banglaName: selectedBTopicObj.banglaName,
      }) : null);
      }
      if(selectedBSubTopicObj){
      englishQuestionAnswerDataForUpload.append('bSubTopic', selectedBSubTopicObj ? JSON.stringify({
        topicId: selectedBSubTopicObj._id,
        englishName: selectedBSubTopicObj.englishName,
        banglaName: selectedBSubTopicObj.banglaName,
      }) : null);
      }
      englishQuestionAnswerDataForUpload.append('bAnswer', formData.bAnswer);
      englishQuestionAnswerDataForUpload.append('c', formData.c);
      if(selectedCTopicObj){
        console.log("selectedCTopicObj in eng", selectedCTopicObj)
      englishQuestionAnswerDataForUpload.append('cTopic', selectedCTopicObj ? JSON.stringify({
        topicId: selectedCTopicObj._id,
        englishName: selectedCTopicObj.englishName,
        banglaName: selectedCTopicObj.banglaName,
      }) : null);
      }
      if(selectedCSubTopicObj){
      englishQuestionAnswerDataForUpload.append('cSubTopic', selectedCSubTopicObj ? JSON.stringify({
        topicId: selectedCSubTopicObj._id,
        englishName: selectedCSubTopicObj.englishName,
        banglaName: selectedCSubTopicObj.banglaName,
      }) : null);
      }
      englishQuestionAnswerDataForUpload.append('cAnswer', formData.cAnswer);
      
      if (formData.d) {
        englishQuestionAnswerDataForUpload.append('d', formData.d);
        if(selectedDTopicObj){
          englishQuestionAnswerDataForUpload.append('dTopic', selectedDTopicObj ? JSON.stringify({
            topicId: selectedDTopicObj._id,
            englishName: selectedDTopicObj.englishName,
            banglaName: selectedDTopicObj.banglaName,
          }) : null);
        }
        if(selectedDSubTopicObj){
          englishQuestionAnswerDataForUpload.append('dSubTopic', selectedDSubTopicObj ? JSON.stringify({
            topicId: selectedDSubTopicObj._id,
            englishName: selectedDSubTopicObj.englishName,
            banglaName: selectedDSubTopicObj.banglaName,
          }) : null);
        }
      }
      englishQuestionAnswerDataForUpload.append('dAnswer', formData.dAnswer || '');
      englishQuestionAnswerDataForUpload.append('difficulty', formData.difficulty);
      englishQuestionAnswerDataForUpload.append('group', formData.group);
      englishQuestionAnswerDataForUpload.append('board', formData.board);
      englishQuestionAnswerDataForUpload.append('institution', formData.institution);
      englishQuestionAnswerDataForUpload.append('year', parseInt(formData.year, 10));
      englishQuestionAnswerDataForUpload.append('subject', formData.subject);
      englishQuestionAnswerDataForUpload.append('level', formData.level);
      englishQuestionAnswerDataForUpload.append('version', 'English');

      englishQuestionAnswerDataForUpload.append('chapter', selectedChapterObj ? JSON.stringify({
        chapterId: selectedChapterObj._id,
        englishName: selectedChapterObj.englishName,
        banglaName: selectedChapterObj.banglaName,
      }) : null) ;
      if(stemImage){
        englishQuestionAnswerDataForUpload.append('stemImage', stemImage);
      }
      if(cAnswerImage){
        englishQuestionAnswerDataForUpload.append('cAnswerImage', cAnswerImage);
      }
      if(dAnswerImage){
        englishQuestionAnswerDataForUpload.append('dAnswerImage', dAnswerImage);
      }

      englishQuestionAnswerDataForUpload.append('isOwn', true);

      const englishSubmissionData = {
        uniqueKey: uniqueKey,
        stem: formData.stem,
        a: formData.a,
        aAnswer: formData.aAnswer,
        aTopic: selectedATopicObj
          ? {
              topicId: selectedATopicObj._id,
              englishName: selectedATopicObj.englishName,
              banglaName: selectedATopicObj.banglaName,
            }
          : undefined,
        b: formData.b,
        bAnswer: formData.bAnswer,
        bTopic: selectedBTopicObj
          ? {
              topicId: selectedBTopicObj._id,
              englishName: selectedBTopicObj.englishName,
              banglaName: selectedBTopicObj.banglaName,
            }
          : undefined,
        bSubTopic: selectedBSubTopicObj
          ? {
              topicId: selectedBSubTopicObj._id,
              englishName: selectedBSubTopicObj.englishName,
              banglaName: selectedBSubTopicObj.banglaName,
            }
          : undefined,
        c: formData.c,
        cAnswer: formData.cAnswer,
        cTopic: selectedCTopicObj
          ? {
              topicId: selectedCTopicObj._id,
              englishName: selectedCTopicObj.englishName,
              banglaName: selectedCTopicObj.banglaName,
            }
          : undefined,
        cSubTopic: selectedCSubTopicObj
          ? {
              topicId: selectedCSubTopicObj._id,
              englishName: selectedCSubTopicObj.englishName,
              banglaName: selectedCSubTopicObj.banglaName,
            }
          : undefined,
        d: formData.d || undefined,
        dAnswer: formData.dAnswer || undefined,
        dTopic: selectedDTopicObj && formData.d
          ? {
              topicId: selectedDTopicObj._id,
              englishName: selectedDTopicObj.englishName,
              banglaName: selectedDTopicObj.banglaName,
            }
          : undefined,
        dSubTopic: selectedDSubTopicObj && formData.d
          ? {
              topicId: selectedDSubTopicObj._id,
              englishName: selectedDSubTopicObj.englishName,
              banglaName: selectedDSubTopicObj.banglaName,
            }
          : undefined,
        difficulty: formData.difficulty,
        group: formData.group,
        board: formData.board,
        institution: formData.institution,
        year: parseInt(formData.year, 10),
        subject: formData.subject,
        level: formData.level,
        version: "English",
        chapter: selectedChapterObj
          ? {
              chapterId: selectedChapterObj._id,
              englishName: selectedChapterObj.englishName,
              banglaName: selectedChapterObj.banglaName,
            }
          : undefined,
      };
      const banglaQuestionAnswerDataForUpload = new FormData();
banglaQuestionAnswerDataForUpload.append('uniqueKey', uniqueKey);
banglaQuestionAnswerDataForUpload.append('stem', formData.banglaStem);
banglaQuestionAnswerDataForUpload.append('a', formData.banglaA);
banglaQuestionAnswerDataForUpload.append('aAnswer', formData.banglaAAnswer);
banglaQuestionAnswerDataForUpload.append('aCommon', formData.aCommon);
if(selectedATopicObj){
  banglaQuestionAnswerDataForUpload.append('aTopic', JSON.stringify({
    topicId: selectedATopicObj._id,
    englishName: selectedATopicObj.englishName,
    banglaName: selectedATopicObj.banglaName,
  }));
}

banglaQuestionAnswerDataForUpload.append('b', formData.banglaB);
banglaQuestionAnswerDataForUpload.append('bAnswer', formData.banglaBAnswer);
banglaQuestionAnswerDataForUpload.append('bCommon', formData.bCommon);
if(selectedBTopicObj){
  banglaQuestionAnswerDataForUpload.append('bTopic', JSON.stringify({
    topicId: selectedBTopicObj._id,
    englishName: selectedBTopicObj.englishName,
    banglaName: selectedBTopicObj.banglaName,
  }));
}
if(selectedBSubTopicObj){
  banglaQuestionAnswerDataForUpload.append('bSubTopic', JSON.stringify({
    topicId: selectedBSubTopicObj._id,
    englishName: selectedBSubTopicObj.englishName,
    banglaName: selectedBSubTopicObj.banglaName,
  }));
}

banglaQuestionAnswerDataForUpload.append('c', formData.banglaC);
banglaQuestionAnswerDataForUpload.append('cAnswer', formData.banglaCAnswer);
if(selectedCTopicObj){
  console.log("selectedCTopicObj for check", selectedCTopicObj);
  banglaQuestionAnswerDataForUpload.append('cTopic', JSON.stringify({
    topicId: selectedCTopicObj._id,
    englishName: selectedCTopicObj.englishName,
    banglaName: selectedCTopicObj.banglaName,
  }));
}
if(selectedCSubTopicObj){
  banglaQuestionAnswerDataForUpload.append('cSubTopic', JSON.stringify({
    topicId: selectedCSubTopicObj._id,
    englishName: selectedCSubTopicObj.englishName,
    banglaName: selectedCSubTopicObj.banglaName,
  }));
}

if (formData.banglaD) {
  banglaQuestionAnswerDataForUpload.append('d', formData.banglaD);
  if(selectedDTopicObj){
    banglaQuestionAnswerDataForUpload.append('dTopic', JSON.stringify({
      topicId: selectedDTopicObj._id,
      englishName: selectedDTopicObj.englishName,
      banglaName: selectedDTopicObj.banglaName,
    }));
  }
  if(selectedDSubTopicObj){
    banglaQuestionAnswerDataForUpload.append('dSubTopic', JSON.stringify({
      topicId: selectedDSubTopicObj._id,
      englishName: selectedDSubTopicObj.englishName,
      banglaName: selectedDSubTopicObj.banglaName,
    }));
  }
}
banglaQuestionAnswerDataForUpload.append('dAnswer', formData.banglaDAnswer || '');

banglaQuestionAnswerDataForUpload.append('difficulty', formData.difficulty);
banglaQuestionAnswerDataForUpload.append('group', formData.group);
banglaQuestionAnswerDataForUpload.append('board', formData.board);
banglaQuestionAnswerDataForUpload.append('institution', formData.institution);
banglaQuestionAnswerDataForUpload.append('year', parseInt(formData.year, 10));
banglaQuestionAnswerDataForUpload.append('subject', formData.subject);
banglaQuestionAnswerDataForUpload.append('level', formData.level);
banglaQuestionAnswerDataForUpload.append('version', 'Bangla');

banglaQuestionAnswerDataForUpload.append('chapter', selectedChapterObj ? JSON.stringify({
  chapterId: selectedChapterObj._id,
  englishName: selectedChapterObj.englishName,
  banglaName: selectedChapterObj.banglaName,
}) : null);

// Image uploads
if(banglaStemImage){
  banglaQuestionAnswerDataForUpload.append('stemImage', banglaStemImage);
}
if(cAnswerImageBangla){
  banglaQuestionAnswerDataForUpload.append('cAnswerImage', cAnswerImageBangla);
}
if(dAnswerImageBangla){
  banglaQuestionAnswerDataForUpload.append('dAnswerImage', dAnswerImageBangla);
}

banglaQuestionAnswerDataForUpload.append('isOwn', true);
      
      const englishResponse = await axios.post('/qb', englishQuestionAnswerDataForUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      const banglaResponse = await axios.post('/qb', banglaQuestionAnswerDataForUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      console.log("English Question created successfully:", englishResponse.data);
      console.log("Bangla Question created successfully:", banglaResponse.data);
      setSubmissionSuccess(true);
      toast.success("Question created successfully!");
    } catch (error) {
      console.error("Error submitting question:", error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
        if (error.response.data?.details) {
          errorMessage += ` Details: ${error.response.data.details.join(', ')}`;
        }
      } else if (error.request) {
        console.error('Request data:', error.request);
        errorMessage = 'No response received from server. Please check your connection.';
      } else {
        console.error('Error message:', error.message);
      }
      setSubmissionError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  const showFormTitle = () => {
    if (step === 0) return "Add Basic Details (Level & Group)";
    if (step === 1) return "Add Subject & Context Details";
    if (step === 2) return "Add English Question";
    if (step === 3) return "Add Bangla Question";
    if (step === 4) return "Add English Answer";
    if (step === 5) return "Add Bangla Answer";
    return "";
  };
  const handleGoBack =()=>{
    navigate(-1);
  }
  return (
    <div className="page-container w-full">
      <ImageUploadModal
        isOpen={isImageUploadModalOpen}
        onClose={handleCloseImageUploadModal}
        onSubmit={handleImageUploadSubmit}
        isLoading={isImageUploadLoading}
        title="Upload Question Images"
        buttonText="Generate Question"
        maxImages={3}
        formDataKey="qb"
      />
      <AnswerUploadModal
        isOpen={isAnswerUploadModalOpen}
        onClose={handleCloseAnswerUploadModal}
        onSubmit={handleAnswerUploadSubmit}
        isLoading={isAnswerUploadLoading}
        title="Upload Answer Images"
        buttonText="Generate Answers"
        maxImages={3}
        formDataKey="qb"
      />
      <div className="content-wrapper">
                  <button onClick={handleGoBack} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-8 flex p-4 align-baseline'> <ArrowLeftIcon></ArrowLeftIcon> Go back</button>

        <div className="header">
          <div className="header-badge">
            <BookOpen className="header-icon" />
            <h1 className="text-white text-lg">Add Creative Question</h1>
          </div>
        </div>
        <div className="form-container">
          <div className="form-card">
            <div className="form-card-header">
              <h2 className="form-card-title">{showFormTitle()}</h2>
            </div>
            <div className="form-content">
              {submissionSuccess && (
                <div className="p-4 mb-4 text-green-800 bg-green-100 border border-green-200 rounded">
                  <div className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-2" />
                    <span className="font-medium">Success!</span> Question created successfully.
                  </div>
                </div>
              )}
              {submissionError && (
                <div className="p-4 mb-4 text-red-800 bg-red-100 border border-red-200 rounded">
                  <div className="flex items-center">
                    <AlertCircle className="flex-shrink-0 w-5 h-5 mr-2" />
                    <span className="font-medium">Error!</span> {submissionError}
                  </div>
                </div>
              )}
              {step === 0 && (
                <div className="basic-info-grid">
                  <div className="form-field">
                    <label className="form-label">Level *</label>
                    <select
                      value={formData.level}
                      onChange={(e) => handleInputChange('level', e.target.value)}
                      className={`form-select ${errors.level ? 'form-select--error' : ''}`}
                    >
                      <option value="">Select Level</option>
                      <option value="SSC">SSC</option>
                      <option value="HSC">HSC</option>
                    </select>
                    {errors.level && <p className="error-message">{errors.level}</p>}
                  </div>
                  <div className="form-field">
                    <label className="form-label">Group *</label>
                    <select
                      value={formData.group}
                      onChange={(e) => handleInputChange('group', e.target.value)}
                      className={`form-select ${errors.group ? 'form-select--error' : ''}`}
                    >
                      <option value="">Select Group</option>
                      <option value="science">Science</option>
                      <option value="arts">Arts</option>
                      <option value="commerce">Commerce</option>
                    </select>
                    {errors.group && <p className="error-message">{errors.group}</p>}
                  </div>
                  {isSubjectsLoading && <p className="text-sm text-blue-500 mt-2">Loading subjects...</p>}
                  {subjectsError && <p className="text-sm text-red-500 mt-2">Error: {subjectsError}</p>}
                </div>
              )}
              {step === 1 && (
                <>
                  <div className="basic-info-grid">
                    <div className="form-field">
                      <label className="form-label">Subject *</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className={`form-select ${errors.subject ? 'form-select--error' : ''}`}
                      >
                        <option value="">Select Subject</option>
                        {dynamicSubjects.length > 0 ? (
                          dynamicSubjects.map(subject => (
                            <option key={subject._id} value={subject._id}>
                              {subject.englishName} ({subject.banglaName})
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            {isSubjectsLoading ? 'Loading...' : 'No subjects found'}
                          </option>
                        )}
                      </select>
                      {errors.subject && <p className="error-message">{errors.subject}</p>}
                    </div>
                    <div className="form-field">
                      <label className="form-label">Chapter *</label>
                      <select
                        value={formData.chapter}
                        onChange={(e) => handleInputChange('chapter', e.target.value)}
                        className={`form-select ${errors.chapter ? 'form-select--error' : ''}`}
                        disabled={!formData.subject || dynamicChapters.length === 0}
                      >
                        <option value="">Select Chapter</option>
                        {dynamicChapters.length > 0 ? (
                          dynamicChapters.map(chapter => (
                            <option key={chapter._id} value={chapter._id}>
                              {chapter.englishName} ({chapter.banglaName})
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            {formData.subject ? 'No chapters found' : 'Select a subject first'}
                          </option>
                        )}
                      </select>
                      {errors.chapter && <p className="error-message">{errors.chapter}</p>}
                    </div>
                    <div className="form-field">
                      <label className="form-label">Difficulty *</label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => handleInputChange('difficulty', e.target.value)}
                        className={`form-select ${errors.difficulty ? 'form-select--error' : ''}`}
                      >
                        <option value="">Select Difficulty</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                      {errors.difficulty && <p className="error-message">{errors.difficulty}</p>}
                    </div>
                    <div className="form-field">
                      <label className="form-label">Board *</label>
                      <select
                        value={formData.board}
                        onChange={(e) => handleInputChange('board', e.target.value)}
                        className={`form-select ${errors.board ? 'form-select--error' : ''}`}
                      >
                        <option value="">Select Board</option>
                        <option value="Dhaka">Dhaka</option>
                        <option value="Chittagong">Chittagong</option>
                        <option value="Rajshahi">Rajshahi</option>
                        <option value="Khulna">Khulna</option>
                        <option value="Barishal">Barishal</option>
                        <option value="Sylhet">Sylhet</option>
                        <option value="Rangpur">Rangpur</option>
                        <option value="Mymensingh">Mymensingh</option>
                        <option value="Comilla">Comilla</option>
                        <option value="Dinajpur">Dinajpur</option>
                      </select>
                      {errors.board && <p className="error-message">{errors.board}</p>}
                    </div>
                  </div>
                  <div className="secondary-grid">
                    <div className="form-field">
                      <label className="form-label">Year *</label>
                      <input
                        type="number"
                        min="2000"
                        max="2099"
                        value={formData.year}
                        onChange={(e) => handleInputChange('year', parseInt(e.target.value, 10))}
                        className={`form-input ${errors.year ? 'form-input--error' : ''}`}
                      />
                      {errors.year && <p className="error-message">{errors.year}</p>}
                    </div>
                    <div className="form-field">
                      <label className="form-label">Institution</label>
                      <input
                        type="text"
                        value={formData.institution}
                        onChange={(e) => handleInputChange('institution', e.target.value)}
                        className="form-input"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </>
              )}
             {step === 2 && (
  <>
    <div className="mb-6">
      <button
        type="button"
        onClick={handleOpenImageUploadModal}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Plus size={16} className="mr-2" />
        <span>Add Question using Image</span>
      </button>
      {(englishCqUploadResponse || banglaCqUploadResponse) && (
        <p className="mt-2 text-sm text-green-600">
          Questions (English & Bangla) generated successfully!
        </p>
      )}
    </div>
    <div className="form-field">
      <div className="mt-2 p-3 border border-gray-300 rounded-md bg-gray-50">
        <label className="block text-sm font-medium text-gray-700 mb-1">English Stem Preview (with latex):</label>
        <LatexRenderer latex={(formData?.stem)} />
        {stemImagePreview && (
          <div className="mt-2">
            <img src={stemImagePreview} alt="Stem Preview" className="max-h-40" />
          </div>
        )}
      </div>
      <textarea
        value={formData.stem}
        onChange={(e) => handleInputChange('stem', e.target.value)}
        placeholder="Enter the main question or passage here..."
        className="form-input w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        rows="6"
        id={"stem"}
      />
      {errors.stem && <p className="error-message">{errors.stem}</p>}
     
      <div className="image-upload-container">
        <label className="form-label">Stem Image (Optional)</label>
 {!stemImagePreview && (
        <div className="image-upload-dropzone">
          <div className="image-upload-content">
            <Image className="image-upload-icon" />
            <div className="image-upload-button-wrapper">
              <label className="image-upload-button">
                <Upload className="image-upload-icon-small" />
                <span>Upload Image</span>
                <input type="file" className="image-upload-input" accept="image/*" onChange={(e) => handleImageUpload(e, setStemImage, setStemImagePreview)} />
              </label>
            </div>
            <p className="image-upload-description">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div> 
      )}
       
        {stemImagePreview && (
         <div className="relative inline-block">
  <button 
    className="absolute right-1 top-1 bg-white/80 rounded-full p-1 " 
    onClick={() => clearImagePreview(setStemImage, setStemImagePreview)}
  >
    <X size={16} />
  </button>
  <img src={stemImagePreview} alt="Preview" className="image-preview" />
</div>

        )}
      </div>
    </div>
    <div className="options-section">
      <div className="option-container">
        <label className="form-label">A) Knowledge-based *</label>
        <textarea
          id="a"
          value={formData.a}
          onChange={(e) => handleInputChange('a', e.target.value)}
          placeholder="Enter option A content..."
          className="form-input w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows="4"
        />
        <div className="mt-2 p-2 border border-gray-200 rounded bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-1">Preview A (with Math):</label>
          <LatexRenderer latex={formData.a} />
        </div>
        {errors.a && <p className="error-message">{errors.a}</p>}
        <div className="topic-selection-container">
          <label className="form-label">Topic for Option A *</label>
          <select
            value={formData.aTopic}
            onChange={(e) => handleTopicChange('aTopic', e.target.value)}
            className={`form-select ${errors.aTopic ? 'form-select--error' : ''}`}
            disabled={!formData.chapter || dynamicTopics.length === 0}
          >
            <option value="">Select Topic</option>
            {dynamicTopics.length > 0 ? (
              dynamicTopics.map(topic => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))
            ) : (
              <option value="" disabled>
                {formData.chapter ? 'No topics found' : 'Select a chapter first'}
              </option>
            )}
          </select>
          {errors.aTopic && <p className="error-message">{errors.aTopic}</p>}
        </div>
      </div>
      <div className="option-container">
        <label className="form-label">B) Comprehension *</label>
        <textarea
          id="b"
          value={formData.b}
          onChange={(e) => handleInputChange('b', e.target.value)}
          placeholder="Enter option B content..."
          className="form-input w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows="4"
        />
        <div className="mt-2 p-2 border border-gray-200 rounded bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-1">Preview B (with Math):</label>
          <LatexRenderer latex={formData.b} />
        </div>
        {errors.b && <p className="error-message">{errors.b}</p>}
        <div className="topic-selection-container">
          <label className="form-label">Topic for Option B *</label>
          <select
            value={formData.bTopic}
            onChange={(e) => handleTopicChange('bTopic', e.target.value)}
            className={`form-select ${errors.bTopic ? 'form-select--error' : ''}`}
            disabled={!formData.chapter || dynamicTopics.length === 0}
          >
            <option value="">Select Topic</option>
            {dynamicTopics.length > 0 ? (
              dynamicTopics.map(topic => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))
            ) : (
              <option value="" disabled>
                {formData.chapter ? 'No topics found' : 'Select a chapter first'}
              </option>
            )}
          </select>
          {errors.bTopic && <p className="error-message">{errors.bTopic}</p>}
        </div>
        <div className="topic-selection-container">
          <label className="form-label">Sub-Topic for Option B *</label>
          <select
            value={formData.bSubTopic}
            onChange={(e) => handleTopicChange('bSubTopic', e.target.value)}
            className={`form-select ${errors.bSubTopic ? 'form-select--error' : ''}`}
            disabled={!formData.chapter || subTopicForB.length === 0}
          >
            <option value="">Select Topic</option>
            {subTopicForB.length > 0 ? (
              subTopicForB.map(topic => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))
            ) : (
              <option value="" disabled>
                {formData.chapter ? 'No topics found' : 'Select a chapter first'}
              </option>
            )}
          </select>
          {errors.bSubTopic && <p className="error-message">{errors.bSubTopic}</p>}
        </div>
      </div>
      <div className="option-container">
        <label className="form-label">C) Application *</label>
        <textarea
          id="c"
          value={formData.c}
          onChange={(e) => handleInputChange('c', e.target.value)}
          placeholder="Enter option C content..."
          className="form-input w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows="4"
        />
        <div className="mt-2 p-2 border border-gray-200 rounded bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-1">Preview C (with Math):</label>
          <LatexRenderer latex={formData.c} />
        </div>
        {errors.c && <p className="error-message">{errors.c}</p>}
        <div className="topic-selection-container">
          <label className="form-label">Topic for Option C *</label>
          <select
            value={formData.cTopic}
            onChange={(e) => handleTopicChange('cTopic', e.target.value)}
            className={`form-select ${errors.cTopic ? 'form-select--error' : ''}`}
            disabled={!formData.chapter || dynamicTopics.length === 0}
          >
            <option value="">Select Topic</option>
            {dynamicTopics.length > 0 ? (
              dynamicTopics.map(topic => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))
            ) : (
              <option value="" disabled>
                {formData.chapter ? 'No topics found' : 'Select a chapter first'}
              </option>
            )}
          </select>
          {errors.cTopic && <p className="error-message">{errors.cTopic}</p>}
        </div>
        <div className="topic-selection-container">
          <label className="form-label">Sub-Topic for Option C *</label>
          <select
            value={formData.cSubTopic}
            onChange={(e) => handleTopicChange('cSubTopic', e.target.value)}
            className={`form-select ${errors.cSubTopic ? 'form-select--error' : ''}`}
            disabled={!formData.chapter || subTopicForC.length === 0}
          >
            <option value="">Select Topic</option>
            {subTopicForC.length > 0 ? (
              subTopicForC.map(topic => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))
            ) : (
              <option value="" disabled>
                {formData.chapter ? 'No topics found' : 'Select a chapter first'}
              </option>
            )}
          </select>
          {errors.cSubTopic && <p className="error-message">{errors.cSubTopic}</p>}
        </div>
      </div>
      {/* Conditionally render Option D */}
      {!isMathSubject && (
        <div className="option-container">
          <label className="form-label">D) Higher Order Thinking</label>
          <textarea
            id="d"
            value={formData.d}
            onChange={(e) => handleInputChange('d', e.target.value)}
            placeholder="Enter option D content (optional)..."
            className="form-input w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows="4"
          />
          <div className="mt-2 p-2 border border-gray-200 rounded bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-1">Preview D (with Math):</label>
            <LatexRenderer latex={formData.d} />
          </div>
          {(formData?.d?.trim() || true) && (
            <>
            <div className="topic-selection-container">
              <label className="form-label">Topic for Option D</label>
              <select
                value={formData.dTopic}
                onChange={(e) => handleTopicChange('dTopic', e.target.value)}
                className={`form-select ${errors.dTopic ? 'form-select--error' : ''}`}
                disabled={!formData.chapter || dynamicTopics.length === 0}
              >
                <option value="">Select Topic</option>
                {dynamicTopics.length > 0 ? (
                  dynamicTopics.map(topic => (
                    <option key={topic.value} value={topic.value}>
                      {topic.label}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    {formData.chapter ? 'No topics found' : 'Select a chapter first'}
                  </option>
                )}
              </select>
              {errors.dTopic && <p className="error-message">{errors.dTopic}</p>}
            </div>
              <div className="topic-selection-container">
            <label className="form-label">Sub-Topic for Option D *</label>
            <select
              value={formData.dSubTopic}
              onChange={(e) => handleTopicChange('dSubTopic', e.target.value)}
              className={`form-select ${errors.dSubTopic ? 'form-select--error' : ''}`}
              disabled={!formData.chapter || subTopicForD.length === 0}
            >
              <option value="">Select Topic</option>
              {subTopicForD.length > 0 ? (
                subTopicForD.map(topic => (
                  <option key={topic.value} value={topic.value}>
                    {topic.label}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {formData.chapter ? 'No topics found' : 'Select a chapter first'}
                </option>
              )}
            </select>
            {errors.dSubTopic && <p className="error-message">{errors.dSubTopic}</p>}
          </div>
            </>
          )}
        </div>
      )}
    </div>
  </>
)}
{step === 3 && (
  <>
    <div className="form-field">
      <div className="mt-2 p-3 border border-gray-300 rounded-md bg-gray-50">
        <label className="block text-sm font-medium text-gray-700 mb-1">Bangla Stem Preview (with latex):</label>
        <LatexRenderer latex={(formData?.banglaStem)} />
      </div>
      <textarea
        value={formData.banglaStem}
        onChange={(e) => handleInputChange('banglaStem', e.target.value)}
        placeholder="Enter the main question or passage in Bangla here..."
        className="form-input w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        rows="6"
        id={"banglaStem"}
      />
        <div className="image-upload-container">
        <label className="form-label">Bangla Stem Image (Optional)</label>
 {!banglaStemImagePreview && (
        <div className="image-upload-dropzone">
          <div className="image-upload-content">
            <Image className="image-upload-icon" />
            <div className="image-upload-button-wrapper">
              <label className="image-upload-button">
                <Upload className="image-upload-icon-small" />
                <span>Upload Image</span>
                <input type="file" className="image-upload-input" accept="image/*" onChange={(e) => handleImageUpload(e, setBanglaStemImage, setBanglaStemImagePreview)} />
              </label>
            </div>
            <p className="image-upload-description">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div> 
      )}
       
        {banglaStemImagePreview && (
         <div className="relative inline-block">
  <button 
    className="absolute right-1 top-1 bg-white/80 rounded-full p-1 " 
    onClick={() => clearImagePreview(setBanglaStemImage, setBanglaStemImagePreview)}
  >
    <X size={16} />
  </button>
  <img src={banglaStemImagePreview} alt="Preview" className="image-preview" />
</div>

        )}
      </div>
      {errors.banglaStem && <p className="error-message">{errors.banglaStem}</p>}
    </div>
    <div className="options-section">
      <div className="option-container">
        <label className="form-label">A) Knowledge-based (Bangla) *</label>
        <textarea
          id="banglaA"
          value={formData.banglaA}
          onChange={(e) => handleInputChange('banglaA', e.target.value)}
          placeholder="Enter option A content in Bangla..."
          className="form-input w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows="4"
        />
        <div className="mt-2 p-2 border border-gray-200 rounded bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-1">Preview A (Bangla, with Math):</label>
          <LatexRenderer latex={formData.banglaA} />
        </div>
        {errors.banglaA && <p className="error-message">{errors.banglaA}</p>}
        <div className="topic-selection-container">
          <label className="form-label">Topic for Option A *</label>
          <select
            value={formData.aTopic}
            onChange={(e) => handleTopicChange('aTopic', e.target.value)}
            className={`form-select ${errors.aTopic ? 'form-select--error' : ''}`}
            disabled={!formData.chapter || dynamicTopics.length === 0}
          >
            <option value="">Select Topic</option>
            {dynamicTopics.length > 0 ? (
              dynamicTopics.map(topic => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))
            ) : (
              <option value="" disabled>
                {formData.chapter ? 'No topics found' : 'Select a chapter first'}
              </option>
            )}
          </select>
          {errors.aTopic && <p className="error-message">{errors.aTopic}</p>}
        </div>
      </div>
      <div className="option-container">
        <label className="form-label">B) Comprehension (Bangla) *</label>
        <textarea
          id="banglaB"
          value={formData.banglaB}
          onChange={(e) => handleInputChange('banglaB', e.target.value)}
          placeholder="Enter option B content in Bangla..."
          className="form-input w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows="4"
        />
        <div className="mt-2 p-2 border border-gray-200 rounded bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-1">Preview B (Bangla, with Math):</label>
          <LatexRenderer latex={formData.banglaB} />
        </div>
        {errors.banglaB && <p className="error-message">{errors.banglaB}</p>}
        <div className="topic-selection-container">
          <label className="form-label">Topic for Option B *</label>
          <select
            value={formData.bTopic}
            onChange={(e) => handleTopicChange('bTopic', e.target.value)}
            className={`form-select ${errors.bTopic ? 'form-select--error' : ''}`}
            disabled={!formData.chapter || dynamicTopics.length === 0}
          >
            <option value="">Select Topic</option>
            {dynamicTopics.length > 0 ? (
              dynamicTopics.map(topic => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))
            ) : (
              <option value="" disabled>
                {formData.chapter ? 'No topics found' : 'Select a chapter first'}
              </option>
            )}
          </select>
          {errors.bTopic && <p className="error-message">{errors.bTopic}</p>}
        </div>
        <div className="topic-selection-container">
          <label className="form-label">Sub-Topic for Option B *</label>
          <select
            value={formData.bSubTopic}
            onChange={(e) => handleTopicChange('bSubTopic', e.target.value)}
            className={`form-select ${errors.bSubTopic ? 'form-select--error' : ''}`}
            disabled={!formData.chapter || subTopicForB.length === 0}
          >
            <option value="">Select Topic</option>
            {subTopicForB.length > 0 ? (
              subTopicForB.map(topic => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))
            ) : (
              <option value="" disabled>
                {formData.chapter ? 'No topics found' : 'Select a chapter first'}
              </option>
            )}
          </select>
          {errors.bSubTopic && <p className="error-message">{errors.bSubTopic}</p>}
        </div>
      </div>
      <div className="option-container">
        <label className="form-label">C) Application (Bangla) *</label>
        <textarea
          id="banglaC"
          value={formData.banglaC}
          onChange={(e) => handleInputChange('banglaC', e.target.value)}
          placeholder="Enter option C content in Bangla..."
          className="form-input w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows="4"
        />
        <div className="mt-2 p-2 border border-gray-200 rounded bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-1">Preview C (Bangla, with Math):</label>
          <LatexRenderer latex={formData.banglaC} />
        </div>
        {errors.banglaC && <p className="error-message">{errors.banglaC}</p>}
        <div className="topic-selection-container">
          <label className="form-label">Topic for Option C *</label>
          <select
            value={formData.cTopic}
            onChange={(e) => handleTopicChange('cTopic', e.target.value)}
            className={`form-select ${errors.cTopic ? 'form-select--error' : ''}`}
            disabled={!formData.chapter || dynamicTopics.length === 0}
          >
            <option value="">Select Topic</option>
            {dynamicTopics.length > 0 ? (
              dynamicTopics.map(topic => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))
            ) : (
              <option value="" disabled>
                {formData.chapter ? 'No topics found' : 'Select a chapter first'}
              </option>
            )}
          </select>
          {errors.cTopic && <p className="error-message">{errors.cTopic}</p>}
        </div>
        <div className="topic-selection-container">
          <label className="form-label">Sub-Topic for Option C *</label>
          <select
            value={formData.cSubTopic}
            onChange={(e) => handleTopicChange('cSubTopic', e.target.value)}
            className={`form-select ${errors.cSubTopic ? 'form-select--error' : ''}`}
            disabled={!formData.chapter || subTopicForC.length === 0}
          >
            <option value="">Select Topic</option>
            {subTopicForC.length > 0 ? (
              subTopicForC.map(topic => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))
            ) : (
              <option value="" disabled>
                {formData.chapter ? 'No topics found' : 'Select a chapter first'}
              </option>
            )}
          </select>
          {errors.cSubTopic && <p className="error-message">{errors.cSubTopic}</p>}
        </div>
      </div>
      {/* Conditionally render Option D */}
      {!isMathSubject && (
        <div className="option-container">
          <label className="form-label">D) Higher Order Thinking (Bangla)</label>
           <div className="mt-2 p-2 border border-gray-400 rounded bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-1">Preview D (Bangla, with Math):</label>
            <LatexRenderer latex={formData.banglaD} />
          </div>
          <textarea
            id="banglaD"
            value={formData.banglaD}
            onChange={(e) => handleInputChange('banglaD', e.target.value)}
            placeholder="Enter option D content in Bangla (optional)..."
            className="form-input w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows="4"
          />
         
          {(formData?.d?.trim() || formData?.banglaD?.trim() || true) && (
            <>
            <div className="topic-selection-container">
              <label className="form-label">Topic for Option D</label>
              <select
                value={formData.dTopic}
                onChange={(e) => handleTopicChange('dTopic', e.target.value)}
                className={`form-select ${errors.dTopic ? 'form-select--error' : ''}`}
                disabled={!formData.chapter || dynamicTopics.length === 0}
              >
                <option value="">Select Topic</option>
                {dynamicTopics.length > 0 ? (
                  dynamicTopics.map(topic => (
                    <option key={topic.value} value={topic.value}>
                      {topic.label}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    {formData.chapter ? 'No topics found' : 'Select a chapter first'}
                  </option>
                )}
              </select>
              {errors.dTopic && <p className="error-message">{errors.dTopic}</p>}
            </div>
            <div className="topic-selection-container">
              <label className="form-label">Sub-Topic for Option D *</label>
              <select
                value={formData.dSubTopic}
                onChange={(e) => handleTopicChange('dSubTopic', e.target.value)}
                className={`form-select ${errors.dSubTopic ? 'form-select--error' : ''}`}
                disabled={!formData.chapter || subTopicForD.length === 0}
              >
                <option value="">Select Topic</option>
                {subTopicForD.length > 0 ? (
                  subTopicForD.map(topic => (
                    <option key={topic.value} value={topic.value}>
                      {topic.label}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    {formData.chapter ? 'No topics found' : 'Select a chapter first'}
                  </option>
                )}
              </select>
              {errors.dSubTopic && <p className="error-message">{errors.dSubTopic}</p>}
            </div>
            </>
          )}
        </div>
      )}
    </div>
  </>
)}
{step === 4 && (
  <div className="answers-section">
    <div className="mb-6">
      <button
        type="button"
        onClick={handleOpenAnswerUploadModal}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Plus size={16} className="mr-2" />
        <span>Add Answer using Image</span>
      </button>
      {(englishAnswerUploadResponse || banglaAnswerUploadResponse) && (
        <p className="mt-2 text-sm text-green-600">
          Answers (English & Bangla) generated successfully!
        </p>
      )}
    </div>
    <div className="answers-grid">
      <div className="answer-container">
        <label className="form-label">Answer for Option A (Knowledge-based) *</label>
         <div className="mt-2 p-2 border border-gray-400 rounded bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-1">Preview Answer A (with Math):</label>
          <LatexRenderer latex={formData.aAnswer} />
        </div>
        <textarea
          id="aAnswer"
          value={formData.aAnswer}
          onChange={(e) => handleInputChange('aAnswer', e.target.value)}
          placeholder="Enter the answer for option A..."
          className="form-input w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows="4"
        />
       
        {errors.aAnswer && <p className="error-message">{errors.aAnswer}</p>}
      </div>
      <div className="answer-container">
        <label className="form-label">Answer for Option B (Comprehension) *</label>
  <div className="mt-2 p-2 border border-gray-400 rounded bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-1">Preview Answer B (with Math):</label>
          <LatexRenderer latex={formData.bAnswer} />
        </div>
        <textarea
          id="bAnswer"
          value={formData.bAnswer}
          onChange={(e) => handleInputChange('bAnswer', e.target.value)}
          placeholder="Enter the answer for option B..."
          className="form-input w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows="4"
        />
      
        {errors.bAnswer && <p className="error-message">{errors.bAnswer}</p>}
      </div>
      <div className="answer-container">
        <label className="form-label">Answer for Option C (Application) *</label>
         <div className="mt-2 p-2 border border-gray-400 rounded bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-1">Preview Answer C (with Math):</label>
          <LatexRenderer latex={formData.cAnswer} />
        </div>
        <textarea
          id="cAnswer"
          value={formData.cAnswer}
          onChange={(e) => handleInputChange('cAnswer', e.target.value)}
          placeholder="Enter the answer for option C..."
          className="form-input w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows="4"
        />
       
         <div className="image-upload-container">
        <label className="form-label">C answer Image (Optional)</label>
 {!cAnswerImagePreview && (
        <div className="image-upload-dropzone">
          <div className="image-upload-content">
            <Image className="image-upload-icon" />
            <div className="image-upload-button-wrapper">
              <label className="image-upload-button">
                <Upload className="image-upload-icon-small" />
                <span>Upload Image</span>
                <input type="file" className="image-upload-input" accept="image/*" onChange={(e) => handleImageUpload(e, setCAnswerImage, setCAnswerImagePreview)} />
              </label>
            </div>
            <p className="image-upload-description">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div> 
      )}
       
        {cAnswerImagePreview && (
         <div className="relative inline-block">
  <button 
    className="absolute right-1 top-1 bg-white/80 rounded-full p-1 " 
    onClick={() => clearImagePreview(setCAnswerImage, setCAnswerImagePreview)}
  >
    <X size={16} />
  </button>
  <img src={cAnswerImagePreview} alt="Preview" className="image-preview" />
</div>

        )}
      </div>
        {errors.cAnswer && <p className="error-message">{errors.cAnswer}</p>}
      </div>
      {/* Conditionally render Answer D */}
      {!isMathSubject && (
        <div className="answer-container">
          <label className="form-label">Answer for Option D (Higher Order Thinking) *</label>
           <div className="mt-2 p-2 border border-gray-200 rounded bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-1">Preview Answer D (with Math):</label>
            <LatexRenderer latex={formData.dAnswer} />
          </div>
          <textarea
            id="dAnswer"
            value={formData.dAnswer}
            onChange={(e) => handleInputChange('dAnswer', e.target.value)}
            placeholder="Enter the answer for option D..."
            className="form-input w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows="4"
          />
         
           <div className="image-upload-container">
        <label className="form-label">D Answer Image (Optional)</label>
 {!dAnswerImagePreview && (
        <div className="image-upload-dropzone">
          <div className="image-upload-content">
            <Image className="image-upload-icon" />
            <div className="image-upload-button-wrapper">
              <label className="image-upload-button">
                <Upload className="image-upload-icon-small" />
                <span>Upload Image</span>
                <input type="file" className="image-upload-input" accept="image/*" onChange={(e) => handleImageUpload(e, setDAnswerImage, setDAnswerImagePreview)} />
              </label>
            </div>
            <p className="image-upload-description">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div> 
      )}
       
        {dAnswerImagePreview && (
         <div className="relative inline-block">
  <button 
    className="absolute right-1 top-1 bg-white/80 rounded-full p-1 " 
    onClick={() => clearImagePreview(setDAnswerImage, setDAnswerImagePreview)}
  >
    <X size={16} />
  </button>
  <img src={dAnswerImagePreview} alt="Preview" className="image-preview" />
</div>

        )}
      </div>
          {errors.dAnswer && <p className="error-message">{errors.dAnswer}</p>}
        </div>
      )}
    </div>
  </div>
)}
{step === 5 && (
  <div className="answers-section">
    <div className="answers-grid">
      <div className="answer-container">
        <label className="form-label">Answer for Option A (Knowledge-based, Bangla) *</label>
        <textarea
          id="banglaAAnswer"
          value={formData.banglaAAnswer}
          onChange={(e) => handleInputChange('banglaAAnswer', e.target.value)}
          placeholder="Enter the answer for option A in Bangla..."
          className="form-input w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows="4"
        />
        <div className="mt-2 p-2 border border-gray-200 rounded bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-1">Preview Answer A (Bangla, with Math):</label>
          <LatexRenderer latex={formData.banglaAAnswer} />
        </div>
        {errors.banglaAAnswer && <p className="error-message">{errors.banglaAAnswer}</p>}
      </div>
      <div className="answer-container">
        <label className="form-label">Answer for Option B (Comprehension, Bangla) *</label>
        <textarea
          id="banglaBAnswer"
          value={formData.banglaBAnswer}
          onChange={(e) => handleInputChange('banglaBAnswer', e.target.value)}
          placeholder="Enter the answer for option B in Bangla..."
          className="form-input w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows="4"
        />
        <div className="mt-2 p-2 border border-gray-200 rounded bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-1">Preview Answer B (Bangla, with Math):</label>
          <LatexRenderer latex={formData.banglaBAnswer} />
        </div>
        {errors.banglaBAnswer && <p className="error-message">{errors.banglaBAnswer}</p>}
      </div>
      <div className="answer-container">
        <label className="form-label">Answer for Option C (Application, Bangla) *</label>
         <div className="mt-2 p-2 border border-gray-400 rounded bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-1">Preview Answer C (Bangla, with Math):</label>
          <LatexRenderer latex={formData.banglaCAnswer} />
        </div>
        <textarea
          id="banglaCAnswer"
          value={formData.banglaCAnswer}
          onChange={(e) => handleInputChange('banglaCAnswer', e.target.value)}
          placeholder="Enter the answer for option C in Bangla..."
          className="form-input w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows="4"
        />
       
         <div className="image-upload-container">
        <label className="form-label">Bangla C Answer Image (Optional)</label>
 {!cAnswerImageBanglaPreview && (
        <div className="image-upload-dropzone">
          <div className="image-upload-content">
            <Image className="image-upload-icon" />
            <div className="image-upload-button-wrapper">
              <label className="image-upload-button">
                <Upload className="image-upload-icon-small" />
                <span>Upload Image</span>
                <input type="file" className="image-upload-input" accept="image/*" onChange={(e) => handleImageUpload(e, setCAnswerImageBangla, setCAnswerImageBanglaPreview)} />
              </label>
            </div>
            <p className="image-upload-description">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div> 
      )}
       
        {cAnswerImageBanglaPreview && (
         <div className="relative inline-block">
  <button 
    className="absolute right-1 top-1 bg-white/80 rounded-full p-1 " 
    onClick={() => clearImagePreview(setCAnswerImageBangla, setCAnswerImageBanglaPreview)}
  >
    <X size={16} />
  </button>
  <img src={cAnswerImageBanglaPreview} alt="Preview" className="image-preview" />
</div>

        )}
      </div>
        {errors.banglaCAnswer && <p className="error-message">{errors.banglaCAnswer}</p>}
      </div>
      {/* Conditionally render Answer D */}
      {!isMathSubject && (
        <div className="answer-container">
          <label className="form-label">Answer for Option D (Higher Order Thinking, Bangla) *</label>
          <textarea
            id="banglaDAnswer"
            value={formData.banglaDAnswer}
            onChange={(e) => handleInputChange('banglaDAnswer', e.target.value)}
            placeholder="Enter the answer for option D in Bangla..."
            className="form-input w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows="4"
          />
          <div className="mt-2 p-2 border border-gray-200 rounded bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-1">Preview Answer D (Bangla, with Math):</label>
            <LatexRenderer latex={formData.banglaDAnswer} />
          </div>
           <div className="image-upload-container">
        <label className="form-label">Bangla D Image (Optional)</label>
 {!stemImagePreview && (
        <div className="image-upload-dropzone">
          <div className="image-upload-content">
            <Image className="image-upload-icon" />
            <div className="image-upload-button-wrapper">
              <label className="image-upload-button">
                <Upload className="image-upload-icon-small" />
                <span>Upload Image</span>
                <input type="file" className="image-upload-input" accept="image/*" onChange={(e) => handleImageUpload(e, setDAnswerImageBangla, setDAnswerImageBanglaPreview)} />
              </label>
            </div>
            <p className="image-upload-description">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div> 
      )}
       
        {dAnswerImageBanglaPreview && (
         <div className="relative inline-block">
  <button 
    className="absolute right-1 top-1 bg-white/80 rounded-full p-1 " 
    onClick={() => clearImagePreview(setDAnswerImageBangla, setDAnswerImageBanglaPreview)}
  >
    <X size={16} />
  </button>
  <img src={dAnswerImageBanglaPreview} alt="Preview" className="image-preview" />
</div>

        )}
      </div>
          {errors.banglaDAnswer && <p className="error-message">{errors.banglaDAnswer}</p>}
        </div>
      )}
    </div>
  </div>
)}
<div className="buttons">
  {step > 0 && (
    <button className='prev-btn' onClick={handlePrev}>Previous</button>
  )}
  <div></div>
  {step === 5 ? (
    <button
      className={`submit-btn ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleSubmit}
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Submitting...' : 'Submit'}
    </button>
  ) : (
    <button
      className={`next-btn `}
      onClick={handleNext}
    >
      Next
    </button>
  )}
</div>
            </div>
            <div className="action-bar">
              <button
                type="button"
                onClick={resetForm}
                className="reset-btn"
              >
                <RotateCcw className="button-icon" />
                <span>Reset Full</span>
              </button>
              {/* <button
                type="button"
                className="draft-btn"
              >
                <Save className="button-icon" />
                <span>Save as draft</span>
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AddCreativeQuestionPage;
