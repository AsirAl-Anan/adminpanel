// src/utils/validationUtils.js

import { mathSubjectIdentifiers } from './constants'; // Import the list of math subjects

/**
 * Validates Step 0 (Basic Information)
 * @param {Object} formData The form data object
 * @returns {Object} An object containing validation errors (empty if valid)
 */
export const validateStep0 = (formData) => {
  const newErrors = {};
  if (!formData.level) newErrors.level = 'Level is required';
  if (!formData.group) newErrors.group = 'Group is required';
  if (!formData.subject) newErrors.subject = 'Subject is required';
  if (!formData.difficulty) newErrors.difficulty = 'Difficulty is required';
  if (!formData.board && !formData.institution) newErrors.board = 'Either Board or Institution is required';
  if (!formData.year) newErrors.year = 'Year is required';
  return newErrors;
};

/**
 * Validates Step 1 (Question Details)
 * @param {Object} formData The form data object
 * @returns {Object} An object containing validation errors (empty if valid)
 */
export const validateStep1 = (formData) => {
  const newErrors = {};
  if (!formData.stem.trim()) newErrors.stem = 'Question stem is required';

  if (!formData.a.trim()) newErrors.a = 'Option A is required';
  if (!formData.b.trim()) newErrors.b = 'Option B is required';
  if (!formData.c.trim()) newErrors.c = 'Option C is required';
  if (!formData.cTopic) newErrors.cTopic = 'Topic for Option C is required';

  // Option D is required only for non-math subjects
  const isMathSubject = mathSubjectIdentifiers.includes(formData.subject);
  if (!isMathSubject) {
    if (!formData.d.trim()) newErrors.d = 'Option D is required for non-math subjects';
    if (!formData.dTopic) newErrors.dTopic = 'Topic for Option D is required for non-math subjects';
  }
  return newErrors;
};

/**
 * Validates Step 2 (Answers)
 * @param {Object} formData The form data object
 * @returns {Object} An object containing validation errors (empty if valid)
 */
export const validateStep2 = (formData) => {
  const newErrors = {};
  if (!formData.aAnswer.trim()) newErrors.aAnswer = 'Answer for Option A is required';
  if (!formData.bAnswer.trim()) newErrors.bAnswer = 'Answer for Option B is required';
  if (!formData.cAnswer.trim()) newErrors.cAnswer = 'Answer for Option C is required';

  // Answer for D is required only if Option D content exists
  if (formData.d && formData.d.trim()) {
    if (!formData.dAnswer.trim()) newErrors.dAnswer = 'Answer for Option D is required';
  }
  return newErrors;
};

/**
 * Checks if the current step is valid for enabling the Next button.
 * This is a simplified check, often used for UI enablement.
 * @param {number} step The current step index
 * @param {Object} formData The form data object
 * @returns {boolean} True if the step is considered valid for proceeding
 */
export const checkStepValidity = (step, formData) => {
    const isMathSubject = mathSubjectIdentifiers.includes(formData.subject);

    switch(step) {
      case 0:
        return formData.level && formData.group && formData.subject &&
               formData.difficulty && formData.year && (formData.board || formData.institution);
      case 1:
        return formData.stem.trim() && formData.a.trim() &&
               formData.b.trim() && formData.c.trim() && formData.cTopic &&
               (isMathSubject || (formData.d.trim() && formData.dTopic)); // D required for non-math
      case 2:
        return formData.aAnswer.trim() && formData.bAnswer.trim() && formData.cAnswer.trim() &&
               (formData.d.trim() ? formData.dAnswer.trim() : true); // D Answer required if D content exists
      default:
        return false;
    }
  };
