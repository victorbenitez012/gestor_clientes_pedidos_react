// frontend/src/components/private/agregar-pedido/hooks/useBuscarCliente.ts
import { useState, useCallback } from 'react';
import { Cliente } from '../types';
import { 
    buscarClientesParaAgregarPedido,
    buscarClientesPorDireccionAgregar
} from '../../../../services/api';

export const useBuscarCliente = () => {
    const [sugerenciasTotal, setSugerenciasTotal] = useState<Cliente[]>([]);
    const [sugerenciasDireccion, setSugerenciasDireccion] = useState<Cliente[]>([]);
    const [mostrarSugerenciasTotal, setMostrarSugerenciasTotal] = useState(false);
    const [mostrarSugerenciasDireccion, setMostrarSugerenciasDireccion] = useState(false);
    const [loading, setLoading] = useState(false);

    const buscarClientesTotal = useCallback(async (busqueda: string) => {
        if (busqueda.length < 2) {
            setSugerenciasTotal([]);
            setMostrarSugerenciasTotal(false);
            return;
        }

        setLoading(true);
        try {
            const clientes = await buscarClientesParaAgregarPedido(busqueda);
            setSugerenciasTotal(clientes);
            setMostrarSugerenciasTotal(clientes.length > 0);
        } catch (error) {
            console.error('Error en búsqueda total:', error);
            setSugerenciasTotal([]);
            setMostrarSugerenciasTotal(false);
        } finally {
            setLoading(false);
        }
    }, []);

    const buscarClientesDireccion = useCallback(async (busqueda: string) => {
        if (busqueda.length < 2) {
            setSugerenciasDireccion([]);
            setMostrarSugerenciasDireccion(false);
            return;
        }

        setLoading(true);
        try {
            const clientes = await buscarClientesPorDireccionAgregar(busqueda);
            setSugerenciasDireccion(clientes);
            setMostrarSugerenciasDireccion(clientes.length > 0);
        } catch (error) {
            console.error('Error en búsqueda dirección:', error);
            setSugerenciasDireccion([]);
            setMostrarSugerenciasDireccion(false);
        } finally {
            setLoading(false);
        }
    }, []);

    const limpiarSugerencias = useCallback(() => {
        setSugerenciasTotal([]);
        setSugerenciasDireccion([]);
        setMostrarSugerenciasTotal(false);
        setMostrarSugerenciasDireccion(false);
    }, []);

    return {
        sugerenciasTotal,
        sugerenciasDireccion,
        mostrarSugerenciasTotal,
        mostrarSugerenciasDireccion,
        buscarClientesTotal,
        buscarClientesDireccion,
        limpiarSugerencias,
        setMostrarSugerenciasTotal,
        setMostrarSugerenciasDireccion,
        loading
    };
};