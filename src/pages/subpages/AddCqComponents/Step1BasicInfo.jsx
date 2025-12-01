import React from "react"
import { FormField, StyledSelect } from "./UIComponents"

export const Step1BasicInfo = ({ formData, handleMetaChange, errors, isDisabled }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Education Level" isRequired error={errors.level}>
                <StyledSelect
                    value={formData.meta.level}
                    onChange={(e) => handleMetaChange("level", e.target.value)}
                    disabled={isDisabled}
                >
                    <option value="">Select Level</option>
                    <option value="SSC">SSC</option>
                    <option value="HSC">HSC</option>
                </StyledSelect>
            </FormField>
            <FormField label="Group / Discipline" isRequired error={errors.group}>
                <StyledSelect
                    value={formData.meta.group}
                    onChange={(e) => handleMetaChange("group", e.target.value)}
                    disabled={isDisabled}
                >
                    <option value="">Select Group</option>
                    <option value="SCIENCE">Science</option>
                    <option value="HUMANITIES">Humanities</option>
                    <option value="COMMERCE">Commerce</option>
                </StyledSelect>
            </FormField>
        </div>
    )
}
