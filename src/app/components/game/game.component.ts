import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-container">
      <header class="header">
        <button class="btn-back" (click)="goBack()">
          ← Retour aux jeux
        </button>
        <h1 class="title">🎮 J'ai / Je n'ai jamais</h1>
      </header>
      
      <div class="game-content">
        <div class="info-card">
          <h2>📋 Règles du jeu</h2>
          <p>Un joueur dit "Je n'ai jamais..." suivi d'une action. Tous les joueurs qui ont déjà fait cette action baissent un doigt. Le premier à avoir baissé tous ses doigts a perdu !</p>
          
          <div class="game-stats">
            <div class="stat">
              <span class="stat-label">👥 Joueurs:</span>
              <span class="stat-value">{{ players.length }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">⏱️ Durée:</span>
              <span class="stat-value">15-45 min</span>
            </div>
          </div>
        </div>
        
        <div class="players-list">
          <h3>🎯 Joueurs participants</h3>
          <div class="player-item" *ngFor="let player of players">
            <div class="player-avatar" [style.background-color]="player.color">
              {{ player.name.charAt(0).toUpperCase() }}
            </div>
            <span class="player-name">{{ player.name }}</span>
            <div class="fingers">
              <span class="finger" *ngFor="let finger of [1,2,3,4,5]">🖐️</span>
            </div>
          </div>
        </div>
        
        <button class="btn btn-start" (click)="startGame()">
          🎯 Commencer la partie
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  players: any[] = [];
  gameId: string = '';

  constructor(
    private playerService: PlayerService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.gameId = params['id'];
    });
    
    this.playerService.getPlayers().subscribe(players => {
      this.players = players.filter(p => p.isActive);
    });
  }

  goBack(): void {
    this.router.navigate(['/games']);
  }

  startGame(): void {
    // TODO: Implémenter la logique du jeu
    alert('Fonctionnalité en cours de développement !');
  }
} 