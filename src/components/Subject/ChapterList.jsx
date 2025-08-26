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

        
      </div>
    </div>
  );
};

export default ChapterList;