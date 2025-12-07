import React, { useState, useEffect } from 'react';
import './App.css';
import EMSDatabase from './database';

export default function App() {
  const [db] = useState(new EMSDatabase());
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [activePatient, setActivePatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newAppointment, setNewAppointment] = useState({
    date: '',
    time: '',
    doctorId: '',
    serviceId: '',
    reason: ''
  });
  const [importData, setImportData] = useState('');
  const [exportInfo, setExportInfo] = useState(null);
  const [reportResults, setReportResults] = useState(null);
  const [newPatient, setNewPatient] = useState({
    fio: '',
    birthDate: '',
    gender: 'М',
    phone: '',
    email: '',
    address: '',
    snils: '',
    insurance: 'ОМС'
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    setPatients(db.getAllPatients());
    setServices(db.getAllServices());
    setAppointments(db.getAllAppointments());
    setDoctors(db.getAllDoctors());
    setContracts(db.getAllContracts());
    setMedicalRecords(db.getAllMedicalRecords());
  };

  const handleAddPatient = () => {
    if (!newPatient.fio || newPatient.fio.split(' ').length < 3) {
      alert('Введите полное ФИО (Фамилия Имя Отчество)');
      return;
    }
    
    if (!newPatient.birthDate) {
      alert('Введите дату рождения');
      return;
    }
    
    if (!newPatient.phone) {
      alert('Введите номер телефона');
      return;
    }
    
    const addedPatient = db.addPatient(newPatient);
    setPatients([...patients, addedPatient]);
    
    setNewPatient({
      fio: '',
      birthDate: '',
      gender: 'М',
      phone: '',
      email: '',
      address: '',
      snils: '',
      insurance: 'ОМС'
    });
    
    alert(`Пациент ${addedPatient.fio} успешно добавлен! Номер карты: ${addedPatient.cardNumber}`);
  };

  const handleDeletePatient = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пациента?')) {
      db.deletePatient(id);
      setPatients(patients.filter(p => p.id !== id));
      alert('Пациент удален');
    }
  };

  const handleAddService = () => {
    const name = prompt('Название услуги:');
    if (!name) return;
    
    const priceStr = prompt('Цена:');
    const price = parseInt(priceStr);
    if (!price || isNaN(price)) {
      alert('Введите корректную цену');
      return;
    }
    
    const category = prompt('Категория:') || 'Общие';
    const duration = parseInt(prompt('Длительность (мин):') || '30');
    const description = prompt('Описание:') || '';
    
    const newService = { name, price, category, duration, description };
    const addedService = db.addService(newService);
    setServices([...services, addedService]);
    alert('Услуга добавлена');
  };

  const handleDeleteService = (id) => {
    if (window.confirm('Удалить эту услугу?')) {
      const updatedServices = services.filter(s => s.id !== id);
      setServices(updatedServices);
      const dbData = JSON.parse(localStorage.getItem('ems_database'));
      dbData.services = updatedServices;
      localStorage.setItem('ems_database', JSON.stringify(dbData));
      alert('Услуга удалена');
    }
  };

  // ФИКС: РАБОТАЮЩИЕ ЗАПИСИ НА ПРИЕМ
  const handleScheduleAppointment = () => {
    if (!selectedPatient) {
      alert('Выберите пациента');
      return;
    }
    
    if (!newAppointment.date || !newAppointment.time || !newAppointment.doctorId) {
      alert('Заполните все обязательные поля записи');
      return;
    }
    
    const appointmentData = {
      patientId: selectedPatient.id,
      doctorId: parseInt(newAppointment.doctorId),
      serviceId: parseInt(newAppointment.serviceId) || services[0]?.id,
      date: newAppointment.date,
      time: newAppointment.time,
      reason: newAppointment.reason || 'Плановый осмотр'
    };
    
    const addedAppointment = db.addAppointment(appointmentData);
    setAppointments([...appointments, addedAppointment]);
    
    generateReferral(selectedPatient.id, newAppointment.doctorId, newAppointment.date, newAppointment.time);
    
    setNewAppointment({
      date: '',
      time: '',
      doctorId: '',
      serviceId: '',
      reason: ''
    });
    
    setSelectedPatient(null);
    alert(`Запись на ${appointmentData.date} в ${appointmentData.time} успешно создана!`);
  };

  const generateReferral = (patientId, doctorId, date, time) => {
    const patient = patients.find(p => p.id === patientId);
    const doctor = doctors.find(d => d.id === doctorId);
    
    const referral = `НАПРАВЛЕНИЕ №${db.generateId().toString().slice(-6)}
Дата выдачи: ${new Date().toLocaleDateString()}

Пациент: ${patient?.fio || ''}
Дата рождения: ${patient?.birthDate || ''}
Полис: ${patient?.insuranceNumber || patient?.insurance || ''}

Направлен к: ${doctor?.fio || ''}
Специальность: ${doctor?.specialty || ''}
Кабинет: ${doctor?.room || ''}

Дата приема: ${date}
Время: ${time}

Цель визита: ${newAppointment.reason || 'Плановый осмотр'}

Рекомендации:
- Прибыть за 15 минут до назначенного времени
- При себе иметь паспорт и полис
- При наличии - предыдущие медицинские документы

Подпись врача: __________
М.П.`;
    
    const blob = new Blob([referral], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Направление_${patient?.fio?.split(' ')[0] || 'пациента'}_${date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpdateAppointmentStatus = (id, status) => {
    const updated = db.updateAppointmentStatus(id, status);
    if (updated) {
      setAppointments(appointments.map(a => a.id === id ? updated : a));
      alert(`Статус записи изменен на "${status}"`);
    }
  };

  const handleAddDoctor = () => {
    const fio = prompt('ФИО врача:');
    if (!fio) return;
    
    const specialty = prompt('Специальность:');
    if (!specialty) return;
    
    const newDoctor = {
      fio,
      specialty,
      room: prompt('Кабинет:') || 'не указан',
      phone: prompt('Телефон:') || '',
      email: prompt('Email:') || '',
      qualifications: prompt('Квалификация:') || '',
      isActive: true,
      schedule: []
    };
    
    const addedDoctor = db.addDoctor(newDoctor);
    setDoctors([...doctors, addedDoctor]);
    alert('Врач добавлен');
  };

  const handleAddContract = () => {
    if (!selectedPatient) {
      alert('Сначала выберите пациента');
      return;
    }
    
    if (selectedServices.length === 0) {
      alert('Выберите хотя бы одну услугу для договора');
      return;
    }
    
    const totalAmount = selectedServices.reduce((sum, service) => sum + service.price, 0);
    
    const contractData = {
      patientId: selectedPatient.id,
      services: selectedServices.map(s => s.id),
      totalAmount,
      status: 'активен',
      paymentStatus: 'не оплачено',
      date: new Date().toISOString().split('T')[0],
      validUntil: '2024-12-31'
    };
    
    const addedContract = db.addContract(contractData);
    setContracts([...contracts, addedContract]);
    generateContractPDF(addedContract);
    alert(`Договор №${addedContract.number} создан! Сумма: ${totalAmount} руб.`);
  };

  const generateContractPDF = (contract) => {
    const patient = patients.find(p => p.id === contract.patientId);
    const contractServices = services.filter(s => contract.services.includes(s.id));
    
    const contractText = `ДОГОВОР НА ОКАЗАНИЕ МЕДИЦИНСКИХ УСЛУГ

№ ${contract.number}
г. Москва "${contract.date}"

Клиника "МедЦентр", именуемое в дальнейшем "Исполнитель",
в лице главного врача,
и ${patient?.fio || 'Пациент'}, именуемый в дальнейшем "Заказчик",
заключили настоящий договор:

1. ПРЕДМЕТ ДОГОВОРА
Исполнитель обязуется оказать следующие медицинские услуги:
${contractServices.map(s => `- ${s.name} - ${s.price} руб.`).join('\n')}

2. СТОИМОСТЬ УСЛУГ
Общая стоимость услуг: ${contract.totalAmount} руб.

3. УСЛОВИЯ ОПЛАТЫ
Оплата производится в течение 5 банковских дней.

4. СРОК ДЕЙСТВИЯ
Договор действует до ${contract.validUntil || '31.12.2024'}

ПОДПИСИ СТОРОН:

_________________             _________________
Главный врач                  ${patient?.fio || 'Пациент'}
М.П.`;
    
    const blob = new Blob([contractText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Договор_${contract.number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddMedicalRecord = () => {
    if (!activePatient) {
      alert('Сначала выберите пациента');
      return;
    }
    
    const diagnosis = prompt('Диагноз:');
    if (!diagnosis) return;
    
    const treatment = prompt('Лечение:') || '';
    const notes = prompt('Примечания:') || '';
    const doctor = prompt('ФИО врача:') || 'Не указан';
    const specialty = prompt('Специальность врача:') || 'Не указана';
    
    const recordData = {
      patientId: activePatient.id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      diagnosis,
      treatment,
      notes,
      doctor,
      specialty
    };
    
    const addedRecord = db.addMedicalRecord(recordData);
    setMedicalRecords([...medicalRecords, addedRecord]);
    alert('Медицинская запись добавлена');
  };

  const handleExportDatabase = () => {
    const exportResult = db.exportDatabase();
    setExportInfo(exportResult);
    
    const a = document.createElement('a');
    a.href = exportResult.url;
    a.download = exportResult.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    alert(`База данных экспортирована. Файл: ${exportResult.filename}`);
  };

  const handleImportDatabase = () => {
    if (!importData.trim()) {
      alert('Вставьте JSON данные или выберите файл');
      return;
    }
    
    const result = db.importDatabase(importData);
    
    if (result.success) {
      alert(result.message);
      loadAllData();
      setImportData('');
    } else {
      alert(`Ошибка: ${result.message}`);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImportData(e.target.result);
    };
    reader.onerror = () => {
      alert('Ошибка при чтении файла');
    };
    reader.readAsText(file);
  };

  // ФИКС: ЭКСПОРТ В CSV С ПРАВИЛЬНОЙ КОДИРОВКОЙ
  const handleGenerateReport = (type) => {
    try {
      const report = db.generateReport(type);
      if (!report) {
        throw new Error(`Отчет типа "${type}" не сгенерирован`);
      }
      
      setReportResults(report);
      
      if (report?.downloadUrl) {
        const a = document.createElement('a');
        a.href = report.downloadUrl;
        a.download = report.filename || `${type}_report.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        alert(`Отчет "${type}" успешно сгенерирован и скачан`);
      }
      
      setActiveModal('reportResults');
    } catch (error) {
      alert(`Ошибка при генерации отчета: ${error.message}`);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.fio.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.cardNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone?.includes(searchQuery)
  );

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dashboardItems = [
    { id: 'patients', icon: '👥', title: 'Пациенты', desc: 'Управление базой пациентов, поиск и редактирование' },
    { id: 'appointments', icon: '📅', title: 'Записи на прием', desc: 'Расписание и управление приемами' },
    { id: 'services', icon: '🏥', title: 'Медицинские услуги', desc: 'Каталог услуг и прайс-лист' },
    { id: 'medicalRecords', icon: '📋', title: 'Мед. карты', desc: 'Электронные медицинские карты' },
    { id: 'doctors', icon: '👨‍⚕️', title: 'Врачи', desc: 'Информация о врачах и расписание' },
    { id: 'contracts', icon: '📑', title: 'Договоры', desc: 'Договоры на оказание услуг' },
    { id: 'reports', icon: '📊', title: 'Отчеты', desc: 'Статистика и аналитика' },
    { id: 'dataManagement', icon: '💾', title: 'Управление данными', desc: 'Экспорт, импорт, резервное копирование' }
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="logo">EMS<span>System</span> v2.1</div>
        <nav className="nav">
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveModal(null); window.scrollTo(0, 0); }}>Главная</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveModal('patients'); }}>Пациенты ({patients.length})</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveModal('appointments'); }}>Записи ({appointments.length})</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveModal('dataManagement'); }}>Данные</a>
        </nav>
      </header>
      
      <section className="hero">
        <h1>Электронная Медицинская Система</h1>
        <p>Полнофункциональная система управления медицинским учреждением</p>
        
        <div className="stats">
          <div className="stat-card">
            <h3>{patients.length}</h3>
            <p>Пациентов</p>
          </div>
          <div className="stat-card">
            <h3>{appointments.filter(a => a.status === 'запланировано').length}</h3>
            <p>Активных записей</p>
          </div>
          <div className="stat-card">
            <h3>{services.length}</h3>
            <p>Услуг</p>
          </div>
          <div className="stat-card">
            <h3>{contracts.reduce((sum, c) => sum + (c.totalAmount || 0), 0)} ₽</h3>
            <p>Общая сумма</p>
          </div>
        </div>
      </section>
      
      <section className="grid">
        {dashboardItems.map((item) => (
          <div className="card" key={item.id} onClick={() => setActiveModal(item.id)}>
            <div className="icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
            <button>Открыть</button>
          </div>
        ))}
      </section>
      
      <section className="info-section">
        <div className="info-content">
          <h2>🚀 Возможности системы</h2>
          <div className="features">
            <div className="feature">
              <h3>📊 Полная статистика</h3>
              <p>Аналитика по пациентам, услугам и доходам в реальном времени</p>
            </div>
            <div className="feature">
              <h3>🔒 Безопасность данных</h3>
              <p>Шифрование и резервное копирование всех медицинских записей</p>
            </div>
            <div className="feature">
              <h3>📱 Мобильный доступ</h3>
              <p>Адаптивный интерфейс для работы на любых устройствах</p>
            </div>
            <div className="feature">
              <h3>⚡ Быстрая работа</h3>
              <p>Оптимизированная база данных для мгновенного поиска</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* МОДАЛЬНОЕ ОКНО: ПАЦИЕНТЫ */}
      {activeModal === 'patients' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            <h2>👥 Управление пациентами</h2>
            <div className="search-box">
              <input type="text" placeholder="🔍 Поиск по ФИО, номеру карты или телефону..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr><th>Карта</th><th>ФИО</th><th>Дата рождения</th><th>Телефон</th><th>Страховка</th><th>Действия</th></tr>
                </thead>
                <tbody>
                  {filteredPatients.map(patient => (
                    <tr key={patient.id}>
                      <td>{patient.cardNumber}</td>
                      <td><strong>{patient.fio}</strong></td>
                      <td>{patient.birthDate} ({patient.age} лет)</td>
                      <td>{patient.phone}</td>
                      <td>{patient.insurance}</td>
                      <td>
                        <button className="btn-small" onClick={() => { setActivePatient(patient); setActiveModal('patientDetails'); }}>Просмотр</button>
                        <button className="btn-small btn-danger" onClick={() => handleDeletePatient(patient.id)}>Удалить</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="add-patient-form">
              <h3>Добавить нового пациента</h3>
              <div className="form-row">
                <input type="text" placeholder="Фамилия Имя Отчество" value={newPatient.fio} onChange={(e) => setNewPatient({...newPatient, fio: e.target.value})} />
                <input type="date" value={newPatient.birthDate} onChange={(e) => setNewPatient({...newPatient, birthDate: e.target.value})} />
                <select value={newPatient.gender} onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}>
                  <option value="М">Мужской</option>
                  <option value="Ж">Женский</option>
                </select>
              </div>
              <div className="form-row">
                <input type="tel" placeholder="Телефон +7(999)123-45-67" value={newPatient.phone} onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})} />
                <input type="text" placeholder="СНИЛС" value={newPatient.snils} onChange={(e) => setNewPatient({...newPatient, snils: e.target.value})} />
                <select value={newPatient.insurance} onChange={(e) => setNewPatient({...newPatient, insurance: e.target.value})}>
                  <option value="ОМС">ОМС</option>
                  <option value="ДМС">ДМС</option>
                  <option value="Платно">Платно</option>
                </select>
              </div>
              <div className="form-row">
                <input type="email" placeholder="Email" value={newPatient.email} onChange={(e) => setNewPatient({...newPatient, email: e.target.value})} style={{flex: 2}} />
                <input type="text" placeholder="Адрес" value={newPatient.address} onChange={(e) => setNewPatient({...newPatient, address: e.target.value})} style={{flex: 3}} />
              </div>
              <button className="btn-primary" onClick={handleAddPatient}>📝 Добавить пациента</button>
            </div>
          </div>
        </div>
      )}
      
      {/* МОДАЛЬНОЕ ОКНО: ЗАПИСИ НА ПРИЕМ (РАБОЧЕЕ) */}
      {activeModal === 'appointments' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            <h2>📅 Записи на прием</h2>
            
            <div className="create-appointment">
              <h3>Создать новую запись</h3>
              <div className="form-row">
                <select value={selectedPatient?.id || ''} onChange={(e) => { const patient = patients.find(p => p.id === parseInt(e.target.value)); setSelectedPatient(patient); }} style={{flex: 2}}>
                  <option value="">Выберите пациента</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.fio} ({p.cardNumber})</option>)}
                </select>
                <select value={newAppointment.doctorId} onChange={(e) => setNewAppointment({...newAppointment, doctorId: e.target.value})} style={{flex: 2}}>
                  <option value="">Выберите врача</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.fio} - {d.specialty}</option>)}
                </select>
              </div>
              <div className="form-row">
                <input type="date" value={newAppointment.date} onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})} style={{flex: 1}} />
                <input type="time" value={newAppointment.time} onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})} style={{flex: 1}} />
                <select value={newAppointment.serviceId} onChange={(e) => setNewAppointment({...newAppointment, serviceId: e.target.value})} style={{flex: 1}}>
                  <option value="">Выберите услугу</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} - {s.price}₽</option>)}
                </select>
              </div>
              <div className="form-row">
                <input type="text" placeholder="Причина визита" value={newAppointment.reason} onChange={(e) => setNewAppointment({...newAppointment, reason: e.target.value})} style={{flex: 3}} />
              </div>
              <button className="btn-primary" onClick={handleScheduleAppointment} disabled={!selectedPatient || !newAppointment.date || !newAppointment.time || !newAppointment.doctorId}>
                📅 Записать на прием
              </button>
            </div>
            
            <div className="appointments-list">
              <h3>Все записи ({appointments.length})</h3>
              <table className="data-table">
                <thead>
                  <tr><th>Дата</th><th>Время</th><th>Пациент</th><th>Врач</th><th>Статус</th><th>Действия</th></tr>
                </thead>
                <tbody>
                  {appointments.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time)).map(appointment => {
                    const patient = patients.find(p => p.id === appointment.patientId);
                    const doctor = doctors.find(d => d.id === appointment.doctorId);
                    const service = services.find(s => s.id === appointment.serviceId);
                    
                    return (
                      <tr key={appointment.id}>
                        <td>{appointment.date}</td>
                        <td>{appointment.time}</td>
                        <td>{patient?.fio || 'Неизвестно'}</td>
                        <td>{doctor?.fio || 'Неизвестно'}</td>
                        <td><span className={`status-${appointment.status}`}>{appointment.status}</span></td>
                        <td>
                          <button className="btn-small" onClick={() => handleUpdateAppointmentStatus(appointment.id, 'завершено')}>Завершить</button>
                          <button className="btn-small btn-danger" onClick={() => handleUpdateAppointmentStatus(appointment.id, 'отменено')}>Отменить</button>
                          {service && <button className="btn-small btn-secondary" onClick={() => alert(`Услуга: ${service.name}\nСтоимость: ${service.price}₽`)}>💳</button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* МОДАЛЬНОЕ ОКНО: МЕДИЦИНСКИЕ УСЛУГИ */}
      {activeModal === 'services' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            <h2>🏥 Медицинские услуги</h2>
            <div className="search-box">
              <input type="text" placeholder="🔍 Поиск услуг..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
            </div>
            <div className="services-grid">
              {filteredServices.map(service => (
                <div key={service.id} className="service-card">
                  <div className="service-header">
                    <h3>{service.name}</h3>
                    <span className="service-price">{service.price} ₽</span>
                  </div>
                  <p className="service-desc">{service.description}</p>
                  <div className="service-footer">
                    <span className="service-category">{service.category}</span>
                    <span className="service-duration">{service.duration} мин</span>
                  </div>
                  <div className="service-actions">
                    <button className="btn-small" onClick={() => {
                      if (!selectedServices.find(s => s.id === service.id)) {
                        setSelectedServices([...selectedServices, service]);
                        alert(`Услуга "${service.name}" добавлена в выбранные`);
                      }
                    }}>Добавить в заявку</button>
                    <button className="btn-small btn-danger" onClick={() => handleDeleteService(service.id)}>Удалить</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="services-management">
              <h3>Управление услугами</h3>
              <div className="selected-services">
                <h4>Выбранные услуги ({selectedServices.length})</h4>
                {selectedServices.length > 0 ? (
                  <div className="selected-list">
                    {selectedServices.map(service => (
                      <div key={service.id} className="selected-item">
                        <span>{service.name} - {service.price} ₽</span>
                        <button className="btn-small btn-danger" onClick={() => setSelectedServices(selectedServices.filter(s => s.id !== service.id))}>✕</button>
                      </div>
                    ))}
                    <div className="selected-total">Итого: {selectedServices.reduce((sum, s) => sum + s.price, 0)} ₽</div>
                    <button className="btn-primary" onClick={() => selectedServices.length > 0 ? setActiveModal('contracts') : alert('Выберите услуги для договора')}>
                      Создать договор
                    </button>
                  </div>
                ) : <p>Выберите услуги из списка выше</p>}
              </div>
              <div className="add-service-form">
                <h4>Добавить новую услугу</h4>
                <button className="btn-primary" onClick={handleAddService}>➕ Добавить услугу</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* МОДАЛЬНОЕ ОКНО: МЕДИЦИНСКИЕ КАРТЫ */}
      {activeModal === 'medicalRecords' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content wide-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            <h2>📋 Электронные медицинские карты</h2>
            <div className="patient-selector">
              <select value={activePatient?.id || ''} onChange={(e) => { const patient = patients.find(p => p.id === parseInt(e.target.value)); setActivePatient(patient); }}>
                <option value="">Выберите пациента</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.fio} ({p.cardNumber})</option>)}
              </select>
            </div>
            {activePatient ? (
              <div className="medical-records-view">
                <div className="patient-info-summary">
                  <h3>Пациент: {activePatient.fio}</h3>
                  <p>Карта: {activePatient.cardNumber} | Возраст: {activePatient.age} лет</p>
                </div>
                <div className="records-actions">
                  <button className="btn-primary" onClick={handleAddMedicalRecord}>📝 Добавить запись</button>
                  <button className="btn-secondary" onClick={() => {
                    const records = medicalRecords.filter(r => r.patientId === activePatient.id);
                    const data = { patient: activePatient, records };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Медкарта_${activePatient.fio.split(' ')[0]}_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                  }}>📤 Экспорт карты</button>
                </div>
                <div className="records-history">
                  <h3>История обращений</h3>
                  {medicalRecords.filter(record => record.patientId === activePatient.id).map(record => (
                    <div key={record.id} className="medical-record-item">
                      <div className="record-header"><strong>{record.date}</strong><span className="record-doctor">{record.doctor} ({record.specialty})</span></div>
                      <div className="record-diagnosis"><strong>Диагноз:</strong> {record.diagnosis}</div>
                      {record.treatment && <div className="record-treatment"><strong>Лечение:</strong> {record.treatment}</div>}
                      {record.notes && <div className="record-notes"><strong>Примечания:</strong> {record.notes}</div>}
                    </div>
                  ))}
                  {medicalRecords.filter(r => r.patientId === activePatient.id).length === 0 && <p className="no-records">Записей нет. Добавьте первую запись.</p>}
                </div>
              </div>
            ) : <p className="select-patient-message">Выберите пациента для просмотра медицинской карты</p>}
          </div>
        </div>
      )}
      
      {/* МОДАЛЬНОЕ ОКНО: ВРАЧИ */}
      {activeModal === 'doctors' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            <h2>👨‍⚕️ Врачи и расписание</h2>
            <div className="doctors-list">
              {doctors.map(doctor => (
                <div key={doctor.id} className="doctor-card">
                  <div className="doctor-header">
                    <h3>{doctor.fio}</h3>
                    <span className="doctor-specialty">{doctor.specialty}</span>
                  </div>
                  <div className="doctor-info">
                    <p><strong>Кабинет:</strong> {doctor.room}</p>
                    <p><strong>Телефон:</strong> {doctor.phone}</p>
                    <p><strong>Email:</strong> {doctor.email}</p>
                    <p><strong>Квалификация:</strong> {doctor.qualifications}</p>
                  </div>
                  <div className="doctor-schedule">
                    <h4>Расписание:</h4>
                    {doctor.schedule ? (
                      <ul>{doctor.schedule.map((day, index) => <li key={index}>{day.day}: {day.start} - {day.end}</li>)}</ul>
                    ) : <p>Расписание не указано</p>}
                  </div>
                </div>
              ))}
            </div>
            <div className="add-doctor-form">
              <h3>Добавить нового врача</h3>
              <button className="btn-primary" onClick={handleAddDoctor}>👨‍⚕️ Добавить врача</button>
            </div>
          </div>
        </div>
      )}
      
      {/* МОДАЛЬНОЕ ОКНО: ДОГОВОРЫ */}
      {activeModal === 'contracts' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            <h2>📑 Договоры на оказание услуг</h2>
            <div className="contracts-list">
              <table className="data-table">
                <thead>
                  <tr><th>Номер</th><th>Пациент</th><th>Дата</th><th>Сумма</th><th>Статус оплаты</th><th>Действия</th></tr>
                </thead>
                <tbody>
                  {contracts.map(contract => {
                    const patient = patients.find(p => p.id === contract.patientId);
                    return (
                      <tr key={contract.id}>
                        <td><strong>{contract.number}</strong></td>
                        <td>{patient?.fio || 'Неизвестно'}</td>
                        <td>{contract.date}</td>
                        <td>{contract.totalAmount} ₽</td>
                        <td><span className={`payment-status ${contract.paymentStatus}`}>{contract.paymentStatus}</span></td>
                        <td>
                          <button className="btn-small" onClick={() => generateContractPDF(contract)}>📄 Просмотреть</button>
                          <button className="btn-small btn-secondary" onClick={() => {
                            const newStatus = contract.paymentStatus === 'оплачено' ? 'не оплачено' : 'оплачено';
                            const updatedContracts = contracts.map(c => c.id === contract.id ? {...c, paymentStatus: newStatus} : c);
                            setContracts(updatedContracts);
                            alert(`Статус оплаты изменен на "${newStatus}"`);
                          }}>💳 Изменить статус</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="create-contract">
              <h3>Создать новый договор</h3>
              <div className="form-row">
                <select value={selectedPatient?.id || ''} onChange={(e) => { const patient = patients.find(p => p.id === parseInt(e.target.value)); setSelectedPatient(patient); }} style={{flex: 2}}>
                  <option value="">Выберите пациента</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.fio}</option>)}
                </select>
                <div style={{flex: 1}}>
                  <p>Выбрано услуг: {selectedServices.length}</p>
                  <p>Общая сумма: {selectedServices.reduce((sum, s) => sum + s.price, 0)} ₽</p>
                </div>
              </div>
              <button className="btn-primary" onClick={handleAddContract} disabled={!selectedPatient || selectedServices.length === 0}>
                📝 Создать договор
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* МОДАЛЬНОЕ ОКНО: ОТЧЕТЫ */}
      {activeModal === 'reports' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            <h2>📊 Отчеты и статистика</h2>
            <div className="reports-dashboard">
              <div className="reports-grid">
                <div className="report-card" onClick={() => handleGenerateReport('patients')}>
                  <h3>👥 Отчет по пациентам</h3>
                  <p>Демография, возрастные группы, заболевания</p>
                </div>
                <div className="report-card" onClick={() => handleGenerateReport('financial')}>
                  <h3>💰 Финансовый отчет</h3>
                  <p>Доходы по услугам, оплаты, долги</p>
                </div>
                <div className="report-card" onClick={() => handleGenerateReport('appointments')}>
                  <h3>📅 Отчет по приемам</h3>
                  <p>Загрузка врачей, статистика посещений</p>
                </div>
                <div className="report-card" onClick={() => {
                  const stats = {
                    totalPatients: patients.length,
                    totalServices: services.length,
                    totalContracts: contracts.length,
                    totalRevenue: contracts.reduce((sum, c) => sum + (c.totalAmount || 0), 0),
                    date: new Date().toLocaleDateString()
                  };
                  alert(`Быстрая статистика:\n\nПациентов: ${stats.totalPatients}\nУслуг: ${stats.totalServices}\nДоговоров: ${stats.totalContracts}\nВыручка: ${stats.totalRevenue} ₽`);
                }}>
                  <h3>⚡ Быстрая статистика</h3>
                  <p>Ключевые показатели системы</p>
                </div>
              </div>
              <div className="custom-report">
                <h3>Настраиваемый отчет</h3>
                <div className="form-row">
                  <select><option>Выберите тип отчета</option><option>По пациентам</option><option>По услугам</option><option>По врачам</option></select>
                  <input type="date" placeholder="Дата с" /><input type="date" placeholder="Дата по" />
                </div>
                <button className="btn-primary">Сгенерировать отчет</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* МОДАЛЬНОЕ ОКНО: УПРАВЛЕНИЕ ДАННЫМИ */}
      {activeModal === 'dataManagement' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            <h2>💾 Управление данными</h2>
            <div className="data-management">
              <div className="data-section">
                <h3>📤 Экспорт данных</h3>
                <p>Скачайте полную резервную копию базы данных в формате JSON</p>
                <button className="btn-primary" onClick={handleExportDatabase}>Экспортировать базу данных</button>
                {exportInfo && (
                  <div className="export-info">
                    <p><strong>Файл:</strong> {exportInfo.filename}</p>
                    <p><strong>Размер:</strong> {(exportInfo.size / 1024).toFixed(2)} KB</p>
                    <p><strong>Записей:</strong> {exportInfo.records.patients} пациентов, {exportInfo.records.services} услуг</p>
                  </div>
                )}
              </div>
              <div className="data-section">
                <h3>📥 Импорт данных</h3>
                <p>Загрузите базу данных из JSON-файла</p>
                <div className="file-upload">
                  <input type="file" accept=".json" onChange={handleFileUpload} id="fileInput" />
                  <label htmlFor="fileInput">📁 Выбрать JSON файл</label>
                </div>
                <textarea value={importData} onChange={(e) => setImportData(e.target.value)} placeholder='Вставьте JSON данные здесь или выберите файл...' rows={8} />
                <button className="btn-primary" onClick={handleImportDatabase} disabled={!importData.trim()}>Импортировать данные</button>
                <div className="json-example">
                  <h4>Пример структуры данных:</h4>
                  <pre>{`{
  "patients": [
    {
      "fio": "Фамилия Имя Отчество",
      "birthDate": "1990-01-15",
      "gender": "М",
      "phone": "+7(999)123-45-67",
      "insurance": "ОМС"
    }
  ]
}`}</pre>
                </div>
              </div>
              <div className="data-section">
                <h3>📊 Генерация отчетов</h3>
                <div className="reports-grid">
                  <div className="report-card" onClick={() => handleGenerateReport('patients')}><h4>👥 Отчет по пациентам</h4><p>Демография, возрастные группы</p></div>
                  <div className="report-card" onClick={() => handleGenerateReport('financial')}><h4>💰 Финансовый отчет</h4><p>Доходы, услуги, платежи</p></div>
                  <div className="report-card" onClick={() => handleGenerateReport('appointments')}><h4>📅 Отчет по записям</h4><p>Статистика посещений</p></div>
                  <div className="report-card" onClick={() => {
                    const csvData = [['Дата', 'Пациент', 'Услуга', 'Стоимость', 'Статус'], ...appointments.map(a => {
                      const patient = patients.find(p => p.id === a.patientId);
                      const service = services.find(s => s.id === a.serviceId);
                      return [a.date, patient?.fio || 'Неизвестно', service?.name || 'Неизвестно', service?.price || 0, a.status];
                    })].map(row => row.join(',')).join('\n');
                    const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `appointments_report_${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                  }}><h4>📈 Ежемесячный отчет</h4><p>Сводная статистика</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* МОДАЛЬНОЕ ОКНО: РЕЗУЛЬТАТЫ ОТЧЕТА */}
      {activeModal === 'reportResults' && reportResults && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            <h2>📊 Результаты отчета</h2>
            <div className="report-results">
              <h3>Отчет: {reportResults.type}</h3>
              <p>Сгенерирован: {new Date(reportResults.generatedAt).toLocaleString()}</p>
              {reportResults.type === 'patients' && (
                <div>
                  <p><strong>Всего пациентов:</strong> {reportResults.total}</p>
                  <p><strong>Мужчин:</strong> {reportResults.genderDistribution.male}</p>
                  <p><strong>Женщин:</strong> {reportResults.genderDistribution.female}</p>
                  <h4>Возрастные группы:</h4>
                  <ul>
                    {Object.entries(reportResults.ageGroups).map(([group, count]) => <li key={group}>{group} лет: {count} пациентов</li>)}
                  </ul>
                </div>
              )}
              {reportResults.type === 'financial' && (
                <div>
                  <p><strong>Общая выручка:</strong> {reportResults.totalRevenue} ₽</p>
                  <p><strong>Количество записей:</strong> {reportResults.totalAppointments}</p>
                </div>
              )}
              <div className="download-info">
                <p>Отчет скачан как файл CSV с правильной кодировкой UTF-8.</p>
                <a href={reportResults.downloadUrl} download={reportResults.filename} className="download-link">📥 Скачать повторно</a>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* МОДАЛЬНОЕ ОКНО: ДЕТАЛИ ПАЦИЕНТА */}
      {activeModal === 'patientDetails' && activePatient && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            <h2>📋 Медицинская карта пациента</h2>
            <div className="patient-details">
              <div className="patient-header">
                <h3>{activePatient.fio}</h3>
                <p>Карта №: {activePatient.cardNumber}</p>
              </div>
              <div className="patient-info-grid">
                <div className="info-card">
                  <h4>Основная информация</h4>
                  <p><strong>Дата рождения:</strong> {activePatient.birthDate} ({activePatient.age} лет)</p>
                  <p><strong>Пол:</strong> {activePatient.gender}</p>
                  <p><strong>Телефон:</strong> {activePatient.phone}</p>
                  <p><strong>Email:</strong> {activePatient.email || 'не указан'}</p>
                </div>
                <div className="info-card">
                  <h4>Документы</h4>
                  <p><strong>СНИЛС:</strong> {activePatient.snils || 'не указан'}</p>
                  <p><strong>Страховка:</strong> {activePatient.insurance}</p>
                  <p><strong>Адрес:</strong> {activePatient.address || 'не указан'}</p>
                </div>
                <div className="info-card">
                  <h4>Медицинская информация</h4>
                  <p><strong>Группа крови:</strong> {activePatient.bloodType || 'не указана'}</p>
                  <p><strong>Аллергии:</strong> {activePatient.allergies?.join(', ') || 'нет'}</p>
                  <p><strong>Хронические заболевания:</strong> {activePatient.chronicDiseases?.join(', ') || 'нет'}</p>
                </div>
              </div>
              <div className="medical-history">
                <h4>История обращений</h4>
                {medicalRecords.filter(record => record.patientId === activePatient.id).map(record => (
                  <div key={record.id} className="medical-record">
                    <p><strong>{record.date}</strong> - {record.doctor} ({record.specialty})</p>
                    <p><strong>Диагноз:</strong> {record.diagnosis}</p>
                    <p><strong>Назначения:</strong> {record.treatment}</p>
                  </div>
                ))}
                {medicalRecords.filter(record => record.patientId === activePatient.id).length === 0 && <p>Записей о обращениях нет</p>}
              </div>
              <div className="patient-actions">
                <button className="btn-primary" onClick={() => { setSelectedPatient(activePatient); setActiveModal('appointments'); }}>📅 Записать на прием</button>
                <button className="btn-secondary" onClick={() => generateReferral(activePatient.id, 1, new Date().toISOString().split('T')[0], '10:00')}>📄 Создать направление</button>
                <button className="btn-secondary" onClick={() => setActiveModal('medicalRecords')}>📋 Медицинская карта</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <footer className="footer">
        <p>EMS System v2.1 • Полнофункциональная медицинская система • Данные хранятся локально</p>
        <p>Всего записей: {patients.length + appointments.length + medicalRecords.length}</p>
        <p>Для поддержки: support@ems-system.ru | Телефон: +7 (800) 123-45-67</p>
      </footer>
    </div>
  );
}