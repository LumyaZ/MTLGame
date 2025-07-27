import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Player {
  id: number;
  name: string;
  color: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private players: Player[] = [];
  private playersSubject = new BehaviorSubject<Player[]>([]);

  constructor() {
    this.loadPlayers();
  }

  getPlayers(): Observable<Player[]> {
    return this.playersSubject.asObservable();
  }

  addPlayer(name: string): void {
    const newPlayer: Player = {
      id: Date.now(),
      name: name.trim(),
      color: this.getRandomColor(),
      isActive: true
    };
    
    this.players.push(newPlayer);
    this.savePlayers();
    this.playersSubject.next([...this.players]);
  }

  removePlayer(id: number): void {
    this.players = this.players.filter(player => player.id !== id);
    this.savePlayers();
    this.playersSubject.next([...this.players]);
  }

  togglePlayerActive(id: number): void {
    const player = this.players.find(p => p.id === id);
    if (player) {
      player.isActive = !player.isActive;
      this.savePlayers();
      this.playersSubject.next([...this.players]);
    }
  }

  clearAllPlayers(): void {
    this.players = [];
    this.savePlayers();
    this.playersSubject.next([]);
  }

  private getRandomColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private savePlayers(): void {
    localStorage.setItem('players', JSON.stringify(this.players));
  }

  private loadPlayers(): void {
    const saved = localStorage.getItem('players');
    if (saved) {
      this.players = JSON.parse(saved);
      this.playersSubject.next([...this.players]);
    }
  }
} 