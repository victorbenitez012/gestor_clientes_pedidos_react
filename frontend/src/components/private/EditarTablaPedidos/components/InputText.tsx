import React from 'react';

interface InputTextProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: (value: string) => void;
    placeholder?: string;
}

export const InputText: React.FC<InputTextProps> = ({ value, onChange, onBlur, placeholder }) => {
    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur && onBlur(e.target.value)}
            placeholder={placeholder}
        />
    );
};

export default InputText;