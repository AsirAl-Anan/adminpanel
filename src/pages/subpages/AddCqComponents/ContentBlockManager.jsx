import React, { useState } from "react"
import { v4 as uuidv4 } from 'uuid';
import { Reorder, AnimatePresence } from "framer-motion"
import { Plus } from "lucide-react"
import { SortableBlockItem } from "./SortableBlockItem"

export const ContentBlockManager = ({ label, blocks, onChange, minBlocks = 1, placeholderPrefix = "Text", validationErrors }) => {
    const [expandedIndex, setExpandedIndex] = useState(blocks.length > 0 ? 0 : null);

    const handleReorder = (newBlocks) => {
        const updatedBlocks = newBlocks.map((b, i) => ({
            ...b,
            order: i + 1
        }));
        onChange(updatedBlocks);
    };

    const handleAdd = () => {
        const newOrder = blocks.length + 1;
        const newBlocks = [...blocks, { id: uuidv4(), text: { en: "", bn: "" }, order: newOrder, images: [] }];
        onChange(newBlocks);
        setExpandedIndex(newBlocks.length - 1);
    };

    const handleRemove = (e, index) => {
        e.stopPropagation();
        if (blocks.length <= minBlocks) return;

        const newBlocks = blocks.filter((_, i) => i !== index).map((b, i) => ({ ...b, order: i + 1 }));
        onChange(newBlocks);

        if (expandedIndex === index) setExpandedIndex(null);
        else if (expandedIndex > index) setExpandedIndex(expandedIndex - 1);
    };

    const handleTextChange = (index, lang, value) => {
        const newBlocks = [...blocks];
        newBlocks[index] = {
            ...newBlocks[index],
            text: { ...newBlocks[index].text, [lang]: value }
        };
        onChange(newBlocks);
    };

    const handleBlockUpdate = (index, updatedBlock) => {
        const newBlocks = [...blocks];
        newBlocks[index] = updatedBlock;
        onChange(newBlocks);
    };

    const handleDragStart = () => {
        if (expandedIndex !== null) {
            setExpandedIndex(null);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
                <label className="text-sm font-bold text-slate-700">{label}</label>
                <button
                    type="button"
                    onClick={handleAdd}
                    className="group inline-flex items-center px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-all active:scale-95"
                >
                    <Plus size={14} className="mr-1 transition-transform group-hover:rotate-90" />
                    Add Segment
                </button>
            </div>

            <Reorder.Group
                axis="y"
                values={blocks}
                onReorder={handleReorder}
                className="space-y-0"
                layoutScroll
            >
                <AnimatePresence initial={false}>
                    {blocks.map((block, index) => (
                        <SortableBlockItem
                            key={block.id}
                            block={block}
                            index={index}
                            isExpanded={expandedIndex === index}
                            onToggleExpand={() => setExpandedIndex(expandedIndex === index ? null : index)}
                            onRemove={handleRemove}
                            onTextChange={handleTextChange}
                            onBlockUpdate={handleBlockUpdate}
                            onDragStart={handleDragStart}
                            minBlocks={blocks.length <= minBlocks}
                            placeholderPrefix={placeholderPrefix}
                            // Pass the specific error object for this block index
                            fieldErrors={validationErrors ? validationErrors[index] : null}
                        />
                    ))}
                </AnimatePresence>
            </Reorder.Group>
        </div>
    )
}
