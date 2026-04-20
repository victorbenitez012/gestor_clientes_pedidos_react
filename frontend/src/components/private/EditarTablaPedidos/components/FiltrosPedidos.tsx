import React from 'react';
import { Repartidor, FiltrosPedidos } from '../../../../types/types';

interface FiltrosPedidosComponentProps {
    filtros: FiltrosPedidos;
    repartidores: Repartidor[];
    loading: boolean;
    onFiltroChange: (key: keyof FiltrosPedidos, value: string) => void;
    onFiltrar: () => void;
    onLimpiar: () => void;
}

export const FiltrosPedidosComponent: React.FC<FiltrosPedidosComponentProps> = ({
    filtros,
    repartidores,
    loading,
    onFiltroChange,
    onFiltrar,
    onLimpiar
}) => {
    return (
        <div className="filters-container">
            <div className="filter-row">
                <div className="filter-group">
                    <label>📅 Desde</label>
                    <input
                        type="date"
                        value={filtros.fechaDesde}
                        onChange={(e) => onFiltroChange('fechaDesde', e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <label>📅 Hasta</label>
                    <input
                        type="date"
                        value={filtros.fechaHasta}
                        onChange={(e) => onFiltroChange('fechaHasta', e.target.value)}
                    />
                </div>
            </div>

            <div className="filter-row">
                <div className="filter-group">
                    <label>👤 Repartidor</label>
                    <select
                        value={filtros.repartidorId || ''}
                        onChange={(e) => onFiltroChange('repartidorId', e.target.value)}
                    >
                        <option value="">Todos los repartidores</option>
                        <option value="null">Sin asignar</option>
                        {repartidores.map(r => (
                            <option key={r.id} value={String(r.id)}>{r.nombre} {r.apellido}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>📊 Estado</label>
                    <select
                        value={filtros.estado || ''}
                        onChange={(e) => onFiltroChange('estado', e.target.value)}
                    >
                        <option value="">Todos los estados</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Cancelado">Cancelado</option>
                        <option value="Finalizado">Finalizado</option>
                        <option value="Cuenta">Cuenta</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>📅 Tipo de Entrega</label>
                    <select
                        value={filtros.tipoEntrega || ''}
                        onChange={(e) => onFiltroChange('tipoEntrega', e.target.value)}
                    >
                        <option value="">Todos</option>
                        <option value="programado">Programados</option>
                        <option value="inmediato">Inmediatos</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>🔍 Búsqueda General</label>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={filtros.search}
                        onChange={(e) => onFiltroChange('search', e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <label>🔎 Búsqueda Secundaria</label>
                    <input
                        type="text"
                        placeholder="Búsqueda adicional..."
                        value={filtros.searchSecondary}
                        onChange={(e) => onFiltroChange('searchSecondary', e.target.value)}
                    />
                </div>
            </div>

            <div className="filter-row">
                <div className="search-button">
                    <button onClick={onFiltrar} disabled={loading}>
                        {loading ? 'Cargando...' : 'Filtrar'}
                    </button>
                    <button onClick={onLimpiar}>Limpiar Filtros</button>
                </div>
            </div>
        </div>
    );
};

export default FiltrosPedidosComponent;