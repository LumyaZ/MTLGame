import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';

export interface GameSettings {
  gameId: number;
  gameName: string;
  questionCount: 25 | 50 | 75 | 100;
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
      // Réinitialiser les paramètres après avoir chargé les infos du jeu
      this.resetGameSettings();
    });
    
    this.playerService.getPlayers().subscribe(players => {
      this.players = players.filter(p => p.isActive);
    });
  }

  private resetGameSettings(): void {
    // Réinitialiser les paramètres pour le jeu actuel
    const defaultSettings = {
      gameId: this.gameId,
      gameName: this.gameName,
      questionCount: 50,
      bonusRound: false
    };
    localStorage.setItem(`game-settings-${this.gameId}`, JSON.stringify(defaultSettings));
  }

  loadGameSettings(): void {
    // Charger les paramètres selon le jeu
    switch (this.gameId) {
      case 1: // J'ai / Je n'ai jamais
        this.gameName = "J'ai / Je n'ai jamais";
        this.settings.gameName = this.gameName;
        this.settings.gameId = this.gameId;
        break;
      case 2: // Qui pourrait
        this.gameName = "Qui pourrait";
        this.settings.gameName = this.gameName;
        this.settings.gameId = this.gameId;
        break;
      case 3: // C'est un 10
        this.gameName = "C'est un 10";
        this.settings.gameName = this.gameName;
        this.settings.gameId = this.gameId;
        break;
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