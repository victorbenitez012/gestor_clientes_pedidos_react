<?php
function conectarBD() {
    $servidor = "localhost";
    $usuario = "root";
    $contrasena = "";
    $basedatos = "gestor_clientes_pedidos";

    $conexion = new mysqli($servidor, $usuario, $contrasena, $basedatos);

    if ($conexion->connect_error) {
        die("Error de conexi�n: " . $conexion->connect_error);
    }

    return $conexion;
}
?>