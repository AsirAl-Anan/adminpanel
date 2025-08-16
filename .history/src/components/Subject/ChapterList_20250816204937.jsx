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
    } catch (err) {
      console.error(err);
      alert('Failed to add chapter');
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Chapters</h2>
      <ul className="space-y-0"> {/* Reduced space-y */}
        {/* Existing Chapters */}
        {subject?.chapters?.map((chapter, idx) => (
          <ChapterItem
            key={chapter._id || idx} // Ensure unique key
            chapter={chapter}
            subjectId={subject._id}
            chapterIndex={idx}
            onUpdate={onUpdate}
          />
        ))}
      </ul>

      {/* Add New Chapter Form */}
      <div className="mt-6 space-y-4 border-t pt-4">
        <h3 className="font-medium text-lg">Add New Chapter</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            placeholder="Chapter English Name *"
            value={newChapter.englishName}
            onChange={(e) => handleChapterFieldChange('englishName', e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            placeholder="Chapter Bangla Name *"
            value={newChapter.banglaName}
            onChange={(e) => handleChapterFieldChange('banglaName', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Topics Section */}
        <div className="border rounded p-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Topics</h4>
            <button
              onClick={addTopic}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm"
            >
              Add Topic
            </button>
          </div>

          {newChapter.topics.map((topic, topicIndex) => (
            <div key={topicIndex} className="border rounded p-4 mb-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h5 className="font-medium">Topic {topicIndex + 1}</h5>
                {newChapter.topics.length > 1 && (
                  <button
                    onClick={() => removeTopic(topicIndex)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input
                  placeholder="Topic English Name *"
                  value={topic.englishName}
                  onChange={(e) => handleTopicFieldChange(topicIndex, 'englishName', e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <input
                  placeholder="Topic Bangla Name *"
                  value={topic.banglaName}
                  onChange={(e) => handleTopicFieldChange(topicIndex, 'banglaName', e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <input
                  placeholder="Topic Code *"
                  value={topic.topicCode}
                  onChange={(e) => handleTopicFieldChange(topicIndex, 'topicCode', e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="Topic Index *"
                  value={topic.index}
                  onChange={(e) => handleTopicFieldChange(topicIndex, 'index', parseInt(e.target.value) || 0)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <textarea
                placeholder="Topic Description *"
                value={topic.description}
                onChange={(e) => handleTopicFieldChange(topicIndex, 'description', e.target.value)}
                className="w-full p-2 border rounded mb-3"
                rows="3"
              />

              {/* Formulas Section */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm">Formulas</span>
                  <button
                    onClick={() => addFormula(topicIndex)}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                  >
                    Add Formula
                  </button>
                </div>

                {topic.formulas.map((formula, formulaIndex) => (
                  <div key={formulaIndex} className="border rounded p-3 mb-2 bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium">Formula {formulaIndex + 1}</span>
                      {topic.formulas.length > 1 && (
                        <button
                          onClick={() => removeFormula(topicIndex, formulaIndex)}
                          className="px-1 py-0.5 bg-red-400 text-white rounded text-xs"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <input
                      placeholder="Equation *"
                      value={formula.equation}
                      onChange={(e) => handleFormulaChange(topicIndex, formulaIndex, 'equation', e.target.value)}
                      className="w-full p-1 border rounded text-sm mb-1"
                    />
                    <input
                      placeholder="Derivation"
                      value={formula.derivation}
                      onChange={(e) => handleFormulaChange(topicIndex, formulaIndex, 'derivation', e.target.value)}
                      className="w-full p-1 border rounded text-sm mb-1"
                    />
                    <textarea
                      placeholder="Explanation"
                      value={formula.explanation}
                      onChange={(e) => handleFormulaChange(topicIndex, formulaIndex, 'explanation', e.target.value)}
                      className="w-full p-1 border rounded text-sm"
                      rows="2"
                    />
                  </div>
                ))}
              </div>

              {/* Aliases Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium">English Aliases</span>
                    <button
                      onClick={() => addAlias(topicIndex, 'english')}
                      className="px-1 py-0.5 bg-gray-400 text-white rounded text-xs"
                    >
                      +
                    </button>
                  </div>
                  {topic.aliases.english.map((alias, aliasIndex) => (
                    <div key={aliasIndex} className="flex mb-1">
                      <input
                        placeholder="English alias"
                        value={alias}
                        onChange={(e) => handleAliasChange(topicIndex, 'english', aliasIndex, e.target.value)}
                        className="flex-1 p-1 border rounded text-sm"
                      />
                      {topic.aliases.english.length > 1 && (
                        <button
                          onClick={() => removeAlias(topicIndex, 'english', aliasIndex)}
                          className="ml-1 px-1 py-0.5 bg-red-400 text-white rounded text-xs"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium">Bangla Aliases</span>
                    <button
                      onClick={() => addAlias(topicIndex, 'bangla')}
                      className="px-1 py-0.5 bg-gray-400 text-white rounded text-xs"
                    >
                      +
                    </button>
                  </div>
                  {topic.aliases.bangla.map((alias, aliasIndex) => (
                    <div key={aliasIndex} className="flex mb-1">
                      <input
                        placeholder="Bangla alias"
                        value={alias}
                        onChange={(e) => handleAliasChange(topicIndex, 'bangla', aliasIndex, e.target.value)}
                        className="flex-1 p-1 border rounded text-sm"
                      />
                      {topic.aliases.bangla.length > 1 && (
                        <button
                          onClick={() => removeAlias(topicIndex, 'bangla', aliasIndex)}
                          className="ml-1 px-1 py-0.5 bg-red-400 text-white rounded text-xs"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium">Banglish Aliases</span>
                    <button
                      onClick={() => addAlias(topicIndex, 'banglish')}
                      className="px-1 py-0.5 bg-gray-400 text-white rounded text-xs"
                    >
                      +
                    </button>
                  </div>
                  {topic.aliases.banglish.map((alias, aliasIndex) => (
                    <div key={aliasIndex} className="flex mb-1">
                      <input
                        placeholder="Banglish alias"
                        value={alias}
                        onChange={(e) => handleAliasChange(topicIndex, 'banglish', aliasIndex, e.target.value)}
                        className="flex-1 p-1 border rounded text-sm"
                      />
                      {topic.aliases.banglish.length > 1 && (
                        <button
                          onClick={() => removeAlias(topicIndex, 'banglish', aliasIndex)}
                          className="ml-1 px-1 py-0.5 bg-red-400 text-white rounded text-xs"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleAddChapter}
          disabled={loading}
          className={`px-4 py-2 bg-indigo-500 text-white rounded ${loading ? 'opacity-50' : ''}`}
        >
          {loading ? 'Adding Chapter...' : 'Add Chapter'}
        </button>
      </div>
    </div>
  );
};

export default ChapterList;