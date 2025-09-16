import React, { useState, useEffect, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import axios from "../../config/axios.js"
import { showErrorToast, showSuccessToast, showWarningToast, showInfoToast } from '../toast/Toast.jsx';
import LatexRenderer from '../../pages/subpages/LatexRenderer'; // Assuming this component exists

// --- UTILITY FUNCTIONS FOR IMAGE CROPPING ---

function useDebounceEffect(fn, waitTime, deps) {
  useEffect(() => {
    const t = setTimeout(() => {
      fn();
    }, waitTime);

    return () => {
      clearTimeout(t);
    };
  }, deps);
}

function getCroppedImg(image, crop, fileName) {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      blob.name = fileName;
      resolve({ blob });
    }, 'image/jpeg');
  });
}

// --- REUSABLE UI COMPONENTS ---

const BilingualInput = ({ label, englishValue, banglaValue, onUpdate, fieldName, required = false, isTextarea = false }) => {
  const InputComponent = isTextarea ? 'textarea' : 'input';
  const commonProps = {
    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors bg-gray-50 text-sm",
    rows: isTextarea ? 4 : undefined,
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1">
          <span className="text-xs text-gray-500 ml-1">English</span>
          <InputComponent
            type="text"
            value={englishValue || ''}
            onChange={(e) => onUpdate(`${fieldName}.english`, e.target.value)}
            placeholder={`${label} (English)`}
            {...commonProps}
          />
        </div>
        <div className="flex-1">
          <span className="text-xs text-gray-500 ml-1">Bangla</span>
          <InputComponent
            type="text"
            value={banglaValue || ''}
            onChange={(e) => onUpdate(`${fieldName}.bangla`, e.target.value)}
            placeholder={`${label} (Bangla)`}
            {...commonProps}
          />
        </div>
      </div>
    </div>
  );
};

const AliasInput = ({ label, englishValue, banglaValue, banglishValue, onUpdate, fieldName }) => {
  const commonProps = {
    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors bg-gray-50 text-sm",
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="flex-1">
          <span className="text-xs text-gray-500 ml-1">English</span>
          <input
            type="text"
            value={englishValue || ''}
            onChange={(e) => onUpdate(`${fieldName}.english`, e.target.value)}
            placeholder="Alias (English)"
            {...commonProps}
          />
        </div>
        <div className="flex-1">
          <span className="text-xs text-gray-500 ml-1">Banglish</span>
          <input
            type="text"
            value={banglishValue || ''}
            onChange={(e) => onUpdate(`${fieldName}.banglish`, e.target.value)}
            placeholder="Alias (Banglish)"
            {...commonProps}
          />
        </div>
        <div className="flex-1">
          <span className="text-xs text-gray-500 ml-1">Bangla</span>
          <input
            type="text"
            value={banglaValue || ''}
            onChange={(e) => onUpdate(`${fieldName}.bangla`, e.target.value)}
            placeholder="Alias (Bangla)"
            {...commonProps}
          />
        </div>
      </div>
    </div>
  );
};

const DynamicListItem = ({ children, onRemove }) => (
  <div className="relative bg-gray-50 border border-gray-200 p-4 rounded-xl">
    {children}
    {onRemove && (
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
        aria-label="Remove item"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    )}
  </div>
);

// --- IMAGE STUDIO MODAL ---
const ImageStudioModal = ({ isOpen, onClose, onConfirm, initialData = {} }) => {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [aspect, setAspect] = useState(16 / 9);
  const [metadata, setMetadata] = useState({
    title: { english: '', bangla: '' },
    description: { english: '', bangla: '' },
  });
  const [originalFile, setOriginalFile] = useState(null);
  const [isExtractingDescription, setIsExtractingDescription] = useState(false);

  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData.file) { // Editing an existing new file
        const reader = new FileReader();
        reader.addEventListener('load', () => setImgSrc(reader.result.toString() || ''));
        reader.readAsDataURL(initialData.file);
        setOriginalFile(initialData.file);
      } else if (initialData.url) { // Editing a file from URL
        setImgSrc(initialData.url);
      } else {
        setImgSrc('');
        setOriginalFile(null);
      }
      setMetadata({
        title: initialData.title || { english: '', bangla: '' },
        description: initialData.description || { english: '', bangla: '' },
      });
      setCrop(undefined);
      setCompletedCrop(null);
    }
  }, [isOpen, initialData]);
  
  useDebounceEffect(
    async () => {
      if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current) {
        getCroppedImg(imgRef.current, completedCrop, originalFile?.name || 'cropped-image.jpg');
      }
    },
    100,
    [completedCrop]
  );
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const file = e.target.files[0];
      setOriginalFile(file);
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result.toString() || ''));
      reader.readAsDataURL(file);
    }
  };
  
  function onImageLoad(e) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height), width, height));
      setCompletedCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height), width, height));
    }
  }
  
  const handleGetDescription = async () => {
    let imageToSend = originalFile;

    if (!imageToSend && !imgRef.current) {
      showWarningToast('Please select an image first.');
      return;
    }

    setIsExtractingDescription(true);

    try {
      if (completedCrop?.width && completedCrop?.height && imgRef.current) {
        const { blob } = await getCroppedImg(imgRef.current, completedCrop, originalFile?.name || 'cropped-image.jpg');
        imageToSend = new File([blob], blob.name, { type: blob.type });
      }

      if (!imageToSend) {
        showErrorToast('Could not process the image for AI analysis.');
        setIsExtractingDescription(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('image', imageToSend);

      const response = await axios.post('/ai/extract-image-data', formData, {
         headers: { 'Content-Type': 'multipart/form-data' },
      });
console.log(response)
      if (response.data.data && (response.data.data.description || response.data.data.title)) {
        console.log("Extracted description:", response.data.data.description.bangla , response.data.data.title.bangla);
         setMetadata(prev => ({
            ...prev,
            description: {
              english: response.data.data.description.english || prev.description.english,
              bangla: response.data.data.description.bangla || prev.description.bangla,
            },
            title: {
              english: response.data.data.title.english || prev.title.english,
              bangla: response.data.data.title.bangla || prev.title.bangla,
            }
         }));
         showSuccessToast("Description extracted successfully!");
      } else {
        showWarningToast('Could not extract a valid description from the response.');
      }

    } catch (error) {
      console.error('Error getting description from image:', error);
      showErrorToast(`Failed to get description: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsExtractingDescription(false);
    }
  };

  const handleConfirm = async () => {
    if (!metadata.title.english.trim() || !metadata.title.bangla.trim() || !metadata.description.english.trim() || !metadata.description.bangla.trim()) {
      showWarningToast('Please fill in all required fields for the image.');
      return;
    }

    if (!completedCrop || !imgRef.current) {
      if(originalFile) {
        onConfirm({ file: originalFile, metadata });
        showSuccessToast("Image added with metadata.");
        onClose();
        return;
      }
      showWarningToast("Please select and crop an image.");
      return;
    }

    try {
      const { blob } = await getCroppedImg(imgRef.current, completedCrop, originalFile?.name || 'cropped-image.jpg');
      const croppedFile = new File([blob], blob.name, { type: blob.type });
      onConfirm({ file: croppedFile, metadata });
      showSuccessToast("Cropped image added with metadata.");
      onClose();
    } catch (e) {
      console.error(e);
      showErrorToast("Failed to crop the image.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="bg-gray-100 p-4 border-b border-gray-200 rounded-t-2xl">
          <h3 className="text-lg font-semibold text-gray-800">Image Studio</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col items-center bg-gray-50 p-4 rounded-lg">
            {!imgSrc ? (
              <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <p className="mt-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            ) : (
              <>
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                >
                  <img 
                    ref={imgRef} 
                    src={imgSrc} 
                    alt="Crop preview" 
                    onLoad={onImageLoad} 
                    style={{ maxHeight: '400px' }}
                    crossOrigin="anonymous" 
                  />
                </ReactCrop>
                <div className="mt-4 flex space-x-2">
                  <button onClick={() => setAspect(16/9)} className={`px-3 py-1 text-xs rounded ${aspect === 16/9 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>16:9</button>
                  <button onClick={() => setAspect(4/3)} className={`px-3 py-1 text-xs rounded ${aspect === 4/3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>4:3</button>
                  <button onClick={() => setAspect(1)} className={`px-3 py-1 text-xs rounded ${aspect === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1:1</button>
                  <button onClick={() => setAspect(undefined)} className={`px-3 py-1 text-xs rounded ${!aspect ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Free</button>
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            <BilingualInput
              label="Image Title"
              englishValue={metadata.title.english}
              banglaValue={metadata.title.bangla}
              onUpdate={(field, value) => {
                  const lang = field.split('.')[1];
                  setMetadata(prev => ({ ...prev, title: { ...prev.title, [lang]: value } }));
              }}
              fieldName="title"
              required
            />
            <BilingualInput
              label="Image Description"
              isTextarea
              englishValue={metadata.description.english}
              banglaValue={metadata.description.bangla}
              onUpdate={(field, value) => {
                  const lang = field.split('.')[1];
                  setMetadata(prev => ({ ...prev, description: { ...prev.description, [lang]: value } }));
              }}
              fieldName="description"
              required
            />
            <button
                type="button"
                onClick={handleGetDescription}
                disabled={!imgSrc || isExtractingDescription}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
                {isExtractingDescription ? ( <> <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Getting Description... </> ) : ( <> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg> Get Description from Image (AI) </> )}
            </button>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">Cancel</button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">Confirm & Add Image</button>
        </div>
      </div>
    </div>
  );
};

// --- TAB CONTENT COMPONENTS ---

const BasicInfoTab = ({ 
    newTopic, 
    handleUpdate, 
    addQuestionTypeField, removeQuestionTypeField,
    addAliasField, removeAliasField
}) => {
  return (
    <div className="space-y-8">
      <BilingualInput label="Topic Name" fieldName="name" englishValue={newTopic.name?.english} banglaValue={newTopic.name?.bangla} onUpdate={handleUpdate} required />
       <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type <span className="text-red-500">*</span>
        </label>
        <select value={newTopic.type || ''} onChange={(e) => handleUpdate('type', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          <option value="" disabled>Select a type</option>
          <option value="theory">Theory</option>
          <option value="practical">Practical</option>
        </select>
      </div>

   

      <section>
        <h4 className="font-medium text-gray-800 mb-2">Question Types</h4>
        <div className="space-y-3">
          {newTopic.questionTypes?.map((qt, idx) => (
            <DynamicListItem key={idx} onRemove={() => removeQuestionTypeField(idx)}>
              <BilingualInput label={`Type ${idx + 1}`} fieldName={`questionTypes.${idx}`} englishValue={qt.english} banglaValue={qt.bangla} onUpdate={handleUpdate} />
            </DynamicListItem>
          ))}
          <button type="button" onClick={addQuestionTypeField} className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Add Question Type
          </button>
        </div>
      </section>
    </div>
  );
};

// --- HELPER COMPONENT FOR SAFE IMAGE PREVIEWS (FIX FOR MEMORY LEAKS) ---
const ImagePreview = ({ image }) => {
    const [previewSrc, setPreviewSrc] = useState(null);

    useEffect(() => {
        if (!image) {
            setPreviewSrc(null);
            return;
        }

        let objectUrl = null;
        if (image.file && image.file instanceof File) {
            objectUrl = URL.createObjectURL(image.file);
            setPreviewSrc(objectUrl);
        }
        else if (image.url) {
            setPreviewSrc(image.url);
        }
        else {
            setPreviewSrc(null);
        }

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [image]);

    if (!previewSrc) {
        return (
            <div className="w-full h-24 bg-gray-200 rounded-md mb-2 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"></path></svg>
            </div>
        );
    }
    
    return (
        <img 
            src={previewSrc} 
            alt={image.title?.english || 'Image Preview'} 
            className="w-full h-24 object-cover rounded-md mb-2" 
        />
    );
};


const SegmentsTab = ({ newTopic, handleUpdate, addSegment, removeSegment, openImageStudio, removeImage, addSegmentFormula, removeSegmentFormula, addSegmentAlias, removeSegmentAlias, openExtractSegmentsModal }) => {
  const [activeSegment, setActiveSegment] = useState(0);

  return (
    <div className="space-y-4">
        <div className="flex justify-end">
            <button 
                type="button" 
                onClick={openExtractSegmentsModal}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                Extract Segments with AI
            </button>
        </div>
        {newTopic.segments?.map((segment, segIdx) => {
            const numAliases = segment.aliases?.english?.length || 0;

            return (
                <div key={segIdx} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div 
                        className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                        onClick={() => setActiveSegment(activeSegment === segIdx ? null : segIdx)}
                    >
                        <h4 className="font-semibold text-gray-800">Segment {segIdx + 1}: {segment.title?.english || 'Untitled Segment'}</h4>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={(e) => {e.stopPropagation(); removeSegment(segIdx);}} className="p-1 text-red-500 hover:text-red-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            <svg className={`w-5 h-5 text-gray-500 transform transition-transform ${activeSegment === segIdx ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>

                    {activeSegment === segIdx && (
                        <div className="p-4 space-y-6 animate-in fade-in duration-300">
                            <BilingualInput label="Segment Title" fieldName={`segments.${segIdx}.title`} englishValue={segment.title?.english} banglaValue={segment.title?.bangla} onUpdate={handleUpdate} required/>
                            <BilingualInput label="Segment Description" fieldName={`segments.${segIdx}.description`} englishValue={segment.description?.english} banglaValue={segment.description?.bangla} onUpdate={handleUpdate} isTextarea/>

                            <section>
                                <h3 className="text-md font-semibold text-gray-800 mb-2">Segment Aliases</h3>
                                <div className="space-y-3">
                                    {Array.from({ length: numAliases }).map((_, aliasIdx) => (
                                        <DynamicListItem key={aliasIdx} onRemove={() => removeSegmentAlias(segIdx, aliasIdx)}>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">{`Alias ${aliasIdx + 1}`}</label>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                    <div className="flex-1">
                                                        <span className="text-xs text-gray-500 ml-1">English</span>
                                                        <input
                                                            type="text"
                                                            value={segment.aliases?.english?.[aliasIdx] || ''}
                                                            onChange={(e) => handleUpdate(`segments.${segIdx}.aliases.english.${aliasIdx}`, e.target.value)}
                                                            placeholder="Alias (English)"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors bg-gray-50 text-sm"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="text-xs text-gray-500 ml-1">Banglish</span>
                                                        <input
                                                            type="text"
                                                            value={segment.aliases?.banglish?.[aliasIdx] || ''}
                                                            onChange={(e) => handleUpdate(`segments.${segIdx}.aliases.banglish.${aliasIdx}`, e.target.value)}
                                                            placeholder="Alias (Banglish)"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors bg-gray-50 text-sm"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="text-xs text-gray-500 ml-1">Bangla</span>
                                                        <input
                                                            type="text"
                                                            value={segment.aliases?.bangla?.[aliasIdx] || ''}
                                                            onChange={(e) => handleUpdate(`segments.${segIdx}.aliases.bangla.${aliasIdx}`, e.target.value)}
                                                            placeholder="Alias (Bangla)"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors bg-gray-50 text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </DynamicListItem>
                                    ))}
                                    <button type="button" onClick={() => addSegmentAlias(segIdx)} className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                        Add Alias to Segment
                                    </button>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-md font-semibold text-gray-800 mb-2">Segment Images</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {segment.images?.map((image, imgIdx) => (
                                        <div key={imgIdx} className="relative group bg-gray-50 rounded-xl border border-gray-200 p-2 text-center">
                                            <ImagePreview image={image} />
                                            <p className="text-xs font-medium text-gray-700 truncate">{image.title?.english || 'Untitled'}</p>
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                                <button type="button" onClick={() => openImageStudio('segment', imgIdx, segIdx)} className="p-2 bg-white/80 rounded-full text-blue-600 hover:bg-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg></button>
                                                <button type="button" onClick={() => removeImage('segment', imgIdx, segIdx)} className="p-2 bg-white/80 rounded-full text-red-600 hover:bg-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => openImageStudio('segment', segment.images?.length || 0, segIdx)} className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group p-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                    </button>
                                </div>
                            </section>
                            
                            <section>
                                <h3 className="text-md font-semibold text-gray-800 mb-2">Segment Formulas</h3>
                                <div className="space-y-3">
                                    {segment.formulas?.map((formula, formulaIdx) => (
                                        <DynamicListItem key={formulaIdx} onRemove={() => removeSegmentFormula(segIdx, formulaIdx)}>
                                           <div className="space-y-3">
  {/* Equation Input */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Equation
    </label>
    <input
      type="text"
      value={formula.equation}
      onChange={(e) =>
        handleUpdate(
          `segments.${segIdx}.formulas.${formulaIdx}.equation`,
          e.target.value
        )
      }
      placeholder="e.g. F = ma"
      className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg shadow-sm 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>

  {/* Derivation Input */}
  <BilingualInput
    label="Derivation"
    fieldName={`segments.${segIdx}.formulas.${formulaIdx}.derivation`}
    englishValue={formula.derivation?.english}
    banglaValue={formula.derivation?.bangla}
    onUpdate={handleUpdate}
  />

  {/* Explanation Input */}
  <BilingualInput
    label="Explanation"
    fieldName={`segments.${segIdx}.formulas.${formulaIdx}.explanation`}
    englishValue={formula.explanation?.english}
    banglaValue={formula.explanation?.bangla}
    onUpdate={handleUpdate}
  />
</div>

                                        </DynamicListItem>
                                    ))}
                                    <button type="button" onClick={() => addSegmentFormula(segIdx)} className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                        Add Formula to Segment
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            )
        })}

        <button type="button" onClick={addSegment} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors">
            + Add New Segment
        </button>
    </div>
  );
};

// --- IMAGE CROP MODAL ---
const ImageCropModal = ({ isOpen, onClose, onConfirm, imageFile }) => {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [aspect, setAspect] = useState(undefined); // Default to free aspect
  const imgRef = useRef(null);

  useEffect(() => {
    if (isOpen && imageFile) {
      setCrop(undefined);
      setCompletedCrop(null);
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(imageFile);
    }
  }, [isOpen, imageFile]);

  function onImageLoad(e) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      const initialCrop = centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height), width, height);
      setCrop(initialCrop);
      setCompletedCrop(initialCrop);
    }
  }

  const handleConfirm = async () => {
    if (!completedCrop?.width || !imgRef.current) {
        onConfirm(imageFile);
        showInfoToast("Original image used (no crop).");
        onClose();
        return;
    }

    try {
      const { blob } = await getCroppedImg(imgRef.current, completedCrop, imageFile.name);
      onConfirm(blob);
      showSuccessToast("Image cropped successfully.");
      onClose();
    } catch (e) {
      console.error("Cropping failed: ", e);
      showErrorToast("Cropping failed. Please try again.");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="bg-gray-100 p-4 border-b border-gray-200 rounded-t-2xl flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Crop Image</h3>
           <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors" aria-label="Close modal">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-gray-50">
            {imgSrc && (
              <>
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                >
                  <img 
                    ref={imgRef} 
                    src={imgSrc} 
                    alt="Crop preview" 
                    onLoad={onImageLoad} 
                    style={{ maxHeight: '60vh' }}
                    crossOrigin="anonymous" 
                  />
                </ReactCrop>
                <div className="mt-4 flex space-x-2">
                  <button onClick={() => setAspect(16/9)} className={`px-3 py-1 text-xs rounded ${aspect === 16/9 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>16:9</button>
                  <button onClick={() => setAspect(4/3)} className={`px-3 py-1 text-xs rounded ${aspect === 4/3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>4:3</button>
                  <button onClick={() => setAspect(1)} className={`px-3 py-1 text-xs rounded ${aspect === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1:1</button>
                  <button onClick={() => setAspect(undefined)} className={`px-3 py-1 text-xs rounded ${!aspect ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Free</button>
                </div>
              </>
            )}
        </div>
        <div className="bg-gray-100 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">Cancel</button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">Confirm Crop</button>
        </div>
      </div>
    </div>
  );
};

// --- EXTRACT SEGMENTS MODAL ---
const ExtractSegmentsModal = ({ isOpen, onClose, onExtractComplete }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [extractedData, setExtractedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [filesToCropQueue, setFilesToCropQueue] = useState([]);
  const [currentImageToCrop, setCurrentImageToCrop] = useState(null);
  const [editingImage, setEditingImage] = useState(null);

  useEffect(() => {
    if (filesToCropQueue.length > 0 && !isCropModalOpen) {
      const nextFile = filesToCropQueue[0];
      setCurrentImageToCrop(nextFile);
      setEditingImage(null);
      setIsCropModalOpen(true);
    }
  }, [filesToCropQueue, isCropModalOpen]);

  useEffect(() => {
    if (isOpen) {
      selectedImages.forEach(image => URL.revokeObjectURL(image.previewUrl));
      setSelectedImages([]);
      setExtractedData([]);
      setIsLoading(false);
      setError('');
      setFilesToCropQueue([]);
      setCurrentImageToCrop(null);
      setEditingImage(null);
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > 6) {
      showWarningToast('You can select up to 6 images in total.');
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setError('');
    setFilesToCropQueue(prev => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropConfirm = (croppedBlob) => {
    const originalFile = editingImage ? editingImage.originalFile : currentImageToCrop;
    
    if (editingImage) {
      URL.revokeObjectURL(editingImage.previewUrl);
      const updatedImage = {
        ...editingImage,
        croppedBlob: croppedBlob,
        previewUrl: URL.createObjectURL(croppedBlob),
      };
      setSelectedImages(prev => prev.map(img => img.id === editingImage.id ? updatedImage : img));
      setEditingImage(null);
    } else {
      const newImage = {
          id: Date.now() + Math.random(),
          originalFile: originalFile,
          croppedBlob: croppedBlob,
          previewUrl: URL.createObjectURL(croppedBlob),
      };
      setSelectedImages(prev => [...prev, newImage]);
      setFilesToCropQueue(prev => prev.slice(1));
    }
    
    setIsCropModalOpen(false);
    setCurrentImageToCrop(null);
  };
  
  const handleCropCancel = () => {
    if (!editingImage) {
        setFilesToCropQueue(prev => prev.slice(1));
    }
    setEditingImage(null);
    setIsCropModalOpen(false);
    setCurrentImageToCrop(null);
  }

  const handleEdit = (imageToEdit) => {
    setEditingImage(imageToEdit);
    setCurrentImageToCrop(imageToEdit.originalFile);
    setIsCropModalOpen(true);
  }

  const removeImage = (idToRemove) => {
    const imageToRemove = selectedImages.find(img => img.id === idToRemove);
    if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
    }
    setSelectedImages(prev => prev.filter(img => img.id !== idToRemove));
  };

  const handleExtract = async () => {
    if (selectedImages.length === 0) {
      showWarningToast('Please select at least one image.');
      return;
    }
    setIsLoading(true);
    setError('');
    setExtractedData([]);
    const formData = new FormData();
    selectedImages.forEach(image => {
      formData.append('topic', image.croppedBlob, image.originalFile.name);
    });
    try {
      const response = await axios.post('/ai/extract-segments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const segments = response.data?.result?.data;
      if (segments && Array.isArray(segments)) {
        console.log("Extracted segments:", segments);
        setExtractedData((prev)=> [...prev, ...segments]);
        showSuccessToast("Segments extracted successfully from images!");
      } else {
        console.log(response.data)
        console.error("Unexpected API response structure:", response.data);
        showErrorToast("Could not parse the extracted data from the server.");
      }
    } catch (err) {
      console.error("Error extracting segments:", err);
      showErrorToast(err.response?.data?.message || 'Failed to extract segments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConfirmImport = () => {
    if (extractedData && extractedData.length > 0) {
        onExtractComplete(extractedData);
        showSuccessToast("Segments imported into the form.");
        onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
          <div className="bg-gray-100 p-4 border-b border-gray-200 rounded-t-2xl flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Extract Segments from Images</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors" aria-label="Close modal">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images (up to 6)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {selectedImages.map((image) => (
                          <div key={image.id} className="relative group bg-gray-100 rounded-lg">
                              <img src={image.previewUrl} alt={`preview ${image.originalFile.name}`} className="w-full h-28 object-cover rounded-lg border border-gray-200" />
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                  <button type="button" onClick={() => handleEdit(image)} className="p-2 bg-white/80 rounded-full text-blue-600 hover:bg-white" title="Edit Crop"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg></button>
                                  <button type="button" onClick={() => removeImage(image.id)} className="p-2 bg-white/80 rounded-full text-red-600 hover:bg-white" title="Remove Image"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                              </div>
                          </div>
                      ))}
                      {selectedImages.length < 6 && (
                          <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                              <span className="text-xs text-gray-500 mt-1">Add Image</span>
                          </button>
                      )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
              
              <div className="flex justify-center">
                  <button onClick={handleExtract} disabled={isLoading || selectedImages.length === 0} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2">
                      {isLoading ? ( <> <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Extracting... </> ) : 'Extract Segments'}
                  </button>
              </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 rounded-b-2xl">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">Cancel</button>
            <button 
                onClick={handleConfirmImport} 
                disabled={extractedData.length === 0} 
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:bg-green-300 disabled:cursor-not-allowed">
                  Import Segments
            </button>
          </div>
        </div>
      </div>
      <ImageCropModal 
        isOpen={isCropModalOpen}
        onClose={handleCropCancel}
        onConfirm={handleCropConfirm}
        imageFile={currentImageToCrop}
      />
    </>
  );
};

// --- MAIN MODAL COMPONENT ---

const TopicAddOrEditModal = ({
    isEditMode,
    closeAddEditModal,
    newTopic,
    setNewTopic,
    handleAddTopic,
    handleEditTopic,
    loading,
}) => {
    const [activeTab, setActiveTab] = useState('basic');
    const [isMaximized, setIsMaximized] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isImageStudioOpen, setImageStudioOpen] = useState(false);
    const [imageStudioConfig, setImageStudioConfig] = useState({ type: null, index: null, segmentIndex: null });
    const [isExtractModalOpen, setExtractModalOpen] = useState(false);

    const tabs = [
        { id: 'basic', label: 'Basic Info' },
        { id: 'segments', label: 'Segments' },
    ];

    useEffect(() => {
        const validate = () => {
            if (!newTopic.name?.english?.trim() || !newTopic.name?.bangla?.trim() || !newTopic.type) {
                return false;
            }
            for (const segment of newTopic.segments) {
                if (!segment.title?.english?.trim() || !segment.title?.bangla?.trim()) {
                    return false;
                }
            }
            return true;
        };
        setIsFormValid(validate());
    }, [newTopic]);

    const handleUpdate = (path, value) => {
      setNewTopic(prev => {
        const newState = structuredClone(prev);
        let current = newState;
        const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            const nextKey = keys[i + 1];
            current[keys[i]] = String(Number(nextKey)) === nextKey ? [] : {};
          }
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newState;
      });
    };
    
    const addAliasField = () => setNewTopic(p => ({ ...p, aliases: [...(p.aliases || []), { english: '', bangla: '', banglish: '' }] }));
    const removeAliasField = (index) => setNewTopic(p => ({ ...p, aliases: p.aliases.filter((_, i) => i !== index) }));
    
    const addQuestionTypeField = () => setNewTopic(p => ({ ...p, questionTypes: [...(p.questionTypes || []), { english: '', bangla: '' }] }));
    const removeQuestionTypeField = (index) => setNewTopic(p => ({ ...p, questionTypes: p.questionTypes.filter((_, i) => i !== index) }));
    
    const addFormula = () => setNewTopic(p => ({ ...p, formulas: [...(p.formulas || []), { equation: '', derivation: { english: '', bangla: '' }, explanation: { english: '', bangla: '' }}]}));
    const removeFormula = (index) => setNewTopic(p => ({ ...p, formulas: p.formulas.filter((_, i) => i !== index) }));

    const addSegment = () => setNewTopic(p => ({ ...p, segments: [...p.segments, { title: { english: '', bangla: '' }, description: { english: '', bangla: '' }, aliases: { english: [], bangla: [], banglish: [] }, images: [], formulas: [] }]}));
    const removeSegment = (segIdx) => setNewTopic(p => ({ ...p, segments: p.segments.filter((_, i) => i !== segIdx)}));

    const addSegmentAlias = (segIdx) => {
        setNewTopic(p => ({
            ...p,
            segments: p.segments.map((segment, i) => {
                if (i === segIdx) {
                    const currentAliases = segment.aliases || { english: [], bangla: [], banglish: [] };
                    return {
                        ...segment,
                        aliases: {
                            english: [...(currentAliases.english || []), ''],
                            bangla: [...(currentAliases.bangla || []), ''],
                            banglish: [...(currentAliases.banglish || []), ''],
                        }
                    };
                }
                return segment;
            })
        }));
    };
    
    const removeSegmentAlias = (segIdx, aliasIdx) => {
        setNewTopic(p => ({
            ...p,
            segments: p.segments.map((segment, i) => {
                if (i === segIdx && segment.aliases) {
                    return {
                        ...segment,
                        aliases: {
                            english: segment.aliases.english.filter((_, j) => j !== aliasIdx),
                            bangla: segment.aliases.bangla.filter((_, j) => j !== aliasIdx),
                            banglish: segment.aliases.banglish.filter((_, j) => j !== aliasIdx),
                        }
                    };
                }
                return segment;
            })
        }));
    };

    const addSegmentFormula = (segIdx) => {
        setNewTopic(p => ({
            ...p,
            segments: p.segments.map((segment, i) =>
                i === segIdx
                    ? { ...segment, formulas: [...(segment.formulas || []), { equation: '', derivation: { english: '', bangla: '' }, explanation: { english: '', bangla: '' }}] }
                    : segment
            )
        }));
    }
    const removeSegmentFormula = (segIdx, formulaIdx) => {
        setNewTopic(p => ({
            ...p,
            segments: p.segments.map((segment, i) =>
                i === segIdx
                    ? { ...segment, formulas: segment.formulas.filter((_, j) => j !== formulaIdx) }
                    : segment
            )
        }));
    }

    const openImageStudio = (type, index, segmentIndex = null) => {
        setImageStudioConfig({ type, index, segmentIndex });
        setImageStudioOpen(true);
    };

const handleImageConfirm = ({ file, metadata }) => {
    const { type, index, segmentIndex } = imageStudioConfig;
    const newImageObject = { file, title: metadata.title, description: metadata.description };

    setNewTopic(prev => {
        const newState = structuredClone(prev);

        if (type === 'topic') {
            newState.images[index] = newImageObject;
        } else if (type === 'segment') {
            if (newState.segments && newState.segments[segmentIndex]) {
                if (!newState.segments[segmentIndex].images) {
                    newState.segments[segmentIndex].images = [];
                }
                newState.segments[segmentIndex].images[index] = newImageObject;
            }
        }
        return newState;
    });
};

    const removeImage = (type, index, segmentIndex = null) => {
        if (!window.confirm("Are you sure you want to delete this image?")) return;
        setNewTopic(prev => {
            if (type === 'topic') {
                return { ...prev, images: prev.images.filter((_, i) => i !== index), };
            } else if (type === 'segment') {
                return {
                    ...prev,
                    segments: prev.segments.map((segment, i) => {
                        if (i !== segmentIndex) return segment;
                        return { ...segment, images: segment.images.filter((_, j) => j !== index), };
                    }),
                };
            }
            return prev;
        });
        showWarningToast("Image removed from form.");
    };
    
    const getImageDataForStudio = () => {
        const { type, index, segmentIndex } = imageStudioConfig;
        if (type === 'topic' && newTopic.images[index]) return newTopic.images[index];
        if (type === 'segment' && newTopic.segments[segmentIndex]?.images[index]) return newTopic.segments[segmentIndex].images[index];
        return {};
    };

    const handleExtractComplete = (apiSegments) => {
        if (!apiSegments || !Array.isArray(apiSegments)) {
            showErrorToast("Invalid segments data received from AI.");
            return;
        }

        const newFormattedSegments = apiSegments.map(segment => {
            let formattedFormulas = [];
            if (Array.isArray(segment.formulas)) {
                formattedFormulas = segment.formulas;
            } else if (segment.formulas && typeof segment.formulas === 'object' && segment.formulas.equation) {
                formattedFormulas = [segment.formulas];
            }

            return {
                title: segment.title || { english: '', bangla: '' },
                description: segment.description || { english: '', bangla: '' },
                aliases: segment.aliases || { english: [], bangla: [], banglish: [] },
                images: [], 
                formulas: formattedFormulas,
            };
        });

        setNewTopic(prev => ({
            ...prev,
            segments: [...(prev.segments || []), ...newFormattedSegments]
        }));
    };

    const handleSubmit = async () => {
      try {
        if (isEditMode) {
          await handleEditTopic();
          showSuccessToast("Topic updated successfully");
        } else {
          await handleAddTopic();
          showSuccessToast("Topic created successfully");
        }
      } catch (error) {
        console.error("Topic submission failed:", error);
        const errorMessage = error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} topic.`;
        showErrorToast(errorMessage);
      }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                <div className={`bg-white shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out ${isMaximized ? 'w-screen h-screen max-w-full max-h-full rounded-none' : 'rounded-2xl w-full max-w-6xl max-h-[90vh]'}`}>
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white flex items-center justify-between">
                        <h2 className="text-xl font-semibold">{isEditMode ? 'Edit Topic' : 'Create New Topic'}</h2>
                        <div className="flex items-center space-x-2">
                           <button onClick={() => setIsMaximized(!isMaximized)} className="p-1 hover:bg-blue-800 rounded-lg transition-colors" aria-label={isMaximized ? "Minimize" : "Maximize"}>
                                {isMaximized ? ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-4.293-4.293-4.293 4.293a1 1 0 11-1.414-1.414l4.293-4.293-4.293-4.293a1 1 0 011.414-1.414l4.293 4.293 4.293-4.293a1 1 0 011.414 1.414l-4.293 4.293 4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" transform="rotate(45 10 10)"/></svg> )}
                            </button>
                            <button onClick={closeAddEditModal} className="p-1 hover:bg-blue-800 rounded-lg transition-colors" aria-label="Close modal">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        <div className="w-48 bg-gray-50 border-r border-gray-200 p-4">
                            <nav className="flex flex-col space-y-2">
                                {tabs.map(tab => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 text-left text-sm font-medium rounded-md transition-colors ${ activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200' }`} >
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8">
                            {activeTab === 'basic' && <BasicInfoTab newTopic={newTopic} handleUpdate={handleUpdate} addQuestionTypeField={addQuestionTypeField} removeQuestionTypeField={removeQuestionTypeField} addAliasField={addAliasField} removeAliasField={removeAliasField} addFormula={addFormula} removeFormula={removeFormula} openImageStudio={openImageStudio} removeImage={removeImage} />}
                            {activeTab === 'segments' && <SegmentsTab newTopic={newTopic} handleUpdate={handleUpdate} addSegment={addSegment} removeSegment={removeSegment} openImageStudio={openImageStudio} removeImage={removeImage} addSegmentFormula={addSegmentFormula} removeSegmentFormula={removeSegmentFormula} addSegmentAlias={addSegmentAlias} removeSegmentAlias={removeSegmentAlias} openExtractSegmentsModal={() => setExtractModalOpen(true)} />}
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                        <button onClick={closeAddEditModal} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">Cancel</button>
                        <button onClick={handleSubmit} disabled={loading || !isFormValid} className="px-4 py-2 rounded-lg text-white font-medium transition-colors text-sm disabled:bg-blue-300 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700">
                            {loading ? 'Saving...' : (isEditMode ? 'Update Topic' : 'Create Topic')}
                        </button>
                    </div>
                </div>
            </div>
            
            <ImageStudioModal isOpen={isImageStudioOpen} onClose={() => setImageStudioOpen(false)} onConfirm={handleImageConfirm} initialData={getImageDataForStudio()} />
            <ExtractSegmentsModal isOpen={isExtractModalOpen} onClose={() => setExtractModalOpen(false)} onExtractComplete={handleExtractComplete} />
        </>
    );
};

export default TopicAddOrEditModal;