// frontend/src/components/private/agregar-pedido/BotonesAccion.tsx
import React from 'react';

interface BotonesAccionProps {
    onGuardar: () => void;
    onLimpiar: () => void;
    loading: boolean;
}

const BotonesAccion: React.FC<BotonesAccionProps> = ({ onGuardar, onLimpiar, loading }) => {
    return (
        <div className="columna-botones">
            <div className="botones-vertical">
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-guardar-vertical"
                    onClick={onGuardar}
                >
                    {loading ? 'Guardando...' : '💾 Guardar Pedido'}
                </button>
                <button
                    type="button"
                    onClick={onLimpiar}
                    className="btn-limpiar-vertical"
                >
                    🧹 Limpiar Formulario
                </button>
                <a href="/gestor_clientes_pedidos_react/pedidos" className="btn-volver-vertical">
                    ← Volver
                </a>
            </div>
        </div>
    );
};

export default BotonesAccion;