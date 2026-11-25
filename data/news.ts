export type NewsItem = {
  date: string;
  title: string;
  caption: string;
  image: string;
  images: string[];
  galleryCount: number;
  slug?: string;
  cta?: { label: string; href: string };
};

export const news: NewsItem[] = [
  {
    date: "2026-November-20",
    title: "Stüssy Archive Seattle",
    caption:
      "Stüssy Archive Seattle\n1526 Bellevue Ave Seattle Washington 98122 USA\nNovember 27th - December 6th",
    images: ["/editorial/news/stussy-archive-seattle/001.jpg"],
    image: "/editorial/news-1.jpg",
    galleryCount: 1,
    slug: "stussy-archive-seattle",
  },
  {
    date: "2026-November-13",
    title: "",
    caption:
      "MIDWEIGHT HOODED PUFFERS & MICRO RIPSTOP DOWN JACKETS\nSTUSSY NYC\nPHOTOGRAPHY: ISAAC GOMEZ",
    images: [
      "/editorial/news/midweight-hooded-puffers/001.jpg",
      "/editorial/news/midweight-hooded-puffers/002.jpg",
    ],
    image: "/editorial/news-2.jpg",
    galleryCount: 2,
  },
  {
    date: "2026-November-06",
    title: "",
    caption: "Holiday '26 Collection\nDelivery TWO...",
    images: [
      "/editorial/news/holiday-26-collection/001.jpg",
      "/editorial/news/holiday-26-collection/002.jpg",
      "/editorial/news/holiday-26-collection/003.jpg",
      "/editorial/news/holiday-26-collection/004.jpg",
      "/editorial/news/holiday-26-collection/005.jpg",
      "/editorial/news/holiday-26-collection/006.jpg",
      "/editorial/news/holiday-26-collection/007.jpg",
      "/editorial/news/holiday-26-collection/008.jpg",
      "/editorial/news/holiday-26-collection/009.jpg",
      "/editorial/news/holiday-26-collection/010.jpg",
      "/editorial/news/holiday-26-collection/011.jpg",
      "/editorial/news/holiday-26-collection/012.jpg",
      "/editorial/news/holiday-26-collection/013.jpg",
      "/editorial/news/holiday-26-collection/014.jpg",
      "/editorial/news/holiday-26-collection/015.jpg",
      "/editorial/news/holiday-26-collection/016.jpg",
      "/editorial/news/holiday-26-collection/017.jpg",
      "/editorial/news/holiday-26-collection/018.jpg",
      "/editorial/news/holiday-26-collection/019.jpg",
      "/editorial/news/holiday-26-collection/020.jpg",
      "/editorial/news/holiday-26-collection/021.jpg",
      "/editorial/news/holiday-26-collection/022.jpg",
      "/editorial/news/holiday-26-collection/023.jpg",
      "/editorial/news/holiday-26-collection/024.jpg",
    ],
    image: "/editorial/news-3.jpg",
    galleryCount: 24,
    cta: { label: "Check New Arrivals", href: "/collections/new-arrivals" },
  },
  {
    date: "2026-November-05",
    title: "Sara in iceland",
    caption: "Sara in iceland...",
    images: [
      "/editorial/news/sara-in-iceland/001.jpg",
      "/editorial/news/sara-in-iceland/002.jpg",
      "/editorial/news/sara-in-iceland/003.jpg",
      "/editorial/news/sara-in-iceland/004.jpg",
      "/editorial/news/sara-in-iceland/005.jpg",
    ],
    image: "/editorial/news-4.jpg",
    galleryCount: 5,
    slug: "sara-in-iceland",
  },
  {
    date: "2026-November-03",
    title: "Holiday '26 Delivery Two",
    caption:
      "HOLIDAY ‘26 DELIVERY TWO...\nAVAILABLE FRIDAY NOVEMBER 6TH\nPHOTOGRAPHER: BAILEY BECKSTEAD\nSTYLIST: LANDON EBELING\nCAST: NOAH, LUISA, CYD, HANK",
    images: [
      "/editorial/news/holiday-26-delivery-two/001.jpg",
      "/editorial/news/holiday-26-delivery-two/002.jpg",
      "/editorial/news/holiday-26-delivery-two/003.jpg",
      "/editorial/news/holiday-26-delivery-two/004.jpg",
      "/editorial/news/holiday-26-delivery-two/005.jpg",
    ],
    image: "/editorial/news-5.jpg",
    galleryCount: 5,
    slug: "holiday-26-delivery-two",
  },
];

export function getNewsBySlug(slug: string) {
  return news.find((item) => item.slug === slug) ?? null;
}
