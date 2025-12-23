<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'afyalink' => [
        'base_url' => env('AFYALINK_BASE_URL', 'https://uat.dha.go.ke'),

        // Token auth
        'api_key' => env('AFYALINK_API_KEY'),
        'api_secret' => env('AFYALINK_API_SECRET'),
        'agent' => env('AFYALINK_AGENT'),

        // Basic auth (optional fallback)
        'username' => env('AFYALINK_USERNAME'),
        'password' => env('AFYALINK_PASSWORD'),

        'facility_code' => env('AFYALINK_FACILITY_CODE'),
        'timeout' => 30,
        'mock' => false,
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
