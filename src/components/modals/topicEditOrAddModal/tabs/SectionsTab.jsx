import React, { useState } from 'react';
import BilingualInput from '../ui/BilingualInput';
import DynamicListItem from '../ui/DynamicListItem';
import ImagePreview from '../ui/ImagePreview';

const SectionsTab = ({ newTopic, handleUpdate, addSection, removeSection, openImageStudio, removeImage, addSectionFormula, removeSectionFormula, openExtractSegmentsModal }) => {
  const [activeSection, setActiveSection] = useState(0);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openExtractSegmentsModal}

          disabled={true}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
          Extract Sections with AI
        </button>
      </div>
      {newTopic.article.sections?.map((section, secIdx) => (
        <div key={secIdx} className="border border-border rounded-md overflow-hidden">
          <div
            className="bg-muted/30 p-4 flex justify-between items-center cursor-pointer hover:bg-muted"
            onClick={() => setActiveSection(activeSection === secIdx ? null : secIdx)}
          >
            <h4 className="font-semibold text-foreground">Section {secIdx + 1}: {section.title?.en || 'Untitled Section'}</h4>
            <div className="flex items-center gap-2">
              <button type="button" onClick={(e) => { e.stopPropagation(); removeSection(secIdx); }} className="p-1 text-destructive-foreground hover:text-destructive"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              <svg className={`w-5 h-5 text-muted-foreground transform transition-transform ${activeSection === secIdx ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {activeSection === secIdx && (
            <div className="p-4 space-y-6 animate-in fade-in duration-300">
              <BilingualInput label="Section Title" fieldName={`article.sections.${secIdx}.title`} englishValue={section.title?.en} banglaValue={section.title?.bn} onUpdate={handleUpdate} required />
              <BilingualInput label="Section Body" fieldName={`article.sections.${secIdx}.body`} englishValue={section.body?.en} banglaValue={section.body?.bn} onUpdate={handleUpdate} isTextarea required />

              <section>
                <h3 className="text-md font-semibold text-foreground mb-2">Section Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {section.images?.map((image, imgIdx) => (
                    <div key={imgIdx} className="relative group bg-muted/30 rounded-md border p-2 text-center">
                      <ImagePreview image={image} />
                      <p className="text-xs font-medium text-muted-foreground truncate">{image.caption?.en || 'Untitled'}</p>
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                        <button type="button" onClick={() => openImageStudio('section', imgIdx, secIdx)} className="p-2 bg-card/80 rounded-full text-primary hover:bg-card"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg></button>
                        <button type="button" onClick={() => removeImage('section', imgIdx, secIdx)} className="p-2 bg-card/80 rounded-full text-destructive-foreground hover:bg-card"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => openImageStudio('section', section.images?.length || 0, secIdx)} className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-border rounded-md cursor-pointer bg-muted/30 hover:bg-muted transition-colors group p-4">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Add Image to Section
                  </button>
                </div>
              </section>

              <section>
                <h3 className="text-md font-semibold text-foreground mb-2">Section Formulas (IDs)</h3>
                <div className="space-y-3">
                  {newTopic.article.sections[secIdx].formulas?.map((formulaId, formulaIdx) => (
                    <DynamicListItem key={formulaIdx} onRemove={() => removeSectionFormula(secIdx, formulaIdx)}>
                      <input
                        type="text"
                        value={formulaId || ''}
                        onChange={(e) => handleUpdate(`article.sections.${secIdx}.formulas.${formulaIdx}`, e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring transition-colors bg-input text-sm"
                        placeholder="Enter Formula ID"
                      />
                    </DynamicListItem>
                  ))}
                  <button type="button" onClick={() => addSectionFormula(secIdx)} className="flex items-center text-primary hover:text-primary/80 text-sm font-medium">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Add Formula ID to Section
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={addSection} className="w-full py-2 border-2 border-dashed border-border rounded-md text-muted-foreground hover:bg-muted hover:border-primary/50 transition-colors">
        + Add New Section
      </button>
    </div>
  );
};

export default SectionsTab;
