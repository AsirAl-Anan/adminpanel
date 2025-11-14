// src/utils/formUtils.js

import { subjects } from './constants';

/**
 * Gets the list of subjects available based on selected level and group.
 * @param {string} level The selected level (e.g., 'SSC', 'HSC')
 * @param {string} group The selected group (e.g., 'science', 'arts')
 * @returns {Array} Array of subject objects { value, label }
 */
export const getAvailableSubjects = (level, group) => {
    if (!level || !group) return [];
    const levelSubjects = subjects[level];
    if (!levelSubjects) return [];
    return [...(levelSubjects.common || []), ...(levelSubjects[group] || [])];
};

/**
 * Determines if the currently selected subject is a mathematics subject.
 * @param {string} subjectValue The value of the selected subject
 * @returns {boolean} True if the subject is a math subject
 */
export const isMathSubject = (subjectValue) => {
    // This list should ideally come from constants.js if it's used elsewhere
    return [
        "general-mathematics",
        "higher-mathematics",
        "higher-mathematics-1st-paper",
        "higher-mathematics-2nd-paper"
    ].includes(subjectValue);
};

// Note: handleTopicChange logic is quite specific to the component's state management
// and might be better kept within the component itself unless it becomes more complex.
// For now, we'll leave it in the main component.
