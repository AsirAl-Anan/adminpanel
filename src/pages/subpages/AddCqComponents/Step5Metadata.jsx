import React, { useState } from "react"
import { AlignLeft, Languages, Sparkles, Loader2 } from "lucide-react"
import { FormField, TagInput } from "./UIComponents"
import axios from "../../../config/axios.js"
export const Step5Metadata = ({ formData, handleAliasChange, handleTagsChange, errors }) => {
    const aliases = formData.meta.aliases || { en: [], bn: [], banglish: [] };
    const tags = formData.meta.tags || { en: [], bn: [] };
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateMetadata = async () => {
        setIsGenerating(true);
        try {
            const context = {
                subject: formData.meta?.subject?.name,
                board: formData.source?.source?.value,
                year: formData.source?.year,
                level: formData.meta?.level,
                group: formData.meta?.group,
                examType: formData.source?.examType,
                topic: formData.meta?.mainChapter?.name
            };

            const response = await axios.post('/ai/generate-metadata', context);
         
            const data = await response.data

            if (data.success && data.data) {
                const { aliases: newAliases, tags: newTags } = data.data;

                // Helper to merge unique values
                const mergeUnique = (existing, incoming) => {
                    return [...new Set([...(existing || []), ...(incoming || [])])];
                };

                // Append new aliases
                if (newAliases.en) handleAliasChange('en', mergeUnique(aliases.en, newAliases.en));
                if (newAliases.bn) handleAliasChange('bn', mergeUnique(aliases.bn, newAliases.bn));
                if (newAliases.banglish) handleAliasChange('banglish', mergeUnique(aliases.banglish, newAliases.banglish));

                // Append new tags
                if (newTags.en) handleTagsChange('en', mergeUnique(tags.en, newTags.en));
                if (newTags.bn) handleTagsChange('bn', mergeUnique(tags.bn, newTags.bn));
            }
        } catch (error) {
            console.error("Error generating metadata:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleGenerateMetadata}
                    disabled={isGenerating}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate with AI
                        </>
                    )}
                </button>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-bold text-lg text-slate-800 mb-4 flex items-center">
                    <AlignLeft className="w-5 h-5 mr-2 text-slate-500" /> Search Aliases
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                    Type an alias and press <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-semibold">Enter</kbd> or click the <span className="text-blue-600 font-semibold">Add</span> button. All three fields are required.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label="English Alias" isRequired><TagInput placeholder="Type and press Enter..." value={aliases.en} onChange={val => handleAliasChange('en', val)} error={errors.aliases && aliases?.en?.length === 0 ? "Required" : ""} /></FormField>
                    <FormField label="Bangla Alias" isRequired><TagInput placeholder="টাইপ করুন এবং Enter..." value={aliases.bn} onChange={val => handleAliasChange('bn', val)} error={errors.aliases && aliases?.bn?.length === 0 ? "Required" : ""} /></FormField>
                    <FormField label="Banglish Alias" isRequired><TagInput placeholder="Type and press Enter..." value={aliases.banglish} onChange={val => handleAliasChange('banglish', val)} error={errors.aliases && aliases?.banglish?.length === 0 ? "Required" : ""} /></FormField>
                </div>
                {errors.aliases && <p className="mt-2 text-sm text-red-600 font-medium">{errors.aliases}</p>}
            </div>
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-bold text-lg text-slate-800 mb-4 flex items-center">
                    <Languages className="w-5 h-5 mr-2 text-slate-500" /> Search Tags
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                    Type a tag and press <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-semibold">Enter</kbd> or click the <span className="text-blue-600 font-semibold">Add</span> button to add multiple tags.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="English Tags"><TagInput placeholder="physics, newton..." value={tags.en} onChange={val => handleTagsChange('en', val)} /></FormField>
                    <FormField label="Bangla Tags"><TagInput placeholder="পদার্থবিজ্ঞান, নিউটন..." value={tags.bn} onChange={val => handleTagsChange('bn', val)} /></FormField>
                </div>
            </div>
        </div>
    )
}
