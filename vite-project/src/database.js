// Полноценная система управления медицинской базой данных
class EMSDatabase {
  constructor() {
    this.version = '2.1';
    this.initDatabase();
  }

  initDatabase() {
    if (!localStorage.getItem('ems_database')) {
      const initialDB = {
        version: this.version,
        lastUpdated: new Date().toISOString(),
        lastBackup: null,
        patients: this.getInitialPatients(),
        services: this.getInitialServices(),
        appointments: this.getInitialAppointments(),
        medicalRecords: this.getInitialMedicalRecords(),
        contracts: this.getInitialContracts(),
        doctors: this.getInitialDoctors(),
        statistics: this.getInitialStats()
      };
      this.saveToStorage(initialDB);
    }
  }

  getInitialPatients() {
    const patients = [
      {
        id: 1,
        cardNumber: 'P00123',
        fio: 'Иванов Иван Иванович',
        birthDate: '1980-03-15',
        gender: 'М',
        phone: '+7(999)123-45-67',
        email: 'ivanov@example.com',
        address: 'г. Москва, ул. Ленина, д. 15, кв. 42',
        snils: '123-456-789-00',
        passport: '4510 123456',
        insurance: 'ОМС',
        insuranceNumber: '1234567890123456',
        bloodType: 'II+',
        allergies: ['Пенициллин', 'Арахис'],
        chronicDiseases: ['Гипертония'],
        disability: false,
        createdAt: '2020-05-10T10:30:00Z',
        updatedAt: new Date().toISOString(),
        status: 'активен'
      },
      {
        id: 2,
        cardNumber: 'P00124',
        fio: 'Петрова Анна Сергеевна',
        birthDate: '1992-07-22',
        gender: 'Ж',
        phone: '+7(999)234-56-78',
        email: 'petrova@example.com',
        address: 'г. Москва, ул. Мира, д. 8, кв. 15',
        snils: '234-567-890-11',
        passport: '4511 234567',
        insurance: 'ДМС',
        insuranceNumber: '2345678901234567',
        bloodType: 'I-',
        allergies: [],
        chronicDiseases: ['Астма'],
        disability: false,
        createdAt: '2021-02-15T14:20:00Z',
        updatedAt: new Date().toISOString(),
        status: 'активен'
      }
    ];
    
    patients.forEach(p => {
      p.age = this.calculateAge(p.birthDate);
    });
    
    return patients;
  }

  getInitialServices() {
    return [
      {
        id: 1,
        code: 'A01.001',
        name: 'Первичный прием терапевта',
        description: 'Осмотр, консультация, назначение обследования',
        price: 1500,
        category: 'Консультации',
        duration: 30,
        isActive: true,
        requirements: '',
        tags: ['терапия', 'консультация']
      },
      {
        id: 2,
        code: 'A02.015',
        name: 'ЭКГ с расшифровкой',
        description: 'Электрокардиограмма в 12 отведениях',
        price: 800,
        category: 'Диагностика',
        duration: 20,
        isActive: true,
        requirements: '',
        tags: ['кардиология', 'диагностика']
      },
      {
        id: 3,
        code: 'B03.007',
        name: 'УЗИ брюшной полости',
        description: 'Ультразвуковое исследование органов брюшной полости',
        price: 2200,
        category: 'Диагностика',
        duration: 40,
        isActive: true,
        requirements: 'Натощак',
        tags: ['ультразвук', 'диагностика']
      }
    ];
  }

  getInitialMedicalRecords() {
    return [
      {
        id: 1,
        patientId: 1,
        date: '2024-01-10',
        time: '09:30',
        doctor: 'Дроздов А.В.',
        doctorId: 1,
        specialty: 'Терапевт',
        diagnosis: 'J06.9 - Острая инфекция верхних дыхательных путей неуточненная',
        symptoms: 'Температура 37.8°C, кашель, насморк, головная боль',
        treatment: 'Постельный режим, обильное питье, парацетамол 500мг 3 раза в день',
        prescriptions: ['Анализ крови общий', 'Рентген грудной клетки'],
        medications: [
          { name: 'Парацетамол', dosage: '500мг', frequency: '3 раза в день', duration: '5 дней' }
        ],
        nextVisit: '2024-01-17',
        notes: 'Пациент чувствует себя удовлетворительно. Рекомендован домашний режим.',
        createdAt: '2024-01-10T10:00:00Z'
      }
    ];
  }

  getInitialAppointments() {
    return [
      {
        id: 1,
        patientId: 1,
        doctorId: 1,
        date: '2024-01-20',
        time: '14:30',
        duration: 30,
        serviceId: 1,
        status: 'запланировано',
        reason: 'Плановый осмотр',
        notes: '',
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z'
      }
    ];
  }

  getInitialDoctors() {
    return [
      {
        id: 1,
        fio: 'Дроздов Алексей Владимирович',
        specialty: 'Терапевт',
        qualifications: 'Высшая категория, к.м.н.',
        schedule: [
          { day: 'Понедельник', start: '09:00', end: '18:00' },
          { day: 'Вторник', start: '09:00', end: '18:00' },
          { day: 'Среда', start: '09:00', end: '18:00' },
          { day: 'Четверг', start: '09:00', end: '18:00' },
          { day: 'Пятница', start: '09:00', end: '16:00' }
        ],
        room: '101',
        phone: '+7(495)123-45-67',
        email: 'drozdov@clinic.ru',
        isActive: true
      },
      {
        id: 2,
        fio: 'Семенова Ирина Петровна',
        specialty: 'Кардиолог',
        qualifications: 'Первая категория',
        schedule: [
          { day: 'Вторник', start: '10:00', end: '19:00' },
          { day: 'Среда', start: '10:00', end: '19:00' },
          { day: 'Четверг', start: '10:00', end: '19:00' },
          { day: 'Суббота', start: '09:00', end: '15:00' }
        ],
        room: '202',
        phone: '+7(495)234-56-78',
        email: 'semenova@clinic.ru',
        isActive: true
      }
    ];
  }

  getInitialContracts() {
    return [
      {
        id: 1,
        number: 'Д-2024-001',
        patientId: 1,
        date: '2024-01-05',
        services: [1, 2],
        totalAmount: 2300,
        status: 'активен',
        paymentStatus: 'оплачено',
        signedDate: '2024-01-05',
        validUntil: '2024-12-31',
        notes: 'Договор на платные услуги',
        createdAt: '2024-01-05T11:00:00Z'
      }
    ];
  }

  getInitialStats() {
    return {
      totalPatients: 2,
      totalAppointments: 1,
      totalRevenue: 2300,
      monthlyStats: {
        '2024-01': {
          patients: 2,
          appointments: 1,
          revenue: 2300,
          services: 3
        }
      }
    };
  }

  // === CRUD ОПЕРАЦИИ ===
  
  getAllPatients() {
    const db = this.loadFromStorage();
    return db.patients || [];
  }

  getPatientById(id) {
    const db = this.loadFromStorage();
    return db.patients.find(p => p.id === id);
  }

  addPatient(patientData) {
    const db = this.loadFromStorage();
    const newPatient = {
      id: this.generateId(),
      cardNumber: 'P' + String(Math.floor(Math.random() * 10000)).padStart(5, '0'),
      age: this.calculateAge(patientData.birthDate),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'активен',
      allergies: [],
      chronicDiseases: [],
      disability: false,
      ...patientData
    };
    
    db.patients = db.patients || [];
    db.patients.push(newPatient);
    this.updateStatistics(db);
    this.saveToStorage(db);
    return newPatient;
  }

  deletePatient(id) {
    const db = this.loadFromStorage();
    db.patients = db.patients.filter(p => p.id !== id);
    this.saveToStorage(db);
    return true;
  }

  getAllServices() {
    const db = this.loadFromStorage();
    return db.services || [];
  }

  addService(serviceData) {
    const db = this.loadFromStorage();
    const newService = {
      id: this.generateId(),
      isActive: true,
      ...serviceData
    };
    
    db.services = db.services || [];
    db.services.push(newService);
    this.saveToStorage(db);
    return newService;
  }

  getAllAppointments() {
    const db = this.loadFromStorage();
    return db.appointments || [];
  }

  addAppointment(appointmentData) {
    const db = this.loadFromStorage();
    const newAppointment = {
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'запланировано',
      ...appointmentData
    };
    
    db.appointments = db.appointments || [];
    db.appointments.push(newAppointment);
    this.updateStatistics(db);
    this.saveToStorage(db);
    return newAppointment;
  }

  updateAppointmentStatus(id, status) {
    const db = this.loadFromStorage();
    const appointment = db.appointments.find(a => a.id === id);
    if (appointment) {
      appointment.status = status;
      appointment.updatedAt = new Date().toISOString();
      this.saveToStorage(db);
    }
    return appointment;
  }

  getAllMedicalRecords() {
    const db = this.loadFromStorage();
    return db.medicalRecords || [];
  }

  addMedicalRecord(recordData) {
    const db = this.loadFromStorage();
    const newRecord = {
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      ...recordData
    };
    
    db.medicalRecords = db.medicalRecords || [];
    db.medicalRecords.push(newRecord);
    this.saveToStorage(db);
    return newRecord;
  }

  getAllDoctors() {
    const db = this.loadFromStorage();
    return db.doctors || this.getInitialDoctors();
  }

  addDoctor(doctorData) {
    const db = this.loadFromStorage();
    const newDoctor = {
      id: this.generateId(),
      isActive: true,
      ...doctorData
    };
    
    db.doctors = db.doctors || [];
    db.doctors.push(newDoctor);
    this.saveToStorage(db);
    return newDoctor;
  }

  getAllContracts() {
    const db = this.loadFromStorage();
    return db.contracts || [];
  }

  addContract(contractData) {
    const db = this.loadFromStorage();
    const newContract = {
      id: this.generateId(),
      number: 'Д-' + new Date().getFullYear() + '-' + 
              String((db.contracts?.length || 0) + 1).padStart(3, '0'),
      createdAt: new Date().toISOString(),
      status: 'активен',
      paymentStatus: 'не оплачено',
      ...contractData
    };
    
    db.contracts = db.contracts || [];
    db.contracts.push(newContract);
    this.updateStatistics(db);
    this.saveToStorage(db);
    return newContract;
  }

  updateContractPaymentStatus(id, paymentStatus) {
    const db = this.loadFromStorage();
    const contract = db.contracts.find(c => c.id === id);
    if (contract) {
      contract.paymentStatus = paymentStatus;
      contract.updatedAt = new Date().toISOString();
      this.saveToStorage(db);
    }
    return contract;
  }

  // === ОТЧЕТЫ ===
  
  generateReport(type, filters = {}) {
    const db = this.loadFromStorage();
    
    switch(type) {
      case 'patients':
        return this.generatePatientsReport(db, filters);
      case 'financial':
        return this.generateFinancialReport(db, filters);
      case 'appointments':
        return this.generateAppointmentsReport(db, filters);
      default:
        return this.generatePatientsReport(db, filters);
    }
  }

  generatePatientsReport(db) {
    const patients = db.patients || [];
    const ageGroups = {
      '0-18': patients.filter(p => p.age <= 18).length,
      '19-35': patients.filter(p => p.age > 18 && p.age <= 35).length,
      '36-60': patients.filter(p => p.age > 35 && p.age <= 60).length,
      '61+': patients.filter(p => p.age > 60).length
    };
    
    const report = {
      type: 'patients',
      generatedAt: new Date().toISOString(),
      total: patients.length,
      genderDistribution: {
        male: patients.filter(p => p.gender === 'М').length,
        female: patients.filter(p => p.gender === 'Ж').length
      },
      ageGroups,
      byInsurance: {
        oms: patients.filter(p => p.insurance === 'ОМС').length,
        dms: patients.filter(p => p.insurance === 'ДМС').length,
        none: patients.filter(p => !p.insurance).length
      }
    };
    
    // Генерация CSV с правильной кодировкой
    const headers = ['ФИО', 'Возраст', 'Пол', 'Страховка', 'Телефон'];
    const rows = patients.map(p => [
      p.fio,
      p.age,
      p.gender,
      p.insurance,
      p.phone
    ]);
    
    const csvContent = [
      '\uFEFF' + headers.join(','), // BOM для UTF-8
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    report.downloadUrl = URL.createObjectURL(blob);
    report.filename = `patients_report_${new Date().toISOString().split('T')[0]}.csv`;
    
    return report;
  }

  generateFinancialReport(db) {
    const appointments = db.appointments || [];
    const patients = db.patients || [];
    const services = db.services || [];
    
    const totalRevenue = appointments.reduce((sum, appointment) => {
      const service = services.find(s => s.id === appointment.serviceId);
      return sum + (service?.price || 0);
    }, 0);
    
    const report = {
      type: 'financial',
      generatedAt: new Date().toISOString(),
      totalAppointments: appointments.length,
      totalRevenue,
      appointments: appointments.slice(0, 50) // ограничиваем для отчета
    };
    
    // Генерация CSV
    const headers = ['Дата', 'Пациент', 'Услуга', 'Стоимость', 'Статус'];
    const rows = appointments.map(a => {
      const patient = patients.find(p => p.id === a.patientId);
      const service = services.find(s => s.id === a.serviceId);
      return [
        a.date,
        patient?.fio || 'Неизвестно',
        service?.name || 'Неизвестно',
        service?.price || 0,
        a.status
      ];
    });
    
    const csvContent = [
      '\uFEFF' + headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    report.downloadUrl = URL.createObjectURL(blob);
    report.filename = `financial_report_${new Date().toISOString().split('T')[0]}.csv`;
    
    return report;
  }

  generateAppointmentsReport(db) {
    const appointments = db.appointments || [];
    
    const report = {
      type: 'appointments',
      generatedAt: new Date().toISOString(),
      total: appointments.length,
      byStatus: {
        запланировано: appointments.filter(a => a.status === 'запланировано').length,
        подтверждено: appointments.filter(a => a.status === 'подтверждено').length,
        завершено: appointments.filter(a => a.status === 'завершено').length,
        отменено: appointments.filter(a => a.status === 'отменено').length
      }
    };
    
    return report;
  }

  // === ЭКСПОРТ/ИМПОРТ ===
  
  exportDatabase() {
    const db = this.loadFromStorage();
    const dataStr = JSON.stringify(db, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    return {
      url: URL.createObjectURL(dataBlob),
      filename: `ems_backup_${new Date().toISOString().split('T')[0]}.json`,
      size: dataStr.length,
      records: {
        patients: (db.patients || []).length,
        services: (db.services || []).length,
        appointments: (db.appointments || []).length,
        medicalRecords: (db.medicalRecords || []).length
      }
    };
  }

  importDatabase(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.patients || !Array.isArray(data.patients)) {
        return { success: false, message: 'Неверный формат: отсутствуют пациенты' };
      }
      
      data.lastUpdated = new Date().toISOString();
      data.lastBackup = new Date().toISOString();
      
      const oldDB = this.loadFromStorage();
      localStorage.setItem('ems_database_backup', JSON.stringify(oldDB));
      
      this.saveToStorage(data);
      
      return {
        success: true,
        message: `База данных успешно импортирована. Загружено: ${data.patients.length} пациентов, ${data.services?.length || 0} услуг`,
        records: {
          patients: data.patients.length,
          services: data.services?.length || 0,
          appointments: data.appointments?.length || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Ошибка при импорте: ${error.message}`,
        error: error.toString()
      };
    }
  }

  // === УТИЛИТЫ ===
  
  calculateAge(birthDate) {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  updateStatistics(db) {
    db.statistics = {
      totalPatients: (db.patients || []).length,
      totalAppointments: (db.appointments || []).length,
      totalRevenue: (db.contracts || []).reduce((sum, c) => sum + (c.totalAmount || 0), 0),
      monthlyStats: db.statistics?.monthlyStats || {}
    };
  }

  generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  loadFromStorage() {
    const data = localStorage.getItem('ems_database');
    return data ? JSON.parse(data) : this.getEmptyDatabase();
  }

  saveToStorage(data) {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem('ems_database', JSON.stringify(data));
  }

  getEmptyDatabase() {
    return {
      version: this.version,
      lastUpdated: new Date().toISOString(),
      patients: [],
      services: [],
      appointments: [],
      medicalRecords: [],
      contracts: [],
      doctors: [],
      statistics: {}
    };
  }
}

export default EMSDatabase;