import React from 'react';
import BilingualInput from './BilingualInput';
import DynamicListItem from './DynamicListItem';

const FormulaInput = ({ formula, onUpdate, onRemove }) => {
  const handleVariableUpdate = (varIdx, field, value) => {
    const updatedVariables = formula.variables.map((v, i) =>
      i === varIdx ? { ...v, [field]: value } : v
    );
    onUpdate({ ...formula, variables: updatedVariables });
  };

  const addVariable = () => {
    onUpdate({
      ...formula,
      variables: [...(formula.variables || []), { symbol: '', definition: { en: '', bn: '' }, unit: { en: '', bn: '' } }],
    });
  };

  const removeVariable = (varIdx) => {
    onUpdate({
      ...formula,
      variables: formula.variables.filter((_, i) => i !== varIdx),
    });
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-4 bg-card shadow-sm">
      <div className="flex justify-end">
        <button type="button" onClick={onRemove} className="p-1 text-destructive-foreground hover:text-destructive">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>

      <BilingualInput
        label="Formula Name"
        fieldName="name"
        englishValue={formula.name?.en}
        banglaValue={formula.name?.bn}
        onUpdate={(path, value) => onUpdate({ ...formula, name: { ...formula.name, [path.split('.')[1]]: value } })}
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Equation (LaTeX) <span className="text-destructive-foreground">*</span>
        </label>
        <input
          type="text"
          value={formula.equation || ''}
          onChange={(e) => onUpdate({ ...formula, equation: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring transition-colors bg-input text-sm"
          placeholder="e.g., E=mc^2"
          required
        />
      </div>

      <BilingualInput
        label="Description"
        fieldName="description"
        englishValue={formula.description?.en}
        banglaValue={formula.description?.bn}
        onUpdate={(path, value) => onUpdate({ ...formula, description: { ...formula.description, [path.split('.')[1]]: value } })}
        isTextarea
      />

      <BilingualInput
        label="Derivation"
        fieldName="derivation"
        englishValue={formula.derivation?.en}
        banglaValue={formula.derivation?.bn}
        onUpdate={(path, value) => onUpdate({ ...formula, derivation: { ...formula.derivation, [path.split('.')[1]]: value } })}
        isTextarea
      />

      <section>
        <h4 className="font-medium text-foreground mb-2">Variables</h4>
        <div className="space-y-3">
          {formula.variables?.map((variable, varIdx) => (
            <DynamicListItem key={varIdx} onRemove={() => removeVariable(varIdx)}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Symbol</label>
                  <input
                    type="text"
                    value={variable.symbol || ''}
                    onChange={(e) => handleVariableUpdate(varIdx, 'symbol', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring transition-colors bg-input text-sm"
                    placeholder="e.g., m"
                  />
                </div>
                <BilingualInput
                  label="Definition"
                  fieldName={`definition`}
                  englishValue={variable.definition?.en}
                  banglaValue={variable.definition?.bn}
                  onUpdate={(path, value) => handleVariableUpdate(varIdx, path.split('.')[0], { ...variable.definition, [path.split('.')[1]]: value })}
                  nestedPath
                />
                <BilingualInput
                  label="Unit"
                  fieldName={`unit`}
                  englishValue={variable.unit?.en}
                  banglaValue={variable.unit?.bn}
                  onUpdate={(path, value) => handleVariableUpdate(varIdx, path.split('.')[0], { ...variable.unit, [path.split('.')[1]]: value })}
                  nestedPath
                />
              </div>
            </DynamicListItem>
          ))}
          <button type="button" onClick={addVariable} className="flex items-center text-primary hover:text-primary/80 text-sm font-medium mt-2">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Add Variable
          </button>
        </div>
      </section>
    </div>
  );
};

export default FormulaInput;
