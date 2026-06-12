<?php

if (!defined('BIKE_MODULE_DB_HOST')) define('BIKE_MODULE_DB_HOST', '127.0.0.1');
if (!defined('BIKE_MODULE_DB_NAME')) define('BIKE_MODULE_DB_NAME', 'campus_service');
if (!defined('BIKE_MODULE_DB_USER')) define('BIKE_MODULE_DB_USER', 'root');
if (!defined('BIKE_MODULE_DB_PASS')) define('BIKE_MODULE_DB_PASS', '123456');

function bike_module_connect()
{
    $dsn = 'mysql:host=' . BIKE_MODULE_DB_HOST . ';dbname=' . BIKE_MODULE_DB_NAME . ';charset=utf8mb4';
    $pdo = new PDO($dsn, BIKE_MODULE_DB_USER, BIKE_MODULE_DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    date_default_timezone_set('Asia/Shanghai');
    return $pdo;
}

function bike_module_response(array $data)
{
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function bike_module_handle_request()
{
    $pdo = bike_module_connect();
    $action = $_GET['action'] ?? '';
    $payload = json_decode(file_get_contents('php://input'), true) ?: [];

    switch ($action) {
        case 'list_bikes':
            bike_module_list_bikes($pdo);
            break;
        case 'borrow_bike':
            bike_module_borrow_bike($pdo, $payload);
            break;
        case 'return_bike':
            bike_module_return_bike($pdo, $payload);
            break;
        case 'report_repair':
            bike_module_report_repair($pdo, $payload);
            break;
        case 'list_records':
            bike_module_list_records($pdo);
            break;
        case 'list_orders':
            bike_module_list_orders($pdo);
            break;
        case 'pay_order':
            bike_module_pay_order($pdo, $payload);
            break;
        default:
            bike_module_response(['success' => false, 'message' => '无效的 action 参数']);
    }
}

function bike_module_list_bikes(PDO $pdo)
{
    $position = $_GET['position'] ?? '';
    $sql = 'SELECT id, bike_no, position, status FROM bike_info';
    $params = [];
    if ($position !== '') {
        $sql .= ' WHERE position = :position';
        $params[':position'] = $position;
    }
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    bike_module_response(['success' => true, 'bikes' => $stmt->fetchAll()]);
}

function bike_module_borrow_bike(PDO $pdo, array $payload)
{
    $userId = intval($payload['user_id'] ?? 0);
    $bikeId = intval($payload['bike_id'] ?? 0);
    if (!$userId || !$bikeId) {
        bike_module_response(['success' => false, 'message' => 'user_id 和 bike_id 为必填项']);
    }
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare('SELECT status FROM bike_info WHERE id = :id FOR UPDATE');
        $stmt->execute([':id' => $bikeId]);
        $bike = $stmt->fetch();
        if (!$bike) {
            throw new Exception('未找到该单车');
        }
        if ($bike['status'] !== '可借用') {
            throw new Exception('该单车当前不可借用');
        }
        $now = date('Y-m-d H:i:s');
        $pdo->prepare('UPDATE bike_info SET status = "已借出" WHERE id = :id')->execute([':id' => $bikeId]);
        $pdo->prepare('INSERT INTO bike_record (user_id, bike_id, borrow_time) VALUES (:user_id, :bike_id, :borrow_time)')
            ->execute([':user_id' => $userId, ':bike_id' => $bikeId, ':borrow_time' => $now]);
        $pdo->commit();
        bike_module_response(['success' => true, 'message' => '借车成功，祝您骑行愉快！']);
    } catch (Exception $e) {
        $pdo->rollBack();
        bike_module_response(['success' => false, 'message' => '借车失败：' . $e->getMessage()]);
    }
}

function bike_module_return_bike(PDO $pdo, array $payload)
{
    $recordId = intval($payload['record_id'] ?? 0);
    if (!$recordId) {
        bike_module_response(['success' => false, 'message' => 'record_id 为必填项']);
    }
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare('SELECT bike_id, borrow_time, return_time FROM bike_record WHERE id = :id FOR UPDATE');
        $stmt->execute([':id' => $recordId]);
        $record = $stmt->fetch();
        if (!$record) {
            throw new Exception('未找到骑行记录');
        }
        if ($record['return_time'] !== null) {
            throw new Exception('该骑行记录已归还');
        }
        $returnTime = date('Y-m-d H:i:s');
        $borrowTime = new DateTime($record['borrow_time']);
        $duration = max(1, intval(round((new DateTime($returnTime))->getTimestamp() - $borrowTime->getTimestamp()) / 60));
        $pdo->prepare('UPDATE bike_info SET status = "可借用" WHERE id = :bike_id')->execute([':bike_id' => $record['bike_id']]);
        $pdo->prepare('UPDATE bike_record SET return_time = :return_time, duration = :duration WHERE id = :id')
            ->execute([':return_time' => $returnTime, ':duration' => $duration, ':id' => $recordId]);
        $pdo->commit();
        bike_module_response(['success' => true, 'message' => '还车成功，骑行时长 ' . $duration . ' 分钟']);
    } catch (Exception $e) {
        $pdo->rollBack();
        bike_module_response(['success' => false, 'message' => '还车失败：' . $e->getMessage()]);
    }
}

function bike_module_report_repair(PDO $pdo, array $payload)
{
    $bikeId = intval($payload['bike_id'] ?? 0);
    $reason = trim($payload['reason'] ?? '');
    if (!$bikeId || $reason === '') {
        bike_module_response(['success' => false, 'message' => 'bike_id 和 reason 为必填项']);
    }
    $stmt = $pdo->prepare('SELECT id FROM bike_info WHERE id = :id');
    $stmt->execute([':id' => $bikeId]);
    if (!$stmt->fetch()) {
        bike_module_response(['success' => false, 'message' => '未找到该单车']);
    }
    $now = date('Y-m-d H:i:s');
    $pdo->prepare('INSERT INTO bike_repair (bike_id, reason, report_time) VALUES (:bike_id, :reason, :report_time)')
        ->execute([':bike_id' => $bikeId, ':reason' => $reason, ':report_time' => $now]);
    $pdo->prepare('UPDATE bike_info SET status = "维修" WHERE id = :id')->execute([':id' => $bikeId]);
    bike_module_response(['success' => true, 'message' => '报修提交成功，单车已标记为维修状态']);
}

function bike_module_list_orders(PDO $pdo)
{
    $userId = intval($_GET['user_id'] ?? 0);
    if (!$userId) {
        bike_module_response(['success' => false, 'message' => 'user_id 为必填项']);
    }
    $stmt = $pdo->prepare(
        'SELECT r.id, r.bike_id, b.bike_no, b.position, r.borrow_time, r.return_time, r.duration, r.payment_amount, r.payment_status
         FROM bike_record r
         JOIN bike_info b ON r.bike_id = b.id
         WHERE r.user_id = :user_id AND r.return_time IS NOT NULL
         ORDER BY r.borrow_time DESC'
    );
    $stmt->execute([':user_id' => $userId]);
    bike_module_response(['success' => true, 'orders' => $stmt->fetchAll()]);
}

function bike_module_pay_order(PDO $pdo, array $payload)
{
    $recordId = intval($payload['record_id'] ?? 0);
    if (!$recordId) {
        bike_module_response(['success' => false, 'message' => 'record_id 为必填项']);
    }
    $stmt = $pdo->prepare('SELECT return_time, payment_amount, payment_status FROM bike_record WHERE id = :id FOR UPDATE');
    $stmt->execute([':id' => $recordId]);
    $record = $stmt->fetch();
    if (!$record) {
        bike_module_response(['success' => false, 'message' => '未找到该订单']);
    }
    if ($record['return_time'] === null) {
        bike_module_response(['success' => false, 'message' => '骑行尚未结束，无法支付']);
    }
    if ($record['payment_status'] === '已支付') {
        bike_module_response(['success' => false, 'message' => '该订单已支付']);
    }
    $pdo->prepare('UPDATE bike_record SET payment_status = "已支付" WHERE id = :id')
        ->execute([':id' => $recordId]);
    bike_module_response(['success' => true, 'message' => '支付成功，感谢您的使用']);
}
