<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/conexion.php';
$conexion = conectarBD();

if (isset($_GET['estado'])) {
    $estado = $_GET['estado'];
    
    // Validar estado permitido
    $estadosPermitidos = ['pendiente', 'en proceso', 'entregado', 'finalizado', 'cuenta'];
    if (!in_array(strtolower($estado), $estadosPermitidos)) {
        echo json_encode(['error' => 'Estado no válido']);
        $conexion->close();
        exit();
    }
    
    try {
        $query = "SELECT COUNT(*) as total FROM pedidos WHERE LOWER(estado) = LOWER(?)";
        $stmt = $conexion->prepare($query);
        $stmt->bind_param("s", $estado);
        $stmt->execute();
        $resultado = $stmt->get_result();
        
        if ($resultado) {
            $fila = $resultado->fetch_assoc();
            echo json_encode(['total' => (int)$fila['total']]);
        } else {
            echo json_encode(['error' => 'Error al contar pedidos']);
        }
        
        $stmt->close();
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
    
    $conexion->close();
} else {
    echo json_encode(['error' => 'El parámetro "estado" es requerido']);
}
?>