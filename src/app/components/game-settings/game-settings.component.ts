import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';

export interface GameSettings {
  gameId: number;
  gameName: string;
  questionCount: 10 | 25 | 50 | 75 | 100;
  bonusRound: boolean;
}

@Component({
  selector: 'app-game-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-settings.component.html',
  styleUrls: ['./game-settings.component.scss']
})
export class GameSettingsComponent implements OnInit {
  gameId: number = 0;
  gameName: string = '';
  players: any[] = [];
  settings: GameSettings = {
    gameId: 0,
    gameName: '',
    questionCount: 50,
    bonusRound: false
  };

  constructor(
    private playerService: PlayerService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.gameId = +params['id'];
      this.loadGameSettings();
      this.loadSavedSettings();
    });
    
    this.playerService.getPlayers().subscribe(players => {
      this.players = players.filter(p => p.isActive);
    });
  }

  private loadGameSettings(): void {
    // Charger les paramètres selon le jeu
    switch (this.gameId) {
      case 1: // J'ai / Je n'ai jamais
        this.gameName = "J'ai / Je n'ai jamais";
        break;
      case 2: // Qui pourrait
        this.gameName = "Qui pourrait";
        break;
      case 3: // C'est un 10
        this.gameName = "C'est un 10";
        break;
    }
    
    // Mettre à jour les paramètres avec le nom du jeu
    this.settings.gameName = this.gameName;
    this.settings.gameId = this.gameId;
  }

  private loadSavedSettings(): void {
    // Charger les paramètres sauvegardés depuis localStorage
    const savedSettings = localStorage.getItem(`game-settings-${this.gameId}`);
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        // Fusionner avec les paramètres par défaut
        this.settings = {
          ...this.settings,
          questionCount: parsedSettings.questionCount || 50,
          bonusRound: parsedSettings.bonusRound || false
        };
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      }
    }
  }

  startGame(): void {
    // Sauvegarder les paramètres
    localStorage.setItem(`game-settings-${this.gameId}`, JSON.stringify(this.settings));
    
    // Naviguer vers le jeu
    this.router.navigate(['/play', this.gameId]);
  }

  goBack(): void {
    this.router.navigate(['/games']);
  }
} 