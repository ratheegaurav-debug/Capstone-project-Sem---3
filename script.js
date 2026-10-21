// Initial Data & Seed State
var initialFolders = {
    "web-tech": { title: "Web Technology (HTML/CSS/JS)", about: "DOM tree, responsive styling, client-server models and scripts." },
    "databases": { title: "Database Management Systems", about: "SQL queries, relational algebra, normalization and indexes." },
    "dsa-java": { title: "Data Structures & Algorithms", about: "Arrays, linked lists, sorting algorithms and time complexity." },
    "operating-systems": { title: "Operating Systems", about: "Process scheduling, deadlocks, virtual memory and paging." }
};

var initialNotes = [
    {
        id: "note-1",
        title: "Java Fundamentals – Theory + Practice Questions",
        category: "Engineering",
        subject: "Data Structures & Algorithms",
        semester: "Sem 3",
        tags: "Java, Programming, DSA, Syntax, OOP",
        summary: "Comprehensive guide covering Java basics, main methods, print vs println, 8 primitive data types, arithmetic operators, user input via Scanner, typecasting, and bitwise/shift operators.",
        by: "Prof. Sharma",
        institution: "State Institute of Tech",
        date: "2026-03-10",
        downloads: 342,
        rating: 4.8,
        file: "Java_Fundamentals_DSA.pdf",
        pages: 30,
        size: "4.2 MB",
        reviews: [
            { user: "Rahul K.", rating: 5, comment: "Saved my grade for the midterm exam! Clear explanation of primitive data types and typecasting." },
            { user: "Priya M.", rating: 4.5, comment: "Very concise code examples for operators and Scanner input." }
        ]
    },
    {
        id: "note-2",
        title: "Web Development Fundamentals: HTML & CSS",
        category: "Engineering",
        subject: "Web Technology",
        semester: "Sem 2",
        tags: "HTML, CSS, DOM, Web Architecture, Semantic Tags",
        summary: "Detailed reference guide explaining web request lifecycles, DNS, static vs dynamic websites, HTML document structures, DOM trees, text formatting, lists, media embedding, and semantic elements.",
        by: "Aarav Gupta",
        institution: "Tech University",
        date: "2026-03-14",
        downloads: 512,
        rating: 4.9,
        file: "Web_Technology_HTML_CSS.pdf",
        pages: 18,
        size: "3.8 MB",
        reviews: [
            { user: "Sneha R.", rating: 5, comment: "The breakdown of client-server interaction and DOM trees is extremely clear." }
        ]
    },
    {
        id: "note-3",
        title: "Database Management Systems: Introduction, Data Types & TCL/SQL",
        category: "Engineering",
        subject: "Database Management Systems",
        semester: "Sem 3",
        tags: "DBMS, SQL, TCL, Data Types, Relational Databases",
        summary: "In-depth notes covering database foundations, SQL data types, Transaction Control Language (TCL) commands, table creation, constraints, and query management.",
        by: "Meera Nair",
        institution: "National College",
        date: "2026-03-18",
        downloads: 189,
        rating: 4.7,
        file: "Introduction_DataTypes_TCL_SQL.docx",
        pages: 14,
        size: "2.5 MB",
        reviews: []
    }
];

// LocalStorage Persistence
var notesList = localStorage.getItem("sn_notes") ? JSON.parse(localStorage.getItem("sn_notes")) : initialNotes;
var currentUser = localStorage.getItem("sn_user") ? JSON.parse(localStorage.getItem("sn_user")) : null;
var myDownloads = localStorage.getItem("sn_downloads") ? JSON.parse(localStorage.getItem("sn_downloads")) : [];
var myFavorites = localStorage.getItem("sn_favorites") ? JSON.parse(localStorage.getItem("sn_favorites")) : [];

var currentActiveTab = "home";
var currentSelectedNoteId = null;
var authModeIsSignup = false;
var currentReaderPage = 1;
var totalReaderPages = 1;

// Initialization on load
window.onload = function() {
    renderHomeFolders();
    renderTrendingNotes();
    updateAuthUI();
    applyFilters();
};

// Tab Switching
function switchTab(tabId) {
    var tabs = document.querySelectorAll(".tab-content");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active-tab");
    }
    var navBtns = document.querySelectorAll(".nav-btn");
    for (var j = 0; j < navBtns.length; j++) {
        navBtns[j].classList.remove("active");
    }

    document.getElementById("tab-" + tabId).classList.add("active-tab");
    currentActiveTab = tabId;

    if (tabId === 'dashboard') {
        renderDashboardData();
    }
    window.scrollTo(0, 0);
}

// Home Folders & Trending
function renderHomeFolders() {
    var container = document.getElementById("foldersContainer");
    container.innerHTML = "";
    for (var key in initialFolders) {
        var count = notesList.filter(n => n.subject.toLowerCase().includes(initialFolders[key].title.toLowerCase().substring(0, 5))).length;
        var div = document.createElement("div");
        div.className = "folder-item";
        div.setAttribute("onclick", "filterByFolderQuery('" + initialFolders[key].title + "')");
        div.innerHTML = `<h4><i class="fa-solid fa-folder"></i> ${initialFolders[key].title}</h4>` +
                        `<p>${initialFolders[key].about}</p>` +
                        `<div class="folder-files-count">${Math.max(count, 1)} file(s) available &gt;&gt;</div>`;
        container.appendChild(div);
    }
}

function renderTrendingNotes() {
    var container = document.getElementById("trendingNotesContainer");
    var sorted = [...notesList].sort((a,b) => b.downloads - a.downloads).slice(0, 4);
    renderNotesGrid(sorted, container);
}

// Explore & Filters
function applyFilters() {
    var keyword = document.getElementById("librarySearch").value.toLowerCase();
    var category = document.getElementById("filterCategory").value;
    var semester = document.getElementById("filterSemester").value;
    var sortBy = document.getElementById("sortBy").value;

    var filtered = notesList.filter(note => {
        var matchesText = note.title.toLowerCase().includes(keyword) || note.subject.toLowerCase().includes(keyword) || note.tags.toLowerCase().includes(keyword);
        var matchesCat = category === "" || note.category === category;
        var matchesSem = semester === "" || note.semester === semester;
        return matchesText && matchesCat && matchesSem;
    });

    if (sortBy === "downloads") {
        filtered.sort((a, b) => b.downloads - a.downloads);
    } else if (sortBy === "rating") {
        filtered.sort((a, b) => b.rating - a.rating);
    } else {
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    document.getElementById("exploreNotesCount").innerText = `Found ${filtered.length} matching note(s)`;
    renderNotesGrid(filtered, document.getElementById("exploreNotesList"));
}

function renderNotesGrid(list, container) {
    container.innerHTML = "";
    if (list.length === 0) {
        container.innerHTML = "<p style='color:#777; grid-column:1/-1;'>No notes found matching your criteria.</p>";
        return;
    }

    for (var i = 0; i < list.length; i++) {
        var n = list[i];
        var iconClass = n.file.endsWith('.docx') ? 'fa-file-word' : 'fa-file-pdf';
        var isFav = myFavorites.includes(n.id);
        var card = document.createElement("div");
        card.className = "note-card";
        card.innerHTML = `
            <div>
                <div class="note-card-header">
                    <span class="tag-badge"><i class="fa-solid ${iconClass}"></i> ${n.category} • ${n.semester || 'Gen'}</span>
                    <i class="fa-${isFav ? 'solid' : 'regular'} fa-bookmark" style="color:var(--accent-yellow); cursor:pointer;" onclick="toggleFavorite('${n.id}')" title="Save favorite"></i>
                </div>
                <h4 onclick="openNoteDetail('${n.id}')">${n.title}</h4>
                <p><b>Subject:</b> ${n.subject}</p>
                <p style="font-size:12px;">${n.summary.substring(0, 90)}...</p>
            </div>
            <div>
                <div class="note-meta">
                    <span><i class="fa-solid fa-user"></i> ${n.by}</span>
                    <span><i class="fa-solid fa-download"></i> ${n.downloads} | ⭐ ${n.rating}</span>
                </div>
                <button class="my-btn btn-sm" style="width:100%; margin-top:8px;" onclick="openNoteDetail('${n.id}')">View & Reader</button>
            </div>
        `;
        container.appendChild(card);
    }
}

function filterByFolderQuery(subjectName) {
    switchTab('explore');
    document.getElementById("librarySearch").value = subjectName;
    applyFilters();
}

function filterByCategory(catName) {
    switchTab('explore');
    document.getElementById("filterCategory").value = catName;
    applyFilters();
}

function handleQuickSearch(e) {
    if (e.key === "Enter") {
        goToExploreWithSearch();
    }
}

function goToExploreWithSearch() {
    var val = document.getElementById("quickSearchInput").value;
    switchTab('explore');
    document.getElementById("librarySearch").value = val;
    applyFilters();
}

// Note Detail & In-Browser Reader Simulator
function openNoteDetail(noteId) {
    currentSelectedNoteId = noteId;
    var note = notesList.find(n => n.id === noteId);
    if (!note) return;

    totalReaderPages = note.pages || 15;
    currentReaderPage = 1;
    var fileTypeLabel = note.file.endsWith('.docx') ? "Word Document Viewer" : "In-Browser PDF Reader";

    var container = document.getElementById("noteDetailContainer");
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:start;">
            <div>
                <span class="tag-badge">${note.category} • ${note.semester}</span>
                <h2 style="color:var(--accent-yellow); margin:10px 0 5px 0;">${note.title}</h2>
                <p style="color:#aaa;"><b>Subject:</b> ${note.subject} | <b>Uploaded by:</b> ${note.by} (${note.institution || 'College Student'}) on ${note.date}</p>
            </div>
            <button class="my-btn" onclick="downloadNoteFile('${note.id}')"><i class="fa-solid fa-download"></i> Download (${note.size || '3.2 MB'})</button>
        </div>

        <p style="margin-top:15px; line-height:1.6;"><b>Description:</b> ${note.summary}</p>
        <p style="font-size:13px; color:#88ff88;"><b>Tags:</b> ${note.tags}</p>

        <h3 style="margin-top:25px;"><i class="fa-solid fa-book-open"></i> ${fileTypeLabel}</h3>
        <div class="reader-toolbar">
            <div>
                <button class="my-btn btn-sm" onclick="readerChangePage(-1)">◀ Prev Page</button>
                <span id="readerPageIndicator" style="margin:0 15px; font-weight:600;">Page 1 of ${totalReaderPages}</span>
                <button class="my-btn btn-sm" onclick="readerChangePage(1)">Next Page ▶</button>
            </div>
            <div>
                <button class="my-btn btn-sm btn-secondary" onclick="alert('Zoom feature active (100%)')"><i class="fa-solid fa-magnifying-glass-plus"></i></button>
                <button class="my-btn btn-sm btn-secondary" onclick="alert('Document sent to printer')"><i class="fa-solid fa-print"></i> Print</button>
            </div>
        </div>

        <div class="pdf-viewer-simulator" id="pdfPageContentBox">
            <h3>📖 [Previewing Page ${currentReaderPage} of ${note.file}]</h3>
            <p style="max-width:600px; color:#ccc; margin-top:10px;">
                Simulated page buffer for: <b>${note.title}</b>.<br>
                Rendered layout blocks allow text inspection, study review, and local export.
            </p>
            <div class="doc-viewer-badge">
                &gt; Section Content [Page ${currentReaderPage}]: Concepts of ${note.subject}<br>
                &gt; Detailed text analysis, structured queries, and syntax explanations.<br>
                &gt; [End of buffer block]
            </div>
        </div>

        <div class="reviews-section">
            <h3>Student Reviews & Ratings (⭐ ${note.rating} / 5)</h3>
            <div id="noteReviewsList">
                ${note.reviews.length === 0 ? '<p style="color:#777; font-size:13px;">No reviews yet. Be the first to review!</p>' : ''}
                ${note.reviews.map(r => `<div class="review-item"><b>${r.user}</b> (⭐ ${r.rating}/5):${r.comment}</div>`).join('')}
            </div>

            <div style="margin-top:15px; background:#181818; padding:15px; border-radius:6px;">
                <h4 style="margin:0 0 10px 0; font-size:14px;">Leave a Review</h4>
                <div class="field">
                    <select id="newReviewRating">
                        <option value="5">⭐⭐⭐⭐⭐ (5/5 Excellent)</option>
                        <option value="4">⭐⭐⭐⭐ (4/5 Very Good)</option>
                        <option value="3">⭐⭐⭐ (3/5 Average)</option>
                        <option value="2">⭐⭐ (2/5 Needs Improvement)</option>
                        <option value="1">⭐ (1/5 Poor)</option>
                    </select>
                </div>
                <div class="field">
                    <textarea id="newReviewComment" rows="2" placeholder="Write helpful feedback for other students..."></textarea>
                </div>
                <button class="my-btn btn-sm" onclick="submitReview('${note.id}')">Post Review</button>
            </div>
        </div>
    `;

    var tabs = document.querySelectorAll(".tab-content");
    for (var i = 0; i < tabs.length; i++) { tabs[i].classList.remove("active-tab"); }
    document.getElementById("tab-note-detail").classList.add("active-tab");
    window.scrollTo(0, 0);
}

function goBackFromDetail() {
    switchTab(currentActiveTab === 'explore' ? 'explore' : 'home');
}

function readerChangePage(direction) {
    currentReaderPage += direction;
    if (currentReaderPage < 1) currentReaderPage = 1;
    if (currentReaderPage > totalReaderPages) currentReaderPage = totalReaderPages;
    document.getElementById("readerPageIndicator").innerText = `Page ${currentReaderPage} of ${totalReaderPages}`;
    document.getElementById("pdfPageContentBox").querySelector("h3").innerHTML = `📖 [Previewing Page ${currentReaderPage}]`;
}

function downloadNoteFile(noteId) {
    var note = notesList.find(n => n.id === noteId);
    if (!note) return;

    note.downloads++;
    if (!myDownloads.includes(noteId)) myDownloads.push(noteId);
    localStorage.setItem("sn_notes", JSON.stringify(notesList));
    localStorage.setItem("sn_downloads", JSON.stringify(myDownloads));

    var mimeType = note.file.endsWith('.docx') 
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
        : "application/pdf";

    var dummyContent = `=== STUDENT NOTEHUB DOCUMENT ===\nTitle: ${note.title}\nSubject: ${note.subject}\nAuthor: ${note.by}\nSummary: ${note.summary}\n=============================`;
    var blob = new Blob([dummyContent], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = note.file;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    alert("Download started successfully!");
    applyFilters();
}

function toggleFavorite(noteId) {
    if (!currentUser) {
        alert("Please login to save favorite notes.");
        openAuthModal();
        return;
    }
    var idx = myFavorites.indexOf(noteId);
    if (idx > -1) {
        myFavorites.splice(idx, 1);
        alert("Removed from favorites.");
    } else {
        myFavorites.push(noteId);
        alert("Saved to your favorite collections!");
    }
    localStorage.setItem("sn_favorites", JSON.stringify(myFavorites));
    applyFilters();
    if (currentActiveTab === 'home') renderTrendingNotes();
}

function submitReview(noteId) {
    if (!currentUser) {
        alert("Please log in to submit a review.");
        openAuthModal();
        return;
    }
    var rating = parseFloat(document.getElementById("newReviewRating").value);
    var comment = document.getElementById("newReviewComment").value;
    if (!comment) {
        alert("Please write a comment.");
        return;
    }

    var note = notesList.find(n => n.id === noteId);
    note.reviews.push({ user: currentUser.name, rating: rating, comment: comment });
    
    var totalR = note.reviews.reduce((sum, r) => sum + r.rating, 0);
    note.rating = parseFloat((totalR / note.reviews.length).toFixed(1));

    localStorage.setItem("sn_notes", JSON.stringify(notesList));
    alert("Review posted successfully!");
    openNoteDetail(noteId);
}

// Upload Modal & Validation Workflow
function openUploadForm() {
    if (!currentUser) {
        alert("Please log in to upload notes.");
        openAuthModal();
        return;
    }
    document.getElementById("uploadModal").style.display = "flex";
}

function closeUploadForm() {
    document.getElementById("uploadModal").style.display = "none";
}

function handleFilePreviewCheck(e) {
    var file = e.target.files[0];
    if (file && file.size > 15 * 1024 * 1024) {
        alert("File size exceeds 15MB limit.");
        e.target.value = "";
    }
}

function handleUpload(event) {
    event.preventDefault();
    var progressContainer = document.getElementById("uploadProgressContainer");
    var progressBar = document.getElementById("uploadProgressBar");
    progressContainer.style.display = "block";
    progressBar.style.width = "20%";

    setTimeout(() => { progressBar.style.width = "60%"; }, 400);

    setTimeout(() => {
        progressBar.style.width = "100%";
        setTimeout(() => {
            var title = document.getElementById("noteTitle").value;
            var category = document.getElementById("noteCategory").value;
            var subject = document.getElementById("noteSubject").value;
            var semester = document.getElementById("noteSemester").value;
            var tags = document.getElementById("noteTags").value;
            var summary = document.getElementById("noteDesc").value;
            var by = document.getElementById("authorName").value;
            var fileInput = document.getElementById("pdfFileInput");
            var fileName = fileInput.files[0] ? fileInput.files[0].name : "document.pdf";

            var newNote = {
                id: "note-" + (notesList.length + 1),
                title: title,
                category: category,
                subject: subject,
                semester: semester,
                tags: tags,
                summary: summary,
                by: by,
                institution: currentUser.institution || "College Student",
                date: new Date().toISOString().split('T')[0],
                downloads: 0,
                rating: 5.0,
                file: fileName,
                pages: Math.floor(Math.random() * 20) + 10,
                size: "3.5 MB",
                reviews: []
            };

            notesList.unshift(newNote);
            localStorage.setItem("sn_notes", JSON.stringify(notesList));

            document.getElementById("noteUploadForm").reset();
            progressContainer.style.display = "none";
            progressBar.style.width = "0%";
            closeUploadForm();
            alert("Note successfully validated, stored securely, and published!");
            
            applyFilters();
            renderTrendingNotes();
        }, 400);
    }, 800);
}

// User Authentication & Dashboard
function openAuthModal() {
    document.getElementById("authModal").style.display = "flex";
}
function closeAuthModal() {
    document.getElementById("authModal").style.display = "none";
}

function toggleAuthMode() {
    authModeIsSignup = !authModeIsSignup;
    document.getElementById("authModalTitle").innerText = authModeIsSignup ? "Student Sign Up" : "Student Login";
    document.getElementById("nameFieldContainer").style.display = authModeIsSignup ? "block" : "none";
    document.getElementById("authSubmitBtn").innerText = authModeIsSignup ? "Create Account" : "Log In";
    document.getElementById("authSwitchPrompt").innerText = authModeIsSignup ? "Already have an account? Log In" : "Don't have an account? Sign Up";
}

function handleAuthSubmit(event) {
    event.preventDefault();
    var email = document.getElementById("authEmail").value;
    var name = authModeIsSignup ? document.getElementById("authName").value : (email.split('@')[0]);

    currentUser = {
        name: name,
        email: email,
        role: "Verified Student",
        institution: "State Institute of Technology",
        course: "B.Tech Computer Science"
    };

    localStorage.setItem("sn_user", JSON.stringify(currentUser));
    updateAuthUI();
    closeAuthModal();
    alert("Welcome back, " + currentUser.name + "!");
}

function updateAuthUI() {
    var btn = document.getElementById("authBtnLabel");
    if (currentUser) {
        btn.innerHTML = `<i class="fa-solid fa-user-check"></i> ${currentUser.name}`;
    } else {
        btn.innerHTML = `<i class="fa-solid fa-user"></i> Login`;
    }
}

function switchDashTab(tabName) {
    var btns = document.querySelectorAll(".dash-tab-btn");
    for (var i = 0; i < btns.length; i++) btns[i].classList.remove("active");
    var panes = document.querySelectorAll(".dash-pane");
    for (var j = 0; j < panes.length; j++) panes[j].classList.remove("active");

    event.target.classList.add("active");
    document.getElementById("dash-pane-" + tabName).classList.add("active");
}

function renderDashboardData() {
    if (!currentUser) {
        document.getElementById("dashUserName").innerText = "Guest Student";
        document.getElementById("dashUserRole").innerText = "Please log in to view personal dashboard data.";
        return;
    }

    document.getElementById("dashUserName").innerText = currentUser.name;
    document.getElementById("dashUserRole").innerText = `Role: ${currentUser.role}`;
    document.getElementById("dashUserInst").innerText = `${currentUser.institution} (${currentUser.course})`;

    var myUploads = notesList.filter(n => n.by.toLowerCase() === currentUser.name.toLowerCase());
    document.getElementById("countUploads").innerText = myUploads.length;
    renderNotesGrid(myUploads, document.getElementById("myUploadsList"));

    var favNotes = notesList.filter(n => myFavorites.includes(n.id));
    document.getElementById("countFavs").innerText = favNotes.length;
    renderNotesGrid(favNotes, document.getElementById("myFavoritesList"));

    var dlNotes = notesList.filter(n => myDownloads.includes(n.id));
    renderNotesGrid(dlNotes, document.getElementById("myDownloadsList"));
}

function openProfileEdit() {
    if (!currentUser) {
        openAuthModal();
        return;
    }
    document.getElementById("editName").value = currentUser.name;
    document.getElementById("editInst").value = currentUser.institution;
    document.getElementById("editCourse").value = currentUser.course;
    document.getElementById("profileModal").style.display = "flex";
}

function closeProfileEdit() {
    document.getElementById("profileModal").style.display = "none";
}

function saveProfileSettings(event) {
    event.preventDefault();
    currentUser.name = document.getElementById("editName").value;
    currentUser.institution = document.getElementById("editInst").value;
    currentUser.course = document.getElementById("editCourse").value;

    localStorage.setItem("sn_user", JSON.stringify(currentUser));
    updateAuthUI();
    closeProfileEdit();
    renderDashboardData();
    alert("Profile updated successfully!");
}