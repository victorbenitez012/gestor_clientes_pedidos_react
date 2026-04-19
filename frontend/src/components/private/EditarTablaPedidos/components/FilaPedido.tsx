import React from 'react';
import { Pedido, Repartidor } from '../../../../types/types';
import { InputText } from './InputText';
import { InputNumber } from './InputNumber';
import { InputPrecio } from './InputPrecio';
import { SelectEstado } from './SelectEstado';
import { SelectRepartidor } from './SelectRepartidor';
import { FechaProgramada } from './FechaProgramada';
import { capitalizarPalabras, capitalizarPrimeraLetra } from '../utils/formateadores';

interface FilaPedidoProps {
    pedido: Pedido;
    index: number;
    numero: number;
    repartidores: Repartidor[];
    esModificado: boolean;
    onUpdate: (field: keyof Pedido, value: any) => void;
    onFechaProgramadaChange: (value: string) => void;
    onProgramadoToggle: (checked: boolean) => void;
}

export const FilaPedido: React.FC<FilaPedidoProps> = ({
    pedido,
    index,
    numero,
    repartidores,
    esModificado,
    onUpdate,
    onFechaProgramadaChange,
    onProgramadoToggle
}) => {
    const handleTextChange = (field: keyof Pedido, value: string, aplicarFormateo: boolean = false) => {
        let valorFinal = value;
        if (aplicarFormateo) {
            if (field === 'tipo_pedido') valorFinal = capitalizarPalabras(value);
            if (field === 'observacion_pedido') valorFinal = capitalizarPrimeraLetra(value);
        }
        onUpdate(field, valorFinal);
    };

    return (
        <tr className={esModificado ? 'modificado' : ''}>
            <td>{numero}</td>
            <td>
                <InputText
                    value={pedido.tipo_pedido}
                    onChange={(v) => handleTextChange('tipo_pedido', v, false)}
                    onBlur={(v) => handleTextChange('tipo_pedido', v, true)}
                />
            </td>
            <td>
                <InputNumber
                    value={pedido.garrafa_10kg || 0}
                    onChange={(v) => onUpdate('garrafa_10kg', v)}
                />
            </td>
            <td>
                <InputNumber
                    value={pedido.garrafa_15kg || 0}
                    onChange={(v) => onUpdate('garrafa_15kg', v)}
                />
            </td>
            <td>
                <InputNumber
                    value={pedido.garrafa_45kg || 0}
                    onChange={(v) => onUpdate('garrafa_45kg', v)}
                />
            </td>
            <td>{pedido.direccion}</td>
            <td>{pedido.barrio}</td>
            <td>{pedido.telefono}</td>
            <td>{pedido.cliente_nombre}</td>
            <td>{pedido.cliente_observacion}</td>
            <td>
                <SelectEstado
                    value={pedido.estado}
                    onChange={(v) => onUpdate('estado', v)}
                />
            </td>
            <td>
                <InputPrecio
                    value={pedido.precio}
                    onChange={(v) => onUpdate('precio', v)}
                />
            </td>
            <td>
                <InputText
                    value={pedido.observacion_pedido}
                    onChange={(v) => handleTextChange('observacion_pedido', v, false)}
                    onBlur={(v) => handleTextChange('observacion_pedido', v, true)}
                />
            </td>
            <td>{pedido.fecha_creacion}</td>
            <td>
                <FechaProgramada
                    esProgramado={pedido.es_programado || 0}
                    fecha={pedido.fecha_entrega_programada}
                    onToggle={onProgramadoToggle}
                    onFechaChange={onFechaProgramadaChange}
                />
            </td>
            <td>
                <SelectRepartidor
                    value={pedido.repartidor_id}
                    onChange={(v) => onUpdate('repartidor_id', v)}
                    repartidores={repartidores}
                />
            </td>
        </tr>
    );
};

export default FilaPedido;