import React from 'react';

interface ModalWhatsappProps {
    isOpen: boolean;
    mensajes: string[];
    onClose: () => void;
}

export const ModalWhatsapp: React.FC<ModalWhatsappProps> = ({ isOpen, mensajes, onClose }) => {
    if (!isOpen || mensajes.length === 0) return null;

    return (
        <div className="whatsapp-modal-overlay">
            <div className="whatsapp-modal-content">
                <h3>📱 Mensajes de WhatsApp generados</h3>
                <p>Se generaron {mensajes.length} mensaje(s) para enviar:</p>
                <div className="whatsapp-list">
                    {mensajes.map((url, idx) => (
                        <button
                            key={idx}
                            className="whatsapp-btn"
                            onClick={() => window.open(url, '_blank')}
                        >
                            📱 Enviar WhatsApp - Pedido {idx + 1}
                        </button>
                    ))}
                </div>
                <button className="close-whatsapp-btn" onClick={onClose}>
                    Cerrar
                </button>
            </div>
        </div>
    );
};