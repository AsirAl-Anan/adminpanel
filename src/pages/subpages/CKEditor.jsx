import { useEffect, useRef, useState, useCallback } from 'react';

const CKEditor4 = ({
  onChange,
  data = '',
  config,
  scriptSrc = '/ckeditor/ckeditor.js',
  id,
  placeholder = ''
}) => {
  const editorRef = useRef(null);
  const editorInstanceRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const uniqueId = useRef(`ckeditor-${id || Date.now()}-${Math.random().toString(36).substr(2, 5)}`);

  // Memoize the onChange callback
  const memoizedOnChange = useCallback((newData) => {
    if (onChange) {
      onChange(newData);
    }
  }, [onChange]);

  const destroyEditor = useCallback(() => {
    if (editorInstanceRef.current) {
      try {
        if (window.CKEDITOR && window.CKEDITOR.instances[uniqueId.current]) {
          window.CKEDITOR.instances[uniqueId.current].destroy(true);
        }
        editorInstanceRef.current = null;
        setIsEditorReady(false);
      } catch (error) {
        console.warn('Error destroying CKEditor:', error);
      }
    }
  }, []);

  const initializeEditor = useCallback(() => {
    if (!window.CKEDITOR || !editorRef.current) {
      setError('CKEditor not available');
      setIsLoading(false);
      return;
    }

    try {
      // Destroy existing instance if it exists
      if (window.CKEDITOR.instances[uniqueId.current]) {
        window.CKEDITOR.instances[uniqueId.current].destroy(true);
      }

      // Set the textarea ID
      editorRef.current.id = uniqueId.current;

      const editorConfig = {
      
         height: 250,
             fontSize_defaultLabel: '14px',

        removeButtons: '',
        allowedContent: true,
        ...config
      };

      // Create editor instance
      const editor = window.CKEDITOR.replace(uniqueId.current, editorConfig);
      
      editorInstanceRef.current = editor;

      // Handle editor ready event
      editor.on('instanceReady', function() {
        console.log('Editor ready for:', uniqueId.current);
        setIsEditorReady(true);
        setIsLoading(false);
        setError(null);
        
        // Set initial data
        if (data) {
          this.setData(data);
        }

        // Listen for data changes
        this.on('change', function() {
          const currentData = this.getData();
          memoizedOnChange(currentData);
        });

        this.on('blur', function() {
          const currentData = this.getData();
          memoizedOnChange(currentData);
        });
      });

      // Handle editor error
      editor.on('error', function(evt) {
        console.error('CKEditor error:', evt);
        setError('Editor initialization failed');
        setIsLoading(false);
      });

    } catch (error) {
      console.error('Error initializing CKEditor:', error);
      setError('Failed to initialize editor');
      setIsLoading(false);
    }
  }, [data, config, memoizedOnChange]);

  // Load CKEditor script and initialize
  useEffect(() => {
    console.log('Initializing CKEditor for:', uniqueId.current);
    
    const loadEditor = () => {
      if (window.CKEDITOR) {
        // CKEditor is already loaded
        initializeEditor();
      } else {
        // Load CKEditor script
        setIsLoading(true);
        
        // Check if script is already being loaded
        const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
        
        if (existingScript) {
          // Script exists, wait for it to load
          if (existingScript.complete) {
            initializeEditor();
          } else {
            existingScript.addEventListener('load', initializeEditor);
            existingScript.addEventListener('error', () => {
              setError('Failed to load CKEditor script');
              setIsLoading(false);
            });
          }
        } else {
          // Create new script tag
          const script = document.createElement('script');
          script.src = scriptSrc;
          script.type = 'text/javascript';
          
          script.onload = () => {
            console.log('CKEditor script loaded');
            // Give a small delay to ensure CKEDITOR is fully available
            setTimeout(initializeEditor, 100);
          };
          
          script.onerror = () => {
            console.error('Failed to load CKEditor script from:', scriptSrc);
            setError(`Failed to load CKEditor script from: ${scriptSrc}`);
            setIsLoading(false);
          };
          
          document.head.appendChild(script);
        }
      }
    };

    loadEditor();

    // Cleanup function
    return () => {
      destroyEditor();
    };
  }, []); // Only run once on mount

  // Update editor data when prop changes
  useEffect(() => {
    if (editorInstanceRef.current && isEditorReady) {
      const currentData = editorInstanceRef.current.getData();
      if (currentData !== data) {
        editorInstanceRef.current.setData(data || '');
      }
    }
  }, [data, isEditorReady]);

  if (error) {
    return (
      <div className="border border-red-300 rounded-lg p-4 bg-red-50">
        <p className="text-red-600 text-sm">Error: {error}</p>
        <button 
          onClick={() => {
            setError(null);
            setIsLoading(true);
            initializeEditor();
          }}
          className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <textarea
        ref={editorRef}
        defaultValue={data}
        placeholder={placeholder}
        className={`w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          isEditorReady ? 'hidden' : 'block'
        }`}
        style={{ 
          minHeight: '200px',
          resize: 'vertical'
        }}
      />
      
      {isLoading && (
        <div className="flex items-center justify-center p-8 border border-gray-300 rounded-lg bg-gray-50">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Loading editor...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CKEditor4;
