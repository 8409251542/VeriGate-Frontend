
/**
 * CredentialRotator
 * Manages a list of SMTP/Gmail credentials and rotates them (Round Robin).
 */
export default class CredentialRotator {
    constructor() {
        this.credentials = [];
        this.currentIndex = 0;
    }

    /**
     * Load credentials from parsed CSV data.
     * Auto-detects if it's Gmail API or Standard SMTP based on headers.
     * 
     * Expected CSV Headers:
     * SMTP: host, port, user, pass, [hostname]
     * GMAIL API: user, clientId, clientSecret, refreshToken
     */
    load(csvRows) {
        this.credentials = csvRows
            .filter((row) => row && Object.keys(row).length > 0)
            .map((row) => {
                // Normalize keys to lowercase for easier matching
                const normalized = {};
                Object.keys(row).forEach((k) => (normalized[k.toLowerCase().trim()] = row[k]));

                // Check for Gmail API
                if (normalized.clientid && normalized.clientsecret && normalized.refreshtoken) {
                    return {
                        type: "gmail_api",
                        user: normalized.user || normalized.email,
                        clientId: normalized.clientid,
                        clientSecret: normalized.clientsecret,
                        refreshToken: normalized.refreshtoken,
                    };
                }

                // Default to SMTP
                return {
                    type: "smtp",
                    host: normalized.host || normalized.smtp_host,
                    port: normalized.port || normalized.smtp_port || 587,
                    user: normalized.user || normalized.username || normalized.email,
                    pass: normalized.pass || normalized.password,
                    hostname: normalized.hostname || normalized.helo || "laptop.home", // HELO/EHLO
                };
            });

        this.currentIndex = 0;
        console.log(`[CredentialRotator] Loaded ${this.credentials.length} credentials.`);
        return this.credentials.length;
    }

    /**
     * Get the next credential in the rotation.
     * Returns null if no credentials loaded.
     */
    getNext() {
        if (!this.credentials || this.credentials.length === 0) return null;

        const credential = this.credentials[this.currentIndex];

        // Increment and wrap around
        this.currentIndex = (this.currentIndex + 1) % this.credentials.length;

        return credential;
    }

    getCount() {
        return this.credentials.length;
    }
}
