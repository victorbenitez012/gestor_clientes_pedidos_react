import React from 'react';

interface InputPrecioProps {
    value: number;
    onChange: (value: number) => void;
}

export const InputPrecio: React.FC<InputPrecioProps> = ({ value, onChange }) => {
    return (
        <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
    );
};