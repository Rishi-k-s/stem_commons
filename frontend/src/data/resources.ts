/**
 * ─────────────────────────────────────────────────────────────
 *  MOCK RESOURCE DATA — single source of truth
 *  Used by ResourcesPage (list) and ResourceDetail (single view).
 *  Replace this module with an API client in Phase 2.
 * ─────────────────────────────────────────────────────────────
 */

export type ResourceType = "Makerspace" | "ATAL Lab" | "Vendor";

export type ResourceStatus =
  | "Working"
  | "Planned"
  | "Temporarily Closed"
  | "Permanently Closed";

export interface Resource {
  id: number;
  name: string;
  type: ResourceType;
  city: string;
  state: string;
  status: ResourceStatus;
  description: string;
  contact: string;
  phone: string;
  website: string;
  facilities: string[];
}

export const RESOURCE_TYPES: ResourceType[] = [
  "Makerspace",
  "ATAL Lab",
  "Vendor",
];

export const RESOURCE_STATUSES: ResourceStatus[] = [
  "Working",
  "Planned",
  "Temporarily Closed",
  "Permanently Closed",
];

/** Maps a resource status to a Badge variant. */
export function statusVariant(
  status: ResourceStatus
): "success" | "warning" | "error" | "info" | "neutral" {
  switch (status) {
    case "Working":
      return "success";
    case "Planned":
      return "info";
    case "Temporarily Closed":
      return "warning";
    case "Permanently Closed":
      return "error";
    default:
      return "neutral";
  }
}

export const resources: Resource[] = [
  {
    id: 1,
    name: "FabLab IIT Delhi",
    type: "Makerspace",
    city: "New Delhi",
    state: "Delhi",
    status: "Working",
    description:
      "A comprehensive makerspace with state-of-the-art equipment and facilities for prototyping and design. Open to students, researchers, and the wider innovation community.",
    contact: "fablab@iitd.ac.in",
    phone: "+91-11-2659-1234",
    website: "https://fablab.iitd.ac.in",
    facilities: ["3D Printing", "Laser Cutting", "CNC Machines", "Electronics Lab"],
  },
  {
    id: 2,
    name: "ATAL Tinkering Lab — KV No. 1",
    type: "ATAL Lab",
    city: "Mumbai",
    state: "Maharashtra",
    status: "Working",
    description:
      "ATAL Tinkering Lab focusing on innovation and entrepreneurship for young innovators. Equipped for robotics, electronics, and rapid prototyping projects.",
    contact: "atl.kv1mum@gov.in",
    phone: "+91-22-1234-5678",
    website: "https://atl.gov.in",
    facilities: ["Robotics", "Electronics Lab", "3D Printing"],
  },
  {
    id: 3,
    name: "Tinkerers' Paradise",
    type: "Makerspace",
    city: "Bangalore",
    state: "Karnataka",
    status: "Working",
    description:
      "Community-run makerspace offering shared access to fabrication tools, workshops, and a collaborative environment for hobbyists and startups alike.",
    contact: "hello@tinkerersparadise.in",
    phone: "+91-80-4567-8910",
    website: "https://tinkerersparadise.in",
    facilities: ["3D Printing", "Wood Workshop", "Electronics Lab", "Laser Cutting"],
  },
  {
    id: 4,
    name: "STEM Ventures India",
    type: "Vendor",
    city: "Pune",
    state: "Maharashtra",
    status: "Working",
    description:
      "Supplier of STEM lab equipment, robotics kits, and classroom learning solutions for schools and institutions across India.",
    contact: "sales@stemventures.in",
    phone: "+91-20-2345-6789",
    website: "https://stemventures.in",
    facilities: ["Robotics", "Electronics Lab", "Testing Equipment"],
  },
  {
    id: 5,
    name: "ATAL Innovation Centre Chennai",
    type: "ATAL Lab",
    city: "Chennai",
    state: "Tamil Nadu",
    status: "Working",
    description:
      "Innovation centre nurturing early-stage hardware startups with mentorship, prototyping facilities, and incubation support.",
    contact: "info@aicchennai.org",
    phone: "+91-44-3456-7890",
    website: "https://aicchennai.org",
    facilities: ["3D Printing", "PCB Fabrication", "Electronics Lab", "VR/AR Equipment"],
  },
  {
    id: 6,
    name: "Maker's Asylum",
    type: "Makerspace",
    city: "Mumbai",
    state: "Maharashtra",
    status: "Working",
    description:
      "A hands-on innovation space running fellowships, bootcamps, and open lab hours focused on solving real-world problems through making.",
    contact: "connect@makersasylum.com",
    phone: "+91-22-9876-5432",
    website: "https://makersasylum.com",
    facilities: ["Laser Cutting", "CNC Machines", "Metal Workshop", "Wood Workshop"],
  },
  {
    id: 7,
    name: "ATAL Tinkering Lab — Govt. School Jaipur",
    type: "ATAL Lab",
    city: "Jaipur",
    state: "Rajasthan",
    status: "Planned",
    description:
      "An upcoming ATAL Tinkering Lab set to bring hands-on STEM learning to government school students in the region.",
    contact: "atl.jaipur@gov.in",
    phone: "+91-141-2233-4455",
    website: "https://atl.gov.in",
    facilities: ["Robotics", "Electronics Lab"],
  },
  {
    id: 8,
    name: "Hyderabad Hardware Hub",
    type: "Makerspace",
    city: "Hyderabad",
    state: "Telangana",
    status: "Temporarily Closed",
    description:
      "A fabrication-focused makerspace currently closed for facility upgrades. Reopening planned with expanded CNC and PCB capabilities.",
    contact: "team@hwhub.in",
    phone: "+91-40-6677-8899",
    website: "https://hwhub.in",
    facilities: ["CNC Machines", "PCB Fabrication", "3D Printing"],
  },
  {
    id: 9,
    name: "EduTech Instruments Pvt. Ltd.",
    type: "Vendor",
    city: "Ahmedabad",
    state: "Gujarat",
    status: "Working",
    description:
      "Manufacturer and distributor of laboratory instruments and STEM teaching aids for educational institutions.",
    contact: "support@edutechinstruments.com",
    phone: "+91-79-5566-7788",
    website: "https://edutechinstruments.com",
    facilities: ["Testing Equipment", "Electronics Lab"],
  },
  {
    id: 10,
    name: "Kolkata Robotics Lab",
    type: "Makerspace",
    city: "Kolkata",
    state: "West Bengal",
    status: "Permanently Closed",
    description:
      "A former community robotics lab that has ceased operations. Listing retained for historical reference.",
    contact: "archive@kolkatarobotics.in",
    phone: "+91-33-1122-3344",
    website: "https://kolkatarobotics.in",
    facilities: ["Robotics", "Electronics Lab"],
  },
];

/** Look up a single resource by its id. Returns undefined if not found. */
export function getResource(id: number): Resource | undefined {
  return resources.find((r) => r.id === id);
}
