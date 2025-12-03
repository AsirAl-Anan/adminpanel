"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "../../config/axios.js"
import { useNavigate, useSearchParams } from "react-router-dom"
import { showSuccessToast, showErrorToast, showWarningToast } from "../../../lib/toast"
import { v4 as uuidv4 } from 'uuid';
import {
  RotateCcw,
  BookOpen,
  ArrowLeft,
  Loader2
} from "lucide-react"
import "katex/dist/katex.min.css"

import { FormCard, Stepper, MobileStepper } from "./AddCqComponents/UIComponents"
import { Step1BasicInfo } from "./AddCqComponents/Step1BasicInfo"
import { Step2Context } from "./AddCqComponents/Step2Context"
import { Step3QuestionDetails } from "./AddCqComponents/Step3QuestionDetails"
import { Step4AnswerDetails } from "./AddCqComponents/Step4AnswerDetails"
import { Step5Metadata } from "./AddCqComponents/Step5Metadata"
import { StatusModal } from "./AddCqComponents/StatusModal"

// --- Main Page Component ---

const createInitialPartState = (marks) => ({
  question: [{ id: uuidv4(), text: { en: "", bn: "" }, order: 1, images: [] }],
  answer: [{ id: uuidv4(), text: { en: "", bn: "" }, order: 1, images: [] }],
  marks,
  chapter: "",
  topics: [],
  types: [],
});

const createInitialState = () => ({
  meta: {
    level: "",
    group: "",
    subject: { _id: "", name: "" },
    mainChapter: { _id: "", name: "" },
    aliases: { en: [], bn: [], banglish: [] },
    tags: { en: [], bn: [] },
  },
  source: {
    source: {
      sourceType: "BOARD",
      value: ""
    },
    year: new Date().getFullYear(),
    examType: "",
  },
  stem: [{ id: uuidv4(), text: { en: "", bn: "" }, order: 1, images: [] }],
  a: createInitialPartState(1),
  b: createInitialPartState(2),
  c: createInitialPartState(3),
  d: createInitialPartState(4),
});

const AddCqPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(createInitialState());
  const [errors, setErrors] = useState({});

  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(false);
  const [isChaptersLoading, setIsChaptersLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  // Track completed steps for navigation
  const [completedSteps, setCompletedSteps] = useState([]);

  // Status modal state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Pending subject ID from URL params
  const [pendingSubjectId, setPendingSubjectId] = useState(null);

  // Initialize from URL params
  useEffect(() => {
    const subjectId = searchParams.get("subject");
    const level = searchParams.get("level");
    const group = searchParams.get("group");

    if (level && group) {
      setFormData(prev => ({
        ...prev,
        meta: {
          ...prev.meta,
          level: level,
          group: group
        }
      }));

      if (subjectId) {
        setPendingSubjectId(subjectId);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (formData.meta.level && formData.meta.group) {
        setIsSubjectsLoading(true);
        setSubjects([]);
        setChapters([]);
        setFormData(prev => ({ ...prev, meta: { ...prev.meta, subject: { _id: "" }, mainChapter: { _id: "" } } }));
        try {
          const res = await axios.get(`/subject/subjects/filter`, {
            params: { level: formData.meta.level, group: formData.meta.group },
          });
          console.log(res.data);
          setSubjects(res.data || []);
        } catch (err) {
          console.log(err);
          showErrorToast("Failed to fetch subjects.");
        } finally {
          setIsSubjectsLoading(false);
        }
      }
    };
    fetchSubjects();
  }, [formData.meta.level, formData.meta.group]);

  // Apply pending subject when subjects are loaded
  useEffect(() => {
    if (pendingSubjectId && subjects.length > 0) {
      const subject = subjects.find(s => s._id === pendingSubjectId);
      if (subject) {
        setFormData(prev => ({
          ...prev,
          meta: {
            ...prev.meta,
            subject: { _id: subject._id, name: subject.name?.en || '' }
          }
        }));
        setPendingSubjectId(null); // Clear pending after applying
      }
    }
  }, [subjects, pendingSubjectId]);

  useEffect(() => {
    const fetchChapters = async () => {
      if (formData.meta.subject._id) {
        setIsChaptersLoading(true);
        setChapters([]);
        setFormData(prev => ({ ...prev, meta: { ...prev.meta, mainChapter: { _id: "" } } }));
        try {
          const res = await axios.get(`/subject/subjects/${formData.meta.subject._id}/chapters`);
          setChapters(res.data || []);
        } catch (err) {
          showErrorToast("Failed to fetch chapters.");
        } finally {
          setIsChaptersLoading(false);
        }
      }
    };
    fetchChapters();
  }, [formData.meta.subject._id]);

  const handleMetaChange = (field, value) => {
    setFormData(prev => ({ ...prev, meta: { ...prev.meta, [field]: value } }));
  };

  const handleSubjectChange = (subjectId) => {
    const subject = subjects.find(s => s._id === subjectId);
    setFormData(prev => ({ ...prev, meta: { ...prev.meta, subject: { _id: subjectId, name: subject?.name?.en || '' } } }));
  }

  const handleMainChapterChange = (chapterId) => {
    const chapter = chapters.find(c => c._id === chapterId);
    setFormData(prev => ({ ...prev, meta: { ...prev.meta, mainChapter: { _id: chapterId, name: chapter?.name?.en || '' } } }));
  }

  const handleSourceChange = (field, value) => {
    setFormData(prev => {
      const newSource = { ...prev.source };
      if (field === 'sourceType' || field === 'value') {
        newSource.source = { ...newSource.source, [field]: value };
        if (field === 'sourceType') {
          newSource.source.value = "";
          newSource.examType = "";
        }
      } else {
        newSource[field] = value;
      }
      return { ...prev, source: newSource };
    });
  };

  const handleStemBlocksChange = (newBlocks) => {
    setFormData(prev => ({ ...prev, stem: newBlocks }));
  };

  const handlePartChange = useCallback((partKey, field, value) => {
    setFormData(prev => {
      const newFormData = { ...prev };
      const part = { ...newFormData[partKey] };
      part[field] = value;
      newFormData[partKey] = part;
      return newFormData;
    });
  }, []);

  const handleAliasChange = (lang, value) => {
    setFormData(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        aliases: { ...prev.meta.aliases, [lang]: value }
      }
    }));
  };

  const handleTagsChange = (lang, value) => {
    setFormData(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        tags: { ...prev.meta.tags, [lang]: value }
      }
    }));
  }

  const validateBlocks = (blocks) => {
    const blockErrors = {};
    let isValid = true;

    blocks.forEach((block, index) => {
      const errorsForBlock = {};
      if (!block.text.en?.trim()) errorsForBlock.en = true;
      if (!block.text.bn?.trim()) errorsForBlock.bn = true;

      if (Object.keys(errorsForBlock).length > 0) {
        blockErrors[index] = errorsForBlock;
        isValid = false;
      }
    });

    return { isValid, blockErrors };
  };

  const validateStep = (stepIndex = step) => {
    const newErrors = {};
    switch (stepIndex) {
      case 0:
        if (!formData.meta.level) newErrors.level = "Level is required.";
        if (!formData.meta.group) newErrors.group = "Group is required.";
        break;
      case 1:
        if (!formData.meta.subject._id) newErrors.subject = "Subject is required.";
        if (!formData.meta.mainChapter._id) newErrors.mainChapter = "Main chapter is required.";
        if (!formData.source.year) newErrors.year = "Year is required.";
        if (!formData.source.source.value) newErrors.sourceValue = "Source value is required.";
        if (formData.source.source.sourceType === 'INSTITUTION' && !formData.source.examType) newErrors.examType = "Exam Type is required.";
        break;
      case 2:
        const stemValidation = validateBlocks(formData.stem);
        if (!stemValidation.isValid) {
          newErrors.stem_blocks = stemValidation.blockErrors;
          newErrors.stem = "Please fill in all language fields for Stem.";
        }

        ['a', 'b', 'c', 'd'].forEach(p => {
          const partValidation = validateBlocks(formData[p].question);
          if (!partValidation.isValid) {
            newErrors[`${p}_question_blocks`] = partValidation.blockErrors;
            newErrors[`${p}_question`] = "Missing text in English or Bangla.";
          }

          if (!formData[p].chapter) newErrors[`${p}_chapter`] = `Chapter is required.`;

        });
        break;
      case 3:
        ['a', 'b', 'c', 'd'].forEach(p => {
          const answerValidation = validateBlocks(formData[p].answer);
          if (!answerValidation.isValid) {
            newErrors[`${p}_answer_blocks`] = answerValidation.blockErrors;
            newErrors[`${p}_answer`] = `Missing answer text in English or Bangla.`;
          }
        });
        break;
      case 4:
        if (formData.meta.aliases.en.length === 0 || formData.meta.aliases.bn.length === 0 || formData.meta.aliases.banglish.length === 0) newErrors.aliases = "All alias fields are required.";
        break;
    }

    // Only update state if we are validating the current step
    if (stepIndex === step) {
      setErrors(newErrors);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setCompletedSteps(prev => [...new Set([...prev, step])]);

      // If moving to the last step (Metadata), disable submit button temporarily
      if (step === steps.length - 2) {
        setIsSubmitDisabled(true);
        setTimeout(() => setIsSubmitDisabled(false), 1000);
      }

      setStep(s => s + 1);
      window.scrollTo(0, 0);
    } else {
      showWarningToast("Please fix the errors before proceeding.");
    }
  };

  const handlePrev = () => {
    setStep(s => s - 1);
    window.scrollTo(0, 0);
  }

  const handleStepClick = (targetStep) => {
    // Allow moving back always
    if (targetStep < step) {
      setStep(targetStep);
      return;
    }

    // Moving forward: check if all intermediate steps are valid
    let canMove = true;
    for (let i = 0; i < targetStep; i++) {
      if (!validateStep(i)) {
        canMove = false;
        break;
      }
    }

    if (canMove) {
      // If moving to the last step (Metadata), disable submit button temporarily
      if (targetStep === steps.length - 1) {
        setIsSubmitDisabled(true);
        setTimeout(() => setIsSubmitDisabled(false), 1000);
      }
      setStep(targetStep);
    } else {
      showWarningToast("Please complete previous steps first.");
    }
  }

  const handleSubmitClick = (e) => {
    e.preventDefault();
    if (!validateStep(step)) {
      showErrorToast("Please correct the errors before submitting.");
      return;
    }
    // Open the status modal
    setIsStatusModalOpen(true);
  };

  const handleStatusSelect = async (status) => {
    setIsSubmitting(true);
    try {
      const sanitizedData = { ...formData, status };
      const ensureOrder = (arr) => arr.map((item, idx) => ({ ...item, order: idx + 1 }));

      sanitizedData.stem = ensureOrder(sanitizedData.stem);
      ['a', 'b', 'c', 'd'].forEach(part => {
        sanitizedData[part].question = ensureOrder(sanitizedData[part].question);
        sanitizedData[part].answer = ensureOrder(sanitizedData[part].answer);
      });

      const res = await axios.post("/qb", sanitizedData);
      showSuccessToast(`Creative question ${status === 'DRAFT' ? 'saved as draft' : 'published'} successfully!`);
      navigate(-1);
    } catch (error) {
      showErrorToast(error.response?.data?.message || "Failed to add question.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setIsStatusModalOpen(false);
    }
  };

  const resetForm = () => {
    if (window.confirm("Are you sure you want to reset all data?")) {
      setFormData(createInitialState());
      setStep(0);
      setErrors({});
      setSubjects([]);
      setChapters([]);
      setCompletedSteps([]);
      window.scrollTo(0, 0);
    }
  }

  const steps = ["Basic Info", "Context", "Question Details", "Answer Details", "Metadata"];

  return (
    <div className="min-h-screen bg-slate-50/80">
      <div className="max-w-7xl mx-auto py-4 px-2 sm:py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between py-4">
          <div>
            <button onClick={() => navigate(-1)} className="group  inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-2">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1 hover:text-underline" /> Back to List
            </button>
            <h1 className="text-lg lg:text-xl font-extrabold text-slate-900 flex items-center tracking-tight">
              <span className="bg-blue-600 text-white p-2 rounded-lg mr-3 shadow-lg shadow-blue-200">
                <BookOpen className="w-6 h-6" />
              </span>
              Add Creative Question
            </h1>
          </div>
          <div className="mt-4 sm:mt-0 text-sm text-slate-500 bg-white px-4 py-2 rounded-full border shadow-sm">
            Current Board: <span className="font-bold text-slate-800">Dhaka/Technical</span>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          {/* Sidebar Stepper - Desktop Only */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-8">
              <Stepper
                currentStep={step}
                steps={steps}
                onStepClick={handleStepClick}
                completedSteps={completedSteps}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            {/* Mobile Stepper - Mobile Only */}
            <div className="lg:hidden">
              <MobileStepper
                currentStep={step}
                totalSteps={steps.length}
                onStepClick={handleStepClick}
                completedSteps={completedSteps}
              />
            </div>

            <form onSubmit={handleSubmitClick} className="space-y-6 animate-in fade-in duration-500">
              <FormCard title={steps[step]}>
                {step === 0 && <Step1BasicInfo
                  formData={formData}
                  handleMetaChange={handleMetaChange}
                  errors={errors}
                  isDisabled={!!searchParams.get("level") && !!searchParams.get("group")}
                />}
                {step === 1 && <Step2Context
                  formData={formData}
                  handleSubjectChange={handleSubjectChange}
                  handleMainChapterChange={handleMainChapterChange}
                  handleSourceChange={handleSourceChange}
                  subjects={subjects}
                  chapters={chapters}
                  isSubjectsLoading={isSubjectsLoading}
                  isChaptersLoading={isChaptersLoading}
                  errors={errors}
                  isSubjectDisabled={!!searchParams.get("subject")}
                />}
                {step === 2 && <Step3QuestionDetails
                  formData={formData}
                  handleStemBlocksChange={handleStemBlocksChange}
                  handlePartChange={handlePartChange}
                  chapters={chapters}
                  errors={errors}
                />}
                {step === 3 && <Step4AnswerDetails formData={formData} handlePartChange={handlePartChange} errors={errors} />}
                {step === 4 && <Step5Metadata formData={formData} handleAliasChange={handleAliasChange} handleTagsChange={handleTagsChange} errors={errors} />}

                {/* Footer Actions */}
                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-slate-100 mt-8 gap-4 sm:gap-0">
                  <button type="button" onClick={resetForm} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-red-600 transition-colors">
                    <RotateCcw className="w-4 h-4 mr-2" /> Reset
                  </button>
                  <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                    {step > 0 && (
                      <button type="button" onClick={handlePrev} className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 hover:border-slate-400 transition-all">
                        Previous
                      </button>
                    )}
                    {step === steps.length - 1 ? (
                      <button type="submit" disabled={isSubmitting || isSubmitDisabled} className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 sm:px-8 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:bg-blue-400 transition-all transform hover:-translate-y-0.5">
                        {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Submit Question"}
                      </button>
                    ) : (
                      <button type="button" onClick={handleNext} className="flex-1 sm:flex-none inline-flex justify-center px-6 sm:px-8 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5">
                        Next Step
                      </button>
                    )}
                  </div>
                </div>
              </FormCard>
            </form>
          </main>
        </div>
      </div>

      {/* Status Modal */}
      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSelectStatus={handleStatusSelect}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

export default AddCqPage;