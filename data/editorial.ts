export type Chapter = {
  name: string;
  address: string;
  slug: string;
  image: string;
  gallery: string[];
};

export type ChapterIndexEntry = { name: string; address: string; slug: string };

export type ChapterPage = {
  phone?: string;
  email?: string;
  openingHours: string[];
  gallery: string[];
};

function chapterGallery(slug: string, count: number) {
  return Array.from(
    { length: count },
    (_, index) =>
      `/editorial/chapters/${slug}/${String(index + 1).padStart(3, "0")}.jpg`,
  );
}

export const chapters: Chapter[] = [
  {
    name: "St\u00fcssy Toronto",
    address: "241 Spadina Avenue #100A Toronto, ON M5T 3A8, Canada",
    image: "/editorial/chapter-1.jpg",
    slug: "stussy-toronto",
    gallery: chapterGallery("stussy-toronto", 3),
  },
  {
    name: "St\u00fcssy Los Angeles",
    address: "112 South La Brea Avenue Los Angeles, CA 90036",
    image: "/editorial/chapter-2.jpg",
    slug: "stussy-los-angeles",
    gallery: chapterGallery("stussy-los-angeles", 4),
  },
  {
    name: "St\u00fcssy London",
    address: "115 Wardour St, London W1F 0UN, United Kingdom\n115 Wardour St\nLondon W1F 0UN",
    image: "/editorial/chapter-3.webp",
    slug: "stussy-london",
    gallery: chapterGallery("stussy-london", 5),
  },
  {
    name: "St\u00fcssy Seoul",
    address: "78, Apgujeong-ro 46-gil, Gangnam-gu, Seoul\n78, Apgujeong-ro 46-gil\nGangnam-gu, Seoul",
    image: "/editorial/chapter-4.webp",
    slug: "stussy-seoul",
    gallery: chapterGallery("stussy-seoul", 7),
  },
  {
    name: "St\u00fcssy New York",
    address: "50 Prince Street New York, NY 10012",
    image: "/editorial/chapter-5.webp",
    slug: "stussy-new-york",
    gallery: chapterGallery("stussy-new-york", 5),
  },
  {
    name: "St\u00fcssy Biarritz",
    address: "1 Av. de Verdun 64200 Biarritz, France\n1 Av. de Verdun\n64200 Biarritz, France",
    image: "/editorial/chapter-6.jpg",
    slug: "stussy-biarritz",
    gallery: chapterGallery("stussy-biarritz", 6),
  },
];

export const chapterIndex: ChapterIndexEntry[] = [
  {
    name: "St\u00fcssy Amsterdam",
    slug: "stussy-amsterdam",
    address: "Zeedijk 22, 1012 AZ\nAmsterdam, Netherlands",
  },
  {
    name: "St\u00fcssy Bangkok",
    slug: "stussy-bangkok",
    address: "Central Embassy,\nLevel 2, Ploenchit Road, Pathumwan,\nBangkok 10330 Thailand",
  },
  {
    name: "St\u00fcssy Chengdu",
    slug: "stussy-chengdu",
    address: "Building 5, Citang Street,\nQingyang District Chengdu City, Sichuan Province, China",
  },
  {
    name: "St\u00fcssy Beijing",
    slug: "stussy-beijing",
    address: "S1-16 & S1-18\nTaikoo Li Sanlitun South Chaoyang District, Beijing",
  },
  {
    name: "St\u00fcssy Fukuoka",
    slug: "stussy-fukuoka",
    address: "2-5-13 Tenjin, Chuo-ku, Fukuoka-shi\nFukuoka 810-0001,\u00a0Japan",
  },
  {
    name: "St\u00fcssy Guam",
    slug: "stussy-guam",
    address: "1275 Pale San Vitores Road\nSuite 169\nTumon Bay, Guam 96913",
  },
  {
    name: "St\u00fcssy Harajuku",
    slug: "stussy-harajuku",
    address: "4-28-2 Jingumae, Shibuya-ku\nTokyo 150-0001,\u00a0Japan",
  },
  {
    name: "St\u00fcssy Hong Kong",
    slug: "stussy-hong-kong-store",
    address: "9 Pak Sha\u00a0Road\nCauseway Bay, Hong Kong",
  },
  {
    name: "St\u00fcssy Honolulu",
    slug: "stussy-honolulu",
    address: "2233 Kalakaua Ave\nHonolulu, HI 96815",
  },
  {
    name: "St\u00fcssy Kyoto",
    slug: "stussy-kyoto",
    address: "25 Nakanocho, Higashiiru\nTominokoji, Sanjo-Dori, Nakagyo-Ku,\nKyoto 604-8083, Japan",
  },
  {
    name: "St\u00fcssy Madrid",
    slug: "stussy-madrid",
    address: "C.Argensola 10\nMadrid, Spain 28004",
  },
  {
    name: "St\u00fcssy Margate",
    slug: "stussy-archive-margate",
    address: "18 Marine Gardens,\nMargate CT9 1UH, United Kingdom",
  },
  {
    name: "St\u00fcssy Milan",
    slug: "stussy-milan",
    address: "Corso Garibaldi, 12\n20100 Milano MI, Italy",
  },
  {
    name: "St\u00fcssy Nagoya",
    slug: "stussy-nagoya",
    address: "3-27-24 Sakae, Naka-Ku, Nagoya-Shi\nAichi 460-0008, Japan",
  },
  {
    name: "St\u00fcssy Osaka",
    slug: "stussy-osaka",
    address: "1-7-9 Nishishinsaibashi Chuo-ku,\u00a0Osaka 542-0086",
  },
  {
    name: "St\u00fcssy Paris",
    slug: "stussy-paris",
    address: "44 Rue Du Temple\nParis, France 75004",
  },
  {
    name: "St\u00fcssy Santa Ana",
    slug: "stussy-archive",
    address: "200 E 4th Street\nSanta Ana, CA 92701",
  },
  {
    name: "St\u00fcssy Shanghai",
    slug: "stussy-shanghai",
    address: "Xintiandi, Huangpu District,\nShanghai",
  },
  {
    name: "St\u00fcssy Shibuya",
    slug: "stussy-shibuya",
    address: "1-14-5 Jinnan, Shibuya-Ku, Tokyo 150-0041, Japan",
  },
  {
    name: "St\u00fcssy Singapore",
    slug: "stussy-singapore",
    address: "6 Scotts Road\n#01-01 Scotts Square, 228209",
  },
  {
    name: "St\u00fcssy Sydney",
    slug: "stussy-sydney",
    address: "18 Oxford Square\nDarlinghurst Nsw 2010\nAustralia",
  },
  {
    name: "St\u00fcssy Taipei",
    slug: "stussy-taipei",
    address: "No. 7, Alley 69, Lane 161,\nSection 1, Dunhua South Road\nDa'an District, Taipei City, Taiwan",
  },
  {
    name: "St\u00fcssy Toronto",
    slug: "stussy-toronto",
    address: "241 Spadina Avenue #100A\nToronto, ON M5T 3A8, Canada",
  },
  {
    name: "St\u00fcssy Vancouver",
    slug: "stussy-vancouver",
    address: "49 Powell Street\nVancouver, BC V6A 1E9",
  },
  {
    name: "DSM Ginza",
    slug: "dsm-ginza",
    address: "6 Chome-9-5 Ginza,\nChuo City, Tokyo 104-0061, Japan",
  },
  {
    name: "DSM London",
    slug: "dsm-london",
    address: "18-22 Haymarket West End\nEntrance on Orange Street\nLondon Sw1y 4dg\nUnited Kingdom",
  },
  {
    name: "DSM Los Angeles",
    slug: "dsm-los-angeles",
    address: "608 Imperial Street\nLos Angeles, CA 90021",
  },
  {
    name: "DSM New York",
    slug: "dsm-new-york",
    address: "160 Lexington Avenue\nNew York, NY 10016",
  },
  {
    name: "DSM Singapore",
    slug: "dsm-singapore",
    address: "Block 18 Dempsey Road\nSingapore 249677",
  },
];

export const chapterPages: Record<string, ChapterPage> = {
  "stussy-toronto": {
    phone: "416 537 9600",
    email: "toronto@stussy.com",
    openingHours: ["MONDAY - SATURDAY", "11AM - 7PM", "SUNDAY", "12PM - 6PM"],
    gallery: chapterGallery("stussy-toronto", 3),
  },
  "stussy-los-angeles": {
    phone: "323 933 2251",
    email: "losangeles@stussy.com",
    openingHours: ["MONDAY - SATURDAY", "11AM - 7PM", "SUNDAY", "12PM - 6PM"],
    gallery: chapterGallery("stussy-los-angeles", 4),
  },
  "stussy-london": {
    phone: "020 7287 8400",
    email: "london@stussy.com",
    openingHours: ["MONDAY - SATURDAY", "11AM - 7PM", "SUNDAY", "12PM - 6PM"],
    gallery: chapterGallery("stussy-london", 5),
  },
  "stussy-seoul": {
    phone: "02 6204 2550",
    email: "seoul@stussy.com",
    openingHours: ["MONDAY - SUNDAY", "11AM - 8PM"],
    gallery: chapterGallery("stussy-seoul", 7),
  },
  "stussy-new-york": {
    phone: "646 360 4788",
    email: "newyork@stussy.com",
    openingHours: ["MONDAY - SATURDAY 11AM - 7PM", "SUNDAY 12PM - 6PM"],
    gallery: chapterGallery("stussy-new-york", 5),
  },
  "stussy-biarritz": {
    openingHours: ["MONDAY - SATURDAY / LUNDI - SAMEDI", "11:00-19:00", "SUNDAY / DIMANCHE", "11:00-17:00"],
    gallery: chapterGallery("stussy-biarritz", 6),
  },
  "stussy-amsterdam": {
    phone: "+31 20 280 1378",
    email: "amsterdam@stussy.com",
    openingHours: ["MONDAY - SATURDAY", "11AM - 7PM", "SUNDAY", "12PM - 6PM"],
    gallery: chapterGallery("stussy-amsterdam", 5),
  },
  "stussy-bangkok": {
    email: "bangkok@stussy.com",
    openingHours: ["MONDAY - SUNDAY", "10AM - 9PM"],
    gallery: chapterGallery("stussy-bangkok", 4),
  },
  "stussy-chengdu": {
    email: "chengdu@stussy.com",
    openingHours: ["MONDAY - SUNDAY", "10AM - 10PM"],
    gallery: chapterGallery("stussy-chengdu", 6),
  },
  "stussy-beijing": {
    email: "beijing@stussy.com",
    openingHours: ["MONDAY - SUNDAY", "9AM - 11PM"],
    gallery: chapterGallery("stussy-beijing", 5),
  },
  "stussy-fukuoka": {
    openingHours: ["MONDAY - SUNDAY", "11AM - 7PM"],
    gallery: chapterGallery("stussy-fukuoka", 1),
  },
  "stussy-guam": {
    phone: "671 648 7887",
    email: "guam@stussy.com",
    openingHours: ["MONDAY - SUNDAY", "10AM - 9PM"],
    gallery: chapterGallery("stussy-guam", 5),
  },
  "stussy-harajuku": {
    phone: "+81 3 3479 6432",
    openingHours: ["MONDAY - SUNDAY", "11AM - 7PM"],
    gallery: chapterGallery("stussy-harajuku", 3),
  },
  "stussy-hong-kong-store": {
    phone: "+852 3622 2456",
    email: "hongkong@stussy.com",
    openingHours: ["CONTACT THE STORE DIRECTLY FOR STORE HOURS."],
    gallery: chapterGallery("stussy-hong-kong-store", 4),
  },
  "stussy-honolulu": {
    phone: "808 744 3880",
    email: "honolulu@stussy.com",
    openingHours: ["MONDAY - SUNDAY", "10AM - 9PM"],
    gallery: chapterGallery("stussy-honolulu", 7),
  },
  "stussy-kyoto": {
    phone: "+81 75 253 1350",
    email: "kyoto@stussy.com",
    openingHours: ["MONDAY - SUNDAY", "11AM - 7PM"],
    gallery: chapterGallery("stussy-kyoto", 5),
  },
  "stussy-madrid": {
    phone: "34 91 3084948",
    email: "madrid@stussy.com",
    openingHours: ["MONDAY - SATURDAY", "11 AM - 8:30 PM", "SUNDAY", "12:30 PM - 7 PM"],
    gallery: chapterGallery("stussy-madrid", 4),
  },
  "stussy-archive-margate": {
    phone: "+44 1843 260666",
    openingHours: ["MONDAY - SUNDAY", "11AM - 5PM"],
    gallery: chapterGallery("stussy-archive-margate", 6),
  },
  "stussy-milan": {
    phone: "+39 02 839 4279",
    email: "milano@stussy.com",
    openingHours: ["MONDAY - SATURDAY", "11AM - 7:30PM", "SUNDAY", "12PM - 7PM"],
    gallery: chapterGallery("stussy-milan", 5),
  },
  "stussy-nagoya": {
    phone: "+81 52 263 0663",
    email: "nagoya@stussy.com",
    openingHours: ["MONDAY - SUNDAY", "11AM - 7PM"],
    gallery: chapterGallery("stussy-nagoya", 4),
  },
  "stussy-osaka": {
    phone: "+81 6 6282 1517",
    email: "osaka@stussy.com",
    openingHours: ["MONDAY - SUNDAY", "11AM - 7PM"],
    gallery: chapterGallery("stussy-osaka", 5),
  },
  "stussy-paris": {
    phone: "+33 1 42 72 34 13",
    email: "paris@stussy.com",
    openingHours: ["MONDAY - SATURDAY", "11AM - 7:30PM", "SUNDAY", "2PM - 7PM"],
    gallery: chapterGallery("stussy-paris", 5),
  },
  "stussy-archive": {
    phone: "714 760 4812",
    email: "stussyarchive@stussy.com",
    openingHours: ["MONDAY - SUNDAY", "12PM - 6PM"],
    gallery: chapterGallery("stussy-archive", 6),
  },
  "stussy-shanghai": {
    phone: "86 21 6330 6963",
    email: "shanghai@stussy.com",
    openingHours: ["MONDAY - SUNDAY", "10AM - 11PM"],
    gallery: chapterGallery("stussy-shanghai", 6),
  },
  "stussy-shibuya": {
    phone: "+81 3 6455 3557",
    email: "shibuya@stussy.com",
    openingHours: ["MONDAY - SUNDAY", "11AM - 7PM"],
    gallery: chapterGallery("stussy-shibuya", 3),
  },
  "stussy-singapore": {
    phone: "+65 6539 9522",
    email: "singapore@stussy.com",
    openingHours: ["MONDAY - SUNDAY", "11AM - 9PM"],
    gallery: chapterGallery("stussy-singapore", 3),
  },
  "stussy-sydney": {
    phone: "+61 427 642 362",
    email: "sydney@stussy.com",
    openingHours: ["MONDAY - FRIDAY", "11AM - 6PM", "SATURDAY - SUNDAY", "12PM - 5PM"],
    gallery: chapterGallery("stussy-sydney", 2),
  },
  "stussy-taipei": {
    phone: "+886 2 2751 2651",
    email: "taipei@stussy.com",
    openingHours: ["MONDAY - SUNDAY", "1:30PM - 10PM"],
    gallery: chapterGallery("stussy-taipei", 7),
  },
  "stussy-vancouver": {
    phone: "604 681 4557",
    email: "vancouver@stussy.com",
    openingHours: ["MONDAY - SATURDAY", "11AM - 7PM", "SUNDAY", "12PM - 6PM"],
    gallery: chapterGallery("stussy-vancouver", 4),
  },
  "dsm-ginza": {
    phone: "+81 3 6228 5080",
    openingHours: ["MONDAY - SUNDAY", "11AM - 8PM"],
    gallery: chapterGallery("dsm-ginza", 4),
  },
  "dsm-london": {
    phone: "+44 20 7518 0680",
    email: "e-shop@doverstreetmarket.com",
    openingHours: ["MONDAY - SATURDAY", "11AM - 7PM", "SUNDAY", "12PM - 6PM"],
    gallery: chapterGallery("dsm-london", 1),
  },
  "dsm-los-angeles": {
    phone: "310 427 7610",
    email: "info@dsm-la.com",
    openingHours: ["MONDAY - SATURDAY", "11AM - 6PM", "SUNDAY", "12PM - 6PM"],
    gallery: chapterGallery("dsm-los-angeles", 2),
  },
  "dsm-new-york": {
    phone: "646 837 7750",
    email: "info@dsm-ny.com",
    openingHours: ["MONDAY - WEDNESDAY", "11AM - 6PM", "THURSDAY - SATURDAY", "11AM - 7PM", "SUNDAY", "12PM - 6PM"],
    gallery: chapterGallery("dsm-new-york", 1),
  },
  "dsm-singapore": {
    phone: "+65 3129 4323",
    email: "customerservice@dsm-sg.com",
    openingHours: ["MONDAY - SUNDAY", "11AM - 8PM"],
    gallery: chapterGallery("dsm-singapore", 2),
  },
};
