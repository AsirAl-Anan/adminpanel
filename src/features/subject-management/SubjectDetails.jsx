import React from 'react';

const SubjectDetails = ({ subject }) => {
  if (!subject) {
    return <div className="p-4 text-center text-slate-500">No subject selected.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Subject Details</h3>
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-slate-700">English Name:</p>
          <p className="text-base text-slate-900">{subject.englishName}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">Bangla Name:</p>
          <p className="text-base text-slate-900">{subject.banglaName}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">Level:</p>
          <p className="text-base text-slate-900">{subject.level}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">Group:</p>
          <p className="text-base text-slate-900">{subject.group}</p>
        </div>
      </div>
    </div>
  );
};

export default SubjectDetails;
