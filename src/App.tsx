import React, { useState, useEffect } from 'react';
import { Sidebar, TabType } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { CasesView } from './components/CasesView';
import { CaseWorkspaceView } from './components/CaseWorkspaceView';
import { ClientsView } from './components/ClientsView';
import { DocumentsView } from './components/DocumentsView';
import { TasksView } from './components/TasksView';
import { StaffView } from './components/StaffView';
import { SettingsView } from './components/SettingsView';
import { MyWorkspaceView } from './components/MyWorkspaceView';
import { AdminPortalView } from './components/AdminPortalView';

import { UploadDocumentModal } from './components/Modals/UploadDocumentModal';
import { CreateCaseModal } from './components/Modals/CreateCaseModal';
import { EditCaseModal } from './components/Modals/EditCaseModal';
import { CreateClientModal } from './components/Modals/CreateClientModal';
import { DocumentPreviewModal } from './components/Modals/DocumentPreviewModal';
import { UserProfileModal } from './components/Modals/UserProfileModal';
import { ClientPortalModal } from './components/Modals/ClientPortalModal';
import { MobileBottomNav } from './components/MobileBottomNav';

import {
  INITIAL_CASES,
  INITIAL_CLIENTS,
  INITIAL_DOCUMENTS,
  INITIAL_TASKS,
  INITIAL_TIMELINES,
  INITIAL_NOTES,
  INITIAL_STAFF,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_AUDIT_LOGS,
} from './mockData';
import {
  LegalCase,
  Client,
  DocumentItem,
  TaskItem,
  CaseTimeline,
  InternalNote,
  StaffMember,
  SystemSettings,
  AuditLogItem,
} from './types';
import {
  auth,
  onAuthStateChanged,
  signOutFirebase,
  seedInitialDataIfEmpty,
  subscribeCollection,
  saveDocumentToFirestore,
  deleteDocumentFromFirestore,
} from './firebase';

export default function App() {
  // Authentication state (default true for instant preview, can log out to see Login screen)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('bigboss_auth') !== 'false';
  });

  // Navigation state
  const [activeTab, setActiveTab] = useState<TabType>('my-workspace');
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);

  // Data states with localStorage persistence
  const [cases, setCases] = useState<LegalCase[]>(() => {
    const saved = localStorage.getItem('bigboss_cases');
    return saved ? JSON.parse(saved) : INITIAL_CASES;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('bigboss_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('bigboss_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('bigboss_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [timelines, setTimelines] = useState<CaseTimeline[]>(() => {
    const saved = localStorage.getItem('bigboss_timelines');
    return saved ? JSON.parse(saved) : INITIAL_TIMELINES;
  });

  const [notes, setNotes] = useState<InternalNote[]>(() => {
    const saved = localStorage.getItem('bigboss_notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('bigboss_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [currentUser, setCurrentUser] = useState<StaffMember>(() => {
    const savedUserId = localStorage.getItem('bigboss_current_user_id');
    const initialList = staff || INITIAL_STAFF;
    return initialList.find((s) => s.id === savedUserId) || initialList[0];
  });

  // Track original Admin when previewing staff view so Admin can return at any time
  const [adminOriginalUser, setAdminOriginalUser] = useState<StaffMember | null>(() => {
    const saved = localStorage.getItem('bigboss_admin_origin');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Mode: 'operations_app' (Ứng dụng tác nghiệp chung) vs 'admin_portal' (Trang Quản trị Admin riêng biệt)
  const [appMode, setAppMode] = useState<'operations_app' | 'admin_portal'>(() => {
    const saved = localStorage.getItem('bigboss_app_mode');
    return saved === 'admin_portal' ? 'admin_portal' : 'operations_app';
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('bigboss_settings');
    return saved ? JSON.parse(saved) : INITIAL_SYSTEM_SETTINGS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem('bigboss_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Seed Firestore if empty and connect real-time subscriptions
  useEffect(() => {
    seedInitialDataIfEmpty();

    // Listen to Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        const userEmail = user.email.trim().toLowerCase();
        const currentStaffList = staff.length > 0 ? staff : INITIAL_STAFF;
        const matched = currentStaffList.find(
          (s) =>
            s.email?.trim().toLowerCase() === userEmail ||
            (s.googleEmail && s.googleEmail?.trim().toLowerCase() === userEmail)
        );
        if (matched && matched.status !== 'suspended') {
          setIsAuthenticated(true);
          localStorage.setItem('bigboss_auth', 'true');
          setCurrentUser(matched);
        } else {
          signOutFirebase().catch(() => {});
          setIsAuthenticated(false);
          localStorage.setItem('bigboss_auth', 'false');
        }
      }
    });

    // Subscriptions to Firestore collections
    const unsubCases = subscribeCollection<LegalCase>('cases', (data) => {
      if (data && data.length > 0) setCases(data);
    });

    const unsubClients = subscribeCollection<Client>('clients', (data) => {
      if (data && data.length > 0) setClients(data);
    });

    const unsubDocs = subscribeCollection<DocumentItem>('documents', (data) => {
      if (data && data.length > 0) setDocuments(data);
    });

    const unsubTasks = subscribeCollection<TaskItem>('tasks', (data) => {
      if (data && data.length > 0) setTasks(data);
    });

    const unsubTimelines = subscribeCollection<CaseTimeline>('timelines', (data) => {
      if (data && data.length > 0) setTimelines(data);
    });

    const unsubNotes = subscribeCollection<InternalNote>('notes', (data) => {
      if (data && data.length > 0) setNotes(data);
    });

    const unsubStaff = subscribeCollection<StaffMember>('staff', (data) => {
      if (data && data.length > 0) {
        setStaff(data);
        const currentId = currentUser.id;
        const found = data.find((s) => s.id === currentId);
        if (found) setCurrentUser(found);
      }
    });

    const unsubLogs = subscribeCollection<AuditLogItem>('auditLogs', (data) => {
      if (data && data.length > 0) {
        setAuditLogs(data.sort((a, b) => b.id.localeCompare(a.id)));
      }
    });

    const unsubSettings = subscribeCollection<SystemSettings>('settings', (data) => {
      if (data && data.length > 0) setSystemSettings(data[0]);
    });

    return () => {
      unsubscribeAuth();
      unsubCases();
      unsubClients();
      unsubDocs();
      unsubTasks();
      unsubTimelines();
      unsubNotes();
      unsubStaff();
      unsubLogs();
      unsubSettings();
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('bigboss_settings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  useEffect(() => {
    localStorage.setItem('bigboss_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('bigboss_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('bigboss_current_user_id', currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('bigboss_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('bigboss_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('bigboss_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('bigboss_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('bigboss_timelines', JSON.stringify(timelines));
  }, [timelines]);

  useEffect(() => {
    localStorage.setItem('bigboss_notes', JSON.stringify(notes));
  }, [notes]);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadCaseId, setUploadCaseId] = useState<string | undefined>(undefined);
  const [uploadClientId, setUploadClientId] = useState<string | undefined>(undefined);

  const [isCreateCaseModalOpen, setIsCreateCaseModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<LegalCase | null>(null);
  const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isClientPortalOpen, setIsClientPortalOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<DocumentItem | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Audit log helper
  const addAuditLog = (
    action: AuditLogItem['action'],
    details: string,
    target?: string
  ) => {
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp:
        new Date().toLocaleDateString('vi-VN') +
        ' ' +
        new Date().toLocaleTimeString('vi-VN').slice(0, 5),
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      details,
      target,
      ipAddress: '14.161.22.88',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    saveDocumentToFirestore('auditLogs', newLog.id, newLog).catch(console.error);
  };

  // Handlers
  const handleLogin = (userEmail?: string) => {
    setIsAuthenticated(true);
    localStorage.setItem('bigboss_auth', 'true');
    if (userEmail) {
      const emailLower = userEmail.trim().toLowerCase();
      const currentList = staff.length > 0 ? staff : INITIAL_STAFF;
      const matched = currentList.find(
        (s) =>
          s.email.toLowerCase() === emailLower ||
          (s.googleEmail && s.googleEmail.toLowerCase() === emailLower)
      );
      if (matched) {
        setCurrentUser(matched);
        if (matched.roleId === 'admin') {
          setAppMode('admin_portal');
          localStorage.setItem('bigboss_app_mode', 'admin_portal');
        } else {
          setAppMode('operations_app');
          localStorage.setItem('bigboss_app_mode', 'operations_app');
        }
      }
    }
    addAuditLog('LOGIN', 'Đăng nhập vào hệ thống thành công');
  };

  const handleLogout = async () => {
    await signOutFirebase();
    setIsAuthenticated(false);
    setAdminOriginalUser(null);
    localStorage.removeItem('bigboss_admin_origin');
    localStorage.setItem('bigboss_auth', 'false');
  };

  const handleOpenUpload = (caseId?: string, clientId?: string) => {
    setUploadCaseId(caseId);
    setUploadClientId(clientId);
    setIsUploadModalOpen(true);
  };

  const handleUploadDocument = (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev]);
    saveDocumentToFirestore('documents', newDoc.id, newDoc).catch(console.error);
    addAuditLog(
      'UPLOAD_DOC',
      `Tải lên tài liệu [${newDoc.name}] thuộc danh mục [${newDoc.category}]`,
      newDoc.caseTitle || newDoc.clientName
    );
  };

  const handleDeleteDocument = (docId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa tài liệu này khỏi hệ thống?')) {
      const doc = documents.find((d) => d.id === docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      deleteDocumentFromFirestore('documents', docId).catch(console.error);
      addAuditLog(
        'DELETE_DOC',
        `Xóa tài liệu [${doc?.name || docId}] khỏi kho lưu trữ`,
        doc?.caseTitle
      );
    }
  };

  const handleCreateCase = (newCase: LegalCase) => {
    setCases((prev) => [newCase, ...prev]);
    saveDocumentToFirestore('cases', newCase.id, newCase).catch(console.error);
    // update client's cases count
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === newCase.clientId) {
          const updated = { ...c, casesCount: (c.casesCount || 0) + 1 };
          saveDocumentToFirestore('clients', updated.id, updated).catch(console.error);
          return updated;
        }
        return c;
      })
    );
    // select the newly created case
    setSelectedCase(newCase);
    addAuditLog(
      'CREATE_CASE',
      `Khởi tạo hồ sơ vụ việc mới [${newCase.id}] - ${newCase.title}`,
      newCase.clientName
    );
  };

  const handleDeleteCase = (caseId: string) => {
    if (currentUser.roleId !== 'admin' && currentUser.roleId !== 'partner_lawyer') {
      alert('Chỉ Luật sư Điều hành (Admin) hoặc Luật sư thành viên mới có quyền xóa hồ sơ vụ việc!');
      return;
    }
    if (window.confirm('Bạn có chắc muốn xóa hồ sơ vụ việc này khỏi hệ thống?')) {
      const cItem = cases.find((c) => c.id === caseId);
      setCases((prev) => prev.filter((c) => c.id !== caseId));
      if (selectedCase?.id === caseId) {
        setSelectedCase(null);
      }
      deleteDocumentFromFirestore('cases', caseId).catch(console.error);
      addAuditLog(
        'DELETE_DOC',
        `Xóa hồ sơ vụ việc [${caseId}] - ${cItem?.title || ''}`,
        cItem?.clientName
      );
    }
  };

  const handleUpdateCase = (updatedCase: LegalCase) => {
    setCases((prev) => prev.map((c) => (c.id === updatedCase.id ? updatedCase : c)));
    if (selectedCase?.id === updatedCase.id) {
      setSelectedCase(updatedCase);
    }
    saveDocumentToFirestore('cases', updatedCase.id, updatedCase).catch(console.error);
    addAuditLog(
      'CREATE_CASE',
      `Cập nhật thông tin hồ sơ vụ việc [${updatedCase.id}] - ${updatedCase.title}`,
      updatedCase.clientName
    );
  };

  const handleCreateClient = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
    saveDocumentToFirestore('clients', newClient.id, newClient).catch(console.error);
    addAuditLog(
      'UPDATE_SETTINGS',
      `Tiếp nhận thân chủ mới: ${newClient.name} (${newClient.phone})`,
      newClient.name
    );
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients((prev) => prev.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
    saveDocumentToFirestore('clients', updatedClient.id, updatedClient).catch(console.error);
    addAuditLog(
      'UPDATE_SETTINGS',
      `Cập nhật thông tin thân chủ: ${updatedClient.name} (${updatedClient.phone})`,
      updatedClient.name
    );
  };

  const handleDeleteClient = (clientId: string) => {
    if (currentUser.roleId !== 'admin') {
      alert('Chỉ Luật sư Điều hành (Admin) mới có thẩm quyền xóa khách hàng khỏi hệ thống!');
      return;
    }
    const client = clients.find((c) => c.id === clientId);
    const relatedCases = cases.filter((c) => c.clientId === clientId);
    if (relatedCases.length > 0) {
      if (
        !window.confirm(
          `Khách hàng [${client?.name || clientId}] đang có ${relatedCases.length} hồ sơ vụ việc trong hệ thống. Bạn có chắc chắn muốn xóa không?`
        )
      ) {
        return;
      }
    } else {
      if (!window.confirm(`Bạn có chắc muốn xóa khách hàng [${client?.name || clientId}] khỏi hệ thống?`)) {
        return;
      }
    }
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    deleteDocumentFromFirestore('clients', clientId).catch(console.error);
    addAuditLog('UPDATE_SETTINGS', `Xóa khách hàng [${client?.name || clientId}]`, client?.name);
  };

  const handleAddTask = (newTaskData: Omit<TaskItem, 'id'>) => {
    const newTask: TaskItem = {
      ...newTaskData,
      id: `task-${Date.now().toString().slice(-5)}`,
    };
    setTasks((prev) => [newTask, ...prev]);
    saveDocumentToFirestore('tasks', newTask.id, newTask).catch(console.error);
  };

  const handleToggleTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const updated = { ...task, completed: !task.completed };
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? updated : t))
    );
    saveDocumentToFirestore('tasks', taskId, updated).catch(console.error);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa công việc này khỏi danh sách?')) {
      const task = tasks.find((t) => t.id === taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      deleteDocumentFromFirestore('tasks', taskId).catch(console.error);
      addAuditLog('UPDATE_SETTINGS', `Xóa nhiệm vụ [${task?.title || taskId}]`, task?.caseTitle);
    }
  };

  const handleAddTimeline = (newTimelineData: Omit<CaseTimeline, 'id'>) => {
    const newTimeline: CaseTimeline = {
      ...newTimelineData,
      id: `time-${Date.now().toString().slice(-5)}`,
    };
    setTimelines((prev) => [...prev, newTimeline]);
    saveDocumentToFirestore('timelines', newTimeline.id, newTimeline).catch(console.error);
  };

  const handleDeleteTimeline = (timelineId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa mốc sự kiện này?')) {
      setTimelines((prev) => prev.filter((tm) => tm.id !== timelineId));
      deleteDocumentFromFirestore('timelines', timelineId).catch(console.error);
    }
  };

  const handleAddNote = (newNoteData: Omit<InternalNote, 'id'>) => {
    const newNote: InternalNote = {
      ...newNoteData,
      id: `note-${Date.now().toString().slice(-5)}`,
    };
    setNotes((prev) => [newNote, ...prev]);
    saveDocumentToFirestore('notes', newNote.id, newNote).catch(console.error);
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa ghi chú này?')) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      deleteDocumentFromFirestore('notes', noteId).catch(console.error);
    }
  };

  const handleSaveStaff = (savedStaff: StaffMember) => {
    // RBAC: Check role permissions
    if (currentUser.roleId !== 'admin') {
      // Non-admin can only update their own profile info, never someone else's
      if (savedStaff.id !== currentUser.id) {
        alert('Chỉ Luật sư Điều hành (Admin) mới có quyền quản trị nhân sự khác!');
        return;
      }
      // Strictly prevent self-privilege escalation
      if (
        savedStaff.roleId !== currentUser.roleId ||
        savedStaff.status !== currentUser.status ||
        JSON.stringify(savedStaff.permissions.slice().sort()) !== JSON.stringify(currentUser.permissions.slice().sort())
      ) {
        alert('Cảnh báo an ninh: Người dùng không được phép tự nâng quyền hoặc thay đổi vai trò của mình!');
        return;
      }
    }

    setStaff((prev) => {
      const exists = prev.some((s) => s.id === savedStaff.id);
      if (exists) {
        return prev.map((s) => (s.id === savedStaff.id ? savedStaff : s));
      }
      return [...prev, savedStaff];
    });

    if (currentUser.id === savedStaff.id) {
      setCurrentUser(savedStaff);
    }

    saveDocumentToFirestore('staff', savedStaff.id, savedStaff).catch(console.error);

    addAuditLog(
      'CHANGE_PERMISSION',
      `Cập nhật tài khoản & phân quyền cho ${savedStaff.name} (${savedStaff.role})`,
      savedStaff.name
    );
  };

  const handleSwitchUser = (member: StaffMember) => {
    if (currentUser.roleId === 'admin' && member.roleId !== 'admin') {
      setAdminOriginalUser(currentUser);
      localStorage.setItem('bigboss_admin_origin', JSON.stringify(currentUser));
    } else if (member.roleId === 'admin') {
      setAdminOriginalUser(null);
      localStorage.removeItem('bigboss_admin_origin');
    }
    setCurrentUser(member);
    addAuditLog(
      'LOGIN',
      `Chuyển đổi phiên làm việc sang tài khoản ${member.name} (${member.role})`,
      member.name
    );
  };

  const handleReturnToAdmin = () => {
    if (adminOriginalUser) {
      setCurrentUser(adminOriginalUser);
      setAdminOriginalUser(null);
      localStorage.removeItem('bigboss_admin_origin');
      addAuditLog(
        'LOGIN',
        `Quay trở lại phiên làm việc quản trị của ${adminOriginalUser.name}`,
        adminOriginalUser.name
      );
    }
  };

  const handleResetData = () => {
    setCases(INITIAL_CASES);
    setClients(INITIAL_CLIENTS);
    setDocuments(INITIAL_DOCUMENTS);
    setTasks(INITIAL_TASKS);
    setTimelines(INITIAL_TIMELINES);
    setNotes(INITIAL_NOTES);
    setStaff(INITIAL_STAFF);
    setCurrentUser(INITIAL_STAFF[0]);
    setSystemSettings(INITIAL_SYSTEM_SETTINGS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSelectedCase(null);
    localStorage.removeItem('bigboss_cases');
    localStorage.removeItem('bigboss_clients');
    localStorage.removeItem('bigboss_documents');
    localStorage.removeItem('bigboss_tasks');
    localStorage.removeItem('bigboss_timelines');
    localStorage.removeItem('bigboss_notes');
    localStorage.removeItem('bigboss_staff');
    localStorage.removeItem('bigboss_settings');
    localStorage.removeItem('bigboss_audit_logs');
    localStorage.removeItem('bigboss_current_user_id');
  };

  // If not logged in, render the login page matching Image 1
  if (!isAuthenticated) {
    return (
      <LoginView
        onLogin={handleLogin}
        staff={staff}
        cases={cases}
        documents={documents}
        timelines={timelines}
      />
    );
  }

  // Role and RBAC permissions check
  const isAdmin = currentUser.roleId === 'admin';
  const hasManageBilling = isAdmin || currentUser.permissions.includes('manage_billing');

  // Guard appMode & activeTab: strictly redirect away from Admin Portal & Admin-only tabs if currentUser is regular staff
  useEffect(() => {
    if (!isAdmin && appMode === 'admin_portal') {
      setAppMode('operations_app');
      localStorage.setItem('bigboss_app_mode', 'operations_app');
    }
    if ((activeTab === 'settings' || activeTab === 'dashboard' || activeTab === 'staff') && !isAdmin) {
      setActiveTab('my-workspace');
    }
  }, [currentUser, activeTab, isAdmin, appMode]);

  // Assigned cases for currentUser:
  const assignedCases = cases.filter((c) => {
    const isLead =
      c.leadLawyer.toLowerCase().includes(currentUser.name.toLowerCase()) ||
      currentUser.name.toLowerCase().includes(c.leadLawyer.toLowerCase());
    const isAssistant = c.assistants?.some(
      (a) =>
        a.toLowerCase().includes(currentUser.name.toLowerCase()) ||
        currentUser.name.toLowerCase().includes(a.toLowerCase())
    );
    return isLead || isAssistant;
  });

  // Visible cases:
  // Admin sees all cases of the entire law firm.
  // Regular staff STRICTLY only see cases assigned to them by Admin!
  const visibleCases = isAdmin ? cases : assignedCases;
  const visibleCaseIds = new Set(visibleCases.map((c) => c.id));

  // Visible tasks:
  // Admin sees all tasks.
  // Otherwise, tasks assigned to this user OR tasks belonging to visibleCases!
  const visibleTasks = isAdmin
    ? tasks
    : tasks.filter(
        (t) =>
          t.assignee.toLowerCase().includes(currentUser.name.toLowerCase()) ||
          currentUser.name.toLowerCase().includes(t.assignee.toLowerCase()) ||
          t.assignee === currentUser.initials ||
          visibleCaseIds.has(t.caseId)
      );

  // Visible documents:
  // Admin sees all documents.
  // Otherwise, documents belonging to visibleCases OR uploaded by currentUser!
  const visibleDocuments = isAdmin
    ? documents
    : documents.filter(
        (d) =>
          (d.caseId && visibleCaseIds.has(d.caseId)) ||
          d.uploadedBy.toLowerCase().includes(currentUser.name.toLowerCase()) ||
          currentUser.name.toLowerCase().includes(d.uploadedBy.toLowerCase())
      );

  // Visible clients:
  // Admin sees all clients.
  // Otherwise, strictly only clients who have at least one case in visibleCases!
  const visibleClientIds = new Set(visibleCases.map((c) => c.clientId));
  const visibleClients = isAdmin
    ? clients
    : clients.filter((c) => visibleClientIds.has(c.id));

  // Get active tab title for top navbar
  const getHeaderInfo = () => {
    if (selectedCase) {
      return {
        title: 'Không gian làm việc hồ sơ',
        subtitle: `${selectedCase.id} • ${selectedCase.title}`,
      };
    }
    switch (activeTab) {
      case 'my-workspace':
        return {
          title: isAdmin ? 'Bàn làm việc Admin' : 'Bàn làm việc của tôi',
          subtitle: isAdmin
            ? `Quản trị điều hành & Phân công công việc • ${currentUser.name}`
            : `Không gian công việc được giao • ${currentUser.name} (${currentUser.role})`,
        };
      case 'dashboard':
        return { title: 'Tổng quan Hãng luật (Admin)', subtitle: 'Toàn cảnh tình hình vụ việc & tài liệu của công ty' };
      case 'clients':
        return {
          title: isAdmin ? 'Danh bạ Khách hàng' : 'Thân chủ liên quan',
          subtitle: isAdmin ? 'Toàn bộ thân chủ và đối tác công ty' : `${visibleClients.length} thân chủ vụ việc được phân công`,
        };
      case 'cases':
        return {
          title: isAdmin ? 'Hồ sơ / Vụ việc (Tất cả)' : 'Hồ sơ được phân công',
          subtitle: isAdmin
            ? 'Toàn bộ hồ sơ đang xử lý tại hãng luật'
            : `${visibleCases.length} vụ việc do Admin phân công cho ${currentUser.name}`,
        };
      case 'documents':
        return {
          title: isAdmin ? 'Kho tài liệu chung' : 'Tài liệu hồ sơ',
          subtitle: isAdmin ? 'Quản lý toàn bộ chứng cứ, hợp đồng công ty' : `${visibleDocuments.length} tài liệu các vụ việc phụ trách`,
        };
      case 'tasks':
        return {
          title: isAdmin ? 'Quản lý Công việc' : 'Công việc của tôi',
          subtitle: isAdmin ? 'Phân công nhiệm vụ luật sư và thư ký' : `${visibleTasks.length} nhiệm vụ được giao xử lý`,
        };
      case 'staff':
        return {
          title: 'Nhân sự & Phân quyền',
          subtitle: 'Quản trị tài khoản, cài đặt Email Google & RBAC',
        };
      case 'settings':
        return { title: 'Quản trị hệ thống (Admin)', subtitle: 'Cấu hình văn phòng luật sư & dữ liệu' };
      default:
        return { title: 'BigBoss Law CRM', subtitle: '' };
    }
  };

  const headerInfo = getHeaderInfo();

  // DEDICATED ADMIN PORTAL VIEW (Tách biệt hoàn toàn với app quản lý nghiệp vụ chung)
  if (appMode === 'admin_portal' && isAdmin) {
    return (
      <div className="min-h-screen bg-[#0d0f12]">
        <AdminPortalView
          currentUser={currentUser}
          staff={staff}
          cases={cases}
          clients={clients}
          documents={documents}
          tasks={tasks}
          systemSettings={systemSettings}
          auditLogs={auditLogs}
          onSwitchToOperationsApp={() => {
            setAppMode('operations_app');
            localStorage.setItem('bigboss_app_mode', 'operations_app');
          }}
          onPreviewStaffView={(staffMember) => {
            handleSwitchUser(staffMember);
            setAppMode('operations_app');
            localStorage.setItem('bigboss_app_mode', 'operations_app');
          }}
          onUpdateCase={handleUpdateCase}
          onDeleteCase={handleDeleteCase}
          onDeleteClient={handleDeleteClient}
          onDeleteDocument={handleDeleteDocument}
          onSaveStaff={handleSaveStaff}
          onUpdateSettings={(newSettings) => {
            setSystemSettings(newSettings);
            addAuditLog('UPDATE_SETTINGS', 'Cập nhật cấu hình hệ thống văn phòng');
          }}
          onResetData={handleResetData}
          onSelectCase={(c) => {
            setSelectedCase(c);
            setAppMode('operations_app');
            localStorage.setItem('bigboss_app_mode', 'operations_app');
          }}
          onOpenCreateCase={() => setIsCreateCaseModalOpen(true)}
          onOpenUpload={(cId) => handleOpenUpload(cId)}
          onLogout={handleLogout}
        />

        {/* Global Modals for Admin Portal */}
        <UploadDocumentModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUploadDocument}
          clients={clients}
          cases={cases}
          defaultCaseId={uploadCaseId}
          defaultClientId={uploadClientId}
        />

        <CreateCaseModal
          isOpen={isCreateCaseModalOpen}
          onClose={() => setIsCreateCaseModalOpen(false)}
          onCreate={handleCreateCase}
          clients={clients}
          staff={staff}
        />

        <DocumentPreviewModal
          document={previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] bg-[#f8fafc] overflow-hidden font-sans">
      {/* Sidebar (Desktop persistent + Mobile off-canvas drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedCase(null);
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        casesCount={visibleCases.length}
        docsCount={visibleDocuments.length}
        tasksCount={visibleTasks.filter((t) => !t.completed).length}
        clientsCount={visibleClients.length}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenAdminPortal={() => {
          setAppMode('admin_portal');
          localStorage.setItem('bigboss_app_mode', 'admin_portal');
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-20 lg:pb-0">
        {/* Admin Preview Return Banner */}
        {adminOriginalUser && (
          <div className="bg-gradient-to-r from-red-950 via-amber-950 to-red-950 text-white px-3 sm:px-6 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 shrink-0 shadow-md border-b border-amber-600/40 z-30">
            <div className="flex items-center space-x-2 truncate mr-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase border border-amber-500/40 shrink-0">
                👁️ Đang xem trước Giao diện Nhân sự
              </span>
              <span className="truncate">
                Admin đang xem giao diện phân công của: <strong>{currentUser.name}</strong> ({currentUser.role})
              </span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleReturnToAdmin}
                className="px-3 py-1 bg-white hover:bg-amber-50 text-red-900 rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center space-x-1"
              >
                <span>👑 Thoát xem trước</span>
              </button>
              <button
                onClick={() => {
                  handleReturnToAdmin();
                  setAppMode('admin_portal');
                  localStorage.setItem('bigboss_app_mode', 'admin_portal');
                }}
                className="px-3 py-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center space-x-1"
              >
                <span>🛡️ Về Trang Quản Trị Admin</span>
              </button>
            </div>
          </div>
        )}

        <Navbar
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          currentUser={currentUser}
          staff={staff}
          onOpenUpload={() => handleOpenUpload()}
          onOpenCreateCase={() => setIsCreateCaseModalOpen(true)}
          onSwitchUser={handleSwitchUser}
          onOpenClientPortal={() => setIsClientPortalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
          onOpenAdminPortal={() => {
            setAppMode('admin_portal');
            localStorage.setItem('bigboss_app_mode', 'admin_portal');
          }}
        />

        <main className="flex-1">
          {/* If a case is selected, show its full Workspace View matching Image 4 */}
          {selectedCase ? (
            <CaseWorkspaceView
              caseItem={selectedCase}
              documents={documents}
              tasks={tasks}
              timelines={timelines}
              notes={notes}
              staff={staff}
              currentUser={currentUser}
              onBack={() => setSelectedCase(null)}
              onUpdateCase={handleUpdateCase}
              onOpenUpload={handleOpenUpload}
              onPreviewDocument={setPreviewDocument}
              onDeleteDocument={handleDeleteDocument}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onAddTimeline={handleAddTimeline}
              onAddNote={handleAddNote}
              onDeleteTask={handleDeleteTask}
              onDeleteTimeline={handleDeleteTimeline}
              onDeleteNote={handleDeleteNote}
            />
          ) : (
            <>
              {activeTab === 'my-workspace' && (
                <MyWorkspaceView
                  currentUser={currentUser}
                  cases={visibleCases}
                  tasks={visibleTasks}
                  documents={visibleDocuments}
                  timelines={timelines}
                  onSelectCase={(c) => setSelectedCase(c)}
                  onToggleTask={handleToggleTask}
                  onAddTask={handleAddTask}
                  onOpenUpload={handleOpenUpload}
                  onPreviewDocument={setPreviewDocument}
                  onOpenProfile={() => setIsProfileModalOpen(true)}
                />
              )}

              {/* Dashboard: strictly Admin-only */}
              {activeTab === 'dashboard' && isAdmin && (
                <DashboardView
                  cases={cases}
                  clients={clients}
                  documents={documents}
                  tasks={tasks}
                  staff={staff}
                  currentUser={currentUser}
                  onSelectCase={(c) => setSelectedCase(c)}
                  onOpenUpload={() => handleOpenUpload()}
                  onOpenCreateCase={() => setIsCreateCaseModalOpen(true)}
                  onNavigateTab={(tab) => {
                    setActiveTab(tab as TabType);
                    setSelectedCase(null);
                  }}
                />
              )}

              {activeTab === 'cases' && (
                <CasesView
                  cases={visibleCases}
                  currentUser={currentUser}
                  onSelectCase={(c) => setSelectedCase(c)}
                  onOpenCreateCase={() => setIsCreateCaseModalOpen(true)}
                  onOpenEditCase={(c) => setEditingCase(c)}
                  onDeleteCase={handleDeleteCase}
                />
              )}

              {activeTab === 'clients' && (
                <ClientsView
                  clients={visibleClients}
                  cases={visibleCases}
                  documents={visibleDocuments}
                  currentUser={currentUser}
                  onSelectCase={(c) => setSelectedCase(c)}
                  onOpenCreateClient={() => setIsCreateClientModalOpen(true)}
                  onOpenUpload={handleOpenUpload}
                  onPreviewDocument={setPreviewDocument}
                  onUpdateClient={handleUpdateClient}
                  onDeleteClient={handleDeleteClient}
                />
              )}

              {activeTab === 'documents' && (
                <DocumentsView
                  documents={visibleDocuments}
                  cases={visibleCases}
                  clients={visibleClients}
                  currentUser={currentUser}
                  onOpenUpload={handleOpenUpload}
                  onPreviewDocument={setPreviewDocument}
                  onDeleteDocument={handleDeleteDocument}
                />
              )}

              {activeTab === 'tasks' && (
                <TasksView
                  tasks={visibleTasks}
                  cases={visibleCases}
                  staff={staff}
                  currentUser={currentUser}
                  onToggleTask={handleToggleTask}
                  onAddTask={handleAddTask}
                  onSelectCase={(c) => setSelectedCase(c)}
                  onDeleteTask={handleDeleteTask}
                />
              )}

              {/* Staff Management: strictly Admin only */}
              {activeTab === 'staff' && isAdmin && (
                <StaffView
                  staff={staff}
                  cases={cases}
                  currentUser={currentUser}
                  onSelectCase={(c) => setSelectedCase(c)}
                  onSaveStaff={handleSaveStaff}
                  onSwitchUser={handleSwitchUser}
                />
              )}

              {/* System Settings: strictly Admin only */}
              {activeTab === 'settings' && isAdmin && (
                <SettingsView
                  settings={systemSettings}
                  onUpdateSettings={(newSettings) => {
                    setSystemSettings(newSettings);
                    addAuditLog('UPDATE_SETTINGS', 'Cập nhật cấu hình hệ thống văn phòng');
                  }}
                  auditLogs={auditLogs}
                  onResetData={handleResetData}
                  casesCount={cases.length}
                  clientsCount={clients.length}
                  docsCount={documents.length}
                  staffCount={staff.length}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadDocument}
        clients={clients}
        cases={cases}
        defaultCaseId={uploadCaseId}
        defaultClientId={uploadClientId}
      />

      <CreateCaseModal
        isOpen={isCreateCaseModalOpen}
        onClose={() => setIsCreateCaseModalOpen(false)}
        onCreate={handleCreateCase}
        clients={clients}
        staff={staff}
      />

      <EditCaseModal
        isOpen={!!editingCase}
        onClose={() => setEditingCase(null)}
        caseItem={editingCase}
        clients={clients}
        staff={staff}
        onSave={handleUpdateCase}
      />

      <CreateClientModal
        isOpen={isCreateClientModalOpen}
        onClose={() => setIsCreateClientModalOpen(false)}
        onCreate={handleCreateClient}
      />

      <DocumentPreviewModal
        document={previewDocument}
        onClose={() => setPreviewDocument(null)}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateProfile={handleSaveStaff}
      />

      <ClientPortalModal
        isOpen={isClientPortalOpen}
        onClose={() => setIsClientPortalOpen(false)}
        cases={cases}
        documents={documents}
      />

      {/* Mobile Bottom Navigation Bar (< lg: 1024px) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedCase(null);
        }}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        casesCount={visibleCases.length}
        tasksCount={visibleTasks.filter((t) => !t.completed).length}
      />
    </div>
  );
}
