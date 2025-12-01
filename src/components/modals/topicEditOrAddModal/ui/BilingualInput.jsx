import React from 'react';
import TranslationButton from '../../../ui/TranslationButton';

const BilingualInput = ({ label, englishValue, banglaValue, onUpdate, fieldName, required = false, isTextarea = false }) => {
  const InputComponent = isTextarea ? 'textarea' : 'input';
  const commonProps = {
    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors bg-gray-50 text-sm",
    rows: isTextarea ? 4 : undefined,
  };

  // Show translation button only if source has text AND target is empty
  const showEnglishToBanglaButton = englishValue && englishValue.trim().length > 0 && (!banglaValue || banglaValue.trim().length === 0);
  const showBanglaToEnglishButton = banglaValue && banglaValue.trim().length > 0 && (!englishValue || englishValue.trim().length === 0);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1 relative">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500 ml-1">English</span>
            {showEnglishToBanglaButton && (
              <TranslationButton
                text={englishValue}
                targetLang="bn"
                onTranslate={(translatedText) => onUpdate(`${fieldName}.bn`, translatedText)}
              />
            )}
          </div>
          <InputComponent
            type="text"
            value={englishValue || ''}
            onChange={(e) => onUpdate(`${fieldName}.en`, e.target.value)}
            placeholder={`${label} (English)`}
            {...commonProps}
          />
        </div>
        <div className="flex-1 relative">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500 ml-1">Bangla</span>
            {showBanglaToEnglishButton && (
              <TranslationButton
                text={banglaValue}
                targetLang="en"
                onTranslate={(translatedText) => onUpdate(`${fieldName}.en`, translatedText)}
              />
            )}
          </div>
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
