#!/usr/bin/env node
// scripts/validate-env.js
// Validates environment variables before build

const fs = require("fs");
const path = require("path");

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

// Load site config to check which features are enabled
const CONFIG_PATH = path.join(process.cwd(), "config", "site.json");
let siteConfig = {};
try {
  if (fs.existsSync(CONFIG_PATH)) {
    siteConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  }
} catch {
  // Config not found, use defaults
}

const sections = siteConfig.sections || {};

// Define environment variable requirements
const ENV_VARS = [
  {
    name: "GITHUB_TOKEN",
    required: false,
    description: "GitHub Personal Access Token for contributions graph",
    usedBy: ["Contribution Graph", "GitHub Stats"],
  },
  {
    name: "GITHUB_USERNAME",
    required: false,
    description: "Default GitHub username",
    usedBy: ["Contribution Graph", "Projects"],
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
    required: sections.contact === true,
    description: "Resend API key for email delivery",
    usedBy: ["Contact Form"],
    requiredIf: "contact section is enabled",
  },
  {
    name: "CONTACT_TO_EMAIL",
    required: sections.contact === true,
    description: "Email address to receive contact form submissions",
    usedBy: ["Contact Form"],
    requiredIf: "contact section is enabled",
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
    name: "YOUTUBE_API_KEY",
    required: sections.youtube === true,
    description: "YouTube Data API v3 key",
    usedBy: ["YouTube Videos"],
    requiredIf: "youtube section is enabled",
  },
  {
    name: "NEXT_PUBLIC_CF_ANALYTICS_TOKEN",
    required: false,
    description: "Cloudflare Web Analytics site token (privacy-friendly, no cookies)",
    usedBy: ["Analytics"],
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
