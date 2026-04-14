import React from 'react';
import './Modal.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    onCancel?: () => void;
    onAlternative?: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    alternativeText?: string;
    showConfirm?: boolean;
    showAlternative?: boolean;
    type?: 'info' | 'success' | 'warning' | 'error';
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    onCancel,
    onAlternative,
    title,
    message,
    confirmText = 'Aceptar',
    cancelText = 'Cancelar',
    alternativeText = 'Opción Alternativa',
    showConfirm = true,
    showAlternative = false,
    type = 'info'
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return '✅';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            default: return 'ℹ️';
        }
    };

    const getColor = () => {
        switch (type) {
            case 'success': return '#4CAF50';
            case 'warning': return '#FF9800';
            case 'error': return '#f44336';
            default: return '#4b0082';
        }
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        onClose();
    };

    const handleAlternative = () => {
        if (onAlternative) onAlternative();
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header" style={{ borderBottomColor: getColor() }}>
                    <span className="modal-icon">{getIcon()}</span>
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <p style={{ whiteSpace: 'pre-line' }}>{message}</p>
                </div>
                <div className="modal-footer">
                    {showAlternative && onAlternative && (
                        <button className="modal-btn-alternative" onClick={handleAlternative}>
                            {alternativeText}
                        </button>
                    )}
                    {showConfirm && onConfirm && (
                        <button className="modal-btn-confirm" onClick={onConfirm} style={{ backgroundColor: getColor() }}>
                            {confirmText}
                        </button>
                    )}
                    <button className="modal-btn-cancel" onClick={handleCancel}>
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;