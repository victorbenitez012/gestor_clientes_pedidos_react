import React from 'react';

interface InputNumberProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    step?: number;
}

export const InputNumber: React.FC<InputNumberProps> = ({ value, onChange, min = 0, step = 1 }) => {
    return (
        <input
            type="number"
            value={value || 0}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            min={min}
            step={step}
        />
    );
};

export default InputNumber;