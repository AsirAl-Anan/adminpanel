import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../config/axios.js';

import SubjectDetails from './SubjectDetails.jsx';
import ChapterList from './ChapterList.jsx';

const SubjectManagementPage = () => {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubjectData = async () => {
    try {
      const response = await axios.get(`/subject/${id}`);
      console.log("sub",response.data.data);
      setSubject(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load subject data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjectData();
  }, [id]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="text-red-500 p-6">{error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Subject</h1>
      
      <div className="">
        <SubjectDetails subject={subject} onSave={fetchSubjectData} />
        <ChapterList subject={subject} onUpdate={fetchSubjectData} />
      </div>
    </div>
  );
};

export default SubjectManagementPage;