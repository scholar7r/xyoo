import { endpoints } from "./Endpoints";

class CredentialManager {
  private static instance: CredentialManager;
  private validCredentials: { openId: string; unionId: string }[] = [];
  private isCredentialsValidated: boolean = false;

  public static grabInstance(): CredentialManager {
    if (!CredentialManager.instance) {
      CredentialManager.instance = new CredentialManager();
    }

    return CredentialManager.instance;
  }

  public async validateCredentials(
    credentials: { openId: string; unionId: string }[],
  ): Promise<void> {
    if (this.isCredentialsValidated) return;

    const validate = async (credential: {
      openId: string;
      unionId: string;
    }) => {
      const response = await endpoints.user.wechatCredentialLogin(credential);

      return { ...response, ...credential };
    };

    const batchResults = await Promise.all(credentials.map(validate));
    this.validCredentials = batchResults
      .filter((result) => result.code === "200")
      .map((result) => ({ openId: result.openId, unionId: result.unionId }));

    this.isCredentialsValidated = true;
  }

  public async validateSingleCredential(credential: {
    openId: string;
    unionId: string;
  }): Promise<boolean> {
    const response = await endpoints.user.wechatCredentialLogin(credential);
    return response.code === "200";
  }

  public grabValidCredentials(): { openId: string; unionId: string }[] {
    return this.validCredentials;
  }

  public grabRandomCredential():
    | { openId: string; unionId: string }
    | undefined {
    const randomIndex = Math.floor(
      Math.random() * this.validCredentials.length,
    );
    return this.validCredentials[randomIndex];
  }
}

export const credentialManager = CredentialManager.grabInstance();
