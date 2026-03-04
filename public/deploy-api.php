<?php
/**
 * NOCPC Deployment API
 * 
 * Handles deployment requests from the web dashboard
 * Place in same directory as deploy.html
 * Access via: https://yourdomain.com/deploy.html
 */

// Configuration
$REPO_PATH = dirname(__FILE__); // Current directory (should be your repo root)
$LOG_FILE = $REPO_PATH . '/deploy.log';
$GITHUB_BRANCH = 'main';

// Security: Optional token (set this to something secret)
// $REQUIRED_TOKEN = 'your-secret-token-here';

// Helper functions
function log_action($message) {
    global $LOG_FILE;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($LOG_FILE, "[$timestamp] $message\n", FILE_APPEND);
}

function json_response($success, $message = '', $output = '') {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'output' => $output,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit;
}

function safe_shell_exec($command) {
    // Only allow specific commands for security
    $allowed_commands = [
        'git pull',
        'git status',
        'git log',
        'git fetch',
        'pwd',
        'ls',
        'whoami'
    ];
    
    // Check if command starts with allowed command
    $is_allowed = false;
    foreach ($allowed_commands as $allowed) {
        if (strpos($command, $allowed) === 0) {
            $is_allowed = true;
            break;
        }
    }
    
    if (!$is_allowed) {
        return false;
    }
    
    $output = shell_exec($command . ' 2>&1');
    return $output;
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'Only POST requests allowed');
}

// Get request data
$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';

log_action("Action requested: $action");

// Handle different actions
switch ($action) {
    case 'deploy':
        // Deploy (git pull)
        log_action('Starting deployment...');
        chdir($REPO_PATH);
        
        $output = safe_shell_exec("git pull origin $GITHUB_BRANCH");
        
        if ($output === false) {
            log_action('Deployment failed: Git command not allowed');
            json_response(false, 'Deployment failed', 'Git command not allowed');
        }
        
        log_action('Git pull output: ' . $output);
        
        if (strpos($output, 'fatal') === false && strpos($output, 'error') === false) {
            log_action('Deployment successful');
            json_response(true, 'Deployment successful', $output);
        } else {
            log_action('Deployment error: ' . $output);
            json_response(false, 'Deployment error', $output);
        }
        break;

    case 'execute':
        // Execute custom command
        $command = $data['command'] ?? '';
        
        if (empty($command)) {
            json_response(false, 'No command provided');
        }
        
        log_action("Executing command: $command");
        chdir($REPO_PATH);
        
        $output = safe_shell_exec($command);
        
        if ($output === false) {
            log_action('Command not allowed: ' . $command);
            json_response(false, 'Command not allowed', $command . ' is not allowed');
        }
        
        log_action('Command output: ' . $output);
        json_response(true, 'Command executed', $output);
        break;

    case 'status':
        // Get system status
        log_action('Status check requested');
        chdir($REPO_PATH);
        
        $info = [];
        $info[] = "=== System Information ===\n";
        $info[] = "Current Directory: " . getcwd();
        $info[] = "PHP Version: " . phpversion();
        $info[] = "Current User: " . get_current_user();
        $info[] = "";
        
        $info[] = "=== Git Status ===";
        $git_status = shell_exec('git status 2>&1');
        $info[] = $git_status ?: "Git not available or not in git repo";
        
        $info[] = "";
        $info[] = "=== Recent Commits ===";
        $git_log = shell_exec('git log --oneline -5 2>&1');
        $info[] = $git_log ?: "No commits found";
        
        $info[] = "";
        $info[] = "=== File Listing ===";
        $files = shell_exec('ls -la 2>&1');
        $info[] = $files ?: "Could not list files";
        
        $output = implode("\n", $info);
        log_action('Status check complete');
        json_response(true, 'Status retrieved', $output);
        break;

    default:
        log_action('Unknown action: ' . $action);
        json_response(false, 'Unknown action: ' . $action);
}

?>
