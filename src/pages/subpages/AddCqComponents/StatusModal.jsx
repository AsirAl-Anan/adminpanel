import { X, FileText, CheckCircle } from "lucide-react";

/**
 * Modal component for selecting the status of a Creative Question
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @param {function} onSelectStatus - Function to handle status selection (receives 'DRAFT' or 'PUBLISHED')
 * @param {boolean} isSubmitting - Whether the form is currently submitting
 */
export const StatusModal = ({ isOpen, onClose, onSelectStatus, isSubmitting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">Select Status</h2>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-sm text-slate-600 mb-6">
                        Choose the status for this creative question. You can change this later.
                    </p>

                    <div className="space-y-3">
                        {/* Draft Button */}
                        <button
                            type="button"
                            onClick={() => onSelectStatus('DRAFT')}
                            disabled={isSubmitting}
                            className="w-full flex items-center gap-4 p-4 border-2 border-slate-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                                <FileText className="w-6 h-6 text-amber-600" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-semibold text-slate-900 group-hover:text-amber-900">Save as Draft</h3>
                                <p className="text-sm text-slate-500 group-hover:text-amber-700">
                                    Save for later editing. Not visible to users.
                                </p>
                            </div>
                        </button>

                        {/* Published Button */}
                        <button
                            type="button"
                            onClick={() => onSelectStatus('PUBLISHED')}
                            disabled={isSubmitting}
                            className="w-full flex items-center gap-4 p-4 border-2 border-slate-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-semibold text-slate-900 group-hover:text-green-900">Publish</h3>
                                <p className="text-sm text-slate-500 group-hover:text-green-700">
                                    Make this question available to users immediately.
                                </p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="w-full px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
