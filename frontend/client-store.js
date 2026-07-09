/**
 * Femme.Fibre - Unified Client Sizing Matrix & Inquiry Ledger
 * Fulfills HTW Module B10 Constraints: localStorage Persistence & XSS Sanitization
 */

// --- SECURITY FOCUS: XSS Prevention Character-Map Sanitization ---
function sanitizeInput(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
}

// --- LOCAL STORAGE DATABASES INITIALIZATION ---
const DEFAULT_PROFILE = {
    name: "amara diallo",
    measurements: { bust: 88, waist: 64, hips: 92, height: 174 },
    style_notes: "prefers raw untreated textiles with dramatic sculptural structural tailoring alignments."
};

const DEFAULT_ORDERS = [
    {
        order_id: "ff-2026-0091",
        item: "asymmetric linen drape dress",
        status: "pattern modeling phase",
        estimated_delivery: "august 14, 2026"
    }
];

// Seed databases if empty
if (!localStorage.getItem('ff_profile')) {
    localStorage.setItem('ff_profile', JSON.stringify(DEFAULT_PROFILE));
}
if (!localStorage.getItem('ff_orders')) {
    localStorage.setItem('ff_orders', JSON.stringify(DEFAULT_ORDERS));
}
if (!localStorage.getItem('ff_inquiries')) {
    localStorage.setItem('ff_inquiries', JSON.stringify([]));
}

// --- CRUD LIFECYCLE MANAGEMENT INTERFACES ---
const ClientStore = {
    // READ: Profile
    getProfile() {
        return JSON.parse(localStorage.getItem('ff_profile'));
    },

    // UPDATE: Profile (Saves custom dimensions safely)
    updateProfile(updatedData) {
        const current = this.getProfile();
        const merged = {
            name: sanitizeInput(updatedData.name || current.name),
            measurements: {
                bust: parseInt(updatedData.bust) || current.measurements.bust,
                waist: parseInt(updatedData.waist) || current.measurements.waist,
                hips: parseInt(updatedData.hips) || current.measurements.hips,
                height: parseInt(updatedData.height) || current.measurements.height
            },
            style_notes: sanitizeInput(updatedData.style_notes || current.style_notes)
        };
        localStorage.setItem('ff_profile', JSON.stringify(merged));
        return merged;
    },

    // READ: Orders
    getOrders() {
        return JSON.parse(localStorage.getItem('ff_orders'));
    },

    // CREATE: Inquiry (Contact form execution path)
    saveInquiry(data) {
        const inquiries = JSON.parse(localStorage.getItem('ff_inquiries'));
        const newInquiry = {
            id: 'inq_' + Date.now(),
            name: sanitizeInput(data.name),
            email: sanitizeInput(data.email),
            message: sanitizeInput(data.message),
            timestamp: new Date().toISOString()
        };
        inquiries.push(newInquiry);
        localStorage.setItem('ff_inquiries', JSON.stringify(inquiries));
        return newInquiry;
    }
};

window.ClientStore = ClientStore;