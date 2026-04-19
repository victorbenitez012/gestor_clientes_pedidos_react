import React from 'react';

interface FechaProgramadaProps {
    esProgramado: number;
    fecha: string | null | undefined;
    onToggle: (checked: boolean) => void;
    onFechaChange: (fecha: string) => void;
}

export const FechaProgramada: React.FC<FechaProgramadaProps> = ({
    esProgramado,
    fecha,
    onToggle,
    onFechaChange
}) => {
    const fechaMinima = new Date().toISOString().split('T')[0];

    return (
        <div className="fecha-programada-cell">
            <label className="checkbox-label">
                <input
                    type="checkbox"
                    checked={esProgramado === 1}
                    onChange={(e) => onToggle(e.target.checked)}
                />
                <span>📅 Programar</span>
            </label>
            {esProgramado === 1 && (
                <input
                    type="date"
                    value={fecha || ''}
                    onChange={(e) => onFechaChange(e.target.value)}
                    className="fecha-input"
                    min={fechaMinima}
                />
            )}
            {esProgramado !== 1 && (
                <span className="fecha-inmediato-badge">⚡ Inmediato</span>
            )}
        </div>
    );
};

export default FechaProgramada;