// components/SubjectDetails.js
import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';

const SubjectDetails = ({ subject, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...subject });
  const [loading, setLoading] = useState(false);
    useEffect(()=>{
         console.log("s",formData)
    },[formData])
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(`/subject/${subject._id}`, formData);
      onSave();
      setIsEditing(false);
    } catch (err) {
      alert('Error saving subject details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Subject Details</h2>
      {isEditing ? (
        <div className="space-y-4">
          <input
            name="englishName"
            value={formData.englishName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="English Name"
          />
          <input
            name="banglaName"
            value={formData.banglaName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Bangla Name"
          />
          <input
            name="subjectCode"
            type="number"
            value={formData.subjectCode}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Subject Code"
          />
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Level</option>
            <option value="SSC">SSC</option>
            <option value="HSC">HSC</option>
          </select>
          <select
            name="group"
            value={formData.group}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Group</option>
            <option value="science">Science</option>
            <option value="arts">Arts</option>
            <option value="commerce">Commerce</option>
          </select>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className={`px-4 py-2 bg-blue-500 text-white rounded ${loading ? 'opacity-50' : ''}`}
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p><strong>English Name:</strong> {subject.englishName}</p>
          <p><strong>Bangla Name:</strong> {subject.banglaName}</p>
          <p><strong>Code:</strong> {subject.subjectCode}</p>
          <p><strong>Level:</strong> {subject.level}</p>
          <p><strong>Group:</strong> {subject.group}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
          >
            Edit Details
          </button>
        </div>
      )}
    </div>
  );
};

export default SubjectDetails;