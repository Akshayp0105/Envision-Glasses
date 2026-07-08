# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability in Envision Glasses, please report it responsibly:

1. **Do not** open a public GitHub issue for security vulnerabilities
2. Email the maintainers directly with details of the vulnerability
3. Include steps to reproduce and potential impact
4. Allow reasonable time for a fix before public disclosure

## Security Considerations

### API Keys
- Never commit API keys to the repository
- Use environment variables or the app's Settings screen
- The `.env.example` file provides a template

### BLE Communication
- The BLE connection between glasses and phone is unencrypted by default
- Do not transmit sensitive personal data over BLE
- Future versions may implement BLE encryption

### Camera Feed
- The MJPEG camera stream is served over local Wi-Fi only
- Do not expose the ESP32 AP to untrusted networks
- Camera data is processed locally or sent to Google Gemini (encrypted HTTPS)

### Mobile App
- API keys are stored locally on the device
- No user data is collected or transmitted beyond Gemini API calls
- Camera and microphone access requires explicit user permission

## Supported Versions

| Version | Supported |
|---|---|
| 1.0.x | Yes |
| < 1.0 | No |

## Best Practices

- Keep dependencies updated
- Review third-party library security advisories
- Use HTTPS for all external API calls
- Validate user input on all screens
