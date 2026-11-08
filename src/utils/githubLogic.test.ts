import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateGitHubTokenFormat,
  parseRepoFullName,
  correlateIncidentWithGitCommits,
  formatGitHubIssueFromIncident,
  formatWorkflowDispatchPayload,
} from './githubLogic.ts';
import { Incident } from '../types/index.ts';

test('validateGitHubTokenFormat identifies classic, fine-grained, and oauth tokens', () => {
  // Classic token
  const classic = validateGitHubTokenFormat('ghp_123456789012345678901234567890123456');
  assert.equal(classic.isValid, true);
  assert.equal(classic.type, 'classic');

  // Fine grained token
  const fineGrained = validateGitHubTokenFormat('github_pat_11AABCDEFGHIJK_1234567890abcdefghijklmnopqrstuvwxyz1234567890');
  assert.equal(fineGrained.isValid, true);
  assert.equal(fineGrained.type, 'fine_grained');

  // OAuth token
  const oauth = validateGitHubTokenFormat('gho_abcdefghijklmnopqrstuvwxyz123456');
  assert.equal(oauth.isValid, true);
  assert.equal(oauth.type, 'oauth');

  // Invalid / empty tokens
  const empty = validateGitHubTokenFormat('');
  assert.equal(empty.isValid, false);

  const invalid = validateGitHubTokenFormat('invalid_token_prefix_test');
  assert.equal(invalid.isValid, false);
});

test('parseRepoFullName handles raw string and full GitHub URLs', () => {
  const fromString = parseRepoFullName('opspilot-org/infrastructure-live');
  assert.deepEqual(fromString, {
    owner: 'opspilot-org',
    repo: 'infrastructure-live',
    fullName: 'opspilot-org/infrastructure-live',
  });

  const fromUrl = parseRepoFullName('https://github.com/my-company/terraform-aws-modules.git');
  assert.deepEqual(fromUrl, {
    owner: 'my-company',
    repo: 'terraform-aws-modules',
    fullName: 'my-company/terraform-aws-modules',
  });

  const invalid = parseRepoFullName('invalid-single-token');
  assert.equal(invalid, null);
});

test('correlateIncidentWithGitCommits scores temporally proximate and keyword-matching commits', () => {
  const incidentNow = new Date('2026-11-08T10:00:00Z').toISOString();

  const incident = {
    title: 'Firewall Policy Drop on FortiGate WAN Port 2',
    description: 'WAN Uplink packet drop increased to 8.4% following dynamic security rule sync.',
    deviceName: 'FW-APEX-EDGE-01',
    createdAt: incidentNow,
  };

  const commits = [
    {
      sha: 'a1b2c3d',
      message: 'feat(network): update FortiGate WAN port 2 egress policy and routing table',
      author: 'devops-lead',
      date: new Date('2026-11-08T09:30:00Z').toISOString(), // 30 mins before
    },
    {
      sha: 'e5f6g7h',
      message: 'docs: update README with customer site onboarding checklist',
      author: 'tech-writer',
      date: new Date('2026-11-08T09:15:00Z').toISOString(), // 45 mins before, no keywords
    },
    {
      sha: 'i8j9k0l',
      message: 'fix(secops): patch kerberos ticket validation filter',
      author: 'sec-engineer',
      date: new Date('2026-11-07T12:00:00Z').toISOString(), // 22 hours ago (outside window)
    },
  ];

  const results = correlateIncidentWithGitCommits(incident, commits, 6);
  assert.equal(results.length, 1); // Only the proximate firewall commit matches
  assert.equal(results[0].commit.sha, 'a1b2c3d');
  assert.equal(results[0].confidence, 'High');
  assert.equal(results[0].score >= 70, true);
});

test('formatGitHubIssueFromIncident builds complete markdown and labels', () => {
  const incident: Incident = {
    id: 42,
    incidentNumber: 'INC-2026-0841',
    customerId: 1,
    customerName: 'Apex Financial Partners',
    siteName: 'Apex HQ - Wall St',
    severity: 'Critical',
    status: 'Investigating',
    title: 'Kerberos Token Anomalies & Privileged Group Escalation',
    description: 'Powershell attempt to access LSASS process memory.',
    assignedAgentSlug: 'security_ops',
    assignedEngineer: 'Sarah Vance',
    responsibleTeam: 'Security Operations',
    rootCauseFindings: 'Cached credential harvesting detected.',
    recommendedRemediation: 'Revoke TGS ticket and isolate host.',
    acknowledged: false,
    remindersSentCount: 0,
    escalationLevel: 'None',
    createdAt: new Date().toISOString(),
  };

  const issue = formatGitHubIssueFromIncident(incident, 'https://opspilot.internal');
  assert.equal(issue.title.includes('INC-2026-0841'), true);
  assert.equal(issue.title.includes('Critical'), true);
  assert.equal(issue.body.includes('Apex Financial Partners'), true);
  assert.equal(issue.body.includes('https://opspilot.internal/incidents?id=42'), true);
  assert.equal(issue.labels.includes('opspilot'), true);
  assert.equal(issue.labels.includes('severity:critical'), true);
});

test('formatWorkflowDispatchPayload normalizes ref and string inputs', () => {
  const payload = formatWorkflowDispatchPayload('release-v2.1', {
    targetHost: 'APEX-DC01',
    forceRestart: true,
    timeoutSeconds: 300,
  });

  assert.equal(payload.ref, 'release-v2.1');
  assert.equal(payload.inputs.targetHost, 'APEX-DC01');
  assert.equal(payload.inputs.forceRestart, 'true');
  assert.equal(payload.inputs.timeoutSeconds, '300');
});
