export class Account {
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  public setSessionId(sessionId: string) {
    this.sessionId = sessionId;
  }

  public getSessionId() {
    return this.sessionId;
  }
}
