
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

// Generate players for all teams except Orlando Pirates and Kaizer Chiefs
const otherTeams = teams.filter(t => t !== "Orlando Pirates" && t !== "Kaizer Chiefs");
const otherPlayers = otherTeams.flatMap(team => [
    ...generatePlayers(team, 2, 'GKP', [4.0, 5.5]),
    ...generatePlayers(team, 5, 'DEF', [4.0, 7.5]),
    ...generatePlayers(team, 5, 'MID', [4.5, 12.0]),
    ...generatePlayers(team, 3, 'FWD', [5.0, 13.0]),
]);


const orlandoPiratesPlayers: FantasyPlayer[] = [
    // Goalkeepers
    { id: playerIdCounter++, name: 'Sipho Chaine', position: 'GKP', team: 'Orlando Pirates', price: 5.5 },
    { id: playerIdCounter++, name: 'Melusi Buthelezi', position: 'GKP', team: 'Orlando Pirates', price: 5.0 },
    { id: playerIdCounter++, name: 'Siyabonga Dladla', position: 'GKP', team: 'Orlando Pirates', price: 4.5 },

    // Defenders
    { id: playerIdCounter++, name: 'Nkosinathi Sibisi', position: 'DEF', team: 'Orlando Pirates', price: 7.0 },
    { id: playerIdCounter++, name: 'Tapelo Xoki', position: 'DEF', team: 'Orlando Pirates', price: 6.8 },
    { id: playerIdCounter++, name: 'Bandile Shandu', position: 'DEF', team: 'Orlando Pirates', price: 6.5 },
    { id: playerIdCounter++, name: 'Deon Hotto', position: 'DEF', team: 'Orlando Pirates', price: 7.2 },
    { id: playerIdCounter++, name: 'Thabiso Sesane', position: 'DEF', team: 'Orlando Pirates', price: 5.5 },
    { id: playerIdCounter++, name: 'Thabiso Lebitso', position: 'DEF', team: 'Orlando Pirates', price: 5.8 },
    { id: playerIdCounter++, name: 'Siyabonga Ndlozi', position: 'DEF', team: 'Orlando Pirates', price: 4.5 },
    { id: playerIdCounter++, name: 'Mbekezeli Mbokazi', position: 'DEF', team: 'Orlando Pirates', price: 4.8 },
    { id: playerIdCounter++, name: 'Nkosinathi Ndaba', position: 'DEF', team: 'Orlando Pirates', price: 4.6 },
    { id: playerIdCounter++, name: 'Lebone Seema', position: 'DEF', team: 'Orlando Pirates', price: 4.2 },
    { id: playerIdCounter++, name: 'Olisa Ndah', position: 'DEF', team: 'Orlando Pirates', price: 6.9 },

    // Midfielders
    { id: playerIdCounter++, name: 'Makhehleni Makhaula', position: 'MID', team: 'Orlando Pirates', price: 7.5 },
    { id: playerIdCounter++, name: 'Patrick Maswanganyi', position: 'MID', team: 'Orlando Pirates', price: 10.5 },
    { id: playerIdCounter++, name: 'Kabelo Dlamini', position: 'MID', team: 'Orlando Pirates', price: 9.0 },
    { id: playerIdCounter++, name: 'Thalente Mbatha', position: 'MID', team: 'Orlando Pirates', price: 8.5 },
    { id: playerIdCounter++, name: 'Selaelo Rasebotja', position: 'MID', team: 'Orlando Pirates', price: 6.5 },
    { id: playerIdCounter++, name: 'Simphiwe Selepe', position: 'MID', team: 'Orlando Pirates', price: 5.0 },
    { id: playerIdCounter++, name: 'Cemran Dansin', position: 'MID', team: 'Orlando Pirates', price: 5.2 },
    { id: playerIdCounter++, name: 'Kamogelo Sebelebele', position: 'MID', team: 'Orlando Pirates', price: 4.8 },
    { id: playerIdCounter++, name: 'Sihle Nduli', position: 'MID', team: 'Orlando Pirates', price: 4.9 },
    { id: playerIdCounter++, name: 'Sinoxolo Kwayiba', position: 'MID', team: 'Orlando Pirates', price: 5.5 },
    { id: playerIdCounter++, name: 'Masindi Nemtjaela', position: 'MID', team: 'Orlando Pirates', price: 4.5 },
    { id: playerIdCounter++, name: 'Sipho Mbule', position: 'MID', team: 'Orlando Pirates', price: 8.8 },
    { id: playerIdCounter++, name: 'Abdoulaye Mariko', position: 'MID', team: 'Orlando Pirates', price: 6.0 },

    // Forwards
    { id: playerIdCounter++, name: 'Tshepang Moremi', position: 'FWD', team: 'Orlando Pirates', price: 8.0 },
    { id: playerIdCounter++, name: 'Oswin Apollis', position: 'FWD', team: 'Orlando Pirates', price: 8.5 },
    { id: playerIdCounter++, name: 'Sifiso Luthuli', position: 'FWD', team: 'Orlando Pirates', price: 7.0 },
    { id: playerIdCounter++, name: 'Evidence Makgopa', position: 'FWD', team: 'Orlando Pirates', price: 11.0 },
    { id: playerIdCounter++, name: 'Relebogile Mofokeng', position: 'FWD', team: 'Orlando Pirates', price: 11.5 },
    { id: playerIdCounter++, name: 'Tshegofatso Mabasa', position: 'FWD', team: 'Orlando Pirates', price: 12.0 },
    { id: playerIdCounter++, name: 'Boitumeo Radiopane', position: 'FWD', team: 'Orlando Pirates', price: 7.5 },
    { id: playerIdCounter++, name: 'Yanela Mbuthuma', position: 'FWD', team: 'Orlando Pirates', price: 6.5 },
];

const kaizerChiefsPlayers: FantasyPlayer[] = [
    // Goalkeepers
    { id: playerIdCounter++, name: 'Brandon Petersen', position: 'GKP', team: 'Kaizer Chiefs', price: 5.5 },
    { id: playerIdCounter++, name: 'Fierce Ntwari', position: 'GKP', team: 'Kaizer Chiefs', price: 5.0 },
    { id: playerIdCounter++, name: 'Bruce Bvuma', position: 'GKP', team: 'Kaizer Chiefs', price: 4.5 },
    
    // Defenders
    { id: playerIdCounter++, name: 'Dillan Solomons', position: 'DEF', team: 'Kaizer Chiefs', price: 6.0 },
    { id: playerIdCounter++, name: 'Inacio Miguel', position: 'DEF', team: 'Kaizer Chiefs', price: 6.2 },
    { id: playerIdCounter++, name: 'Bradley Cross', position: 'DEF', team: 'Kaizer Chiefs', price: 5.8 },
    { id: playerIdCounter++, name: 'Thabiso Monyane', position: 'DEF', team: 'Kaizer Chiefs', price: 6.5 },
    { id: playerIdCounter++, name: 'Aden McCarthy', position: 'DEF', team: 'Kaizer Chiefs', price: 5.0 },
    { id: playerIdCounter++, name: 'Reeve Frosler', position: 'DEF', team: 'Kaizer Chiefs', price: 6.8 },
    { id: playerIdCounter++, name: 'Paseka Mako', position: 'DEF', team: 'Kaizer Chiefs', price: 6.4 },
    { id: playerIdCounter++, name: 'Zitha Kwinika', position: 'DEF', team: 'Kaizer Chiefs', price: 6.0 },

    // Midfielders
    { id: playerIdCounter++, name: 'Nkosingiphile Ngcobo', position: 'MID', team: 'Kaizer Chiefs', price: 8.5 },
    { id: playerIdCounter++, name: 'Mduduzi Shabalala', position: 'MID', team: 'Kaizer Chiefs', price: 7.0 },
    { id: playerIdCounter++, name: 'Wandile Duba', position: 'MID', team: 'Kaizer Chiefs', price: 6.5 },
    { id: playerIdCounter++, name: 'Sibongiseni Mthethwa', position: 'MID', team: 'Kaizer Chiefs', price: 7.8 },
    { id: playerIdCounter++, name: 'Mfundo Vilakazi', position: 'MID', team: 'Kaizer Chiefs', price: 6.0 },
    { id: playerIdCounter++, name: 'Gaston Sirino', position: 'MID', team: 'Kaizer Chiefs', price: 9.5 },
    { id: playerIdCounter++, name: 'Thabo Cele', position: 'MID', team: 'Kaizer Chiefs', price: 7.2 },
    { id: playerIdCounter++, name: 'Siphesihle Ndlovu', position: 'MID', team: 'Kaizer Chiefs', price: 6.8 },
    { id: playerIdCounter++, name: 'Pule Modi', position: 'MID', team: 'Kaizer Chiefs', price: 7.5 },
    
    // Forwards
    { id: playerIdCounter++, name: 'Khanyisa Mayo', position: 'FWD', team: 'Kaizer Chiefs', price: 11.5 },
    { id: playerIdCounter++, name: 'Ashley Du Preez', position: 'FWD', team: 'Kaizer Chiefs', price: 10.0 },
    { id: playerIdCounter++, name: 'Makabi Lilepo', position: 'FWD', team: 'Kaizer Chiefs', price: 9.0 },
    { id: playerIdCounter++, name: 'Naledi Hloogwane', position: 'FWD', team: 'Kaizer Chiefs', price: 5.5 },
    { id: playerIdCounter++, name: 'Flavio Silva', position: 'FWD', team: 'Kaizer Chiefs', price: 8.0 },
];


export const dummyPlayers: FantasyPlayer[] = [...otherPlayers, ...orlandoPiratesPlayers, ...kaizerChiefsPlayers];
