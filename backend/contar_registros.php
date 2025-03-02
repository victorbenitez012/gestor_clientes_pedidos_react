<?php
// Archivo: contar_registros.php
// Habilitar CORS
header('Content-Type: application/json'); // Asegurar que la respuesta sea JSON
header('Access-Control-Allow-Origin: *'); // Permitir solicitudes desde cualquier origen
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS'); // Métodos permitidos
header('Access-Control-Allow-Headers: Content-Type'); // Encabezados permitidos
require_once __DIR__ . './conexion.php';

// Verificar si el parámetro 'tabla' está presente en la solicitud GET
if (isset($_GET['tabla'])) {
    $tabla = $_GET['tabla'];

    try {
        // Consulta SQL para contar los registros de la tabla
        $query = "SELECT COUNT(*) AS total FROM $tabla";
        
        // Ejecutar la consulta
        $resultado = ejecutarQuery($query);

        // Obtener el resultado
        $fila = $resultado->fetch_assoc();
        
        // Devolver el total de registros en formato JSON
        echo json_encode(['total' => $fila['total']]);
    } catch (Exception $e) {
        // Si ocurre un error, devolver un mensaje de error en JSON
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'El parámetro "tabla" es requerido.']);
}
?>
