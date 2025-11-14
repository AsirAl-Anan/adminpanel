import React from 'react';

const DynamicListItem = ({ children, onRemove }) => (
  <div className="relative bg-gray-50 border border-gray-200 p-4 rounded-xl">
    {children}
    {onRemove && (
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
        aria-label="Remove item"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    )}
  </div>
);

export default DynamicListItem;
