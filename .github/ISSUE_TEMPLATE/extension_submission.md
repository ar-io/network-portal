---
name: Extension Submission
about: Submit a new extension to the AR.IO Gateway Extensions marketplace
title: '[Extension Submission] '
labels: extension-submission
assignees: ''
---

## Extension JSON

**Please fill out the JSON below with your extension information. This will be added to our extensions registry.**

```json
{
  "id": "your-extension-id",
  "name": "Your Extension Name",
  "description": "One-line description (max 100 characters)",
  "longDescription": "2-3 sentences explaining what your extension does, its key features, and benefits to gateway operators.",
  "author": "Your Name or Organization",
  "authorUrl": "https://your-website.com",
  "url": "https://github.com/your-username/your-extension",
  "category": "storage",
  "tags": ["community", "stable"],
  "version": "1.0.0",
  "lastUpdated": "2024-01-15",
  "minGatewayVersion": "2.0.0",
  "documentation": "https://github.com/your-username/your-extension/blob/main/README.md",
  "image": "your-logo-tx-id-or-https-url",
  "screenshots": [
    "screenshot1-tx-id-or-https-url",
    "screenshot2-tx-id-or-https-url"
  ]
}
```

### Field Guide:

- **id**: Unique identifier (lowercase, hyphens only, e.g., "my-cool-extension")
- **name**: Display name for your extension
- **description**: Short description (max 100 chars) shown in the extension list
- **longDescription**: Detailed description shown on the extension detail page
- **author**: Your name or organization name
- **authorUrl**: (optional) Link to your website or profile
- **url**: GitHub repository or website URL
- **category**: One of: `storage`, `routing`, `monitoring`, `security`, `performance`, `indexing`, `caching`, `moderation`, `analytics`, `developer-tools`, `compute`
- **tags**: Array of tags. Common tags: `community`, `beta`, `stable` (other tags will be assigned by AR.IO team: `official`, `featured`, `grant-funded`)
- **version**: Current semantic version (e.g., "1.0.0")
- **lastUpdated**: Date in YYYY-MM-DD format
- **minGatewayVersion**: (optional) Minimum AR.IO gateway version required
- **documentation**: (optional) Link to detailed documentation
- **image**: (optional) Logo - Arweave TX ID or HTTPS URL (256x256px PNG recommended)
- **screenshots**: (optional) Array of screenshots - Arweave TX IDs or HTTPS URLs (1280x800px recommended, max 3)

## Installation & Testing

**Installation Instructions:**

<!-- Brief overview of how to install your extension -->

**Testing Steps:**

<!-- How can reviewers test your extension? -->

1.
2.
3.

## Checklist

Please confirm:

- [ ] Extension is open source
- [ ] Code repository is publicly accessible
- [ ] Extension has been tested with AR.IO gateway
- [ ] Documentation includes installation instructions
- [ ] Extension does not contain malicious code
- [ ] Extension respects user privacy and security
- [ ] JSON data is complete and valid

## Additional Notes

<!-- Any other information you'd like to share about your extension -->

---

_By submitting this extension, you agree that the extension code can be reviewed and the JSON data above will be added to the AR.IO Gateway Extensions marketplace._
