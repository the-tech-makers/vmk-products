<?php
/**
 * process-lead.php
 * Handles the VMK Products lead form submission (called via AJAX/fetch).
 * Sends a notification email via SMTP using PHPMailer.
 *
 * ------------------------------------------------------------------
 * SETUP REQUIRED BEFORE THIS WILL WORK:
 * 1. Install PHPMailer (the most reliable SMTP mailer for PHP):
 *      composer require phpmailer/phpmailer
 *    This creates /vendor/autoload.php required below.
 *    (No composer available? Download PHPMailer manually from
 *     https://github.com/PHPMailer/PHPMailer and require its src/*.php
 *     files instead of vendor/autoload.php.)
 *
 * 2. Fill in the SMTP_* and *_EMAIL constants below with your real
 *    values. Everything marked CHANGE-ME must be replaced.
 * ------------------------------------------------------------------
 */

require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json; charset=utf-8');

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// ------------------------------------------------------------------
// CONFIG — fill these in
// ------------------------------------------------------------------
const SMTP_HOST       = 'smtp.yourdomain.com';   // CHANGE-ME e.g. smtp.hostinger.com / smtp.gmail.com
const SMTP_USERNAME   = 'noreply@vmkproducts.in'; // CHANGE-ME — the mailbox you send FROM
const SMTP_PASSWORD   = 'CHANGE-ME';              // CHANGE-ME — SMTP password / app password
const SMTP_PORT       = 587;                      // 587 = STARTTLS, 465 = SMTPS
const SMTP_SECURE     = PHPMailer::ENCRYPTION_STARTTLS; // or ENCRYPTION_SMTPS for port 465

const FROM_EMAIL      = 'noreply@vmkproducts.in'; // CHANGE-ME — usually same as SMTP_USERNAME
const FROM_NAME        = 'VMK Products Website';

const ADMIN_EMAIL     = 'CHANGE-ME@vmkproducts.in'; // CHANGE-ME — where the lead notification goes
const CC_EMAIL        = 'CHANGE-ME@example.com';    // CHANGE-ME — your personal CC address

// ------------------------------------------------------------------
// 1. Honeypot spam check (hidden field named "website" in the form —
//    real visitors never fill it, bots usually do)
// ------------------------------------------------------------------
if (!empty($_POST['website'])) {
    // Silently pretend success so bots don't learn anything
    echo json_encode(['success' => true, 'message' => 'Thank you.']);
    exit;
}

// ------------------------------------------------------------------
// 2. Collect + validate input
// ------------------------------------------------------------------
function clean($value) {
    return htmlspecialchars(trim($value ?? ''), ENT_QUOTES, 'UTF-8');
}

$name     = clean($_POST['name'] ?? '');
$phone    = clean($_POST['phone'] ?? '');
$email    = clean($_POST['email'] ?? '');
$city     = clean($_POST['city'] ?? '');
$interest = clean($_POST['interest'] ?? '');
$message  = clean($_POST['message'] ?? '');

// Preserve Google Ads click identifiers and campaign tags with the lead.
$adAttribution = [];
foreach (['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as $key) {
    $value = clean($_POST[$key] ?? '');
    if ($value !== '') {
        $adAttribution[$key] = $value;
    }
}
$attributionHtml = '';
$attributionText = '';
foreach ($adAttribution as $key => $value) {
    $attributionHtml .= "<tr><td style='padding:6px 12px;font-weight:bold;'>" . htmlspecialchars($key, ENT_QUOTES, 'UTF-8') . "</td><td style='padding:6px 12px;'>" . $value . "</td></tr>";
    $attributionText .= strtoupper($key) . ": {$value}\\n";
}

$errors = [];

if ($name === '') {
    $errors[] = 'Name is required.';
}
if ($phone === '') {
    $errors[] = 'Phone number is required.';
} elseif (!preg_match('/^[+0-9\s\-()]{7,20}$/', $phone)) {
    $errors[] = 'Please enter a valid phone number.';
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please enter a valid email address.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// ------------------------------------------------------------------
// 3. Build email content
// ------------------------------------------------------------------
$submittedAt = date('d M Y, h:i A');

$htmlBody = "
    <h2 style='color:#0f2c49;'>New Lead — VMK Products Website</h2>
    <table style='border-collapse:collapse;font-family:sans-serif;font-size:14px;'>
        <tr><td style='padding:6px 12px;font-weight:bold;'>Name</td><td style='padding:6px 12px;'>{$name}</td></tr>
        <tr><td style='padding:6px 12px;font-weight:bold;'>Phone</td><td style='padding:6px 12px;'>{$phone}</td></tr>
        <tr><td style='padding:6px 12px;font-weight:bold;'>Email</td><td style='padding:6px 12px;'>" . ($email !== '' ? $email : '—') . "</td></tr>
        <tr><td style='padding:6px 12px;font-weight:bold;'>City / Location</td><td style='padding:6px 12px;'>" . ($city !== '' ? $city : '—') . "</td></tr>
        <tr><td style='padding:6px 12px;font-weight:bold;'>Interested In</td><td style='padding:6px 12px;'>" . ($interest !== '' ? $interest : '—') . "</td></tr>
        <tr><td style='padding:6px 12px;font-weight:bold;vertical-align:top;'>Message</td><td style='padding:6px 12px;'>" . (($message !== '' ? nl2br($message) : '—')) . "</td></tr>
        <tr><td style='padding:6px 12px;font-weight:bold;'>Submitted</td><td style='padding:6px 12px;'>{$submittedAt}</td></tr>
        {$attributionHtml}
    </table>
";

$plainBody = "New Lead — VMK Products Website\n\n"
    . "Name: {$name}\n"
    . "Phone: {$phone}\n"
    . "Email: " . ($email !== '' ? $email : '-') . "\n"
    . "City/Location: " . ($city !== '' ? $city : '-') . "\n"
    . "Interested In: " . ($interest !== '' ? $interest : '-') . "\n"
    . "Message: " . ($message !== '' ? $message : '-') . "\n"
    . "Submitted: {$submittedAt}\n"
    . "\nAd attribution:\n{$attributionText}";

// ------------------------------------------------------------------
// 4. Send via SMTP (PHPMailer)
// ------------------------------------------------------------------
$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USERNAME;
    $mail->Password   = SMTP_PASSWORD;
    $mail->SMTPSecure = SMTP_SECURE;
    $mail->Port       = SMTP_PORT;

    // Sender / recipients
    $mail->setFrom(FROM_EMAIL, FROM_NAME);
    $mail->addAddress(ADMIN_EMAIL);
    $mail->addCC(CC_EMAIL);

    if ($email !== '') {
        // Lets admin hit "Reply" and go straight to the customer
        $mail->addReplyTo($email, $name);
    }

    // Content
    $mail->isHTML(true);
    $mail->Subject = "New Enquiry from {$name} — VMK Products";
    $mail->Body    = $htmlBody;
    $mail->AltBody = $plainBody;

    $mail->send();

    echo json_encode([
        'success' => true,
        'message' => 'Thank you! Our team will contact you shortly.'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Sorry, something went wrong and your enquiry could not be sent. Please call or WhatsApp us instead.'
        // For debugging on your own server (remove in production), you could log:
        // error_log('Mailer Error: ' . $mail->ErrorInfo);
    ]);
}