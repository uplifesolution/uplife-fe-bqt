import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RouteStateService {
  private currentRoute = '';
  private stateMap = new Map<string, any>();

  setRoute(route: string): void {
    this.currentRoute = route;
  }

  setState(route: string, state: any): void {
    this.stateMap.set(route, state);
  }

  getState<T>(route: string): T | null {
    return this.stateMap.get(route) || null;
  }

  clearState(route: string): void {
    this.stateMap.delete(route);
  }

  clearAllExcept(): void {
    for (const key of this.stateMap.keys()) {
      if (this.currentRoute !== key) {
        this.stateMap.delete(key);
      }
    }
  }

  debug(): void {
    console.table(Array.from(this.stateMap.entries()));
  }
}
