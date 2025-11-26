import React, { useState, useEffect } from 'react';
import BilingualInput from '../ui/BilingualInput';
import DynamicListItem from '../ui/DynamicListItem';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select"; // Import Select components

const BasicInfoTab = ({
  newTopic,
  handleUpdate,
  addAliasField,
  removeAliasField,
}) => {
  return (
    <div className="space-y-8">
      <BilingualInput label="Topic Name" fieldName="name" englishValue={newTopic.name?.en} banglaValue={newTopic.name?.bn} onUpdate={handleUpdate} required />
      <BilingualInput label="Topic Description" fieldName="description" englishValue={newTopic.description?.en} banglaValue={newTopic.description?.bn} onUpdate={handleUpdate} isTextarea />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Topic Number <span className="text-destructive-foreground">*</span>
        </label>
        <input
          type="text"
          value={newTopic.topicNumber || ''}
          onChange={(e) => handleUpdate('topicNumber', e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring transition-colors bg-input text-sm"
          placeholder="e.g., 1.1, 1.1.1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Importance
        </label>
        <select
          value={newTopic.importance || 'MEDIUM'}
          onChange={(e) => handleUpdate('importance', e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring transition-colors bg-input text-sm"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

     

      <section>
        <h4 className="font-medium text-foreground mb-2">Aliases</h4>
        {['english', 'bangla', 'banglish'].map(aliasType => (
          <div key={aliasType} className="mb-4">
            <label className="block text-sm font-medium text-muted-foreground capitalize mb-1">{aliasType} Aliases</label>
            {newTopic.aliases?.[aliasType]?.map((alias, idx) => (
              <DynamicListItem key={idx} onRemove={() => removeAliasField(aliasType, idx)}>
                <input
                  type="text"
                  value={alias || ''}
                  onChange={(e) => handleUpdate(`aliases.${aliasType}.${idx}`, e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring transition-colors bg-input text-sm"
                  placeholder={`Enter ${aliasType} alias`}
                />
              </DynamicListItem>
            ))}
            <button type="button" onClick={() => addAliasField(aliasType)} className="flex items-center text-primary hover:text-primary/80 text-sm font-medium mt-2">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Add {aliasType} Alias
            </button>
          </div>
        ))}
      </section>

      <section>
        <h4 className="font-medium text-foreground mb-2">Tags</h4>
        <div className="flex flex-wrap gap-2">
          {newTopic.tags?.map((tag, idx) => (
            <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
              {tag}
              <button type="button" onClick={() => {
                const updatedTags = newTopic.tags.filter((_, i) => i !== idx);
                handleUpdate('tags', updatedTags);
              }} className="ml-2 -mr-0.5 h-4 w-4 text-primary/70 hover:text-primary">
                &times;
              </button>
            </span>
          ))}
          <input
            type="text"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
                e.preventDefault();
                const newTag = e.currentTarget.value.trim();
                if (!newTopic.tags.includes(newTag)) {
                  handleUpdate('tags', [...newTopic.tags, newTag]);
                }
                e.currentTarget.value = '';
              }
            }}
            className="px-3 py-1 border border-border rounded-md focus:ring-2 focus:ring-ring transition-colors bg-input text-sm w-auto min-w-[100px]"
            placeholder="Add tag (Enter)"
          />
        </div>
      </section>

    </div>
  );
};

export default BasicInfoTab;
