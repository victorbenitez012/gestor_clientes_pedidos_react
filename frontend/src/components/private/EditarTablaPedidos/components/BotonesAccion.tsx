import React from 'react';

interface BotonesAccionProps {
    pedidosModificadosCount: number;
    saving: boolean;
    loading: boolean;
    onGuardar: () => void;
    onImprimir: () => void;
    onExportar: () => void;
}

export const BotonesAccion: React.FC<BotonesAccionProps> = ({
    pedidosModificadosCount,
    saving,
    loading,
    onGuardar,
    onImprimir,
    onExportar
}) => {
    return (
        <div className="botones">
            <button
                type="submit"
                disabled={saving || loading || pedidosModificadosCount === 0}
                onClick={onGuardar}
            >
                {saving ? 'Guardando...' : `Guardar Cambios (${pedidosModificadosCount})`}
            </button>
            <button type="button" onClick={onImprimir}>
                Imprimir Tabla
            </button>
            <button type="button" onClick={onExportar}>
                Exportar a Excel
            </button>
        </div>
    );
};

export default BotonesAccion;