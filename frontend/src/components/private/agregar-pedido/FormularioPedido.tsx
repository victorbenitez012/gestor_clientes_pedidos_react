// frontend/src/components/private/agregar-pedido/FormularioPedido.tsx
import React from 'react';
import { Repartidor } from './types';
import SelectorGarrafas from './SelectorGarrafas';
import SelectorFecha from './SelectorFecha';

interface FormularioPedidoProps {
    garrafas: {
        garrafa_10kg: number;
        garrafa_15kg: number;
        garrafa_45kg: number;
    };
    onGarrafaChange: (campo: string, valor: number) => void;
    textoGarrafasMostrar: string;
    observacion_pedido: string;
    estado: string;
    precio: string;
    repartidor: string;
    repartidores: Repartidor[];
    fecha_entrega_programada: string;
    es_programado: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onFechaChange: (fecha: string) => void;
    onProgramadoChange: (esProgramado: boolean) => void;
}

const FormularioPedido: React.FC<FormularioPedidoProps> = ({
    garrafas,
    onGarrafaChange,
    textoGarrafasMostrar,
    observacion_pedido,
    estado,
    precio,
    repartidor,
    repartidores,
    fecha_entrega_programada,
    es_programado,
    onChange,
    onFechaChange,
    onProgramadoChange
}) => {
    return (
        <div className="columna-pedido">
            <fieldset>
                <legend>📦 Datos del Pedido</legend>

                <SelectorGarrafas valores={garrafas} onChange={onGarrafaChange} />

                {textoGarrafasMostrar && (
                    <div className="resumen-garrafas">
                        <strong>📊 Resumen:</strong> {textoGarrafasMostrar}
                    </div>
                )}

                {/* NUEVO: Selector de fecha */}
                <SelectorFecha
                    fechaSeleccionada={fecha_entrega_programada}
                    esProgramado={es_programado}
                    onFechaChange={onFechaChange}
                    onProgramadoChange={onProgramadoChange}
                />

                <div className="form-group">
                    <label>Observaciones del Pedido:</label>
                    <textarea
                        name="observacion_pedido"
                        value={observacion_pedido}
                        onChange={onChange}
                        rows={2}
                        placeholder="Instrucciones especiales, horario de entrega, etc."
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Estado:</label>
                        <select name="estado" value={estado} onChange={onChange} required>
                            <option value="Pendiente">⏳ Pendiente</option>
                            <option value="En Proceso">🔄 En Proceso</option>
                            <option value="Entregado">✅ Entregado</option>
                            <option value="Cancelado">❌ Cancelado</option>
                            <option value="Finalizado">🏁 Finalizado</option>
                            <option value="Cuenta">💰 Cuenta</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Precio:</label>
                        <input
                            type="number"
                            step="0.01"
                            name="precio"
                            value={precio}
                            onChange={onChange}
                            placeholder="0.00"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Repartidor:</label>
                    <select name="repartidor" value={repartidor} onChange={onChange}>
                        <option value="">(Sin asignar)</option>
                        {repartidores.map(r => (
                            <option key={r.id} value={r.id}>🚚 {r.nombre} {r.apellido}</option>
                        ))}
                    </select>
                </div>
            </fieldset>
        </div>
    );
};

export default FormularioPedido;