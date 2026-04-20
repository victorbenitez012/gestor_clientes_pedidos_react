import * as XLSX from 'xlsx';
import { Pedido } from '../../../../types/types';

interface TotalesImpresion {
    total10kg: number;
    total15kg: number;
    total45kg: number;
    totalPrecio: number;
}

export const exportarExcel = (pedidos: Pedido[], paginaActual: number, registrosPorPagina: number, totales: { totalPrecio: number; totalGarrafas10kg: number; totalGarrafas15kg: number; totalGarrafas45kg: number }) => {
    const datosExcel: any[][] = [];

    datosExcel.push([
        '#', 'Dirección', 'Barrio', 'Teléfono', 'Nombre Cliente',
        'Observación Cliente', 'Observación Pedido', '10kg', '15kg', '45kg',
        'Precio', 'E/T', '✓'
    ]);

    pedidos.forEach((pedido, index) => {
        datosExcel.push([
            index + 1 + (paginaActual - 1) * registrosPorPagina,
            pedido.direccion,
            pedido.barrio,
            pedido.telefono,
            pedido.cliente_nombre,
            pedido.cliente_observacion,
            pedido.observacion_pedido,
            pedido.garrafa_10kg || 0,
            pedido.garrafa_15kg || 0,
            pedido.garrafa_45kg || 0,
            pedido.precio || 0,
            '', // E/T vacío para llenar manualmente
            ''  // ✓ vacío para marcar
        ]);
    });

    // Rellenar hasta 35 filas
    for (let i = pedidos.length + 1; i <= 35; i++) {
        datosExcel.push([
            i + (paginaActual - 1) * registrosPorPagina,
            '', '', '', '', '', '', '', '', '', '', '', ''
        ]);
    }

    datosExcel.push([
        'TOTALES:', '', '', '', '', '', '',
        totales.totalGarrafas10kg, totales.totalGarrafas15kg, totales.totalGarrafas45kg,
        `$${totales.totalPrecio.toFixed(2)}`, '', ''
    ]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(datosExcel);
    ws['!cols'] = [
        { wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 15 },
        { wch: 20 }, { wch: 25 }, { wch: 25 }, { wch: 8 },
        { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 8 }, { wch: 5 }
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');

    const fecha = new Date();
    const fechaStr = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getDate().toString().padStart(2, '0')}`;
    XLSX.writeFile(wb, `pedidos_${fechaStr}.xlsx`);
};

export const generarHtmlImpresion = (pedidos: Pedido[], paginaActual: number, registrosPorPagina: number, totales: TotalesImpresion, TOTAL_RENGLONES_IMPRESION: number = 35): string => {
    let tablaHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Imprimir Pedidos</title>
        <meta charset="UTF-8">
        <style>
            * { 
                font-family: Arial, sans-serif; 
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body { 
                margin: 20px; 
                padding: 0; 
            }
            h1 { 
                text-align: center; 
                margin-bottom: 20px; 
                color: #4b0082; 
                font-size: 18px;
            }
            table { 
                border-collapse: collapse; 
                width: 100%; 
                margin-bottom: 20px; 
                font-size: 11px; 
            }
            th, td { 
                border: 1px solid #000; 
                padding: 5px; 
                text-align: left; 
                vertical-align: top; 
            }
            th { 
                background-color: #f2f2f2; 
                font-weight: bold; 
                text-align: center; 
            }
            .text-center { 
                text-align: center !important; 
            }
            .text-left { 
                text-align: left !important; 
            }
            .text-right { 
                text-align: right !important; 
            }
            .totales { 
                font-weight: bold; 
                background-color: #f0f0f0; 
            }
            @media print {
                body { 
                    margin: 0; 
                    padding: 10px; 
                }
                th, td { 
                    padding: 4px; 
                }
            }
        </style>
    </head>
    <body>
        <h1>Planilla de Pedidos</h1>
        <table>
            <thead>
                <tr>
                    <th class="text-center">#</th>
                    <th class="text-left">Dirección</th>
                    <th class="text-left">Barrio</th>
                    <th class="text-left">Teléfono</th>
                    <th class="text-left">Nombre Cliente</th>
                    <th class="text-left">Observación Cliente</th>
                    <th class="text-left">Observación Pedido</th>
                    <th class="text-center">10kg</th>
                    <th class="text-center">15kg</th>
                    <th class="text-center">45kg</th>
                    <th class="text-left">Precio</th>
                    <th class="text-center">E/T</th>
                    <th class="text-center">✓</th>
                </tr>
            </thead>
            <tbody>
    `;

    pedidos.forEach((pedido, idx) => {
        const num = idx + 1 + (paginaActual - 1) * registrosPorPagina;
        const precioNum = Number(pedido.precio) || 0;

        tablaHtml += `
            <tr>
                <td class="text-center">${num}</td>
                <td class="text-left">${pedido.direccion || ''}</td>
                <td class="text-left">${pedido.barrio || ''}</td>
                <td class="text-left">${pedido.telefono || ''}</td>
                <td class="text-left">${pedido.cliente_nombre || ''}</td>
                <td class="text-left">${pedido.cliente_observacion || ''}</td>
                <td class="text-left">${pedido.observacion_pedido || ''}</td>
                <td class="text-center">${pedido.garrafa_10kg > 0 ? pedido.garrafa_10kg : ''}</td>
                <td class="text-center">${pedido.garrafa_15kg > 0 ? pedido.garrafa_15kg : ''}</td>
                <td class="text-center">${pedido.garrafa_45kg > 0 ? pedido.garrafa_45kg : ''}</td>
                <td class="text-left">${precioNum > 0 ? '$' + precioNum.toFixed(2) : ''}</td>
                <td class="text-center"></td>
                <td class="text-center"></td>
            </tr>
        `;
    });

    // Renglones vacíos para llegar a 35
    for (let i = pedidos.length + 1; i <= TOTAL_RENGLONES_IMPRESION; i++) {
        const num = i + (paginaActual - 1) * registrosPorPagina;
        tablaHtml += `
            <tr>
                <td class="text-center">${num}</td>
                <td class="text-left"></td>
                <td class="text-left"></td>
                <td class="text-left"></td>
                <td class="text-left"></td>
                <td class="text-left"></td>
                <td class="text-left"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="text-left"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>
            </tr>
        `;
    }

    tablaHtml += `
            </tbody>
            <tfoot>
                <tr class="totales">
                    <td colspan="7" class="text-right"><strong>TOTALES:</strong></td>
                    <td class="text-center"><strong>${totales.total10kg > 0 ? totales.total10kg : ''}</strong></td>
                    <td class="text-center"><strong>${totales.total15kg > 0 ? totales.total15kg : ''}</strong></td>
                    <td class="text-center"><strong>${totales.total45kg > 0 ? totales.total45kg : ''}</strong></td>
                    <td class="text-left"><strong>${totales.totalPrecio > 0 ? '$' + totales.totalPrecio.toFixed(2) : ''}</strong></td>
                    <td colspan="2"></td>
                </tr>
            </tfoot>
        </table>
        <p style="text-align: center; font-size: 10px; margin-top: 20px;">
            Fecha de impresión: ${new Date().toLocaleString()}
        </p>
    </body>
    </html>
    `;

    return tablaHtml;
};