"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "../../config/axios.js"
import { ClipLoader } from "react-spinners"
import { showErrorToast } from "../../../lib/toast.ts"
import SubjectDetails from "./SubjectDetails.jsx"
import ChapterList from "./ChapterList.jsx"

const SubjectManagementPage = () => {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const storedTab = localStorage.getItem('subjectManagementActiveTab');
      return storedTab ? JSON.parse(storedTab) : 'details';
    } catch (error) {
      console.error("Failed to read subjectManagementActiveTab from localStorage", error);
      return 'details';
    }
  });

  const fetchSubjectData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/subject/subjects/${id}`);
      setSubject(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load subject data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjectData();
  }, [id]);

  useEffect(() => {
    try {
      localStorage.setItem('subjectManagementActiveTab', JSON.stringify(activeTab));
    } catch (error) {
      console.error("Failed to write subjectManagementActiveTab to localStorage", error);
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ClipLoader color="hsl(var(--primary))" size={40} speedMultiplier={0.8} />
      </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center text-destructive-foreground p-6">
            {error}
        </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Manage Subject</h1>
            {subject && (
              <p className="text-muted-foreground mt-1">
                Edit details, chapters, and topics for "{subject.name?.en}"
              </p>
            )}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-border mb-8">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('details')}
              className={`whitespace-nowrap py-3 px-2 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none ${
                activeTab === 'details'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              Subject Details
            </button>
            <button
              onClick={() => setActiveTab('chapters')}
              className={`whitespace-nowrap py-3 px-2 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none ${
                activeTab === 'chapters'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              Chapters & Topics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'details' && subject && (
            <SubjectDetails subject={subject} onSave={fetchSubjectData} />
          )}
          {activeTab === 'chapters' && subject && (
            <ChapterList subject={subject} onUpdate={fetchSubjectData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectManagementPage;