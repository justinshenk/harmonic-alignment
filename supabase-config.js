// Supabase configuration
const SUPABASE_URL = 'https://cafildwzckpoyvieyyyy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZmlsZHd6Y2twb3l2aWV5eXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTE5NjIsImV4cCI6MjA3OTcyNzk2Mn0.KCOVP3TbA03V_04y-OJvHTU5kYYS4jc_ZEWDSsd6fD4';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth state
let currentUser = null;

// Initialize auth state
async function initAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        currentUser = session.user;
        updateAuthUI(true);
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
        currentUser = session?.user || null;
        updateAuthUI(!!session);

        if (event === 'SIGNED_IN') {
            closeAuthModal();
            showNotification('Signed in successfully!');
        } else if (event === 'SIGNED_OUT') {
            showNotification('Signed out');
        }
    });
}

// Sign up with email
async function signUp(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { display_name: displayName }
        }
    });

    if (error) throw error;
    return data;
}

// Sign in with email
async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;
    return data;
}

// Sign out
async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

// Sign in with OAuth (Google, GitHub)
async function signInWithOAuth(provider) {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: window.location.origin
        }
    });

    if (error) throw error;
    return data;
}

// Update UI based on auth state
function updateAuthUI(isLoggedIn) {
    const authButton = document.getElementById('authButton');
    const profileNav = document.getElementById('profileView');

    if (authButton) {
        authButton.textContent = isLoggedIn ? 'Sign Out' : 'Sign In';
        authButton.onclick = isLoggedIn ? handleSignOut : showAuthModal;
    }

    if (profileNav) {
        profileNav.style.display = isLoggedIn ? 'inline-block' : 'none';
    }

    // Refresh My Practices if on that view
    if (isLoggedIn && document.getElementById('profile-section')?.classList.contains('active')) {
        loadUserPractices();
    }
}

// Show auth modal
function showAuthModal(mode = 'signin') {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
        switchAuthMode(mode);
    }
}

// Close auth modal
function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Switch between signin/signup
function switchAuthMode(mode) {
    document.getElementById('signinForm').style.display = mode === 'signin' ? 'block' : 'none';
    document.getElementById('signupForm').style.display = mode === 'signup' ? 'block' : 'none';
    document.getElementById('authModeSignin').classList.toggle('active', mode === 'signin');
    document.getElementById('authModeSignup').classList.toggle('active', mode === 'signup');
}

// Handle sign in form
async function handleSignIn(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    const submitBtn = form.querySelector('button[type="submit"]');

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';
        await signIn(email, password);
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
    }
}

// Handle sign up form
async function handleSignUp(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    const displayName = form.displayName?.value || '';
    const submitBtn = form.querySelector('button[type="submit"]');

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';
        await signUp(email, password, displayName);
        showNotification('Check your email to confirm your account!', 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';
    }
}

// Handle sign out
async function handleSignOut() {
    try {
        await signOut();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============ User Practices ============

// Load user's practices
async function loadUserPractices() {
    if (!currentUser) return;

    const { data, error } = await supabase
        .from('user_practices')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error loading practices:', error);
        return;
    }

    renderUserPractices(data);
}

// Save/update user practice
async function saveUserPractice(practiceData) {
    if (!currentUser) {
        showAuthModal();
        return;
    }

    const { data, error } = await supabase
        .from('user_practices')
        .upsert({
            user_id: currentUser.id,
            ...practiceData,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id,practice_id'
        })
        .select();

    if (error) {
        showNotification('Error saving practice: ' + error.message, 'error');
        return null;
    }

    showNotification('Practice saved!', 'success');
    return data;
}

// Remove user practice
async function removeUserPractice(practiceId) {
    if (!currentUser) return;

    const { error } = await supabase
        .from('user_practices')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('practice_id', practiceId);

    if (error) {
        showNotification('Error removing practice: ' + error.message, 'error');
        return;
    }

    showNotification('Practice removed', 'success');
    loadUserPractices();
}

// Render user practices
function renderUserPractices(practices) {
    const container = document.getElementById('userPracticesList');
    if (!container) return;

    if (!practices || practices.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>You haven't added any practices yet.</p>
                <p>Browse the <a href="/compare" onclick="document.getElementById('compareView').click(); return false;">Compare</a> section to add practices to your profile.</p>
            </div>
        `;
        return;
    }

    // Group by status
    const grouped = {
        experienced: practices.filter(p => p.status === 'experienced'),
        practicing: practices.filter(p => p.status === 'practicing'),
        learning: practices.filter(p => p.status === 'learning'),
        interested: practices.filter(p => p.status === 'interested')
    };

    let html = '';

    for (const [status, items] of Object.entries(grouped)) {
        if (items.length === 0) continue;

        const statusLabels = {
            experienced: 'Experienced',
            practicing: 'Currently Practicing',
            learning: 'Learning',
            interested: 'Interested'
        };

        html += `<div class="practice-group">
            <h3>${statusLabels[status]} (${items.length})</h3>
            <div class="practice-cards">`;

        for (const practice of items) {
            const tradition = traditionsData?.traditions?.find(t => t.id === practice.practice_id);
            html += `
                <div class="practice-card" data-practice-id="${practice.practice_id}">
                    <div class="practice-card-header">
                        <h4>${tradition?.name || practice.practice_id}</h4>
                        <button class="icon-button" onclick="editUserPractice('${practice.practice_id}')" title="Edit">✏️</button>
                    </div>
                    <p class="practice-origin">${tradition?.origin || ''}</p>
                    ${practice.effectiveness_overall ? `
                        <div class="effectiveness-badge">
                            Overall: ${practice.effectiveness_overall}/5
                        </div>
                    ` : ''}
                    ${practice.notes ? `<p class="practice-notes">${practice.notes}</p>` : ''}
                </div>
            `;
        }

        html += '</div></div>';
    }

    container.innerHTML = html;
}

// Show add/edit practice modal
function editUserPractice(practiceId) {
    const modal = document.getElementById('practiceModal');
    const tradition = traditionsData?.traditions?.find(t => t.id === practiceId);

    if (!modal || !tradition) return;

    // Load existing data if any
    supabase
        .from('user_practices')
        .select('*')
        .eq('user_id', currentUser?.id)
        .eq('practice_id', practiceId)
        .single()
        .then(({ data }) => {
            document.getElementById('practiceModalTitle').textContent = tradition.name;
            document.getElementById('practiceModalId').value = practiceId;
            document.getElementById('practiceStatus').value = data?.status || 'interested';
            document.getElementById('practiceEffectivenessOverall').value = data?.effectiveness_overall || '';
            document.getElementById('practiceEffectivenessAnxiety').value = data?.effectiveness_anxiety || '';
            document.getElementById('practiceEffectivenessFocus').value = data?.effectiveness_focus || '';
            document.getElementById('practiceEffectivenessMood').value = data?.effectiveness_mood || '';
            document.getElementById('practiceNotes').value = data?.notes || '';

            modal.style.display = 'flex';
        });
}

// Close practice modal
function closePracticeModal() {
    document.getElementById('practiceModal').style.display = 'none';
}

// Handle practice form submit
async function handlePracticeSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const practiceData = {
        practice_id: form.practiceId.value,
        status: form.status.value,
        effectiveness_overall: form.effectivenessOverall.value || null,
        effectiveness_anxiety: form.effectivenessAnxiety.value || null,
        effectiveness_focus: form.effectivenessFocus.value || null,
        effectiveness_mood: form.effectivenessMood.value || null,
        notes: form.notes.value || null
    };

    await saveUserPractice(practiceData);
    closePracticeModal();
    loadUserPractices();
}

// Add practice from compare view
function addToMyPractices(practiceId) {
    if (!currentUser) {
        showAuthModal();
        return;
    }
    editUserPractice(practiceId);
}

// ============ Add Practice Helpers ============

// Show add practice select modal
function showAddPracticeSelect() {
    const modal = document.getElementById('addPracticeModal');
    const select = document.getElementById('addPracticeSelect');

    if (!modal || !select || !traditionsData?.traditions) return;

    // Populate select with traditions
    select.innerHTML = '<option value="">Choose a practice...</option>';
    traditionsData.traditions.forEach(t => {
        select.innerHTML += `<option value="${t.id}">${t.name} (${t.origin})</option>`;
    });

    modal.style.display = 'flex';
}

// Close add practice modal
function closeAddPracticeModal() {
    document.getElementById('addPracticeModal').style.display = 'none';
}

// Add selected practice
function addSelectedPractice() {
    const select = document.getElementById('addPracticeSelect');
    const practiceId = select.value;

    if (!practiceId) {
        showNotification('Please select a practice', 'error');
        return;
    }

    closeAddPracticeModal();
    editUserPractice(practiceId);
}

// ============ Auth UI Helpers ============

// Update UI for logged in state
function updateAuthUI(isLoggedIn) {
    const authButton = document.getElementById('authButton');
    const profileNav = document.getElementById('profileView');
    const profileLoggedOut = document.getElementById('profileLoggedOut');
    const profileLoggedIn = document.getElementById('profileLoggedIn');
    const userDisplayName = document.getElementById('userDisplayName');

    if (authButton) {
        authButton.textContent = isLoggedIn ? 'Sign Out' : 'Sign In';
        authButton.onclick = isLoggedIn ? handleSignOut : () => showAuthModal('signin');
    }

    if (profileNav) {
        profileNav.style.display = isLoggedIn ? 'inline-block' : 'none';
    }

    if (profileLoggedOut) {
        profileLoggedOut.style.display = isLoggedIn ? 'none' : 'block';
    }

    if (profileLoggedIn) {
        profileLoggedIn.style.display = isLoggedIn ? 'block' : 'none';
    }

    if (userDisplayName && currentUser) {
        userDisplayName.textContent = currentUser.user_metadata?.display_name || currentUser.email;
    }

    // Refresh My Practices if on that view
    if (isLoggedIn && document.getElementById('profile-section')?.classList.contains('active')) {
        loadUserPractices();
    }
}

// Initialize auth when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for supabase to be available
    setTimeout(() => {
        if (typeof initAuth === 'function') {
            initAuth();
        }
    }, 100);
});
