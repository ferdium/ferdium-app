export interface BackofficeLookup {
  id: number;
  serviceId: string;
  conversationKey: string;
  stream: 'BSPORT' | 'VSPORT';
  account: string;
}

export class BackofficeLookupGuard {
  private currentId = 0;

  begin(
    serviceId: string,
    conversationKey: string,
    stream: 'BSPORT' | 'VSPORT',
    account: string,
  ): BackofficeLookup {
    return {
      id: ++this.currentId,
      serviceId,
      conversationKey,
      stream,
      account,
    };
  }

  invalidate(): void {
    this.currentId += 1;
  }

  isCurrent(lookup: BackofficeLookup): boolean {
    return lookup.id === this.currentId;
  }
}
