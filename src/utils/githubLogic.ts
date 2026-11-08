/**
 * Pure logic utility functions for OpsPilot GitHub integration
 * Decoupled for rigorous unit testing with node:test.
 */

import { Incident } from '../types/index.ts';

export interface GitHubTokenValidationResult {
  isValid: boolean;
  type: 'classic' | 'fine_grained' | 'oauth' | 'app' | 'unknown';
  message: string;
}

export interface ParsedRepo {
  owner: string;
  repo: string;
  fullName: string;
}

export interface GitCommitCandidate {
  sha: string;
  message: string;
  author: string;
  date: string;
  htmlUrl?: string;
}

export interface CommitCorrelationResult {
  commit: GitCommitCandidate;
  score: number; // 0 - 100
  confidence: 'High' | 'Medium' | 'Low';
  reason: string;
}

/**
 * Validates the syntax of a GitHub Personal Access Token or OAuth Access Token.
 */
export function validateGitHubTokenFormat(token: string): GitHubTokenValidationResult {
  if (!token || typeof token !== 'string') {
    return {
      isValid: false,
      type: 'unknown',
      message: 'Token cannot be empty',
    };
  }

  const trimmed = token.trim();

  if (trimmed.startsWith('ghp_')) {
    if (trimmed.length < 36) {
      return {
        isValid: false,
        type: 'classic',
        message: 'GitHub Classic Personal Access Token must be at least 36 characters long',
      };
    }
    return {
      isValid: true,
      type: 'classic',
      message: 'Valid GitHub Classic Personal Access Token format (ghp_)',
    };
  }

  if (trimmed.startsWith('github_pat_')) {
    if (trimmed.length < 50) {
      return {
        isValid: false,
        type: 'fine_grained',
        message: 'GitHub Fine-Grained Personal Access Token appears truncated',
      };
    }
    return {
      isValid: true,
      type: 'fine_grained',
      message: 'Valid GitHub Fine-Grained Personal Access Token format (github_pat_)',
    };
  }

  if (trimmed.startsWith('gho_')) {
    return {
      isValid: true,
      type: 'oauth',
      message: 'Valid GitHub OAuth Access Token format (gho_)',
    };
  }

  if (trimmed.startsWith('ghs_') || trimmed.startsWith('ghu_')) {
    return {
      isValid: true,
      type: 'app',
      message: 'Valid GitHub App Installation/User Token format',
    };
  }

  // Generic 40-char hex token (legacy classic token format)
  if (/^[a-f0-9]{40}$/i.test(trimmed)) {
    return {
      isValid: true,
      type: 'classic',
      message: 'Valid legacy 40-character hexadecimal GitHub Personal Access Token format',
    };
  }

  return {
    isValid: false,
    type: 'unknown',
    message: 'Unrecognized GitHub token format. Token should start with ghp_, github_pat_, or gho_',
  };
}

/**
 * Parses repository identifier string (e.g. "octocat/Hello-World" or GitHub URL) into owner and repo.
 */
export function parseRepoFullName(input: string): ParsedRepo | null {
  if (!input || typeof input !== 'string') return null;

  let cleaned = input.trim();

  // Strip git/http prefix if provided as URL
  cleaned = cleaned.replace(/^https?:\/\/github\.com\//i, '');
  cleaned = cleaned.replace(/\.git$/i, '');
  cleaned = cleaned.replace(/^\/+|\/+$/g, '');

  const parts = cleaned.split('/');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return null;
  }

  return {
    owner: parts[0],
    repo: parts[1],
    fullName: `${parts[0]}/${parts[1]}`,
  };
}

/**
 * Correlates incident details (affected host, keywords, detection timestamp)
 * against recent repository commits to identify potential causal changes.
 */
export function correlateIncidentWithGitCommits(
  incident: Pick<Incident, 'title' | 'description' | 'createdAt'> & { deviceName?: string },
  commits: GitCommitCandidate[],
  windowHours: number = 6
): CommitCorrelationResult[] {
  if (!commits || commits.length === 0) return [];

  const incidentTime = new Date(incident.createdAt).getTime();
  const searchCorpus = `${incident.title} ${incident.description} ${incident.deviceName || ''}`.toLowerCase();

  // Common infrastructure change keywords
  const keywords = [
    'firewall', 'fw', 'port', 'rule', 'wan', 'kerberos', 'dns', 'spooler',
    'deploy', 'config', 'terraform', 'ansible', 'patch', 'policy', 'tls',
    'certificate', 'database', 'migration', 'upgrade', 'driver', 'version',
    'routing', 'vpn', 'backup', 'snapshot', 'service', 'secops', 'auth'
  ];

  const matchedKeywords = keywords.filter((k) => searchCorpus.includes(k));

  const results: CommitCorrelationResult[] = [];

  for (const commit of commits) {
    const commitTime = new Date(commit.date).getTime();
    const diffHours = (incidentTime - commitTime) / (1000 * 60 * 60);

    // Only consider commits within window prior to incident (or up to 1h after if rollback)
    if (diffHours < -1 || diffHours > windowHours) {
      continue;
    }

    const commitMsgLower = commit.message.toLowerCase();
    let score = 20; // Base score for occurring in proximity
    const reasons: string[] = [];

    // Temporal proximity scoring
    if (diffHours >= 0 && diffHours <= 1) {
      score += 35;
      reasons.push('Committed within 60 minutes prior to incident detection');
    } else if (diffHours > 1 && diffHours <= 3) {
      score += 20;
      reasons.push(`Committed ${Math.round(diffHours)} hours before incident`);
    }

    // Keyword matching
    let keywordMatches = 0;
    for (const kw of matchedKeywords) {
      if (commitMsgLower.includes(kw)) {
        keywordMatches++;
        score += 15;
        reasons.push(`Commit message matched keyword '${kw}'`);
      }
    }

    // Require at least one technical keyword match or target device match
    const hasDeviceMatch = Boolean(incident.deviceName && commitMsgLower.includes(incident.deviceName.toLowerCase()));
    if (keywordMatches === 0 && !hasDeviceMatch) {
      continue;
    }

    if (hasDeviceMatch) {
      score += 30;
      reasons.push(`Commit specifically references target device ${incident.deviceName}`);
    }

    // Cap at 98%
    const finalScore = Math.min(98, score);

    if (finalScore >= 40) {
      results.push({
        commit,
        score: finalScore,
        confidence: finalScore >= 75 ? 'High' : finalScore >= 55 ? 'Medium' : 'Low',
        reason: reasons.join('; '),
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Builds a structured GitHub Issue payload from an OpsPilot Incident.
 */
export function formatGitHubIssueFromIncident(
  incident: Incident,
  opsPilotUrl: string
): { title: string; body: string; labels: string[] } {
  const deepLink = `${opsPilotUrl}/incidents?id=${incident.id}`;
  
  const title = `[OpsPilot ${incident.severity}] ${incident.incidentNumber}: ${incident.title}`;

  const body = `## 🚨 OpsPilot Incident Ticket: ${incident.incidentNumber}

| Attribute | Details |
| :--- | :--- |
| **Severity** | \`${incident.severity}\` |
| **Status** | \`${incident.status}\` |
| **Customer** | ${incident.customerName || 'Enterprise Tenant'} |
| **Affected Site** | ${incident.siteName || 'All Sites'} |
| **Assigned Specialist** | \`@${incident.assignedAgentSlug}\` (${incident.assignedEngineer}) |
| **Detected At** | ${new Date(incident.createdAt).toUTCString()} |
| **Incident Deep Link** | [Open in OpsPilot Platform](${deepLink}) |

---

### 📋 Incident Overview
${incident.description}

### 🧠 Autonomous AI Investigation Findings
${incident.rootCauseFindings || 'Investigation telemetry in progress. Anomaly analysis correlates source telemetry.'}

### 🛠️ Recommended Remediation & Playbook
${incident.recommendedRemediation || 'Follow Standard Operating Procedure for platform stabilization.'}

---
*Created automatically by OpsPilot IT Operations Platform with human-in-the-loop authorization.*
`;

  const labels = [
    'opspilot',
    `severity:${incident.severity.toLowerCase()}`,
    `status:${incident.status.toLowerCase().replace(/\s+/g, '-')}`,
    `agent:${incident.assignedAgentSlug}`,
  ];

  return { title, body, labels };
}

/**
 * Formats a GitHub Actions workflow dispatch request payload.
 */
export function formatWorkflowDispatchPayload(
  ref: string = 'main',
  inputs: Record<string, unknown> = {}
): { ref: string; inputs: Record<string, string> } {
  const stringInputs: Record<string, string> = {};
  for (const [key, value] of Object.entries(inputs)) {
    if (value !== undefined && value !== null) {
      stringInputs[key] = String(value);
    }
  }

  return {
    ref: ref || 'main',
    inputs: stringInputs,
  };
}
