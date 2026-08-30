// SUPABASE CONFIGURATION
const SUPABASE_URL = "https://wjuyociiiwhcqlumzktt.supabase.co";
const SUPABASE_KEY = "sb_publishable_k3zT_oxIuk3QmNVdHx8Tww_tkYM2Fny"; 

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// LOCAL FALLBACK DATA
const DB = {
  get: (key, fallback) => {
    const d = localStorage.getItem('smartway_' + key);
    return d ? JSON.parse(d) : fallback;
  },
  set: (key, val) => localStorage.setItem('smartway_' + key, JSON.stringify(val))
};

let students = DB.get('students', [
  { id: 'SCH-2026-1001', name: 'Blessing Chipunza', gender: 'Male', class: 'Form 1A', guardian: 'John Chipunza', phone: '+263771234567', emergency: '+263770000000', health: 'Asthma', status: 'Active' },
  { id: 'SCH-2026-1002', name: 'Tehilia Letalo', gender: 'Female', class: 'Form 1A', guardian: 'Sarah Letalo', phone: '+263772345678', emergency: '+263771111111', health: 'None', status: 'Active' }
]);

let teachers = DB.get('teachers', [
  { id: 'TCH-101', name: 'Mr. David Moyo', phone: '+263773456789', class: 'Form 1A', username: 'teacher', password: 'teacher123', status: 'Active', present: true }
]);

let classes = DB.get('classes', [
  { name: 'Form 1A', teacher: 'Mr. David Moyo' },
  { name: 'Form 2A', teacher: 'Unassigned' }
]);

let attendance = DB.get('attendance', [
  { student_id: 'SCH-2026-1001', name: 'Blessing Chipunza', class: 'Form 1A', arrival: '07:10 AM', departure: '--', status: 'Present', date: new Date().toLocaleDateString() },
  { student_id: 'SCH-2026-1002', name: 'Tehilia Letalo', class: 'Form 1A', arrival: '07:35 AM', departure: '--', status: 'Late', date: new Date().toLocaleDateString() }
]);

let activeTeacher = teachers[0];

function saveData() {
  DB.set('students', students);
  DB.set('teachers', teachers);
  DB.set('classes', classes);
  DB.set('attendance', attendance);
}

function switchPortal(targetId, btn) {
  document.querySelectorAll('.login-form-box').forEach(f => f.classList.remove('active'));
  document.querySelectorAll('.portal-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(targetId).classList.add('active');
  if(btn) btn.classList.add('active');
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  if (pageId === 'gate-dashboard') loadGateDashboard();
}

function adminLogin(e) {
  e.preventDefault();
  if (document.getElementById("loginUsername").value.trim() === 'admin' && document.getElementById("loginPassword").value.trim() === 'admin123') {
    showPage('admin-dashboard');
    showAdminTab('overview');
  } else {
    alert('Invalid Credentials!');
  }
}

function teacherLogin(e) {
  e.preventDefault();
  const u = document.getElementById("teacherUsername").value.trim();
  const p = document.getElementById("teacherPassword").value.trim();
  const found = teachers.find(t => t.username === u && t.password === p && t.status === 'Active');
  if (found) {
    activeTeacher = found;
    document.getElementById("teacherWelcome").innerText = "Welcome, " + activeTeacher.name;
    document.getElementById("teacherAssignedClass").innerText = "Assigned Class: " + activeTeacher.class;
    showPage('teacher-dashboard');
    showTeacherTab('thome');
  } else {
    alert('Invalid Teacher Credentials!');
  }
}

function gateLogin(e) {
  e.preventDefault();
  if (document.getElementById("gateUsername").value.trim() === 'gate' && document.getElementById("gatePassword").value.trim() === 'gate123') {
    showPage('gate-dashboard');
  } else {
    alert('Invalid Gate Credentials!');
  }
}

function createAdmin(e) {
  e.preventDefault();
  alert('Account Created!');
  showPage('admin-dashboard');
  showAdminTab('overview');
}

function switchAdminTab(el, tab) {
  document.querySelectorAll('#admin-dashboard .slide-opt').forEach(o => o.classList.remove('active'));
  if (el) el.classList.add('active');
  showAdminTab(tab);
}

function showAdminTab(tab) {
  const area = document.getElementById("admin-content");
  const todayDate = new Date().toLocaleDateString();
  const todayAtt = attendance.filter(a => a.date === todayDate);

  if (tab === 'overview') {
    const presentCount = todayAtt.filter(a => a.status === 'Present').length;
    const lateCount = todayAtt.filter(a => a.status === 'Late').length;
    const totalStudents = students.filter(s => s.status === 'Active').length;
    const absentCount = Math.max(0, totalStudents - (presentCount + lateCount));
    const attPercentage = totalStudents > 0 ? (((presentCount + lateCount) / totalStudents) * 100).toFixed(1) : 0;

    area.innerHTML = `
      <div class="white-card">
        <h3>📊 System Overview (${todayDate})</h3>
        <div class="stats">
          <div class="stat" style="background:#e0f2fe;"><h3>Total Students</h3><p>${totalStudents}</p></div>
          <div class="stat" style="background:#fef3c7;"><h3>Total Teachers</h3><p>${teachers.length}</p></div>
          <div class="stat" style="background:#dcfce7;"><h3>Present</h3><p>${presentCount}</p></div>
          <div class="stat" style="background:#fee2e2;"><h3>Absent</h3><p>${absentCount}</p></div>
          <div class="stat" style="background:#ffedd5;"><h3>Late</h3><p>${lateCount}</p></div>
          <div class="stat" style="background:#f3e8ff;"><h3>Rate</h3><p>${attPercentage}%</p></div>
        </div>
      </div>`;
  } else if (tab === 'students') {
    renderStudentManagement(area);
  } else if (tab === 'classes') {
    renderClassManagement(area);
  } else if (tab === 'faculty') {
    renderFacultyManagement(area);
  } else if (tab === 'attendance-logs') {
    renderAttendanceOverview(area);
  } else if (tab === 'class-analysis') {
    renderClassAnalysis(area);
  } else if (tab === 'time-analysis') {
    renderTimeAnalysis(area);
  }
}

function renderStudentManagement(container) {
  let rows = students.map((s, idx) => `
    <tr>
      <td>${s.id}</td><td><strong>${s.name}</strong></td><td>${s.class}</td><td>${s.gender}</td>
      <td>${s.guardian} (${s.phone})</td><td><span class="badge badge-red">${s.health || 'None'}</span></td>
      <td><span class="badge ${s.status === 'Active' ? 'badge-green' : 'badge-red'}">${s.status}</span></td>
      <td><button class="btn btn-blue" style="padding:2px 6px;font-size:10px;" onclick="viewStudentQR('${s.id}')">QR</button></td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div class="white-card">
      <h3>Register Student</h3>
      <form onsubmit="addStudent(event)">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;">
          <div class="form-group"><label>Full Name</label><input id="regName" class="form-control" required></div>
          <div class="form-group"><label>Gender</label><select id="regGender" class="form-control"><option>Male</option><option>Female</option></select></div>
          <div class="form-group"><label>Class</label><select id="regClass" class="form-control">${classes.map(c=>`<option>${c.name}</option>`).join('')}</select></div>
          <div class="form-group"><label>Guardian Name</label><input id="regGuardian" class="form-control" required></div>
          <div class="form-group"><label>Guardian Phone</label><input id="regPhone" class="form-control" required></div>
          <div class="form-group"><label>Emergency Contact</label><input id="regEmergency" class="form-control" required></div>
          <div class="form-group"><label>Health Issues</label><input id="regHealth" class="form-control" required></div>
        </div>
        <button type="submit" class="btn btn-lime" style="width:100%;margin-top:8px;">Register to Supabase</button>
      </form>
    </div>
    <div class="white-card">
      <h3>Students Directory</h3>
      <div class="table-responsive">
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Class</th><th>Gender</th><th>Guardian</th><th>Health</th><th>Status</th><th>QR</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div><div id="qrModal"></div>`;
}

// REGISTER STUDENT DIRECTLY TO SUPABASE
async function addStudent(e) {
  e.preventDefault();
  const autoId = 'SCH-2026-' + Math.floor(1000 + Math.random() * 9000);
  
  const studentData = {
    id: autoId,
    name: document.getElementById('regName').value,
    gender: document.getElementById('regGender').value,
    class: document.getElementById('regClass').value,
    guardian: document.getElementById('regGuardian').value,
    phone: document.getElementById('regPhone').value,
    emergency: document.getElementById('regEmergency').value,
    health: document.getElementById('regHealth').value,
    status: 'Active'
  };

  students.push(studentData);
  saveData();

  try {
    const { data, error } = await supabaseClient
      .from('students')
      .insert([studentData]);

    if (error) {
      alert('Local save successful, but Supabase error: ' + error.message);
    } else {
      alert(`✅ Registered to Supabase Cloud!\nID: ${autoId}`);
    }
  } catch (err) {
    alert('Local save successful!\nSupabase sync alert: ' + err.message);
  }

  showAdminTab('students');
}

function viewStudentQR(id) {
  const s = students.find(x => x.id === id);
  document.getElementById('qrModal').innerHTML = `
    <div class="white-card" style="border:2px solid var(--lime);">
      <h3>Digital Pass</h3><p><strong>${s.name}</strong> (${s.id})</p>
      <div class="qr-box"><div style="width:100px;height:100px;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;">QR: ${s.id}</div></div>
    </div>`;
}

function renderClassManagement(container) {
  let rows = classes.map(c => `<tr><td><strong>${c.name}</strong></td><td>${c.teacher}</td></tr>`).join('');
  container.innerHTML = `
    <div class="white-card">
      <h3>Classes</h3>
      <div class="table-responsive"><table><thead><tr><th>Class</th><th>Teacher</th></tr></thead><tbody>${rows}</tbody></table></div>
    </div>`;
}

function renderFacultyManagement(container) {
  let rows = teachers.map(t => `<tr><td>${t.id}</td><td><strong>${t.name}</strong></td><td>${t.class}</td></tr>`).join('');
  container.innerHTML = `
    <div class="white-card">
      <h3>Faculty</h3>
      <div class="table-responsive"><table><thead><tr><th>ID</th><th>Name</th><th>Class</th></tr></thead><tbody>${rows}</tbody></table></div>
    </div>`;
}

function renderAttendanceOverview(container) {
  let rows = attendance.map(a => `<tr><td>${a.date}</td><td>${a.student_id}</td><td>${a.name}</td><td>${a.arrival}</td><td>${a.status}</td></tr>`).join('');
  container.innerHTML = `<div class="white-card"><h3>Attendance Logs</h3><div class="table-responsive"><table><thead><tr><th>Date</th><th>ID</th><th>Name</th><th>Time</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}

function renderClassAnalysis(container) {
  container.innerHTML = `<div class="white-card"><h3>Class Analysis</h3><div style="height:200px;"><canvas id="classChart"></canvas></div></div>`;
  setTimeout(() => {
    new Chart(document.getElementById('classChart'), {
      type: 'bar',
      data: { labels: ['Enrolled', 'Present', 'Absent'], datasets: [{ label: 'Students', data: [40, 37, 3], backgroundColor: ['#0284c7', '#16a34a', '#dc2626'] }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }, 100);
}

function renderTimeAnalysis(container) {
  container.innerHTML = `<div class="white-card"><h3>Time Analysis</h3><p>Earliest Arrival: 06:45 AM</p><p>Average Time: 07:12 AM</p></div>`;
}

function switchTeacherTab(el, tab) {
  document.querySelectorAll('#teacher-dashboard .slide-opt').forEach(o => o.classList.remove('active'));
  if (el) el.classList.add('active');
  showTeacherTab(tab);
}

function showTeacherTab(tab) {
  const area = document.getElementById("teacher-content");
  const myStudents = students.filter(s => s.class === activeTeacher.class);
  area.innerHTML = `<div class="white-card"><h3>${activeTeacher.class} Students</h3><p>Total: ${myStudents.length}</p></div>`;
}

function loadGateDashboard() {
  const area = document.getElementById("gate-content");
  area.innerHTML = `
    <div class="white-card">
      <h3>Gate Entry Scanner</h3>
      <form onsubmit="processGateEntry(event)">
        <div class="form-group"><label>Student ID</label><input id="gateInputId" class="form-control" required></div>
        <button type="submit" class="btn btn-green">Log Arrival</button>
      </form>
    </div>`;
}

function processGateEntry(e) {
  e.preventDefault();
  const inputId = document.getElementById('gateInputId').value.trim();
  const s = students.find(x => x.id === inputId);
  if (s) {
    attendance.push({ student_id: s.id, name: s.name, class: s.class, arrival: new Date().toLocaleTimeString(), departure: '--', status: 'Present', date: new Date().toLocaleDateString() });
    saveData();
    alert(`Entry logged for ${s.name}`);
  } else {
    alert('Unknown ID!');
  }
}

setInterval(() => {
  const timeStr = new Date().toLocaleTimeString();
  if (document.getElementById("admin-clock")) document.getElementById("admin-clock").innerText = timeStr;
  if (document.getElementById("teacher-clock")) document.getElementById("teacher-clock").innerText = timeStr;
}, 1000);
