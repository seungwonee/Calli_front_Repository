import React from 'react';
import '../css/ImageModal.css';

const ImageModal = ({ isOpen, onClose, imageUrl, altText }) => {
    if (!isOpen || !imageUrl) return null;

    return (
        <div className="image-modal-overlay" onClick={onClose}>
            <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="image-modal-close" onClick={onClose}>&times;</button>
                <img src={imageUrl} alt={altText || 'Preview'} className="image-modal-img" />
            </div>
        </div>
    );
};

export default ImageModal;
