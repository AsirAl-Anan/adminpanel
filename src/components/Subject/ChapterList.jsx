// components/ChapterList.js
import React, { useState } from 'react';
import axios from '../../config/axios';
import ChapterItem from './ChapterItem';

const ChapterList = ({ subject, onUpdate }) => {
  const [newChapter, setNewChapter] = useState({
    englishName: '',
    banglaName: '',
    index: subject?.chapters?.length || 0,
    topics: [
      {
        englishName: '',
        banglaName: '',
        topicCode: '',
        description: '',
        index: 0,
        formulas: [
          {
            equation: '',
            derivation: '',
            explanation: ''
          }
        ],
        aliases: {
          english: [''],
          bangla: [''],
          banglish: ['']
        }
      }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState({});

  // Chapter field handlers
  const handleChapterFieldChange = (field, value) => {
    setNewChapter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Topic handlers
  const handleTopicChange = (topicIndex, field, value) => {
    setNewChapter(prev => {
      const updatedTopics = [...prev.topics];
      updatedTopics[topicIndex] = {
        ...updatedTopics[topicIndex],
        [field]: value
      };
      return {
        ...prev,
        topics: updatedTopics
      };
    });
  };

  const handleTopicFieldChange = (topicIndex, field, value) => {
    setNewChapter(prev => {
      const updatedTopics = [...prev.topics];
      updatedTopics[topicIndex] = {
        ...updatedTopics[topicIndex],
        [field]: value
      };
      return {
        ...prev,
        topics: updatedTopics
      };
    });
  };

  // Formula handlers
  const handleFormulaChange = (topicIndex, formulaIndex, field, value) => {
    setNewChapter(prev => {
      const updatedTopics = [...prev.topics];
      const updatedFormulas = [...updatedTopics[topicIndex].formulas];
      updatedFormulas[formulaIndex] = {
        ...updatedFormulas[formulaIndex],
        [field]: value
      };
      updatedTopics[topicIndex] = {
        ...updatedTopics[topicIndex],
        formulas: updatedFormulas
      };
      return {
        ...prev,
        topics: updatedTopics
      };
    });
  };

  const addFormula = (topicIndex) => {
    setNewChapter(prev => {
      const updatedTopics = [...prev.topics];
      updatedTopics[topicIndex].formulas.push({
        equation: '',
        derivation: '',
        explanation: ''
      });
      return {
        ...prev,
        topics: updatedTopics
      };
    });
  };

  const removeFormula = (topicIndex, formulaIndex) => {
    setNewChapter(prev => {
      const updatedTopics = [...prev.topics];
      updatedTopics[topicIndex].formulas.splice(formulaIndex, 1);
      return {
        ...prev,
        topics: updatedTopics
      };
    });
  };

  // Alias handlers
  const handleAliasChange = (topicIndex, aliasType, aliasIndex, value) => {
    setNewChapter(prev => {
      const updatedTopics = [...prev.topics];
      const updatedAliases = [...updatedTopics[topicIndex].aliases[aliasType]];
      updatedAliases[aliasIndex] = value;
      updatedTopics[topicIndex] = {
        ...updatedTopics[topicIndex],
        aliases: {
          ...updatedTopics[topicIndex].aliases,
          [aliasType]: updatedAliases
        }
      };
      return {
        ...prev,
        topics: updatedTopics
      };
    });
  };

  const addAlias = (topicIndex, aliasType) => {
    setNewChapter(prev => {
      const updatedTopics = [...prev.topics];
      updatedTopics[topicIndex].aliases[aliasType].push('');
      return {
        ...prev,
        topics: updatedTopics
      };
    });
  };

  const removeAlias = (topicIndex, aliasType, aliasIndex) => {
    setNewChapter(prev => {
      const updatedTopics = [...prev.topics];
      updatedTopics[topicIndex].aliases[aliasType].splice(aliasIndex, 1);
      return {
        ...prev,
        topics: updatedTopics
      };
    });
  };

  // Topic management
  const addTopic = () => {
    setNewChapter(prev => ({
      ...prev,
      topics: [
        ...prev.topics,
        {
          englishName: '',
          banglaName: '',
          topicCode: '',
          description: '',
          index: prev.topics.length,
          formulas: [
            {
              equation: '',
              derivation: '',
              explanation: ''
            }
          ],
          aliases: {
            english: [''],
            bangla: [''],
            banglish: ['']
          }
        }
      ]
    }));
    // Expand the new topic
    setExpandedTopics(prev => ({
      ...prev,
      [prev.topics.length]: true
    }));
  };

  const removeTopic = (topicIndex) => {
    if (newChapter.topics.length <= 1) {
      alert('At least one topic is required');
      return;
    }
    setNewChapter(prev => {
      const updatedTopics = [...prev.topics];
      updatedTopics.splice(topicIndex, 1);
      return {
        ...prev,
        topics: updatedTopics
      };
    });
  };

  const toggleTopicExpansion = (topicIndex) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicIndex]: !prev[topicIndex]
    }));
  };

  const handleAddChapter = async () => {
    // Validate chapter fields
    if (!newChapter.englishName || !newChapter.banglaName) {
      alert('Please fill in chapter name fields');
      return;
    }

    // Validate each topic
    for (let i = 0; i < newChapter.topics.length; i++) {
      const topic = newChapter.topics[i];
      if (!topic.englishName || !topic.banglaName || !topic.topicCode || !topic.description) {
        alert(`Please fill in all required fields for topic ${i + 1}`);
        return;
      }

      // Validate formulas (equation is required)
      for (let j = 0; j < topic.formulas.length; j++) {
        if (topic.formulas[j].equation.trim() === '') {
          alert(`Please fill in the equation for formula ${j + 1} in topic ${i + 1}`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const payload = {
        englishName: newChapter.englishName,
        banglaName: newChapter.banglaName,
        index: newChapter.index,
        topics: newChapter.topics.map(topic => ({
          englishName: topic.englishName,
          banglaName: topic.banglaName,
          topicCode: topic.topicCode,
          description: topic.description,
          index: topic.index,
          formulas: topic.formulas.filter(formula => formula.equation.trim() !== ''),
          aliases: {
            english: topic.aliases.english.filter(alias => alias.trim() !== ''),
            bangla: topic.aliases.bangla.filter(alias => alias.trim() !== ''),
            banglish: topic.aliases.banglish.filter(alias => alias.trim() !== '')
          }
        }))
      };

      await axios.post(`/subject/${subject._id}/chapters`, payload);
      onUpdate();
      
      // Reset form
      setNewChapter({
        englishName: '',
        banglaName: '',
        index: subject?.chapters?.length + 1,
        topics: [
          {
            englishName: '',
            banglaName: '',
            topicCode: '',
            description: '',
            index: 0,
            formulas: [
              {
                equation: '',
                derivation: '',
                explanation: ''
              }
            ],
            aliases: {
              english: [''],
              bangla: [''],
              banglish: ['']
            }
          }
        ]
      });
      setExpandedTopics({});
    } catch (err) {
      console.error(err);
      alert('Failed to add chapter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Chapter Management</h2>
        
        {/* Existing Chapters Section */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Existing Chapters</h3>
          {subject?.chapters?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subject?.chapters?.map((chapter, idx) => (
                <div key={chapter._id || idx} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <ChapterItem
                    chapter={chapter}
                    subjectId={subject._id}
                    chapterIndex={idx}
                    onUpdate={onUpdate}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-gray-500">No chapters available. Add your first chapter below.</p>
            </div>
          )}
        </div>

        {/* Add New Chapter Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-indigo-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Add New Chapter</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">English Name *</label>
                <input
                  placeholder="Chapter English Name"
                  value={newChapter.englishName}
                  onChange={(e) => handleChapterFieldChange('englishName', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bangla Name *</label>
                <input
                  placeholder="Chapter Bangla Name"
                  value={newChapter.banglaName}
                  onChange={(e) => handleChapterFieldChange('banglaName', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Topics Section */}
            <div className="border border-gray-200 rounded-lg p-5 mt-6 bg-gray-50">
              <div className="flex justify-between items-center mb-5">
                <h4 className="text-lg font-semibold text-gray-800">Topics</h4>
                <button
                  onClick={addTopic}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center transition duration-200"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add Topic
                </button>
              </div>

              {newChapter.topics.map((topic, topicIndex) => (
                <div key={topicIndex} className="border border-gray-200 rounded-lg mb-5 bg-white shadow-sm">
                  <div 
                    className="flex justify-between items-center p-4 bg-gray-100 cursor-pointer rounded-t-lg"
                    onClick={() => toggleTopicExpansion(topicIndex)}
                  >
                    <h5 className="font-medium text-gray-800">Topic {topicIndex + 1}: {topic.englishName || 'Untitled'}</h5>
                    <div className="flex items-center space-x-2">
                      {newChapter.topics.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTopic(topicIndex);
                          }}
                          className="p-1 text-red-500 hover:bg-red-100 rounded-full"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      )}
                      <svg 
                        className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedTopics[topicIndex] ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>

                  {expandedTopics[topicIndex] && (
                    <div className="p-5 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">English Name *</label>
                          <input
                            placeholder="Topic English Name"
                            value={topic.englishName}
                            onChange={(e) => handleTopicFieldChange(topicIndex, 'englishName', e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bangla Name *</label>
                          <input
                            placeholder="Topic Bangla Name"
                            value={topic.banglaName}
                            onChange={(e) => handleTopicFieldChange(topicIndex, 'banglaName', e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Topic Code *</label>
                          <input
                            placeholder="Topic Code"
                            value={topic.topicCode}
                            onChange={(e) => handleTopicFieldChange(topicIndex, 'topicCode', e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Index *</label>
                          <input
                            type="number"
                            placeholder="Topic Index"
                            value={topic.index}
                            onChange={(e) => handleTopicFieldChange(topicIndex, 'index', parseInt(e.target.value) || 0)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                          />
                        </div>
                      </div>

                      <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                        <textarea
                          placeholder="Topic Description"
                          value={topic.description}
                          onChange={(e) => handleTopicFieldChange(topicIndex, 'description', e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                          rows="3"
                        />
                      </div>

                      {/* Formulas Section */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                          <h6 className="font-medium text-gray-800">Formulas</h6>
                          <button
                            onClick={() => addFormula(topicIndex)}
                            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center text-sm transition duration-200"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            Add Formula
                          </button>
                        </div>

                        {topic.formulas.map((formula, formulaIndex) => (
                          <div key={formulaIndex} className="border border-gray-200 rounded-lg p-4 mb-3 bg-gray-50">
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-medium text-gray-700">Formula {formulaIndex + 1}</span>
                              {topic.formulas.length > 1 && (
                                <button
                                  onClick={() => removeFormula(topicIndex, formulaIndex)}
                                  className="p-1 text-red-500 hover:bg-red-100 rounded-full"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                  </svg>
                                </button>
                              )}
                            </div>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Equation *</label>
                                <input
                                  placeholder="Equation"
                                  value={formula.equation}
                                  onChange={(e) => handleFormulaChange(topicIndex, formulaIndex, 'equation', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Derivation</label>
                                <input
                                  placeholder="Derivation"
                                  value={formula.derivation}
                                  onChange={(e) => handleFormulaChange(topicIndex, formulaIndex, 'derivation', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Explanation</label>
                                <textarea
                                  placeholder="Explanation"
                                  value={formula.explanation}
                                  onChange={(e) => handleFormulaChange(topicIndex, formulaIndex, 'explanation', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                  rows="2"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Aliases Section */}
                      <div>
                        <h6 className="font-medium text-gray-800 mb-3">Aliases</h6>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-sm font-medium text-gray-700">English</label>
                              <button
                                onClick={() => addAlias(topicIndex, 'english')}
                                className="p-1 bg-gray-200 hover:bg-gray-300 rounded-full"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                              </button>
                            </div>
                            {topic.aliases.english.map((alias, aliasIndex) => (
                              <div key={aliasIndex} className="flex mb-2">
                                <input
                                  placeholder="English alias"
                                  value={alias}
                                  onChange={(e) => handleAliasChange(topicIndex, 'english', aliasIndex, e.target.value)}
                                  className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                />
                                {topic.aliases.english.length > 1 && (
                                  <button
                                    onClick={() => removeAlias(topicIndex, 'english', aliasIndex)}
                                    className="p-2 bg-red-100 text-red-500 hover:bg-red-200 rounded-r-md"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-sm font-medium text-gray-700">Bangla</label>
                              <button
                                onClick={() => addAlias(topicIndex, 'bangla')}
                                className="p-1 bg-gray-200 hover:bg-gray-300 rounded-full"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                              </button>
                            </div>
                            {topic.aliases.bangla.map((alias, aliasIndex) => (
                              <div key={aliasIndex} className="flex mb-2">
                                <input
                                  placeholder="Bangla alias"
                                  value={alias}
                                  onChange={(e) => handleAliasChange(topicIndex, 'bangla', aliasIndex, e.target.value)}
                                  className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                />
                                {topic.aliases.bangla.length > 1 && (
                                  <button
                                    onClick={() => removeAlias(topicIndex, 'bangla', aliasIndex)}
                                    className="p-2 bg-red-100 text-red-500 hover:bg-red-200 rounded-r-md"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-sm font-medium text-gray-700">Banglish</label>
                              <button
                                onClick={() => addAlias(topicIndex, 'banglish')}
                                className="p-1 bg-gray-200 hover:bg-gray-300 rounded-full"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                              </button>
                            </div>
                            {topic.aliases.banglish.map((alias, aliasIndex) => (
                              <div key={aliasIndex} className="flex mb-2">
                                <input
                                  placeholder="Banglish alias"
                                  value={alias}
                                  onChange={(e) => handleAliasChange(topicIndex, 'banglish', aliasIndex, e.target.value)}
                                  className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                />
                                {topic.aliases.banglish.length > 1 && (
                                  <button
                                    onClick={() => removeAlias(topicIndex, 'banglish', aliasIndex)}
                                    className="p-2 bg-red-100 text-red-500 hover:bg-red-200 rounded-r-md"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleAddChapter}
                disabled={loading}
                className={`px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 flex items-center ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Chapter...
                  </>
                ) : (
                  'Add Chapter'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterList;