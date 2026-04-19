import React from 'react';

interface SelectEstadoProps {
    value: string;
    onChange: (value: string) => void;
}

const estados = ['Pendiente', 'En Proceso', 'Entregado', 'Cancelado', 'Finalizado', 'Cuenta'];

export const SelectEstado: React.FC<SelectEstadoProps> = ({ value, onChange }) => {
    return (
        <select value={value} onChange={(e) => onChange(e.target.value)}>
            {estados.map(estado => (
                <option key={estado} value={estado}>{estado}</option>
            ))}
        </select>
    );
};

export default SelectEstado;