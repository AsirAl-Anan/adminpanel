import React, { useState, useEffect } from 'react';

const ImagePreview = ({ image }) => {
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (image.file) {
      const url = URL.createObjectURL(image.file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (image.url) {
      setPreviewUrl(image.url);
    }
  }, [image.file, image.url]);

  if (!previewUrl) return null;

  return (
    <img src={previewUrl} alt={image.caption?.en || 'Image preview'} className="w-full h-24 object-cover rounded-lg mb-2" />
  );
};

export default ImagePreview;
