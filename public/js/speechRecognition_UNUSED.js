/*
* @Author: Eido
* @Date:   2018-05-24 18:36:07
* @Last Modified by:   Eido
* @Last Modified time: 2018-05-24 18:56:27
*/


/*
La première chose à faire est de vérifier si l'utilisateur a accès à l'API et affiche 
un message d'erreur approprié. Malheureusement, l'API speech-to-text n'est supportée 
que dans Chrome et Firefox (avec un drapeau), donc beaucoup de gens verront 
probablement ce message.
 */
try {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
}
catch(e) {
  console.error(e);
  $('.no-browser-support').show();
  $('.app').hide();
}

/*
La variable recognition nous donnera accès à toutes les méthodes et propriétés de l'API. 
Il existe différentes options disponibles, mais nous définirons recognition.continuous . 
Cela permettra aux utilisateurs de parler avec des pauses plus longues 
entre les mots et les phrases.

Avant de pouvoir utiliser la reconnaissance vocale, nous devons également configurer deux 
gestionnaires d'événements. La plupart d'entre eux écoutent simplement les changements 
dans le statut de recognition:
 */
recognition.onstart = function() { 
  instructions.text('Voice recognition activated. Try speaking into the microphone.');
}

recognition.onspeechend = function() {
  instructions.text('You were quiet for a while so voice recognition turned itself off.');
}

recognition.onerror = function(event) {
  if(event.error == 'no-speech') {
    instructions.text('No speech was detected. Try again.');  
  };
}

/*
Il y a, cependant, un événement spécial onresult très crucial. Il est exécuté chaque fois que 
l'utilisateur prononce un ou plusieurs mots en succession rapide, ce qui nous donne accès à une 
transcription textuelle de ce qui a été dit.

Lorsque nous capturons quelque chose avec le gestionnaire onresult, nous l'enregistrons dans une 
variable globale et l'affichons dans une zone de texte:
 */

recognition.onresult = function(event) {

  // event is a SpeechRecognitionEvent object.
  // It holds all the lines we have captured so far. 
  // We only need the current one.
  var current = event.resultIndex;

  // Get a transcript of what was said.
  var transcript = event.results[current][0].transcript;

  // Add the current transcript to the contents of our Note.
  noteContent += transcript;
  noteTextarea.val(noteContent);
}

/*
Le code ci-dessus est légèrement simplifié. Il y a un bug très bizarre sur les appareils Android qui 
fait que tout est répété deux fois. Il n'y a pas encore de solution officielle mais nous avons réussi
à résoudre le problème sans effets secondaires évidents. Avec ce bug en tête, le code ressemble à ceci:
 */

var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

if(!mobileRepeatBug) {
  noteContent += transcript;
  noteTextarea.val(noteContent);
}


/*
Une fois que nous avons tout mis en place, nous pouvons commencer à utiliser la fonction de reconnaissance 
vocale du navigateur. Pour le démarrer, appelez simplement la méthode start ():
 */
$('#start-record-btn').on('click', function(e) {
  recognition.start();
});

/*
Cela demandera la permission à l'utilisateur. Si tel est le cas, le microphone de l'appareil sera activé.
 */

/*
IMPORTANT :
La plupart des API nécessitant une autorisation utilisateur ne fonctionnent pas sur les hôtes non sécurisés. 
Assurez-vous de diffuser vos applications Web Speech via HTTPS.
 */

/*
Le navigateur écoutera pendant un moment et chaque phrase ou mot reconnu sera transcrit. 
L'API cesse d'écouter automatiquement après quelques secondes de silence ou lorsqu'il est arrêté manuellement.
 */
$('#pause-record-btn').on('click', function(e) {
  recognition.stop();
});