// components/SubjectDetails.jsx
import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';
import { Loader2 } from 'lucide-react'; // For loading spinner

// A reusable component for displaying a single detail item
const DetailItem = ({ label, value }) => (
  <div className="py-4 px-5 bg-secondary rounded-lg">
    <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</dt>
    <dd className="mt-1 text-base font-semibold text-foreground">{value || '-'}</dd>
  </div>
);

// A reusable input component for the form
const FormInput = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-muted-foreground mb-1.5">{label}</label>
    <input 
      {...props}
      className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm"
    />
  </div>
);

// A reusable select component for the form
const FormSelect = ({ label, children, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-muted-foreground mb-1.5">{label}</label>
    <select
      {...props}
      className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm"
    >
      {children}
    </select>
  </div>
);


const SubjectDetails = ({ subject, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  // Effect to reset form data when the subject prop changes or editing is cancelled
  useEffect(() => {
    if (subject) {
      setFormData({
        name: {
          en: subject.name?.en || '',
          bn: subject.name?.bn || '',
        },
        subjectCode: subject.subjectCode || '',
        level: subject.level || '',
        group: subject.group || '',
      });
    }
  }, [subject, isEditing]); // Reruns when editing is cancelled to revert changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name.en' || name === 'name.bn') {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`/subject/subjects/${subject._id}`, formData);
      onSave(); // Refreshes parent data
      setIsEditing(false);
    } catch (error) {
      alert('Error saving subject details. Please try again.');
      console.error('Error saving subject details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border p-6 rounded-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
            <h2 className="text-2xl font-bold text-foreground">Subject Information</h2>
            <p className="text-sm text-muted-foreground mt-1">
                {isEditing ? 'Update the details for this subject.' : 'View the current details for this subject.'}
            </p>
        </div>
        {!isEditing && (
            <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-secondary text-foreground text-xs font-medium rounded-md hover:bg-muted transition-colors"
            >
                Edit Details
            </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <FormInput 
              label="English Name"
              name="name.en"
              value={formData.name.en}
              onChange={handleChange}
              placeholder="e.g., Physics"
              required
            />
            <FormInput 
              label="Bangla Name"
              name="name.bn"
              value={formData.name.bn}
              onChange={handleChange}
              placeholder="e.g., পদার্থবিজ্ঞান"
              required
            />
            <FormInput 
              label="Subject Code"
              name="subjectCode"
              type="number"
              value={formData.subjectCode}
              onChange={handleChange}
              placeholder="e.g., 174"
              required
            />
             <FormSelect
              label="Level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              required
            >
              <option value="">Select Level</option>
              <option value="SSC">SSC</option>
              <option value="HSC">HSC</option>
            </FormSelect>
             <FormSelect
              label="Group"
              name="group"
              value={formData.group}
              onChange={handleChange}
              required
            >
              <option value="">Select Group</option>
              <option value="SCIENCE">Science</option>
              <option value="HUMANITIES">Humanities</option>
              <option value="COMMERCE">Commerce</option>
            </FormSelect>
          </div>
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 bg-secondary text-foreground text-sm font-medium rounded-md hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <DetailItem label="" value={subject.name?.en} />
          <DetailItem label="" value={subject.name?.bn} />
          <DetailItem label="Subject Code" value={subject.subjectCode} />
          <DetailItem label="Level" value={subject.level} />
          <DetailItem label="Group" value={subject.group} />
        </dl>
      )}
    </div>
  );
};

export default SubjectDetails;
