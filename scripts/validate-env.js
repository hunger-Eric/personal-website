#!/usr/bin/env node
// scripts/validate-env.js
// Validates environment variables before build

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  dim: "\x1b[2m",
};

function log(message, color = "") {
  console.log(`${color}${message}${colors.reset}`);
}

// Define environment variable requirements
const ENV_VARS = [
  {
    name: "GITHUB_TOKEN",
    required: false,
    description: "GitHub token used when the article workbench publishes an approved article",
    usedBy: ["Article Workbench"],
  },
  {
    name: "NEXT_PUBLIC_BASE_URL",
    required: false,
    description: "Site base URL for SEO and OG images",
    usedBy: ["SEO", "OG Images", "Sitemap"],
    default: "http://localhost:3000",
  },
  {
    name: "RESEND_API_KEY",
    required: false,
    description: "Resend API key for email delivery",
    usedBy: ["Contact Form"],
  },
  {
    name: "CONTACT_TO_EMAIL",
    required: false,
    description: "Email address to receive contact form submissions",
    usedBy: ["Contact Form"],
  },
  {
    name: "DISCORD_CONTACT_WEBHOOK_URL",
    required: false,
    description: "Discord webhook for contact notifications",
    usedBy: ["Contact Form"],
  },
  {
    name: "TELEGRAM_BOT_TOKEN",
    required: false,
    description: "Telegram bot token for contact notifications",
    usedBy: ["Contact Form"],
  },
  {
    name: "TELEGRAM_CHAT_ID",
    required: false,
    description: "Telegram chat ID for contact notifications",
    usedBy: ["Contact Form"],
  },
  {
    name: "NEXT_PUBLIC_CF_ANALYTICS_TOKEN",
    required: false,
    description: "Cloudflare Web Analytics site token (privacy-friendly, no cookies)",
    usedBy: ["Analytics"],
  },
  {
    name: "CRAWLER_DASHBOARD_PASSWORD",
    required: false,
    description: "Private crawler dashboard Basic Auth password",
    usedBy: ["Crawler Analytics Admin"],
  },
  {
    name: "CRAWLER_OBSERVER_READ_SECRET",
    required: false,
    description: "Crawler Observer signed read secret",
    usedBy: ["Crawler Analytics Admin"],
  },
];

function validateEnv() {
  log("\n📋 Validating environment variables...\n");

  let hasErrors = false;
  let hasWarnings = false;

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name];
    const hasValue = value !== undefined && value !== "";

    if (hasValue) {
      log(`✓ ${envVar.name} is set`, colors.green);
    } else if (envVar.required) {
      log(`✗ ${envVar.name} is required (${envVar.requiredIf || ""})`, colors.red);
      log(`  ${envVar.description}`, colors.dim);
      hasErrors = true;
    } else {
      log(`⚠ ${envVar.name} not set`, colors.yellow);
      log(`  ${envVar.description}`, colors.dim);
      if (envVar.usedBy) {
        log(`  Used by: ${envVar.usedBy.join(", ")}`, colors.dim);
      }
      hasWarnings = true;
    }
  }

  // Summary
  log("\n" + "─".repeat(50));

  if (hasErrors) {
    log("\n❌ Validation failed. Please set the required environment variables.", colors.red);
    process.exit(1);
  } else if (hasWarnings) {
    log("\n⚠️  Validation passed with warnings. Some features may be limited.", colors.yellow);
    process.exit(0);
  } else {
    log("\n✅ All environment variables are set correctly!", colors.green);
    process.exit(0);
  }
}

validateEnv();
