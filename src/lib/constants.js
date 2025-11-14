// src/utils/constants.js

// Predefined topic categories
export const topicCategories = [
  "a" // You can add more topics here
];

// Subject definitions
export const subjects = {
  SSC: {
    common: [
      { value: 'bangla-1st-paper', label: 'Bangla 1st Paper' },
      { value: 'bangla-2nd-paper', label: 'Bangla 2nd Paper' },
      { value: 'english-1st-paper', label: 'English 1st Paper' },
      { value: 'english-2nd-paper', label: 'English 2nd Paper' },
      { value: 'general-mathematics', label: 'General Mathematics' },
      { value: 'religion', label: 'Religion' },
      { value: 'bangladesh-and-global-studies', label: 'Bangladesh & Global Studies' }
    ],
    science: [
      { value: 'physics', label: 'Physics' },
      { value: 'chemistry', label: 'Chemistry' },
      { value: 'biology', label: 'Biology' },
      { value: 'higher-mathematics', label: 'Higher Mathematics' }
    ],
    commerce: [
      { value: 'accounting', label: 'Accounting' },
      { value: 'finance-and-banking', label: 'Finance & Banking' },
      { value: 'business-entrepreneurship', label: 'Business Entrepreneurship' }
    ],
    arts: [
      { value: 'civics', label: 'Civics' },
      { value: 'economics', label: 'Economics' },
      { value: 'geography-and-environment', label: 'Geography & Environment' },
      { value: 'history-of-bangladesh-and-world-civilization', label: 'History' }
    ]
  },
  HSC: {
    common: [
      { value: 'bangla-1st-paper', label: 'Bangla 1st Paper' },
      { value: 'bangla-2nd-paper', label: 'Bangla 2nd Paper' },
      { value: 'english-1st-paper', label: 'English 1st Paper' },
      { value: 'english-2nd-paper', label: 'English 2nd Paper' },
      { value: 'ict', label: 'ICT' }
    ],
    science: [
      { value: 'physics-1st-paper', label: 'Physics 1st Paper' },
      { value: 'physics-2nd-paper', label: 'Physics 2nd Paper' },
      { value: 'chemistry-1st-paper', label: 'Chemistry 1st Paper' },
      { value: 'chemistry-2nd-paper', label: 'Chemistry 2nd Paper' },
      { value: 'biology-1st-paper', label: 'Biology 1st Paper' },
      { value: 'biology-2nd-paper', label: 'Biology 2nd Paper' },
      { value: 'higher-mathematics-1st-paper', label: 'Higher Math 1st Paper' },
      { value: 'higher-mathematics-2nd-paper', label: 'Higher Math 2nd Paper' }
    ],
    commerce: [
      { value: 'accounting-1st-paper', label: 'Accounting 1st Paper' },
      { value: 'accounting-2nd-paper', label: 'Accounting 2nd Paper' },
      { value: 'finance-1st-paper', label: 'Finance 1st Paper' },
      { value: 'finance-2nd-paper', label: 'Finance 2nd Paper' },
      { value: 'business-organization-1st-paper', label: 'Business Organization 1st Paper' },
      { value: 'business-organization-2nd-paper', label: 'Business Organization 2nd Paper' }
    ],
    arts: [
      { value: 'civics-1st-paper', label: 'Civics 1st Paper' },
      { value: 'civics-2nd-paper', label: 'Civics 2nd Paper' },
      { value: 'economics-1st-paper', label: 'Economics 1st Paper' },
      { value: 'economics-2nd-paper', label: 'Economics 2nd Paper' },
      { value: 'history-1st-paper', label: 'History 1st Paper' },
      { value: 'history-2nd-paper', label: 'History 2nd Paper' },
      { value: 'geography-1st-paper', label: 'Geography 1st Paper' },
      { value: 'geography-2nd-paper', label: 'Geography 2nd Paper' }
    ]
  }
};

// Board definitions
export const boards = [
  'Dhaka', 'Rajshahi', 'Chittagong', 'Barisal',
  'Sylhet', 'Comilla', 'Jessore', 'Dinajpur',
  'Mymensingh', 'Madrasah'
];

// Math subject identifiers
export const mathSubjectIdentifiers = [
  "general-mathematics", // SSC General Math
  "higher-mathematics",  // SSC Higher Math
  "higher-mathematics-1st-paper", // HSC Higher Math 1st Paper
  "higher-mathematics-2nd-paper"  // HSC Higher Math 2nd Paper
];
