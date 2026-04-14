<?php
// Archivo: contar_pedidos.php
// Habilitar CORS
header('Content-Type: application/json'); // Asegurar que la respuesta sea JSON
header('Access-Control-Allow-Origin: *'); // Permitir solicitudes desde cualquier origen
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS'); // Métodos permitidos
header('Access-Control-Allow-Headers: Content-Type'); // Encabezados permitidos

require_once __DIR__ . './conexion.php';

// Verificar si el parámetro 'estado' está presente en la solicitud GET
if (isset($_GET['estado'])) {
    $estado = $_GET['estado'];

    try {
        // Consulta SQL para contar los pedidos por estado
        $query = "SELECT COUNT(*) AS total FROM pedidos WHERE estado = ?";
        
        // Ejecutar la consulta con el parámetro 'estado'
        $resultado = ejecutarQuery($query, [$estado]);

        // Obtener el resultado
        $fila = $resultado->fetch_assoc();
        
        // Devolver el total de pedidos en formato JSON
        echo json_encode(['total' => $fila['total']]);
    } catch (Exception $e) {
        // Si ocurre un error, devolver un mensaje de error en JSON
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'El parámetro "estado" es requerido.']);
}
?>
