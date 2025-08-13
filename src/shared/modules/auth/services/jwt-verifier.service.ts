import { Algorithm, decodeHeader, verify } from '@node-rs/jsonwebtoken';
import buildGetJwks, { GetJwks } from 'get-jwks';

export class JWTVerifierService {
  private readonly domain: string;
  private readonly cacheDuration: number;
  private readonly getJwks: GetJwks;
  private readonly jwkCache: Map<string, { publicKey: string; fetchedAt: number }>;

  constructor(domain: string, cacheDuration = 60000) {
    this.domain = domain;
    this.cacheDuration = cacheDuration; // Cache duration in milliseconds
    this.jwkCache = new Map();
    this.getJwks = buildGetJwks({});
  }

  // Get the specific JWK by 'kid' with cache handling
  private async getPublicKey(
    kid: string,
    alg: string,
    domain: string,
  ): Promise<string | undefined> {
    const cachedEntry = this.jwkCache.get(kid);

    // If the entry is in cache and not expired, use it
    if (cachedEntry && Date.now() - cachedEntry.fetchedAt < this.cacheDuration) {
      return cachedEntry.publicKey;
    }

    // Fetch new JWKs and store in the cache
    const publicKey = await this.getJwks.getPublicKey({ kid, alg, domain });

    if (publicKey) {
      this.jwkCache.set(kid, { publicKey, fetchedAt: Date.now() });
    }

    return publicKey;
  }

  // Verify the JWT asynchronously
  public async verify(token: string): Promise<any> {
    const { keyId, algorithm = Algorithm.RS256 } = decodeHeader(token);
    if (!keyId) {
      throw new Error('No "kid" found in JWT header.');
    }

    // Import JWK and verify the JWT
    const publicKey = await this.getPublicKey(keyId, algorithm, `https://${this.domain}`);

    if (!publicKey) {
      throw new Error('Failed to get public key');
    }

    return await verify(token, publicKey, {
      algorithms: [algorithm],
    });
  }
}
