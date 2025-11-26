import React, { useState } from "react"
import { ContentBlockManager } from "./ContentBlockManager"

export const Step4AnswerDetails = ({ formData, handlePartChange, errors }) => {
    const [activeTab, setActiveTab] = useState('a');
    const tabs = ['a', 'b', 'c', 'd'];

    return (
        <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-4 text-blue-800 text-sm">
                <span className="font-bold">Note:</span> Provide accurate answers for the evaluators. You can use multiple blocks for structured answers.
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
        </div>
    )
}
