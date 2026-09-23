var folders = {
    "web-tech": {
        title: "Web Technology in HTML and CSS",
        about: "Covers web request flow, DNS, DOM tree, HTML boilerplate, tags, and formatting."
    },
    "databases": {
        title: "Databases SQL",
        about: "SQL datatypes, table concepts, and TCL commands like COMMIT and ROLLBACK."
    },
    "dsa-java": {
        title: "DSA in Java",
        about: "Java syntax, variables, operators, if-else conditional branches, and switch-case."
    }
};

var initialFiles = [
    {
        folder: "web-tech",
        title: "Web Development Fundamentals (HTML & CSS)",
        by: "Class Rep",
        summary: "Covers client-server models, DNS resolution, DOM tree, HTML structure, lists, tables, and tags.",
        file: "Web Technology in HTML and CSS.pdf"
    },
    {
        folder: "databases",
        title: "Introduction to SQL, Data Types & TCL",
        by: "DB Notes",
        summary: "Covers basic database concepts, primary datatypes, tables, and TCL statements (COMMIT, ROLLBACK, SAVEPOINT).",
        file: "Introduction_DataTypes_TCL_SQL.pdf"
    },
    {
        folder: "dsa-java",
        title: "Java Fundamentals - Theory & Practice",
        by: "Gaurav",
        summary: "Basic Java class structure, 8 primitive data types, arithmetic operators, scanner inputs, and bitwise math.",
        file: "Java_Fundamentals_DSA.pdf"
    },
    {
        folder: "dsa-java",
        title: "Conditional Statements in Java & DSA",
        by: "Gaurav",
        summary: "If, if-else, if-else-if conditions, nested decisions, switch statements, and fall-through behavior.",
        file: "Conditional_Statements_in_Java_DSA.pdf"
    }
];

var stored = localStorage.getItem("my_notes_data");
var notesList = stored ? JSON.parse(stored) : initialFiles;
var currentFolderKey = "";

function showFolders() {
    var container = document.getElementById("foldersContainer");
    container.innerHTML = "";

    for (var key in folders) {
        var count = 0;
        for (var i = 0; i < notesList.length; i++) {
            if (notesList[i].folder === key) {
                count++;
            }
        }

        var div = document.createElement("div");
        div.className = "folder-item";
        div.setAttribute("onclick", "openFolder('" + key + "')");
        div.innerHTML = "<h4>📁 " + folders[key].title + "</h4>" +
            "<p>" + folders[key].about + "</p>" +
            "<div class='folder-files-count'>" + count + " file(s) available &gt;&gt;</div>";
        container.appendChild(div);
    }
}

function openFolder(folderKey) {
    currentFolderKey = folderKey;
    document.getElementById("allFoldersSection").style.display = "none";
    document.getElementById("folderViewSection").style.display = "block";
    document.getElementById("currentFolderHeading").innerText = "📁 Folder: " + folders[folderKey].title;
    loadFolderFiles();
}

function goBackHome() {
    currentFolderKey = "";
    document.getElementById("folderViewSection").style.display = "none";
    document.getElementById("allFoldersSection").style.display = "block";
    showFolders();
}

function loadFolderFiles() {
    var listDiv = document.getElementById("folderFilesList");
    listDiv.innerHTML = "";

    var hasFiles = false;
    for (var i = 0; i < notesList.length; i++) {
        var item = notesList[i];
        if (item.folder === currentFolderKey) {
            hasFiles = true;
            var box = document.createElement("div");
            box.className = "single-note-card";
            box.innerHTML = "<h4>" + item.title + "</h4>" +
                "<p>" + item.summary + "</p>" +
                "<div class='note-info'>Uploaded by: <b>" + item.by + "</b> | File: " + item.file + "</div>" +
                "<button class='download-link' onclick=\"downloadDummy('" + item.file + "')\">📥 Download PDF</button>";
            listDiv.appendChild(box);
        }
    }

    if (!hasFiles) {
        listDiv.innerHTML = "<p style='color: #aaa;'>No files in this folder yet. Click Upload above!</p>";
    }
}

function openUploadForm() {
    if (currentFolderKey !== "") {
        document.getElementById("folderSelect").value = currentFolderKey;
    }
    document.getElementById("uploadModal").style.display = "flex";
}

function closeUploadForm() {
    document.getElementById("uploadModal").style.display = "none";
}

function handleUpload(event) {
    event.preventDefault();

    var folder = document.getElementById("folderSelect").value;
    var title = document.getElementById("noteTitle").value;
    var by = document.getElementById("authorName").value;
    var summary = document.getElementById("noteDesc").value;
    var fileInput = document.getElementById("pdfFileInput");
    var fileName = fileInput.files[0] ? fileInput.files[0].name : "notes.pdf";

    var newNote = {
        folder: folder,
        title: title,
        by: by,
        summary: summary,
        file: fileName
    };

    notesList.unshift(newNote);
    localStorage.setItem("my_notes_data", JSON.stringify(notesList));

    document.getElementById("noteUploadForm").reset();
    closeUploadForm();
    alert("Note uploaded successfully!");

    if (currentFolderKey !== "") {
        loadFolderFiles();
    } else {
        showFolders();
    }
}

function downloadDummy(fileName) {
    var sampleText = "Document content for: " + fileName + "\nDownloaded from Student NoteHub.";
    var blob = new Blob([sampleText], { type: "text/plain" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

showFolders();