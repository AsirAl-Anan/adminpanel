import React from 'react';
import DynamicListItem from '../ui/DynamicListItem';

const FormulasTab = ({ newTopic, handleUpdate, addTopicFormula, removeTopicFormula }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-foreground mb-4">Topic-Level Formulas (IDs)</h3>
      <p className="text-muted-foreground mb-4">These formulas are associated with the entire topic. Enter their IDs below.</p>
      <div className="space-y-3">
        {newTopic.article.formulas?.map((formulaId, idx) => (
          <DynamicListItem key={idx} onRemove={() => removeTopicFormula(idx)}>
            <input
              type="text"
              value={formulaId || ''}
              onChange={(e) => handleUpdate(`article.formulas.${idx}`, e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring transition-colors bg-input text-sm"
              placeholder="Enter Formula ID"
            />
          </DynamicListItem>
        ))}
        <button type="button" onClick={addTopicFormula} className="flex items-center text-primary hover:text-primary/80 text-sm font-medium">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Add Topic Formula ID
        </button>
      </div>
    </div>
  );
};

export default FormulasTab;
