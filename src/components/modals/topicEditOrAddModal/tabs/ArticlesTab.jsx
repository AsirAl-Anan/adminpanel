import React, { useState, useEffect } from 'react';
import BilingualInput from '../ui/BilingualInput';
import DynamicListItem from '../ui/DynamicListItem';
import ImagePreview from '../ui/ImagePreview';
import FormulaInput from '../ui/FormulaInput'; // Assuming this new component will be created

const ArticlesTab = ({
  article,
  articleIndex,
  handleUpdate,
  removeArticle,
  addSection,
  removeSection,
  openImageStudio,
  removeImage,
  addSectionFormula,
  removeSectionFormula,
  openExtractArticleModal,
}) => {
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    setActiveSection(0) // Reset active section when active article changes
  }, [articleIndex])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Article {articleIndex + 1}</h3>
        <button
          type="button"
          onClick={() => removeArticle(articleIndex)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          Remove Article
        </button>
      </div>

      <div className="p-4 space-y-6 animate-in fade-in duration-300">
        <section>
          <h3 className="text-md font-semibold text-gray-800 mb-2">Learning Outcomes</h3>
          <BilingualInput
            label="Learning Outcomes (comma-separated)"
            fieldName={`articles.${articleIndex}.learningOutcomes`}
            englishValue={
              Array.isArray(article?.learningOutcomes?.en)
                ? article.learningOutcomes.en.join(", ")
                : article?.learningOutcomes?.en || ""
            }
            banglaValue={
              Array.isArray(article?.learningOutcomes?.bn)
                ? article.learningOutcomes.bn.join(", ")
                : article?.learningOutcomes?.bn || ""
            }
            onUpdate={(fullPath, value) => {
              const newArrayValue = value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
              handleUpdate(fullPath, newArrayValue)
            }}
            isTextarea
          />
          <BilingualInput
            label="Description"
            fieldName={`articles.${articleIndex}.body`}
            banglaValue={article.body?.bn || ""}
            englishValue={article?.body?.en || ""}
            onUpdate={(fullPath, value) => {
              handleUpdate(fullPath, value)
            }}
            isTextarea
          />
        </section>

        <section>
          <h3 className="text-md font-semibold text-gray-800 mb-2">Sections</h3>
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={openExtractArticleModal}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              Extract Article with AI
            </button>
          </div>
          {article.sections?.map((section, secIdx) => (
            <div key={section.id || secIdx} className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <div
                className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                onClick={() => setActiveSection(activeSection === secIdx ? null : secIdx)}
              >
                <h4 className="font-semibold text-gray-800">
                  Section {secIdx + 1}: {section.title?.en || "Untitled Section"}
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeSection(articleIndex, secIdx)
                    }}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${activeSection === secIdx ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {activeSection === secIdx && (
                <div className="p-4 space-y-6 animate-in fade-in duration-300">
                  <BilingualInput
                    label="Section Title"
                    fieldName={`articles.${articleIndex}.sections.${secIdx}.title`}
                    englishValue={section.title?.en}
                    banglaValue={section.title?.bn}
                    onUpdate={handleUpdate}
                    required
                  />
                  <BilingualInput
                    label="Section Body"
                    fieldName={`articles.${articleIndex}.sections.${secIdx}.body`}
                    englishValue={section.body?.en}
                    banglaValue={section.body?.bn}
                    onUpdate={handleUpdate}
                    isTextarea
                    required
                  />

                  <section>
                    <h3 className="text-md font-semibold text-gray-800 mb-2">Section Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {section.images?.map((image, imgIdx) => (
                        <div key={imgIdx} className="relative group bg-gray-50 rounded-xl border border-gray-200 p-2 text-center">
                          <ImagePreview image={image} />
                          <p className="text-xs font-medium text-gray-700 truncate">{image.caption?.en || "Untitled"}</p>
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                            <button
                              type="button"
                              onClick={() => openImageStudio("section", imgIdx, articleIndex, secIdx)}
                              className="p-2 bg-white/80 rounded-full text-blue-600 hover:bg-white"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage("section", imgIdx, articleIndex, secIdx)}
                              className="p-2 bg-white/80 rounded-full text-red-600 hover:bg-white"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => openImageStudio("section", section.images?.length || 0, articleIndex, secIdx)}
                        className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group p-4"
                      >
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Image to Section
                      </button>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-md font-semibold text-gray-800 mb-2">Section Formulas</h3>
                    <div className="space-y-3">
                      {article.sections[secIdx].formulas?.map((formula, formulaIdx) => (
                        <FormulaInput
                          key={formula._id || formulaIdx}
                          formula={formula}
                          onUpdate={(updatedFormula) =>
                            handleUpdate(`articles.${articleIndex}.sections.${secIdx}.formulas.${formulaIdx}`, updatedFormula)
                          }
                          onRemove={() => removeSectionFormula(articleIndex, secIdx, formulaIdx)}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => addSectionFormula(articleIndex, secIdx)}
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Formula to Section
                      </button>
                    </div>
                  </section>
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addSection(articleIndex)}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors mt-4"
          >
            + Add New Section
          </button>
        </section>
      </div>
    </div>
  )
}

export default ArticlesTab;
