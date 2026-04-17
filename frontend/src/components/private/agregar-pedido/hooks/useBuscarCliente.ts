// frontend/src/components/private/agregar-pedido/hooks/useBuscarCliente.ts
import { useState, useCallback } from 'react';
import { Cliente } from '../types';
import { useFormateoTexto } from './useFormateoTexto';

export const useBuscarCliente = () => {
    const [sugerenciasTotal, setSugerenciasTotal] = useState<Cliente[]>([]);
    const [sugerenciasDireccion, setSugerenciasDireccion] = useState<Cliente[]>([]);
    const [mostrarSugerenciasTotal, setMostrarSugerenciasTotal] = useState(false);
    const [mostrarSugerenciasDireccion, setMostrarSugerenciasDireccion] = useState(false);
    const [loading, setLoading] = useState(false);
    const { capitalizarPalabras, capitalizarPrimeraLetra } = useFormateoTexto();

    const buscarClientesTotal = useCallback(async (busqueda: string) => {
        if (busqueda.length > 2) {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost/gestor_clientes_pedidos_react/backend/pedidos/agregar.php?buscar_cliente_total=1&buscar_busqueda=${encodeURIComponent(busqueda)}`);
                const data = await response.json();
                if (!data.error && Array.isArray(data)) {
                    setSugerenciasTotal(data);
                    setMostrarSugerenciasTotal(true);
                } else {
                    setSugerenciasTotal([]);
                    setMostrarSugerenciasTotal(false);
                }
            } catch (error) {
                console.error('Error buscando clientes:', error);
                setSugerenciasTotal([]);
                setMostrarSugerenciasTotal(false);
            } finally {
                setLoading(false);
            }
        } else {
            setSugerenciasTotal([]);
            setMostrarSugerenciasTotal(false);
        }
    }, []);

    const buscarClientesDireccion = useCallback(async (direccion: string) => {
        if (direccion.length > 2) {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost/gestor_clientes_pedidos_react/backend/pedidos/agregar.php?buscar_cliente=1&direccion_busqueda=${encodeURIComponent(direccion)}`);
                const data = await response.json();
                if (!data.error && Array.isArray(data)) {
                    setSugerenciasDireccion(data);
                    setMostrarSugerenciasDireccion(true);
                } else {
                    setSugerenciasDireccion([]);
                    setMostrarSugerenciasDireccion(false);
                }
            } catch (error) {
                console.error('Error buscando por dirección:', error);
                setSugerenciasDireccion([]);
                setMostrarSugerenciasDireccion(false);
            } finally {
                setLoading(false);
            }
        } else {
            setSugerenciasDireccion([]);
            setMostrarSugerenciasDireccion(false);
        }
    }, []);

    const limpiarSugerencias = () => {
        setSugerenciasTotal([]);
        setSugerenciasDireccion([]);
        setMostrarSugerenciasTotal(false);
        setMostrarSugerenciasDireccion(false);
    };

    return {
        sugerenciasTotal,
        sugerenciasDireccion,
        mostrarSugerenciasTotal,
        mostrarSugerenciasDireccion,
        loading: loading,
        buscarClientesTotal,
        buscarClientesDireccion,
        limpiarSugerencias,
        setMostrarSugerenciasTotal,
        setMostrarSugerenciasDireccion
    };
};