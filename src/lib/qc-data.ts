

export interface InspectionSubmission {
    id: string;
    inspectionDate: string;
    oeNumber: string;
    inspectorName: string;
    totalScore: number;
    status: 'Pass' | 'Reinspection Required' | 'Fail';
    reinspection?: {
        finalOutcome: string;
        comments: string;
    };
}


export const inspectionsData: InspectionSubmission[] = [
    {
        id: 'qc-1',
        inspectionDate: '2023-10-29T12:00:00Z',
        oeNumber: 'OUS2345-141',
        inspectorName: 'Inspector Ali',
        totalScore: 45,
        status: 'Pass',
    },
    {
        id: 'qc-2',
        inspectionDate: '2023-11-01T12:00:00Z',
        oeNumber: 'OIT76541-001',
        inspectorName: 'Inspector Bob',
        totalScore: 75,
        status: 'Reinspection Required',
        reinspection: {
            finalOutcome: 'Recooked',
            comments: 'Minor shrinkage waves were addressed after recooking process. Accepted.'
        }
    },
    {
        id: 'qc-3',
        inspectionDate: '2023-10-27T12:00:00Z',
        oeNumber: 'OAUS32145-001',
        inspectorName: 'Inspector Ali',
        totalScore: 105,
        status: 'Fail',
        reinspection: {
            finalOutcome: 'Rejected',
            comments: 'Major delamination found near clew. Sail is a total loss.'
        }
    }
];

export const defectCategories = [
    {
      id: "lamination",
      title: "Lamination / Automatic Second QC Defects",
      defects: [
        { key: "majorDyneema", label: "Major Dyneema in Tapes" },
        { key: "discoloredPanel", label: "Discolored Panel" },
        { key: "overCooked", label: "Over-Cooked (Melted Dyneema)" },
        { key: "pocketInstallation", label: "Pocket Installation" },
        { key: "cornersNotLaminated", label: "Corners Not Laminated" },
        { key: "noOverlapScarfJoint", label: "No Overlap in Scarf Joint" },
        { key: "majorGlueLine", label: "Major Glue Line" },
        { key: "pocketsShrinkageWaves", label: "Pockets Shrinkage Waves" },
        { key: "majorShrinkageWaves", label: "Major Shrinkage Waves" },
        { key: "tempStickersNotUpToTemp", label: "All Temp Stickers Not Up to Temp" },
        { key: "debris", label: "Debris" },
        { key: "exposedInternal", label: "Exposed Internal" },
        { key: "gapsInExternalTapes", label: "Gaps in External Tapes" },
        { key: "zFold", label: "Z-Fold" },
      ]
    },
    {
      id: "structural",
      title: "Structural Defects",
      defects: [
        { key: "verticalCreases", label: "Vertical Creases" },
        { key: "horizontalCreases", label: "Horizontal Creases" },
        { key: "minorShrinkageWaves", label: "Minor Shrinkage Waves" },
        { key: "bunchedUpInternalTape", label: "Bunched Up Internal Tape" },
      ]
    },
    {
      id: "cosmetic",
      title: "Cosmetic Defects",
      defects: [
        { key: "tintGlueSpots", label: "Tint/Glue Spots" },
        { key: "minorGlueLines", label: "Minor Glue Lines" },
        { key: "dominantDyneema", label: "4 or More Dominant Dyneema" },
        { key: "foldedOverExternalTape", label: "Folded Over External Tape" },
        { key: "fin", label: "Fin" },
        { key: "bunchedUpExternalTape", label: "Bunched Up External Tape" },
        { key: "carbonFrayGlob", label: "Carbon Fray Glob" },
        { key: "tapeSpacing", label: "Tape Spacing" },
        { key: "yarnTwists", label: "4 or More Yarn Twists in 1 Panel" },
        { key: "externalSplices", label: "3 or More External Splices" },
        { key: "foldedWhiteExternal", label: "Folded White External" },
        { key: "badPatch", label: "Bad Patch" },
        { key: "displacedPC", label: "Displaced PC" },
      ]
    }
  ];
  
  export const defectDefinitions = {
    majorDyneema: "A significant concentration or clumping of Dyneema fibers within the sail's tapes, creating a visual and potentially structural irregularity.",
    discoloredPanel: "A panel that exhibits a noticeable and unintended change in color, often due to issues with materials or the lamination process.",
    overCooked: "A state where the sail material, particularly Dyneema, has been subjected to excessive heat during lamination, causing it to melt or deform.",
    pocketInstallation: "An error in the placement, alignment, or bonding of pockets (e.g., for battens or patches) on the sail.",
    cornersNotLaminated: "The corners of the sail (head, tack, clew) are not fully bonded or sealed during the lamination process.",
    noOverlapScarfJoint: "A seam (scarf joint) where two panels meet without the required amount of material overlap, compromising structural integrity.",
    majorGlueLine: "A large, visible, and often thick line of adhesive that has seeped out from a seam or tape edge.",
    pocketsShrinkageWaves: "Distortion or waves appearing around pocket areas, typically caused by uneven material shrinkage during lamination.",
    majorShrinkageWaves: "Significant, widespread waves or puckering across the sail surface resulting from material shrinkage.",
    tempStickersNotUpToTemp: "Temperature-indicating stickers used during lamination fail to show that the required curing temperature was reached.",
    debris: "Foreign particles (dust, hair, insects, etc.) trapped within the layers of the sail during lamination.",
    exposedInternal: "An internal component of the sail, such as a structural tape or patch, is visible on the exterior surface when it should be covered.",
    gapsInExternalTapes: "Visible spaces or gaps between external tapes that should be flush against each other.",
    zFold: "An S-shaped fold or crease in the material that gets laminated into the sail, creating a structural flaw.",
    verticalCreases: "Creases or wrinkles that run parallel to the leech (vertical orientation of the sail).",
    horizontalCreases: "Creases or wrinkles that run parallel to the foot (horizontal orientation of the sail).",
    minorShrinkageWaves: "Slight or localized waves on the sail surface due to material shrinkage, considered less severe than major waves.",
    bunchedUpInternalTape: "An internal structural tape has gathered or bunched up instead of lying flat, creating a lump.",
    tintGlueSpots: "Small, discolored spots on the sail surface caused by excess or improperly applied adhesive in the tinting process.",
    minorGlueLines: "Small, less noticeable lines of adhesive seepage along tape or seam edges.",
    dominantDyneema: "Individual Dyneema yarns that are unusually prominent or visible on the sail surface.",
    foldedOverExternalTape: "An external tape that has been folded over on itself during application, creating a raised edge or line.",
    fin: "A small, sharp protrusion of cured resin or material along a tape edge, resembling a small fin.",
    bunchedUpExternalTape: "An external tape has gathered or bunched up instead of lying flat.",
    carbonFrayGlob: "A clump or ball of frayed carbon fibers that has been laminated into the sail.",
    tapeSpacing: "Inconsistent or incorrect spacing between parallel tapes on the sail.",
    yarnTwists: "A noticeable twist or turn in the structural yarns or fibers within a panel.",
    externalSplices: "The joining or splicing of external tapes. More than the acceptable number is a defect.",
    foldedWhiteExternal: "A white external tape that has been folded over on itself.",
    badPatch: "A repair patch that is poorly applied, misaligned, or visually disruptive.",
    displacedPC: "A 'Print Con' or 'Printed Component' (like a logo or graphic) that is misaligned from its intended position.",
  };
  
