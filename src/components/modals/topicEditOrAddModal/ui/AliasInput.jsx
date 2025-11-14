import React from 'react';

const AliasInput = ({ label, englishValue, banglaValue, banglishValue, onUpdate, fieldName }) => {
  const commonProps = {
    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors bg-gray-50 text-sm",
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="flex-1">
          <span className="text-xs text-gray-500 ml-1">English</span>
          <input
            type="text"
            value={englishValue || ''}
            onChange={(e) => onUpdate(`${fieldName}.english`, e.target.value)}
            placeholder="Alias (English)"
            {...commonProps}
          />
        </div>
        <div className="flex-1">
          <span className="text-xs text-gray-500 ml-1">Banglish</span>
          <input
            type="text"
            value={banglishValue || ''}
            onChange={(e) => onUpdate(`${fieldName}.banglish`, e.target.value)}
            placeholder="Alias (Banglish)"
            {...commonProps}
          />
        </div>
        <div className="flex-1">
          <span className="text-xs text-gray-500 ml-1">Bangla</span>
          <input
            type="text"
            value={banglaValue || ''}
            onChange={(e) => onUpdate(`${fieldName}.bangla`, e.target.value)}
            placeholder="Alias (Bangla)"
            {...commonProps}
          />
        </div>
      </div>
    </div>
  );
};

export default AliasInput;
