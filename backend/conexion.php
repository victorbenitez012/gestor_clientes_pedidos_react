<?php
// Archivo: conexion.php

require_once __DIR__ . './config.php';

/**
 * Función para conectar a la base de datos.
 *
 * @return mysqli Retorna la conexión a la base de datos.
 * @throws Exception Si la conexión falla.
 */
function conectarBD() {
    $config = include __DIR__ . './config.php';
    $host = $config['db']['host'];
    $usuario = $config['db']['usuario'];
    $contrasena = $config['db']['contrasena'];
    $base_datos = $config['db']['base_datos'];

    $conexion = new mysqli($host, $usuario, $contrasena, $base_datos);

    if ($conexion->connect_error) {
        throw new Exception("Error de conexión: " . $conexion->connect_error);
    }

    return $conexion;
}

/**
 * Función para ejecutar una consulta SQL.
 *
 * @param string $query La consulta SQL que se desea ejecutar.
 * @param array $params Parámetros para la consulta preparada (opcional).
 * @return mixed Resultado de la consulta.
 * @throws Exception Si la consulta falla.
 */
function ejecutarQuery($query, $params = []) {
    $conexion = conectarBD();

    // Si hay parámetros, usar consultas preparadas
    if (!empty($params)) {
        $stmt = $conexion->prepare($query);
        if (!$stmt) {
            throw new Exception("Error en la preparación de la consulta: " . $conexion->error);
        }

        // Vincular parámetros
        $tipos = '';
        $valores = [];
        foreach ($params as $param) {
            if (is_int($param)) {
                $tipos .= 'i'; // Entero
            } elseif (is_float($param)) {
                $tipos .= 'd'; // Decimal
            } elseif (is_string($param)) {
                $tipos .= 's'; // String
            } else {
                $tipos .= 'b'; // Blob
            }
            $valores[] = $param;
        }

        $stmt->bind_param($tipos, ...$valores);
        $stmt->execute();
        $resultado = $stmt->get_result();
        $stmt->close();
    } else {
        // Si no hay parámetros, ejecutar la consulta directamente
        $resultado = $conexion->query($query);
        if (!$resultado) {
            throw new Exception("Error en la consulta SQL: " . $conexion->error);
        }
    }

    // Cerrar la conexión
    $conexion->close();

    return $resultado;
}