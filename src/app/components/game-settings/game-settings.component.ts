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
  collection?: string;
  subGame?: string;
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
  collection: string = '';
  subGame: string = '';
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
      // Gérer les paramètres pour les jeux simples et les collections
      if (params['collection'] && params['subGame']) {
        // C'est un sous-jeu d'une collection
        this.collection = params['collection'];
        this.subGame = params['subGame'];
        this.gameId = this.getSubGameId(this.collection, this.subGame);
        this.loadSubGameSettings();
      } else {
        // C'est un jeu simple
        this.gameId = +params['id'];
        this.loadGameSettings();
      }
      
      this.loadSavedSettings();
    });
    
    this.playerService.getPlayers().subscribe(players => {
      this.players = players.filter(p => p.isActive);
    });
  }

  private getSubGameId(collection: string, subGame: string): number {
    // Mapping des sous-jeux vers des IDs uniques
    const subGameIds: { [key: string]: { [key: string]: number } } = {
      'questioning': {
        'tu-preferes': 201,
        'debats': 202,
        'red-flags': 203,
        'green-flags': 204,
        'qui-pourrait': 205
      }
    };
    
    return subGameIds[collection]?.[subGame] || 0;
  }

  private loadSubGameSettings(): void {
    // Charger les paramètres selon le sous-jeu
    const subGameNames: { [key: string]: string } = {
      'tu-preferes': 'Tu préfères',
      'debats': 'Débats',
      'red-flags': 'Red Flags',
      'green-flags': 'Green Flags',
      'qui-pourrait': 'Qui pourrait'
    };
    
    this.gameName = subGameNames[this.subGame] || 'Sous-jeu';
    
    // Mettre à jour les paramètres
    this.settings.gameName = this.gameName;
    this.settings.gameId = this.gameId;
    this.settings.collection = this.collection;
    this.settings.subGame = this.subGame;
  }

  private loadGameSettings(): void {
    // Charger les paramètres selon le jeu
    switch (this.gameId) {
      case 1: // J'ai / Je n'ai jamais
        this.gameName = "J'ai / Je n'ai jamais";
        break;
      case 2: // Questioning (collection)
        this.gameName = "Questioning";
        break;
    }
    
    // Mettre à jour les paramètres avec le nom du jeu
    this.settings.gameName = this.gameName;
    this.settings.gameId = this.gameId;
  }

  private loadSavedSettings(): void {
    // Charger les paramètres sauvegardés depuis localStorage
    const settingsKey = this.settings.collection && this.settings.subGame 
      ? `game-settings-${this.settings.collection}-${this.settings.subGame}`
      : `game-settings-${this.gameId}`;
      
    const savedSettings = localStorage.getItem(settingsKey);
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
    const settingsKey = this.settings.collection && this.settings.subGame 
      ? `game-settings-${this.settings.collection}-${this.settings.subGame}`
      : `game-settings-${this.gameId}`;
      
    localStorage.setItem(settingsKey, JSON.stringify(this.settings));
    
    // Naviguer vers le jeu
    if (this.settings.collection && this.settings.subGame) {
      this.router.navigate(['/play', this.settings.collection, this.settings.subGame]);
    } else {
      this.router.navigate(['/play', this.gameId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/games']);
  }
} 