import React, { useState } from 'react';
import { Languages, Loader2 } from 'lucide-react';
import axios from '../../config/axios';
import { showErrorToast } from '../../../lib/toast';

const TranslationButton = ({ text, targetLang, onTranslate, className = "" }) => {
    const [loading, setLoading] = useState(false);

    const handleTranslate = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!text || !text.trim()) {
            showErrorToast("Please enter some text to translate.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/ai/translate', {
                text,
                targetLang,
            });

            if (response.data.success && response.data.data.translatedText) {
                onTranslate(response.data.data.translatedText);
            } else {
                showErrorToast("Translation failed.");
            }
        } catch (error) {
            console.error("Translation error:", error);
            showErrorToast("Translation failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleTranslate}
            disabled={loading || !text}
            className={`p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors ${className}`}
            title={`Translate to ${targetLang === 'en' ? 'English' : 'Bangla'}`}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Languages className="w-4 h-4" />
            )}
        </button>
    );
};

export default TranslationButton;
