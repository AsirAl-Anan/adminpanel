import React, { useState, useCallback } from 'react';
import LatexRenderer from './LatexRenderer'; // Your existing LatexRenderer

const LaTeXInputComponent = ({ value, onChange, placeholder, label }) => {
  const [showPreview, setShowPreview] = useState(true);
  const [inputValue, setInputValue] = useState(value || '');

  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  }, [onChange]);

  const insertMathSymbol = useCallback((symbol) => {
    const textarea = document.getElementById(`latex-input-${label}`);
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = inputValue.substring(0, start) + symbol + inputValue.substring(end);
      setInputValue(newValue);
      if (onChange) {
        onChange(newValue);
      }
      // Focus back to textarea and set cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + symbol.length, start + symbol.length);
      }, 0);
    }
  }, [inputValue, onChange, label]);

  const mathSymbols = [
    { symbol: '$\\alpha$', label: 'α' },
    { symbol: '$\\beta$', label: 'β' },
    { symbol: '$\\gamma$', label: 'γ' },
    { symbol: '$\\delta$', label: 'δ' },
    { symbol: '$\\theta$', label: 'θ' },
    { symbol: '$\\lambda$', label: 'λ' },
    { symbol: '$\\mu$', label: 'μ' },
    { symbol: '$\\pi$', label: 'π' },
    { symbol: '$\\sigma$', label: 'σ' },
    { symbol: '$\\omega$', label: 'ω' },
    { symbol: '$\\times$', label: '×' },
    { symbol: '$\\div$', label: '÷' },
    { symbol: '$\\pm$', label: '±' },
    { symbol: '$\\leq$', label: '≤' },
    { symbol: '$\\geq$', label: '≥' },
    { symbol: '$\\neq$', label: '≠' },
    { symbol: '$\\infty$', label: '∞' },
    { symbol: '$\\rightarrow$', label: '→' },
    { symbol: '$\\leftarrow$', label: '←' },
    { symbol: '$\\vec{v}$', label: 'v⃗' },
    { symbol: '$\\frac{a}{b}$', label: 'a/b' },
    { symbol: '$x^2$', label: 'x²' },
    { symbol: '$x_1$', label: 'x₁' },
    { symbol: '$\\sqrt{x}$', label: '√x' },
  ];

  return (
    <div className="latex-input-component">
      {label && <label className="form-label">{label}</label>}
      
      {/* Math Symbol Toolbar */}
      <div className="mb-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
        <div className="text-xs text-gray-600 mb-2">Quick Insert Math Symbols:</div>
        <div className="flex flex-wrap gap-1">
          {mathSymbols.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => insertMathSymbol(item.symbol)}
              className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
              title={`Insert ${item.symbol}`}
            >
              <LatexRenderer latex={item.symbol} />
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-2">
        <textarea
          id={`latex-input-${label}`}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder || "Enter text with LaTeX math notation using $ delimiters, e.g., $x^2 + y^2 = z^2$"}
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          style={{ resize: 'vertical' }}
        />
        
        {/* Toggle Preview Button */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <div className="text-xs text-gray-500">
            Use $...$ for inline math, $$...$$ for display math
          </div>
        </div>

        {/* Preview Area */}
        {showPreview && (
          <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-2">Preview:</div>
            <div className="min-h-[2rem]">
              {inputValue ? (
                <LatexRenderer latex={inputValue} />
              ) : (
                <span className="text-gray-400 italic">Preview will appear here...</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaTeXInputComponent;
