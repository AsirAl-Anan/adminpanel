import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, Image as ImageIcon, Trash2, CheckCircle } from 'lucide-react';
import axios from '../config/axios';
import { showErrorToast, showSuccessToast } from '../../lib/toast';

export const ImageExtractionModal = ({ isOpen, onClose, onSuccess, type = 'question' }) => {
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    // const [numBlocks, setNumBlocks] = useState(0); // Removed global slider in favor of per-part
    const [partConfigs, setPartConfigs] = useState({ a: 0, b: 0, c: 0, d: 0 });
    const [customInstructions, setCustomInstructions] = useState("");
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        processFiles(files);
    };

    const processFiles = (files) => {
        const validImages = files.filter(file => file.type.startsWith('image/'));
        if (validImages.length !== files.length) {
            showErrorToast("Some files were skipped. Only images are allowed.");
        }

        const newImages = validImages.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            id: Math.random().toString(36).substr(2, 9)
        }));

        setImages(prev => [...prev, ...newImages]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    };

    const removeImage = (id) => {
        setImages(prev => prev.filter(img => img.id !== id));
    };

    const handleExtract = async () => {
        if (images.length === 0) {
            showErrorToast("Please upload at least one image.");
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        images.forEach(img => {
            formData.append('qb', img.file);
        });
        // formData.append('numBlocks', numBlocks);
        formData.append('partConfigs', JSON.stringify(partConfigs));
        formData.append('customInstructions', customInstructions);

        const endpoint = type === 'question' ? '/ai/extract-cq' : '/ai/extract-cq-answers';

        try {
            const response = await axios.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                showSuccessToast(`${type === 'question' ? 'Question' : 'Answer'} extracted successfully!`);
                onSuccess(response.data.data);
                onClose();
                setImages([]);
            }
        } catch (error) {
            console.error("Extraction error:", error);
            showErrorToast(error.response?.data?.message || "Failed to extract data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">
                            Extract {type === 'question' ? 'Question' : 'Answer'} from Image
                        </h3>
                        <p className="text-sm text-slate-500">
                            Upload images of the {type} to extract text and translate automatically.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Drop Zone */}
                    <div
                        className={`
                            border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
                            ${isDragOver ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50'}
                        `}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload size={24} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-700 mb-1">
                            Click to upload or drag and drop
                        </h4>
                        <p className="text-xs text-slate-500">
                            Supports JPG, PNG, WEBP (Max 10MB)
                        </p>
                    </div>

                    {/* Image Previews */}
                    {images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {images.map((img) => (
                                <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                                    <img
                                        src={img.preview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => removeImage(img.id)}
                                            className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Advanced Options */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        {/* Part-specific Configuration */}
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <h4 className="text-sm font-bold text-slate-700 mb-3">Part-specific Settings</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {['a', 'b', 'c', 'd'].map((part) => (
                                    <div key={part} className="flex items-center justify-between bg-white p-2 rounded border border-slate-100">
                                        <span className="text-xs font-bold text-slate-600 uppercase">Part {part}</span>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs text-slate-400">Blocks:</span>
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                className="w-12 h-6 text-xs text-center border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Auto"
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    setPartConfigs(prev => ({
                                                        ...prev,
                                                        [part]: isNaN(val) ? 0 : val
                                                    }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2">
                                Specify number of paragraphs for each part. Leave empty or 0 for auto-detection.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                Custom Instructions (Optional)
                            </label>
                            <textarea
                                value={customInstructions}
                                onChange={(e) => setCustomInstructions(e.target.value)}
                                placeholder="E.g., 'Split the answer into Theory, Calculation, and Verdict', 'Treat the first paragraph as introduction'..."
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none h-20"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-colors"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExtract}
                        disabled={isLoading || images.length === 0}
                        className="inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-200"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Extracting...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Extract & Fill
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
