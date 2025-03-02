<?php
session_start();
include 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);
$username = $data['root'];
$password = $data[''];

$query = "SELECT id, role FROM usuarios WHERE username = ? AND password = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("ss", $username, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $_SESSION['user_id'] = $row['id'];
    $_SESSION['role'] = $row['role'];
    echo json_encode(['success' => true, 'role' => $row['role']]);
} else {
    echo json_encode(['success' => false]);
}
?>