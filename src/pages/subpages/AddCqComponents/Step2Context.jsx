import React from "react"
import { FormField, StyledSelect, StyledInput } from "./UIComponents"

export const Step2Context = ({
    formData,
    handleSubjectChange,
    handleMainChapterChange,
    handleSourceChange,
    subjects,
    chapters,
    isSubjectsLoading,
    isChaptersLoading,
    errors
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Subject" isRequired error={errors.subject}>
                <StyledSelect value={formData.meta.subject._id} onChange={(e) => handleSubjectChange(e.target.value)} disabled={isSubjectsLoading}>
                    <option value="">{isSubjectsLoading ? 'Loading Subjects...' : 'Select Subject'}</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name.en}</option>)}
                </StyledSelect>
            </FormField>
            <FormField label="Main Chapter" isRequired error={errors.mainChapter}>
                <StyledSelect value={formData.meta.mainChapter._id} onChange={(e) => handleMainChapterChange(e.target.value)} disabled={isChaptersLoading || !formData.meta.subject._id}>
                    <option value="">{isChaptersLoading ? 'Loading Chapters...' : 'Select Chapter'}</option>
                    {chapters.map(c => <option key={c._id} value={c._id}>{c.name.en}</option>)}
                </StyledSelect>
            </FormField>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <FormField label="Source Type" isRequired>
                    <StyledSelect value={formData.source.source.sourceType} onChange={(e) => handleSourceChange("sourceType", e.target.value)}>
                        <option value="BOARD">Board Question</option>
                        <option value="INSTITUTION">Institution Question</option>
                    </StyledSelect>
                </FormField>
                <FormField label="Exam Year" isRequired error={errors.year}>
                    <StyledInput type="number" value={formData.source.year} onChange={(e) => handleSourceChange("year", e.target.value)} />
                </FormField>

                {formData.source.source.sourceType === 'BOARD' && (
                    <FormField label="Board Name" isRequired error={errors.sourceValue}>
                        <StyledSelect value={formData.source.source.value} onChange={e => handleSourceChange('value', e.target.value)}>
                            <option value="">Select Board</option>
                            {['Dhaka', 'Rajshahi', 'Chittagong', 'Sylhet', 'Comilla', 'Jessore', 'Dinajpur', 'Mymensingh', 'Madrasah', 'Barishal'].map(b => <option key={b} value={b}>{b}</option>)}
                        </StyledSelect>
                    </FormField>
                )}
                {formData.source.source.sourceType === 'INSTITUTION' && (
                    <FormField label="Institution Name" isRequired error={errors.sourceValue}>
                        <input
                            list="colleges"
                            className="block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={formData.source.source.value}
                            onChange={e => handleSourceChange('value', e.target.value)}
                            placeholder="Type college name..."
                        />
                        <datalist id="colleges">
                            <option value="Notre Dame College" />
                            <option value="Holy Cross College" />
                            <option value="Dhaka College" />
                            <option value="Rajuk Uttara Model College" />
                            <option value="Viqarunnisa Noon School and College" />
                        </datalist>
                    </FormField>
                )}
            </div>
            {formData.source.source.sourceType === 'INSTITUTION' && (
                <div className="md:col-span-2">
                    <FormField label="Exam Type" isRequired error={errors.examType}>
                        <StyledSelect value={formData.source.examType} onChange={e => handleSourceChange('examType', e.target.value)}>
                            <option value="">Select Exam Type</option>
                            <option value="TEST">Test Exam</option>
                            <option value="PRETEST">Pre-Test Exam</option>
                            <option value="HALFYEARLY">Half Yearly</option>
                            <option value="FINAL">Final Exam</option>
                        </StyledSelect>
                    </FormField>
                </div>
            )}
        </div>
    )
}
