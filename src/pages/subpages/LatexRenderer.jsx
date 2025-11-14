// LatexRenderer.jsx
import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// --- Simpler HTML Stripping using Regex ---
const stripHtmlRegex = (htmlString) => {
  if (!htmlString || typeof htmlString !== 'string') return htmlString || '';
  // This regex removes all HTML tags.
  return htmlString.replace(/<[^>]*>/g, '').trim();
};

// --- Function to normalize LaTeX commands ---
// This ensures proper backslash handling for KaTeX
const normalizeLatex = (latexString) => {
  if (!latexString || typeof latexString !== 'string') return latexString || '';

  // KaTeX expects single backslashes, so we need to ensure that's what we have
  // First, let's handle any potential double backslashes that might have been escaped
  let normalized = latexString;
  
  // Replace any instances of double backslashes with single backslashes
  // This handles cases where the string might have been over-escaped
  normalized = normalized.replace(/\\\\/g, '\\');
  
  // Handle newlines properly - convert \n to actual line breaks for display
  normalized = normalized.replace(/\\n/g, '\n');
  
  return normalized;
};

const LatexRenderer = ({ latex, displayMode = false }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && latex) {
      try {
        // --- Step 1: Strip HTML tags ---
        const strippedLatex = stripHtmlRegex(latex);
//         console.log('Original latex (prop):', latex);
        // console.log('Stripped latex:', strippedLatex);

        // --- Step 2: Normalize LaTeX formatting ---
        const normalizedLatex = normalizeLatex(strippedLatex);
        // console.log('Normalized latex:', normalizedLatex);

        // Clear previous content
        containerRef.current.innerHTML = '';

        // --- Step 3: Handle mixed inline and display math ---
        // Split by $ to find math segments
        const parts = normalizedLatex.split('$');
        let htmlContent = '';
        
        for (let i = 0; i < parts.length; i++) {
          if (i % 2 === 0) {
            // Even indices are regular text
            if (parts[i].trim()) {
              htmlContent += `<span class="text-content">${parts[i].replace(/\n/g, '<br>')}</span>`;
            }
          } else {
            // Odd indices are math content
            try {
              const mathHtml = katex.renderToString(parts[i], {
                throwOnError: false,
                displayMode: false, // inline math
              });
              htmlContent += mathHtml;
            } catch (mathError) {
              // console.error("KaTeX math rendering error:", parts[i], mathError);
              htmlContent += `<span class="math-error">$${parts[i]}$</span>`;
            }
          }
        }

        containerRef.current.innerHTML = htmlContent;
        // console.log('KaTeX rendered successfully');
        
      } catch (error) {
        // console.error("KaTeX rendering error for (original prop):", latex, error);
        
        // Fallback rendering of raw text
        if (containerRef.current) {
          const stripped = stripHtmlRegex(latex);
          const normalized = normalizeLatex(stripped);
          containerRef.current.innerHTML = normalized.replace(/\n/g, '<br>') || latex;
        }
      }
    }
  }, [latex, displayMode]);

  return (
    <span 
      ref={containerRef} 
      className="katex-renderer"
      style={{
        lineHeight: '1.5',
        display: 'inline-block',
        width: '100%'
      }}
    />
  );
};

export default LatexRenderer;
