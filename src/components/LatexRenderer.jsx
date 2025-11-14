import React from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';

const LatexRenderer = ({ latex }) => {
  const renderLatex = () => {
    try {
      return { __html: katex.renderToString(latex, { throwOnError: false }) };
    } catch (e) {
      console.error("KaTeX rendering error:", e);
      return { __html: `<span style="color: red;">Error: ${e.message}</span>` };
    }
  };

  return <span dangerouslySetInnerHTML={renderLatex()} />;
};

export default LatexRenderer;
