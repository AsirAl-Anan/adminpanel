import React from "react"
import { CheckCircle } from "lucide-react"

export const FormCard = ({ children, title }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="px-3 py-2 md:px-4 md:py-2 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
        </div>
        <div className="p-3 md:p-4 space-y-3 md:space-y-4">{children}</div>
    </div>
)

export const FormField = ({ label, children, error, isRequired }) => (
    <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
        {children}
        {error && <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center">
            <span className="inline-block w-1 h-1 rounded-full bg-red-600 mr-1"></span> {error}
        </p>}
    </div>
)

export const StyledInput = (props) => (
    <input
        {...props}
        className={`block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400
                    transition-all duration-200
                    focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                    disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
                    ${props.className || ""} ${props.error ? "border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500/20" : ""}`}
    />
)

export const StyledSelect = (props) => (
    <select
        {...props}
        className={`block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm
                    transition-all duration-200
                    focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                    disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200
                    ${props.className || ""} ${props.error ? "border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500/20" : ""}`}
    >
        {props.children}
    </select>
)

export const StyledTextarea = (props) => (
    <textarea
        {...props}
        className={`block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400
                    transition-all duration-200
                    focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                    ${props.className || ""} ${props.error ? "border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500" : ""}`}
        rows={props.rows || 4}
    />
)

export const Stepper = ({ currentStep, steps, onStepClick, completedSteps = [] }) => (
    <nav aria-label="Progress">
        <ol role="list" className="space-y-4">
            {steps.map((stepName, stepIdx) => {
                const isCompleted = stepIdx < currentStep || completedSteps.includes(stepIdx)
                const isCurrent = stepIdx === currentStep

                return (
                    <li key={stepName} className="relative">
                        {stepIdx !== steps.length - 1 && (
                            <div
                                className={`absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 transition-colors duration-300 ${isCompleted ? "bg-blue-600" : "bg-slate-200"}`}
                            />
                        )}
                        <div
                            className={`relative flex items-start group ${onStepClick ? 'cursor-pointer' : ''}`}
                            onClick={() => onStepClick && onStepClick(stepIdx)}
                        >
                            <span className="flex items-center h-9">
                                <span
                                    className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${isCompleted
                                        ? "bg-blue-600 shadow-md shadow-blue-200"
                                        : isCurrent
                                            ? "border-2 border-blue-600 bg-white shadow-md shadow-blue-100"
                                            : "border-2 border-slate-200 bg-white"
                                        }`}
                                >
                                    {isCompleted ? (
                                        <CheckCircle className="w-5 h-5 text-white" />
                                    ) : (
                                        <span className={`h-2.5 w-2.5 rounded-full transition-colors ${isCurrent ? "bg-blue-600" : "bg-slate-300"}`} />
                                    )}
                                </span>
                            </span>
                            <span className="ml-4 flex min-w-0 flex-col mt-1.5">
                                <span className={`text-sm font-bold tracking-wide transition-colors ${isCurrent ? "text-blue-700" : isCompleted ? "text-slate-800" : "text-slate-400"}`}>
                                    {stepName}
                                </span>
                            </span>
                        </div>
                    </li>
                )
            })}
        </ol>
    </nav>
)

export const MobileStepper = ({ currentStep, totalSteps, onStepClick, completedSteps = [] }) => {
    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    Step {currentStep + 1} of {totalSteps}
                </span>
                <span className="text-xs font-bold text-slate-500">
                    {Math.round(((currentStep + 1) / totalSteps) * 100)}% Completed
                </span>
            </div>

            {/* Interactive Step Indicators */}
            <div className="flex items-center justify-between relative">
                {/* Progress Bar Background */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-10" />

                {Array.from({ length: totalSteps }).map((_, index) => {
                    const isCompleted = index < currentStep || completedSteps.includes(index);
                    const isCurrent = index === currentStep;
                    const isClickable = onStepClick && (isCompleted || isCurrent || index < currentStep);

                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={() => isClickable && onStepClick(index)}
                            disabled={!isClickable}
                            className={`
                                relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300
                                ${isCompleted
                                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
                                    : isCurrent
                                        ? "bg-white border-blue-600 text-blue-600 shadow-md shadow-blue-100 scale-110"
                                        : "bg-white border-slate-300 text-slate-400"
                                }
                                ${isClickable ? "cursor-pointer hover:scale-110" : "cursor-not-allowed"}
                            `}
                        >
                            {isCompleted ? (
                                <CheckCircle className="w-4 h-4" />
                            ) : (
                                <span className="text-xs font-bold">{index + 1}</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    )
}

import { Plus, X } from "lucide-react"

export const TagInput = ({ value, onChange, placeholder, error }) => {
    const safeValue = Array.isArray(value) ? value : [];
    const [inputValue, setInputValue] = React.useState("");

    const addTag = () => {
        const trimmedInput = inputValue.trim();
        if (trimmedInput && !safeValue.includes(trimmedInput)) {
            onChange([...safeValue, trimmedInput]);
            setInputValue("");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && !inputValue && safeValue.length > 0) {
            onChange(safeValue.slice(0, -1));
        }
    };

    const removeTag = (indexToRemove) => {
        onChange(safeValue.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div>
            <div className={`flex flex-wrap items-center gap-1.5 p-1.5 bg-white border rounded-lg transition-all duration-200
                ${error ? "border-red-500 focus-within:ring-red-500/20" : "border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"}
            `}>
                {safeValue.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 animate-in fade-in zoom-in duration-200">
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 transition-colors"
                        >
                            <X className="w-2.5 h-2.5" />
                        </button>
                    </span>
                ))}
                <div className="flex-1 relative min-w-[120px]">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={safeValue.length === 0 ? placeholder : ""}
                        className="w-full bg-transparent border-none focus:ring-0 text-sm p-1 pr-8 placeholder-slate-400"
                    />
                    {inputValue.trim() && (
                        <button
                            type="button"
                            onClick={addTag}
                            className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Add tag"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
            {error && <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center">
                <span className="inline-block w-1 h-1 rounded-full bg-red-600 mr-1"></span> {error}
            </p>}
        </div>
    );
};
