
export type FantasyPlayer = {
  id: number;
  name: string;
  position: 'GKP' | 'DEF' | 'MID' | 'FWD';
  team: string;
  price: number; // in millions
};

const teams = [
    "Mamelodi Sundowns", "Sekhukhune United", "Orlando Pirates", "Durban City",
    "Kaizer Chiefs", "Polokwane City", "TS Galaxy", "Golden Arrows",
    "AmaZulu FC", "Richards Bay", "Marumo Gallants", "Siwelele",
    "Orbit College FC", "Stellenbosch FC", "Magesi FC", "Chippa United"
];

const firstNames = ["Sipho", "Themba", "Lethu", "Bongani", "Thabo", "Jabu", "Katlego", "Tebogo", "Mandla", "Khaya", "Zola", "Ayanda", "Sfiso", "Lucky"];
const lastNames = ["Zwane", "Mokoena", "Ndlovu", "Khumalo", "Modise", "Tau", "Radebe", "Pienaar", "Masilela", "Tshabalala", "Shabba", "Mthembu", "Vilakazi", "Zungu"];

let playerIdCounter = 1;

const generatePlayers = (team: string, count: number, position: FantasyPlayer['position'], priceRange: [number, number]): FantasyPlayer[] => {
    const players: FantasyPlayer[] = [];
    for (let i = 0; i < count; i++) {
        const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        // Ensure some price variation
        const price = parseFloat((Math.random() * (priceRange[1] - priceRange[0]) + priceRange[0]).toFixed(1));
        players.push({
            id: playerIdCounter++,
            name,
            position,
            team,
            price
        });
    }
    return players;
};

export const dummyPlayers: FantasyPlayer[] = teams.flatMap(team => [
    ...generatePlayers(team, 2, 'GKP', [4.0, 5.5]),
    ...generatePlayers(team, 5, 'DEF', [4.0, 7.5]),
    ...generatePlayers(team, 5, 'MID', [4.5, 12.0]),
    ...generatePlayers(team, 3, 'FWD', [5.0, 13.0]),
]);

    