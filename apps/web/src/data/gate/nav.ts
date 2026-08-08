export type GateNavBranch = { label: string; href: string };

/** GATE branches shown in nav dropdowns (desktop mega-nav + mobile sheet). */
export const GATE_NAV_BRANCHES: GateNavBranch[] = [
  { label: "Mining Engineering (MN)", href: "/gate/mining" },
  { label: "Civil Engineering (CE)", href: "/gate/civil" },
  { label: "Geology and Geophysics (GG)", href: "/gate/geology" },
  { label: "Environmental Science and Engineering (ES)", href: "/gate/environment" },
  { label: "Geomatics Engineering (GE)", href: "/gate/geomatics" },
  { label: "Textile Engineering and Fibre Science (TF)", href: "/gate/textile" },
  { label: "Life Sciences (XL)", href: "/gate/life-sciences" },
  { label: "Ecology and Evolution (EY)", href: "/gate/ecology" },
  { label: "Agricultural Engineering (AG)", href: "/gate/agricultural" },
];
