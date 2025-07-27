import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlayerService, Player } from '../../services/player.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  players: Player[] = [];
  newPlayerName: string = '';

  constructor(
    private playerService: PlayerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.playerService.getPlayers().subscribe(players => {
      this.players = players;
    });
    
    // Réinitialiser les paramètres de jeu dans localStorage
    this.resetGameSettings();
  }

  private resetGameSettings(): void {
    // Réinitialiser les paramètres pour tous les jeux
    const games = [
      {
        gameId: 1,
        gameName: "J'ai / Je n'ai jamais"
      },
      {
        gameId: 2,
        gameName: "Qui pourrait"
      },
      {
        gameId: 3,
        gameName: "C'est un 10"
      }
    ];

    games.forEach(game => {
      const defaultSettings = {
        gameId: game.gameId,
        gameName: game.gameName,
        questionCount: 50,
        bonusRound: false
      };
      localStorage.setItem(`game-settings-${game.gameId}`, JSON.stringify(defaultSettings));
    });
  }

  addPlayer(): void {
    if (this.newPlayerName.trim()) {
      this.playerService.addPlayer(this.newPlayerName);
      this.newPlayerName = '';
    }
  }

  removePlayer(id: number): void {
    this.playerService.removePlayer(id);
  }

  togglePlayerActive(id: number): void {
    this.playerService.togglePlayerActive(id);
  }

  clearAllPlayers(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer tous les joueurs ?')) {
      this.playerService.clearAllPlayers();
    }
  }

  startGame(): void {
    if (this.players.length >= 2) {
      this.router.navigate(['/games']);
    } else {
      alert('Il faut au moins 2 joueurs pour commencer une partie !');
    }
  }


} 