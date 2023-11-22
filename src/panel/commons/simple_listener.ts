type ListenerRemover = () => boolean;
type ListenerAction = (...args: Array<any>) => void;

// This class let's to add functions that are fire method is called.
//
export default class SimpleListener {
  private listeners: Array<ListenerAction> = [];

  public getSize = (): number => {
    return this.listeners.length;
  };

  public add = (action: ListenerAction): ListenerRemover => {
    this.listeners.push(action);
    let removed = false;
    return (): boolean => {
      if (removed) {
        return false;
      }
      removed = true;
      return this.remove(action);
    };
  };

  public remove = (action: ListenerAction): boolean => {
    for (let i = 0; i < this.listeners.length; ++i) {
      if (action === this.listeners[i]) {
        this.listeners.splice(i, 1);
        return true;
      }
    }
    return false;
  };

  public fire = (...args: Array<any>): void => {
    for (let i = 0; i < this.listeners.length; ++i) {
      const listener = this.listeners[i];
      listener.apply(listener, args);
    }
  };

  public clean = (): void => {
    this.listeners = [];
  };
}

// This class let's to use named events.
//
export class ComposedListener {
  private count: number = 0;
  private listeners: Record<string, SimpleListener> = {};

  public getSize = (event?: string | null): number => {
    if (event) {
      const entry = this.listeners[event];
      if (entry) {
        return entry.getSize();
      }
      return 0;
    }
    return this.count;
  };

  public add = (event: string, action: ListenerAction): ListenerRemover => {
    this.count += 1;
    const entry =
      this.listeners[event] ?? (this.listeners[event] = new SimpleListener());
    const remove = entry.add(action);
    return (): boolean => {
      if (remove()) {
        this.count -= 1;
        if (!entry.getSize()) {
          delete this.listeners[event];
        }
        return true;
      }
      return false;
    };
  };

  public remove = (event: string, action: ListenerAction): boolean => {
    const entry = this.listeners[event];
    if (entry == null) {
      return false;
    }
    if (action) {
      if (entry.remove(action)) {
        this.count -= 1;
        if (!entry.getSize()) {
          delete this.listeners[event];
        }
        return true;
      }
      return false;
    } else {
      this.count -= entry.getSize();
      delete this.listeners[event];
      return true;
    }
  };

  public fire = (event: string, parameters: unknown): void => {
    const entry = this.listeners[event];
    if (entry) {
      entry.fire(parameters);
    }
  };

  public clean = (): void => {
    if (this.count > 0) {
      this.count = 0;
      this.listeners = {};
    }
  };
}
