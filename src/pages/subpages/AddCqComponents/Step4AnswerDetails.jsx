// AI Question Extraction Modal Integration
import React, { useState } from "react"
import { Sparkles } from "lucide-react"
import { ContentBlockManager } from "./ContentBlockManager"
import { ImageExtractionModal } from "../../../components/ImageExtractionModal"

export const Step4AnswerDetails = ({ formData, handlePartChange, errors }) => {
    const [activeTab, setActiveTab] = useState('a');
    const [isExtractionModalOpen, setIsExtractionModalOpen] = useState(false);
    const tabs = ['a', 'b', 'c', 'd'];

    const handleExtractionSuccess = (extractedData) => {
        // extractedData is expected to be an object matching the schema: { a: { answer: [...] }, b: ... }
        // The service returns the result directly.

        ['a', 'b', 'c', 'd'].forEach(partKey => {
            if (extractedData[partKey] && extractedData[partKey].answer) {
                handlePartChange(partKey, "answer", extractedData[partKey].answer);
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-blue-50 border border-blue-100 p-4 rounded-lg mb-4">
                <div className="text-blue-800 text-sm">
                    <span className="font-bold">Note:</span> Provide accurate answers for the evaluators. You can use multiple blocks for structured answers.
                </div>
                <button
                    type="button"
                    onClick={() => setIsExtractionModalOpen(true)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-purple-700 bg-white rounded-full hover:bg-purple-50 transition-colors border border-purple-200 shadow-sm whitespace-nowrap ml-4"
                >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Extract Answer from Image
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg mb-4 overflow-x-auto">
                {tabs.map((p) => {
                    const hasError = errors && (errors[`${p}_answer`] || errors[`${p}_answer_blocks`]);
                    return (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setActiveTab(p)}
                            className={`flex-1 min-w-[80px] px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 flex items-center justify-center ${activeTab === p
                                ? "bg-white text-blue-700 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                } ${hasError ? "text-red-500" : ""}`}
                        >
                            Part {p.toUpperCase()}
                            {hasError && <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>}
                        </button>
                    )
                })}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="p-3 md:p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div className="flex items-center mb-4">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold mr-2">
                            {activeTab.toUpperCase()}
                        </span>
                        <h4 className="font-bold text-md text-slate-800">Answer for Part {activeTab.toUpperCase()}</h4>
                    </div>
                    <ContentBlockManager
                        label={`Answer Content`}
                        blocks={formData[activeTab].answer}
                        onChange={(newBlocks) => handlePartChange(activeTab, "answer", newBlocks)}
                        placeholderPrefix={`Answer (${activeTab.toUpperCase()})`}
                        validationErrors={errors[`${activeTab}_answer_blocks`]}
                    />
                    {errors[`${activeTab}_answer`] && <p className="mt-2 text-sm text-red-600 font-medium">{errors[`${activeTab}_answer`]}</p>}
                </div>
            </div>

            <ImageExtractionModal
                isOpen={isExtractionModalOpen}
                onClose={() => setIsExtractionModalOpen(false)}
                onSuccess={handleExtractionSuccess}
                type="answer"
            />
        </div>
    )
}
