try {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = new SpeechRecognition();
}
catch (e) {
    console.error(e);
    $('.no-browser-support').show();
    $('.app').hide();
}
var noteTextarea = $('#note-textarea');
var instructions = $('#recording-instructions');
var notesList = $('ul#notes');
var noteContent = '';
// récupère les notes des sessions précédentes et les affiches.
var notes = getAllNotes();
var talking = false;
renderNotes(notes);
/*-----------------------------
      Util
------------------------------*/
/**
 * author: adrien
 **/
function autoScroll() {
    var scrolling = $('#note-textarea');
    var height = scrolling[0].scrollHeight;
    scrolling.scrollTop(height);
};
/*-----------------------------
      Voice Recognition (reconnaissance vocale)
------------------------------*/
recognition.interimResults = false;
recognition.maxAlternatives = 2;
// si false, l'enregistement va s'arrêter après quelques secondes de silence
// si true, la période de silence est pluslongue (environs 15 secondes), ce qui 
// nous permet d'enregistrer même lorsque l'utilisateur fait des pauses
recognition.continuous = true;
// ce block est appelé à chaque fois que l'API Specch capture une ligne
recognition.onresult = function (event) {
    console.log("speech result");
    console.log(event);
    // event est un objet SpeechRecognitionEvent.
    // il contient toutes les lignes qui ont été capturées depuis le début.
    // on a seulement besoin de la ligne courante
    var current = event.resultIndex;
    // obtient une transcription de ce qui a été dit
    var transcript = event.results[current][0].transcript; 
    // ces lignes de code sont là à cause d'un bug android qui fait que
    // tout est répété deux fois.
    // il n'y a à ce jour pas de solution officielle, donc nous devons 
    // gérer un effet de bord
    var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);
    if (!mobileRepeatBug) {
        noteContent += transcript;
        noteTextarea.val(noteContent);
    }
    autoScroll();
    readOutLoud(transcript); // mode "perroquet"
    /*recognition.stop();
    recognition.start();*/
};
recognition.onstart = function () {
    instructions.text('Voice recognition activated. Try speaking into the microphone.');
    console.log('Reconnaissance vocale activée. Essayez de parler dans le micro.');
}
recognition.onspeechstart = function () {
    talking = true;
    console.log("speech start :)");
}
recognition.onspeechend = function () {
    talking = false;
    instructions.text('You were quiet for a while so voice recognition turned itself off.');
    console.log('vous avez été silencieux pendant un moment, alors la reconnaissance vocale s\'est éteinte.');
}
recognition.onerror = function (event) {
    console.log("onerror !!");
        if (event.error == 'no-speech') {
            console.log("pas de voix");
            instructions.text('Aucune voix détectée. Essayez à nouveau');
        };
    }
recognition.onend = function(event) {
    console.log("onend : "+event);
    recognition.start();
}
recognition.onsoundstart = function (event) {
    console.log("sound start : "+ event);
}
recognition.onaudiostart = function (event) {
    console.log("audio start : " + event);
}
recognition.onaudioend = function(event) {
    console.log("audio end : "+event);
}
recognition.onsoundend = function(event) {
    console.log("sound end : " + event);
}
recognition.onnomatch = function(event) {
    console.log("no match : " + event);
}
    /**
     * author: Adrien
     **/
function start_record() {
    console.log("starting record...");
    if (noteContent.length) {
        noteContent += ' ';
    }
    recognition.start();
}
/*-----------------------------
      App buttons and input 
------------------------------*/
$('#start-record-btn').on('click', function (e) {
    if (noteContent.length) {
        noteContent += ' ';
    }
    recognition.start();
});
$('#pause-record-btn').on('click', function (e) {
    recognition.stop();
    instructions.text('Voice recognition paused.');
});
// Synchronize le texte à l'intérieur de la zone de texte avec le contenu de 
// la variable noteContent
noteTextarea.on('input', function () {
    noteContent = $(this).val();
})
$('#save-note-btn').on('click', function (e) {
    recognition.stop();
    if (!noteContent.length) {
        instructions.text('Could not save empty note. Please add a message to your note.');
    }
    else {
        // sauvagarde les notes en local
        // la clé est le dateTime avec les secondes. La valeur est le contenu de la note
        saveNote(new Date().toLocaleString(), noteContent);
        // Rest les variables et met à jour l'UI
        noteContent = '';
        renderNotes(getAllNotes());
        noteTextarea.val('');
        instructions.text('Note saved successfully.');
    }
})
notesList.on('click', function (e) {
    e.preventDefault();
    var target = $(e.target);
    // écoute les notes sélectionnées
    if (target.hasClass('listen-note')) {
        var content = target.closest('.note').find('.content').text();
        readOutLoud(content);
    }
    // Delete note.
    if (target.hasClass('delete-note')) {
        var dateTime = target.siblings('.date').text();
        deleteNote(dateTime);
        target.closest('.note').remove();
    }
});
/*-----------------------------
      Speech Synthesis (synthèse vocale)
------------------------------*/
function readOutLoud(message) {
    var speech = new SpeechSynthesisUtterance();
    // Réglage des paramètres de texte et de voix.
    speech.text = message;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1.5;
    window.speechSynthesis.speak(speech);
}
/*-----------------------------
      Helper Functions 
------------------------------*/
function renderNotes(notes) {
    var html = '';
    if (notes.length) {
        notes.forEach(function (note) {
            html += `<li class="note">
        <p class="header">
          <span class="date">${note.date}</span>
          <a href="#" class="listen-note" title="Listen to Note">écouter les notes Note</a>
          <a href="#" class="delete-note" title="Delete">Supprimer</a>
        </p>
        <p class="content">${note.content}</p>
      </li>`;
        });
    }
    else {
        html = '<li><p class="content">Vous n\'avez pas encore de notes.</p></li>';
    }
    notesList.html(html);
}

function saveNote(dateTime, content) {
    localStorage.setItem('note-' + dateTime, content);
}

function getAllNotes() {
    var notes = [];
    var key;
    for (var i = 0; i < localStorage.length; i++) {
        key = localStorage.key(i);
        if (key.substring(0, 5) == 'note-') {
            notes.push({
                date: key.replace('note-', '')
                , content: localStorage.getItem(localStorage.key(i))
            });
        }
    }
    return notes;
}

function deleteNote(dateTime) {
    localStorage.removeItem('note-' + dateTime);
}

function resetVoiceRecog() {
    console.log("reset voice recognition");
      recognition.stop();
}

// test
start_record();

window.setInterval(function(){
    console.log("talking : "+talking);
  // code à exécuter
    if(talking == false)
      resetVoiceRecog();
}, 10000);