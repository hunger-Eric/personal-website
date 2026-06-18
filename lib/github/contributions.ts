// lib/github/contributions.ts
const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";

export type GitHubContributionDay = {
  date: string; // "2025-03-15" (UTC date)
  count: number; // total contributions that day
};

type GitHubGraphQLError = {
  message?: string;
};

type GitHubContributionResponse = {
  errors?: GitHubGraphQLError[];
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          weeks?: Array<{
            contributionDays?: Array<{
              date?: string;
              contributionCount?: number;
            }>;
          }>;
        };
      };
    };
  };
};

const CONTRIBUTIONS_QUERY = `
  query Contributions($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

/**
 * Retry configuration for API calls
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
};

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay with jitter
 */
function getRetryDelay(attempt: number): number {
  const exponentialDelay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay; // 0-30% jitter
  return Math.min(exponentialDelay + jitter, RETRY_CONFIG.maxDelayMs);
}

/**
 * Check if an error is retryable (network issues, rate limits, server errors)
 */
function isRetryableError(status: number): boolean {
  // Retry on:
  // - 429: Rate limited
  // - 500, 502, 503, 504: Server errors
  return status === 429 || (status >= 500 && status <= 504);
}

/**
 * Fetch GitHub contributions for a specific year with retry logic.
 *
 * @param username - GitHub username
 * @param year - Year to fetch contributions for
 * @returns Array of contribution days with date and count
 * @throws Error if all retries fail
 */
export async function fetchGitHubContributionsForYear(
  username: string,
  year: number
): Promise<GitHubContributionDay[]> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("Missing GITHUB_TOKEN env var");
  }

  // Use UTC dates to match GitHub's date format
  const from = new Date(Date.UTC(year, 0, 1));
  const to = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const res = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "User-Agent": "DevfolioX-Portfolio",
        },
        body: JSON.stringify({
          query: CONTRIBUTIONS_QUERY,
          variables: {
            login: username,
            from: from.toISOString(),
            to: to.toISOString(),
          },
        }),
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const text = await res.text().catch(() => "Unknown error");

        // Check if we should retry
        if (isRetryableError(res.status) && attempt < RETRY_CONFIG.maxRetries) {
          const delay = getRetryDelay(attempt);
          console.warn(
            `GitHub API error (${res.status}), retrying in ${Math.round(delay)}ms... (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries})`
          );
          await sleep(delay);
          continue;
        }

        throw new Error(`GitHub GraphQL error: ${res.status} - ${text}`);
      }

      const json = (await res.json()) as GitHubContributionResponse;

      // Check for GraphQL errors
      if (json.errors && json.errors.length > 0) {
        const errorMessage = json.errors
          .map((error) => error.message || "Unknown GraphQL error")
          .join(", ");
        throw new Error(`GitHub GraphQL error: ${errorMessage}`);
      }

      const weeks =
        json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks ??
        [];

      const days: GitHubContributionDay[] = [];
      for (const week of weeks) {
        for (const d of week.contributionDays ?? []) {
          if (!d?.date) continue;
          days.push({
            date: d.date,
            count: d.contributionCount ?? 0,
          });
        }
      }

      return days;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Handle abort errors (timeout)
      if (lastError.name === "AbortError") {
        if (attempt < RETRY_CONFIG.maxRetries) {
          const delay = getRetryDelay(attempt);
          console.warn(
            `GitHub API timeout, retrying in ${Math.round(delay)}ms... (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries})`
          );
          await sleep(delay);
          continue;
        }
        throw new Error("GitHub API request timed out after multiple attempts");
      }

      // For other errors, retry if attempts remain, otherwise fall through to line 172
      if (attempt < RETRY_CONFIG.maxRetries) {
        const delay = getRetryDelay(attempt);
        console.warn(
          `GitHub API error: ${lastError.message}, retrying in ${Math.round(delay)}ms... (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries})`
        );
        await sleep(delay);
        continue;
      }
    }
  }

  // This should not be reached, but just in case
  throw lastError || new Error("Failed to fetch GitHub contributions");
}
