import React, { useState, useEffect } from 'react';

interface SelectorFechaProps {
    fechaSeleccionada: string;
    esProgramado: boolean;
    onFechaChange: (fecha: string) => void;
    onProgramadoChange: (esProgramado: boolean) => void;
}

const SelectorFecha: React.FC<SelectorFechaProps> = ({
    fechaSeleccionada,
    esProgramado,
    onFechaChange,
    onProgramadoChange
}) => {
    const [mostrarCalendario, setMostrarCalendario] = useState(false);

    // Obtener fecha actual en formato YYYY-MM-DD
    const hoy = new Date().toISOString().split('T')[0];

    // Calcular fecha por defecto (mañana)
    const obtenerFechaManana = () => {
        const manana = new Date();
        manana.setDate(manana.getDate() + 1);
        return manana.toISOString().split('T')[0];
    };

    // Calcular fecha mínima (hoy) y máxima (6 meses después)
    const fechaMax = new Date();
    fechaMax.setMonth(fechaMax.getMonth() + 6);
    const fechaMaxStr = fechaMax.toISOString().split('T')[0];

    // Efecto para asignar fecha por defecto cuando se programa
    useEffect(() => {
        if (esProgramado && !fechaSeleccionada) {
            const fechaManana = obtenerFechaManana();
            onFechaChange(fechaManana);
        }
    }, [esProgramado]); // Solo se ejecuta cuando cambia esProgramado

    // Formatear fecha para mostrar
    const formatearFecha = (fecha: string) => {
        if (!fecha) return 'No seleccionada';
        const [year, month, day] = fecha.split('-');
        return `${day}/${month}/${year}`;
    };

    // Obtener días hasta la fecha
    const getDiasHasta = (fecha: string) => {
        if (!fecha) return null;
        const hoyDate = new Date();
        const fechaDate = new Date(fecha);
        const diffTime = fechaDate.getTime() - hoyDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return '🎯 Hoy';
        if (diffDays === 1) return '⏰ Mañana';
        if (diffDays < 0) return '📅 Fecha pasada';
        return `📅 En ${diffDays} días`;
    };

    const handleCheckboxChange = (checked: boolean) => {
        onProgramadoChange(checked);

        if (checked) {
            // Si se marca y no hay fecha, asignar mañana
            if (!fechaSeleccionada) {
                const fechaManana = obtenerFechaManana();
                onFechaChange(fechaManana);
            }
        } else {
            // Si se desmarca, limpiar la fecha
            onFechaChange('');
        }
    };

    return (
        <div className="selector-fecha-container" style={{ marginBottom: '15px' }}>
            <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                        type="checkbox"
                        checked={esProgramado}
                        onChange={(e) => handleCheckboxChange(e.target.checked)}
                        style={{ width: 'auto' }}
                    />
                    📅 Programar para fecha específica
                </label>
            </div>

            {esProgramado && (
                <div className="fecha-programada" style={{
                    padding: '15px',
                    backgroundColor: '#FFF3E0',
                    borderRadius: '8px',
                    border: '1px solid #FFB74D',
                    marginTop: '10px'
                }}>
                    <div className="form-group">
                        <label>📆 Seleccionar fecha de entrega:</label>
                        <input
                            type="date"
                            name="fecha_entrega_programada"  // ← IMPORTANTE: name para el formulario
                            value={fechaSeleccionada}
                            onChange={(e) => onFechaChange(e.target.value)}
                            min={hoy}
                            max={fechaMaxStr}
                            required={esProgramado}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '16px'
                            }}
                        />
                        {fechaSeleccionada && (
                            <div style={{
                                marginTop: '8px',
                                padding: '8px',
                                backgroundColor: '#E8F5E9',
                                borderRadius: '4px',
                                fontSize: '14px'
                            }}>
                                <strong>{getDiasHasta(fechaSeleccionada)}</strong>
                                <br />
                                <small>Entrega programada: {formatearFecha(fechaSeleccionada)}</small>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>📝 Recordatorio (opcional):</label>
                        <select style={{ width: '100%', padding: '8px' }}>
                            <option value="">Sin recordatorio</option>
                            <option value="1dia">1 día antes</option>
                            <option value="2dias">2 días antes</option>
                            <option value="3dias">3 días antes</option>
                        </select>
                    </div>
                </div>
            )}

            {!esProgramado && (
                <div style={{
                    padding: '10px',
                    backgroundColor: '#E3F2FD',
                    borderRadius: '8px',
                    fontSize: '14px'
                }}>
                    ⚡ Pedido para entrega inmediata (procesamiento hoy)
                </div>
            )}
        </div>
    );
};

export default SelectorFecha;