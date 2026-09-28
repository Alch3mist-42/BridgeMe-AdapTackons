export type Match = {
  id: string;
  title: string;
  business: string;
  area: string;
  skills: string[];
  fitScore: number; // 0-100
  why: string;
  travelMinutes: number;
  travelMode: "walk" | "taxi" | "bus";
  monthlyTravelCost: number; // rand
  monthlyStipend: number; // rand
};

export const fakeMatches: Match[] = [
  {
    id: "1",
    title: "Kitchen & Admin Assistant",
    business: "Sunrise Bakery",
    area: "Soweto",
    skills: ["Customer service", "Basic accounting"],
    fitScore: 91,
    why: "Matches your customer service and Excel skills; the owner needs help with orders and stock.",
    travelMinutes: 35,
    travelMode: "taxi",
    monthlyTravelCost: 640,
    monthlyStipend: 4500,
  },
  {
    id: "2",
    title: "Social Media Intern",
    business: "Bright Print Studio",
    area: "Randburg",
    skills: ["Content creation", "Canva"],
    fitScore: 78,
    why: "You listed design and social media; they need someone to run their Instagram.",
    travelMinutes: 75,
    travelMode: "taxi",
    monthlyTravelCost: 1900,
    monthlyStipend: 4500,
  },
];