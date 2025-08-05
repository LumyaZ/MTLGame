import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';

export interface Game {
  id: number;
  name: string;
  description: string;
  category: string;
  minPlayers: number;
  maxPlayers: number;
  duration: string;
  difficulty: string;
  icon: string;
  isUnderConstruction?: boolean;
  type?: 'collection' | 'single';
  subGames?: string[];
}

export interface SubGame {
  id: string;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  duration: string;
  category: string;
  icon: string;
}

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GamesComponent implements OnInit {
  games: Game[] = [
    {
      id: 1,
      name: "J'ai / Je n'ai jamais",
      description: "Révélez des secrets et découvrez ceux de vos amis",
      category: "taz",
      minPlayers: 3,
      maxPlayers: 15,
      duration: "15-45 min",
      difficulty: "Facile",
      icon: "🤐"
    },
    {
      id: 2,
      name: "Qui pourrait",
      description: "Devinez qui pourrait faire quoi dans le groupe",
      category: "taz",
      minPlayers: 4,
      maxPlayers: 12,
      duration: "20-40 min",
      difficulty: "Moyen",
      icon: "🤔",
      isUnderConstruction: true
    },
    {
      id: 3,
      name: "C'est un 10",
      description: "Notez les choses de 1 à 10 et découvrez les goûts de chacun",
      category: "taz",
      minPlayers: 3,
      maxPlayers: 10,
      duration: "15-30 min",
      difficulty: "Facile",
      icon: "⭐",
      isUnderConstruction: true
    },
    {
      id: 4,
      name: "Questioning",
      description: "Une collection de jeux de questions pour découvrir vos préférences, débattre et mieux vous connaître",
      category: "questioning",
      minPlayers: 2,
      maxPlayers: 10,
      duration: "15-45 min",
      difficulty: "Facile",
      icon: "❓",
      type: "collection",
      subGames: ["tu-preferes", "debats", "red-flags", "green-flags", "qui-pourrait"]
    }
  ];

  subGames: { [key: string]: SubGame[] } = {
    "questioning": [
      {
        id: "tu-preferes",
        name: "Tu préfères",
        description: "Choisissez entre deux options parfois difficiles et découvrez les préférences de chacun",
        minPlayers: 2,
        maxPlayers: 10,
        duration: "10-20 min",
        category: "Préférences",
        icon: "🤔"
      },
      {
        id: "debats",
        name: "Débats",
        description: "Débattez sur des sujets controversés et découvrez les opinions de chacun",
        minPlayers: 3,
        maxPlayers: 8,
        duration: "15-30 min",
        category: "Discussion",
        icon: "💬"
      },
      {
        id: "red-flags",
        name: "Red Flags",
        description: "Identifiez les comportements problématiques dans les relations",
        minPlayers: 2,
        maxPlayers: 8,
        duration: "10-20 min",
        category: "Relations",
        icon: "🚩"
      },
      {
        id: "green-flags",
        name: "Green Flags",
        description: "Identifiez les comportements positifs dans les relations",
        minPlayers: 2,
        maxPlayers: 8,
        duration: "10-20 min",
        category: "Relations",
        icon: "✅"
      },
      {
        id: "qui-pourrait",
        name: "Qui pourrait",
        description: "Découvrez qui parmi vous pourrait le mieux accomplir certaines tâches",
        minPlayers: 3,
        maxPlayers: 10,
        duration: "10-25 min",
        category: "Connaissance",
        icon: "👥"
      }
    ]
  };

  players: any[] = [];
  selectedGame: Game | null = null;

  constructor(
    private playerService: PlayerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.playerService.getPlayers().subscribe(players => {
      this.players = players.filter(p => p.isActive);
    });
  }

  getGamesByCategory(category: string): Game[] {
    return this.games.filter(game => game.category === category);
  }

  getSubGamesByGame(game: Game): SubGame[] {
    if (game.type === 'collection' && game.subGames) {
      return this.subGames[game.category]?.filter(subGame => 
        game.subGames!.includes(subGame.id)
      ) || [];
    }
    return [];
  }

  selectGame(game: Game): void {
    if (game.type === 'collection') {
      this.selectedGame = game;
    } else {
      this.startGame(game);
    }
  }

  startSubGame(subGame: SubGame): void {
    // Navigation vers la page de paramètres du sous-jeu
    this.router.navigate(['/settings', 'questioning', subGame.id]);
  }

  startGame(game: Game): void {
    // Empêcher le démarrage des jeux en construction
    if (game.isUnderConstruction) {
      return;
    }
    
    // Navigation vers la page de paramètres du jeu
    this.router.navigate(['/settings', game.id]);
  }

  goBack(): void {
    if (this.selectedGame) {
      this.selectedGame = null;
    } else {
      this.router.navigate(['/']);
    }
  }
} 