import React, { useState } from "react"
import { AlertCircle, Sparkles } from "lucide-react"
import { ContentBlockManager } from "./ContentBlockManager"
import { QuestionPartForm } from "./QuestionPartForm"
import { ImageExtractionModal } from "../../../components/ImageExtractionModal"

export const Step3QuestionDetails = ({ formData, handleStemBlocksChange, handlePartChange, chapters, errors }) => {
    const [activeTab, setActiveTab] = useState('a');
    const [isExtractionModalOpen, setIsExtractionModalOpen] = useState(false);

    const tabs = [
        { id: 'a', label: 'Part A', marks: 1 },
        { id: 'b', label: 'Part B', marks: 2 },
        { id: 'c', label: 'Part C', marks: 3 },
        { id: 'd', label: 'Part D', marks: 4 },
    ];

    const handleExtractionSuccess = (extractedData) => {
        // extractedData is expected to be an array with one object based on the service implementation
        // or a direct object if we adjust the service. 
        // The service returns [result] currently.
        const data = Array.isArray(extractedData) ? extractedData[0] : extractedData;

        if (data.stem) {
            handleStemBlocksChange(data.stem);
        }

        ['a', 'b', 'c', 'd'].forEach(partKey => {
            if (data[partKey] && data[partKey].question) {
                handlePartChange(partKey, "question", data[partKey].question);
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => setIsExtractionModalOpen(true)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-100 rounded-full hover:bg-purple-200 transition-colors border border-purple-200 shadow-sm"
                >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Extract Question from Image
                </button>
            </div>

            {/* Stem using ContentBlockManager */}
            <div>
                <div className="flex items-center mb-2">
                    <div className="w-1 h-6 bg-blue-600 rounded mr-2"></div>
                    <h3 className="text-md font-bold text-slate-800">Stem (Stimulus Scenario)</h3>
                </div>
                <p className="text-sm text-slate-500 mb-4">Enter the main scenario or story for the creative question.</p>

                {/* Pass granular errors to block manager */}
                <ContentBlockManager
                    label="Stem Content"
                    blocks={formData.stem}
                    onChange={handleStemBlocksChange}
                    placeholderPrefix="Stem"
                    validationErrors={errors.stem_blocks}
                />
                {errors.stem && <p className="mt-2 text-sm text-red-600 font-medium flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.stem}</p>}
            </div>

            <div className="border-t border-slate-200 my-4"></div>

            {/* Tabs for Question Parts */}
            <div>
                <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg mb-4 overflow-x-auto">
                    {tabs.map((tab) => {
                        const hasError = errors && (
                            errors[`${tab.id}_question`] ||
                            errors[`${tab.id}_question_blocks`] ||
                            errors[`${tab.id}_chapter`] ||
                            errors[`${tab.id}_topics`] ||
                            errors[`${tab.id}_types`]
                        );

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 min-w-[80px] px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 flex items-center justify-center ${activeTab === tab.id
                                    ? "bg-white text-blue-700 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                    } ${hasError ? "text-red-500" : ""}`}
                            >
                                {tab.label}
                                {hasError && <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>}
                            </button>
                        )
                    })}
                </div>

                {/* Render Active Tab */}
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <QuestionPartForm
                        key={activeTab}
                        partKey={activeTab}
                        partData={formData[activeTab]}
                        onPartChange={handlePartChange}
                        allChapters={chapters}
                        marks={tabs.find(t => t.id === activeTab).marks}
                        errors={errors}
                    />
                </div>
            </div>

            <ImageExtractionModal
                isOpen={isExtractionModalOpen}
                onClose={() => setIsExtractionModalOpen(false)}
                onSuccess={handleExtractionSuccess}
                type="question"
            />
        </div>
    )
}
