const SUPABASE_URL = "https://wjuyociiiwhcqlumzktt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_k3zT_oxIuk3QmNVdHx8Tww_tkYM2Fny";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Simple View Controller
function switchView(sectionId) {
    document.querySelectorAll('.view').forEach(sec => sec.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

// Handle Registration
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
        alert('Error: ' + error.message);
    } else {
        alert('Registration successful! Check your email if verification is required, or try logging in.');
        switchView('login-section');
    }
});

// Handle Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        alert('Error: ' + error.message);
    } else {
        switchView('dashboard-section');
    }
});

// Handle Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    switchView('login-section');
});
