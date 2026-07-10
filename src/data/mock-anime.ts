export interface Anime {
  id: string;
  title: string;
  image: string;
  rating: number;
  type: string;
  episodes: number;
  status: string;
  genres: string[];
  description: string;
  banner: string;
}

export const mockAnimes: Anime[] = [
  {
    id: "1",
    title: "Demon Slayer: Kimetsu no Yaiba - Hashira Training Arc",
    image: "https://gogocdn.net/cover/kimetsu-no-yaiba-hashira-geiko-hen.png",
    banner: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200",
    rating: 8.9,
    type: "TV",
    episodes: 8,
    status: "Completed",
    genres: ["Action", "Fantasy", "Historical", "Shounen"],
    description: "Tanjiro goes to see the Stone Hashira, Himejima, who intends to prepare him for the battles to come. The training to become a Hashira—a high-ranking member of the Demon Slayer Corps—is intense and demanding."
  },
  {
    id: "2",
    title: "Kaiju No. 8",
    image: "https://gogocdn.net/cover/kaijuu-8-gou.png",
    banner: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200",
    rating: 8.4,
    type: "TV",
    episodes: 12,
    status: "Completed",
    genres: ["Action", "Sci-Fi", "Military", "Shounen"],
    description: "A man working a job far-removed from his childhood dreams gets swept up in an unexpected situation. After turning into a Kaiju, he aims once again to fulfill his life-long dream."
  },
  {
    id: "3",
    title: "Solo Leveling",
    image: "https://gogocdn.net/cover/ore-dake-level-up-na-ken.png",
    banner: "https://images.unsplash.com/photo-1560942485-b2a11cc13456?q=80&w=1200",
    rating: 8.7,
    type: "TV",
    episodes: 12,
    status: "Completed",
    genres: ["Action", "Adventure", "Fantasy"],
    description: "In a world where hunters must battle deadly monsters to protect mankind, Sung Jinwoo, the weakest hunter of all mankind, finds himself in a struggle for survival, leading to a mysterious system upgrade."
  },
  {
    id: "4",
    title: "Jujutsu Kaisen Season 2",
    image: "https://gogocdn.net/cover/jujutsu-kaisen-2nd-season.png",
    banner: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200",
    rating: 9.0,
    type: "TV",
    episodes: 23,
    status: "Completed",
    genres: ["Action", "Fantasy", "School", "Shounen"],
    description: "The past comes to light as Gojo Satoru and Geto Suguru's school days are revealed, leading to the devastating events of the Shibuya Incident."
  }
];
