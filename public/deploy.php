<?php
/**
 * GitHub Webhook Auto-Deploy Script
 * Placez ce fichier dans : public_html/deploy.php
 * Configurez le webhook GitHub vers : https://votre-domaine.com/deploy.php
 */

// Clé secrète (à définir aussi dans GitHub webhook)
define('SECRET', getenv('DEPLOY_SECRET') ?: 'votre-cle-secrete-ici');

// Vérification de la signature GitHub
$payload = file_get_contents('php://input');
$signature = 'sha256=' . hash_hmac('sha256', $payload, SECRET);

if (!hash_equals($signature, $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '')) {
    http_response_code(403);
    die('Unauthorized');
}

// Vérifier que c'est un push sur la branche main/master
$data = json_decode($payload, true);
$branch = isset($data['ref']) ? str_replace('refs/heads/', '', $data['ref']) : '';

if (!in_array($branch, ['main', 'master'])) {
    http_response_code(200);
    die("Ignored branch: {$branch}");
}

// Chemin vers votre application
$appPath = getenv('HOME') . '/gest-anaizan';

// Commandes de déploiement
$commands = [
    "cd {$appPath} && git pull origin {$branch} 2>&1",
    "/usr/local/bin/php {$appPath}/artisan down --render='errors::503' 2>&1",
    "/usr/local/bin/composer install --no-dev --optimize-autoloader --working-dir={$appPath} 2>&1",
    "cd {$appPath} && npm ci --prefer-offline 2>&1",
    "cd {$appPath} && npm run build 2>&1",
    "/usr/local/bin/php {$appPath}/artisan migrate --force 2>&1",
    "/usr/local/bin/php {$appPath}/artisan config:cache 2>&1",
    "/usr/local/bin/php {$appPath}/artisan route:cache 2>&1",
    "/usr/local/bin/php {$appPath}/artisan view:cache 2>&1",
    "/usr/local/bin/php {$appPath}/artisan event:cache 2>&1",
    "chmod -R 755 {$appPath}/storage 2>&1",
    "chmod -R 755 {$appPath}/bootstrap/cache 2>&1",
    "/usr/local/bin/php {$appPath}/artisan up 2>&1",
];

$output = [];
foreach ($commands as $cmd) {
    $result = shell_exec($cmd);
    $output[] = "$ {$cmd}\n{$result}";
}

// Log the deployment
$log = date('Y-m-d H:i:s') . " | Branch: {$branch} | Commit: " . ($data['after'] ?? 'unknown') . "\n";
$log .= implode("\n---\n", $output) . "\n\n";
file_put_contents($appPath . '/storage/logs/deployments.log', $log, FILE_APPEND);

http_response_code(200);
echo json_encode(['status' => 'deployed', 'branch' => $branch]);
