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
            const ratingStars = practice.rating
                ? `<div class="practice-rating">${'★'.repeat(practice.rating)}${'☆'.repeat(5 - practice.rating)}</div>`
                : '';
            const resourceLink = practice.favorite_resource
                ? `<a href="${practice.favorite_resource}" target="_blank" rel="noopener" class="practice-resource">Favorite resource →</a>`
                : '';
            html += `
                <div class="practice-card" data-practice-id="${practice.practice_id}">
                    <div class="practice-card-header">
                        <h4>${tradition?.name || practice.practice_id}</h4>
                        <button class="icon-button" onclick="editUserPractice('${practice.practice_id}')" title="Edit">✏️</button>
                    </div>
                    <p class="practice-origin">${tradition?.origin || ''}</p>
                    ${ratingStars}
                    ${practice.notes ? `<p class="practice-notes">${practice.notes}</p>` : ''}
                    ${resourceLink}
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
            document.getElementById('practiceNotes').value = data?.notes || '';
            document.getElementById('practiceResource').value = data?.favorite_resource || '';
            setStarRating(data?.rating || 0);

            modal.style.display = 'flex';
        });
}

// Set star rating display
function setStarRating(rating) {
    const ratingInput = document.getElementById('practiceRatingValue');
    const stars = document.querySelectorAll('#practiceRating .star');

    ratingInput.value = rating || '';

    stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
}

// Initialize star rating clicks
function initStarRating() {
    const container = document.getElementById('practiceRating');
    if (!container) return;

    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('star')) {
            const rating = parseInt(e.target.dataset.rating);
            setStarRating(rating);
        }
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
        rating: form.rating.value ? parseInt(form.rating.value) : null,
        notes: form.notes.value || null,
        favorite_resource: form.favorite_resource.value || null
    };

    await saveUserPractice(practiceData);
    closePracticeModal();
    loadUserPractices();
}

// ============ Profile Settings ============

// Show profile settings modal
async function showProfileSettings() {
    const modal = document.getElementById('profileSettingsModal');
    if (!modal || !currentUser) return;

    // Load current profile data
    const { data } = await supabase
        .from('profiles')
        .select('display_name, bio, personal_url')
        .eq('id', currentUser.id)
        .single();

    document.getElementById('settingsDisplayName').value = data?.display_name || currentUser.user_metadata?.display_name || '';
    document.getElementById('settingsBio').value = data?.bio || '';
    document.getElementById('settingsPersonalUrl').value = data?.personal_url || '';

    modal.style.display = 'flex';
}

// Close profile settings modal
function closeProfileSettings() {
    document.getElementById('profileSettingsModal').style.display = 'none';
}

// Handle profile settings form submit
async function handleProfileSettingsSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: currentUser.id,
            display_name: form.display_name.value || null,
            bio: form.bio.value || null,
            personal_url: form.personal_url.value || null,
            updated_at: new Date().toISOString()
        });

    if (error) {
        showNotification('Error saving profile: ' + error.message, 'error');
        return;
    }

    showNotification('Profile saved!', 'success');
    closeProfileSettings();
    updateProfileDisplay();
}

// Update profile display after changes
async function updateProfileDisplay() {
    if (!currentUser) return;

    const { data } = await supabase
        .from('profiles')
        .select('display_name, bio, personal_url')
        .eq('id', currentUser.id)
        .single();

    const displayNameEl = document.getElementById('userDisplayName');
    const bioEl = document.getElementById('userBio');
    const personalUrlEl = document.getElementById('userPersonalUrl');

    if (displayNameEl) {
        displayNameEl.textContent = data?.display_name || currentUser.user_metadata?.display_name || currentUser.email;
    }

    if (bioEl) {
        bioEl.textContent = data?.bio || '';
        bioEl.style.display = data?.bio ? 'block' : 'none';
    }

    if (personalUrlEl) {
        if (data?.personal_url) {
            personalUrlEl.href = data.personal_url;
            personalUrlEl.style.display = 'inline';
        } else {
            personalUrlEl.style.display = 'none';
        }
    }
}

// ============ Delete Account ============

// Confirm delete account
function confirmDeleteAccount() {
    if (confirm('Are you sure you want to delete your account? This will permanently delete all your practice data and cannot be undone.')) {
        deleteAccount();
    }
}

// Delete account and all data
async function deleteAccount() {
    if (!currentUser) return;

    try {
        // Delete user practices
        await supabase
            .from('user_practices')
            .delete()
            .eq('user_id', currentUser.id);

        // Delete practice logs
        await supabase
            .from('practice_logs')
            .delete()
            .eq('user_id', currentUser.id);

        // Delete profile
        await supabase
            .from('profiles')
            .delete()
            .eq('id', currentUser.id);

        // Sign out
        await signOut();

        closeProfileSettings();
        showNotification('Account deleted successfully', 'success');

        // Navigate to home
        document.getElementById('quizView').click();
    } catch (error) {
        showNotification('Error deleting account: ' + error.message, 'error');
    }
}

// ============ Share Profile ============

// Share profile - copy link to clipboard
function shareProfile() {
    if (!currentUser) return;

    const shareUrl = `${window.location.origin}/profile?user=${currentUser.id}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
        showNotification('Profile link copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        prompt('Copy this link to share your profile:', shareUrl);
    });
}

// Load shared profile (when viewing someone else's profile)
async function loadSharedProfile(userId) {
    const { data: practices, error } = await supabase
        .from('user_practices')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (error || !practices?.length) {
        document.getElementById('sharedProfileView').innerHTML = `
            <div class="empty-state">
                <p>This profile is empty or doesn't exist.</p>
                <a href="/profile" onclick="document.getElementById('profileView').click(); return false;">Create your own profile</a>
            </div>
        `;
        return;
    }

    // Get profile info
    const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, bio, personal_url')
        .eq('id', userId)
        .single();

    const nameEl = document.getElementById('sharedProfileName');
    nameEl.textContent = profile?.display_name || 'Anonymous User';

    // Add bio and personal URL after the name
    let extraInfo = '';
    if (profile?.bio) {
        extraInfo += `<p style="color: #666; margin: 0.25rem 0 0 0; font-size: 0.95rem;">${profile.bio}</p>`;
    }
    if (profile?.personal_url) {
        extraInfo += `<a href="${profile.personal_url}" target="_blank" rel="noopener" style="font-size: 0.85rem; color: var(--secondary);">Personal link →</a>`;
    }
    nameEl.insertAdjacentHTML('afterend', extraInfo);

    renderSharedPractices(practices);
}

// Render shared practices (read-only view)
function renderSharedPractices(practices) {
    const container = document.getElementById('sharedPracticesList');
    if (!container) return;

    const grouped = {
        experienced: practices.filter(p => p.status === 'experienced'),
        practicing: practices.filter(p => p.status === 'practicing'),
        learning: practices.filter(p => p.status === 'learning'),
        interested: practices.filter(p => p.status === 'interested')
    };

    let html = '';
    const statusLabels = {
        experienced: 'Experienced',
        practicing: 'Currently Practicing',
        learning: 'Learning',
        interested: 'Interested'
    };

    for (const [status, items] of Object.entries(grouped)) {
        if (items.length === 0) continue;

        html += `<div class="practice-group">
            <h3>${statusLabels[status]} (${items.length})</h3>
            <div class="practice-cards">`;

        for (const practice of items) {
            const tradition = traditionsData?.traditions?.find(t => t.id === practice.practice_id);
            const ratingStars = practice.rating
                ? `<div class="practice-rating">${'★'.repeat(practice.rating)}${'☆'.repeat(5 - practice.rating)}</div>`
                : '';
            const resourceLink = practice.favorite_resource
                ? `<a href="${practice.favorite_resource}" target="_blank" rel="noopener" class="practice-resource">Favorite resource →</a>`
                : '';
            html += `
                <div class="practice-card">
                    <h4>${tradition?.name || practice.practice_id}</h4>
                    <p class="practice-origin">${tradition?.origin || ''}</p>
                    ${ratingStars}
                    ${practice.notes ? `<p class="practice-notes">${practice.notes}</p>` : ''}
                    ${resourceLink}
                </div>
            `;
        }

        html += '</div></div>';
    }

    container.innerHTML = html;
}

// Check for shared profile on page load
function checkForSharedProfile() {
    const params = new URLSearchParams(window.location.search);
    const sharedUserId = params.get('user');

    if (sharedUserId && window.location.pathname === '/profile') {
        // Hide other sections, show shared view
        document.getElementById('profileLoggedOut').style.display = 'none';
        document.getElementById('profileLoggedIn').style.display = 'none';
        document.getElementById('sharedProfileView').style.display = 'block';

        loadSharedProfile(sharedUserId);
        return true;
    }
    return false;
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

// Track bulk edits
let bulkPracticeEdits = {};

// Show add practice modal with table
async function showAddPracticeSelect() {
    const modal = document.getElementById('addPracticeModal');
    const tbody = document.getElementById('practiceListBody');
    const searchInput = document.getElementById('practiceSearchInput');

    if (!modal || !tbody || !traditionsData?.traditions) return;

    // Clear search and reset edits
    if (searchInput) searchInput.value = '';
    bulkPracticeEdits = {};

    // Load existing user practices to pre-fill
    let existingPractices = {};
    if (currentUser) {
        const { data } = await supabase
            .from('user_practices')
            .select('practice_id, status, notes')
            .eq('user_id', currentUser.id);

        if (data) {
            existingPractices = data.reduce((acc, p) => {
                acc[p.practice_id] = p;
                return acc;
            }, {});
        }
    }

    // Populate table
    renderPracticeList(traditionsData.traditions, existingPractices);
    updateSelectedCount();

    modal.style.display = 'flex';
}

// Render practice list table with inline editing
function renderPracticeList(practices, existingPractices = {}) {
    const tbody = document.getElementById('practiceListBody');
    if (!tbody) return;

    tbody.innerHTML = practices.map(t => {
        const existing = existingPractices[t.id] || bulkPracticeEdits[t.id] || {};
        const status = existing.status || '';
        const notes = existing.notes || '';

        return `
        <tr style="border-bottom: 1px solid var(--border);" data-practice-id="${t.id}">
            <td style="padding: 0.5rem; vertical-align: top;">
                <strong style="font-size: 0.9rem;">${t.name}</strong>
                <br><span style="font-size: 0.75rem; color: #888;">${t.origin || ''}</span>
            </td>
            <td style="padding: 0.5rem; vertical-align: top;">
                <select class="practice-status-select" data-practice="${t.id}" onchange="updateBulkEdit('${t.id}')" style="padding: 0.4rem; font-size: 0.85rem; width: 100%;">
                    <option value="">-- Select --</option>
                    <option value="interested" ${status === 'interested' ? 'selected' : ''}>Interested</option>
                    <option value="learning" ${status === 'learning' ? 'selected' : ''}>Learning</option>
                    <option value="practicing" ${status === 'practicing' ? 'selected' : ''}>Practicing</option>
                    <option value="experienced" ${status === 'experienced' ? 'selected' : ''}>Experienced</option>
                </select>
            </td>
            <td style="padding: 0.5rem; vertical-align: top;">
                <textarea class="practice-notes-input" data-practice="${t.id}" onchange="updateBulkEdit('${t.id}')" placeholder="Add notes..." rows="2" style="width: 100%; font-size: 0.85rem; padding: 0.4rem; resize: vertical; min-height: 40px;">${notes}</textarea>
            </td>
        </tr>
    `;
    }).join('');
}

// Update bulk edit tracking
function updateBulkEdit(practiceId) {
    const row = document.querySelector(`tr[data-practice-id="${practiceId}"]`);
    if (!row) return;

    const statusSelect = row.querySelector('.practice-status-select');
    const notesInput = row.querySelector('.practice-notes-input');

    const status = statusSelect?.value || '';
    const notes = notesInput?.value || '';

    if (status) {
        bulkPracticeEdits[practiceId] = { status, notes };
    } else {
        delete bulkPracticeEdits[practiceId];
    }

    updateSelectedCount();
}

// Update selected count display
function updateSelectedCount() {
    const countEl = document.getElementById('practicesSelectedCount');
    if (countEl) {
        const count = Object.keys(bulkPracticeEdits).length;
        countEl.textContent = `${count} practice${count !== 1 ? 's' : ''} selected`;
    }
}

// Save all bulk edited practices
async function saveBulkPractices() {
    const practiceIds = Object.keys(bulkPracticeEdits);

    if (practiceIds.length === 0) {
        showNotification('Select at least one practice to save', 'error');
        return;
    }

    if (!currentUser) {
        showAuthModal();
        return;
    }

    const saveBtn = document.querySelector('#addPracticeModal .primary-button');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
    }

    try {
        // Prepare all records
        const records = practiceIds.map(practiceId => ({
            user_id: currentUser.id,
            practice_id: practiceId,
            status: bulkPracticeEdits[practiceId].status,
            notes: bulkPracticeEdits[practiceId].notes || null,
            updated_at: new Date().toISOString()
        }));

        const { error } = await supabase
            .from('user_practices')
            .upsert(records, { onConflict: 'user_id,practice_id' });

        if (error) throw error;

        showNotification(`Saved ${practiceIds.length} practice${practiceIds.length !== 1 ? 's' : ''}!`, 'success');
        closeAddPracticeModal();
        loadUserPractices();
    } catch (error) {
        showNotification('Error saving: ' + error.message, 'error');
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Selected';
        }
    }
}

// Filter practice list by search
function filterPracticeList() {
    const searchInput = document.getElementById('practiceSearchInput');
    const query = searchInput?.value?.toLowerCase() || '';

    if (!traditionsData?.traditions) return;

    const filtered = traditionsData.traditions.filter(t =>
        t.name.toLowerCase().includes(query) ||
        (t.origin && t.origin.toLowerCase().includes(query)) ||
        (t.description && t.description.toLowerCase().includes(query))
    );

    // Get existing practices from current bulk edits
    renderPracticeList(filtered, bulkPracticeEdits);
}

// Close add practice modal
function closeAddPracticeModal() {
    document.getElementById('addPracticeModal').style.display = 'none';
    bulkPracticeEdits = {};
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

    // Update profile and practices if logged in
    if (isLoggedIn) {
        updateProfileDisplay();
        if (document.getElementById('profile-section')?.classList.contains('active')) {
            loadUserPractices();
        }
    }
}

// Initialize auth when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for supabase to be available
    setTimeout(() => {
        if (typeof initAuth === 'function') {
            initAuth();
        }
        initStarRating();
    }, 100);
});
