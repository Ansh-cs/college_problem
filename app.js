/**
 * CAMPUS SAATHI AI - Smart Campus Issue Reporting & Management System
 * Architecture:
 * - AuthStore: User authentication (Student Signup/Login, Staff Login, Session management)
 * - CampusStore: LocalStorage persistence & state synchronization
 * - PriorityEngine: Rule-based & keyword sentiment engine for High/Med/Low & Urgent Safety
 * - SaathiAI: Campus FAQ Knowledge Assistant & Query Parser
 * - QRController: QR Code generation, printable poster & mobile scan simulator
 * - UI Controller & Component View Renderers
 */

// ==========================================
// 1. AUTHENTICATION STORE (LOGIN / SIGNUP)
// ==========================================
const USERS_STORAGE_KEY = 'campus_saathi_users_v2';
const SESSION_STORAGE_KEY = 'campus_saathi_session_v2';

const DEFAULT_USERS = [
  {
    id: 'USR-101',
    name: 'Aditya Mehra',
    roll: '23CS1088',
    branch: 'Computer Science & Engineering (CSE)',
    year: '3rd Year',
    section: 'A',
    email: 'aditya.cs@campus.edu',
    phone: '9876543210',
    role: 'student',
    password: 'student123'
  },
  {
    id: 'USR-201',
    name: 'Prof. Rajesh Sharma',
    roll: 'FAC-809',
    branch: 'Estate & Infrastructure Management',
    year: 'Faculty / Staff',
    section: 'Main Office',
    email: 'admin@campus.edu',
    phone: '9876500101',
    role: 'admin',
    password: 'admin123'
  }
];

class AuthStore {
  static getUsers() {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
        return DEFAULT_USERS;
      }
      return JSON.parse(raw);
    } catch (e) {
      return DEFAULT_USERS;
    }
  }

  static saveUsers(users) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  static signup(userData) {
    const users = this.getUsers();
    // Check existing email or roll
    const exists = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase() || (userData.roll && u.roll === userData.roll));
    if (exists) {
      return { success: false, message: 'An account with this Email or Roll Number already exists!' };
    }

    const newUser = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      role: 'student',
      ...userData
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser);
    return { success: true, user: newUser };
  }

  static login(identifier, password) {
    const users = this.getUsers();
    const cleanId = identifier.trim().toLowerCase();
    const user = users.find(u => 
      (u.email.toLowerCase() === cleanId || (u.roll && u.roll.toLowerCase() === cleanId)) && 
      u.password === password
    );

    if (!user) {
      return { success: false, message: 'Invalid Roll No / Email or Password' };
    }

    this.setCurrentUser(user);
    return { success: true, user };
  }

  static getCurrentUser() {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  static setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    }
    window.dispatchEvent(new CustomEvent('campus-auth-changed', { detail: user }));
  }

  static logout() {
    this.setCurrentUser(null);
  }
}

// ==========================================
// 2. DATA STORAGE & INITIAL SEED DATA
// ==========================================
const STORAGE_KEY = 'campus_saathi_ai_issues_v2';

const INITIAL_SEED_ISSUES = [
  {
    id: 'CS-2026-101',
    title: 'Water cooler leaking and slippery floor',
    category: 'Water & Sanitation',
    location: 'Mechanical Block - 1st Floor Corridor',
    description: 'Drinking water cooler is leaking continuously. Water is spreading across the floor causing slip hazard for students.',
    priority: 'High',
    isSafetyUrgent: true,
    safetyReason: 'Slip & fall hazard near main classroom corridor',
    status: 'In Progress',
    studentName: 'Rahul Verma',
    studentRoll: '22ME1045',
    studentBranch: 'Mechanical Engineering (ME)',
    studentYear: '4th Year',
    studentSec: 'B',
    studentPhone: '9812345678',
    studentEmail: 'rahul.me@campus.edu',
    reportedVia: 'Web Portal',
    reportedAt: '2026-10-24 09:15 AM',
    updatedAt: '2026-10-24 11:30 AM',
    timeline: [
      { status: 'Open', timestamp: '2026-10-24 09:15 AM', note: 'Issue reported by student' },
      { status: 'In Progress', timestamp: '2026-10-24 11:30 AM', note: 'Plumbing maintenance team dispatched with replacement valve' }
    ]
  },
  {
    id: 'CS-2026-102',
    title: 'Library Wi-Fi router disconnection',
    category: 'IT & Connectivity',
    location: 'Central Library - Reading Room 2',
    description: 'Students unable to connect to Campus-Student-WiFi. Gateway times out repeatedly during study hours.',
    priority: 'Medium',
    isSafetyUrgent: false,
    safetyReason: '',
    status: 'Open',
    studentName: 'Priya Sharma',
    studentRoll: '23EC2011',
    studentBranch: 'Electronics & Comm (ECE)',
    studentYear: '3rd Year',
    studentSec: 'A',
    studentPhone: '9876501234',
    studentEmail: 'priya.ec@campus.edu',
    reportedVia: 'QR Code Scan',
    reportedAt: '2026-10-24 10:00 AM',
    updatedAt: '2026-10-24 10:00 AM',
    timeline: [
      { status: 'Open', timestamp: '2026-10-24 10:00 AM', note: 'Issue submitted via Classroom QR Code Scan' }
    ]
  },
  {
    id: 'CS-2026-103',
    title: 'Hostel Block C tube light flickering',
    category: 'Electrical & Power',
    location: 'Hostel Block C - Room 314',
    description: 'Ceiling tube light in study corner flickers intermittently. Need standard replacement bulb.',
    priority: 'Low',
    isSafetyUrgent: false,
    safetyReason: '',
    status: 'Resolved',
    studentName: 'Aman Gupta',
    studentRoll: '24ME3052',
    studentBranch: 'Mechanical Engineering (ME)',
    studentYear: '2nd Year',
    studentSec: 'C',
    studentPhone: '9845612300',
    studentEmail: 'aman.me@campus.edu',
    reportedVia: 'Web Portal',
    reportedAt: '2026-10-23 04:20 PM',
    updatedAt: '2026-10-24 08:45 AM',
    timeline: [
      { status: 'Open', timestamp: '2026-10-23 04:20 PM', note: 'Issue reported by student' },
      { status: 'In Progress', timestamp: '2026-10-23 06:00 PM', note: 'Electrician assigned task' },
      { status: 'Resolved', timestamp: '2026-10-24 08:45 AM', note: 'New 20W LED tube light installed' }
    ]
  }
];

class CampusStore {
  static getIssues() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_ISSUES));
        return INITIAL_SEED_ISSUES;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('LocalStorage read error:', e);
      return INITIAL_SEED_ISSUES;
    }
  }

  static saveIssues(issues) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
      window.dispatchEvent(new CustomEvent('campus-issues-updated', { detail: issues }));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }

  static addIssue(issueData) {
    const issues = this.getIssues();
    const newId = `CS-2026-${String(Math.floor(100 + Math.random() * 900))}`;
    const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    
    const newIssue = {
      id: newId,
      ...issueData,
      status: 'Open',
      reportedAt: now,
      updatedAt: now,
      timeline: [
        { 
          status: 'Open', 
          timestamp: now, 
          note: issueData.reportedVia === 'QR Code Scan' 
            ? 'Ticket raised via QR Code Scan at campus location' 
            : 'Issue submitted via Campus Saathi portal' 
        }
      ]
    };

    issues.unshift(newIssue);
    this.saveIssues(issues);
    return newIssue;
  }

  static updateStatus(id, newStatus, adminNote = '') {
    const issues = this.getIssues();
    const target = issues.find(i => i.id === id);
    if (!target) return null;

    const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    target.status = newStatus;
    target.updatedAt = now;
    target.timeline.push({
      status: newStatus,
      timestamp: now,
      note: adminNote || `Status updated to ${newStatus} by Admin`
    });

    this.saveIssues(issues);
    return target;
  }

  static resetToDefault() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_ISSUES));
    window.dispatchEvent(new CustomEvent('campus-issues-updated', { detail: INITIAL_SEED_ISSUES }));
  }
}

// ==========================================
// 3. PRIORITY ENGINE (Rule-Based & AI Keywords)
// ==========================================
const PriorityEngine = {
  safetyKeywords: [
    'fire', 'spark', 'shock', 'electric shock', 'exposed wire', 'burning', 'smoke',
    'gas', 'chemical', 'leakage', 'slip', 'slippery', 'hazard', 'ragging',
    'harassment', 'fight', 'violence', 'blood', 'injury', 'medical', 'emergency',
    'broken glass', 'railing', 'lift trapped', 'elevator stuck', 'collapse', 'snake'
  ],

  highKeywords: [
    'projector', 'computer lab', 'lab', 'server', 'exam', 'blackout', 'power cut',
    'drinking water', 'toilet', 'washroom choked', 'auditorium mic', 'exam hall',
    'portal down', 'admit card', 'ac not working', 'air conditioner', 'water tank'
  ],

  mediumKeywords: [
    'wifi', 'wi-fi', 'internet', 'fan', 'light', 'tube light', 'chair', 'desk',
    'bench', 'door lock', 'window', 'mess food', 'canteen', 'printer', 'whiteboard',
    'sound', 'audio', 'bus delay', 'parking'
  ],

  lowKeywords: [
    'paint', 'clean', 'cleaning', 'dustbin', 'gardening', 'grass', 'plant',
    'notice board', 'clock', 'cosmetic', 'suggestion', 'routine'
  ],

  analyze(title = '', description = '', category = '') {
    const combined = `${title} ${description}`.toLowerCase();
    
    const matchedSafety = this.safetyKeywords.filter(k => combined.includes(k));
    const isSafetyUrgent = matchedSafety.length > 0;

    const matchedHigh = this.highKeywords.filter(k => combined.includes(k));
    const matchedMedium = this.mediumKeywords.filter(k => combined.includes(k));
    const matchedLow = this.lowKeywords.filter(k => combined.includes(k));

    let priority = 'Medium';
    let reasoning = [];

    if (isSafetyUrgent) {
      priority = 'High';
      reasoning.push(`Urgent Safety Trigger: Matched safety terms [${matchedSafety.join(', ')}]`);
    } else if (matchedHigh.length > 0 || category === 'Safety & Security') {
      priority = 'High';
      reasoning.push(`High Academic / Infrastructure Impact: [${matchedHigh.join(', ') || category}]`);
    } else if (matchedMedium.length > 0) {
      priority = 'Medium';
      reasoning.push(`Standard Campus Facility Issue: [${matchedMedium.join(', ')}]`);
    } else if (matchedLow.length > 0) {
      priority = 'Low';
      reasoning.push(`Routine maintenance or cosmetic task: [${matchedLow.join(', ')}]`);
    } else {
      if (['Classrooms & Labs', 'Electrical & Power'].includes(category)) {
        priority = 'High';
        reasoning.push(`Category '${category}' prioritized for ongoing academic operations`);
      } else {
        priority = 'Medium';
        reasoning.push('Standard priority assigned by default rule');
      }
    }

    return {
      priority,
      isSafetyUrgent,
      safetyReason: isSafetyUrgent ? `Safety alert triggered by keywords: ${matchedSafety.join(', ')}` : '',
      matchedKeywords: [...matchedSafety, ...matchedHigh, ...matchedMedium, ...matchedLow],
      explanation: reasoning.join('. ')
    };
  }
};

// ==========================================
// 4. SAATHI AI - CAMPUS FAQ RULES
// ==========================================
const SaathiAI = {
  faqDatabase: [
    {
      keywords: ['projector', 'computer lab', 'lab issue', 'audio', 'mic'],
      answer: 'For Computer Lab & Projector issues:\n1. Report directly on this portal or scan the QR Code sticker on your lab desk.\n2. For immediate classroom assistance, contact IT Media Cell at Ext. 4022 or IT Helpdesk (Ground Floor, Admin Block).\n3. Our Priority Engine automatically marks projector faults as High Priority.'
    },
    {
      keywords: ['library', 'books', 'timing', 'fine', 'card', 'reading room'],
      answer: 'Central Library Information:\n• Timings: Mon-Sat 8:00 AM - 10:00 PM (Reading room open 24x7 during exams).\n• Book Limit: 4 books for UG (14 days), 6 books for PG.\n• Overdue Fine: Rs. 2/day per book.\n• Digital Library access is available on campus Wi-Fi at library.campus.edu.'
    },
    {
      keywords: ['wifi', 'wi-fi', 'internet', 'password', 'eduroam', 'login', 'network'],
      answer: 'Campus Wi-Fi & Internet Setup:\n• Network SSID: "Campus-Student-WiFi" or "eduroam"\n• Login Credentials: Use your Roll Number and Student Portal Password.\n• If MAC address binding is required or login fails, contact Computer Center Lab 102 or raise an IT issue on this portal.'
    },
    {
      keywords: ['hostel', 'mess', 'food', 'curfew', 'warden', 'room'],
      answer: 'Hostel & Mess Guidelines:\n• Mess Timings: Breakfast (7:30 - 9:30 AM), Lunch (12:30 - 2:30 PM), Dinner (7:30 - 9:45 PM).\n• Hostel Curfew: 10:00 PM (Extension permission via Chief Warden portal).\n• For food quality or hygiene issues, submit a ticket under "Hostel & Mess" category.'
    },
    {
      keywords: ['emergency', 'medical', 'doctor', 'ambulance', 'hospital', 'security', 'guard', 'safety'],
      answer: 'Emergency & Health Assistance:\n• Campus Health Center: +91 98765 00100 (24x7 Ambulance Available)\n• Chief Security Officer: Ext. 1001 / +91 98765 00101\n• Women Helpline / Anti-Ragging Cell: 1800-180-5522 (Toll Free)\n• For on-site physical hazards, report immediately as High Priority.'
    },
    {
      keywords: ['exam', 'marks', 'hall ticket', 'admit card', 're-evaluation', 'grade'],
      answer: 'Examination Cell Helpdesk:\n• Admit cards can be downloaded from erp.campus.edu 7 days prior to exams.\n• Re-evaluation applications open within 10 days of results declaration at Exam Cell Counter 3.\n• For exam schedule clashes, notify your HOD with proof.'
    },
    {
      keywords: ['status', 'track', 'complaint status', 'my issue', 'qr code'],
      answer: 'You can report issues anytime by scanning the Campus QR code posted in labs, hostels, and corridors! To check your ticket status, visit the "Admin Dashboard" or "Issue List" tab.'
    }
  ],

  query(userText) {
    const clean = userText.toLowerCase().trim();
    if (!clean) {
      return "Hello! I am your Campus Saathi AI. Ask me about campus facilities, projector/lab issues, Wi-Fi, library hours, hostel rules, or report an issue anytime!";
    }

    if (['hi', 'hello', 'hey', 'namaste', 'kaise ho'].includes(clean)) {
      return "Namaste! I am your Campus Saathi AI assistant. How can I help you today? You can ask about library timings, Wi-Fi login, report a broken classroom projector, or hostel mess guidelines!";
    }

    for (const item of this.faqDatabase) {
      const match = item.keywords.some(k => clean.includes(k));
      if (match) return item.answer;
    }

    return `I couldn't find a direct answer for "${userText}". However, you can report this issue right away under the "Report Issue" tab or scan the Campus QR Code. Our smart Priority Engine will categorize and route it directly to staff!`;
  }
};

// ==========================================
// 5. APPLICATION STATE & CONTROLLER
// ==========================================
const AppState = {
  currentTab: 'home', // 'home' | 'report' | 'qr-report' | 'issues' | 'admin' | 'assistant'
  selectedFilterPriority: 'all',
  selectedFilterStatus: 'all',
  searchQuery: '',
  demoStep: 0,
  activeModalIssue: null
};

// Toast notification helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'warning' ? '⚠' : 'ℹ'}</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// Global Tab Switcher
function switchTab(tabId) {
  AppState.currentTab = tabId;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tabId);
  });

  const views = ['home', 'report', 'qr-report', 'issues', 'admin', 'assistant'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) el.style.display = (v === tabId) ? 'block' : 'none';
  });

  renderActiveView();
}

function renderActiveView() {
  updateHeaderCounters();
  updateAuthUI();

  if (AppState.currentTab === 'home') renderHomeView();
  else if (AppState.currentTab === 'report') renderReportView();
  else if (AppState.currentTab === 'qr-report') renderQRReportView();
  else if (AppState.currentTab === 'issues') renderIssuesView();
  else if (AppState.currentTab === 'admin') renderAdminView();
  else if (AppState.currentTab === 'assistant') renderAssistantView();
}

function updateHeaderCounters() {
  const issues = CampusStore.getIssues();
  const total = issues.length;
  const open = issues.filter(i => i.status === 'Open').length;
  const inProgress = issues.filter(i => i.status === 'In Progress').length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;
  const urgent = issues.filter(i => i.isSafetyUrgent && i.status !== 'Resolved').length;

  const elTotal = document.getElementById('stat-total');
  const elOpen = document.getElementById('stat-open');
  const elProgress = document.getElementById('stat-progress');
  const elResolved = document.getElementById('stat-resolved');
  const elUrgent = document.getElementById('nav-urgent-badge');

  if (elTotal) elTotal.innerText = total;
  if (elOpen) elOpen.innerText = open;
  if (elProgress) elProgress.innerText = inProgress;
  if (elResolved) elResolved.innerText = resolved;

  if (elUrgent) {
    elUrgent.innerText = urgent;
    elUrgent.style.display = urgent > 0 ? 'inline-block' : 'none';
  }
}

function updateAuthUI() {
  const container = document.getElementById('navbar-auth-slot');
  if (!container) return;

  const user = AuthStore.getCurrentUser();
  if (user) {
    const roleBadge = user.role === 'admin' 
      ? `<span class="badge" style="background: #1e1b4b; color: white; font-size: 0.65rem;">STAFF</span>`
      : `<span class="badge" style="background: #e0e7ff; color: #3730a3; font-size: 0.65rem;">STUDENT</span>`;

    container.innerHTML = `
      <div class="user-profile-pill">
        <div class="user-profile-avatar">${user.name.charAt(0)}</div>
        <div>
          <div style="font-weight: 700; font-size: 0.8rem; display: flex; align-items: center; gap: 0.35rem;">
            ${escapeHtml(user.name)} ${roleBadge}
          </div>
          <div style="font-size: 0.68rem; color: #64748b;">
            ${user.roll ? user.roll : user.branch}
          </div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="handleLogout()" style="padding: 0.2rem 0.5rem; font-size: 0.72rem; margin-left: 0.3rem;">
          Logout
        </button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button class="btn btn-primary btn-sm" onclick="openAuthModal('login')" style="padding: 0.45rem 0.85rem; font-weight: 700;">
        🔑 Login / Sign Up
      </button>
    `;
  }
}

function handleLogout() {
  AuthStore.logout();
  showToast('Logged out successfully', 'warning');
  renderActiveView();
}

// ==========================================
// 6. AUTH MODAL (LOGIN & SIGNUP)
// ==========================================
let currentAuthTab = 'login'; // 'login' | 'signup'

function openAuthModal(initialTab = 'login') {
  currentAuthTab = initialTab;
  let modal = document.getElementById('auth-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }
  renderAuthModalContent();
}

function renderAuthModalContent() {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-card" style="max-width: 520px;">
      <div class="modal-header">
        <div class="modal-title">🎓 Campus Saathi Portal Authentication</div>
        <button class="modal-close" onclick="closeAuthModal()">&times;</button>
      </div>

      <div class="modal-body">
        <div class="auth-tabs">
          <button class="auth-tab-btn ${currentAuthTab === 'login' ? 'active' : ''}" onclick="switchAuthTab('login')">
            Student / Staff Login
          </button>
          <button class="auth-tab-btn ${currentAuthTab === 'signup' ? 'active' : ''}" onclick="switchAuthTab('signup')">
            New Student Sign Up
          </button>
        </div>

        ${currentAuthTab === 'login' ? renderLoginFormHTML() : renderSignupFormHTML()}

        <!-- 1-Click Quick Demo Login Section -->
        <div class="auth-demo-boxes">
          <div class="demo-login-card" onclick="quickLoginDemo('student')">
            <div style="font-weight: 700; font-size: 0.82rem; color: #1e1b4b;">⚡ Quick Demo: Student</div>
            <div style="font-size: 0.72rem; color: #64748b; margin-top: 0.2rem;">Aditya Mehra (23CS1088, CSE 3rd Year)</div>
          </div>
          <div class="demo-login-card" onclick="quickLoginDemo('admin')">
            <div style="font-weight: 700; font-size: 0.82rem; color: #1e1b4b;">🛡️ Quick Demo: Admin</div>
            <div style="font-size: 0.72rem; color: #64748b; margin-top: 0.2rem;">Prof. Sharma (Maintenance Office)</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function switchAuthTab(tab) {
  currentAuthTab = tab;
  renderAuthModalContent();
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.remove();
}

function renderLoginFormHTML() {
  return `
    <form id="auth-login-form" onsubmit="handleLoginSubmit(event)">
      <div class="form-group" style="margin-bottom: 1rem;">
        <label class="form-label">College Roll Number or Email ID <span class="required">*</span></label>
        <input type="text" id="login-identifier" class="form-input" placeholder="e.g. 23CS1088 or student@campus.edu" required />
      </div>

      <div class="form-group" style="margin-bottom: 1.25rem;">
        <label class="form-label">Password <span class="required">*</span></label>
        <input type="password" id="login-password" class="form-input" placeholder="Enter password (default: student123 or admin123)" required />
      </div>

      <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.75rem;">
        Login to Campus Saathi
      </button>
    </form>
  `;
}

function renderSignupFormHTML() {
  return `
    <form id="auth-signup-form" onsubmit="handleSignupSubmit(event)">
      <div class="form-grid">
        <div class="form-group full">
          <label class="form-label">Full Name <span class="required">*</span></label>
          <input type="text" id="signup-name" class="form-input" placeholder="e.g. Riya Deshmukh" required />
        </div>

        <div class="form-group">
          <label class="form-label">College Roll No. <span class="required">*</span></label>
          <input type="text" id="signup-roll" class="form-input" placeholder="e.g. 24IT1055" required />
        </div>

        <div class="form-group">
          <label class="form-label">Branch / Department <span class="required">*</span></label>
          <select id="signup-branch" class="form-select" required>
            <option value="">Select Branch...</option>
            <option value="Computer Science & Engineering (CSE)">Computer Science (CSE)</option>
            <option value="Information Technology (IT)">Information Technology (IT)</option>
            <option value="Electronics & Comm (ECE)">Electronics & Comm (ECE)</option>
            <option value="Mechanical Engineering (ME)">Mechanical Engineering (ME)</option>
            <option value="Electrical Engineering (EE)">Electrical Engineering (EE)</option>
            <option value="Civil Engineering (CE)">Civil Engineering (CE)</option>
            <option value="Management / MBA">Management / MBA</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Academic Year <span class="required">*</span></label>
          <select id="signup-year" class="form-select" required>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year" selected>3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Section <span class="required">*</span></label>
          <input type="text" id="signup-sec" class="form-input" placeholder="e.g. A" value="A" required />
        </div>

        <div class="form-group">
          <label class="form-label">College Email ID <span class="required">*</span></label>
          <input type="email" id="signup-email" class="form-input" placeholder="e.g. riya.it@campus.edu" required />
        </div>

        <div class="form-group">
          <label class="form-label">Mobile Number <span class="required">*</span></label>
          <input type="tel" id="signup-phone" class="form-input" placeholder="e.g. 9876543210" required />
        </div>

        <div class="form-group full">
          <label class="form-label">Create Password <span class="required">*</span></label>
          <input type="password" id="signup-password" class="form-input" placeholder="Choose a secure password" required />
        </div>
      </div>

      <div style="margin-top: 1.25rem;">
        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.75rem;">
          Register & Create Student Account
        </button>
      </div>
    </form>
  `;
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('login-identifier')?.value.trim();
  const pass = document.getElementById('login-password')?.value;

  const result = AuthStore.login(id, pass);
  if (result.success) {
    showToast(`Welcome back, ${result.user.name}!`, 'success');
    closeAuthModal();
    renderActiveView();
  } else {
    showToast(result.message, 'danger');
  }
}

function handleSignupSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name')?.value.trim();
  const roll = document.getElementById('signup-roll')?.value.trim();
  const branch = document.getElementById('signup-branch')?.value;
  const year = document.getElementById('signup-year')?.value;
  const section = document.getElementById('signup-sec')?.value.trim();
  const email = document.getElementById('signup-email')?.value.trim();
  const phone = document.getElementById('signup-phone')?.value.trim();
  const password = document.getElementById('signup-password')?.value;

  const result = AuthStore.signup({
    name, roll, branch, year, section, email, phone, password
  });

  if (result.success) {
    showToast(`Account created for ${result.user.name}!`, 'success');
    closeAuthModal();
    renderActiveView();
  } else {
    showToast(result.message, 'danger');
  }
}

function quickLoginDemo(role) {
  const users = AuthStore.getUsers();
  const target = users.find(u => u.role === role);
  if (target) {
    AuthStore.setCurrentUser(target);
    showToast(`Logged in as ${target.name} (${role.toUpperCase()})`, 'success');
    closeAuthModal();
    renderActiveView();
  }
}

// ==========================================
// 7. QR CODE POSTER & SCAN GENERATOR
// ==========================================
function getQRTargetURL() {
  // Generates direct hash link so scanning immediately opens the student reporting view
  const base = window.location.origin + window.location.pathname;
  return `${base}#qr-report`;
}

function openQRPosterModal() {
  let modal = document.getElementById('qr-poster-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'qr-poster-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const qrURL = getQRTargetURL();

  modal.innerHTML = `
    <div class="modal-card" style="max-width: 560px;">
      <div class="modal-header no-print">
        <div class="modal-title">📷 Campus QR Code Poster (Scan & Report)</div>
        <button class="modal-close" onclick="closeQRPosterModal()">&times;</button>
      </div>

      <div class="modal-body" style="padding: 1.5rem;">
        <!-- Printable QR Poster Card -->
        <div class="qr-poster-card" id="printable-qr-poster">
          <div style="font-size: 2rem; margin-bottom: 0.25rem;">🎓</div>
          <h2 style="font-size: 1.25rem; font-weight: 800; color: #1e1b4b; letter-spacing: -0.01em;">
            CAMPUS SAATHI AI
          </h2>
          <div style="font-size: 0.78rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.15rem;">
            Instant Campus Problem Reporting
          </div>

          <!-- QR Code Canvas Container -->
          <div class="qr-code-wrapper">
            <div id="poster-qrcode-target"></div>
          </div>

          <h3 style="font-size: 1.05rem; font-weight: 800; color: #0f172a;">
            SCAN WITH ANY PHONE CAMERA
          </h3>
          <p style="font-size: 0.8rem; color: #475569; margin: 0.5rem auto 1rem; max-width: 320px; line-height: 1.4;">
            Found a broken projector, Wi-Fi outage, water leak, or electrical fault? Scan this QR sticker, enter your college details, and raise a ticket directly to staff in seconds!
          </p>

          <div style="background: #f1f5f9; padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.72rem; color: #64748b; font-family: monospace; word-break: break-all;">
            Target URL: ${qrURL}
          </div>
        </div>

        <!-- Poster Controls -->
        <div class="no-print" style="margin-top: 1.25rem; display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="simulateQRScan()">
            📱 Simulate Mobile Scan (Open Form)
          </button>
          <button class="btn btn-secondary" onclick="window.print()">
            🖨️ Print / Save Poster
          </button>
          <button class="btn btn-secondary" onclick="copyQRURL('${qrURL}')">
            📋 Copy Link
          </button>
        </div>
      </div>

      <div class="modal-footer no-print">
        <button class="btn btn-secondary btn-sm" onclick="closeQRPosterModal()">Close</button>
      </div>
    </div>
  `;

  // Render QR Code onto target
  setTimeout(() => {
    const target = document.getElementById('poster-qrcode-target');
    if (target && typeof QRCode !== 'undefined') {
      new QRCode(target, {
        text: qrURL,
        width: 200,
        height: 200,
        colorDark: "#1e1b4b",
        colorLight: "#ffffff"
      });
    }
  }, 100);
}

function closeQRPosterModal() {
  const modal = document.getElementById('qr-poster-modal');
  if (modal) modal.remove();
}

function simulateQRScan() {
  closeQRPosterModal();
  switchTab('qr-report');
  showToast('Simulated QR Code Scan from Mobile!', 'success');
}

function copyQRURL(url) {
  navigator.clipboard.writeText(url).then(() => {
    showToast('QR Report link copied to clipboard!', 'success');
  }).catch(() => {
    prompt('Copy QR link:', url);
  });
}

// ==========================================
// 8. QUICK STUDENT QR SCAN & REPORT VIEW
// (When a student scans the QR code or clicks simulate scan)
// ==========================================
function renderQRReportView() {
  const container = document.getElementById('view-qr-report');
  if (!container) return;

  const currentUser = AuthStore.getCurrentUser();

  container.innerHTML = `
    <div style="max-width: 820px; margin: 0 auto;">
      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #0f172a, #1e1b4b); color: white; border-radius: var(--radius-lg); padding: 1.75rem; margin-bottom: 1.5rem; box-shadow: var(--shadow);">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(79, 70, 229, 0.35); padding: 0.2rem 0.65rem; border-radius: 999px; font-size: 0.72rem; font-weight: 700; color: #a5b4fc; margin-bottom: 0.5rem;">
              <span>📱 SCANNED VIA CAMPUS QR CODE</span>
            </div>
            <h2 style="font-size: 1.5rem; font-weight: 800;">Student Problem Report & Ticket Raiser</h2>
            <p style="color: #cbd5e1; font-size: 0.85rem; margin-top: 0.25rem;">
              Fill in your college details and describe the problem. Your ticket will be raised directly to the Admin Dashboard!
            </p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="openQRPosterModal()" style="background: rgba(255,255,255,0.15); color: white; border-color: rgba(255,255,255,0.3);">
            📷 View QR Poster
          </button>
        </div>
      </div>

      <div class="card">
        <form id="qr-report-form" onsubmit="handleQRReportSubmit(event)">
          
          <!-- SECTION 1: STUDENT COLLEGE DETAILS -->
          <div style="border-bottom: 1px solid var(--border); padding-bottom: 1.25rem; margin-bottom: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h3 style="font-size: 1rem; font-weight: 800; color: #1e1b4b; display: flex; align-items: center; gap: 0.4rem;">
                <span>🎓 1. Student & College Identification Details</span>
              </h3>
              ${!currentUser ? `
                <button type="button" class="btn btn-secondary btn-sm" onclick="openAuthModal('login')">
                  Autofill with Login &rarr;
                </button>
              ` : `
                <span class="badge" style="background: #e0f2fe; color: #0369a1;">Logged In As: ${escapeHtml(currentUser.name)}</span>
              `}
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Student Full Name <span class="required">*</span></label>
                <input 
                  type="text" 
                  id="qr-student-name" 
                  class="form-input" 
                  placeholder="e.g. Aditya Mehra" 
                  value="${currentUser?.name || ''}" 
                  required 
                />
              </div>

              <div class="form-group">
                <label class="form-label">College Roll Number / ID <span class="required">*</span></label>
                <input 
                  type="text" 
                  id="qr-student-roll" 
                  class="form-input" 
                  placeholder="e.g. 23CS1088" 
                  value="${currentUser?.roll || ''}" 
                  required 
                />
              </div>

              <div class="form-group">
                <label class="form-label">Department / Branch <span class="required">*</span></label>
                <select id="qr-student-branch" class="form-select" required>
                  <option value="">Select Branch...</option>
                  <option value="Computer Science & Engineering (CSE)" ${currentUser?.branch?.includes('Computer') ? 'selected' : ''}>Computer Science (CSE)</option>
                  <option value="Information Technology (IT)" ${currentUser?.branch?.includes('Information') ? 'selected' : ''}>Information Technology (IT)</option>
                  <option value="Electronics & Comm (ECE)" ${currentUser?.branch?.includes('Electronics') ? 'selected' : ''}>Electronics & Comm (ECE)</option>
                  <option value="Mechanical Engineering (ME)" ${currentUser?.branch?.includes('Mechanical') ? 'selected' : ''}>Mechanical Engineering (ME)</option>
                  <option value="Electrical Engineering (EE)" ${currentUser?.branch?.includes('Electrical') ? 'selected' : ''}>Electrical Engineering (EE)</option>
                  <option value="Civil Engineering (CE)" ${currentUser?.branch?.includes('Civil') ? 'selected' : ''}>Civil Engineering (CE)</option>
                  <option value="Management / MBA" ${currentUser?.branch?.includes('Management') ? 'selected' : ''}>Management / MBA</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Academic Year & Section <span class="required">*</span></label>
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 0.5rem;">
                  <select id="qr-student-year" class="form-select" required>
                    <option value="1st Year" ${currentUser?.year === '1st Year' ? 'selected' : ''}>1st Year</option>
                    <option value="2nd Year" ${currentUser?.year === '2nd Year' ? 'selected' : ''}>2nd Year</option>
                    <option value="3rd Year" ${currentUser?.year === '3rd Year' || !currentUser ? 'selected' : ''}>3rd Year</option>
                    <option value="4th Year" ${currentUser?.year === '4th Year' ? 'selected' : ''}>4th Year</option>
                  </select>
                  <input type="text" id="qr-student-sec" class="form-input" placeholder="Sec A" value="${currentUser?.section || 'A'}" required />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">College Email ID <span class="required">*</span></label>
                <input 
                  type="email" 
                  id="qr-student-email" 
                  class="form-input" 
                  placeholder="e.g. aditya.cs@campus.edu" 
                  value="${currentUser?.email || ''}" 
                  required 
                />
              </div>

              <div class="form-group">
                <label class="form-label">Mobile Contact Number <span class="required">*</span></label>
                <input 
                  type="tel" 
                  id="qr-student-phone" 
                  class="form-input" 
                  placeholder="e.g. 9876543210" 
                  value="${currentUser?.phone || ''}" 
                  required 
                />
              </div>
            </div>
          </div>

          <!-- SECTION 2: PROBLEM DETAILS -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h3 style="font-size: 1rem; font-weight: 800; color: #1e1b4b; display: flex; align-items: center; gap: 0.4rem;">
                <span>🛠️ 2. Problem Information & Location</span>
              </h3>
              <button type="button" class="btn btn-secondary btn-sm" onclick="fillQRSampleDemo()">
                💡 Auto-Fill Sample Issue
              </button>
            </div>

            <div class="form-grid">
              <div class="form-group full">
                <label class="form-label">What is the problem? (Issue Title) <span class="required">*</span></label>
                <input 
                  type="text" 
                  id="qr-issue-title" 
                  class="form-input" 
                  placeholder="e.g. Computer lab projector is not working" 
                  required
                  oninput="handleQRRealtimePriorityPreview()"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Category <span class="required">*</span></label>
                <select id="qr-issue-category" class="form-select" required onchange="handleQRRealtimePriorityPreview()">
                  <option value="">Select Category...</option>
                  <option value="Classrooms & Labs">Classrooms & Labs (Projectors, Audio, Computers)</option>
                  <option value="Electrical & Power">Electrical & Power (Wiring, Spark, Lights, Fans)</option>
                  <option value="Water & Sanitation">Water & Sanitation (Drinking Coolers, Washrooms)</option>
                  <option value="Hostel & Mess">Hostel & Mess (Food, Furniture, Hygiene)</option>
                  <option value="IT & Connectivity">IT & Connectivity (Wi-Fi, LAN, Portal)</option>
                  <option value="Safety & Security">Safety & Security (Hazards, Fire, Lighting)</option>
                  <option value="Library & General">Library & General Campus Facilities</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Campus Exact Location / Room No. <span class="required">*</span></label>
                <input 
                  type="text" 
                  id="qr-issue-location" 
                  class="form-input" 
                  placeholder="e.g. CS Block - Lab 302, 3rd Floor" 
                  required 
                />
              </div>

              <div class="form-group full">
                <label class="form-label">Describe the problem in detail <span class="required">*</span></label>
                <textarea 
                  id="qr-issue-description" 
                  class="form-textarea" 
                  rows="3" 
                  placeholder="Explain what is broken, what symptoms are occurring, and if it disrupts active classes or causes safety risk..." 
                  required
                  oninput="handleQRRealtimePriorityPreview()"
                ></textarea>
              </div>
            </div>

            <!-- Real-Time AI Priority Preview for QR Scan Form -->
            <div id="qr-priority-preview-container" class="priority-preview-box medium" style="margin-top: 1rem;">
              <div class="priority-preview-header">
                <div class="priority-preview-title">
                  <span>🧠 AI Priority Engine Live Evaluation</span>
                </div>
                <div id="qr-preview-badge-slot">
                  <span class="badge badge-medium">Medium Priority</span>
                </div>
              </div>
              <p id="qr-preview-explanation" style="font-size: 0.85rem; color: #334155; margin-bottom: 0.35rem;">
                Priority will be automatically determined by our AI rule engine.
              </p>
              <div id="qr-preview-keywords-wrap" style="font-size: 0.75rem; color: #64748b;">
                Keywords detected: <span id="qr-preview-keywords">none</span>
              </div>
            </div>

            <!-- Submit Button -->
            <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem;">
              <button type="submit" class="btn btn-primary" style="padding: 0.85rem 2rem; font-weight: 800; font-size: 1rem; box-shadow: var(--shadow);">
                🚀 Submit & Raise Ticket to Admin Dashboard
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;
}

function handleQRRealtimePriorityPreview() {
  const title = document.getElementById('qr-issue-title')?.value || '';
  const desc = document.getElementById('qr-issue-description')?.value || '';
  const category = document.getElementById('qr-issue-category')?.value || '';

  const analysis = PriorityEngine.analyze(title, desc, category);
  const box = document.getElementById('qr-priority-preview-container');
  const badgeSlot = document.getElementById('qr-preview-badge-slot');
  const explEl = document.getElementById('qr-preview-explanation');
  const keyEl = document.getElementById('qr-preview-keywords');

  if (!box || !badgeSlot) return;

  box.className = `priority-preview-box ${analysis.isSafetyUrgent ? 'urgent' : analysis.priority.toLowerCase()}`;

  if (analysis.isSafetyUrgent) {
    badgeSlot.innerHTML = `<span class="badge badge-urgent">⚡ Urgent Safety Flag</span>`;
  } else if (analysis.priority === 'High') {
    badgeSlot.innerHTML = `<span class="badge badge-high">High Priority</span>`;
  } else if (analysis.priority === 'Medium') {
    badgeSlot.innerHTML = `<span class="badge badge-medium">Medium Priority</span>`;
  } else {
    badgeSlot.innerHTML = `<span class="badge badge-low">Low Priority</span>`;
  }

  if (explEl) explEl.innerText = analysis.explanation;
  if (keyEl) keyEl.innerText = analysis.matchedKeywords.length > 0 ? analysis.matchedKeywords.join(', ') : 'none';
}

function fillQRSampleDemo() {
  const nameEl = document.getElementById('qr-student-name');
  const rollEl = document.getElementById('qr-student-roll');
  const branchEl = document.getElementById('qr-student-branch');
  const yearEl = document.getElementById('qr-student-year');
  const secEl = document.getElementById('qr-student-sec');
  const emailEl = document.getElementById('qr-student-email');
  const phoneEl = document.getElementById('qr-student-phone');

  const titleEl = document.getElementById('qr-issue-title');
  const catEl = document.getElementById('qr-issue-category');
  const locEl = document.getElementById('qr-issue-location');
  const descEl = document.getElementById('qr-issue-description');

  if (nameEl && !nameEl.value) nameEl.value = 'Rohan Deshmukh';
  if (rollEl && !rollEl.value) rollEl.value = '23CS1092';
  if (branchEl && !branchEl.value) branchEl.value = 'Computer Science & Engineering (CSE)';
  if (yearEl) yearEl.value = '3rd Year';
  if (secEl) secEl.value = 'B';
  if (emailEl && !emailEl.value) emailEl.value = 'rohan.d@campus.edu';
  if (phoneEl && !phoneEl.value) phoneEl.value = '9876599887';

  if (titleEl) titleEl.value = 'Computer lab projector is not working';
  if (catEl) catEl.value = 'Classrooms & Labs';
  if (locEl) locEl.value = 'CS Block - Lab 302';
  if (descEl) descEl.value = 'Scanned from QR code sticker in Lab 302. Projector powers on but HDMI signal keeps dropping during lab lectures.';

  handleQRRealtimePriorityPreview();
  showToast('Sample student & issue details filled!');
}

function handleQRReportSubmit(e) {
  e.preventDefault();

  const studentName = document.getElementById('qr-student-name')?.value.trim();
  const studentRoll = document.getElementById('qr-student-roll')?.value.trim();
  const studentBranch = document.getElementById('qr-student-branch')?.value;
  const studentYear = document.getElementById('qr-student-year')?.value;
  const studentSec = document.getElementById('qr-student-sec')?.value.trim();
  const studentEmail = document.getElementById('qr-student-email')?.value.trim();
  const studentPhone = document.getElementById('qr-student-phone')?.value.trim();

  const title = document.getElementById('qr-issue-title')?.value.trim();
  const category = document.getElementById('qr-issue-category')?.value;
  const location = document.getElementById('qr-issue-location')?.value.trim();
  const description = document.getElementById('qr-issue-description')?.value.trim();

  if (!studentName || !studentRoll || !title || !category || !location || !description) {
    showToast('Please fill all required fields (*)', 'danger');
    return;
  }

  // Priority analysis
  const analysis = PriorityEngine.analyze(title, description, category);

  const newIssue = CampusStore.addIssue({
    title,
    category,
    location,
    description,
    priority: analysis.priority,
    isSafetyUrgent: analysis.isSafetyUrgent,
    safetyReason: analysis.safetyReason,
    studentName,
    studentRoll,
    studentBranch,
    studentYear,
    studentSec,
    studentEmail,
    studentPhone,
    reportedVia: 'QR Code Scan'
  });

  // Open confirmation modal then navigate directly to Admin Dashboard
  showTicketSuccessModal(newIssue);
}

function showTicketSuccessModal(issue) {
  let modal = document.getElementById('ticket-success-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ticket-success-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-card" style="max-width: 520px; text-align: center;">
      <div class="modal-body" style="padding: 2rem 1.5rem;">
        <div style="width: 4rem; height: 4rem; border-radius: 50%; background: #dcfce7; color: #16a34a; font-size: 2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
          ✓
        </div>
        <h2 style="font-size: 1.4rem; font-weight: 800; color: #065f46; margin-bottom: 0.25rem;">
          Ticket Raised Successfully via QR Code!
        </h2>
        <div style="font-size: 0.85rem; color: #64748b; margin-bottom: 1.25rem;">
          Your issue has been submitted and is now LIVE on the Admin Dashboard.
        </div>

        <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius); padding: 1rem; text-align: left; font-size: 0.85rem; margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <strong style="color: var(--primary); font-family: monospace; font-size: 1.1rem;">${issue.id}</strong>
            <span class="badge ${issue.isSafetyUrgent ? 'badge-urgent' : issue.priority === 'High' ? 'badge-high' : 'badge-medium'}">
              ${issue.priority} Priority
            </span>
          </div>
          <div><strong>Student:</strong> ${escapeHtml(issue.studentName)} (${escapeHtml(issue.studentRoll)})</div>
          <div><strong>College Branch:</strong> ${escapeHtml(issue.studentBranch || 'N/A')} - ${escapeHtml(issue.studentYear || '')}</div>
          <div><strong>Location:</strong> 📍 ${escapeHtml(issue.location)}</div>
          <div><strong>Title:</strong> ${escapeHtml(issue.title)}</div>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: center;">
          <button class="btn btn-primary" onclick="closeTicketSuccessModal(); switchTab('admin'); openIssueModal('${issue.id}');">
            View on Admin Dashboard &rarr;
          </button>
          <button class="btn btn-secondary" onclick="closeTicketSuccessModal(); switchTab('home');">
            Go to Home
          </button>
        </div>
      </div>
    </div>
  `;
}

function closeTicketSuccessModal() {
  const modal = document.getElementById('ticket-success-modal');
  if (modal) modal.remove();
}

// ==========================================
// 9. HOME VIEW
// ==========================================
function renderHomeView() {
  const issues = CampusStore.getIssues();
  const total = issues.length;
  const open = issues.filter(i => i.status === 'Open').length;
  const inProgress = issues.filter(i => i.status === 'In Progress').length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;
  const urgent = issues.filter(i => i.isSafetyUrgent && i.status !== 'Resolved').length;

  const container = document.getElementById('view-home');
  if (!container) return;

  container.innerHTML = `
    <!-- Top Summary Banner -->
    <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); color: white; border-radius: var(--radius-lg); padding: 2rem; margin-bottom: 2rem; box-shadow: var(--shadow-lg);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem;">
        <div>
          <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.15); padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.75rem;">
            <span>🤖 AI-POWERED CAMPUS INFRASTRUCTURE</span>
          </div>
          <h1 style="font-size: 2rem; font-weight: 800; letter-spacing: -0.02em; line-height: 1.2;">CAMPUS SAATHI AI</h1>
          <p style="color: #c7d2fe; max-width: 620px; font-size: 0.95rem; margin-top: 0.5rem;">
            Smart Campus Issue Reporting & Management System with Instant QR Code Scanning, Rule-Based AI Prioritization, and Transparent Staff Lifecycle Tracking.
          </p>
        </div>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="openQRPosterModal()" style="background: #10b981; color: #ffffff; font-weight: 700; border-color: #059669;">
            📷 Campus QR Poster
          </button>
          <button class="btn btn-primary" onclick="switchTab('report')" style="background: #ffffff; color: #312e81; font-weight: 700;">
            📝 Report Issue
          </button>
          <button class="btn btn-secondary" onclick="startDemoScenario()" style="background: rgba(255,255,255,0.15); color: white; border-color: rgba(255,255,255,0.3); font-weight: 700;">
            🚀 Run Demo
          </button>
        </div>
      </div>
    </div>

    <!-- Live Metrics Counter -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">📊</div>
        <div class="stat-details">
          <h4>Total Issues</h4>
          <div class="stat-val" id="stat-total">${total}</div>
          <div class="stat-sub">LocalStorage Synced</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon amber">⏳</div>
        <div class="stat-details">
          <h4>Open / Pending</h4>
          <div class="stat-val" id="stat-open">${open}</div>
          <div class="stat-sub">Awaiting staff action</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon rose">⚙️</div>
        <div class="stat-details">
          <h4>In Progress</h4>
          <div class="stat-val" id="stat-progress">${inProgress}</div>
          <div class="stat-sub">Under active maintenance</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon emerald">✅</div>
        <div class="stat-details">
          <h4>Resolved</h4>
          <div class="stat-val" id="stat-resolved">${resolved}</div>
          <div class="stat-sub">Verified & completed</div>
        </div>
      </div>
    </div>

    <!-- QR Scan Promo Card -->
    <div class="card" style="background: linear-gradient(135deg, #eff6ff, #f8fafc); border: 1.5px solid #bfdbfe;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="width: 3.5rem; height: 3.5rem; border-radius: var(--radius); background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.75rem;">
            📱
          </div>
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #1e3a8a;">Instant Mobile QR Code Reporting Active</h3>
            <p style="font-size: 0.85rem; color: #475569; margin-top: 0.2rem;">
              Students can scan classroom or lab QR stickers from any mobile device, enter their college details, and raise issues directly to the admin dashboard!
            </p>
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-primary btn-sm" onclick="openQRPosterModal()">
            📷 View / Print QR Poster
          </button>
          <button class="btn btn-secondary btn-sm" onclick="simulateQRScan()">
            ⚡ Simulate Mobile Scan
          </button>
        </div>
      </div>
    </div>

    <!-- End-to-End Workflow Diagram Card (Page 1 in PDF) -->
    <div class="card">
      <div class="section-header">
        <div>
          <h2 class="section-title">🗺️ End-to-End Working Flow</h2>
          <p class="section-subtitle">Visual sequence followed during reporting, automated prioritization, and staff resolution</p>
        </div>
        <span class="badge badge-medium">Official Prototype Architecture</span>
      </div>

      <div class="step-chain">
        <div class="step-node completed">
          <div class="step-num">1</div>
          <div class="step-label">Student Reports Issue</div>
          <div style="font-size: 0.68rem; color: #64748b; margin-top: 0.25rem;">Web form or Mobile QR Code Scan</div>
        </div>
        <div class="step-node completed">
          <div class="step-num">2</div>
          <div class="step-label">Validation & Creation</div>
          <div style="font-size: 0.68rem; color: #64748b; margin-top: 0.25rem;">Required check + Student College details</div>
        </div>
        <div class="step-node current">
          <div class="step-num">3</div>
          <div class="step-label">Priority Engine</div>
          <div style="font-size: 0.68rem; color: #64748b; margin-top: 0.25rem;">JS Rules evaluate High, Med, Low & Safety</div>
        </div>
        <div class="step-node completed">
          <div class="step-num">4</div>
          <div class="step-label">Save The Issue</div>
          <div style="font-size: 0.68rem; color: #64748b; margin-top: 0.25rem;">Stored in browser LocalStorage</div>
        </div>
        <div class="step-node">
          <div class="step-num">5</div>
          <div class="step-label">Admin Dashboard</div>
          <div style="font-size: 0.68rem; color: #64748b; margin-top: 0.25rem;">View Student info & update status</div>
        </div>
        <div class="step-node">
          <div class="step-num">6</div>
          <div class="step-label">Dashboard Updates</div>
          <div style="font-size: 0.68rem; color: #64748b; margin-top: 0.25rem;">Counters refresh & Student tracks latest state</div>
        </div>
      </div>
    </div>

    <!-- Recent Urgent & Active Tickets -->
    <div class="card">
      <div class="section-header">
        <div>
          <h2 class="section-title">🚨 Recent Urgent & High Priority Issues</h2>
          <p class="section-subtitle">Automatically flagged by Campus Saathi Priority Engine for immediate staff intervention</p>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="switchTab('admin')">Open Full Admin Dashboard &rarr;</button>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Issue ID</th>
              <th>Issue Title & Location</th>
              <th>Student Details</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${renderRecentIssuesRows(issues.slice(0, 5))}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderRecentIssuesRows(issuesList) {
  if (issuesList.length === 0) {
    return `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No campus issues reported yet.</td></tr>`;
  }

  return issuesList.map(issue => {
    const priorityBadge = issue.isSafetyUrgent 
      ? `<span class="badge badge-urgent">⚡ Urgent Safety</span>`
      : issue.priority === 'High' 
        ? `<span class="badge badge-high">High Priority</span>`
        : issue.priority === 'Medium'
          ? `<span class="badge badge-medium">Medium</span>`
          : `<span class="badge badge-low">Low</span>`;

    const statusBadge = issue.status === 'Resolved'
      ? `<span class="badge badge-status-resolved">✓ Resolved</span>`
      : issue.status === 'In Progress'
        ? `<span class="badge badge-status-progress">⚙️ In Progress</span>`
        : `<span class="badge badge-status-open">⏳ Open</span>`;

    const sourceTag = issue.reportedVia === 'QR Code Scan'
      ? `<span class="student-tag" style="background: #ecfdf5; color: #065f46;">📱 QR Scan</span>`
      : `<span class="student-tag">💻 Web</span>`;

    return `
      <tr>
        <td style="font-family: monospace; font-weight: 700; color: var(--primary);">
          ${issue.id}
          <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 2px;">${sourceTag}</div>
        </td>
        <td>
          <div class="issue-title-cell">${escapeHtml(issue.title)}</div>
          <div class="issue-loc-cell">📍 ${escapeHtml(issue.location)}</div>
        </td>
        <td>
          <div style="font-weight: 700; font-size: 0.82rem; color: #0f172a;">${escapeHtml(issue.studentName || 'Student')}</div>
          <div style="font-size: 0.72rem; color: #64748b;">${escapeHtml(issue.studentRoll || 'N/A')} • ${escapeHtml(issue.studentBranch || '')}</div>
        </td>
        <td>${priorityBadge}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="openIssueModal('${issue.id}')">View Details</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// 10. REPORT ISSUE VIEW (Standard Web Form)
// ==========================================
function renderReportView() {
  const container = document.getElementById('view-report');
  if (!container) return;

  const currentUser = AuthStore.getCurrentUser();

  container.innerHTML = `
    <div style="max-width: 820px; margin: 0 auto;">
      <div class="section-header">
        <div>
          <h2 class="section-title">📝 Report a Campus Problem</h2>
          <p class="section-subtitle">Fill in the details below. Our AI Priority Engine will evaluate urgency in real time.</p>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-secondary btn-sm" onclick="switchTab('qr-report')">
            📱 Use QR Mobile Form
          </button>
          <button class="btn btn-secondary btn-sm" onclick="fillProjectorDemo()">
            💡 Fill Demo: "Lab projector"
          </button>
        </div>
      </div>

      <div class="card">
        <form id="report-issue-form" onsubmit="handleIssueSubmit(event)">
          <div class="form-grid">
            
            <!-- Issue Title -->
            <div class="form-group full">
              <label class="form-label">
                <span>Issue Title</span>
                <span class="required">*</span>
              </label>
              <input 
                type="text" 
                id="form-title" 
                class="form-input" 
                placeholder="e.g. Computer lab projector is not working"
                required
                oninput="handleRealtimePriorityPreview()"
              />
              <span class="form-help">Be concise and specific about the equipment or breakdown</span>
            </div>

            <!-- Category -->
            <div class="form-group">
              <label class="form-label">
                <span>Campus Category</span>
                <span class="required">*</span>
              </label>
              <select id="form-category" class="form-select" required onchange="handleRealtimePriorityPreview()">
                <option value="">Select Category...</option>
                <option value="Classrooms & Labs">Classrooms & Labs (Projectors, Audio, Computers)</option>
                <option value="Electrical & Power">Electrical & Power (Wiring, Spark, Lights, Fans)</option>
                <option value="Water & Sanitation">Water & Sanitation (Drinking Coolers, Washrooms)</option>
                <option value="Hostel & Mess">Hostel & Mess (Food, Furniture, Hygiene)</option>
                <option value="IT & Connectivity">IT & Connectivity (Wi-Fi, LAN, Portal)</option>
                <option value="Safety & Security">Safety & Security (Hazards, Fire, Lighting)</option>
                <option value="Library & General">Library & General Campus Facilities</option>
              </select>
            </div>

            <!-- Location -->
            <div class="form-group">
              <label class="form-label">
                <span>Campus Location / Room No.</span>
                <span class="required">*</span>
              </label>
              <input 
                type="text" 
                id="form-location" 
                class="form-input" 
                placeholder="e.g. CS Block - Lab 302, 3rd Floor"
                required
              />
            </div>

            <!-- Description -->
            <div class="form-group full">
              <label class="form-label">
                <span>Detailed Description</span>
                <span class="required">*</span>
              </label>
              <textarea 
                id="form-description" 
                class="form-textarea" 
                rows="3"
                placeholder="Provide helpful context: Is it causing class interruption? Are there visible spark/burn marks? What symptoms occur?"
                required
                oninput="handleRealtimePriorityPreview()"
              ></textarea>
            </div>

            <!-- Student College Details -->
            <div class="form-group">
              <label class="form-label">Student Name</label>
              <input type="text" id="form-student-name" class="form-input" placeholder="e.g. Aditya Mehra" value="${currentUser?.name || ''}" />
            </div>

            <div class="form-group">
              <label class="form-label">College Roll Number</label>
              <input type="text" id="form-student-roll" class="form-input" placeholder="e.g. 23CS1088" value="${currentUser?.roll || ''}" />
            </div>

            <div class="form-group">
              <label class="form-label">Branch / Department</label>
              <input type="text" id="form-student-branch" class="form-input" placeholder="e.g. Computer Science (CSE)" value="${currentUser?.branch || 'Computer Science & Engineering (CSE)'}" />
            </div>

            <div class="form-group">
              <label class="form-label">Year & Section</label>
              <input type="text" id="form-student-year" class="form-input" placeholder="e.g. 3rd Year (Sec A)" value="${currentUser ? currentUser.year + ' (Sec ' + currentUser.section + ')' : '3rd Year (Sec A)'}" />
            </div>

          </div>

          <!-- Real-Time AI Priority Engine Preview -->
          <div id="priority-preview-container" class="priority-preview-box medium">
            <div class="priority-preview-header">
              <div class="priority-preview-title">
                <span>🧠 AI Priority Engine Live Analysis</span>
              </div>
              <div id="preview-badge-slot">
                <span class="badge badge-medium">Medium Priority</span>
              </div>
            </div>
            <p id="preview-explanation" style="font-size: 0.85rem; color: #334155; margin-bottom: 0.35rem;">
              Type your issue title and description to see how Campus Saathi AI evaluates priority in real-time.
            </p>
            <div id="preview-keywords-wrap" style="font-size: 0.75rem; color: #64748b;">
              Keywords detected: <span id="preview-keywords">none</span>
            </div>
          </div>

          <!-- Actions -->
          <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem;">
            <button type="button" class="btn btn-secondary" onclick="resetReportForm()">Clear</button>
            <button type="submit" class="btn btn-primary" style="padding: 0.75rem 1.75rem;">
              🚀 Submit Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function handleRealtimePriorityPreview() {
  const title = document.getElementById('form-title')?.value || '';
  const desc = document.getElementById('form-description')?.value || '';
  const category = document.getElementById('form-category')?.value || '';

  const analysis = PriorityEngine.analyze(title, desc, category);
  const box = document.getElementById('priority-preview-container');
  const badgeSlot = document.getElementById('preview-badge-slot');
  const explEl = document.getElementById('preview-explanation');
  const keyEl = document.getElementById('preview-keywords');

  if (!box || !badgeSlot) return;

  box.className = `priority-preview-box ${analysis.isSafetyUrgent ? 'urgent' : analysis.priority.toLowerCase()}`;

  if (analysis.isSafetyUrgent) {
    badgeSlot.innerHTML = `<span class="badge badge-urgent">⚡ Urgent Safety Flag</span>`;
  } else if (analysis.priority === 'High') {
    badgeSlot.innerHTML = `<span class="badge badge-high">High Priority</span>`;
  } else if (analysis.priority === 'Medium') {
    badgeSlot.innerHTML = `<span class="badge badge-medium">Medium Priority</span>`;
  } else {
    badgeSlot.innerHTML = `<span class="badge badge-low">Low Priority</span>`;
  }

  if (explEl) explEl.innerText = analysis.explanation;
  if (keyEl) keyEl.innerText = analysis.matchedKeywords.length > 0 ? analysis.matchedKeywords.join(', ') : 'none';
}

function fillProjectorDemo() {
  const title = document.getElementById('form-title');
  const cat = document.getElementById('form-category');
  const loc = document.getElementById('form-location');
  const desc = document.getElementById('form-description');
  const name = document.getElementById('form-student-name');
  const roll = document.getElementById('form-student-roll');

  if (title) title.value = 'Computer lab projector is not working';
  if (cat) cat.value = 'Classrooms & Labs';
  if (loc) loc.value = 'CS Block - Lab 302';
  if (desc) desc.value = 'The ceiling projector powers on but HDMI input signal is disconnected. Display blinks red during lecture, delaying lab sessions.';
  if (name) name.value = 'Aditya Mehra';
  if (roll) roll.value = '23CS1088';

  handleRealtimePriorityPreview();
  showToast('Filled sample scenario: "Computer lab projector is not working"');
}

function resetReportForm() {
  const form = document.getElementById('report-issue-form');
  if (form) form.reset();
  handleRealtimePriorityPreview();
}

function handleIssueSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('form-title')?.value.trim();
  const category = document.getElementById('form-category')?.value;
  const location = document.getElementById('form-location')?.value.trim();
  const description = document.getElementById('form-description')?.value.trim();
  const studentName = document.getElementById('form-student-name')?.value.trim() || 'Anonymous Student';
  const studentRoll = document.getElementById('form-student-roll')?.value.trim() || 'N/A';
  const studentBranch = document.getElementById('form-student-branch')?.value.trim() || 'Computer Science (CSE)';
  const studentYear = document.getElementById('form-student-year')?.value.trim() || '3rd Year';

  if (!title || !category || !location || !description) {
    showToast('Please fill all required fields (*)', 'danger');
    return;
  }

  const analysis = PriorityEngine.analyze(title, description, category);

  const newIssue = CampusStore.addIssue({
    title,
    category,
    location,
    description,
    priority: analysis.priority,
    isSafetyUrgent: analysis.isSafetyUrgent,
    safetyReason: analysis.safetyReason,
    studentName,
    studentRoll,
    studentBranch,
    studentYear,
    reportedVia: 'Web Portal'
  });

  showToast(`Issue ${newIssue.id} submitted with ${newIssue.priority} Priority!`, 'success');

  if (AppState.demoStep === 1) {
    proceedDemoScenario(2, newIssue);
  } else {
    setTimeout(() => {
      switchTab('admin');
      openIssueModal(newIssue.id);
    }, 600);
  }
}

// ==========================================
// 11. ISSUE LIST VIEW
// ==========================================
function renderIssuesView() {
  const container = document.getElementById('view-issues');
  if (!container) return;

  const issues = CampusStore.getIssues();
  let filtered = filterIssuesList(issues);

  container.innerHTML = `
    <div class="section-header">
      <div>
        <h2 class="section-title">📋 Campus Issue Directory & Tracking</h2>
        <p class="section-subtitle">All reported issues saved in browser LocalStorage. Transparent status tracking for students.</p>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn btn-secondary btn-sm" onclick="openQRPosterModal()">
          📷 QR Poster
        </button>
        <button class="btn btn-primary btn-sm" onclick="switchTab('report')">
          + Report New Issue
        </button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="search-input-wrap">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          id="search-issues-input" 
          class="form-input" 
          placeholder="Search by ID, keyword, student, branch..." 
          value="${escapeHtml(AppState.searchQuery)}"
          oninput="handleSearchChange(this.value)"
        />
      </div>

      <div class="filter-group">
        <label style="font-size: 0.82rem; font-weight: 600; color: #475569;">Status:</label>
        <select class="form-select" style="width: auto;" onchange="handleStatusFilterChange(this.value)">
          <option value="all" ${AppState.selectedFilterStatus === 'all' ? 'selected' : ''}>All Statuses</option>
          <option value="Open" ${AppState.selectedFilterStatus === 'Open' ? 'selected' : ''}>Open</option>
          <option value="In Progress" ${AppState.selectedFilterStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Resolved" ${AppState.selectedFilterStatus === 'Resolved' ? 'selected' : ''}>Resolved</option>
        </select>

        <label style="font-size: 0.82rem; font-weight: 600; color: #475569; margin-left: 0.5rem;">Priority:</label>
        <select class="form-select" style="width: auto;" onchange="handlePriorityFilterChange(this.value)">
          <option value="all" ${AppState.selectedFilterPriority === 'all' ? 'selected' : ''}>All Priorities</option>
          <option value="High" ${AppState.selectedFilterPriority === 'High' ? 'selected' : ''}>High</option>
          <option value="Medium" ${AppState.selectedFilterPriority === 'Medium' ? 'selected' : ''}>Medium</option>
          <option value="Low" ${AppState.selectedFilterPriority === 'Low' ? 'selected' : ''}>Low</option>
          <option value="urgent" ${AppState.selectedFilterPriority === 'urgent' ? 'selected' : ''}>⚡ Urgent Safety Only</option>
        </select>
      </div>
    </div>

    <!-- Issues Table -->
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title & Location</th>
            <th>Student Details</th>
            <th>Priority</th>
            <th>Current Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${renderRecentIssuesRows(filtered)}
        </tbody>
      </table>
    </div>
  `;
}

// ==========================================
// 12. ADMIN DASHBOARD VIEW (Steps 5 & 6)
// ==========================================
function renderAdminView() {
  const container = document.getElementById('view-admin');
  if (!container) return;

  const issues = CampusStore.getIssues();
  const total = issues.length;
  const openCount = issues.filter(i => i.status === 'Open').length;
  const progressCount = issues.filter(i => i.status === 'In Progress').length;
  const resolvedCount = issues.filter(i => i.status === 'Resolved').length;
  const urgentCount = issues.filter(i => i.isSafetyUrgent && i.status !== 'Resolved').length;

  let filtered = filterIssuesList(issues);

  container.innerHTML = `
    <!-- Admin Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <h2 class="section-title" style="margin-bottom: 0;">🛡️ Campus Staff & Admin Control Center</h2>
          <span class="badge" style="background: #1e1b4b; color: white;">Staff Portal</span>
        </div>
        <p class="section-subtitle">Real-time ticket queue with full student college identification, AI priority badges, and lifecycle tracking</p>
      </div>

      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button class="btn btn-primary btn-sm" onclick="openQRPosterModal()" style="background: #10b981;">📷 Campus QR Poster</button>
        <button class="btn btn-secondary btn-sm" onclick="exportDataJSON()">📥 Export JSON</button>
        <button class="btn btn-secondary btn-sm" onclick="resetToSampleData()">🔄 Reset Demo Data</button>
      </div>
    </div>

    <!-- Admin Metric Counters -->
    <div class="stats-grid">
      <div class="stat-card" style="border-left: 4px solid var(--primary);">
        <div class="stat-icon blue">📋</div>
        <div class="stat-details">
          <h4>Total Tickets</h4>
          <div class="stat-val">${total}</div>
          <div class="stat-sub">LocalStorage Synced</div>
        </div>
      </div>
      <div class="stat-card" style="border-left: 4px solid var(--warning);">
        <div class="stat-icon amber">⏳</div>
        <div class="stat-details">
          <h4>Open Tickets</h4>
          <div class="stat-val">${openCount}</div>
          <div class="stat-sub">Requires triage</div>
        </div>
      </div>
      <div class="stat-card" style="border-left: 4px solid #3b82f6;">
        <div class="stat-icon blue">🛠️</div>
        <div class="stat-details">
          <h4>In Progress</h4>
          <div class="stat-val">${progressCount}</div>
          <div class="stat-sub">Technicians assigned</div>
        </div>
      </div>
      <div class="stat-card" style="border-left: 4px solid var(--success);">
        <div class="stat-icon emerald">✅</div>
        <div class="stat-details">
          <h4>Resolved</h4>
          <div class="stat-val">${resolvedCount}</div>
          <div class="stat-sub">Fixed & closed</div>
        </div>
      </div>
    </div>

    <!-- Urgent Safety Alert Banner if any -->
    ${urgentCount > 0 ? `
      <div style="background: #fee2e2; border: 1.5px solid #ef4444; border-radius: var(--radius); padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 1.5rem;">⚠️</span>
          <div>
            <strong style="color: #991b1b; font-size: 0.95rem;">Urgent Safety Alert: ${urgentCount} active hazards need immediate staff action!</strong>
            <p style="color: #b91c1c; font-size: 0.8rem; margin-top: 0.15rem;">Priority Engine detected slip, electric, or safety keywords requiring on-site inspection.</p>
          </div>
        </div>
        <button class="btn btn-danger btn-sm" onclick="handlePriorityFilterChange('urgent')">
          Filter Safety Tickets
        </button>
      </div>
    ` : ''}

    <!-- Filter & Search Controls -->
    <div class="filter-bar">
      <div class="search-input-wrap">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          class="form-input" 
          placeholder="Search ticket ID, student roll, branch, lab..." 
          value="${escapeHtml(AppState.searchQuery)}"
          oninput="handleSearchChange(this.value)"
        />
      </div>

      <div class="filter-group">
        <label style="font-size: 0.82rem; font-weight: 600; color: #475569;">Status:</label>
        <select class="form-select" style="width: auto;" onchange="handleStatusFilterChange(this.value)">
          <option value="all" ${AppState.selectedFilterStatus === 'all' ? 'selected' : ''}>All Statuses</option>
          <option value="Open" ${AppState.selectedFilterStatus === 'Open' ? 'selected' : ''}>Open</option>
          <option value="In Progress" ${AppState.selectedFilterStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Resolved" ${AppState.selectedFilterStatus === 'Resolved' ? 'selected' : ''}>Resolved</option>
        </select>

        <label style="font-size: 0.82rem; font-weight: 600; color: #475569; margin-left: 0.5rem;">Priority:</label>
        <select class="form-select" style="width: auto;" onchange="handlePriorityFilterChange(this.value)">
          <option value="all" ${AppState.selectedFilterPriority === 'all' ? 'selected' : ''}>All Priorities</option>
          <option value="High" ${AppState.selectedFilterPriority === 'High' ? 'selected' : ''}>High</option>
          <option value="Medium" ${AppState.selectedFilterPriority === 'Medium' ? 'selected' : ''}>Medium</option>
          <option value="Low" ${AppState.selectedFilterPriority === 'Low' ? 'selected' : ''}>Low</option>
          <option value="urgent" ${AppState.selectedFilterPriority === 'urgent' ? 'selected' : ''}>⚡ Urgent Safety Only</option>
        </select>
      </div>
    </div>

    <!-- Admin Issue Table with Full Student Details & Direct Action Buttons -->
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Issue & Location</th>
            <th>Student College Details</th>
            <th>AI Priority</th>
            <th>Status</th>
            <th>Actions / Lifecycle</th>
          </tr>
        </thead>
        <tbody>
          ${renderAdminRows(filtered)}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminRows(issuesList) {
  if (issuesList.length === 0) {
    return `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">No matching campus issues found in storage.</td></tr>`;
  }

  return issuesList.map(issue => {
    const priorityBadge = issue.isSafetyUrgent 
      ? `<span class="badge badge-urgent">⚡ Urgent Safety</span>`
      : issue.priority === 'High' 
        ? `<span class="badge badge-high">High</span>`
        : issue.priority === 'Medium'
          ? `<span class="badge badge-medium">Medium</span>`
          : `<span class="badge badge-low">Low</span>`;

    const statusBadge = issue.status === 'Resolved'
      ? `<span class="badge badge-status-resolved">✓ Resolved</span>`
      : issue.status === 'In Progress'
        ? `<span class="badge badge-status-progress">⚙️ In Progress</span>`
        : `<span class="badge badge-status-open">⏳ Open</span>`;

    const sourceTag = issue.reportedVia === 'QR Code Scan'
      ? `<span class="student-tag" style="background: #dcfce7; color: #15803d; font-size: 0.68rem;">📱 QR Scan</span>`
      : `<span class="student-tag" style="background: #eff6ff; color: #1e40af; font-size: 0.68rem;">💻 Web</span>`;

    return `
      <tr id="admin-row-${issue.id}">
        <td style="font-family: monospace; font-weight: 700; color: var(--primary);">
          ${issue.id}
          <div style="margin-top: 0.2rem;">${sourceTag}</div>
          <div style="font-size: 0.7rem; color: #94a3b8; font-weight: normal; margin-top: 2px;">${issue.reportedAt}</div>
        </td>
        <td style="max-width: 250px;">
          <div class="issue-title-cell">${escapeHtml(issue.title)}</div>
          <div class="issue-loc-cell">📍 ${escapeHtml(issue.location)}</div>
          <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.2rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escapeHtml(issue.description)}
          </div>
        </td>
        <td style="min-width: 210px;">
          <div style="font-weight: 800; font-size: 0.85rem; color: #0f172a;">
            👤 ${escapeHtml(issue.studentName || 'Student')}
          </div>
          <div class="student-info-badge">
            <div><strong>Roll:</strong> ${escapeHtml(issue.studentRoll || 'N/A')}</div>
            <div><strong>Branch:</strong> ${escapeHtml(issue.studentBranch || 'General')}</div>
            ${issue.studentYear ? `<div><strong>Year:</strong> ${escapeHtml(issue.studentYear)} ${issue.studentSec ? '(Sec ' + escapeHtml(issue.studentSec) + ')' : ''}</div>` : ''}
            ${issue.studentPhone ? `<div><strong>Phone:</strong> ${escapeHtml(issue.studentPhone)}</div>` : ''}
          </div>
        </td>
        <td>
          ${priorityBadge}
          ${issue.safetyReason ? `<div style="font-size: 0.7rem; color: #dc2626; margin-top: 0.2rem;">${escapeHtml(issue.safetyReason)}</div>` : ''}
        </td>
        <td>${statusBadge}</td>
        <td>
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            ${issue.status !== 'In Progress' && issue.status !== 'Resolved' ? `
              <button 
                id="btn-inprogress-${issue.id}"
                class="btn btn-warning btn-sm" 
                onclick="adminChangeStatus('${issue.id}', 'In Progress')"
                title="Mark this issue as currently under maintenance"
              >
                ⚙️ In Progress
              </button>
            ` : ''}
            
            ${issue.status !== 'Resolved' ? `
              <button 
                id="btn-resolved-${issue.id}"
                class="btn btn-success btn-sm" 
                onclick="adminChangeStatus('${issue.id}', 'Resolved')"
                title="Mark this issue as fixed and resolved"
              >
                ✓ Resolve
              </button>
            ` : `
              <button 
                class="btn btn-secondary btn-sm" 
                onclick="adminChangeStatus('${issue.id}', 'Open', 'Issue reopened by staff')"
                title="Reopen ticket"
              >
                ↩ Reopen
              </button>
            `}

            <button class="btn btn-secondary btn-sm" onclick="openIssueModal('${issue.id}')">
              ℹ Details
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function adminChangeStatus(id, newStatus, note = '') {
  let adminNote = note;
  if (!adminNote) {
    if (newStatus === 'In Progress') {
      adminNote = prompt('Enter staff assignment note (or click OK for default):', 'Maintenance technician assigned to inspect problem');
      if (adminNote === null) return;
    } else if (newStatus === 'Resolved') {
      adminNote = prompt('Enter resolution remarks (or click OK for default):', 'Issue inspected, repaired and verified working');
      if (adminNote === null) return;
    }
  }

  const updated = CampusStore.updateStatus(id, newStatus, adminNote);
  if (updated) {
    showToast(`Issue ${id} marked as "${newStatus}"!`, 'success');
    renderActiveView();

    if (AppState.demoStep === 3 && newStatus === 'In Progress') {
      proceedDemoScenario(4, updated);
    } else if (AppState.demoStep === 4 && newStatus === 'Resolved') {
      proceedDemoScenario(5, updated);
    }
  }
}

// ==========================================
// 13. CAMPUS SAATHI AI ASSISTANT VIEW
// ==========================================
let chatHistory = [
  { sender: 'bot', text: 'Namaste! I am your Campus Saathi AI assistant 🎓. Ask me anything about campus facilities, projector & lab problems, Wi-Fi credentials, library timings, or QR Code stickers!' }
];

function renderAssistantView() {
  const container = document.getElementById('view-assistant');
  if (!container) return;

  container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto;">
      <div class="chat-container">
        <!-- Chat Header -->
        <div class="chat-header">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 2.75rem; height: 2.75rem; border-radius: 50%; background: #ffffff; color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
              🤖
            </div>
            <div>
              <div style="font-weight: 800; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                Campus Saathi AI Assistant
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
              </div>
              <div style="font-size: 0.75rem; color: #c7d2fe;">Rule-Based Smart Campus Intelligence Engine</div>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="clearChatHistory()" style="background: rgba(255,255,255,0.15); color: white; border-color: rgba(255,255,255,0.25);">
            Clear Chat
          </button>
        </div>

        <!-- Chat Message Area -->
        <div class="chat-messages" id="chat-messages-box">
          ${renderChatMessagesHTML()}
        </div>

        <!-- Quick Prompt Chips -->
        <div class="chat-suggestions">
          <span style="font-size: 0.75rem; font-weight: 700; color: #64748b; margin-right: 0.25rem; align-self: center;">Popular Questions:</span>
          <button class="chat-chip" onclick="handlePromptChipClick('Computer lab projector is not working')">
            📽️ Computer lab projector not working?
          </button>
          <button class="chat-chip" onclick="handlePromptChipClick('Where can I scan the campus QR code?')">
            📱 Where is the Campus QR code?
          </button>
          <button class="chat-chip" onclick="handlePromptChipClick('What are the central library timings?')">
            📚 Library timings?
          </button>
          <button class="chat-chip" onclick="handlePromptChipClick('How do I connect to campus student Wi-Fi?')">
            📶 Campus Wi-Fi password?
          </button>
          <button class="chat-chip" onclick="handlePromptChipClick('Hostel mess timings and rules')">
            🍽️ Hostel mess timings?
          </button>
        </div>

        <!-- Chat Input Bar -->
        <form class="chat-input-bar" onsubmit="handleChatSubmit(event)">
          <input 
            type="text" 
            id="chat-user-input" 
            class="form-input" 
            placeholder="Ask Campus Saathi anything (e.g. 'Projector problem in lab', 'Wi-Fi login', 'Hostel food')..." 
            autocomplete="off"
            style="border-radius: var(--radius-full); padding-left: 1.25rem;"
          />
          <button type="submit" class="btn btn-primary" style="border-radius: var(--radius-full); padding: 0.65rem 1.4rem;">
            Send ➤
          </button>
        </form>
      </div>
    </div>
  `;

  scrollChatToBottom();
}

function renderChatMessagesHTML() {
  return chatHistory.map(msg => {
    const isUser = msg.sender === 'user';
    return `
      <div class="chat-bubble-wrap ${isUser ? 'user' : ''}">
        <div class="chat-avatar ${isUser ? 'user' : 'bot'}">
          ${isUser ? '👤' : '🤖'}
        </div>
        <div class="chat-bubble ${isUser ? 'user' : 'bot'}">
          ${escapeHtml(msg.text).replace(/\n/g, '<br/>')}
        </div>
      </div>
    `;
  }).join('');
}

function scrollChatToBottom() {
  setTimeout(() => {
    const box = document.getElementById('chat-messages-box');
    if (box) box.scrollTop = box.scrollHeight;
  }, 50);
}

function handleChatSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('chat-user-input');
  if (!input) return;
  const userText = input.value.trim();
  if (!userText) return;

  chatHistory.push({ sender: 'user', text: userText });
  input.value = '';
  renderAssistantView();

  setTimeout(() => {
    const botReply = SaathiAI.query(userText);
    chatHistory.push({ sender: 'bot', text: botReply });
    renderAssistantView();
  }, 250);
}

function handlePromptChipClick(text) {
  const input = document.getElementById('chat-user-input');
  if (input) input.value = text;
  handleChatSubmit(new Event('submit'));
}

function clearChatHistory() {
  chatHistory = [
    { sender: 'bot', text: 'Namaste! Chat cleared. How may I assist you with campus facilities today?' }
  ];
  renderAssistantView();
}

// ==========================================
// 14. DEMO SCENARIO RUNNER
// ==========================================
let currentDemoIssue = null;

function startDemoScenario() {
  AppState.demoStep = 1;
  renderDemoModal();
}

function renderDemoModal() {
  let modal = document.getElementById('demo-scenario-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'demo-scenario-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  let stepTitle = '';
  let stepBody = '';
  let actionBtn = '';

  if (AppState.demoStep === 1) {
    stepTitle = 'Step 1: Student Reports Problem';
    stepBody = `
      <p style="font-size: 0.9rem; color: #334155; margin-bottom: 1rem;">
        According to the project requirement, we will simulate the exact demo scenario:
        <br/><strong style="color: var(--primary); font-size: 1rem;">"Computer lab projector is not working"</strong>
      </p>
      <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius); padding: 1rem; font-size: 0.85rem;">
        <div><strong>Student:</strong> Aditya Mehra (Roll: 23CS1088, CSE 3rd Year)</div>
        <div><strong>Title:</strong> Computer lab projector is not working</div>
        <div><strong>Category:</strong> Classrooms & Labs</div>
        <div><strong>Location:</strong> CS Block - Lab 302</div>
        <div><strong>Description:</strong> Projector powers on but HDMI input signal is disconnected. Display blinks red during lecture.</div>
      </div>
    `;
    actionBtn = `
      <button class="btn btn-primary" onclick="executeDemoStep1()">
        1-Click Auto-Fill & Submit Form &rarr;
      </button>
    `;
  } else if (AppState.demoStep === 2) {
    const analysis = PriorityEngine.analyze(currentDemoIssue.title, currentDemoIssue.description, currentDemoIssue.category);
    stepTitle = 'Step 2: Priority Engine Assigned Priority';
    stepBody = `
      <p style="font-size: 0.9rem; color: #334155; margin-bottom: 1rem;">
        The rule-based Priority Engine reviewed the keywords and category:
      </p>
      <div style="background: #fff1f2; border: 1.5px solid #fca5a5; border-radius: var(--radius); padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <strong style="color: #991b1b; font-size: 1rem;">Detected Priority: High</strong>
          <span class="badge badge-high">High Priority</span>
        </div>
        <p style="font-size: 0.85rem; color: #7f1d1d;">${analysis.explanation}</p>
        <div style="font-size: 0.78rem; color: #64748b; margin-top: 0.5rem;">
          Saved to browser LocalStorage under ID: <strong style="color: var(--primary);">${currentDemoIssue?.id}</strong>
        </div>
      </div>
    `;
    actionBtn = `
      <button class="btn btn-primary" onclick="executeDemoStep2()">
        Open Admin Dashboard &rarr;
      </button>
    `;
  } else if (AppState.demoStep === 3) {
    stepTitle = 'Step 3: Admin Updates Status to "In Progress"';
    stepBody = `
      <p style="font-size: 0.9rem; color: #334155; margin-bottom: 1rem;">
        The campus administrator sees ticket <strong>${currentDemoIssue?.id}</strong> with full student details.
        Click below to dispatch the technician and mark the ticket <strong>In Progress</strong>.
      </p>
    `;
    actionBtn = `
      <button class="btn btn-warning" onclick="executeDemoStep3()">
        ⚙️ Change Status to "In Progress"
      </button>
    `;
  } else if (AppState.demoStep === 4) {
    stepTitle = 'Step 4: Admin Marks Ticket "Resolved"';
    stepBody = `
      <p style="font-size: 0.9rem; color: #334155; margin-bottom: 1rem;">
        The technician replaced the faulty HDMI connector in CS Lab 302.
        Now click below to mark the ticket as <strong>Resolved</strong>.
      </p>
    `;
    actionBtn = `
      <button class="btn btn-success" onclick="executeDemoStep4()">
        ✓ Mark Ticket "Resolved"
      </button>
    `;
  } else if (AppState.demoStep === 5) {
    stepTitle = '🎉 Demo Scenario Completed Successfully!';
    stepBody = `
      <div style="text-align: center; padding: 1rem 0;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎯</div>
        <h3 style="font-size: 1.25rem; font-weight: 800; color: #065f46;">Full End-to-End Cycle Verified!</h3>
        <p style="font-size: 0.88rem; color: #334155; max-width: 480px; margin: 0.5rem auto;">
          Reported "Computer lab projector is not working" &rarr; Priority Engine classified High &rarr; Persisted to LocalStorage with Student Details &rarr; Admin moved to "In Progress" &rarr; Marked "Resolved".
        </p>
      </div>
    `;
    actionBtn = `
      <button class="btn btn-primary" onclick="closeDemoModal()">
        Finish & Explore App
      </button>
    `;
  }

  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <span style="font-size: 0.72rem; font-weight: 700; color: var(--primary); text-transform: uppercase;">
            Live Demo Walkthrough • Step ${AppState.demoStep} of 5
          </span>
          <div class="modal-title">${stepTitle}</div>
        </div>
        <button class="modal-close" onclick="closeDemoModal()">&times;</button>
      </div>
      <div class="modal-body">
        ${stepBody}
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" onclick="closeDemoModal()">Cancel</button>
        ${actionBtn}
      </div>
    </div>
  `;
}

function closeDemoModal() {
  const modal = document.getElementById('demo-scenario-modal');
  if (modal) modal.remove();
  AppState.demoStep = 0;
}

function proceedDemoScenario(nextStep, issueObj = null) {
  if (issueObj) currentDemoIssue = issueObj;
  AppState.demoStep = nextStep;
  renderDemoModal();
}

function executeDemoStep1() {
  switchTab('report');
  fillProjectorDemo();
  setTimeout(() => {
    const newIssue = CampusStore.addIssue({
      title: 'Computer lab projector is not working',
      category: 'Classrooms & Labs',
      location: 'CS Block - Lab 302',
      description: 'The ceiling projector powers on but HDMI input signal is disconnected. Display blinks red during lecture, delaying lab sessions.',
      priority: 'High',
      isSafetyUrgent: false,
      safetyReason: '',
      studentName: 'Aditya Mehra',
      studentRoll: '23CS1088',
      studentBranch: 'Computer Science & Engineering (CSE)',
      studentYear: '3rd Year (Sec A)',
      reportedVia: 'Web Portal'
    });
    showToast(`Submitted: ${newIssue.id}`, 'success');
    proceedDemoScenario(2, newIssue);
  }, 400);
}

function executeDemoStep2() {
  switchTab('admin');
  proceedDemoScenario(3, currentDemoIssue);
}

function executeDemoStep3() {
  if (!currentDemoIssue) return;
  const updated = CampusStore.updateStatus(currentDemoIssue.id, 'In Progress', 'IT Media technician assigned to replace HDMI adapter in Lab 302');
  renderActiveView();
  proceedDemoScenario(4, updated);
}

function executeDemoStep4() {
  if (!currentDemoIssue) return;
  const updated = CampusStore.updateStatus(currentDemoIssue.id, 'Resolved', 'Replaced faulty high-speed HDMI cable and tested projection with professor laptop');
  renderActiveView();
  proceedDemoScenario(5, updated);
}

// ==========================================
// 15. ISSUE DETAILS MODAL
// ==========================================
function openIssueModal(id) {
  const issues = CampusStore.getIssues();
  const issue = issues.find(i => i.id === id);
  if (!issue) return;

  AppState.activeModalIssue = issue;

  let modal = document.getElementById('issue-details-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'issue-details-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const priorityBadge = issue.isSafetyUrgent 
    ? `<span class="badge badge-urgent">⚡ Urgent Safety Flag</span>`
    : issue.priority === 'High' 
      ? `<span class="badge badge-high">High Priority</span>`
      : issue.priority === 'Medium'
        ? `<span class="badge badge-medium">Medium</span>`
        : `<span class="badge badge-low">Low</span>`;

  const statusBadge = issue.status === 'Resolved'
    ? `<span class="badge badge-status-resolved">✓ Resolved</span>`
    : issue.status === 'In Progress'
      ? `<span class="badge badge-status-progress">⚙️ In Progress</span>`
      : `<span class="badge badge-status-open">⏳ Open</span>`;

  const timelineHtml = (issue.timeline || []).map((tl, index) => `
    <div style="display: flex; gap: 1rem; position: relative; padding-bottom: 1.25rem;">
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="width: 1.5rem; height: 1.5rem; border-radius: 50%; background: ${tl.status === 'Resolved' ? '#10b981' : tl.status === 'In Progress' ? '#f59e0b' : '#3b82f6'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700;">
          ${index + 1}
        </div>
        ${index < issue.timeline.length - 1 ? `<div style="width: 2px; flex: 1; background: #e2e8f0; margin-top: 4px;"></div>` : ''}
      </div>
      <div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <strong style="font-size: 0.85rem; color: #0f172a;">${tl.status}</strong>
          <span style="font-size: 0.72rem; color: #94a3b8;">${tl.timestamp}</span>
        </div>
        <p style="font-size: 0.82rem; color: #475569; margin-top: 0.2rem;">${escapeHtml(tl.note)}</p>
      </div>
    </div>
  `).join('');

  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-family: monospace; font-size: 0.95rem; font-weight: 800; color: var(--primary);">${issue.id}</span>
            ${priorityBadge}
            ${statusBadge}
          </div>
          <div class="modal-title" style="margin-top: 0.35rem;">${escapeHtml(issue.title)}</div>
        </div>
        <button class="modal-close" onclick="closeIssueModal()">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Student Details Card -->
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: var(--radius); padding: 1rem; margin-bottom: 1.25rem;">
          <div style="font-weight: 800; font-size: 0.85rem; color: #1e3a8a; margin-bottom: 0.5rem; display: flex; justify-content: space-between;">
            <span>🎓 Student College Profile</span>
            <span style="font-size: 0.75rem; background: #dbeafe; padding: 0.15rem 0.5rem; border-radius: 4px;">
              ${issue.reportedVia || 'Web Portal'}
            </span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.82rem; color: #1e293b;">
            <div><strong>Student Name:</strong> ${escapeHtml(issue.studentName || 'Student')}</div>
            <div><strong>Roll Number:</strong> ${escapeHtml(issue.studentRoll || 'N/A')}</div>
            <div><strong>Branch:</strong> ${escapeHtml(issue.studentBranch || 'General')}</div>
            <div><strong>Year / Sec:</strong> ${escapeHtml(issue.studentYear || 'N/A')} ${issue.studentSec ? '(Sec ' + escapeHtml(issue.studentSec) + ')' : ''}</div>
            ${issue.studentEmail ? `<div><strong>Email:</strong> ${escapeHtml(issue.studentEmail)}</div>` : ''}
            ${issue.studentPhone ? `<div><strong>Phone:</strong> ${escapeHtml(issue.studentPhone)}</div>` : ''}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; background: #f8fafc; padding: 1rem; border-radius: var(--radius); margin-bottom: 1.25rem; font-size: 0.85rem;">
          <div><strong style="color: #64748b;">Category:</strong> <div>${issue.category}</div></div>
          <div><strong style="color: #64748b;">Location:</strong> <div>📍 ${escapeHtml(issue.location)}</div></div>
          <div><strong style="color: #64748b;">Reported Time:</strong> <div>${issue.reportedAt}</div></div>
          <div><strong style="color: #64748b;">Last Updated:</strong> <div>${issue.updatedAt || issue.reportedAt}</div></div>
        </div>

        <div style="margin-bottom: 1.25rem;">
          <strong style="font-size: 0.85rem; color: #334155;">Issue Description:</strong>
          <p style="font-size: 0.88rem; color: #1e293b; background: white; border: 1px solid var(--border); padding: 0.85rem; border-radius: var(--radius-sm); margin-top: 0.35rem; line-height: 1.5;">
            ${escapeHtml(issue.description)}
          </p>
        </div>

        ${issue.safetyReason ? `
          <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 0.75rem 1rem; border-radius: var(--radius-sm); margin-bottom: 1.25rem; font-size: 0.82rem; color: #991b1b;">
            <strong>Urgent Safety Flag:</strong> ${escapeHtml(issue.safetyReason)}
          </div>
        ` : ''}

        <div>
          <strong style="font-size: 0.85rem; color: #334155; margin-bottom: 0.75rem; display: block;">Activity & Resolution Timeline:</strong>
          <div style="margin-top: 0.5rem;">
            ${timelineHtml}
          </div>
        </div>
      </div>

      <div class="modal-footer">
        ${issue.status !== 'In Progress' && issue.status !== 'Resolved' ? `
          <button class="btn btn-warning btn-sm" onclick="adminChangeStatus('${issue.id}', 'In Progress'); closeIssueModal();">
            Mark In Progress
          </button>
        ` : ''}
        ${issue.status !== 'Resolved' ? `
          <button class="btn btn-success btn-sm" onclick="adminChangeStatus('${issue.id}', 'Resolved'); closeIssueModal();">
            Mark Resolved
          </button>
        ` : ''}
        <button class="btn btn-secondary btn-sm" onclick="closeIssueModal()">Close</button>
      </div>
    </div>
  `;
}

function closeIssueModal() {
  const modal = document.getElementById('issue-details-modal');
  if (modal) modal.remove();
  AppState.activeModalIssue = null;
}

// ==========================================
// 16. FILTERS & SEARCH
// ==========================================
function handleSearchChange(q) {
  AppState.searchQuery = q;
  renderActiveView();
}

function handleStatusFilterChange(val) {
  AppState.selectedFilterStatus = val;
  renderActiveView();
}

function handlePriorityFilterChange(val) {
  AppState.selectedFilterPriority = val;
  renderActiveView();
}

function filterIssuesList(issues) {
  return issues.filter(issue => {
    if (AppState.searchQuery) {
      const q = AppState.searchQuery.toLowerCase();
      const match = issue.id.toLowerCase().includes(q) ||
                    issue.title.toLowerCase().includes(q) ||
                    issue.location.toLowerCase().includes(q) ||
                    issue.category.toLowerCase().includes(q) ||
                    issue.description.toLowerCase().includes(q) ||
                    (issue.studentName && issue.studentName.toLowerCase().includes(q)) ||
                    (issue.studentRoll && issue.studentRoll.toLowerCase().includes(q)) ||
                    (issue.studentBranch && issue.studentBranch.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (AppState.selectedFilterStatus !== 'all' && issue.status !== AppState.selectedFilterStatus) {
      return false;
    }

    if (AppState.selectedFilterPriority === 'urgent') {
      if (!issue.isSafetyUrgent) return false;
    } else if (AppState.selectedFilterPriority !== 'all' && issue.priority !== AppState.selectedFilterPriority) {
      return false;
    }

    return true;
  });
}

function exportDataJSON() {
  const issues = CampusStore.getIssues();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(issues, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `campus_saathi_issues_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Issues data exported as JSON!', 'success');
}

function resetToSampleData() {
  if (confirm('Reset LocalStorage to original sample issues?')) {
    CampusStore.resetToDefault();
    showToast('Reset to default sample data', 'warning');
    renderActiveView();
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Hash routing & Init
function checkHashRoute() {
  const hash = window.location.hash;
  if (hash === '#qr-report') {
    switchTab('qr-report');
  } else if (hash === '#admin') {
    switchTab('admin');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('campus-issues-updated', () => updateHeaderCounters());
  window.addEventListener('campus-auth-changed', () => updateAuthUI());
  window.addEventListener('hashchange', checkHashRoute);

  checkHashRoute();
  if (AppState.currentTab === 'home') {
    switchTab('home');
  }
});
