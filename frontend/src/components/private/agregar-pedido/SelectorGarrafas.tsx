// frontend/src/components/private/agregar-pedido/SelectorGarrafas.tsx
import React from 'react';

interface SelectorGarrafasProps {
    valores: {
        garrafa_10kg: number;
        garrafa_15kg: number;
        garrafa_45kg: number;
    };
    onChange: (campo: string, valor: number) => void;
}

const SelectorGarrafas: React.FC<SelectorGarrafasProps> = ({ valores, onChange }) => {
    const cambiarCantidad = (campo: string, cambio: number) => {
        const valorActual = valores[campo as keyof typeof valores];
        const nuevoValor = Math.max(0, valorActual + cambio);
        onChange(campo, nuevoValor);
    };

    const garrafas = [
        { kg: 10, campo: 'garrafa_10kg' as const, icono: '🛢️' },
        { kg: 15, campo: 'garrafa_15kg' as const, icono: '🛢️' },
        { kg: 45, campo: 'garrafa_45kg' as const, icono: '🛢️' },
    ];

    return (
        <div className="garrafas-container">
            {garrafas.map(({ kg, campo, icono }) => (
                <div key={kg} className="garrafa-card">
                    <div className="garrafa-icon">{icono}</div>
                    <div className="garrafa-label">{kg} kg</div>
                    <div className="control-cantidad">
                        <button
                            type="button"
                            onClick={() => cambiarCantidad(campo, -1)}
                            className="btn-cantidad"
                        >
                            −
                        </button>
                        <input
                            type="number"
                            name={campo}
                            value={valores[campo]}
                            onChange={(e) => onChange(campo, parseInt(e.target.value) || 0)}
                            min="0"
                        />
                        <button
                            type="button"
                            onClick={() => cambiarCantidad(campo, 1)}
                            className="btn-cantidad"
                        >
                            +
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SelectorGarrafas;