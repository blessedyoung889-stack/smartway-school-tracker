// Initialize Supabase Client
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Navigation & View Controller
function switchView(viewId) {
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
}

// Event Listeners for Navigation
document.getElementById('go-to-register').addEventListener('click', (e) => {
    e.preventDefault();
    switchView('register-view');
});

document.getElementById('go-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    switchView('login-view');
});

// Handle Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        alert("Login failed: " + error.message);
    } else {
        switchView('dashboard-view');
        loadDashboardStats();
    }
});

// Handle Admin Registration
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const name = document.getElementById('reg-name').value;
    const school = document.getElementById('reg-school').value;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name, school_name: school } }
    });

    if (error) {
        alert("Error creating account: " + error.message);
    } else {
        alert("Account created successfully! Please sign in.");
        switchView('login-view');
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    switchView('login-view');
});

// Fetch Data from Supabase
async function loadDashboardStats() {
    const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

    if (!error && count !== null) {
        document.getElementById('total-count').innerText = count;
    }
}
