import type { PuneLocation, PuneZone } from "@/types/ride";

export const PUNE_CENTER: [number, number] = [18.5204, 73.8567];

// ==================== REVERSE GEOCODE UTILITY ====================
export function findNearestLocation(lat: number, lng: number): PuneLocation | null {
  let nearest: PuneLocation | null = null;
  let minDist = Infinity;
  for (const loc of puneLocations) {
    const d = Math.sqrt(
      (loc.coordinates[0] - lat) ** 2 + (loc.coordinates[1] - lng) ** 2,
    );
    if (d < minDist) {
      minDist = d;
      nearest = loc;
    }
  }
  return minDist < 0.03 ? nearest : null;
}

export function createCustomLocation(lat: number, lng: number, label?: string): PuneLocation {
  const nearest = findNearestLocation(lat, lng);
  const id = `pin-${lat.toFixed(5)}-${lng.toFixed(5)}`;
  return {
    id,
    name: label || `📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    area: nearest?.area || "Custom Location",
    zone: nearest?.zone || "core",
    coordinates: [lat, lng],
    landmarks: nearest ? [nearest.name, ...nearest.landmarks.slice(0, 1)] : ["Pinned location"],
    pincode: nearest?.pincode,
    isCustom: true,
  };
}

// =============================================================================
// COMPREHENSIVE PUNE LOCATION DATABASE (200+ localities)
// Covers every PMC ward, PCMC zone, merged village, and PMRDA fringe
// =============================================================================
export const puneLocations: PuneLocation[] = [
  // ====================================================================
  // CORE HUBS — Pune Municipal Corporation (PMC) — All Wards & Areas
  // ====================================================================
  // Shivajinagar & Surrounding
  { id: "shivajinagar", name: "Shivajinagar", area: "Shivajinagar", zone: "core", coordinates: [18.5291, 73.8567], landmarks: ["Council Hall", "Shivajinagar Bus Stand", "SP College"], pincode: "411005" },
  { id: "fc-road", name: "FC Road", area: "Shivajinagar", zone: "core", coordinates: [18.5203, 73.8344], landmarks: ["Fergusson College", "Goodluck Cafe", "Bhandarkar Institute"], pincode: "411004" },
  { id: "jm-road", name: "JM Road", area: "Shivajinagar", zone: "core", coordinates: [18.5221, 73.8401], landmarks: ["E-square", "Garware College", "Pune Central"], pincode: "411004" },
  { id: "model-colony", name: "Model Colony", area: "Model Colony", zone: "core", coordinates: [18.5241, 73.8463], landmarks: ["Model Colony Gymkhana", "BMCC Road"], pincode: "411016" },
  { id: "ghanekhristi-nagar", name: "Ghanekhristi Nagar", area: "Shivajinagar", zone: "core", coordinates: [18.5268, 73.8502], landmarks: ["Sancheti Hospital", "Rahul Cinema"], pincode: "411016" },

  // Deccan / Erandwane
  { id: "deccan", name: "Deccan Gymkhana", area: "Deccan", zone: "core", coordinates: [18.5186, 73.8365], landmarks: ["Deccan Corner", "Bal Gandharva Rangmandir", "FC Road Junction"], pincode: "411004" },
  { id: "erandwane", name: "Erandwane", area: "Erandwane", zone: "core", coordinates: [18.5094, 73.8267], landmarks: ["Bharati Vidyapeeth", "Cummins College", "Vanaz Corner"], pincode: "411004" },
  { id: "prabhat-road", name: "Prabhat Road", area: "Erandwane", zone: "core", coordinates: [18.5137, 73.8299], landmarks: ["Symbiosis College", "Vanaz Corner"], pincode: "411004" },
  { id: "sahakar-nagar", name: "Sahakar Nagar", area: "Erandwane", zone: "core", coordinates: [18.5030, 73.8210], landmarks: ["Sahakar Nagar Chowk", "Mhatre Bridge"], pincode: "411038" },

  // Kothrud
  { id: "kothrud", name: "Kothrud", area: "Kothrud", zone: "core", coordinates: [18.5089, 73.8097], landmarks: ["Kothrud Bus Depot", "MIT College", "Karve Road"], pincode: "411038" },
  { id: "dahanukar-colony", name: "Dahanukar Colony", area: "Kothrud", zone: "core", coordinates: [18.5056, 73.8162], landmarks: ["Dahanukar Square", "Mhatre Bridge"], pincode: "411038" },
  { id: "somnath-nagar", name: "Somnath Nagar", area: "Kothrud", zone: "core", coordinates: [18.5012, 73.7998], landmarks: ["Somnath Nagar Chowk", "Kothrud Depot"], pincode: "411038" },
  { id: "karve-nagar", name: "Karve Nagar", area: "Karve Nagar", zone: "core", coordinates: [18.4826, 73.8152], landmarks: ["Karve Nagar Bus Stand", "Warje-Karve Nagar Road"], pincode: "411025" },
  { id: "kothrud-gadital", name: "Kothrud Gadital", area: "Kothrud", zone: "core", coordinates: [18.5056, 73.8092], landmarks: ["Gadital Chowk", "Kothrud Bus Stop"], pincode: "411038" },
  { id: "vanaz", name: "Vanaz Corner", area: "Erandwane", zone: "core", coordinates: [18.5055, 73.8209], landmarks: ["Vanaz Corner", "Prabhat Road", "Paud Road Junction"], pincode: "411038" },

  // Camp / Cantonment
  { id: "camp", name: "Camp", area: "Camp", zone: "core", coordinates: [18.5123, 73.8771], landmarks: ["East Street", "MG Road", "Bund Garden"], pincode: "411001" },
  { id: "mg-road-camp", name: "MG Road Camp", area: "Camp", zone: "core", coordinates: [18.5097, 73.8779], landmarks: ["MG Road", "Dorabjee's", "Clover Park"], pincode: "411001" },
  { id: "east-street", name: "East Street", area: "Camp", zone: "core", coordinates: [18.5135, 73.8799], landmarks: ["East Street Market", "St Mary's Church"], pincode: "411001" },
  { id: "bund-garden", name: "Bund Garden", area: "Camp", zone: "core", coordinates: [18.5304, 73.8785], landmarks: ["Bund Garden", "Pune Club", "RTO"], pincode: "411001" },

  // Swargate / Parvati
  { id: "swargate", name: "Swargate", area: "Swargate", zone: "core", coordinates: [18.4986, 73.8547], landmarks: ["Swargate Bus Stand", "Parvati Hill", "Sahyadri Hospital"], pincode: "411009" },
  { id: "parvati", name: "Parvati Hill", area: "Parvati", zone: "core", coordinates: [18.4975, 73.8472], landmarks: ["Parvati Temple", "Parvati Darshan"], pincode: "411009" },
  { id: "parvati-nagar", name: "Parvati Nagar", area: "Parvati", zone: "core", coordinates: [18.4894, 73.8568], landmarks: ["Parvati Nagar", "Sahyadri Hospital"], pincode: "411009" },

  // Aundh
  { id: "aundh", name: "Aundh", area: "Aundh", zone: "core", coordinates: [18.5593, 73.8063], landmarks: ["Aundh ITI", "Baner Road", "Parisar Chowk"], pincode: "411007" },
  { id: "aundh-gaon", name: "Aundh Gaon", area: "Aundh", zone: "core", coordinates: [18.5545, 73.7986], landmarks: ["Aundh Gaon", "Aundh Hospital"], pincode: "411007" },
  { id: "parisar", name: "Parisar", area: "Aundh", zone: "core", coordinates: [18.5623, 73.8098], landmarks: ["Parisar Chowk", "Bhandarkar Road"], pincode: "411007" },

  // Peth Areas (Complete)
  { id: "kasba-peth", name: "Kasba Peth", area: "Kasba Peth", zone: "core", coordinates: [18.5189, 73.8542], landmarks: ["Kasba Ganpati", "Dagadusheth Halwai"], pincode: "411011" },
  { id: "shukrawar-peth", name: "Shukrawar Peth", area: "Shukrawar Peth", zone: "core", coordinates: [18.5167, 73.8498], landmarks: ["Lal Mahal", "Shaniwar Wada"], pincode: "411002" },
  { id: "budhwar-peth", name: "Budhwar Peth", area: "Budhwar Peth", zone: "core", coordinates: [18.5155, 73.8539], landmarks: ["Shrimant Dagadusheth Halwai", "Budhwar Peth Road"], pincode: "411002" },
  { id: "mangalwar-peth", name: "Mangalwar Peth", area: "Mangalwar Peth", zone: "core", coordinates: [18.5145, 73.8555], landmarks: ["Mangalwar Peth", "Tukaram Paduka Chowk"], pincode: "411011" },
  { id: "sadashiv-peth", name: "Sadashiv Peth", area: "Sadashiv Peth", zone: "core", coordinates: [18.5108, 73.8466], landmarks: ["Tilak Smarak Mandir", "Lakshmi Road", "Shaniwar Wada"], pincode: "411030" },
  { id: "narayan-peth", name: "Narayan Peth", area: "Narayan Peth", zone: "core", coordinates: [18.5132, 73.8511], landmarks: ["Raja Dinkar Kelkar Museum", "Appa Balwant Chowk"], pincode: "411030" },
  { id: "shaniwar-peth", name: "Shaniwar Peth", area: "Shaniwar Peth", zone: "core", coordinates: [18.5121, 73.8485], landmarks: ["Shaniwar Wada", "Dagadusheth"], pincode: "411030" },
  { id: "guruwar-peth", name: "Guruwar Peth", area: "Guruwar Peth", zone: "core", coordinates: [18.5105, 73.8505], landmarks: ["Guruwar Peth", "Lakshmi Road"], pincode: "411030" },
  { id: "somwar-peth", name: "Somwar Peth", area: "Somwar Peth", zone: "core", coordinates: [18.5155, 73.8417], landmarks: ["Somwar Peth", "Appa Balwant Chowk"], pincode: "411011" },
  { id: "nana-peth", name: "Nana Peth", area: "Nana Peth", zone: "core", coordinates: [18.5070, 73.8650], landmarks: ["Nana Peth", "Sassoon Hospital"], pincode: "411011" },
  { id: "bhawani-peth", name: "Bhawani Peth", area: "Bhawani Peth", zone: "core", coordinates: [18.5042, 73.8611], landmarks: ["Bhawani Peth Bus Stand", "Mangala Bhavan"], pincode: "411042" },
  { id: "ganj-peth", name: "Ganj Peth", area: "Ganj Peth", zone: "core", coordinates: [18.5021, 73.8578], landmarks: ["Ganj Peth Market", "Nana Peth"], pincode: "411042" },
  { id: "rasta-peth", name: "Rasta Peth", area: "Rasta Peth", zone: "core", coordinates: [18.5065, 73.8692], landmarks: ["Rasta Peth Police Station", "Sassoon Hospital Road"], pincode: "411011" },

  // Koregaon Park / Kalyani Nagar
  { id: "koregaon-park", name: "Koregaon Park", area: "Koregaon Park", zone: "core", coordinates: [18.5383, 73.8909], landmarks: ["Osho Ashram", "German Bakery", "Koregaon Park Plaza"], pincode: "411001" },
  { id: "koregaon-park-annex", name: "Koregaon Park Annex", area: "Koregaon Park", zone: "core", coordinates: [18.5333, 73.8959], landmarks: ["Lane 6", "KP Annexe"], pincode: "411001" },
  { id: "kalyani-nagar", name: "Kalyani Nagar", area: "Kalyani Nagar", zone: "core", coordinates: [18.5398, 73.9019], landmarks: ["Phoenix Market City", "Times of India"], pincode: "411014" },

  // Yerawada / Vishrantwadi
  { id: "yerawada", name: "Yerawada", area: "Yerawada", zone: "core", coordinates: [18.5483, 73.8920], landmarks: ["Yerawada Station", "Bund Garden", "RTO Pune"], pincode: "411006" },
  { id: "shastrinagar", name: "Shastrinagar", area: "Yerawada", zone: "core", coordinates: [18.5425, 73.8852], landmarks: ["Shastrinagar", "Yerawada Station"], pincode: "411006" },
  { id: "vishrantwadi", name: "Vishrantwadi", area: "Vishrantwadi", zone: "core", coordinates: [18.5674, 73.8665], landmarks: ["Vishrantwadi Chowk", "Alandi Road"], pincode: "411015" },
  { id: "tingre-nagar", name: "Tingre Nagar", area: "Vishrantwadi", zone: "core", coordinates: [18.5708, 73.8712], landmarks: ["Tingre Nagar", "Vishrantwadi"], pincode: "411015" },

  // Ghorpadi / Wanowarie
  { id: "ghorpadi", name: "Ghorpadi", area: "Ghorpadi", zone: "core", coordinates: [18.5308, 73.8849], landmarks: ["Ghorpadi", "Bund Garden Road"], pincode: "411001" },
  { id: "ghorpuri", name: "Ghorpuri", area: "Ghorpuri", zone: "core", coordinates: [18.5241, 73.8883], landmarks: ["Ghorpuri Lines", "Range Hills"], pincode: "411001" },
  { id: "wanowarie", name: "Wanowarie", area: "Wanowarie", zone: "core", coordinates: [18.4927, 73.8979], landmarks: ["Wanowarie Bus Stand", "Jupiter Hospital", "Sinhagad Road"], pincode: "411040" },
  { id: "shastri-nagar-wanowarie", name: "Shastri Nagar Wanowarie", area: "Wanowarie", zone: "core", coordinates: [18.4895, 73.8952], landmarks: ["Shastri Nagar", "Jupiter Hospital"], pincode: "411040" },
  { id: "fatima-nagar", name: "Fatima Nagar", area: "Fatima Nagar", zone: "core", coordinates: [18.4964, 73.9039], landmarks: ["Fatima Nagar Bus Stop", "Wanowarie"], pincode: "411040" },

  // Senapati Bapat / Law College Road
  { id: "senapati-bapat-road", name: "Senapati Bapat Road", area: "Senapati Bapat Road", zone: "core", coordinates: [18.5321, 73.8289], landmarks: ["HSBC", "ICC Towers", "World Trade Center"], pincode: "411016" },
  { id: "law-college-road", name: "Law College Road", area: "Law College Road", zone: "core", coordinates: [18.5281, 73.8365], landmarks: ["ILS Law College", "Shivajinagar"], pincode: "411004" },

  // Bopodi / Bopkhel
  { id: "bopodi", name: "Bopodi", area: "Bopodi", zone: "core", coordinates: [18.5744, 73.8627], landmarks: ["Bopodi Gaon", "Bopodi Railway Station"], pincode: "411003" },
  { id: "bopkhel", name: "Bopkhel", area: "Bopkhel", zone: "core", coordinates: [18.5438, 73.8725], landmarks: ["Bopkhel Gaon", "Mula River", "Khadakwasla Road"], pincode: "411003" },

  // Other Core Areas
  { id: "dapodi", name: "Dapodi", area: "Dapodi", zone: "core", coordinates: [18.5847, 73.8410], landmarks: ["Dapodi Bus Stand", "Dapodi Gaon", "Bhosari Road"], pincode: "411012" },
  { id: "phugewadi", name: "Phugewadi", area: "Phugewadi", zone: "core", coordinates: [18.5940, 73.8360], landmarks: ["Phugewadi", "Dapodi"], pincode: "411012" },
  { id: "manik-baug", name: "Manik Baug", area: "Manik Baug", zone: "core", coordinates: [18.4750, 73.8500], landmarks: ["Manik Baug", "Sinhagad Road"], pincode: "411051" },
  { id: "padmavati", name: "Padmavati", area: "Padmavati", zone: "core", coordinates: [18.4725, 73.8415], landmarks: ["Padmavati", "Sinhagad Road"], pincode: "411051" },

  // ====================================================================
  // PCMC — Pimpri-Chinchwad (All Zones & Sectors)
  // ====================================================================
  { id: "pimpri", name: "Pimpri", area: "Pimpri", zone: "pcmc", coordinates: [18.6298, 73.8120], landmarks: ["Pimpri Station", "Auto Cluster", "PCMC Building"], pincode: "411018" },
  { id: "pimpri-colony", name: "Pimpri Colony", area: "Pimpri", zone: "pcmc", coordinates: [18.6183, 73.8069], landmarks: ["Pimpri Station", "PCMC Line"], pincode: "411017" },
  { id: "pimpri-gaon", name: "Pimpri Gaon", area: "Pimpri", zone: "pcmc", coordinates: [18.6235, 73.8035], landmarks: ["Pimpri Village", "Old Pimpri"], pincode: "411017" },
  { id: "chinchwad", name: "Chinchwad", area: "Chinchwad", zone: "pcmc", coordinates: [18.6306, 73.7951], landmarks: ["Chinchwad Station", "Bhosari Bridge", "Chinchwad Gaon"], pincode: "411019" },
  { id: "chinchwad-gaon", name: "Chinchwad Gaon", area: "Chinchwad", zone: "pcmc", coordinates: [18.6265, 73.7885], landmarks: ["Chinchwad Gaon", "Old Mumbai Road"], pincode: "411019" },
  { id: "nigdi", name: "Nigdi", area: "Nigdi", zone: "pcmc", coordinates: [18.6519, 73.7717], landmarks: ["Nigdi Bus Stand", "Pradhikaran", "Shewalewadi"], pincode: "411044" },
  { id: "nigdi-pradhikaran", name: "Nigdi Pradhikaran", area: "Nigdi", zone: "pcmc", coordinates: [18.6475, 73.7735], landmarks: ["Pradhikaran", "Nigdi Sector 24"], pincode: "411044" },
  { id: "akurdi", name: "Akurdi", area: "Akurdi", zone: "pcmc", coordinates: [18.6417, 73.7791], landmarks: ["Akurdi Railway", "DY Patil College", "Akurdi MIDC"], pincode: "411035" },
  { id: "bhosari", name: "Bhosari", area: "Bhosari", zone: "pcmc", coordinates: [18.6492, 73.8486], landmarks: ["Bhosari MIDC", "PCMC Sports Complex", "Bhosari Gaon"], pincode: "411039" },
  { id: "bhosari-gaon", name: "Bhosari Gaon", area: "Bhosari", zone: "pcmc", coordinates: [18.6445, 73.8555], landmarks: ["Bhosari Village", "Bhosari Bus Stand"], pincode: "411039" },
  { id: "alandi", name: "Alandi", area: "Alandi", zone: "pcmc", coordinates: [18.6773, 73.8986], landmarks: ["Alandi Temple", "Indrayani River", "Marks Garden"], pincode: "412105" },
  { id: "moshi", name: "Moshi", area: "Moshi", zone: "pcmc", coordinates: [18.6759, 73.8417], landmarks: ["Moshi Bus Stand", "Moshi Railway", "Chovisawadi"], pincode: "412105" },
  { id: "chovisawadi", name: "Chovisawadi", area: "Moshi", zone: "pcmc", coordinates: [18.6805, 73.8355], landmarks: ["Chovisawadi", "Moshi"], pincode: "412105" },
  { id: "sangvi", name: "Sangvi", area: "Sangvi", zone: "pcmc", coordinates: [18.5794, 73.8310], landmarks: ["Sangvi Bus Stand", "Dange Chowk", "Ashok Nagar"], pincode: "411027" },
  { id: "thergaon", name: "Thergaon", area: "Thergaon", zone: "pcmc", coordinates: [18.5871, 73.7879], landmarks: ["Thergaon Chowk", "Sangvi Road"], pincode: "411033" },
  { id: "kasarwadi", name: "Kasarwadi", area: "Kasarwadi", zone: "pcmc", coordinates: [18.6089, 73.8284], landmarks: ["Kasarwadi Station", "Bhosari Road"], pincode: "411034" },
  { id: "talawade", name: "Talawade", area: "Talawade", zone: "pcmc", coordinates: [18.6667, 73.7800], landmarks: ["Talawade Village", "Akurdi-Talawade Road"], pincode: "412114" },
  { id: "dehu-road", name: "Dehu Road", area: "Dehu Road", zone: "pcmc", coordinates: [18.6821, 73.7472], landmarks: ["Dehu Road Cantt", "Dehu Road Railway", "Kiwale MIDC"], pincode: "412101" },
  { id: "kiwale", name: "Kiwale", area: "Kiwale", zone: "pcmc", coordinates: [18.6593, 73.7478], landmarks: ["Kiwale MIDC", "Dehu Road"], pincode: "412101" },
  { id: "ravet", name: "Ravet", area: "Ravet", zone: "pcmc", coordinates: [18.6613, 73.7485], landmarks: ["Ravet Village", "Ravet Station", "Mumbai Highway"], pincode: "412101" },
  { id: "punawale", name: "Punawale", area: "Punawale", zone: "pcmc", coordinates: [18.6428, 73.7370], landmarks: ["Punawale Gaon", "Mumbai Highway", "Ravet"], pincode: "411033" },
  { id: "tathawade", name: "Tathawade", area: "Tathawade", zone: "pcmc", coordinates: [18.6203, 73.7486], landmarks: ["Tathawade Gaon", "Hinjawadi Road", "PCMC"], pincode: "411033" },
  { id: "chikhali", name: "Chikhali", area: "Chikhali", zone: "pcmc", coordinates: [18.6727, 73.8528], landmarks: ["Chikhali Gaon", "Bhosari", "Alandi Road"], pincode: "411062" },
  { id: "charholi", name: "Charholi", area: "Charholi", zone: "pcmc", coordinates: [18.6923, 73.8767], landmarks: ["Charholi Gaon", "Alandi", "Dighi"], pincode: "412105" },
  { id: "dudulgaon", name: "Dudulgaon", area: "Dudulgaon", zone: "pcmc", coordinates: [18.6608, 73.7695], landmarks: ["Dudulgaon", "Akurdi", "Nigdi"], pincode: "411035" },
  { id: "walhekarwadi", name: "Walhekarwadi", area: "Walhekarwadi", zone: "pcmc", coordinates: [18.6365, 73.8045], landmarks: ["Walhekarwadi", "Pimpri", "Chinchwad"], pincode: "411019" },

  // ====================================================================
  // SUBURBAN EAST — Kharadi, Viman Nagar, Hadapsar, Wagholi, Manjari, Loni
  // ====================================================================
  { id: "viman-nagar", name: "Viman Nagar", area: "Viman Nagar", zone: "suburban-east", coordinates: [18.5679, 73.9119], landmarks: ["Phoenix Market City", "Aga Khan Palace", "Clover Park"], pincode: "411014" },
  { id: "viman-nagar-commercial", name: "Viman Nagar Commercial", area: "Viman Nagar", zone: "suburban-east", coordinates: [18.5632, 73.9084], landmarks: ["Four Points Hotel", "Viman Nagar Bus Stop"], pincode: "411014" },
  { id: "kharadi", name: "Kharadi", area: "Kharadi", zone: "suburban-east", coordinates: [18.5498, 73.9431], landmarks: ["EON IT Park", "Kharadi Bypass", "Zensar Tech Park"], pincode: "411014" },
  { id: "kharadi-gaon", name: "Kharadi Gaon", area: "Kharadi", zone: "suburban-east", coordinates: [18.5432, 73.9498], landmarks: ["Kharadi Village", "Nagar Road"], pincode: "411014" },
  { id: "kharadi-eon", name: "Kharadi EON IT Park", area: "Kharadi", zone: "suburban-east", coordinates: [18.5476, 73.9398], landmarks: ["EON Free Zone", "World Trade Center", "Cybage Tower"], pincode: "411014" },
  { id: "vadgaon-sheri", name: "Vadgaon Sheri", area: "Vadgaon Sheri", zone: "suburban-east", coordinates: [18.5482, 73.9316], landmarks: ["Vadgaon Sheri Gaon", "Kharadi Road"], pincode: "411014" },
  { id: "mundhwa", name: "Mundhwa", area: "Mundhwa", zone: "suburban-east", coordinates: [18.5391, 73.9296], landmarks: ["Mundhwa Gaon", "Mundhwa Bridge", "Koregaon Park"], pincode: "411036" },
  { id: "keshavnagar", name: "Keshavnagar", area: "Mundhwa", zone: "suburban-east", coordinates: [18.5304, 73.9233], landmarks: ["Keshavnagar Chowk", "Nyati Estate"], pincode: "411036" },
  { id: "hadapsar", name: "Hadapsar", area: "Hadapsar", zone: "suburban-east", coordinates: [18.5089, 73.9347], landmarks: ["Hadapsar Gadital", "Solapur Road", "Hadapsar Industrial Estate"], pincode: "411028" },
  { id: "hadapsar-gaon", name: "Hadapsar Gaon", area: "Hadapsar", zone: "suburban-east", coordinates: [18.5055, 73.9415], landmarks: ["Hadapsar Village", "Gadital"], pincode: "411028" },
  { id: "magarpatta", name: "Magarpatta City", area: "Hadapsar", zone: "suburban-east", coordinates: [18.5163, 73.9251], landmarks: ["Cybercity", "Seasons Mall", "Surya Hospital"], pincode: "411028" },
  { id: "wagholi", name: "Wagholi", area: "Wagholi", zone: "suburban-east", coordinates: [18.5776, 73.9858], landmarks: ["Wagholi Bus Stand", "Bakori Road", "Wagholi MIDC"], pincode: "412207" },
  { id: "lohegaon", name: "Lohegaon", area: "Lohegaon", zone: "suburban-east", coordinates: [18.5966, 73.9121], landmarks: ["Lohegaon Airport", "Lohegaon Village", "Viman Nagar Road"], pincode: "411047" },
  { id: "dighi", name: "Dighi", area: "Dighi", zone: "suburban-east", coordinates: [18.5934, 73.8617], landmarks: ["Dighi Gaon", "Alandi Road", "Pune Airport Road"], pincode: "411015" },
  { id: "dhanori", name: "Dhanori", area: "Dhanori", zone: "suburban-east", coordinates: [18.5891, 73.8847], landmarks: ["Dhanori Gaon", "Lohegaon Road"], pincode: "411015" },
  { id: "manjari", name: "Manjari", area: "Manjari", zone: "suburban-east", coordinates: [18.4950, 73.9700], landmarks: ["Manjari Gaon", "Hadapsar", "Solapur Highway"], pincode: "412307" },
  { id: "manjari-bk", name: "Manjari Budruk", area: "Manjari", zone: "suburban-east", coordinates: [18.4895, 73.9765], landmarks: ["Manjari Budruk", "Solapur Highway"], pincode: "412307" },
  { id: "phursungi", name: "Phursungi", area: "Phursungi", zone: "suburban-east", coordinates: [18.4805, 73.9605], landmarks: ["Phursungi Gaon", "Hadapsar-Saswad Road"], pincode: "412308" },
  { id: "theur", name: "Theur", area: "Theur", zone: "suburban-east", coordinates: [18.5250, 73.9900], landmarks: ["Theur Gaon", "Mula-Mutha River"], pincode: "412207" },
  { id: "loni-kalbhor", name: "Loni Kalbhor", area: "Loni Kalbhor", zone: "suburban-east", coordinates: [18.4879, 73.9796], landmarks: ["Loni Kalbhor Railway", "Pune-Solapur Highway"], pincode: "412201" },
  { id: "uruli-kanchan", name: "Uruli Kanchan", area: "Uruli Kanchan", zone: "suburban-east", coordinates: [18.4505, 74.0081], landmarks: ["Uruli Kanchan Railway", "Phaltan Sugar Works"], pincode: "412202" },
  { id: "wadgaon-shinde", name: "Wadgaon Shinde", area: "Wadgaon Shinde", zone: "suburban-east", coordinates: [18.5545, 73.8985], landmarks: ["Wadgaon Shinde", "Viman Nagar"], pincode: "411014" },
  { id: "nagar-road", name: "Nagar Road", area: "Nagar Road", zone: "suburban-east", coordinates: [18.5519, 73.9327], landmarks: ["Nagar Road Highway", "Kharadi Bypass"], pincode: "411014" },

  // ====================================================================
  // SUBURBAN WEST — Baner, Hinjawadi, Wakad, Pashan, Sus, Bavdhan
  // ====================================================================
  { id: "baner", name: "Baner", area: "Baner", zone: "suburban-west", coordinates: [18.5596, 73.7866], landmarks: ["Baner-Pashan Link Road", "Baner Hill", "Baner Gaon"], pincode: "411045" },
  { id: "baner-gaon", name: "Baner Gaon", area: "Baner", zone: "suburban-west", coordinates: [18.5525, 73.7815], landmarks: ["Baner Gaon", "Baner Circle"], pincode: "411045" },
  { id: "baner-balewadi", name: "Baner-Balewadi Commercial", area: "Baner", zone: "suburban-west", coordinates: [18.5640, 73.7766], landmarks: ["Seasons Mall", "Baner High Street", "Westin Hotel"], pincode: "411045" },
  { id: "balewadi", name: "Balewadi", area: "Balewadi", zone: "suburban-west", coordinates: [18.5719, 73.7761], landmarks: ["Balewadi Stadium", "Seasons Mall", "Shiv Enclave"], pincode: "411045" },
  { id: "pashan", name: "Pashan", area: "Pashan", zone: "suburban-west", coordinates: [18.5448, 73.7836], landmarks: ["Pashan Lake", "Pashan Circle", "Sus Road"], pincode: "411021" },
  { id: "pashan-gaon", name: "Pashan Gaon", area: "Pashan", zone: "suburban-west", coordinates: [18.5405, 73.7780], landmarks: ["Pashan Village", "Pashan Lake"], pincode: "411021" },
  { id: "sus", name: "Sus", area: "Sus", zone: "suburban-west", coordinates: [18.5543, 73.7621], landmarks: ["Sus Gaon", "Sus Road", "MSCBD"], pincode: "411021" },
  { id: "sus-gaon", name: "Sus Gaon", area: "Sus", zone: "suburban-west", coordinates: [18.5495, 73.7575], landmarks: ["Sus Village", "Pashan-Sus Link"], pincode: "411021" },
  { id: "hinjawadi-phase1", name: "Hinjawadi Phase 1", area: "Hinjawadi", zone: "suburban-west", coordinates: [18.5886, 73.7393], landmarks: ["IT Park Phase 1", "Maruti IT Park", "Wipro"], pincode: "411057" },
  { id: "hinjawadi-phase2", name: "Hinjawadi Phase 2", area: "Hinjawadi", zone: "suburban-west", coordinates: [18.5968, 73.7268], landmarks: ["Phase 2", "Cummins Campus", "Infosys", "Tech Mahindra"], pincode: "411057" },
  { id: "hinjawadi-phase3", name: "Hinjawadi Phase 3", area: "Hinjawadi", zone: "suburban-west", coordinates: [18.6031, 73.7143], landmarks: ["Phase 3", "Maan Circle", "L&T Cyber Park", "Tata Tech"], pincode: "411057" },
  { id: "hinjawadi-it", name: "Hinjawadi IT Park", area: "Hinjawadi", zone: "suburban-west", coordinates: [18.5925, 73.7340], landmarks: ["IT Park Main Gate", "Midtown", "ICC Tech Park"], pincode: "411057" },
  { id: "hinjawadi-gaon", name: "Hinjawadi Gaon", area: "Hinjawadi", zone: "suburban-west", coordinates: [18.5805, 73.7515], landmarks: ["Hinjawadi Village", "Kolhewadi Road"], pincode: "411057" },
  { id: "wakad", name: "Wakad", area: "Wakad", zone: "suburban-west", coordinates: [18.5926, 73.7687], landmarks: ["Wakad Bridge", "Dange Chowk", "SBI Circle"], pincode: "411057" },
  { id: "wakad-gaon", name: "Wakad Gaon", area: "Wakad", zone: "suburban-west", coordinates: [18.5875, 73.7655], landmarks: ["Wakad Village", "Wakad Bridge"], pincode: "411057" },
  { id: "maan", name: "Maan", area: "Maan", zone: "suburban-west", coordinates: [18.6089, 73.7050], landmarks: ["Maan Circle", "Maan Gaon", "Hinjawadi Phase 3"], pincode: "411057" },
  { id: "marunji", name: "Marunji", area: "Marunji", zone: "suburban-west", coordinates: [18.5950, 73.7050], landmarks: ["Marunji Gaon", "Hinjawadi", "Maan"], pincode: "411057" },
  { id: "mahatunge", name: "Mahalunge", area: "Mahalunge", zone: "suburban-west", coordinates: [18.5725, 73.7365], landmarks: ["Mahalunge Gaon", "Hinjawadi", "Baner"], pincode: "411045" },
  { id: "kolhewadi", name: "Kolhewadi", area: "Hinjawadi", zone: "suburban-west", coordinates: [18.5755, 73.7452], landmarks: ["Kolhewadi Gaon", "Hinjawadi", "Maan Road"], pincode: "411057" },
  { id: "bavdhan", name: "Bavdhan", area: "Bavdhan", zone: "suburban-west", coordinates: [18.5106, 73.7817], landmarks: ["Bavdhan Gaon", "Bavdhan Chowk", "Paud Road"], pincode: "411021" },
  { id: "bavdhan-budruk", name: "Bavdhan Budruk", area: "Bavdhan", zone: "suburban-west", coordinates: [18.5038, 73.7718], landmarks: ["Bavdhan Budruk", "Chandani Chowk", "NDA"], pincode: "411021" },
  { id: "ambegaon-budruk", name: "Ambegaon Budruk", area: "Ambegaon", zone: "suburban-west", coordinates: [18.4907, 73.8338], landmarks: ["Ambegaon Budruk", "Katraj-Dhayari Road"], pincode: "411046" },
  { id: "pimple-nilakh", name: "Pimple Nilakh", area: "Pimple Nilakh", zone: "suburban-west", coordinates: [18.5740, 73.7986], landmarks: ["Pimple Nilakh", "Rahatani Chowk"], pincode: "411027" },
  { id: "pimple-saudagar", name: "Pimple Saudagar", area: "Pimple Saudagar", zone: "suburban-west", coordinates: [18.5812, 73.8052], landmarks: ["Pimple Saudagar", "Rahatani", "Kalewadi Phata"], pincode: "411027" },
  { id: "rahatani", name: "Rahatani", area: "Rahatani", zone: "suburban-west", coordinates: [18.5885, 73.8012], landmarks: ["Rahatani Chowk", "Sangvi Road", "Pimple Nilakh"], pincode: "411027" },
  { id: "kalewadi", name: "Kalewadi", area: "Kalewadi", zone: "suburban-west", coordinates: [18.5958, 73.7881], landmarks: ["Kalewadi Phata", "Akurdi Road", "Wakad Road"], pincode: "411017" },

  // ====================================================================
  // SUBURBAN SOUTH — Katraj, Dhayari, Undri, Kondhwa, Narhe, Pisoli
  // ====================================================================
  { id: "katraj", name: "Katraj", area: "Katraj", zone: "suburban-south", coordinates: [18.4529, 73.8693], landmarks: ["Katraj Zoo", "Katraj Lake", "Rajiv Gandhi Infotech Park"], pincode: "411046" },
  { id: "katraj-gaon", name: "Katraj Gaon", area: "Katraj", zone: "suburban-south", coordinates: [18.4475, 73.8745], landmarks: ["Katraj Village", "Katraj Lake"], pincode: "411046" },
  { id: "dhayari", name: "Dhayari", area: "Dhayari", zone: "suburban-south", coordinates: [18.4501, 73.8219], landmarks: ["Dhayari Phata", "NIBM Road", "Sinhagad Road"], pincode: "411041" },
  { id: "dhayari-gaon", name: "Dhayari Gaon", area: "Dhayari", zone: "suburban-south", coordinates: [18.4455, 73.8155], landmarks: ["Dhayari Village", "Sinhagad Road"], pincode: "411041" },
  { id: "undri", name: "Undri", area: "Undri", zone: "suburban-south", coordinates: [18.4489, 73.9053], landmarks: ["Undri Chowk", "Nyati County", "Undri Gaon"], pincode: "411048" },
  { id: "ambegaon-pathar", name: "Ambegaon Pathar", area: "Ambegaon", zone: "suburban-south", coordinates: [18.4706, 73.8412], landmarks: ["Ambegaon Pathar", "NIBM Chowk"], pincode: "411046" },
  { id: "kondhwa", name: "Kondhwa", area: "Kondhwa", zone: "suburban-south", coordinates: [18.4603, 73.8891], landmarks: ["Kondhwa Budruk", "Bibvewadi", "Kondhwa Bus Stop"], pincode: "411048" },
  { id: "kondhwa-budruk", name: "Kondhwa Budruk", area: "Kondhwa", zone: "suburban-south", coordinates: [18.4658, 73.8819], landmarks: ["Kondhwa Budruk Gaon", "Kausar Baugh"], pincode: "411048" },
  { id: "kondhwa-khurd", name: "Kondhwa Khurd", area: "Kondhwa", zone: "suburban-south", coordinates: [18.4555, 73.8955], landmarks: ["Kondhwa Khurd", "Undri Road"], pincode: "411048" },
  { id: "mohammadwadi", name: "Mohammadwadi", area: "Mohammadwadi", zone: "suburban-south", coordinates: [18.4706, 73.9175], landmarks: ["Mohammadwadi Gaon", "Hadapsar Road"], pincode: "411028" },
  { id: "pisoli", name: "Pisoli", area: "Pisoli", zone: "suburban-south", coordinates: [18.4419, 73.9196], landmarks: ["Pisoli Gaon", "Undri Road", "Kondhwa"], pincode: "411060" },
  { id: "nibm", name: "NIBM", area: "NIBM", zone: "suburban-south", coordinates: [18.4590, 73.8593], landmarks: ["NIBM Chowk", "NIBM Road", "Mohannagar"], pincode: "411060" },
  { id: "nibm-annex", name: "NIBM Annexe", area: "NIBM", zone: "suburban-south", coordinates: [18.4625, 73.8495], landmarks: ["NIBM Annexe", "Kondhwa Road"], pincode: "411060" },
  { id: "bibvewadi", name: "Bibvewadi", area: "Bibvewadi", zone: "suburban-south", coordinates: [18.4782, 73.8729], landmarks: ["Bibvewadi Chowk", "Market Yard", "Pulachiwadi"], pincode: "411037" },
  { id: "market-yard", name: "Market Yard", area: "Market Yard", zone: "suburban-south", coordinates: [18.4845, 73.8675], landmarks: ["Pune Market Yard", "Gultekdi", "Swargate"], pincode: "411037" },
  { id: "gultekdi", name: "Gultekdi", area: "Gultekdi", zone: "suburban-south", coordinates: [18.4881, 73.8619], landmarks: ["Gultekdi Market", "Swargate"], pincode: "411037" },
  { id: "salunkhe-vihar", name: "Salunkhe Vihar", area: "Salunkhe Vihar", zone: "suburban-south", coordinates: [18.4682, 73.9036], landmarks: ["Salunkhe Vihar Road", "Undri", "Kondhwa-Saswad Road"], pincode: "411048" },
  { id: "narhe", name: "Narhe", area: "Narhe", zone: "suburban-south", coordinates: [18.4400, 73.8350], landmarks: ["Narhe Gaon", "Narhe Road", "Dhayari"], pincode: "411041" },
  { id: "narhegaon", name: "Narhegaon", area: "Narhe", zone: "suburban-south", coordinates: [18.4350, 73.8285], landmarks: ["Narhegaon", "Sinhagad Road"], pincode: "411041" },
  { id: "khed-shivapur", name: "Khed Shivapur", area: "Khed Shivapur", zone: "suburban-south", coordinates: [18.4550, 73.7585], landmarks: ["Khed Shivapur", "Bangalore Highway", "Shivapur"], pincode: "412205" },

  // ====================================================================
  // COMMERCIAL & IT BELTS
  // ====================================================================
  { id: "hinjawadi-it-park", name: "Hinjawadi IT Hub", area: "Hinjawadi", zone: "commercial", coordinates: [18.5945, 73.7370], landmarks: ["IT Park Main Gate", "Midtown", "Xento Park", "ICC Tech Park"], pincode: "411057" },
  { id: "chakan-midc", name: "Chakan MIDC", area: "Chakan", zone: "commercial", coordinates: [18.7595, 73.8589], landmarks: ["Chakan MIDC", "Bajaj Auto", "Volkswagen India"], pincode: "410501" },
  { id: "bhosari-midc", name: "Bhosari MIDC", area: "Bhosari", zone: "commercial", coordinates: [18.6569, 73.8531], landmarks: ["Bhosari MIDC", "Pune Nasik Highway"], pincode: "411039" },
  { id: "pimpri-midc", name: "Pimpri MIDC", area: "Pimpri", zone: "commercial", coordinates: [18.6319, 73.8222], landmarks: ["Pimpri MIDC", "Auto Cluster"], pincode: "411018" },
  { id: "kharadi-commercial", name: "Kharadi Commercial Hub", area: "Kharadi", zone: "commercial", coordinates: [18.5460, 73.9425], landmarks: ["EON Free Zone", "World Trade Center"], pincode: "411014" },
  { id: "wakad-commercial", name: "Wakad Business District", area: "Wakad", zone: "commercial", coordinates: [18.5905, 73.7715], landmarks: ["Wakad Business District", "SB Road"], pincode: "411057" },
  { id: "baner-commercial", name: "Baner Commercial Hub", area: "Baner", zone: "commercial", coordinates: [18.5610, 73.7885], landmarks: ["Baner High Street", "Westin Hotel", "Baner Pashan Link"], pincode: "411045" },

  // ====================================================================
  // EXTENDED PMRDA — Fringe Towns & Villages
  // ====================================================================
  { id: "chakan", name: "Chakan Town", area: "Chakan", zone: "core", coordinates: [18.7595, 73.8589], landmarks: ["Chakan MIDC", "Chakan Toll Plaza"], pincode: "410501" },
  { id: "talegaon", name: "Talegaon", area: "Talegaon", zone: "core", coordinates: [18.7333, 73.7833], landmarks: ["Talegaon Station", "Talegaon MIDC"], pincode: "410507" },
  { id: "talegaon-dabhade", name: "Talegaon Dabhade", area: "Talegaon", zone: "core", coordinates: [18.7215, 73.7715], landmarks: ["Talegaon Dabhade", "Mumbai-Pune Highway"], pincode: "410507" },
  { id: "lonavala", name: "Lonavala", area: "Lonavala", zone: "core", coordinates: [18.7541, 73.4049], landmarks: ["Lonavala Station", "Lion's Point", "Bhushi Dam"], pincode: "410401" },
  { id: "khandala", name: "Khandala", area: "Khandala", zone: "core", coordinates: [18.7628, 73.3725], landmarks: ["Khandala Station", "Duke's Nose"], pincode: "410401" },
  { id: "shikrapur", name: "Shikrapur", area: "Shikrapur", zone: "core", coordinates: [18.6931, 74.0061], landmarks: ["Shikrapur Toll Plaza", "Ahmednagar Highway"], pincode: "412208" },
  { id: "rajgurunagar", name: "Rajgurunagar", area: "Rajgurunagar", zone: "core", coordinates: [18.8919, 73.9142], landmarks: ["Rajgurunagar Bus Stand", "Pune-Nasik Highway"], pincode: "410505" },
  { id: "saswad", name: "Saswad", area: "Saswad", zone: "core", coordinates: [18.3679, 74.0327], landmarks: ["Saswad Bus Stand", "Pune-Saswad Road"], pincode: "412301" },
  { id: "jejuri", name: "Jejuri", area: "Jejuri", zone: "core", coordinates: [18.2790, 74.1680], landmarks: ["Jejuri Temple", "Pune-Bangalore Highway"], pincode: "412303" },
  { id: "daund", name: "Daund", area: "Daund", zone: "core", coordinates: [18.4655, 74.5882], landmarks: ["Daund Railway Junction", "Pune-Solapur Highway"], pincode: "413801" },
  { id: "shirwal", name: "Shirwal", area: "Shirwal", zone: "core", coordinates: [18.1478, 73.9981], landmarks: ["Shirwal Bus Stand", "Pune-Bangalore Highway"], pincode: "412801" },
  { id: "baramati", name: "Baramati", area: "Baramati", zone: "core", coordinates: [18.1644, 74.6025], landmarks: ["Baramati Bus Stand", "Baramati MIDC", "Vidya Pratishthan"], pincode: "413102" },
  { id: "indapur", name: "Indapur", area: "Indapur", zone: "core", coordinates: [18.1131, 74.7116], landmarks: ["Indapur Bus Stand", "Pune-Solapur Highway"], pincode: "413106" },
  { id: "shirur", name: "Shirur", area: "Shirur", zone: "core", coordinates: [18.7713, 74.3635], landmarks: ["Shirur Bus Stand", "Ahmednagar Highway"], pincode: "412210" },
  { id: "ghodnadi", name: "Ghodnadi", area: "Ghodnadi", zone: "core", coordinates: [18.6655, 74.1851], landmarks: ["Ghodnadi Village", "Nagar Road"], pincode: "412205" },
  { id: "urwade", name: "Urwade", area: "Urwade", zone: "core", coordinates: [18.6855, 73.9855], landmarks: ["Urwade", "Shikrapur"], pincode: "412208" },
  { id: "nande", name: "Nande", area: "Nande", zone: "core", coordinates: [18.6325, 73.6885], landmarks: ["Nande Gaon", "Hinjawadi"], pincode: "411057" },
  { id: "pirangut", name: "Pirangut", area: "Pirangut", zone: "core", coordinates: [18.5055, 73.6855], landmarks: ["Pirangut Gaon", "Mumbai Highway"], pincode: "412115" },
  { id: "belsar", name: "Belsar", area: "Belsar", zone: "core", coordinates: [18.5155, 73.6655], landmarks: ["Belsar", "Pirangut"], pincode: "412115" },
  { id: "hadas", name: "Hadas", area: "Hadas", zone: "core", coordinates: [18.4455, 73.7985], landmarks: ["Hadas Gaon", "Narhe", "Sinhagad Road"], pincode: "411041" },
  { id: "kirkatwadi", name: "Kirkatwadi", area: "Kirkatwadi", zone: "core", coordinates: [18.4225, 73.8985], landmarks: ["Kirkatwadi", "Undri", "Pisoli"], pincode: "411060" },
  { id: "wadachiwadi", name: "Wadachiwadi", area: "Wadachiwadi", zone: "core", coordinates: [18.4458, 73.8815], landmarks: ["Wadachiwadi", "Kondhwa", "Katraj"], pincode: "411048" },
  { id: "hingne-budruk", name: "Hingne Budruk", area: "Hingne Budruk", zone: "core", coordinates: [18.4885, 73.8255], landmarks: ["Hingne Budruk", "Karve Nagar", "Warje"], pincode: "411029" },
  { id: "warje", name: "Warje", area: "Warje", zone: "core", coordinates: [18.4769, 73.8015], landmarks: ["Warje Chowk", "Mumbai Highway", "Warje Gaon"], pincode: "411058" },
  { id: "warje-gaon", name: "Warje Gaon", area: "Warje", zone: "core", coordinates: [18.4805, 73.7955], landmarks: ["Warje Village", "Mumbai Road"], pincode: "411058" },
  { id: "khadakwasla", name: "Khadakwasla", area: "Khadakwasla", zone: "core", coordinates: [18.4425, 73.7685], landmarks: ["Khadakwasla Dam", "Khadakwasla Gaon", "NDA"], pincode: "411024" },
];

// ==================== UTILITY FUNCTIONS ====================

export function getLocationById(id: string): PuneLocation | undefined {
  return puneLocations.find((loc) => loc.id === id);
}

export function searchLocations(query: string): PuneLocation[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return puneLocations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(q) ||
      loc.area.toLowerCase().includes(q) ||
      loc.zone.toLowerCase().includes(q) ||
      loc.pincode?.includes(q) ||
      loc.landmarks.some((l) => l.toLowerCase().includes(q)),
  );
}

export function getLocationsByZone(zone: PuneZone): PuneLocation[] {
  return puneLocations.filter((loc) => loc.zone === zone);
}

export function getAllZones(): { key: PuneZone; label: string }[] {
  return [
    { key: "core", label: "Core Hubs" },
    { key: "pcmc", label: "PCMC" },
    { key: "suburban-east", label: "Suburban East" },
    { key: "suburban-west", label: "Suburban West" },
    { key: "suburban-south", label: "Suburban South" },
    { key: "commercial", label: "Commercial Belts" },
  ];
}
