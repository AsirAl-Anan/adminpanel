import React from 'react';

const BilingualInput = ({ label, englishValue, banglaValue, onUpdate, fieldName, required = false, isTextarea = false }) => {
  const InputComponent = isTextarea ? 'textarea' : 'input';
  const commonProps = {
    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors bg-gray-50 text-sm",
    rows: isTextarea ? 4 : undefined,
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1">
          <span className="text-xs text-gray-500 ml-1">English</span>
          <InputComponent
            type="text"
            value={englishValue || ''}
            onChange={(e) => onUpdate(`${fieldName}.en`, e.target.value)}
            placeholder={`${label} (English)`}
            {...commonProps}
          />
        </div>
        <div className="flex-1">
          <span className="text-xs text-gray-500 ml-1">Bangla</span>
          <InputComponent
            type="text"
            value={banglaValue || ''}
            onChange={(e) => onUpdate(`${fieldName}.bn`, e.target.value)}
            placeholder={`${label} (Bangla)`}
            {...commonProps}
          />
        </div>
      </div>
    </div>
  );
};

export default BilingualInput;
