import { useState } from 'react';
import { FiltrosPedidos } from '../../../../types/types';

export const useFiltros = () => {
    const [filtros, setFiltros] = useState<FiltrosPedidos>({
        search: '',
        searchSecondary: '',
        fechaDesde: '',
        fechaHasta: '',
        repartidorId: '',
        estado: '',
        tipoEntrega: ''
    });

    const actualizarFiltro = (key: keyof FiltrosPedidos, value: string) => {
        setFiltros(prev => ({ ...prev, [key]: value }));
    };

    const limpiarFiltros = () => {
        setFiltros({
            search: '',
            searchSecondary: '',
            fechaDesde: '',
            fechaHasta: '',
            repartidorId: '',
            estado: '',
            tipoEntrega: ''
        });
    };

    return { filtros, actualizarFiltro, limpiarFiltros };
};