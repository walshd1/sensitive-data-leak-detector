const core = require('@actions/core');
const fs = require('fs');
const PROMPT = `You are a Sensitive Data Leak Detector. Your task is to analyze code snippets and identify potential leaks of sensitive information. You will be provided with a {code_snippet} and a {contextual_information} (e.g., file name, commit message, programming language). Your response should be a JSON object with the following keys: 'is_sensitive', 'sensitivity_level', 'description', 'suggested_remediation'.

'is_sensitive': Boolean value indicating whether sensitive data is likely present (true) or not (false).

'sensitivity_level': A string indicating the severity of the potential leak. Possible values: "high", "medium", "low", "none".

'description': A concise explanation of why the code snippet is flagged as potentially sensitive. Include the type of sensitive data detected (e.g., API key, password, private key).

'suggested_remediation': A brief suggestion on how to address the potential leak (e.g., revoke the key, rotate the password, remove the sensitive data from the code and use environment variables).

Consider the {known_sensitive_patterns} when analyzing the code.

Example:

{
"is_sensitive": true,
"sensitivity_level": "high",
"description": "Detected a potential AWS API key. The pattern 'AKIA[A-Z0-9]{16}' is a common format for AWS access keys.",
"suggested_remediation": "Revoke the compromised AWS API key and rotate it immediately. Store credentials securely using environment variables or a secrets management service."
}

Analyze the following:

{code_snippet}

{contextual_information}`;
async function run() {
  try {
    const key = core.getInput('gemini_api_key');
    const token = core.getInput('service_token');
    const ctx = { repoName: process.env.GITHUB_REPOSITORY || '', event: process.env.GITHUB_EVENT_NAME || '' };
    try { Object.assign(ctx, JSON.parse(fs.readFileSync('package.json', 'utf8'))); } catch {}
    let prompt = PROMPT;
    for (const [k, v] of Object.entries(ctx)) prompt = prompt.replace(new RegExp('{' + k + '}', 'g'), String(v || ''));
    let result;
    if (key) {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 2000 } })
      });
      result = (await r.json()).candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (token) {
      const r = await fetch('https://action-factory.walshd1.workers.dev/generate/sensitive-data-leak-detector', {
        method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(ctx)
      });
      result = (await r.json()).content || '';
    } else throw new Error('Need gemini_api_key or service_token');
    console.log(result);
    core.setOutput('result', result);
  } catch (e) { core.setFailed(e.message); }
}
run();
