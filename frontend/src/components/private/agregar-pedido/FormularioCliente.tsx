// frontend/src/components/private/agregar-pedido/FormularioCliente.tsx
import React from 'react';
import { Cliente } from './types';
import { useFormateoTexto } from './hooks/useFormateoTexto';

interface FormularioClienteProps {
    data: {
        nombre_cliente: string;
        direccion_cliente: string;
        barrio_cliente: string;
        telefono_cliente: string;
        observacion_cliente: string;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onDireccionChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inputDireccionRef?: React.RefObject<HTMLInputElement | null>;
    sugerenciasDireccion?: Cliente[];
    mostrarSugerenciasDireccion?: boolean;
    onSeleccionarCliente?: (cliente: Cliente) => void;
    setMostrarSugerenciasDireccion?: (mostrar: boolean) => void;
}

const FormularioCliente: React.FC<FormularioClienteProps> = ({
    data,
    onChange,
    onDireccionChange,
    inputDireccionRef,
    sugerenciasDireccion = [],
    mostrarSugerenciasDireccion = false,
    onSeleccionarCliente,
    setMostrarSugerenciasDireccion
}) => {
    const { capitalizarPalabras } = useFormateoTexto();

    return (
        <div className="columna-cliente">
            <fieldset>
                <legend>👤 Datos del Cliente</legend>

                <div className="form-group">
                    <label>Nombre del Cliente:</label>
                    <input
                        type="text"
                        name="nombre_cliente"
                        value={data.nombre_cliente}
                        onChange={onChange}
                    />
                </div>

                <div className="form-group" style={{ position: 'relative' }}>
                    <label>Dirección del Cliente:</label>
                    <input
                        type="text"
                        ref={inputDireccionRef}
                        name="direccion_cliente"
                        value={data.direccion_cliente}
                        onChange={onDireccionChange || onChange}
                        placeholder="Ej: Calle Principal 123"
                        autoComplete="off"
                        required
                    />
                    {mostrarSugerenciasDireccion && sugerenciasDireccion.length > 0 && (
                        <div className="sugerencias-direccion">
                            {sugerenciasDireccion.map(cliente => (
                                <div
                                    key={cliente.id}
                                    className="sugerencia"
                                    onClick={() => onSeleccionarCliente?.(cliente)}
                                >
                                    <strong>{capitalizarPalabras(cliente.direccion)}</strong><br />
                                    <small>
                                        {capitalizarPalabras(cliente.barrio)} - {capitalizarPalabras(cliente.nombre)} | Tel: {cliente.telefono}
                                    </small>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Barrio:</label>
                        <input
                            type="text"
                            name="barrio_cliente"
                            value={data.barrio_cliente}
                            onChange={onChange}
                            placeholder="Ej: Centro"
                        />
                    </div>

                    <div className="form-group">
                        <label>Teléfono del Cliente:</label>
                        <input
                            type="text"
                            name="telefono_cliente"
                            value={data.telefono_cliente}
                            onChange={onChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Observaciones del Cliente:</label>
                    <textarea
                        name="observacion_cliente"
                        value={data.observacion_cliente}
                        onChange={onChange}
                        rows={3}
                        placeholder="Referencias, datos adicionales..."
                    />
                </div>
            </fieldset>
        </div>
    );
};

export default FormularioCliente;