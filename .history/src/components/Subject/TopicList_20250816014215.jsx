// components/TopicList.js
import React, { useState } from 'react';
import axios from '../../config/axios';

const TopicList = ({ subjectId, chapterIndex, topics, onUpdate }) => {
  const [isTopicsVisible, setIsTopicsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newTopic, setNewTopic] = useState({
    englishName: '',
    banglaName: '',
    topicCode: '',
    description: '',
    index: topics.length,
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
  });

  const toggleTopicsVisibility = () => {
    setIsTopicsVisible(!isTopicsVisible);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewTopic({
      englishName: '',
      banglaName: '',
      topicCode: '',
      description: '',
      index: topics.length,
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
    });
  };

  const handleAddTopic = async () => {
    if (!newTopic.englishName || !newTopic.banglaName || !newTopic.topicCode) return;

    setLoading(true);
    try {
      const response = await axios.put(
        `/subject/${subjectId}/chapters/${chapterIndex}/topics`,
        { topic: newTopic },
        { withCredentials: true }
      );
      onUpdate();
      closeModal();
    } catch (err) {
      console.error('Failed to add topic:', err);
      alert('Failed to add topic');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTopic = async (topicIndex) => {
    const confirm = window.confirm('Are you sure you want to delete this topic?');
    if (!confirm) return;

    try {
      await axios.delete(`/subject/${subjectId}/chapters/${chapterIndex}/topics/${topicIndex}`);
      onUpdate();
    } catch (err) {
      alert('Failed to delete topic');
    }
  };

  // Formula management functions
  const addFormula = () => {
    setNewTopic({
      ...newTopic,
      formulas: [
        ...newTopic.formulas,
        {
          equation: '',
          derivation: '',
          explanation: ''
        }
      ]
    });
  };

  const updateFormula = (index, field, value) => {
    const updatedFormulas = [...newTopic.formulas];
    updatedFormulas[index][field] = value;
    setNewTopic({
      ...newTopic,
      formulas: updatedFormulas
    });
  };

  const removeFormula = (index) => {
    if (newTopic.formulas.length <= 1) return; // Keep at least one formula
    const updatedFormulas = newTopic.formulas.filter((_, i) => i !== index);
    setNewTopic({
      ...newTopic,
      formulas: updatedFormulas
    });
  };

  // Alias management functions
  const updateAlias = (lang, index, value) => {
    const updatedAliases = [...newTopic.aliases[lang]];
    updatedAliases[index] = value;
    setNewTopic({
      ...newTopic,
      aliases: {
        ...newTopic.aliases,
        [lang]: updatedAliases
      }
    });
  };

  const addAliasField = (lang) => {
    const updatedAliases = [...newTopic.aliases[lang], ''];
    setNewTopic({
      ...newTopic,
      aliases: {
        ...newTopic.aliases,
        [lang]: updatedAliases
      }
    });
  };

  const removeAliasField = (lang, index) => {
    const updatedAliases = newTopic.aliases[lang].filter((_, i) => i !== index);
    setNewTopic({
      ...newTopic,
      aliases: {
        ...newTopic.aliases,
        [lang]: updatedAliases
      }
    });
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={toggleTopicsVisibility}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isTopicsVisible ? 'Hide Topics' : 'Show Topics'}
        </button>
        <button
          onClick={openModal}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add Topic
        </button>
      </div>

      {/* Topics List */}
      {isTopicsVisible && (
        <ul className="list-disc pl-5 space-y-2">
          {topics.map((topic, idx) => (
            <li key={idx} className="flex justify-between items-center">
              <span>
                {topic.englishName} ({topic.banglaName}) - {topic.topicCode}
              </span>
              <button
                onClick={() => handleDeleteTopic(idx)}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Modal for Adding Topic */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-11/12 md:w-1/2 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Topic</h3>

            {/* Basic Fields */}
            <label className="block mb-2">
              English Name:
              <input
                type="text"
                value={newTopic.englishName}
                onChange={(e) =>
                  setNewTopic({ ...newTopic, englishName: e.target.value })
                }
                className="w-full p-2 border rounded mt-1"
              />
            </label>

            <label className="block mb-2">
              Bangla Name:
              <input
                type="text"
                value={newTopic.banglaName}
                onChange={(e) =>
                  setNewTopic({ ...newTopic, banglaName: e.target.value })
                }
                className="w-full p-2 border rounded mt-1"
              />
            </label>

            <label className="block mb-2">
              Topic Code:
              <input
                type="text"
                value={newTopic.topicCode}
                onChange={(e) =>
                  setNewTopic({ ...newTopic, topicCode: e.target.value })
                }
                className="w-full p-2 border rounded mt-1"
              />
            </label>

            <label className="block mb-2">
              Description:
              <textarea
                value={newTopic.description}
                onChange={(e) =>
                  setNewTopic({ ...newTopic, description: e.target.value })
                }
                className="w-full p-2 border rounded mt-1"
              />
            </label>

            {/* Formulas Section */}
            <fieldset className="border p-3 rounded mb-4">
              <legend className="font-semibold">Formulas</legend>
              {newTopic.formulas.map((formula, idx) => (
                <div key={idx} className="border p-3 rounded mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Formula {idx + 1}</h4>
                    {newTopic.formulas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFormula(idx)}
                        className="text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <label className="block mb-2">
                    Equation:
                    <input
                      type="text"
                      value={formula.equation}
                      onChange={(e) => updateFormula(idx, 'equation', e.target.value)}
                      className="w-full p-2 border rounded mt-1"
                    />
                  </label>
                  <label className="block mb-2">
                    Derivation:
                    <input
                      type="text"
                      value={formula.derivation}
                      onChange={(e) => updateFormula(idx, 'derivation', e.target.value)}
                      className="w-full p-2 border rounded mt-1"
                    />
                  </label>
                  <label className="block mb-2">
                    Explanation:
                    <textarea
                      value={formula.explanation}
                      onChange={(e) => updateFormula(idx, 'explanation', e.target.value)}
                      className="w-full p-2 border rounded mt-1"
                    />
                  </label>
                </div>
              ))}
              <button
                type="button"
                onClick={addFormula}
                className="text-blue-500 text-sm"
              >
                + Add Formula
              </button>
            </fieldset>

            {/* Aliases */}
            {['english', 'bangla', 'banglish'].map((lang) => (
              <div key={lang} className="mb-4">
                <label className="block font-medium">{lang.charAt(0).toUpperCase() + lang.slice(1)} Aliases</label>
                {newTopic.aliases[lang].map((alias, idx) => (
                  <div key={idx} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={alias}
                      onChange={(e) => updateAlias(lang, idx, e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeAliasField(lang, idx)}
                      className="text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addAliasField(lang)}
                  className="text-blue-500 text-sm"
                >
                  + Add {lang} alias
                </button>
              </div>
            ))}

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTopic}
                disabled={loading}
                className={`px-4 py-2 bg-teal-500 text-white rounded ${
                  loading ? 'opacity-50' : ''
                }`}
              >
                {loading ? 'Adding...' : 'Add Topic'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicList;