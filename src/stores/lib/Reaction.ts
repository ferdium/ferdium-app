import { type IReactionDisposer, type IReactionPublic, autorun } from 'mobx';

export default class Reaction {
  public reaction: (r: IReactionPublic) => any;

  private isRunning: boolean = false;

  public dispose?: IReactionDisposer;

  constructor(reaction: any) {
    this.reaction = reaction;
  }

  start(): void {
    if (!this.isRunning) {
      this.dispose = autorun(this.reaction);
      this.isRunning = true;
    }
  }

  stop(): void {
    if (this.isRunning) {
      this.dispose?.();
      this.isRunning = false;
    }
  }
}

export const createReactions = reactions => reactions.map(r => new Reaction(r));
