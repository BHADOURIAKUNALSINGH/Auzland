declare namespace JSX {
  interface IntrinsicElements {
    "elevenlabs-convai": any;
  }
}

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { NewUser } from "../types";
import { loadElevenLabsWidget } from "../utils/elevenLabsLoader";
// import ChatbotSidebar from './ChatbotSidebar';
import "./Dashboard.css";
import ProfileDropdown from "./ProfileDropdown";
import "./ProfileDropdown.css";

// Declare custom elements for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "elevenlabs-convai": {
        "agent-id": string;
        children?: React.ReactNode;
      };
    }
  }
}

// Disable noisy console logs in production (keep warnings/errors)
if (
  typeof process !== "undefined" &&
  process.env &&
  process.env.NODE_ENV === "production"
) {
  try {
    // eslint-disable-next-line no-console
    console.log = () => {};
    // eslint-disable-next-line no-console
    console.debug = () => {};
  } catch (_) {}
}

const Dashboard: React.FC = () => {
  const { user, signOut, getAuthHeader } = useAuth();

  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Check if user has edit-access role
  const hasEditAccess = user?.groups?.some(
    (group) => group.toLowerCase() === "edit-access"
  );

  // Load ElevenLabs Convai widget
  useEffect(() => {
    loadElevenLabsWidget().catch((error) => {
      console.warn("Failed to load ElevenLabs widget:", error);
    });
  }, []);

  // Function to verify authentication before user creation
  const verifyAuthBeforeUserCreation = async (): Promise<boolean> => {
    try {
      // Check if user has edit access
      if (!hasEditAccess) {
        setMessage({
          type: "error",
          text: "You do not have permission to create users. Only administrators can add users.",
        });
        return false;
      }

      // Try to get auth header to verify token is valid
      try {
        await getAuthHeader();
        return true;
      } catch (error: any) {
        if (error.message?.includes("expired")) {
          setMessage({
            type: "error",
            text: "Your authentication has expired. Please sign in again.",
          });
        } else {
          setMessage({
            type: "error",
            text: "Authentication failed. Please sign in again.",
          });
        }
        return false;
      }
    } catch (error: any) {
      console.error("Auth verification failed:", error);
      setMessage({
        type: "error",
        text: `Authentication verification failed: ${error.message}`,
      });
      return false;
    }
  };

  // Chatbot sidebar state
  // const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    quickSearch: "",
    suburb: "",
    propertyType: "",
    availability: "",
    frontageMin: "",
    frontageMax: "",
    landSizeMin: "",
    landSizeMax: "",
    buildSizeMin: "",
    buildSizeMax: "",
    bedMin: "",
    bedMax: "",
    bathMin: "",
    bathMax: "",
    garageMin: "",
    garageMax: "",
    priceMin: "",
    priceMax: "",
    registrationConstructionStatus: "",
  });

  // Property data and editing states
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("lot");
  const [sortOrder, setSortOrder] = useState("desc");
  const [listingsVersionId, setListingsVersionId] = useState<
    string | undefined
  >(undefined);

  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [propertyForm, setPropertyForm] = useState<any>({
    propertyType: "",
    lot: "",
    address: "",
    suburb: "",
    availability: "",
    frontage: "",
    landSize: "",
    buildSize: "",
    bed: "",
    bath: "",
    garage: "",
    registrationConstructionStatus: "",
    price: "",
    media: "",
    remark: "",
    description: "",
    propertyCustomerVisibility: "1",
    priceCustomerVisibility: "0",
  });

  // Tab state
  const [activeTab, setActiveTab] = useState<
    "properties" | "admin" | "call-agent"
  >("properties");

  // Media upload states
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaUploadProgress, setMediaUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [mediaUploadErrors, setMediaUploadErrors] = useState<{
    [key: string]: string;
  }>({});

  // CSV upload states
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvUploadProgress, setCsvUploadProgress] = useState<number>(0);
  const [csvUploadError, setCsvUploadError] = useState<string | null>(null);
  const [showCsvUploadModal, setShowCsvUploadModal] = useState(false);

  // Excel file states - commented out as unused
  // const [excelSheets, setExcelSheets] = useState<string[]>([]);
  // const [selectedSheet, setSelectedSheet] = useState<string>('');
  // const [showSheetSelector, setShowSheetSelector] = useState(false);

  // Sidebar state - filters closed by default
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    propertyType: false,
    suburb: false,
    availability: false,
    status: false,
    price: false,
    frontage: false,
    landSize: false,
    buildSize: false,
    bed: false,
    bath: false,
    garage: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Media viewer states
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [viewingMedia, setViewingMedia] = useState<any[]>([]);
  const [mediaPresignedUrls, setMediaPresignedUrls] = useState<{
    [key: string]: string;
  }>({});

  // Media reordering states - smooth swap animation
  const [swapAnimation, setSwapAnimation] = useState<{
    index1: number;
    index2: number;
  } | null>(null);

  // S3 Bucket URL for media files (update this with your actual bucket URL)

  // TODO: Update the S3_BUCKET_URL above with your actual S3 bucket URL
  // Example: https://my-real-estate-media.s3.amazonaws.com

  // Load listings from S3-backed API for both view and edit users
  useEffect(() => {
    loadPropertiesFromApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply filters and sorting whenever properties, filters, sortBy, or sortOrder change
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties, filters, sortBy, sortOrder]);

  // Prevent copy-paste operations only for view-only users
  useEffect(() => {
    // Only apply restrictions if user doesn't have edit access
    if (!hasEditAccess) {
      const preventCopyPaste = (e: KeyboardEvent) => {
        // Prevent Ctrl+C (copy)
        if (e.ctrlKey && e.key === "c") {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        // Prevent Ctrl+V (paste)
        if (e.ctrlKey && e.key === "v") {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        // Prevent Ctrl+A (select all)
        if (e.ctrlKey && e.key === "a") {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      };

      const preventContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };

      // Add event listeners
      document.addEventListener("keydown", preventCopyPaste);
      document.addEventListener("contextmenu", preventContextMenu);

      // Cleanup
      return () => {
        document.removeEventListener("keydown", preventCopyPaste);
        document.removeEventListener("contextmenu", preventContextMenu);
      };
    }
  }, [hasEditAccess]);

  // Handle keyboard shortcuts for sidebar toggles (Ctrl/Cmd + B for filters, Ctrl/Cmd + R for chatbot)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "b") {
        event.preventDefault();
        setIsSidebarOpen(!isSidebarOpen);
      }
      // if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
      //   event.preventDefault();
      //   setIsChatbotOpen(!isChatbotOpen);
      // }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen]); // removed isChatbotOpen dependency

  // Dynamic content area width adjustment based on chatbot sidebar state
  // useEffect(() => {
  //   const contentArea = document.querySelector('.content-area') as HTMLElement;
  //   if (contentArea) {
  //     if (isChatbotOpen) {
  //       contentArea.style.width = 'calc(100% - 380px)';
  //       contentArea.style.marginRight = '0';
  //     } else {
  //       contentArea.style.width = '100%';
  //       contentArea.style.marginRight = '0';
  //     }
  //   }
  // }, [isChatbotOpen]);

  // Filter and sort properties based on current filters and sort settings
  const applyFilters = () => {
    console.log(
      "🔍 =========================== FILTER DEBUG ==========================="
    );
    console.log("🔍 All Current Filters:", filters);
    console.log(
      "🔍 Active Filters Only:",
      Object.fromEntries(
        Object.entries(filters).filter(([k, v]) => v && v !== "")
      )
    );
    console.log("🔍 Total Properties Available:", properties.length);
    console.log(
      "🔍 Filter Count:",
      Object.entries(filters).filter(([k, v]) => v && v !== "").length
    );
    console.log(
      "🔍 ================================================================"
    );

    let filtered = [...properties];

    // Universal quick search filter (searches across multiple fields)
    if (filters.quickSearch.trim()) {
      const searchTerm = filters.quickSearch.toLowerCase().trim();
      filtered = filtered.filter(
        (property) =>
          // Property type search (handle both old and new formats)
          property.propertyType?.toLowerCase().includes(searchTerm) ||
          (property.propertyType?.toLowerCase() === "home and land packages" &&
            searchTerm.includes("home") &&
            searchTerm.includes("land")) ||
          // Address and location search
          property.address?.toLowerCase().includes(searchTerm) ||
          property.suburb?.toLowerCase().includes(searchTerm) ||
          // Lot and property identification
          property.lot?.toLowerCase().includes(searchTerm) ||
          // Additional property details
          property.availability?.toLowerCase().includes(searchTerm) ||
          property.registrationConstructionStatus
            ?.toLowerCase()
            .includes(searchTerm) ||
          property.remark?.toLowerCase().includes(searchTerm)
      );
    }

    // Availability filter
    if (filters.availability) {
      filtered = filtered.filter(
        (property) =>
          property.availability?.toLowerCase() ===
          filters.availability.toLowerCase()
      );
    }

    // Property type filter
    if (filters.propertyType) {
      filtered = filtered.filter((property) => {
        const propertyType = property.propertyType?.toLowerCase() || "";
        const filterType = filters.propertyType.toLowerCase();

        // Handle "Home & Land" filtering for both old and new formats
        if (filterType === "home & land") {
          return (
            propertyType === "home & land" ||
            propertyType === "home and land packages"
          );
        }

        return propertyType === filterType;
      });
    }

    // Suburb filter
    if (filters.suburb) {
      console.log("🏘️ Suburb filter:", {
        filterSuburb: filters.suburb,
        samplePropertySuburbs: filtered
          .slice(0, 5)
          .map((p) => ({ id: p.id, suburb: p.suburb })),
      });
      filtered = filtered.filter((property) =>
        property.suburb?.toLowerCase().includes(filters.suburb.toLowerCase())
      );
      console.log(
        "🏘️ After suburb filter:",
        filtered.length,
        "properties remain"
      );
    }

    // Frontage filter (min/max)
    if (filters.frontageMin || filters.frontageMax) {
      filtered = filtered.filter((property) => {
        const frontage = property.frontage || 0;
        const min = filters.frontageMin ? parseFloat(filters.frontageMin) : 0;
        const max = filters.frontageMax
          ? parseFloat(filters.frontageMax)
          : Infinity;
        return frontage >= min && frontage <= max;
      });
    }

    // Land size filter (min/max)
    if (filters.landSizeMin || filters.landSizeMax) {
      filtered = filtered.filter((property) => {
        const landSize = property.landSize || 0;
        const min = filters.landSizeMin ? parseFloat(filters.landSizeMin) : 0;
        const max = filters.landSizeMax
          ? parseFloat(filters.landSizeMax)
          : Infinity;
        return landSize >= min && landSize <= max;
      });
    }

    // Build size filter (min/max)
    if (filters.buildSizeMin || filters.buildSizeMax) {
      filtered = filtered.filter((property) => {
        const buildSize = property.buildSize || 0;
        const min = filters.buildSizeMin ? parseFloat(filters.buildSizeMin) : 0;
        const max = filters.buildSizeMax
          ? parseFloat(filters.buildSizeMax)
          : Infinity;
        return buildSize >= min && buildSize <= max;
      });
    }

    // Bedrooms filter (min/max)
    if (filters.bedMin || filters.bedMax) {
      filtered = filtered.filter((property) => {
        const beds = property.bed || 0;
        const min = filters.bedMin ? parseInt(filters.bedMin) : 0;
        const max = filters.bedMax ? parseInt(filters.bedMax) : Infinity;
        return beds >= min && beds <= max;
      });
    }

    // Bathrooms filter (min/max)
    if (filters.bathMin || filters.bathMax) {
      filtered = filtered.filter((property) => {
        const baths = property.bath || 0;
        const min = filters.bathMin ? parseInt(filters.bathMin) : 0;
        const max = filters.bathMax ? parseInt(filters.bathMax) : Infinity;
        return baths >= min && baths <= max;
      });
    }

    // Garage filter (min/max)
    if (filters.garageMin || filters.garageMax) {
      filtered = filtered.filter((property) => {
        const garage = property.garage || 0;
        const min = filters.garageMin ? parseInt(filters.garageMin) : 0;
        const max = filters.garageMax ? parseInt(filters.garageMax) : Infinity;
        return garage >= min && garage <= max;
      });
    }

    // Price filter (min/max)
    if (filters.priceMin || filters.priceMax) {
      filtered = filtered.filter((property) => {
        const price = property.price || 0;
        const min = filters.priceMin ? parseFloat(filters.priceMin) : 0;
        const max = filters.priceMax ? parseFloat(filters.priceMax) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Registration & Construction Status filter
    if (filters.registrationConstructionStatus) {
      console.log("📋 Registration Status filter:", {
        filterStatus: filters.registrationConstructionStatus,
        samplePropertyStatuses: filtered
          .slice(0, 5)
          .map((p) => ({ id: p.id, status: p.registrationConstructionStatus })),
      });
      filtered = filtered.filter((property) => {
        const propertyStatus =
          property.registrationConstructionStatus?.toLowerCase() || "";
        const filterStatus =
          filters.registrationConstructionStatus.toLowerCase();

        // Debug logging
        console.log(
          `Filtering: property="${propertyStatus}", filter="${filterStatus}"`
        );

        // Exact match first
        if (propertyStatus === filterStatus) return true;

        // Handle specific status matching more precisely
        if (filterStatus === "registered") {
          // Only match truly registered statuses
          return (
            propertyStatus === "registered" ||
            propertyStatus === "re-registered" ||
            propertyStatus === "re registered" ||
            propertyStatus === "rego" ||
            propertyStatus === "reg" ||
            (propertyStatus.startsWith("reg") &&
              !propertyStatus.includes("unreg"))
          );
        }

        if (filterStatus === "unregistered") {
          // Only match truly unregistered statuses
          return (
            propertyStatus === "unregistered" ||
            propertyStatus === "un-registered" ||
            propertyStatus === "un registered" ||
            propertyStatus === "unreg" ||
            propertyStatus === "not registered" ||
            propertyStatus.startsWith("unreg") ||
            propertyStatus.startsWith("un-reg") ||
            propertyStatus.startsWith("un reg")
          );
        }
        if (filterStatus === "under construction") {
          return (
            propertyStatus === "under construction" ||
            propertyStatus === "under-construction" ||
            propertyStatus === "construction" ||
            propertyStatus === "building" ||
            propertyStatus.includes("construction")
          );
        }
        if (filterStatus === "completed") {
          return (
            propertyStatus === "completed" ||
            propertyStatus === "complete" ||
            propertyStatus === "constructed" ||
            propertyStatus === "finished" ||
            propertyStatus.includes("completed") ||
            propertyStatus.includes("complete")
          );
        }

        // Partial match for other statuses
        return (
          propertyStatus.includes(filterStatus) ||
          filterStatus.includes(propertyStatus)
        );
      });
    }

    // Apply sorting

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle numeric values (including string numbers)
      const aNum =
        typeof aValue === "number" ? aValue : parseFloat(aValue) || 0;
      const bNum =
        typeof bValue === "number" ? bValue : parseFloat(bValue) || 0;

      if (!isNaN(aNum) && !isNaN(bNum)) {
        const result = sortOrder === "asc" ? aNum - bNum : bNum - aNum;
        return result;
      }

      // Handle date values
      if (sortBy === "regoDue" || sortBy === "readyBy") {
        const aDate = aValue ? new Date(aValue).getTime() : 0;
        const bDate = bValue ? new Date(bValue).getTime() : 0;
        const result = sortOrder === "asc" ? aDate - bDate : bDate - aDate;
        return result;
      }

      // Handle string values
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
        if (sortOrder === "asc") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }

      // Handle undefined/null values
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      return 0;
    });

    console.log("🔍 applyFilters result:", {
      originalCount: properties.length,
      filteredCount: filtered.length,
      sampleFiltered: filtered
        .slice(0, 2)
        .map((p) => ({ id: p.id, address: p.address, suburb: p.suburb })),
    });

    setFilteredProperties(filtered);
  };

  const LISTINGS_API_URL =
    "https://868qsxaw23.execute-api.us-east-2.amazonaws.com/Prod/listings";

  const parseCsv = (csv: string): Record<string, string>[] => {
    const rows: Record<string, string>[] = [];
    if (!csv) return rows;

    console.log("🔍 Dashboard parsing CSV, length:", csv.length);

    // Use robust CSV parsing that handles quoted multi-line fields
    const lines: string[] = [];
    let currentLine = "";
    let inQuotes = false;
    let i = 0;

    while (i < csv.length) {
      const char = csv[i];
      const nextChar = csv[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote within quoted field
          currentLine += '"';
          i += 2; // Skip both quotes
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          currentLine += char;
          i++;
        }
      } else if (char === "\n" && !inQuotes) {
        // End of line only if not in quotes
        lines.push(currentLine);
        currentLine = "";
        i++;
      } else if (char === "\r" && nextChar === "\n" && !inQuotes) {
        // Handle \r\n line endings
        lines.push(currentLine);
        currentLine = "";
        i += 2; // Skip both \r and \n
      } else {
        // Any other character (including newlines within quotes)
        currentLine += char;
        i++;
      }
    }

    // Add the last line if it exists
    if (currentLine.trim()) {
      lines.push(currentLine);
    }

    console.log("🔍 Dashboard parsed lines count:", lines.length);
    console.log("🔍 Dashboard first few lines:", lines.slice(0, 3));

    if (lines.length === 0) return rows;
    const headers = splitCsvLine(lines[0]);
    console.log("🔍 Dashboard headers:", headers);

    for (let i = 1; i < lines.length; i += 1) {
      const values = splitCsvLine(lines[i]);
      console.log(
        `🔍 Dashboard row ${i} values count:`,
        values.length,
        "Expected:",
        headers.length
      );

      if (values.length === 0) continue;
      if (values.length === headers.length) {
        const record: Record<string, string> = {};
        headers.forEach((h, idx) => {
          record[h] = values[idx] ?? "";
        });
        rows.push(record);
      } else {
        console.warn(
          `⚠️ Dashboard row ${i} has ${values.length} values but expected ${headers.length}. Skipping row.`
        );
        console.warn("Row content:", lines[i].substring(0, 200) + "...");
      }
    }

    console.log("🔍 Dashboard final parsed rows count:", rows.length);
    return rows;
  };

  const splitCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote within quoted field
          current += '"';
          i += 2; // Skip both quotes
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === "," && !inQuotes) {
        // Field separator
        result.push(current);
        current = "";
        i++;
      } else {
        // Regular character (including newlines, tabs, emojis, punctuation, etc.)
        current += char;
        i++;
      }
    }

    // Add the last field
    result.push(current);
    return result.map((s) => s.trim());
  };

  const toNumber = (val: string) => {
    if (val === undefined || val === null || val === "") return undefined;
    const n = Number(val);
    return Number.isFinite(n) ? n : undefined;
  };

  const loadPropertiesFromApi = async () => {
    setIsLoading(true);
    try {
      // Try without auth first; if it fails, retry with auth header
      let response = await fetch(LISTINGS_API_URL);
      if (!response.ok) {
        const authHeaders = await getAuthHeader().catch(() => ({} as any));
        response = await fetch(LISTINGS_API_URL, {
          headers: { ...(authHeaders || {}) },
        });
      }
      if (!response.ok) {
        throw new Error(`Failed to load listings: HTTP ${response.status}`);
      }
      const data = await response.json();
      const csv: string = typeof data === "string" ? data : data.csv ?? "";
      if (data && data.versionId) setListingsVersionId(data.versionId);
      const rows = parseCsv(csv);
      console.log("📊 Loaded CSV rows:", rows.length);
      console.log(
        "📊 Sample row with description:",
        rows.find((r) => r.description) || "No description found"
      );
      // Helper: detect valid JSON array string of strings
      const isJsonStringArray = (val: string) => {
        try {
          const parsed = JSON.parse(val);
          return (
            Array.isArray(parsed) && parsed.every((x) => typeof x === "string")
          );
        } catch {
          return false;
        }
      };

      // Helper: convert legacy bracketed list [a,b,c] -> JSON array ["a","b","c"]
      // PRESERVE item contents exactly; do not trim or mutate names
      const convertLegacyBracketList = (val: string): string | null => {
        if (typeof val !== "string") return null;
        const s = val;
        if (s.startsWith("[") && s.endsWith("]") && !isJsonStringArray(s)) {
          const inner = s.slice(1, -1);
          if (inner === "") return "[]";
          const items = inner.split(","); // no trimming to preserve names exactly
          return JSON.stringify(items);
        }
        return null;
      };

      const mapped = rows
        .map((r) => ({
          id: r.id,
          propertyType: r.propertyType || r.property_type || "",
          lot: r.lot,
          address: r.address,
          suburb: r.suburb || "",
          availability: r.availability || "",
          frontage: toNumber(r.frontage) || toNumber(r.frontage_m),
          landSize: toNumber(r.landSize) || toNumber(r.land_area_sqm),
          buildSize: toNumber(r.buildSize) || toNumber(r.build_area_sqm),
          bed: toNumber(r.bed),
          bath: toNumber(r.bath),
          garage: toNumber(r.garage),
          registrationConstructionStatus:
            r.registrationConstructionStatus ||
            r.regoDue ||
            r.rego_due ||
            r.readyBy ||
            r.ready_by ||
            "",
          price: toNumber(r.price) || toNumber(r.price_guide),
          media: r.media || r.media_url || "",
          remark: r.remark || "",
          description: r.description || "",
          updatedAt: r.updatedAt || r.updated_at || "",
          propertyCustomerVisibility: r.propertyCustomerVisibility || "1",
          priceCustomerVisibility: r.priceCustomerVisibility || "0",
        }))
        .filter((p) => p.lot || p.address);
      console.log(
        "📊 Mapped properties with descriptions:",
        mapped.filter((p) => p.description).length
      );
      console.log(
        "📊 Sample mapped property with description:",
        mapped.find((p) => p.description) ||
          "No mapped property with description"
      );

      // Normalize legacy media format to JSON arrays without altering item content
      let changed = false;
      const normalized = mapped.map((p) => {
        if (p.media && typeof p.media === "string") {
          if (!isJsonStringArray(p.media)) {
            const converted = convertLegacyBracketList(p.media);
            if (converted !== null) {
              changed = true;
              return { ...p, media: converted };
            }
          }
        }
        return p;
      });

      setProperties(normalized);
      setMessage(null);

      // Persist normalization back to S3 once
      if (changed) {
        console.log("🔄 Normalized legacy media format -> saving back to S3");
        try {
          await autoSaveToS3(normalized);
          console.log("✅ Normalized media saved");
        } catch (e) {
          console.warn("⚠️ Failed to persist normalized media:", e);
        }
      }
    } catch (err: any) {
      console.error("Error loading listings from API:", err);
      setMessage({
        type: "error",
        text: err.message || "Failed to load properties",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const CSV_HEADERS = [
    "id",
    "propertyType",
    "lot",
    "address",
    "suburb",
    "availability",
    "frontage",
    "landSize",
    "buildSize",
    "bed",
    "bath",
    "garage",
    "registrationConstructionStatus",
    "price",
    "media",
    "remark",
    "description",
    "updated_at",
    "propertyCustomerVisibility",
    "priceCustomerVisibility",
  ];

  const csvEscape = (value: any): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);

    // Check if the string contains any characters that require CSV escaping
    // This includes: quotes, commas, newlines, carriage returns, tabs, and other control characters
    // We escape ANY string that contains quotes, commas, or newlines to be safe
    if (/[",\n\r\t]/.test(str)) {
      // Escape quotes by doubling them and wrap in quotes
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const generateCsvFromProperties = (items: any[]): string => {
    const lines: string[] = [];
    lines.push(CSV_HEADERS.join(","));
    for (const p of items) {
      const row = [
        p.id ?? "",
        p.propertyType ?? "",
        p.lot ?? "",
        p.address ?? "",
        p.suburb ?? "",
        p.availability ?? "",
        p.frontage ?? "",
        p.landSize ?? "",
        p.buildSize ?? "",
        p.bed ?? "",
        p.bath ?? "",
        p.garage ?? "",
        p.registrationConstructionStatus ?? "",
        p.price ?? "",
        p.media ?? "",
        p.remark ?? "",
        p.description ?? "",
        p.updatedAt ?? "",
        p.propertyCustomerVisibility ?? "1",
        p.priceCustomerVisibility ?? "0",
      ].map(csvEscape);

      // Debug logging for description field
      if (p.description && p.description.length > 0) {
        console.log(
          `📝 CSV Row for ${p.address}: description = "${p.description}"`
        );
      }

      lines.push(row.join(","));
    }
    return lines.join("\n") + "\n";
  };

  // CSV upload handling functions

  // Property editing handlers
  const handleEditProperty = (property: any) => {
    console.log("🔍 Editing property:", property);
    console.log("📝 Property description:", property.description);
    setEditingProperty(property);
    setPropertyForm({
      propertyType: property.propertyType || property.typeOfProperty || "",
      lot: property.lot || "",
      address: property.address || "",
      suburb: property.suburb || "",
      availability: property.availability || "",
      frontage: property.frontage || "",
      landSize: property.landSize || property.land || "",
      buildSize: property.buildSize || property.build || "",
      bed: property.bed || "",
      bath: property.bath || "",
      garage: property.garage || "",
      registrationConstructionStatus:
        property.registrationConstructionStatus ||
        property.regoDue ||
        property.readyBy ||
        "",
      price: property.price || property.priceGuide || "",
      media: property.media || "",
      remark: property.remark || "",
      description: property.description || "",
      propertyCustomerVisibility: property.propertyCustomerVisibility || "1",
      priceCustomerVisibility: property.priceCustomerVisibility || "0",
    });

    // Clear any existing media files when editing
    setMediaFiles([]);
    setShowPropertyForm(true);

    // Log existing media for debugging
    if (property.media) {
      try {
        const existingMedia = JSON.parse(property.media);
        console.log("Editing property with existing media:", existingMedia);
      } catch (error) {
        console.warn("Error parsing existing media for edit:", error);
      }
    }
  };

  const handleNewProperty = () => {
    setEditingProperty(null);
    setPropertyForm({
      propertyType: "",
      lot: "",
      address: "",
      suburb: "",
      availability: "",
      frontage: "",
      landSize: "",
      buildSize: "",
      bed: "",
      bath: "",
      garage: "",
      registrationConstructionStatus: "",
      price: "",
      media: "",
      remark: "",
      description: "",
      propertyCustomerVisibility: "1",
      priceCustomerVisibility: "0",
    });
    setShowPropertyForm(true);
  };

  const handlePropertyFormChange = (field: string, value: string) => {
    console.log(`📝 Form change: ${field} = "${value}"`);
    setPropertyForm((prev: any) => {
      const updated = { ...prev, [field]: value };
      console.log("📝 Updated form state:", updated);
      return updated;
    });
  };

  const handlePropertyFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!propertyForm.address) {
      setMessage({ type: "error", text: "Address is a required field." });
      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    // Check for duplicate addresses
    if (
      isDuplicateAddress(
        propertyForm.address,
        propertyForm.lot,
        propertyForm.suburb,
        properties,
        editingProperty?.id
      )
    ) {
      setMessage({
        type: "error",
        text: "Address already exists in this suburb! Please use a different address or edit the existing property.",
      });
      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    try {
      let mediaKeys: string[] = [];

      // Upload media files if any are selected
      if (mediaFiles.length > 0) {
        const listingId = propertyForm.id || `new_${Date.now()}`;
        mediaKeys = await uploadAllMedia(listingId);
      }

      // Create property object with media keys
      const propertyData = {
        ...propertyForm,
        id:
          editingProperty?.id ||
          `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        media: "",
        updatedAt: new Date().toISOString().split("T")[0],
      };

      console.log("💾 Saving property data:", propertyData);
      console.log("📝 Description being saved:", propertyData.description);

      if (editingProperty) {
        // Update existing property - preserve existing media and add new media
        let finalMediaKeys: string[] = [];

        // Parse existing media if any (use current editingProperty state which may have been updated)
        if (editingProperty.media) {
          try {
            const existingMedia = JSON.parse(editingProperty.media);
            if (Array.isArray(existingMedia)) {
              finalMediaKeys = [...existingMedia];
            }
          } catch (error) {
            console.warn("Error parsing existing media:", error);
          }
        }

        // Add new media keys
        if (mediaKeys.length > 0) {
          finalMediaKeys = [...finalMediaKeys, ...mediaKeys];
        }

        // Set the final media
        propertyData.media =
          finalMediaKeys.length > 0 ? JSON.stringify(finalMediaKeys) : "";

        const updatedProperties = properties.map((p) =>
          p.id === editingProperty.id ? propertyData : p
        );
        setProperties(updatedProperties);
        setFilteredProperties(updatedProperties);
        await autoSaveToS3(updatedProperties);

        // Show success message with media info
        const existingCount = finalMediaKeys.length - mediaKeys.length;
        let messageText = `Property updated successfully!`;
        if (existingCount > 0) {
          messageText += ` ${existingCount} existing media files preserved.`;
        }
        if (mediaKeys.length > 0) {
          messageText += ` ${mediaKeys.length} new media files added.`;
        }
        setMessage({ type: "success", text: messageText });
        setTimeout(() => setMessage(null), 3000); // Clear message after 3 seconds
      } else {
        // Add new property
        propertyData.media =
          mediaKeys.length > 0 ? JSON.stringify(mediaKeys) : "";
        const updatedProperties = [...properties, propertyData];
        setProperties(updatedProperties);
        setFilteredProperties(updatedProperties);
        await autoSaveToS3(updatedProperties);

        // Show success message
        let messageText = `New property added successfully!`;
        if (mediaKeys.length > 0) {
          messageText += ` ${mediaKeys.length} media files uploaded.`;
        }
        setMessage({ type: "success", text: messageText });
        setTimeout(() => setMessage(null), 3000); // Clear message after 3 seconds
      }

      // Clear form and media files
      setPropertyForm({
        propertyType: "",
        lot: "",
        address: "",
        suburb: "",
        availability: "",
        frontage: "",
        landSize: "",
        buildSize: "",
        bed: "",
        bath: "",
        garage: "",
        registrationConstructionStatus: "",
        price: "",
        media: "",
        remark: "",
        description: "",
        propertyCustomerVisibility: "1",
        priceCustomerVisibility: "0",
      });
      setMediaFiles([]);
      setMediaUploadProgress({});
      setMediaUploadErrors({});

      setShowPropertyForm(false);
      setEditingProperty(null);
    } catch (error: any) {
      console.error("Error saving property:", error);
      setMessage({
        type: "error",
        text: `Error saving property: ${error.message}`,
      });
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    console.log("Delete property called with ID:", propertyId);
    console.log("Current properties:", properties);
    console.log("hasEditAccess:", hasEditAccess);

    if (!hasEditAccess) {
      console.log("User does not have edit access");
      setMessage({
        type: "error",
        text: "You do not have permission to delete properties",
      });
      return;
    }

    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        const updatedProperties = properties.filter((p) => p.id !== propertyId);
        console.log("Properties after deletion:", updatedProperties);

        // Update state first
        setProperties(updatedProperties);
        setFilteredProperties(updatedProperties);

        // Auto-save to S3 with the updated properties
        await autoSaveToS3(updatedProperties);

        console.log("Property deleted successfully");
      } catch (error: any) {
        console.error("Error deleting property:", error);
        setMessage({
          type: "error",
          text: `Error deleting property: ${error.message}`,
        });
      }
    }
  };

  // Auto-save function that runs after every change
  const autoSaveToS3 = async (propertiesToSave?: any[]) => {
    if (!hasEditAccess) return;

    // Always use the original properties array for saving to S3
    const propertiesToUse = propertiesToSave || properties;

    console.log("Auto-saving to S3...", {
      propertiesCount: propertiesToUse.length,
      properties: propertiesToUse,
      currentVersionId: listingsVersionId,
    });

    try {
      const csvText = generateCsvFromProperties(propertiesToUse);
      console.log("Generated CSV:", csvText.substring(0, 200) + "...");

      const authHeaders = await getAuthHeader().catch(() => ({} as any));
      const response = await fetch(LISTINGS_API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(authHeaders || {}),
        },
        body: JSON.stringify({
          csv: csvText,
          expectedVersionId: listingsVersionId,
        }),
      });

      console.log("S3 PUT response status:", response.status);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          err.error || `Auto-save failed: HTTP ${response.status}`
        );
      }

      const result = await response.json();
      console.log("S3 PUT success:", result);

      if (result && result.versionId) {
        setListingsVersionId(result.versionId);
        console.log("Updated version ID:", result.versionId);
      }

      // Show success message briefly for auto-save
      setMessage({ type: "success", text: "Successfully updated!" });
      setTimeout(() => setMessage(null), 2000); // Clear message after 2 seconds
    } catch (err: any) {
      console.error("Auto-save error:", err);
      setMessage({ type: "error", text: `Upload failed: ${err.message}` });
      setTimeout(() => setMessage(null), 5000); // Clear error message after 5 seconds
    }
  };

  // Media upload functions
  const handleMediaFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log("Media file selection triggered");
    const files = Array.from(event.target.files || []);
    console.log("Selected files:", files);

    const validFiles = files.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") ||
        file.type.startsWith("video/") ||
        file.type === "application/pdf";
      const isValidSize = file.size <= 15 * 1024 * 1024; // 15MB limit

      console.log("File validation:", {
        name: file.name,
        type: file.type,
        size: file.size,
        isValidType,
        isValidSize,
      });

      if (!isValidType) {
        alert(
          `Invalid file type: ${file.type}. Only images, videos, and PDFs are allowed.`
        );
        return false;
      }

      if (!isValidSize) {
        alert(
          `File too large: ${(file.size / 1024 / 1024).toFixed(
            2
          )}MB. Maximum size is 15MB.`
        );
        return false;
      }

      return true;
    });

    console.log("Valid files:", validFiles);
    setMediaFiles((prev) => [...prev, ...validFiles]);
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteCurrentMedia = async () => {
    if (!viewingMedia[currentMediaIndex]) return;

    const mediaKey = viewingMedia[currentMediaIndex];
    const fileName = mediaKey?.split("/").pop() || "this file";

    if (
      window.confirm(
        `Are you sure you want to delete "${fileName}"? This action cannot be undone.`
      )
    ) {
      try {
        // Find the property that contains this media
        const propertyWithMedia = properties.find((p) => {
          if (p.media) {
            try {
              const mediaKeys = JSON.parse(p.media);
              return Array.isArray(mediaKeys) && mediaKeys.includes(mediaKey);
            } catch (error) {
              return false;
            }
          }
          return false;
        });

        if (propertyWithMedia) {
          // Remove the media from the property
          const currentMedia = JSON.parse(propertyWithMedia.media);
          const updatedMedia = currentMedia.filter(
            (key: string) => key !== mediaKey
          );

          const updatedProperty = {
            ...propertyWithMedia,
            media: updatedMedia.length > 0 ? JSON.stringify(updatedMedia) : "",
          };

          // Update the properties list
          const updatedProperties = properties.map((p) =>
            p.id === propertyWithMedia.id ? updatedProperty : p
          );

          setProperties(updatedProperties);
          setFilteredProperties(updatedProperties);

          // Update the viewing media array
          const updatedViewingMedia = viewingMedia.filter(
            (key) => key !== mediaKey
          );
          setViewingMedia(updatedViewingMedia);

          // Reset current media index if needed
          if (updatedViewingMedia.length === 0) {
            setShowMediaViewer(false);
            setCurrentMediaIndex(0);
          } else if (currentMediaIndex >= updatedViewingMedia.length) {
            setCurrentMediaIndex(updatedViewingMedia.length - 1);
          }

          // Save to S3
          await autoSaveToS3(updatedProperties);

          // Show success message
          setMessage({
            type: "success",
            text: `"${fileName}" deleted successfully.`,
          });
          setTimeout(() => setMessage(null), 3000);
        }
      } catch (error) {
        console.error("Error deleting media:", error);
        setMessage({
          type: "error",
          text: `Failed to delete "${fileName}": ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        });
        setTimeout(() => setMessage(null), 5000);
      }
    }
  };

  // const showExistingMediaList = (existingMedia: string[]) => { // Unused
  //   // Open the media viewer with existing media
  //   setViewingMedia(existingMedia);
  //   setCurrentMediaIndex(0);
  //   setShowMediaViewer(true);
  // };

  const removeExistingMedia = (mediaKey: string, existingMedia: string[]) => {
    const fileName = mediaKey?.split("/").pop() || "this file";

    if (
      window.confirm(
        `Are you sure you want to remove "${fileName}"? This action cannot be undone.`
      )
    ) {
      try {
        const updatedMedia = existingMedia.filter((key) => key !== mediaKey);
        const updatedProperty = {
          ...editingProperty,
          media: updatedMedia.length > 0 ? JSON.stringify(updatedMedia) : "",
        };
        setEditingProperty(updatedProperty);

        // Update the form to reflect the change
        setPropertyForm((prev: any) => ({
          ...prev,
          media: updatedProperty.media,
        }));

        // Show feedback message
        setMessage({
          type: "success",
          text: `"${fileName}" removed from existing media.`,
        });
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        console.warn("Error removing existing media:", error);
      }
    }
  };

  // Smooth swap animation functions
  const moveMediaUp = (index: number) => {
    if (index === 0 || swapAnimation !== null) return; // Can't move first item up or if already animating

    // Start swap animation
    setSwapAnimation({
      index1: index, // Item moving up
      index2: index - 1, // Item moving down
    });

    // After animation completes, update the data
    setTimeout(() => {
      try {
        if (editingProperty && editingProperty.media) {
          const existingMedia = JSON.parse(editingProperty.media);
          const reorderedMedia = [...existingMedia];

          // Swap with previous item
          [reorderedMedia[index - 1], reorderedMedia[index]] = [
            reorderedMedia[index],
            reorderedMedia[index - 1],
          ];

          const updatedProperty = {
            ...editingProperty,
            media: JSON.stringify(reorderedMedia),
          };

          setEditingProperty(updatedProperty);

          // Update the form to reflect the change
          setPropertyForm((prev: any) => ({
            ...prev,
            media: updatedProperty.media,
          }));

          // Auto-save
          autoSaveToS3();
        }
      } catch (error: any) {
        console.error("Error moving media up:", error);
        setMessage({
          type: "error",
          text: `Error moving media: ${error.message}`,
        });
        setTimeout(() => setMessage(null), 5000);
      }

      // Clear animation state
      setSwapAnimation(null);
    }, 600); // Wait for animation to complete
  };

  const moveMediaDown = (index: number, totalLength: number) => {
    if (index === totalLength - 1 || swapAnimation !== null) return; // Can't move last item down or if already animating

    // Start swap animation
    setSwapAnimation({
      index1: index, // Item moving down
      index2: index + 1, // Item moving up
    });

    // After animation completes, update the data
    setTimeout(() => {
      try {
        if (editingProperty && editingProperty.media) {
          const existingMedia = JSON.parse(editingProperty.media);
          const reorderedMedia = [...existingMedia];

          // Swap with next item
          [reorderedMedia[index], reorderedMedia[index + 1]] = [
            reorderedMedia[index + 1],
            reorderedMedia[index],
          ];

          const updatedProperty = {
            ...editingProperty,
            media: JSON.stringify(reorderedMedia),
          };

          setEditingProperty(updatedProperty);

          // Update the form to reflect the change
          setPropertyForm((prev: any) => ({
            ...prev,
            media: updatedProperty.media,
          }));

          // Auto-save
          autoSaveToS3();
        }
      } catch (error: any) {
        console.error("Error moving media down:", error);
        setMessage({
          type: "error",
          text: `Error moving media: ${error.message}`,
        });
        setTimeout(() => setMessage(null), 5000);
      }

      // Clear animation state
      setSwapAnimation(null);
    }, 600); // Wait for animation to complete
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Sanitize filename to remove spaces and special characters that could cause loading issues
  const sanitizeFilename = (filename: string): string => {
    // Extract the file extension
    const lastDotIndex = filename.lastIndexOf(".");
    const name =
      lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;
    const extension =
      lastDotIndex !== -1 ? filename.substring(lastDotIndex) : "";

    // Sanitize the name part:
    // 1. Replace spaces with underscores
    // 2. Remove or replace special characters that could cause issues
    // 3. Keep only alphanumeric characters, underscores, hyphens, and periods
    const sanitizedName = name
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace special chars with underscores
      .replace(/_+/g, "_") // Replace multiple underscores with single underscore
      .replace(/^_+|_+$/g, ""); // Remove leading/trailing underscores

    // Ensure we don't end up with an empty filename
    const finalName = sanitizedName || "file";

    console.log(
      `📝 Sanitized filename: "${filename}" → "${finalName}${extension}"`
    );
    return `${finalName}${extension}`;
  };

  const uploadMediaToS3 = async (
    file: File,
    listingId: string
  ): Promise<string> => {
    try {
      console.log(
        `Starting upload for file: ${file.name} (${(
          file.size /
          1024 /
          1024
        ).toFixed(2)}MB)`
      );

      // Sanitize the filename to prevent loading issues
      const sanitizedFilename = sanitizeFilename(file.name);

      // Check if file is too large for base64 encoding (keep under 15MB for base64)
      const maxSizeForBase64 = 15 * 1024 * 1024; // 15MB
      if (file.size > maxSizeForBase64) {
        throw new Error(
          `File too large for upload: ${(file.size / 1024 / 1024).toFixed(
            2
          )}MB. Maximum size for videos is 15MB.`
        );
      }

      const base64Data = await convertFileToBase64(file);
      console.log(
        `File converted to base64, size: ${(
          (base64Data.length * 0.75) /
          1024 /
          1024
        ).toFixed(2)}MB`
      );

      const payload = {
        filename: sanitizedFilename, // Use sanitized filename
        contentType: file.type,
        listingId: listingId,
        dataBase64: base64Data,
      };

      console.log("Sending upload request...");
      const response = await fetch(
        "https://868qsxaw23.execute-api.us-east-2.amazonaws.com/Prod/media",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log(`Upload response status: ${response.status}`);
      console.log(`Upload response headers:`, response.headers);

      if (!response.ok) {
        let errorMessage = `Upload failed: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.warn("Could not parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log(
        `Upload successful for "${file.name}" (sanitized: "${sanitizedFilename}"):`,
        result
      );
      return result.key; // Return the S3 key for CSV storage
    } catch (error: any) {
      console.error(`Upload failed for ${file.name}:`, error);
      throw new Error(`Media upload failed: ${error.message}`);
    }
  };

  const uploadAllMedia = async (listingId: string): Promise<string[]> => {
    console.log("Starting media upload for listing:", listingId);
    console.log("Files to upload:", mediaFiles);

    const uploadedKeys: string[] = [];

    for (const file of mediaFiles) {
      try {
        console.log(`Uploading file: ${file.name}`);
        setMediaUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        const key = await uploadMediaToS3(file, listingId);
        console.log(`Successfully uploaded ${file.name} with key: ${key}`);
        uploadedKeys.push(key);

        setMediaUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
      } catch (error: any) {
        console.error(`Failed to upload ${file.name}:`, error);
        setMediaUploadErrors((prev) => ({
          ...prev,
          [file.name]: error.message,
        }));
      }
    }

    console.log("Upload complete. Total keys:", uploadedKeys);
    return uploadedKeys;
  };

  // const deleteMediaFromS3 = async (key: string): Promise<boolean> => { // Commented out as unused
  //   try {
  //     console.log('Attempting to delete media with key:', key);
  //
  //     const response = await fetch('https://868qsxaw23.execute-api.us-east-2.amazonaws.com/Prod/media', {
  //       method: 'DELETE',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ key })
  //     });

  //     console.log('Delete response status:', response.status);
  //     console.log('Delete response headers:', response.headers);

  //     if (!response.ok) {
  //       const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
  //       console.error('Delete failed with error:', errorData);
  //       throw new Error(errorData.error || `Delete failed: ${response.status}`);
  //     }

  //     const successData = await response.json().catch(() => ({ ok: true }));
  //     console.log('Delete successful:', successData);
  //     return true;
  //   } catch (error: any) {
  //     console.error(`Failed to delete media ${key}:`, error);
  //     return false;
  //   }
  // };

  // Build direct CloudFront URL for media key
  const buildCloudFrontUrl = (mediaKey: string): string => {
    const base = "https://dx9e0rbpjsaqb.cloudfront.net/";
    const key = mediaKey.startsWith("/") ? mediaKey.slice(1) : mediaKey;
    return `${base}${key}`;
  };

  // Media viewer functions
  const openMediaViewer = async (property: any) => {
    if (!property.media) return;

    try {
      const mediaKeys = JSON.parse(property.media);
      if (mediaKeys.length === 0) return;

      // Build CloudFront URLs for all media keys
      const cdnUrls: { [key: string]: string } = {};
      for (const key of mediaKeys) {
        cdnUrls[key] = buildCloudFrontUrl(key);
      }
      setMediaPresignedUrls(cdnUrls);
      setViewingMedia(mediaKeys);
      setCurrentMediaIndex(0);
      setShowMediaViewer(true);
    } catch (error: any) {
      console.error("Error opening media viewer:", error);
      alert("Failed to load media. Please try again.");
    }
  };

  // Function to open media in new window
  const openMediaInNewWindow = (mediaKey: string) => {
    const url = mediaPresignedUrls[mediaKey] || buildCloudFrontUrl(mediaKey);
    if (!url) {
      alert("Media not available. Please try viewing it again.");
      return;
    }

    // Simply open the presigned URL in a new window/tab
    // This will use the browser's default viewer for each file type
    window.open(url, "_blank");
  };

  const nextMedia = useCallback(() => {
    if (viewingMedia.length <= 1) return;
    setCurrentMediaIndex((prev) =>
      prev === viewingMedia.length - 1 ? 0 : prev + 1
    );
  }, [viewingMedia.length]);

  const prevMedia = useCallback(() => {
    if (viewingMedia.length <= 1) return;
    setCurrentMediaIndex((prev) =>
      prev === 0 ? viewingMedia.length - 1 : prev - 1
    );
  }, [viewingMedia.length]);

  const closeMediaViewer = useCallback(() => {
    setShowMediaViewer(false);
    setViewingMedia([]);
    setCurrentMediaIndex(0);
    setMediaPresignedUrls({});
  }, []);

  // Handle keyboard navigation for media viewer
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showMediaViewer) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          prevMedia();
          break;
        case "ArrowRight":
          event.preventDefault();
          nextMedia();
          break;
        case "Escape":
          event.preventDefault();
          closeMediaViewer();
          break;
      }
    };

    if (showMediaViewer) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [showMediaViewer, prevMedia, nextMedia, closeMediaViewer]);

  const downloadMedia = () => {
    if (!viewingMedia[currentMediaIndex]) return;

    const mediaKey = viewingMedia[currentMediaIndex];
    const presignedUrl =
      mediaPresignedUrls[mediaKey] || buildCloudFrontUrl(mediaKey);

    if (!presignedUrl) {
      alert("Media not available for download. Please try viewing it again.");
      return;
    }

    const filename = mediaKey?.split("/").pop() || "media-file";

    // Create a temporary link element for download
    const link = document.createElement("a");
    link.href = presignedUrl;
    link.download = filename;
    link.target = "_blank";

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle media deletion from table - commented out as unused
  /*
  const handleDeleteMedia = async (property: any, mediaKey: string) => {
    // Additional safety check for access control
    if (!hasEditAccess) {
      alert('You do not have permission to delete media files.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this media file?')) {
      return;
    }

    try {
      console.log('Starting media deletion for:', mediaKey);
      console.log('Property before deletion:', property);
      
      const deleteSuccess = await deleteMediaFromS3(mediaKey);
      
      if (!deleteSuccess) {
        throw new Error('Failed to delete media from S3');
      }
      
      console.log('Media deleted from S3 successfully');
      
      // Update the properties state by removing the deleted media key
      const updatedProperties = properties.map(p => {
        if (p.id === property.id) {
          const currentMedia = p.media ? JSON.parse(p.media) : [];
          console.log('Current media keys:', currentMedia);
          const updatedMedia = currentMedia.filter((key: string) => key !== mediaKey);
          console.log('Updated media keys:', updatedMedia);
          return {
            ...p,
            media: JSON.stringify(updatedMedia)
          };
        }
        return p;
      });
      
      console.log('Updating properties state...');
      setProperties(updatedProperties);
      
      console.log('Auto-saving to S3...');
      await autoSaveToS3(updatedProperties);
      console.log('Auto-save completed');
    } catch (error: any) {
      console.error('Error deleting media:', error);
      alert(`Error deleting media: ${error.message}`);
    }
  };
  */

  // Render media column with view and delete options
  const renderMediaColumn = (property: any) => {
    if (!property.media) return <td>-</td>;

    try {
      const mediaKeys = JSON.parse(property.media);
      if (mediaKeys.length === 0) return <td>-</td>;

      return (
        <td>
          <div className="media-controls">
            <button
              className="view-media-btn"
              onClick={() => openMediaViewer(property)}
              title="View all media"
            >
              ⛶ View Media ({mediaKeys.length})
            </button>
          </div>
        </td>
      );
    } catch (error) {
      console.error("Error parsing media:", error);
      return <td>Error</td>;
    }
  };

  const handleInputChange = (field: keyof NewUser, value: string) => {
    setNewUser((prev: NewUser) => ({ ...prev, [field]: value }));
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      quickSearch: "",
      suburb: "",
      propertyType: "",
      availability: "",
      frontageMin: "",
      frontageMax: "",
      landSizeMin: "",
      landSizeMax: "",
      buildSizeMin: "",
      buildSizeMax: "",
      bedMin: "",
      bedMax: "",
      bathMin: "",
      bathMax: "",
      garageMin: "",
      garageMax: "",
      priceMin: "",
      priceMax: "",
      registrationConstructionStatus: "",
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter((value) => value !== "").length;
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newUser.password !== newUser.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (newUser.password.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters long",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Verify authentication before proceeding
      const isAuthValid = await verifyAuthBeforeUserCreation();
      if (!isAuthValid) {
        setIsLoading(false);
        return;
      }

      // Call protected backend endpoint to create user in Cognito
      const authHeaders = await getAuthHeader();

      const requestBody = {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        // Group is automatically assigned by Lambda to "View-access"
      };

      const response = await fetch(
        "https://868qsxaw23.execute-api.us-east-2.amazonaws.com/Prod/create_view_user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders, // Include JWT token for authentication
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.error ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }

      // const result = await response.json(); // Unused

      setMessage({
        type: "success",
        text: `User ${newUser.username} created successfully with View-access role!`,
      });

      // Reset form
      setNewUser({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setShowAddUserForm(false);
    } catch (error: any) {
      console.error("Error creating user:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to create user. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFiltersSidebar = () => (
    <aside className="filters-sidebar">
      <div className="filters-section">
        <div className="nav-brand">
          <h2>AuzlandRE</h2>
        </div>
        {/* <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === "properties" ? "active" : ""}`}
            onClick={() => setActiveTab("properties")}
          >
            Properties
          </button>
          {hasEditAccess && (
            
          )}
        </div> */}

        {/* Collapsible Filter Groups */}
        <ul className="filter-list">
          <li className="filter-item">
            <button
              className={`filter-header ${
                activeTab === "properties" ? "active" : ""
              }`}
              onClick={() => setActiveTab("properties")}
            >
              PROPERTIES
            </button>
          </li>
          <li className="filter-item">
            <button
              className={`filter-header ${
                activeTab === "call-agent" ? "active" : ""
              }`}
              onClick={() => setActiveTab("call-agent")}
            >
              CALL AGENT
            </button>
          </li>
          <li className="filter-item">
            <button
              className={`filter-header ${
                activeTab === "admin" ? "active" : ""
              }`}
              onClick={() => setActiveTab("admin")}
            >
              ADMIN TOOLS
            </button>
          </li>
          <li
            className={`filter-item ${openSections.propertyType ? "open" : ""}`}
          >
            <button
              className="filter-header"
              onClick={() => toggleSection("propertyType")}
            >
              <span>PROPERTY TYPE</span>
              <span className="filter-arrow">▾</span>
            </button>
            <div
              className={`filter-content ${
                openSections.propertyType ? "" : "hidden"
              }`}
            >
              <select
                value={filters.propertyType}
                onChange={(e) =>
                  handleFilterChange("propertyType", e.target.value)
                }
                className="filter-select"
              >
                <option value="">All Types</option>
                <option value="Land only">Land only</option>
                <option value="Single story">Single story</option>
                <option value="Double story">Double story</option>
                <option value="Dual occupancy">Dual occupancy</option>
                <option value="Apartment">Apartment</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Home & Land">Home & Land</option>
              </select>
            </div>
          </li>

          <li className={`filter-item ${openSections.suburb ? "open" : ""}`}>
            <button
              className="filter-header"
              onClick={() => toggleSection("suburb")}
            >
              <span>SUBURB</span>
              <span className="filter-arrow">▾</span>
            </button>
            <div
              className={`filter-content ${
                openSections.suburb ? "" : "hidden"
              }`}
            >
              <input
                type="text"
                placeholder="Enter suburb..."
                value={filters.suburb}
                onChange={(e) => handleFilterChange("suburb", e.target.value)}
                className="filter-input"
              />
            </div>
          </li>

          <li
            className={`filter-item ${openSections.availability ? "open" : ""}`}
          >
            <button
              className="filter-header"
              onClick={() => toggleSection("availability")}
            >
              <span>AVAILABILITY</span>
              <span className="filter-arrow">▾</span>
            </button>
            <div
              className={`filter-content ${
                openSections.availability ? "" : "hidden"
              }`}
            >
              <select
                value={filters.availability}
                onChange={(e) =>
                  handleFilterChange("availability", e.target.value)
                }
                className="filter-select"
              >
                <option value="">All</option>
                <option value="Available">Available</option>
                <option value="Under Offer">Under Offer</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
          </li>

          <li className={`filter-item ${openSections.status ? "open" : ""}`}>
            <button
              className="filter-header"
              onClick={() => toggleSection("status")}
            >
              <span>STATUS</span>
              <span className="filter-arrow">▾</span>
            </button>
            <div
              className={`filter-content ${
                openSections.status ? "" : "hidden"
              }`}
            >
              <select
                value={filters.registrationConstructionStatus}
                onChange={(e) =>
                  handleFilterChange(
                    "registrationConstructionStatus",
                    e.target.value
                  )
                }
                className="filter-select"
              >
                <option value="">All</option>
                <option value="Registered">Registered</option>
                <option value="Unregistered">Unregistered</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </li>

          <li className={`filter-item ${openSections.price ? "open" : ""}`}>
            <button
              className="filter-header"
              onClick={() => toggleSection("price")}
            >
              <span>PRICE</span>
              <span className="filter-arrow">▾</span>
            </button>
            <div
              className={`filter-content ${openSections.price ? "" : "hidden"}`}
            >
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin}
                  onChange={(e) =>
                    handleFilterChange("priceMin", e.target.value)
                  }
                  className="range-input"
                  min="0"
                  step="0.01"
                />
                <span className="range-separator">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceMax}
                  onChange={(e) =>
                    handleFilterChange("priceMax", e.target.value)
                  }
                  className="range-input"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </li>

          <li className={`filter-item ${openSections.frontage ? "open" : ""}`}>
            <button
              className="filter-header"
              onClick={() => toggleSection("frontage")}
            >
              <span>FRONTAGE (m)</span>
              <span className="filter-arrow">▾</span>
            </button>
            <div
              className={`filter-content ${
                openSections.frontage ? "" : "hidden"
              }`}
            >
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.frontageMin}
                  onChange={(e) =>
                    handleFilterChange("frontageMin", e.target.value)
                  }
                  className="range-input"
                  min="0"
                  step="0.01"
                />
                <span className="range-separator">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.frontageMax}
                  onChange={(e) =>
                    handleFilterChange("frontageMax", e.target.value)
                  }
                  className="range-input"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </li>

          <li className={`filter-item ${openSections.landSize ? "open" : ""}`}>
            <button
              className="filter-header"
              onClick={() => toggleSection("landSize")}
            >
              <span>LAND SIZE (sqm)</span>
              <span className="filter-arrow">▾</span>
            </button>
            <div
              className={`filter-content ${
                openSections.landSize ? "" : "hidden"
              }`}
            >
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.landSizeMin}
                  onChange={(e) =>
                    handleFilterChange("landSizeMin", e.target.value)
                  }
                  className="range-input"
                  min="0"
                  step="0.01"
                />
                <span className="range-separator">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.landSizeMax}
                  onChange={(e) =>
                    handleFilterChange("landSizeMax", e.target.value)
                  }
                  className="range-input"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </li>

          <li className={`filter-item ${openSections.buildSize ? "open" : ""}`}>
            <button
              className="filter-header"
              onClick={() => toggleSection("buildSize")}
            >
              <span>BUILD SIZE (sqm)</span>
              <span className="filter-arrow">▾</span>
            </button>
            <div
              className={`filter-content ${
                openSections.buildSize ? "" : "hidden"
              }`}
            >
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.buildSizeMin}
                  onChange={(e) =>
                    handleFilterChange("buildSizeMin", e.target.value)
                  }
                  className="range-input"
                  min="0"
                  step="0.01"
                />
                <span className="range-separator">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.buildSizeMax}
                  onChange={(e) =>
                    handleFilterChange("buildSizeMax", e.target.value)
                  }
                  className="range-input"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </li>

          <li className={`filter-item ${openSections.bed ? "open" : ""}`}>
            <button
              className="filter-header"
              onClick={() => toggleSection("bed")}
            >
              <span>BEDROOMS</span>
              <span className="filter-arrow">▾</span>
            </button>
            <div
              className={`filter-content ${openSections.bed ? "" : "hidden"}`}
            >
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.bedMin}
                  onChange={(e) => handleFilterChange("bedMin", e.target.value)}
                  className="range-input"
                  min="0"
                />
                <span className="range-separator">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.bedMax}
                  onChange={(e) => handleFilterChange("bedMax", e.target.value)}
                  className="range-input"
                  min="0"
                />
              </div>
            </div>
          </li>

          <li className={`filter-item ${openSections.bath ? "open" : ""}`}>
            <button
              className="filter-header"
              onClick={() => toggleSection("bath")}
            >
              <span>BATHROOMS</span>
              <span className="filter-arrow">▾</span>
            </button>
            <div
              className={`filter-content ${openSections.bath ? "" : "hidden"}`}
            >
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.bathMin}
                  onChange={(e) =>
                    handleFilterChange("bathMin", e.target.value)
                  }
                  className="range-input"
                  min="0"
                />
                <span className="range-separator">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.bathMax}
                  onChange={(e) =>
                    handleFilterChange("bathMax", e.target.value)
                  }
                  className="range-input"
                  min="0"
                />
              </div>
            </div>
          </li>

          <li className={`filter-item ${openSections.garage ? "open" : ""}`}>
            <button
              className="filter-header"
              onClick={() => toggleSection("garage")}
            >
              <span>GARAGE</span>
              <span className="filter-arrow">▾</span>
            </button>
            <div
              className={`filter-content ${
                openSections.garage ? "" : "hidden"
              }`}
            >
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.garageMin}
                  onChange={(e) =>
                    handleFilterChange("garageMin", e.target.value)
                  }
                  className="range-input"
                  min="0"
                />
                <span className="range-separator">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.garageMax}
                  onChange={(e) =>
                    handleFilterChange("garageMax", e.target.value)
                  }
                  className="range-input"
                  min="0"
                />
              </div>
            </div>
          </li>

          <li className="filter-item">
            <div className="filter-content" style={{ paddingTop: "0.5rem" }}>
              <button className="clear-filters-btn" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            </div>
          </li>
        </ul>
      </div>
    </aside>
  );

  const renderPropertiesTable = () => (
    <main className="properties-main">
      {/* Results and Controls */}
      <div className="results-header">
        <div className="results-left">
          <span className="results-count">
            {filteredProperties.length} results
          </span>
          <div className="sort-controls" style={{ marginLeft: "0.75rem" }}>
            <span className="sort-label">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="propertyType">Property Type</option>
              <option value="lot">Lot</option>
              <option value="address">Address</option>
              <option value="suburb">Suburb</option>
              <option value="availability">Availability</option>
              <option value="frontage">Frontage</option>
              <option value="landSize">Land Size</option>
              <option value="buildSize">Build Size</option>
              <option value="bed">Bedrooms</option>
              <option value="bath">Bathrooms</option>
              <option value="garage">Garage</option>
              <option value="price">Price</option>
              <option value="registrationConstructionStatus">Status</option>
            </select>
            <select
              className="sort-order-select"
              value={sortOrder}
              onChange={(e) => {
                const newOrder = e.target.value;
                console.log(
                  "Sort order changing from",
                  sortOrder,
                  "to",
                  newOrder
                );
                setSortOrder(newOrder);
              }}
              title="Select sort order"
            >
              <option value="asc">Low to High</option>
              <option value="desc">High to Low</option>
            </select>
          </div>
        </div>

        <div className="results-right">
          {/* Clear Filters - Available to all users */}
          {getActiveFiltersCount() > 0 && (
            <button
              className="clear-filters-header-btn"
              onClick={clearAllFilters}
            >
              Clear Filters
            </button>
          )}

          {/* Admin-only buttons */}
        </div>
      </div>

      {/* Properties Table */}
      <div className="properties-table-wrapper">
        <table
          className={`properties-table compact-table ${
            !hasEditAccess ? "view-only" : ""
          }`}
        >
          <thead>
            <tr>
              <th>PROPERTY TYPE</th>
              <th>LOT</th>
              <th>ADDRESS</th>
              <th>SUBURB</th>
              <th>AVAILABILITY</th>
              <th>STATUS</th>
              <th>PRICE</th>
              <th>FRONTAGE</th>
              <th>LAND SIZE</th>
              <th>BUILD SIZE</th>
              <th>BED</th>
              <th>BATH</th>
              <th>GARAGE</th>
              <th>MEDIA</th>
              <th>REMARK</th>
              {hasEditAccess && <th>ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {filteredProperties.length === 0 ? (
              <tr className="no-data">
                <td colSpan={hasEditAccess ? 16 : 15}>
                  <div className="empty-state">
                    <p>No properties found</p>
                    <p className="empty-subtitle">
                      Properties will appear here once data is loaded from the
                      API
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProperties.map((property, index) => (
                <tr key={index}>
                  <td>
                    {property.propertyType === "Home and Land Packages"
                      ? "Home & Land"
                      : property.propertyType || "-"}
                  </td>
                  <td>{property.lot}</td>
                  <td>{property.address}</td>
                  <td>{property.suburb || "-"}</td>
                  <td>
                    {(() => {
                      const value = property.availability || "";
                      const v = value.toLowerCase();
                      const cls = v.includes("available")
                        ? "pill pill-green"
                        : v.includes("under offer") || v.includes("offer")
                        ? "pill pill-yellow"
                        : v.includes("sold")
                        ? "pill pill-red"
                        : "pill pill-gray";
                      return value ? <span className={cls}>{value}</span> : "-";
                    })()}
                  </td>
                  <td>
                    {(() => {
                      const value =
                        property.registrationConstructionStatus || "";
                      const v = value.toLowerCase();
                      const cls =
                        v === "registered" ||
                        v === "completed" ||
                        v.includes("complete")
                          ? "pill pill-green"
                          : v.includes("under construction") ||
                            v.includes("construction") ||
                            v.includes("building")
                          ? "pill pill-yellow"
                          : v === "unregistered" || v.includes("unreg")
                          ? "pill pill-red"
                          : "pill pill-gray";
                      return value ? <span className={cls}>{value}</span> : "-";
                    })()}
                  </td>
                  <td>${property.price?.toLocaleString() || "-"}</td>
                  <td>{property.frontage || "-"}</td>
                  <td>{property.landSize || "-"}</td>
                  <td>{property.buildSize || "-"}</td>
                  <td>{property.bed || "-"}</td>
                  <td>{property.bath || "-"}</td>
                  <td>{property.garage || "-"}</td>
                  {renderMediaColumn(property)}
                  <td>{property.remark || "-"}</td>
                  {hasEditAccess && (
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          title="Edit"
                          onClick={() => handleEditProperty(property)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          title="Delete"
                          onClick={() => handleDeleteProperty(property.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );

  const renderAdminTools = () => (
    <main className="admin-tools-main">
      <div className="admin-tools-header">
        <h2>Admin Tools</h2>
        <p>Manage users and system settings.</p>
      </div>

      <div className="admin-tools-content">
        <h3>User Management</h3>
        <p>Add new users to the system. Only administrators can add users.</p>
        <button
          className="add-user-button"
          onClick={() => setShowAddUserForm(true)}
        >
          Add New User
        </button>
      </div>
    </main>
  );

  const renderCallAgent = () => (
    <main className="call-agent-main">
      <div className="call-agent-header">
        <h2>AI Call Agent</h2>
        <div className="call-agent-widget">
          <elevenlabs-convai agent-id="agent_5601k4yd25r9fy4vq8vpd5ehq3kw"></elevenlabs-convai>
        </div>
        <p>
          Connect with our intelligent AI assistant for property inquiries and
          support.
        </p>
      </div>

      <div className="call-agent-content">
        <div className="call-agent-info">
          <div>
            <h3>About Our AI Agent</h3>
            <ul>
              <li>🔍 Property search and recommendations</li>
              <li>📊 Market insights and pricing information</li>
              <li>📅 Schedule property viewings</li>
              <li>❓ Answer questions about our services</li>
              <li>🤝 Provide personalized assistance</li>
            </ul>
          </div>

          <div className="call-agent-tips">
            <h4>💡 Tips for Best Results:</h4>
            <p>• Speak clearly and naturally</p>
            <p>• Ask specific questions about properties</p>
            <p>• Mention your budget and preferences</p>
            <p>• Request to schedule viewings when interested</p>
          </div>
        </div>
      </div>
    </main>
  );

  const handleCsvFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (
        !file.name.toLowerCase().endsWith(".csv") &&
        !file.name.toLowerCase().endsWith(".xlsx")
      ) {
        setCsvUploadError("Please select a valid CSV or Excel (.xlsx) file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setCsvUploadError("File size must be less than 10MB");
        return;
      }

      setCsvFile(file);
      setCsvUploadError(null);

      // If it's an Excel file, read the sheets
      if (file.name.toLowerCase().endsWith(".xlsx")) {
        readExcelSheets(file);
      } else {
        // setExcelSheets([]); // Commented out as unused
        // setSelectedSheet(''); // Commented out as unused
        // setShowSheetSelector(false); // Commented out as unused
      }
    }
  };

  const readExcelSheets = async (file: File) => {
    try {
      // We'll need to use a library like SheetJS to read Excel files
      // For now, we'll show a message that Excel support is being implemented
      // setExcelSheets(['Sheet1']); // Placeholder - commented out as unused
      // setSelectedSheet('Sheet1'); // Commented out as unused
      // setShowSheetSelector(true); // Commented out as unused
    } catch (error: any) {
      setCsvUploadError(`Error reading Excel file: ${error.message}`);
    }
  };

  // Process CSV data with fuzzy matching for property types
  const processCsvData = (csvText: string) => {
    const lines = csvText.split("\n").filter((line) => line.trim()); // Remove empty lines
    if (lines.length < 2) {
      throw new Error(
        "CSV file must have at least a header row and one data row"
      );
    }

    // Parse CSV headers - handle quoted fields properly
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine);
    console.log("CSV Headers detected:", headers);

    const processedData = lines.slice(1).map((line, rowIndex) => {
      const values = parseCSVLine(line);
      const row: any = {};

      headers.forEach((header, index) => {
        let value = values[index] || "";

        // Apply fuzzy matching for property type column
        if (
          header.toLowerCase().includes("property") &&
          header.toLowerCase().includes("type")
        ) {
          value = fuzzyMatchPropertyType(value);
        }

        row[header] = value;
      });

      // Log the first few rows for debugging
      if (rowIndex < 3) {
        console.log(`Row ${rowIndex + 1}:`, row);
        console.log(`Row ${rowIndex + 1} values:`, values);
      }

      return row;
    });

    console.log(`Processed ${processedData.length} rows from CSV`);
    return processedData;
  };

  // Simple CSV line parser that handles quoted fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    // Add the last field
    result.push(current.trim());

    // Remove quotes from each field
    return result.map((field) => field.replace(/^"|"$/g, ""));
  };

  // Fuzzy matching function for property types
  const fuzzyMatchPropertyType = (input: string): string => {
    if (!input) return "";

    const normalizedInput = input.toLowerCase().trim().replace(/\s+/g, " ");

    // Handle legacy "Home and Land Packages" specifically
    if (normalizedInput === "home and land packages") {
      return "Home & Land";
    }

    const propertyTypes = [
      "Land only",
      "Single story",
      "Double story",
      "Dual occupancy",
      "Apartment",
      "Townhouse",
      "Home & Land",
    ];

    // Exact match first
    for (const type of propertyTypes) {
      if (type.toLowerCase() === normalizedInput) {
        return type;
      }
    }

    // Partial match
    for (const type of propertyTypes) {
      const normalizedType = type.toLowerCase();
      if (
        normalizedType.includes(normalizedInput) ||
        normalizedInput.includes(normalizedType)
      ) {
        return type;
      }
    }

    // Fuzzy match using similarity
    let bestMatch = "";
    let bestScore = 0;

    for (const type of propertyTypes) {
      const normalizedType = type.toLowerCase();
      let score = 0;

      // Check for common variations
      if (normalizedInput.includes("land") || normalizedType.includes("land"))
        score += 3;
      if (
        normalizedInput.includes("single") ||
        normalizedType.includes("single")
      )
        score += 3;
      if (
        normalizedInput.includes("double") ||
        normalizedType.includes("double")
      )
        score += 3;
      if (normalizedInput.includes("dual") || normalizedType.includes("dual"))
        score += 3;
      if (
        normalizedInput.includes("apartment") ||
        normalizedType.includes("apartment")
      )
        score += 3;
      if (
        normalizedInput.includes("townhouse") ||
        normalizedType.includes("townhouse")
      )
        score += 3;
      if (normalizedInput.includes("home") || normalizedType.includes("home"))
        score += 3;
      if (
        normalizedInput.includes("packages") ||
        normalizedType.includes("packages")
      )
        score += 3;
      if (normalizedInput.includes("story") || normalizedType.includes("story"))
        score += 2;
      if (
        normalizedInput.includes("occupancy") ||
        normalizedType.includes("occupancy")
      )
        score += 2;

      // Check for common abbreviations
      if (
        normalizedInput.includes("apt") &&
        normalizedType.includes("apartment")
      )
        score += 2;
      if (
        normalizedInput.includes("town") &&
        normalizedType.includes("townhouse")
      )
        score += 2;
      if (
        normalizedInput.includes("hlp") &&
        normalizedType.includes("home & land")
      )
        score += 2;
      if (
        normalizedInput.includes("pkg") &&
        normalizedType.includes("packages")
      )
        score += 2;
      if (normalizedInput.includes("1") && normalizedType.includes("single"))
        score += 1;
      if (normalizedInput.includes("2") && normalizedType.includes("double"))
        score += 1;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = type;
      }
    }

    return bestScore >= 2 ? bestMatch : input; // Return original if no good match
  };

  // Check for duplicate addresses using fuzzy matching
  const isDuplicateAddress = (
    newAddress: string,
    newLot: string,
    newSuburb: string,
    existingProperties: any[],
    excludeId?: string
  ): boolean => {
    if (!newAddress || !newAddress.trim()) return false;

    const normalizedNewAddress = newAddress.toLowerCase().trim();
    const normalizedNewLot = newLot ? newLot.toLowerCase().trim() : "";
    const normalizedNewSuburb = newSuburb ? newSuburb.toLowerCase().trim() : "";

    return existingProperties.some((property) => {
      // Skip the property being edited (if any)
      if (excludeId && property.id === excludeId) return false;

      if (!property.address) return false;

      const existingAddress = property.address.toLowerCase().trim();
      const existingLot = property.lot ? property.lot.toLowerCase().trim() : "";
      const existingSuburb = property.suburb
        ? property.suburb.toLowerCase().trim()
        : "";

      // Check for exact duplicate: same address AND same suburb
      if (
        existingAddress === normalizedNewAddress &&
        existingSuburb === normalizedNewSuburb
      ) {
        // If both have lot numbers, they must be different to not be duplicates
        if (normalizedNewLot && existingLot) {
          return normalizedNewLot === existingLot; // Only duplicate if lot numbers are the same
        }
        // If one or both don't have lot numbers, consider it a duplicate
        return true;
      }

      // Fuzzy matching for very similar addresses in the same suburb
      if (existingSuburb === normalizedNewSuburb && normalizedNewSuburb) {
        const similarity = calculateAddressSimilarity(
          normalizedNewAddress,
          existingAddress
        );
        if (similarity > 0.9) {
          // Higher threshold for fuzzy matching
          // If both have lot numbers, they must be different to not be duplicates
          if (normalizedNewLot && existingLot) {
            return normalizedNewLot === existingLot;
          }
          return true;
        }
      }

      return false;
    });
  };

  // Calculate similarity between two addresses using Levenshtein distance
  const calculateAddressSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  };

  // Levenshtein distance algorithm for string similarity
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  };

  const processExcelUpload = async () => {
    if (!csvFile) return;

    setCsvUploadProgress(0);
    setCsvUploadError(null);

    try {
      if (csvFile.name.toLowerCase().endsWith(".csv")) {
        // Process CSV file
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const csvText = e.target?.result as string;
            const processedData = processCsvData(csvText);
            await importPropertiesFromData(processedData);
          } catch (error: any) {
            console.error("Error processing CSV:", error);
            setCsvUploadError(error.message || "Failed to process CSV file");
            setCsvUploadProgress(0);
          }
        };
        reader.readAsText(csvFile);
      } else if (csvFile.name.toLowerCase().endsWith(".xlsx")) {
        // Process Excel file
        await processExcelFile();
      }
    } catch (error: any) {
      console.error("Error processing file:", error);
      setCsvUploadError(error.message || "Failed to process file");
      setCsvUploadProgress(0);
    }
  };

  const processExcelFile = async () => {
    if (!csvFile) return;

    try {
      setCsvUploadProgress(25);

      // For now, we'll implement basic Excel support
      // In a full implementation, you'd use SheetJS (xlsx) library
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          setCsvUploadProgress(50);
          // This is a placeholder - in real implementation, parse Excel with SheetJS
          setCsvUploadError(
            "Excel file processing requires SheetJS library. Please use CSV files for now, or contact support to enable Excel support."
          );
          setCsvUploadProgress(0);
        } catch (error: any) {
          console.error("Error processing Excel:", error);
          setCsvUploadError(error.message || "Failed to process Excel file");
          setCsvUploadProgress(0);
        }
      };
      reader.readAsArrayBuffer(csvFile);
    } catch (error: any) {
      console.error("Error reading Excel file:", error);
      setCsvUploadError(error.message || "Failed to read Excel file");
      setCsvUploadProgress(0);
    }
  };

  const importPropertiesFromData = async (data: any[]) => {
    try {
      setCsvUploadProgress(75);

      console.log("Raw CSV data received:", data);

      // Map CSV data to property structure
      const mappedProperties = data
        .map((row, index) => {
          console.log(`Processing row ${index}:`, row);

          // Create property object with current field structure
          const property = {
            id: row.id || `imported_${Date.now()}_${index}`,
            propertyType:
              row.propertyType ||
              row.property_type ||
              row["Property Type"] ||
              row["property type"] ||
              row["PROPERTY TYPE"] ||
              "",
            lot: row.lot || row.Lot || row.LOT || "",
            address: row.address || row.Address || row.ADDRESS || "",
            suburb: row.suburb || row.Suburb || row.SUBURB || "",
            availability:
              row.availability || row.Availability || row.AVAILABILITY || "",
            frontage:
              row.frontage ||
              row.frontage_m ||
              row.Frontage ||
              row.FRONTAGE ||
              "",
            landSize:
              row.landSize ||
              row.land_area_sqm ||
              row["Land Size"] ||
              row["Land Size (sqm)"] ||
              row["LAND SIZE"] ||
              row["land size"] ||
              "",
            buildSize:
              row.buildSize ||
              row.build_area_sqm ||
              row["Build Size"] ||
              row["Build Size (sqm)"] ||
              row["BUILD SIZE"] ||
              row["build size"] ||
              "",
            bed:
              row.bed ||
              row.Bed ||
              row.BED ||
              row.Bedrooms ||
              row.bedrooms ||
              "",
            bath:
              row.bath ||
              row.Bath ||
              row.BATH ||
              row.Bathrooms ||
              row.bathrooms ||
              "",
            garage: row.garage || row.Garage || row.GARAGE || "",
            registrationConstructionStatus:
              row.registrationConstructionStatus ||
              row.regoDue ||
              row.readyBy ||
              row["Registration & Construction Status"] ||
              row["Rego Due"] ||
              row["Ready By"] ||
              row["registration status"] ||
              row["REGISTRATION STATUS"] ||
              "",
            price: (
              row.price ||
              row.price_guide ||
              row.Price ||
              row["Price Guide"] ||
              row["PRICE"] ||
              row["price"] ||
              ""
            )
              .replace(/^\$/, "")
              .replace(/[,\s]/g, ""),
            media: row.media || row.media_url || row.Media || row.MEDIA || "",
            remark: row.remark || row.Remark || row.REMARK || "",
            description:
              row.description || row.Description || row.DESCRIPTION || "",
            updatedAt: new Date().toISOString().split("T")[0],
            propertyCustomerVisibility:
              row.propertyCustomerVisibility ||
              row["Property Customer Visibility"] ||
              row["property customer visibility"] ||
              "1",
            priceCustomerVisibility:
              row.priceCustomerVisibility ||
              row["Price Customer Visibility"] ||
              row["price customer visibility"] ||
              "0",
          };

          console.log(`Mapped property ${index}:`, property);

          // Apply fuzzy matching for property type
          if (property.propertyType) {
            property.propertyType = fuzzyMatchPropertyType(
              property.propertyType
            );
          }

          return property;
        })
        .filter((property) => property.lot || property.address); // Only include properties with lot or address

      console.log("Final mapped properties:", mappedProperties);
      console.log("Properties after filtering:", mappedProperties.length);

      setCsvUploadProgress(90);

      // Filter out duplicate addresses before adding to existing properties
      const existingProperties = [...properties];
      const newProperties: any[] = [];
      const duplicateCount = { count: 0, addresses: [] as string[] };

      for (const property of mappedProperties) {
        if (
          isDuplicateAddress(
            property.address,
            property.lot,
            property.suburb,
            existingProperties
          )
        ) {
          duplicateCount.count++;
          duplicateCount.addresses.push(
            `${property.address}, ${property.suburb}`
          );
        } else {
          newProperties.push(property);
        }
      }

      // Add new properties to existing ones (don't replace all)
      const updatedProperties = [...existingProperties, ...newProperties];
      setProperties(updatedProperties);
      setFilteredProperties(updatedProperties);

      // Save to S3
      await autoSaveToS3(updatedProperties);

      setCsvUploadProgress(100);

      // Show success message with duplicate info
      let messageText = `Successfully imported ${newProperties.length} new properties`;
      if (duplicateCount.count > 0) {
        messageText += `. ${duplicateCount.count} duplicate addresses were skipped to prevent duplicates.`;
        if (duplicateCount.count <= 5) {
          messageText += ` Skipped: ${duplicateCount.addresses.join(", ")}`;
        }
      }

      setMessage({ type: "success", text: messageText });

      // Close modal after a short delay
      setTimeout(() => {
        clearCsvUpload();
      }, 2000);
    } catch (error: any) {
      console.error("Error importing properties:", error);
      setCsvUploadError(error.message || "Failed to import properties");
      setCsvUploadProgress(0);
    }
  };

  const clearCsvUpload = () => {
    setCsvFile(null);
    setCsvUploadProgress(0);
    setCsvUploadError(null);
    setShowCsvUploadModal(false);
  };

  const handleExport = () => {
    const csvText = generateCsvFromProperties(filteredProperties);
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "listings.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-container">
      {/* Main Content */}
      <div className="dashboard-main">
        {/* Global Message Display */}
        {message && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        {/* Collapsible Filters Sidebar */}
        <aside
          className={`filters-sidebar ${isSidebarOpen ? "open" : "closed"}`}
        >
          {renderFiltersSidebar()}
        </aside>

        {/* Chatbot Sidebar */}
        {/* <ChatbotSidebar 
          isOpen={isChatbotOpen} 
          onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
          currentFilters={filters}
          propertyCount={(() => {
            console.log('🏠 Passing to chatbot - filteredProperties.length:', filteredProperties.length);
            console.log('🏠 Passing to chatbot - properties.length:', properties.length);
            return filteredProperties.length;
          })()}
          onFiltersChange={(newFilters) => {
            console.log('🔧 ===================== FILTER UPDATE =====================');
            console.log('🔧 Dashboard receiving new filters from Chatbot:', newFilters);
            console.log('🔧 Current filters before update:', filters);
            
            // Apply multiple filter changes at once
            setFilters(prev => {
              const updated = { ...prev, ...newFilters };
              console.log('🔧 Filters after update:', updated);
              console.log('🔧 Active filters after update:', Object.fromEntries(Object.entries(updated).filter(([k,v]) => v && v !== '')));
              console.log('🔧 ========================================================');
              return updated;
            });
          }}
          onClearFilters={() => {
            setFilters({
              quickSearch: '',
              suburb: '',
              propertyType: '',
              availability: '',
              frontageMin: '',
              frontageMax: '',
              landSizeMin: '',
              landSizeMax: '',
              buildSizeMin: '',
              buildSizeMax: '',
              bedMin: '',
              bedMax: '',
              bathMin: '',
              bathMax: '',
              garageMin: '',
              garageMax: '',
              priceMin: '',
              priceMax: '',
              registrationConstructionStatus: ''
            });
          }}
        /> */}

        <div className="content-area">
          {/* Combined Navigation Bar - Merged welcome and properties nav */}
          <nav className="combined-nav">
            {/* Quick Search */}
            <div className="filter-group quick-search-group">
              <div
                className="search-input-container"
                title="You can search using property type, address, suburb, lot number, or any property details"
              >
                <input
                  type="text"
                  placeholder="Quick search..."
                  value={filters.quickSearch}
                  onChange={(e) =>
                    handleFilterChange("quickSearch", e.target.value)
                  }
                  className="universal-search-input"
                />
              </div>
            </div>
            <div className="nav-left"></div>

            <div className="nav-right">
              {hasEditAccess && (
                <>
                  <button className="export-button" onClick={handleExport}>
                    Export
                  </button>
                  <button className="export-button" onClick={handleNewProperty}>
                    Add New Entry
                  </button>
                  <button
                    className="import-button"
                    onClick={() => setShowCsvUploadModal(true)}
                  >
                    Import CSV
                  </button>
                </>
              )}
              <div className="navbar-profile-section">
                {/* Profile Dropdown */}
                <ProfileDropdown
                  user={user?.email ? { ...user, email: user.email } : null}
                  hasEditAccess={!!hasEditAccess}
                  signOut={signOut}
                />
              </div>
            </div>
          </nav>

          {/* Sidebar Toggle Buttons */}
          <div className="sidebar-toggle-container">
            <button
              className="sidebar-toggle-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title={`${
                isSidebarOpen ? "Hide" : "Show"
              } Filters (Ctrl/Cmd + B)`}
              aria-label="Toggle Filters Sidebar"
            ></button>
          </div>

          {/* Chatbot Toggle Button */}
          {/* <div className="chatbot-toggle-container">
            <button 
              className="chatbot-toggle-btn"
              onClick={() => setIsChatbotOpen(!isChatbotOpen)}
              title={`${isChatbotOpen ? 'Hide' : 'Show'} RAUZ Chatbot (Ctrl/Cmd + R)`}
              aria-label="Toggle RAUZ Chatbot"
            >
              🤖
            </button>
          </div> */}

          {/* Tab Content */}
          {activeTab === "properties"
            ? renderPropertiesTable()
            : activeTab === "call-agent"
            ? renderCallAgent()
            : renderAdminTools()}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New User</h3>
              <button
                onClick={() => setShowAddUserForm(false)}
                className="close-button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddUser} className="modal-form">
              {message && (
                <div className={`message ${message.type}`}>{message.text}</div>
              )}

              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  type="text"
                  id="username"
                  value={newUser.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  placeholder="Enter username"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={newUser.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  value={newUser.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Enter password (min 8 characters)"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={newUser.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  placeholder="Confirm password"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddUserForm(false)}
                  className="cancel-button"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={
                    isLoading ||
                    !newUser.username ||
                    !newUser.email ||
                    !newUser.password ||
                    !newUser.confirmPassword
                  }
                >
                  {isLoading ? "Creating User..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Property Form Modal */}
      {showPropertyForm && hasEditAccess && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingProperty ? "Edit Property" : "Add New Property"}</h3>
              <button
                onClick={() => setShowPropertyForm(false)}
                className="close-button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePropertyFormSubmit} className="modal-form">
              {/* Property Form Message Display */}
              {message && (
                <div className={`message ${message.type}`}>{message.text}</div>
              )}

              {/* Customer Visibility Controls */}
              <div className="visibility-controls">
                <h4>Customer Visibility Settings</h4>
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="checkbox"
                      id="propertyCustomerVisibility"
                      checked={propertyForm.propertyCustomerVisibility === "1"}
                      onChange={(e) =>
                        handlePropertyFormChange(
                          "propertyCustomerVisibility",
                          e.target.checked ? "1" : "0"
                        )
                      }
                    />
                    <label htmlFor="propertyCustomerVisibility">
                      Show property to customers
                    </label>
                  </div>
                  <div className="form-group">
                    <input
                      type="checkbox"
                      id="priceCustomerVisibility"
                      checked={propertyForm.priceCustomerVisibility === "1"}
                      onChange={(e) =>
                        handlePropertyFormChange(
                          "priceCustomerVisibility",
                          e.target.checked ? "1" : "0"
                        )
                      }
                    />
                    <label htmlFor="priceCustomerVisibility">
                      Show price to customers
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="propertyType">Property Type *</label>
                  <select
                    id="propertyType"
                    value={propertyForm.propertyType}
                    onChange={(e) =>
                      handlePropertyFormChange("propertyType", e.target.value)
                    }
                    required
                    style={{
                      color: propertyForm.propertyType ? "#e5e7eb" : "#94a3b8",
                    }}
                  >
                    <option value="" disabled style={{ color: "#94a3b8" }}>
                      -- Select Property Type --
                    </option>
                    <option value="Land only">Land only</option>
                    <option value="Single story">Single story</option>
                    <option value="Double story">Double story</option>
                    <option value="Dual occupancy">Dual occupancy</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Home & Land">Home & Land</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="lot">Lot</label>
                  <input
                    type="text"
                    id="lot"
                    value={propertyForm.lot}
                    onChange={(e) =>
                      handlePropertyFormChange("lot", e.target.value)
                    }
                    placeholder="Lot number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="address">Address *</label>
                  <input
                    type="text"
                    id="address"
                    value={propertyForm.address}
                    onChange={(e) =>
                      handlePropertyFormChange("address", e.target.value)
                    }
                    placeholder="Property address"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="suburb">Suburb</label>
                  <input
                    type="text"
                    id="suburb"
                    value={propertyForm.suburb}
                    onChange={(e) =>
                      handlePropertyFormChange("suburb", e.target.value)
                    }
                    placeholder="Suburb name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="availability">Availability</label>
                  <select
                    id="availability"
                    value={propertyForm.availability}
                    onChange={(e) =>
                      handlePropertyFormChange("availability", e.target.value)
                    }
                    style={{
                      color: propertyForm.availability ? "#e5e7eb" : "#94a3b8",
                    }}
                  >
                    <option value="" disabled style={{ color: "#94a3b8" }}>
                      -- Select Availability --
                    </option>
                    <option value="Available">Available</option>
                    <option value="Under Offer">Under Offer</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="frontage">Frontage (m)</label>
                  <input
                    type="number"
                    id="frontage"
                    value={propertyForm.frontage}
                    onChange={(e) =>
                      handlePropertyFormChange("frontage", e.target.value)
                    }
                    placeholder="Frontage in meters"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="landSize">Land Area (sqm)</label>
                  <input
                    type="number"
                    id="landSize"
                    value={propertyForm.landSize}
                    onChange={(e) =>
                      handlePropertyFormChange("landSize", e.target.value)
                    }
                    placeholder="Land area in square meters"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="buildSize">Build Area (sqm)</label>
                  <input
                    type="number"
                    id="buildSize"
                    value={propertyForm.buildSize}
                    onChange={(e) =>
                      handlePropertyFormChange("buildSize", e.target.value)
                    }
                    placeholder="Build area in square meters"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bed">Bedrooms</label>
                  <input
                    type="number"
                    id="bed"
                    value={propertyForm.bed}
                    onChange={(e) =>
                      handlePropertyFormChange("bed", e.target.value)
                    }
                    placeholder="Number of bedrooms"
                    min="0"
                    step="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bath">Bathrooms</label>
                  <input
                    type="number"
                    id="bath"
                    value={propertyForm.bath}
                    onChange={(e) =>
                      handlePropertyFormChange("bath", e.target.value)
                    }
                    placeholder="Number of bathrooms"
                    min="0"
                    step="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="garage">Garage</label>
                  <input
                    type="number"
                    id="garage"
                    value={propertyForm.garage}
                    onChange={(e) =>
                      handlePropertyFormChange("garage", e.target.value)
                    }
                    placeholder="Number of garage spaces"
                    min="0"
                    step="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="registrationConstructionStatus">Status</label>
                  <select
                    id="registrationConstructionStatus"
                    value={propertyForm.registrationConstructionStatus}
                    onChange={(e) =>
                      handlePropertyFormChange(
                        "registrationConstructionStatus",
                        e.target.value
                      )
                    }
                    style={{
                      color: propertyForm.registrationConstructionStatus
                        ? "#e5e7eb"
                        : "#94a3b8",
                    }}
                  >
                    <option value="" disabled style={{ color: "#94a3b8" }}>
                      -- Select Status --
                    </option>
                    <option value="Registered">Registered</option>
                    <option value="Unregistered">Unregistered</option>
                    <option value="Under Construction">
                      Under Construction
                    </option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price</label>
                  <input
                    type="number"
                    id="price"
                    value={propertyForm.price}
                    onChange={(e) =>
                      handlePropertyFormChange("price", e.target.value)
                    }
                    placeholder="Price in dollars"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="media">Media Upload</label>

                {/* Display existing media count when editing */}
                {editingProperty && editingProperty.media && (
                  <div
                    className="existing-media-section"
                    key={`media-section-${editingProperty.id}-${Date.now()}`}
                  >
                    <h4>📁 Existing Media Files</h4>
                    {(() => {
                      try {
                        const existingMedia = JSON.parse(editingProperty.media);
                        console.log(
                          "Rendering existing media count:",
                          existingMedia.length
                        ); // Debug log
                        if (
                          Array.isArray(existingMedia) &&
                          existingMedia.length > 0
                        ) {
                          console.log(
                            "Rendering stacked media display for:",
                            existingMedia.length,
                            "files"
                          );
                          return (
                            <div className="existing-media-stack">
                              <div className="media-reorder-hint">
                                ↕️ Use arrows to reorder media files
                              </div>
                              {existingMedia.map(
                                (mediaKey: string, index: number) => {
                                  let animationClass = "";
                                  if (swapAnimation) {
                                    if (index === swapAnimation.index1) {
                                      animationClass =
                                        index < swapAnimation.index2
                                          ? "swap-down"
                                          : "swap-up";
                                    } else if (index === swapAnimation.index2) {
                                      animationClass =
                                        index < swapAnimation.index1
                                          ? "swap-down"
                                          : "swap-up";
                                    }
                                  }

                                  return (
                                    <div
                                      key={`${mediaKey}-${index}`}
                                      className={`existing-media-item-stacked ${animationClass}`}
                                    >
                                      <div className="media-reorder-controls">
                                        <button
                                          type="button"
                                          onClick={() => moveMediaUp(index)}
                                          className={`reorder-btn ${
                                            index === 0 ? "disabled" : ""
                                          }`}
                                          disabled={index === 0}
                                          title="Move up"
                                        >
                                          ↑
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            moveMediaDown(
                                              index,
                                              existingMedia.length
                                            )
                                          }
                                          className={`reorder-btn ${
                                            index === existingMedia.length - 1
                                              ? "disabled"
                                              : ""
                                          }`}
                                          disabled={
                                            index === existingMedia.length - 1
                                          }
                                          title="Move down"
                                        >
                                          ↓
                                        </button>
                                      </div>
                                      <span className="media-file-name">
                                        {mediaKey.split("/").pop() || mediaKey}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeExistingMedia(
                                            mediaKey,
                                            existingMedia
                                          )
                                        }
                                        className="remove-existing-media-btn"
                                        title="Remove this media file"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          );
                        }
                      } catch (error) {
                        console.warn("Error parsing existing media:", error);
                      }
                      return <p>No existing media files</p>;
                    })()}
                  </div>
                )}

                <div className="media-upload-section">
                  <input
                    type="file"
                    id="media-upload"
                    multiple
                    accept="image/*,video/*,.pdf,.PDF"
                    onChange={handleMediaFileSelect}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="media-upload" className="media-upload-button">
                    📸 Select Photos/Videos/PDFs
                  </label>

                  {mediaFiles.length > 0 && (
                    <div className="media-preview">
                      <h4>Selected Files ({mediaFiles.length})</h4>
                      {mediaFiles.map((file, index) => (
                        <div key={index} className="media-file-item">
                          <span className="media-file-name">
                            {file.type.startsWith("image/")
                              ? "🖼️"
                              : file.type.startsWith("video/")
                              ? "🎥"
                              : file.type === "application/pdf"
                              ? "📄"
                              : "📎"}{" "}
                            {file.name}
                          </span>
                          <span className="media-file-size">
                            ({(file.size / 1024 / 1024).toFixed(2)}MB)
                          </span>
                          {mediaUploadProgress[file.name] !== undefined && (
                            <div className="upload-progress">
                              <div
                                className="progress-bar"
                                style={{
                                  width: `${mediaUploadProgress[file.name]}%`,
                                }}
                              ></div>
                              <span>{mediaUploadProgress[file.name]}%</span>
                            </div>
                          )}
                          {mediaUploadErrors[file.name] && (
                            <span className="upload-error">
                              ❌ {mediaUploadErrors[file.name]}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeMediaFile(index)}
                            className="remove-media-btn"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="remark">Remark</label>
                <textarea
                  id="remark"
                  value={propertyForm.remark}
                  onChange={(e) =>
                    handlePropertyFormChange("remark", e.target.value)
                  }
                  placeholder="Additional remarks"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={propertyForm.description}
                  onChange={(e) =>
                    handlePropertyFormChange("description", e.target.value)
                  }
                  placeholder="Property description for the public listing"
                  rows={4}
                ></textarea>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowPropertyForm(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  {editingProperty ? "Update Property" : "Add Property"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Viewer Modal */}
      {showMediaViewer && viewingMedia.length > 0 && (
        <div
          className="media-viewer-overlay"
          onClick={(e) => e.target === e.currentTarget && closeMediaViewer()}
        >
          <div className="media-viewer-modal">
            <div className="media-viewer-header">
              <h3>Media Viewer</h3>
              <div className="media-viewer-actions">
                <button
                  className="action-btn new-window-btn"
                  onClick={() =>
                    openMediaInNewWindow(viewingMedia[currentMediaIndex])
                  }
                  title="Open in new window"
                >
                  ⛶
                </button>
                <button
                  className="action-btn download-btn"
                  onClick={downloadMedia}
                  title="Download media"
                >
                  ⬇️
                </button>
                {hasEditAccess && (
                  <button
                    className="action-btn delete-media-btn"
                    onClick={() => deleteCurrentMedia()}
                    title="Delete this media file"
                  >
                    🗑️
                  </button>
                )}
                <button
                  className="close-media-viewer"
                  onClick={closeMediaViewer}
                  title="Close viewer"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="media-viewer-content">
              <div className="media-navigation">
                <button
                  className="nav-btn prev-btn"
                  onClick={prevMedia}
                  disabled={viewingMedia.length <= 1}
                  title="Previous media"
                >
                  ‹
                </button>

                <div className="media-display">
                  <div className="media-counter">
                    {currentMediaIndex + 1} of {viewingMedia.length}
                  </div>
                  <div className="media-item-display">
                    {viewingMedia[currentMediaIndex] && (
                      <div className="media-content">
                        {mediaPresignedUrls[viewingMedia[currentMediaIndex]] ? (
                          (() => {
                            const mediaKey = viewingMedia[currentMediaIndex];
                            const filename =
                              mediaKey?.split("/").pop() || "media-file";
                            const fileExtension = filename
                              .split(".")
                              .pop()
                              ?.toLowerCase();

                            if (fileExtension === "pdf") {
                              return (
                                <iframe
                                  src={mediaPresignedUrls[mediaKey]}
                                  title={filename}
                                  className="media-pdf"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    border: "none",
                                    borderRadius: "8px",
                                  }}
                                />
                              );
                            } else if (
                              fileExtension &&
                              [
                                "mp4",
                                "avi",
                                "mov",
                                "wmv",
                                "flv",
                                "webm",
                                "mkv",
                              ].includes(fileExtension)
                            ) {
                              return (
                                <video
                                  controls
                                  className="media-video"
                                  style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    borderRadius: "8px",
                                  }}
                                  onError={(e) => {
                                    console.error(
                                      "Failed to load video:",
                                      e.currentTarget.src
                                    );
                                  }}
                                >
                                  <source
                                    src={mediaPresignedUrls[mediaKey]}
                                    type={`video/${fileExtension}`}
                                  />
                                  Your browser does not support the video tag.
                                </video>
                              );
                            } else if (
                              fileExtension &&
                              [
                                "jpg",
                                "jpeg",
                                "png",
                                "gif",
                                "bmp",
                                "webp",
                                "svg",
                              ].includes(fileExtension)
                            ) {
                              return (
                                <img
                                  src={mediaPresignedUrls[mediaKey]}
                                  alt={filename}
                                  className="media-image"
                                  style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain",
                                    borderRadius: "8px",
                                  }}
                                  onError={(e) => {
                                    console.error(
                                      "Failed to load image:",
                                      e.currentTarget.src
                                    );
                                    const target =
                                      e.currentTarget as HTMLImageElement;
                                    target.style.display = "none";
                                    target.parentElement!.innerHTML =
                                      '<div style="color: #ef4444; padding: 2rem; text-align: center;">Failed to load image</div>';
                                  }}
                                  onLoad={() => {
                                    console.log(
                                      "Image loaded successfully:",
                                      mediaKey
                                    );
                                  }}
                                />
                              );
                            } else {
                              return (
                                <div
                                  style={{
                                    padding: "2rem",
                                    textAlign: "center",
                                    color: "#94a3b8",
                                    background: "#1f2937",
                                    borderRadius: "8px",
                                    border: "2px dashed #374151",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: "3rem",
                                      marginBottom: "1rem",
                                    }}
                                  >
                                    📄
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "1.1rem",
                                      fontWeight: "500",
                                    }}
                                  >
                                    {filename}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.9rem",
                                      marginTop: "0.5rem",
                                      opacity: 0.7,
                                    }}
                                  >
                                    File type:{" "}
                                    {fileExtension?.toUpperCase() || "Unknown"}
                                  </div>
                                  <button
                                    onClick={() =>
                                      openMediaInNewWindow(mediaKey)
                                    }
                                    style={{
                                      marginTop: "1rem",
                                      padding: "0.5rem 1rem",
                                      background: "#3b82f6",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Open File
                                  </button>
                                </div>
                              );
                            }
                          })()
                        ) : (
                          <div className="media-loading">
                            <div
                              style={{ fontSize: "2rem", marginBottom: "1rem" }}
                            >
                              ⏳
                            </div>
                            <div>Loading media...</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="media-filename">
                    {viewingMedia[currentMediaIndex]?.split("/").pop() ||
                      "Unknown file"}
                  </div>
                </div>

                <button
                  className="nav-btn next-btn"
                  onClick={nextMedia}
                  disabled={viewingMedia.length <= 1}
                  title="Next media"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="media-viewer-footer">
              <div className="media-thumbnails">
                {viewingMedia.map((item: string, index: number) => {
                  const filename = item?.split("/").pop() || "";
                  const fileExtension = filename
                    .split(".")
                    .pop()
                    ?.toLowerCase();

                  return (
                    <div
                      key={item}
                      className={`media-thumbnail ${
                        index === currentMediaIndex ? "active" : ""
                      }`}
                      onClick={() => setCurrentMediaIndex(index)}
                      title={filename}
                    >
                      {mediaPresignedUrls[item] ? (
                        fileExtension &&
                        ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(
                          fileExtension
                        ) ? (
                          <img
                            src={mediaPresignedUrls[item]}
                            alt={`Media ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              const target =
                                e.currentTarget as HTMLImageElement;
                              target.style.display = "none";
                              target.parentElement!.innerHTML =
                                '<div style="color: #94a3b8; font-size: 1.5rem;">📷</div>';
                            }}
                          />
                        ) : fileExtension &&
                          ["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(
                            fileExtension
                          ) ? (
                          <div
                            className="video-thumbnail"
                            style={{ color: "#94a3b8", fontSize: "1.5rem" }}
                          >
                            🎥
                          </div>
                        ) : fileExtension === "pdf" ? (
                          <div
                            className="pdf-thumbnail"
                            style={{ color: "#94a3b8", fontSize: "1.5rem" }}
                          >
                            📄
                          </div>
                        ) : (
                          <div
                            className="file-thumbnail"
                            style={{ color: "#94a3b8", fontSize: "1.5rem" }}
                          >
                            📁
                          </div>
                        )
                      ) : (
                        <div
                          className="thumbnail-loading"
                          style={{ color: "#94a3b8", fontSize: "1rem" }}
                        >
                          ...
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showCsvUploadModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Import Properties from CSV</h3>
              <button onClick={clearCsvUpload} className="close-button">
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="csv-upload-section">
                <div className="upload-instructions">
                  <h4>Quick Guide:</h4>
                  <ul>
                    <li>Upload CSV or Excel file (max 10MB)</li>
                    <li>
                      <strong>Required:</strong> lot OR address
                    </li>
                    <li>
                      <strong>Optional:</strong> All other fields
                    </li>
                    <li>
                      <strong>Warning:</strong> This replaces existing
                      properties
                    </li>
                    <li>
                      <strong>Property Types:</strong> Land, Single story,
                      Double story, Dual occupancy, Apartment, Townhouse, Home &
                      Land
                    </li>
                  </ul>

                  <div className="field-mapping-info">
                    <h5>Column Names (any case):</h5>
                    <div className="field-mapping-grid">
                      <div className="field-column">
                        <strong>Basic:</strong>
                        <ul>
                          <li>propertyType</li>
                          <li>lot</li>
                          <li>address</li>
                          <li>suburb</li>
                          <li>availability</li>
                        </ul>
                      </div>
                      <div className="field-column">
                        <strong>Size:</strong>
                        <ul>
                          <li>frontage</li>
                          <li>landSize</li>
                          <li>buildSize</li>
                        </ul>
                      </div>
                      <div className="field-column">
                        <strong>Details:</strong>
                        <ul>
                          <li>bed</li>
                          <li>bath</li>
                          <li>garage</li>
                          <li>price</li>
                        </ul>
                      </div>
                      <div className="field-column">
                        <strong>Other:</strong>
                        <ul>
                          <li>registrationStatus</li>
                          <li>media</li>
                          <li>remark</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="file-upload-area">
                  <input
                    type="file"
                    id="csv-upload"
                    accept=".csv,.xlsx"
                    onChange={handleCsvFileSelect}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="csv-upload" className="file-upload-button">
                    📁 Select CSV/Excel File
                  </label>

                  {csvFile && (
                    <div className="selected-file">
                      <span className="file-name">📄 {csvFile.name}</span>
                      <span className="file-size">
                        ({(csvFile.size / 1024 / 1024).toFixed(2)}MB)
                      </span>
                      <button
                        type="button"
                        onClick={() => setCsvFile(null)}
                        className="remove-file-btn"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {csvUploadError && (
                  <div className="upload-error-message">
                    ❌ {csvUploadError}
                  </div>
                )}

                {csvUploadProgress > 0 && csvUploadProgress < 100 && (
                  <div className="upload-progress-container">
                    <div className="upload-progress-bar">
                      <div
                        className="upload-progress-fill"
                        style={{ width: `${csvUploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="upload-progress-text">
                      {csvUploadProgress}%
                    </span>
                  </div>
                )}

                {csvUploadProgress === 100 && (
                  <div className="upload-success-message">
                    ✅ Upload completed successfully!
                  </div>
                )}

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={clearCsvUpload}
                    className="cancel-button"
                    disabled={csvUploadProgress > 0 && csvUploadProgress < 100}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={processExcelUpload}
                    className="submit-button"
                    disabled={
                      !csvFile ||
                      (csvUploadProgress > 0 && csvUploadProgress < 100)
                    }
                  >
                    {csvUploadProgress > 0 && csvUploadProgress < 100
                      ? "Processing..."
                      : "Import Properties"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
