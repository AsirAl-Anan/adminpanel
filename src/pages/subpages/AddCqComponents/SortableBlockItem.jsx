import React, { useState, useEffect } from "react"
import { Reorder, useDragControls, AnimatePresence, motion } from "framer-motion"
import { GripVertical, Trash2, ChevronDown, Loader2, ImageIcon, X, AlertCircle } from "lucide-react"
import axios from "../../../config/axios.js"
import { showSuccessToast, showErrorToast } from "../../../../lib/toast"

export const SortableBlockItem = ({
    block,
    index,
    isExpanded,
    onToggleExpand,
    onRemove,
    onTextChange,
    onBlockUpdate,
    onDragStart,
    minBlocks,
    placeholderPrefix,
    fieldErrors
}) => {
    const controls = useDragControls();
    const [activeTab, setActiveTab] = useState('en');
    const [isUploading, setIsUploading] = useState(false);

    const previewText = block.text?.en || block.text?.bn || "Empty block...";
    const truncatedPreview = previewText.length > 50 ? previewText.substring(0, 50) + "..." : previewText;

    const hasActiveTabError = fieldErrors && fieldErrors[activeTab];
    const hasAnyError = fieldErrors && Object.keys(fieldErrors).length > 0;

    useEffect(() => {
        if (fieldErrors && !fieldErrors[activeTab]) {
            if (fieldErrors['en']) setActiveTab('en');
            else if (fieldErrors['bn']) setActiveTab('bn');
        }
    }, [fieldErrors, activeTab]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                const newImage = {
                    url: res.data.data.url,
                    caption: { english: "", bangla: "" },
                    order: (block.images?.length || 0) + 1
                };

                const updatedBlock = {
                    ...block,
                    images: [...(block.images || []), newImage]
                };
                onBlockUpdate(index, updatedBlock);
                showSuccessToast("Image uploaded successfully");
            }
        } catch (error) {
            console.error("Upload failed:", error);
            showErrorToast("Failed to upload image");
        } finally {
            setIsUploading(false);
            e.target.value = null;
        }
    };

    const handleRemoveImage = (imgIndex) => {
        const updatedImages = block.images.filter((_, i) => i !== imgIndex);
        const updatedBlock = { ...block, images: updatedImages };
        onBlockUpdate(index, updatedBlock);
    };

    const handleImageReorder = (newImages) => {
        const updatedBlock = { ...block, images: newImages };
        onBlockUpdate(index, updatedBlock);
    }

    return (
        <Reorder.Item
            value={block}
            id={block.id}
            dragListener={false}
            dragControls={controls}
            onDragStart={onDragStart}
            dragMomentum={false}
            dragElastic={0.05}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
            whileDrag={{
                scale: 1.01,
                boxShadow: "0px 8px 20px rgba(0,0,0,0.08)",
                cursor: "grabbing",
                zIndex: 50
            }}
            className="relative mb-2 select-none"
        >
            <motion.div
                layout
                className={`group bg-white rounded-xl border transition-colors duration-300 overflow-hidden ${hasAnyError ? "border-red-400 ring-1 ring-red-100" :
                    isExpanded ? "border-blue-300 shadow-md ring-1 ring-blue-50" : "border-slate-200 hover:border-slate-300"
                    }`}
            >

                {/* Header / Handle */}
                <motion.div
                    layout="position"
                    onClick={onToggleExpand}
                    className={`flex items-center px-3 py-2 cursor-pointer ${hasAnyError ? "bg-red-50/50" :
                        isExpanded ? "bg-blue-50/30 border-b border-blue-100" : "bg-white"
                        }`}
                >
                    {/* Grip Handle */}
                    <div
                        onPointerDown={(e) => controls.start(e)}
                        className="mr-3 cursor-grab active:cursor-grabbing text-slate-300 hover:text-blue-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                    >
                        <GripVertical size={18} />
                    </div>

                    {/* Summary */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                            <span className={`text-xs font-bold uppercase tracking-wider mr-3 transition-colors ${hasAnyError ? "text-red-500" : isExpanded ? "text-blue-600" : "text-slate-400"
                                }`}>
                                #{index + 1}
                            </span>

                            <AnimatePresence initial={false}>
                                {!isExpanded && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className={`text-sm truncate ${hasAnyError ? "text-red-600 font-medium" : "text-slate-600"}`}
                                    >
                                        {hasAnyError ? "Missing content. Click to expand." : truncatedPreview}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-2">
                        {hasAnyError && <AlertCircle size={18} className="text-red-500" />}
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown size={18} className="text-slate-400" />
                        </motion.div>

                        <button
                            type="button"
                            onClick={(e) => onRemove(e, index)}
                            disabled={minBlocks}
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-20"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </motion.div>

                {/* Expanded Body */}
                <AnimatePresence initial={false}>
                    {isExpanded && (
                        <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                            <div className="p-2 md:p-3">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
                                        {['en', 'bn'].map((lang) => {
                                            const isLangError = fieldErrors && fieldErrors[lang];
                                            return (
                                                <button
                                                    key={lang}
                                                    type="button"
                                                    onClick={() => setActiveTab(lang)}
                                                    className={`relative px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 flex items-center ${activeTab === lang
                                                        ? isLangError ? 'bg-white text-red-600 shadow-sm border border-red-200' : 'bg-white text-blue-700 shadow-sm'
                                                        : isLangError ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-slate-500 hover:text-slate-700'
                                                        }`}
                                                >
                                                    {lang === 'en' ? 'English' : 'Bangla'}
                                                    {isLangError && (
                                                        <span className="ml-1.5 flex h-2 w-2 relative">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                        </span>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {/* Image Upload Button */}
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id={`upload-${block.id}`}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={isUploading}
                                        />
                                        <label
                                            htmlFor={`upload-${block.id}`}
                                            className={`flex items-center px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isUploading ? <Loader2 size={14} className="animate-spin mr-1" /> : <ImageIcon size={14} className="mr-1" />}
                                            Add Image
                                        </label>
                                    </div>
                                </div>

                                <div className="relative group/input mb-2">
                                    <textarea
                                        placeholder={activeTab === 'en' ? `Type ${placeholderPrefix} in English...` : `Type ${placeholderPrefix} in Bangla...`}
                                        value={block.text?.[activeTab] || ""}
                                        onChange={(e) => onTextChange(index, activeTab, e.target.value)}
                                        rows={4}
                                        className={`w-full p-3 bg-slate-50 border rounded-lg focus:bg-white outline-none resize-y min-h-[150px] text-sm leading-relaxed transition-all
                      ${hasActiveTabError
                                                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                                : "border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"}`}
                                        autoFocus
                                    />
                                    {hasActiveTabError && (
                                        <p className="absolute bottom-2 right-2 text-xs text-red-500 font-medium">Required</p>
                                    )}
                                </div>

                                {/* Image List & Reordering */}
                                {block.images && block.images.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Attached Images</h4>
                                        <Reorder.Group axis="y" values={block.images} onReorder={handleImageReorder} className="space-y-2">
                                            {block.images.map((img, imgIndex) => (
                                                <Reorder.Item key={img.url} value={img} className="relative group/image">
                                                    <div className="flex items-center p-2 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-200 transition-colors">
                                                        <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-blue-600 p-1 mr-2">
                                                            <GripVertical size={16} />
                                                        </div>
                                                        <div className="w-16 h-16 rounded-md overflow-hidden bg-white border border-slate-100 flex-shrink-0">
                                                            <img src={img.url} alt="Attachment" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 ml-3">
                                                            <p className="text-xs text-slate-500 truncate max-w-[200px]">{img.url.split('/').pop()}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(imgIndex)}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover/image:opacity-100"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </Reorder.Item>
                                            ))}
                                        </Reorder.Group>
                                    </div>
                                )}

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </Reorder.Item>
    )
}
