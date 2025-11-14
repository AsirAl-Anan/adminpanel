import React from 'react';
import FormulaInput from '../ui/FormulaInput'; // Assuming this new component will be created

const TopicFormulasTab = ({ newTopic, handleUpdate, addTopicFormula, removeTopicFormula, activeArticleIndex }) => {
  const currentArticle = newTopic.articles[activeArticleIndex];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Topic-Level Formulas</h3>
      <p className="text-gray-600 mb-4">These formulas are associated with the entire topic (specifically, the currently active article). Enter their details below.</p>
      <div className="space-y-3">
        {currentArticle?.formulas?.map((formula, idx) => (
          <FormulaInput
            key={formula._id || idx}
            formula={formula}
            onUpdate={(updatedFormula) => handleUpdate(`articles.${activeArticleIndex}.formulas.${idx}`, updatedFormula)}
            onRemove={() => removeTopicFormula(idx)}
          />
        ))}
        <button type="button" onClick={addTopicFormula} className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Add Topic Formula
        </button>
      </div>
    </div>
  );
};

export default TopicFormulasTab;
