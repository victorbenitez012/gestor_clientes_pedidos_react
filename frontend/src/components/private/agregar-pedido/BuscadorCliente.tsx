// frontend/src/components/private/agregar-pedido/BuscadorCliente.tsx
import React, { useRef, useEffect } from 'react';
import { Cliente } from './types';
import { useFormateoTexto } from './hooks/useFormateoTexto';

interface BuscadorClienteProps {
    onClienteSeleccionado: (cliente: Cliente) => void;
    onBusquedaChange: (busqueda: string) => void;
    sugerencias: Cliente[];
    mostrarSugerencias: boolean;
    setMostrarSugerencias: (mostrar: boolean) => void;
    inputRef?: React.RefObject<HTMLInputElement | null>;
}

const BuscadorCliente: React.FC<BuscadorClienteProps> = ({
    onClienteSeleccionado,
    onBusquedaChange,
    sugerencias,
    mostrarSugerencias,
    setMostrarSugerencias,
    inputRef
}) => {
    const { capitalizarPalabras } = useFormateoTexto();
    const sugerenciasRef = useRef<HTMLDivElement>(null);
    const localInputRef = useRef<HTMLInputElement>(null);
    const inputElement = inputRef || localInputRef;

    // Cerrar sugerencias al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sugerenciasRef.current && !sugerenciasRef.current.contains(event.target as Node) &&
                inputElement.current && !inputElement.current.contains(event.target as Node)) {
                setMostrarSugerencias(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [inputElement, setMostrarSugerencias]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onBusquedaChange(e.target.value);
    };

    return (
        <div className="campo-busqueda-cliente">
            <label>🔍 Buscar Cliente Existente (nombre, dirección, barrio o teléfono):</label>
            <input
                type="text"
                ref={inputElement}
                className="input-busqueda"
                placeholder="Escribe para buscar un cliente existente..."
                autoComplete="off"
                onChange={handleInputChange}
            />
            {mostrarSugerencias && sugerencias.length > 0 && (
                <div ref={sugerenciasRef} className="sugerencias">
                    {sugerencias.map(cliente => (
                        <div
                            key={cliente.id}
                            className="sugerencia"
                            onClick={() => onClienteSeleccionado(cliente)}
                        >
                            <strong>{capitalizarPalabras(cliente.nombre)}</strong><br />
                            <small>
                                {capitalizarPalabras(cliente.direccion)} - {capitalizarPalabras(cliente.barrio)} | Tel: {cliente.telefono}
                            </small>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BuscadorCliente;