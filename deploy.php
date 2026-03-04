<?php
/**
 * IONOS Auto-Deploy Trigger
 * 
 * Place this file in your IONOS web root (/htdocs/)
 * 
 * Usage:
 * 1. Manual: Visit https://yoursite.com/deploy.php
 * 2. GitHub Webhook: Set webhook URL to https://yoursite.com/deploy.php
 * 
 * Security: Add a simple token check below
 */

// Configuration
$REPO_PATH = '/home/u12345678/htdocs/nola-park-inventory';
$LOG_FILE = $REPO_PATH . '/deploy.log';
$GITHUB_BRANCH = 'main';

// Optional: Simple security token
// Set this to a random string and use it in GitHub webhook
$DEPLOY_TOKEN = 'your-secret-token-here';

// Log helper function
function log_deploy($message) {
    global $LOG_FILE;
    $timestamp = date('Y-m-d H:i:s');
    $log_message = "[$timestamp] $message\n";
    file_put_contents($LOG_FILE, $log_message, FILE_APPEND);
    echo $log_message;
}

// Check if request is POST (from GitHub webhook) or GET (manual)
$is_webhook = ($_SERVER['REQUEST_METHOD'] === 'POST');
$is_manual = ($_SERVER['REQUEST_METHOD'] === 'GET');

// For webhook, verify token (optional)
if ($is_webhook) {
    $json = json_decode(file_get_contents('php://input'), true);
    
    // Optional: Verify GitHub signature
    // $signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';
    // if (!verify_github_signature($signature, file_get_contents('php://input'))) {
    //     http_response_code(401);
    //     die('Unauthorized');
    // }
    
    log_deploy('Webhook received from GitHub');
}

// Manual deploy with token check
if ($is_manual) {
    $token = $_GET['token'] ?? '';
    if ($token !== $DEPLOY_TOKEN && $DEPLOY_TOKEN !== 'your-secret-token-here') {
        http_response_code(401);
        log_deploy('Unauthorized deploy attempt');
        die('Invalid token');
    }
    log_deploy('Manual deploy triggered');
}

// Proceed with deployment
log_deploy('========== DEPLOYMENT START ==========');

// Change to repo directory
if (!is_dir($REPO_PATH)) {
    log_deploy('ERROR: Repository path not found: ' . $REPO_PATH);
    http_response_code(500);
    die('Repository not found');
}

chdir($REPO_PATH);
log_deploy('Working directory: ' . getcwd());

// Execute git pull
log_deploy('Pulling latest code from GitHub...');

$output = [];
$return_code = 0;

exec('git pull origin ' . escapeshellarg($GITHUB_BRANCH) . ' 2>&1', $output, $return_code);

foreach ($output as $line) {
    log_deploy('GIT: ' . $line);
}

if ($return_code === 0) {
    log_deploy('✓ Successfully pulled latest code');
    
    // Get current commit info
    $commit = trim(shell_exec('git rev-parse --short HEAD'));
    $message = trim(shell_exec('git log -1 --pretty=%B'));
    
    log_deploy('Current commit: ' . $commit);
    log_deploy('Commit message: ' . $message);
    
    // Set permissions
    log_deploy('Setting file permissions...');
    chmod($REPO_PATH, 0755);
    
    log_deploy('========== DEPLOYMENT SUCCESS ==========');
    log_deploy('App is now live!');
    
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Deployment successful',
        'commit' => $commit,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} else {
    log_deploy('✗ ERROR: Git pull failed with code ' . $return_code);
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Deployment failed',
        'output' => $output
    ]);
}

// Optional: Verify GitHub webhook signature
function verify_github_signature($signature, $payload) {
    $secret = 'your-webhook-secret';
    $hash = 'sha256=' . hash_hmac('sha256', $payload, $secret);
    return hash_equals($hash, $signature);
}

?>
