import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, Image as ImageIcon, Trash2, CheckCircle, ChevronDown, Settings, FileImage } from 'lucide-react';
import axios from '../config/axios';
import { showErrorToast, showSuccessToast } from '../../lib/toast';
import * as Accordion from '@radix-ui/react-accordion';

export const ImageExtractionModal = ({ isOpen, onClose, onSuccess, type = 'question' }) => {
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
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
        formData.append('partConfigs', JSON.stringify(partConfigs));
        formData.append('customInstructions', customInstructions);

        const endpoint = type === 'question' ? '/ai/extract-cq' : '/ai/extract-cq-answers';

        try {
            const response = await axios.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                showSuccessToast(`${type === 'question' ? 'Question' : 'Answer'} extracted successfully!`); // Fixed template literal
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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center">
                            <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
                            Extract {type === 'question' ? 'Question' : 'Answer'}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="overflow-y-auto flex-1 p-4 sm:p-6">
                    <Accordion.Root type="single" defaultValue="upload" collapsible className="space-y-4">

                        {/* Accordion Item 1: Upload & Preview */}
                        <Accordion.Item value="upload" className="border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <Accordion.Header className="flex">
                                <Accordion.Trigger className="flex flex-1 items-center justify-between bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors group">
                                    <div className="flex items-center">
                                        <FileImage className="w-4 h-4 mr-2 text-blue-500" />
                                        Upload Images
                                        {images.length > 0 && (
                                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                                {images.length}
                                            </span>
                                        )}
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                </Accordion.Trigger>
                            </Accordion.Header>
                            <Accordion.Content className="p-4 bg-white animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
                                <div
                                    className={`
                                        border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-200 cursor-pointer mb-4
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
                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Upload size={24} />
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-700 mb-1">
                                        Click to upload or drag & drop
                                    </h4>
                                    <p className="text-xs text-slate-500">
                                        Supports JPG, PNG, WEBP
                                    </p>
                                </div>

                                {/* Image Grid */}
                                {images.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {images.map((img) => (
                                            <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                                                <img
                                                    src={img.preview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                                                        className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors shadow-lg"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Accordion.Content>
                        </Accordion.Item>

                        {/* Accordion Item 2: Settings */}
                        <Accordion.Item value="settings" className="border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <Accordion.Header className="flex">
                                <Accordion.Trigger className="flex flex-1 items-center justify-between bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors group">
                                    <div className="flex items-center">
                                        <Settings className="w-4 h-4 mr-2 text-slate-500" />
                                        Extraction Settings
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                </Accordion.Trigger>
                            </Accordion.Header>
                            <Accordion.Content className="p-4 bg-white animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Part-specific Paragraphs</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {['a', 'b', 'c', 'd'].map((part) => (
                                                <div key={part} className="flex items-center justify-between bg-white p-2.5 rounded border border-slate-100 shadow-sm">
                                                    <span className="text-sm font-semibold text-slate-700">Part {part.toUpperCase()}</span>
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="10"
                                                            className="w-16 h-8 text-sm text-center border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                                            0 = Auto-detect paragraphs.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                                            Custom Instructions
                                        </label>
                                        <textarea
                                            value={customInstructions}
                                            onChange={(e) => setCustomInstructions(e.target.value)}
                                            placeholder="E.g., 'Split the answer into Theory, Calculation, and Verdict'..."
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none h-20"
                                        />
                                    </div>
                                </div>
                            </Accordion.Content>
                        </Accordion.Item>
                    </Accordion.Root>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end space-x-3 flex-shrink-0">
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
                                Extract
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

