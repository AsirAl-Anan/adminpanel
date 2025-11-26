import React, { useState, useEffect } from "react"
import axios from "../../../config/axios.js"
import { showErrorToast, showWarningToast } from "../../../../lib/toast"
import { Loader2, Check } from "lucide-react"
import { ContentBlockManager } from "./ContentBlockManager"
import { FormField, StyledSelect } from "./UIComponents"

export const QuestionPartForm = ({ partKey, partData, onPartChange, allChapters, marks, errors }) => {
    const [topics, setTopics] = useState([]);
    const [isLoadingTopics, setIsLoadingTopics] = useState(false);
    const [availableQuestionTypes, setAvailableQuestionTypes] = useState([]);
    const [isLoadingQuestionTypes, setIsLoadingQuestionTypes] = useState(false);
    const [tempSelectedTopics, setTempSelectedTopics] = useState(new Set(partData.topics.map(t => t.topicId)));

    const handleChapterChange = async (chapterId) => {
        onPartChange(partKey, "chapter", chapterId);
        onPartChange(partKey, "topics", []);
        onPartChange(partKey, "types", []);
        setTopics([]);
        setAvailableQuestionTypes([]);
        setTempSelectedTopics(new Set());

        if (!chapterId) return;
        setIsLoadingTopics(true);
        try {
            const response = await axios.get(`/subject/chapters/${chapterId}/topics`);
            setTopics(response.data || []);
        } catch (error) {
            showErrorToast(`Failed to load topics for chapter.`);
            console.error(error);
        } finally {
            setIsLoadingTopics(false);
        }
    };

    const handleTempTopicChange = (topicId, isSelected) => {
        setTempSelectedTopics(prev => {
            const newSet = new Set(prev);
            if (isSelected) newSet.add(topicId);
            else newSet.delete(topicId);
            return newSet;
        });
    };

    const handleConfirmTopics = async () => {
        if (tempSelectedTopics.size === 0) {
            showWarningToast("Please select at least one topic.");
            return;
        }

        const newTopicObjects = Array.from(tempSelectedTopics).map(id => ({ topicId: id, weight: 1 }));
        onPartChange(partKey, "topics", newTopicObjects);
        onPartChange(partKey, "types", []);

        fetchQuestionTypes(tempSelectedTopics);
    };

    const fetchQuestionTypes = async (selectedTopicsSet) => {
        setIsLoadingQuestionTypes(true);
        setAvailableQuestionTypes([]);
        try {
            const promises = Array.from(selectedTopicsSet).map(topicId =>
                axios.get(`/subject/topics/${topicId}/question-types`)
            );
            const responses = await Promise.all(promises);
            const allQuestionTypes = responses.flatMap(res => res.data || []);
            const uniqueQuestionTypes = allQuestionTypes.filter((qt, index, self) =>
                index === self.findIndex((t) => t._id === qt._id)
            );
            setAvailableQuestionTypes(uniqueQuestionTypes);
        } catch (error) {
            showErrorToast("Failed to load question types.");
            console.error(error);
        } finally {
            setIsLoadingQuestionTypes(false);
        }
    }

    // Fetch topics on mount if chapter is selected
    useEffect(() => {
        if (partData.chapter && topics.length === 0) {
            const fetchTopics = async () => {
                setIsLoadingTopics(true);
                try {
                    const response = await axios.get(`/subject/chapters/${partData.chapter}/topics`);
                    setTopics(response.data || []);
                } catch (error) {
                    console.error("Failed to load topics:", error);
                } finally {
                    setIsLoadingTopics(false);
                }
            };
            fetchTopics();
        }
    }, [partData.chapter]);

    // Fetch question types on mount if topics are selected
    useEffect(() => {
        if (partData.topics.length > 0 && availableQuestionTypes.length === 0) {
            const selectedTopicIds = new Set(partData.topics.map(t => t.topicId));
            fetchQuestionTypes(selectedTopicIds);
        }
    }, [partData.topics]);

    const handleTypeChange = (typeId, isSelected) => {
        const currentTypes = partData.types.map((t) => t.typeId);
        const newTypeIds = isSelected
            ? [...currentTypes, typeId]
            : currentTypes.filter((id) => id !== typeId);

        const newTypeObjects = newTypeIds.map((id) => ({ typeId: id, weight: 1 }));
        onPartChange(partKey, "types", newTypeObjects);
    };

    return (
        <div className="p-5 space-y-5 bg-slate-50/50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h4 className="font-bold text-lg text-slate-800 flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mr-3">
                        {partKey.toUpperCase()}
                    </span>
                    Part {partKey.toUpperCase()}
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
                    {marks} Marks
                </span>
            </div>

            <ContentBlockManager
                label="Question Text Blocks"
                blocks={partData.question}
                onChange={(newBlocks) => onPartChange(partKey, "question", newBlocks)}
                placeholderPrefix="Question Text"
                validationErrors={errors && errors[`${partKey}_question_blocks`]}
            />

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 mt-4 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                <FormField label="Chapter" isRequired error={errors && errors[`${partKey}_chapter`]}>
                    <StyledSelect value={partData.chapter} onChange={(e) => handleChapterChange(e.target.value)} error={errors && errors[`${partKey}_chapter`]}>
                        <option value="">Select Chapter</option>
                        {allChapters.map((c) => (
                            <option key={c._id} value={c._id}>
                                {c.name.en}
                            </option>
                        ))}
                    </StyledSelect>
                </FormField>

                <div className="space-y-2">
                    <FormField label="Topics" isRequired error={errors && errors[`${partKey}_topics`]}>
                        {isLoadingTopics ? (
                            <div className="flex items-center text-sm text-slate-500"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...</div>
                        ) : (
                            <div className={`p-2 border rounded-md bg-slate-50 max-h-32 overflow-y-auto custom-scrollbar ${errors && errors[`${partKey}_topics`] ? "border-red-300 ring-1 ring-red-100" : "border-slate-200"}`}>
                                {topics.length > 0 ? (
                                    topics.map(topic => (
                                        <div key={topic._id} className="flex items-center mb-1.5 last:mb-0">
                                            <input type="checkbox" id={`${partKey}-${topic._id}`} value={topic._id}
                                                checked={tempSelectedTopics.has(topic._id)}
                                                onChange={e => handleTempTopicChange(topic._id, e.target.checked)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                            />
                                            <label htmlFor={`${partKey}-${topic._id}`} className="ml-2 text-sm text-slate-700 cursor-pointer select-none hover:text-blue-600 transition-colors">{topic.name.en}</label>
                                        </div>
                                    ))
                                ) : <p className="text-xs text-slate-400 italic p-1">Select a chapter to see topics.</p>}
                            </div>
                        )}
                    </FormField>
                    <button
                        type="button"
                        onClick={handleConfirmTopics}
                        disabled={isLoadingQuestionTypes || tempSelectedTopics.size === 0}
                        className="inline-flex items-center justify-center w-full px-3 py-1.5 text-xs font-bold tracking-wide text-white bg-slate-800 border border-transparent rounded-md shadow-sm hover:bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoadingQuestionTypes ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check size={14} className="mr-1" /> Apply Topics</>}
                    </button>
                </div>

                <FormField label="Question Types" isRequired error={errors && errors[`${partKey}_types`]}>
                    {isLoadingQuestionTypes ? (
                        <div className="flex items-center text-sm text-slate-500"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...</div>
                    ) : (
                        <div className={`p-2 border rounded-md bg-slate-50 max-h-32 overflow-y-auto custom-scrollbar ${errors && errors[`${partKey}_types`] ? "border-red-300 ring-1 ring-red-100" : "border-slate-200"}`}>
                            {availableQuestionTypes.length > 0 ? (
                                availableQuestionTypes.map(qType => (
                                    <div key={qType._id} className="flex items-center mb-1.5 last:mb-0">
                                        <input type="checkbox" id={`${partKey}-${qType._id}`} value={qType._id}
                                            checked={partData.types.some(t => t.typeId === qType._id)}
                                            onChange={e => handleTypeChange(qType._id, e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                        <label htmlFor={`${partKey}-${qType._id}`} className="ml-2 text-sm text-slate-700 cursor-pointer select-none hover:text-blue-600 transition-colors">{qType.name.en}</label>
                                    </div>
                                ))
                            ) : <p className="text-xs text-slate-400 italic p-1">Confirm topics first.</p>}
                        </div>
                    )}
                </FormField>
            </div>
        </div>
    )
}
