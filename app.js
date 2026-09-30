/* OdontoCare - Application Logic Script */

// --- INITIAL STATE & MOCK DATA ---
const INITIAL_PATIENTS = [
  {
    id: "p1",
    name: "Ana Beatriz Ramos",
    cpf: "123.456.789-00",
    phone: "(11) 98765-4321",
    email: "ana.beatriz@email.com",
    birthdate: "1994-06-15",
    insurance: "Unimed Odonto",
    status: "Ativo",
    address: "Rua das Flores, 120 - São Paulo, SP",
    notes: "Paciente com sensibilidade no dente 16. Histórico de bruxismo leve.",
    odontogram: {
      "16": { surfaces: { oclusal: "carie", mesial: "restauracao" }, notes: "Cárie oclusal pequena" },
      "21": { surfaces: { oclusal: "higido" }, notes: "Faceta em resina ok" },
      "36": { surfaces: { oclusal: "canal" }, notes: "Tratamento endodôntico concluído em 2024" }
    }
  },
  {
    id: "p2",
    name: "Carlos Eduardo Mendes",
    cpf: "987.654.321-11",
    phone: "(11) 91234-5678",
    email: "carlos.mendes@email.com",
    birthdate: "1988-11-20",
    insurance: "Bradesco Dental",
    status: "Ativo",
    address: "Av. Paulista, 1500 - São Paulo, SP",
    notes: "Planejamento de implante no dente 46.",
    odontogram: {
      "46": { surfaces: { oclusal: "extracao" }, notes: "Raiz remanescente a extrair" }
    }
  },
  {
    id: "p3",
    name: "Mariana Souza Lima",
    cpf: "456.789.123-22",
    phone: "(11) 99887-6655",
    email: "mariana.souza@email.com",
    birthdate: "2001-03-08",
    insurance: "Particular",
    status: "Ativo",
    address: "Rua Augusta, 450 - São Paulo, SP",
    notes: "Alinhador ortodôntico transparente em andamento.",
    odontogram: {}
  },
  {
    id: "p4",
    name: "Roberto Fonseca",
    cpf: "321.654.987-33",
    phone: "(11) 97766-5544",
    email: "roberto.fonseca@email.com",
    birthdate: "1975-09-30",
    insurance: "Amil Dental",
    status: "Inativo",
    address: "Alameda Santos, 890 - São Paulo, SP",
    notes: "Prótese protocolo executada em 2023.",
    odontogram: {}
  }
];

const INITIAL_APPOINTMENTS = [
  {
    id: "a1",
    patientId: "p1",
    patientName: "Ana Beatriz Ramos",
    dentist: "Dr. Eduardo Silva",
    date: new Date().toISOString().split('T')[0],
    time: "09:00",
    procedure: "Restauração em Resina",
    duration: "45 min",
    status: "Confirmado",
    notes: "Dente 16"
  },
  {
    id: "a2",
    patientId: "p2",
    patientName: "Carlos Eduardo Mendes",
    dentist: "Dr. Eduardo Silva",
    date: new Date().toISOString().split('T')[0],
    time: "10:30",
    procedure: "Avaliação para Implante",
    duration: "60 min",
    status: "Em Atendimento",
    notes: "Dente 46"
  },
  {
    id: "a3",
    patientId: "p3",
    patientName: "Mariana Souza Lima",
    dentist: "Dra. Camila Torres",
    date: new Date().toISOString().split('T')[0],
    time: "14:00",
    procedure: "Manutenção Ortodôntica",
    duration: "30 min",
    status: "Confirmado",
    notes: "Troca de alinhadores"
  },
  {
    id: "a4",
    patientId: "p1",
    patientName: "Ana Beatriz Ramos",
    dentist: "Dr. Eduardo Silva",
    date: "2026-10-05",
    time: "11:00",
    procedure: "Profilaxia & Raspagem",
    duration: "45 min",
    status: "Pendente",
    notes: "Retorno de acompanhamento"
  }
];

const INITIAL_FINANCIALS = [
  { id: "f1", type: "receita", description: "Restauração Resina - Ana Beatriz", amount: 350.00, date: new Date().toISOString().split('T')[0], category: "Procedimentos", method: "PIX", status: "Pago" },
  { id: "f2", type: "receita", description: "Consulta Avaliação - Carlos Mendes", amount: 200.00, date: new Date().toISOString().split('T')[0], category: "Consultas", method: "Cartão de Crédito", status: "Pago" },
  { id: "f3", type: "despesa", description: "Material de Moldagem & Agulhas", amount: 480.00, date: "2026-09-25", category: "Insumos Odontológicos", method: "Boleto", status: "Pago" },
  { id: "f4", type: "receita", description: "Manutenção Ortodôntica - Mariana Lima", amount: 280.00, date: "2026-09-28", category: "Ortodontia", method: "PIX", status: "Pago" }
];

// --- APP CONTROLLER CLASS ---
class OdontoApp {
  constructor() {
    this.patients = JSON.parse(localStorage.getItem('odonto_patients')) || INITIAL_PATIENTS;
    this.appointments = JSON.parse(localStorage.getItem('odonto_appointments')) || INITIAL_APPOINTMENTS;
    this.financials = JSON.parse(localStorage.getItem('odonto_financials')) || INITIAL_FINANCIALS;
    
    this.selectedPatientId = null;
    this.activeToothStatus = 'carie'; // carie, restauracao, canal, extracao, implante, higido
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupTheme();
    this.renderDashboard();
    this.renderPatientsTable();
    this.renderAgenda();
    this.renderFinancials();
    this.setupOdontogram();
  }

  saveToStorage() {
    localStorage.setItem('odonto_patients', JSON.stringify(this.patients));
    localStorage.setItem('odonto_appointments', JSON.stringify(this.appointments));
    localStorage.setItem('odonto_financials', JSON.stringify(this.financials));
  }

  // --- NAVIGATION & THEME ---
  setupEventListeners() {
    // Navigation Links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.getAttribute('data-view');
        this.switchView(targetView, link);
      });
    });

    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Modals Close Trigger
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });

    // Global Search
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleGlobalSearch(e.target.value));
    }

    // Forms Submit Handlers
    const patientForm = document.getElementById('new-patient-form');
    if (patientForm) {
      patientForm.addEventListener('submit', (e) => this.handleSavePatient(e));
    }

    const appointmentForm = document.getElementById('new-appointment-form');
    if (appointmentForm) {
      appointmentForm.addEventListener('submit', (e) => this.handleSaveAppointment(e));
    }

    const transactionForm = document.getElementById('new-transaction-form');
    if (transactionForm) {
      transactionForm.addEventListener('submit', (e) => this.handleSaveTransaction(e));
    }
  }

  switchView(viewId, activeLinkElement) {
    document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    const targetView = document.getElementById(viewId);
    if (targetView) targetView.classList.add('active');
    if (activeLinkElement) activeLinkElement.classList.add('active');

    // Refresh specific view contents if needed
    if (viewId === 'view-dashboard') this.renderDashboard();
    if (viewId === 'view-pacientes') this.renderPatientsTable();
    if (viewId === 'view-agenda') this.renderAgenda();
    if (viewId === 'view-financeiro') this.renderFinancials();
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('odonto_theme', newTheme);
    this.showToast(`Modo ${newTheme === 'dark' ? 'Escuro' : 'Claro'} ativado!`, 'info');
  }

  setupTheme() {
    const savedTheme = localStorage.getItem('odonto_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  // --- DASHBOARD RENDER ---
  renderDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = this.appointments.filter(a => a.date === today);
    const monthlyRevenue = this.financials
      .filter(f => f.type === 'receita')
      .reduce((sum, f) => sum + f.amount, 0);

    // Metric Values
    document.getElementById('dash-today-count').textContent = todayAppointments.length;
    document.getElementById('dash-patients-total').textContent = this.patients.length;
    document.getElementById('dash-revenue-total').textContent = `R$ ${monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    // Render Today's Agenda Table
    const tbody = document.getElementById('dash-appointments-list');
    if (!tbody) return;

    if (todayAppointments.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">Nenhuma consulta agendada para hoje.</td></tr>`;
      return;
    }

    tbody.innerHTML = todayAppointments.map(app => `
      <tr>
        <td><strong>${app.time}</strong></td>
        <td>
          <div style="font-weight: 700;">${app.patientName}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${app.notes || 'Sem observações'}</div>
        </td>
        <td>${app.procedure}</td>
        <td>${app.dentist}</td>
        <td>
          <span class="badge ${this.getBadgeClass(app.status)}">${app.status}</span>
        </td>
      </tr>
    `).join('');
  }

  // --- PATIENTS MANAGEMENT ---
  renderPatientsTable(filterQuery = '') {
    const tbody = document.getElementById('patients-table-body');
    if (!tbody) return;

    const filtered = this.patients.filter(p => 
      p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      p.cpf.includes(filterQuery) ||
      p.phone.includes(filterQuery)
    );

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">Nenhum paciente encontrado.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--primary-light); color: var(--primary); font-weight: 700; display: flex; align-items: center; justify-content: center;">
              ${p.name.charAt(0)}
            </div>
            <div>
              <div style="font-weight: 700;">${p.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">CPF: ${p.cpf}</div>
            </div>
          </div>
        </td>
        <td>${p.phone}</td>
        <td>${p.insurance}</td>
        <td><span class="badge ${p.status === 'Ativo' ? 'badge-confirmed' : 'badge-canceled'}">${p.status}</span></td>
        <td>${p.email}</td>
        <td>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-sm btn-outline" onclick="window.app.openPatientDetails('${p.id}')">
              <i class="fa-solid fa-tooth"></i> Prontuário
            </button>
            <button class="btn btn-sm btn-secondary" onclick="window.app.openWhatsApp('${p.phone}')" title="Mensagem WhatsApp">
              <i class="fa-brands fa-whatsapp" style="color: #25D366;"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  handleSavePatient(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newPatient = {
      id: 'p' + (Date.now()),
      name: formData.get('name'),
      cpf: formData.get('cpf'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      birthdate: formData.get('birthdate'),
      insurance: formData.get('insurance'),
      status: 'Ativo',
      address: formData.get('address'),
      notes: formData.get('notes') || '',
      odontogram: {}
    };

    this.patients.unshift(newPatient);
    this.saveToStorage();
    this.renderPatientsTable();
    this.closeAllModals();
    e.target.reset();
    this.showToast('Paciente cadastrado com sucesso!', 'success');
  }

  openPatientDetails(patientId) {
    const patient = this.patients.find(p => p.id === patientId);
    if (!patient) return;

    this.selectedPatientId = patientId;
    document.getElementById('modal-patient-name').textContent = patient.name;
    document.getElementById('modal-patient-info').textContent = `CPF: ${patient.cpf} | Tel: ${patient.phone} | Convenio: ${patient.insurance}`;
    document.getElementById('modal-patient-notes').textContent = patient.notes || 'Sem observações adicionais.';

    this.renderPatientOdontogram(patient);
    this.openModal('modal-patient-details');
  }

  // --- AGENDA & APPOINTMENTS ---
  renderAgenda() {
    const container = document.getElementById('agenda-slots');
    if (!container) return;

    const hours = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
    const today = new Date().toISOString().split('T')[0];

    container.innerHTML = hours.map(hour => {
      const app = this.appointments.find(a => a.time.startsWith(hour.slice(0, 2)) && a.date === today);
      return `
        <div class="time-slot">
          <div class="time">${hour}</div>
          ${app ? `
            <div class="appointment-card">
              <div>
                <div style="font-weight: 700; color: var(--text-primary);">${app.patientName}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">${app.procedure} - ${app.dentist} (${app.duration})</div>
              </div>
              <span class="badge ${this.getBadgeClass(app.status)}">${app.status}</span>
            </div>
          ` : `
            <div style="flex: 1; border: 1px dashed var(--border-color); border-radius: var(--radius-md); padding: 0.75rem; color: var(--text-muted); font-size: 0.85rem; display: flex; align-items: center; justify-content: space-between;">
              <span>Horário Livre</span>
              <button class="btn btn-sm btn-outline" onclick="window.app.openNewAppointmentModal('${hour}')">+ Agendar</button>
            </div>
          `}
        </div>
      `;
    }).join('');
  }

  openNewAppointmentModal(time = '09:00') {
    const patientSelect = document.getElementById('app-patient-select');
    if (patientSelect) {
      patientSelect.innerHTML = this.patients.map(p => `<option value="${p.id}">${p.name} - ${p.phone}</option>`).join('');
    }
    document.getElementById('app-time-input').value = time;
    document.getElementById('app-date-input').value = new Date().toISOString().split('T')[0];
    this.openModal('modal-new-appointment');
  }

  handleSaveAppointment(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const patientId = formData.get('patientId');
    const patient = this.patients.find(p => p.id === patientId);

    const newApp = {
      id: 'a' + Date.now(),
      patientId,
      patientName: patient ? patient.name : 'Paciente Selecionado',
      dentist: formData.get('dentist'),
      date: formData.get('date'),
      time: formData.get('time'),
      procedure: formData.get('procedure'),
      duration: formData.get('duration'),
      status: 'Confirmado',
      notes: formData.get('notes')
    };

    this.appointments.unshift(newApp);
    this.saveToStorage();
    this.renderAgenda();
    this.renderDashboard();
    this.closeAllModals();
    e.target.reset();
    this.showToast('Consulta agendada com sucesso!', 'success');
  }

  // --- ODONTOGRAM INTERACTIVE LOGIC ---
  setupOdontogram() {
    // Select status pill listeners
    document.querySelectorAll('.status-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.status-pill').forEach(p => p.classList.remove('selected'));
        pill.classList.add('selected');
        this.activeToothStatus = pill.getAttribute('data-status');
      });
    });
  }

  renderPatientOdontogram(patient) {
    const containerUpper = document.getElementById('arch-upper');
    const containerLower = document.getElementById('arch-lower');
    if (!containerUpper || !containerLower) return;

    // Permanent tooth numbers: Upper 18-28, Lower 48-38
    const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
    const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

    const generateToothHTML = (num) => {
      const toothData = (patient.odontogram && patient.odontogram[num]) || { surfaces: {} };
      const s = toothData.surfaces || {};

      return `
        <div class="tooth-item" onclick="window.app.handleToothClick('${num}')">
          <span class="tooth-number">${num}</span>
          <svg class="tooth-svg" viewBox="0 0 40 50">
            <!-- Top surface (Oclusal/Incisal) -->
            <polygon class="tooth-surface" data-status="${s.oclusal || 'higido'}" points="12,12 28,12 28,28 12,28" onclick="window.app.handleSurfaceClick(event, '${num}', 'oclusal')"/>
            <!-- Vestibular (Top polygon) -->
            <polygon class="tooth-surface" data-status="${s.vestibular || 'higido'}" points="2,2 38,2 28,12 12,12" onclick="window.app.handleSurfaceClick(event, '${num}', 'vestibular')"/>
            <!-- Lingual/Palatina (Bottom polygon) -->
            <polygon class="tooth-surface" data-status="${s.lingual || 'higido'}" points="12,28 28,28 38,38 2,38" onclick="window.app.handleSurfaceClick(event, '${num}', 'lingual')"/>
            <!-- Mesial (Left polygon) -->
            <polygon class="tooth-surface" data-status="${s.mesial || 'higido'}" points="2,2 12,12 12,28 2,38" onclick="window.app.handleSurfaceClick(event, '${num}', 'mesial')"/>
            <!-- Distal (Right polygon) -->
            <polygon class="tooth-surface" data-status="${s.distal || 'higido'}" points="28,12 38,2 38,38 28,28" onclick="window.app.handleSurfaceClick(event, '${num}', 'distal')"/>
          </svg>
        </div>
      `;
    };

    containerUpper.innerHTML = upperTeeth.map(generateToothHTML).join('');
    containerLower.innerHTML = lowerTeeth.map(generateToothHTML).join('');
  }

  handleSurfaceClick(event, toothNum, surfaceName) {
    event.stopPropagation();
    if (!this.selectedPatientId) return;

    const patient = this.patients.find(p => p.id === this.selectedPatientId);
    if (!patient) return;

    if (!patient.odontogram) patient.odontogram = {};
    if (!patient.odontogram[toothNum]) patient.odontogram[toothNum] = { surfaces: {} };

    patient.odontogram[toothNum].surfaces[surfaceName] = this.activeToothStatus;
    this.saveToStorage();
    this.renderPatientOdontogram(patient);
    this.showToast(`Dente ${toothNum} (${surfaceName.toUpperCase()}) atualizado!`, 'info');
  }

  handleToothClick(toothNum) {
    const patient = this.patients.find(p => p.id === this.selectedPatientId);
    if (!patient) return;
    const currentInfo = patient.odontogram && patient.odontogram[toothNum] ? JSON.stringify(patient.odontogram[toothNum].surfaces) : 'Hígido';
    this.showToast(`Dente ${toothNum}: ${currentInfo}`, 'info');
  }

  // --- FINANCIALS MANAGEMENT ---
  renderFinancials() {
    const tbody = document.getElementById('financials-table-body');
    if (!tbody) return;

    const totalReceitas = this.financials.filter(f => f.type === 'receita').reduce((s, f) => s + f.amount, 0);
    const totalDespesas = this.financials.filter(f => f.type === 'despesa').reduce((s, f) => s + f.amount, 0);
    const saldo = totalReceitas - totalDespesas;

    document.getElementById('fin-total-receitas').textContent = `R$ ${totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    document.getElementById('fin-total-despesas').textContent = `R$ ${totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    document.getElementById('fin-saldo-liquido').textContent = `R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    tbody.innerHTML = this.financials.map(f => `
      <tr>
        <td>${f.date}</td>
        <td>
          <div style="font-weight: 700;">${f.description}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${f.category}</div>
        </td>
        <td><span class="badge ${f.type === 'receita' ? 'badge-confirmed' : 'badge-canceled'}">${f.type.toUpperCase()}</span></td>
        <td>${f.method}</td>
        <td style="font-weight: 800; color: ${f.type === 'receita' ? 'var(--accent)' : 'var(--danger)'}">
          ${f.type === 'receita' ? '+' : '-'} R$ ${f.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </td>
        <td><span class="badge badge-confirmed">${f.status}</span></td>
      </tr>
    `).join('');
  }

  handleSaveTransaction(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newFin = {
      id: 'f' + Date.now(),
      type: formData.get('type'),
      description: formData.get('description'),
      amount: parseFloat(formData.get('amount')),
      date: formData.get('date'),
      category: formData.get('category'),
      method: formData.get('method'),
      status: 'Pago'
    };

    this.financials.unshift(newFin);
    this.saveToStorage();
    this.renderFinancials();
    this.renderDashboard();
    this.closeAllModals();
    e.target.reset();
    this.showToast('Lançamento financeiro gravado com sucesso!', 'success');
  }

  // --- RECEITUÁRIO & ATESTADO GENERATOR ---
  printPrescription() {
    const patientName = document.getElementById('modal-patient-name').textContent;
    const bodyText = document.getElementById('prescription-text-input').value || "1. Amoxicilina 500mg - Tomar 1 comprimido de 8 em 8 horas por 7 dias.\n2. Dipirona 500mg - Tomar 1 comprimido se houver dor intensa.";

    const printWin = window.open('', '', 'width=800,height=600');
    printWin.document.write(`
      <html>
        <head>
          <title>Receituário Odontológico - ${patientName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #0d9488; margin: 0; font-size: 24px; }
            .header p { margin: 4px 0; color: #64748b; font-size: 14px; }
            .content { min-height: 400px; font-size: 16px; line-height: 1.8; white-space: pre-wrap; }
            .footer { margin-top: 50px; text-align: center; border-top: 1px solid #cbd5e1; padding-top: 20px; }
            .signature { margin-top: 60px; text-align: center; }
            .signature-line { width: 250px; border-bottom: 1px solid #000; margin: 0 auto 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ODONTOCARE - CLÍNICA ODONTOLÓGICA</h1>
            <p>Dr. Eduardo Silva - CRO-SP 123456</p>
            <p>Especialista em Implantodontia & Estética Dental</p>
          </div>
          <p><strong>Paciente:</strong> ${patientName}</p>
          <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          <hr style="border: 0; border-top: 1px dashed #cbd5e1; margin: 20px 0;">
          <h3 style="color: #0d9488;">RECEITUÁRIO</h3>
          <div class="content">${bodyText}</div>
          <div class="signature">
            <div class="signature-line"></div>
            <p><strong>Dr. Eduardo Silva</strong><br>Cirurgião-Dentista | CRO 123456</p>
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); printWin.close(); }, 500);
  }

  // --- UTILS & HELPERS ---
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }

  openWhatsApp(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const num = cleaned.length === 11 ? `55${cleaned}` : cleaned;
    const msg = encodeURIComponent("Olá! Aqui é da clínica OdontoCare. Confirmamos sua consulta em nossa clínica?");
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
  }

  handleGlobalSearch(query) {
    if (document.getElementById('view-pacientes').classList.contains('active')) {
      this.renderPatientsTable(query);
    } else {
      this.switchView('view-pacientes', document.querySelector('[data-view="view-pacientes"]'));
      this.renderPatientsTable(query);
    }
  }

  getBadgeClass(status) {
    switch (status) {
      case 'Confirmado': return 'badge-confirmed';
      case 'Em Atendimento': return 'badge-in-progress';
      case 'Concluído': return 'badge-completed';
      case 'Cancelado': return 'badge-canceled';
      default: return 'badge-pending';
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast`;
    toast.innerHTML = `
      <i class="fa-solid fa-circle-check" style="color: var(--primary);"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Instantiate App when DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new OdontoApp();
});
