# JWT Secret Rotation Procedure
## Zero-Downtime Secret Rotation Guide

### Overview
This document describes how to rotate JWT secrets without causing service disruption or invalidating existing user sessions.

### When to Rotate
- Every 90 days (recommended)
- After a security incident
- When a team member with access leaves
- If secret may have been compromised

### Rotation Steps

#### Step 1: Generate New Secret
```bash
# Generate a new 64+ character secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Step 2: Set Previous Secret
```bash
# In your environment variables or secrets manager
# Set JWT_SECRET_PREVIOUS to the current JWT_SECRET value
JWT_SECRET_PREVIOUS=<current_jwt_secret>
```

#### Step 3: Update Current Secret
```bash
# Set JWT_SECRET to the newly generated secret
JWT_SECRET=<new_jwt_secret>
```

#### Step 4: Deploy
- Deploy the application with both secrets configured
- The application will accept tokens signed with either secret
- New tokens will be signed with the new secret

#### Step 5: Monitor
- Monitor for 30 days (or longer than your longest token expiry)
- Check logs for "Token verified with previous secret" messages
- These indicate tokens still using the old secret

#### Step 6: Remove Old Secret
```bash
# After all tokens have expired (30+ days for refresh tokens)
# Remove JWT_SECRET_PREVIOUS
unset JWT_SECRET_PREVIOUS
```

### Environment-Specific Secrets

#### Development
```bash
# Generate development secret
JWT_SECRET_DEV=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
```

#### UAT/Staging
```bash
# Generate UAT secret (different from dev and production)
JWT_SECRET_UAT=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
```

#### Production
```bash
# Generate production secret (NEVER reuse dev or UAT secrets)
JWT_SECRET_PROD=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
```

### Using AWS Secrets Manager

#### Store Secret
```bash
aws secretsmanager create-secret \
    --name meri-shikayat/prod/jwt-secret \
    --secret-string "$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"
```

#### Retrieve Secret in Application
```javascript
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" });

async function getJWTSecret() {
    const response = await client.send(
        new GetSecretValueCommand({
            SecretId: "meri-shikayat/prod/jwt-secret"
        })
    );
    return response.SecretString;
}
```

### Using Azure Key Vault

#### Store Secret
```bash
az keyvault secret set \
    --vault-name meri-shikayat-vault \
    --name jwt-secret \
    --value "$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"
```

#### Retrieve Secret in Application
```javascript
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

const credential = new DefaultAzureCredential();
const client = new SecretClient("https://meri-shikayat-vault.vault.azure.net", credential);

async function getJWTSecret() {
    const secret = await client.getSecret("jwt-secret");
    return secret.value;
}
```

### Security Best Practices

1. **Never commit secrets to git**
   - Use .env files (gitignored)
   - Use environment variables
   - Use secrets managers

2. **Different secrets per environment**
   - Development
   - UAT/Staging
   - Production

3. **Regular rotation**
   - Set calendar reminders
   - Automate if possible
   - Document rotation dates

4. **Access control**
   - Limit who can access secrets
   - Use IAM roles/policies
   - Audit secret access

5. **Backup**
   - Keep encrypted backups of secrets
   - Store in secure location
   - Test recovery procedures

### Troubleshooting

#### Application won't start
```
Error: FATAL: JWT_SECRET environment variable is not set
```
**Solution:** Set JWT_SECRET environment variable

#### Secret too short error
```
Error: FATAL: JWT_SECRET must be at least 64 characters long
```
**Solution:** Generate a new 64+ character secret

#### Insecure secret error
```
Error: FATAL: JWT_SECRET contains an insecure default value
```
**Solution:** Generate a cryptographically random secret, don't use default values

### Verification

Test that secrets are properly configured:

```bash
# Test application starts
npm start

# Should see:
# ✅ JWT_SECRET validation passed
# ✅ Secret rotation enabled with JWT_SECRET_PREVIOUS (if configured)
```

### Emergency Rotation

If a secret is compromised:

1. **Immediately** generate and deploy new secret
2. Set old secret as JWT_SECRET_PREVIOUS
3. Force all users to re-authenticate
4. Invalidate all refresh tokens in database
5. Monitor for suspicious activity
6. Investigate how compromise occurred

```javascript
// Force logout all users
await User.updateMany({}, { $set: { refreshTokens: [] } });
```

### Rotation Schedule

| Environment | Rotation Frequency | Next Rotation |
|-------------|-------------------|---------------|
| Development | As needed | N/A |
| UAT | Every 90 days | __________ |
| Production | Every 90 days | __________ |

### Contacts

- **Security Team:** security@example.com
- **DevOps Team:** devops@example.com
- **On-Call:** +1-XXX-XXX-XXXX
