import React from 'react';
import { Repartidor } from '../../../../types/types';

interface SelectRepartidorProps {
    value: number | null;
    onChange: (value: number | null) => void;
    repartidores: Repartidor[];
}

export const SelectRepartidor: React.FC<SelectRepartidorProps> = ({ value, onChange, repartidores }) => {
    return (
        <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
        >
            <option value="">Sin asignar</option>
            {repartidores.map(r => (
                <option key={r.id} value={r.id}>{r.nombre} {r.apellido}</option>
            ))}
        </select>
    );
};

export default SelectRepartidor;