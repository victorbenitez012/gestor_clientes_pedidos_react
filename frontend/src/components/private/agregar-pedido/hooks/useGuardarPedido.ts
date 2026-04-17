// frontend/src/components/private/agregar-pedido/hooks/useGuardarPedido.ts
import { useState } from 'react';
import { FormDataPedido, ModalState } from '../types';

export const useGuardarPedido = () => {
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<ModalState>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    const closeModal = () => {
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    const realizarSubmit = async (
        formData: FormDataPedido,
        clienteId: number | null,
        actualizarCliente: boolean = false
    ): Promise<{ success: boolean; whatsappUrl?: string }> => {
        setLoading(true);

        const submitFormData = new FormData();
        submitFormData.append('direccion_cliente', formData.direccion_cliente);
        submitFormData.append('barrio_cliente', formData.barrio_cliente);
        submitFormData.append('nombre_cliente', formData.nombre_cliente);
        submitFormData.append('telefono_cliente', formData.telefono_cliente);
        submitFormData.append('observacion_cliente', formData.observacion_cliente);
        submitFormData.append('observacion_pedido', formData.observacion_pedido);
        submitFormData.append('estado', formData.estado);
        submitFormData.append('precio', formData.precio);
        submitFormData.append('repartidor', formData.repartidor);
        submitFormData.append('garrafa_10kg', formData.garrafa_10kg.toString());
        submitFormData.append('garrafa_15kg', formData.garrafa_15kg.toString());
        submitFormData.append('garrafa_45kg', formData.garrafa_45kg.toString());

        if (actualizarCliente && clienteId) {
            submitFormData.append('cliente_id', clienteId.toString());
        }

        try {
            const response = await fetch('http://localhost/gestor_clientes_pedidos_react/backend/pedidos/agregar.php', {
                method: 'POST',
                body: submitFormData
            });

            const text = await response.text();
            const whatsappMatch = text.match(/https:\/\/api\.whatsapp\.com\/send\?phone=[^&]+&text=[^'\s"]+/);

            if (text.includes('confirm') || text.includes('WhatsApp') || text.includes('Pedido registrado')) {
                setModal({
                    isOpen: true,
                    title: '¡Éxito!',
                    message: 'Pedido registrado exitosamente',
                    type: 'success',
                    onConfirm: () => closeModal(),
                    showAlternative: false,
                    confirmText: 'Aceptar',
                    cancelText: 'Cerrar'
                });

                return { success: true, whatsappUrl: whatsappMatch ? whatsappMatch[0] : undefined };
            } else {
                setModal({
                    isOpen: true,
                    title: 'Error',
                    message: 'Error al guardar el pedido',
                    type: 'error',
                    onConfirm: () => closeModal(),
                    showAlternative: false,
                    confirmText: 'Aceptar',
                    cancelText: 'Cerrar'
                });
                return { success: false };
            }
        } catch (error) {
            console.error('Error:', error);
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'Error al guardar el pedido',
                type: 'error',
                onConfirm: () => closeModal(),
                showAlternative: false,
                confirmText: 'Aceptar',
                cancelText: 'Cerrar'
            });
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    return { loading, modal, setModal, closeModal, realizarSubmit };
};