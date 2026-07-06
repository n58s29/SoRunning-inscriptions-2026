/* ===================================================================
   LE LIVRE ROSE · Contenu (version 3D)
   SoRunning SNCF · Challenge Connecte 2026 · La Vie en Rose
   Photos : placees dans la moitie basse des pages de texte (post-it)
   =================================================================== */
(function(){
"use strict";
var PH = window.LIVRE_PHOTOS || {};
var G  = window.LIVRE_GALERIE || {groupes:[],individuelles:[],masterclass:[]};
var Gg = G.groupes||[], Gi = G.individuelles||[], Gm = G.masterclass||[];

function flam(color,style){
  return '<span class="flam" style="'+(style||'')+';color:'+color+'"><svg viewBox="708 0 282 335"><use href="#michel"/></svg></span>';
}
function kick(txt){ return '<span class="kick"><span class="kdot"></span>'+txt+'</span>'; }
function ava(key,letter){
  return PH[key] ? '<img class="ava ava-img" src="'+PH[key]+'" alt="">' : '<div class="ava">'+letter+'</div>';
}

/* pool de photos, reparti dans le bas des pages */
var POOL=[Gg[0],Gi[0],Gi[1],Gg[1],Gi[2],Gi[3],Gg[2],Gi[4],Gm[0],Gi[5],Gg[3],Gi[6],Gg[4],Gi[7],Gm[1],Gg[5]].filter(Boolean);
function takeN(n){ return POOL.splice(0,n); }
function photos(n){
  var items=takeN(n); if(!items.length) return '';
  var r=['r0','r1','r2'],sz=items.length===1?'one':'multi',h='<div class="pagephoto">';
  items.forEach(function(it,i){
    if(it) h+='<figure class="polaroid pg '+sz+' '+it.ar+' '+r[i%3]+'"><span class="tape"></span><img src="'+it.src+'" alt="Photo SoRunning"></figure>';
  });
  return h+'</div>';
}

var spreads=[

/* 0 · LA GENESE */
{nav:'La Genèse', l:
  kick('Avant de commencer · 2014 &rarr; 2026')+
  '<h1 class="t">La Genèse</h1>'+
  '<div class="divider"></div>'+
  '<p class="lead">En 2014, l\'idée tient en une phrase : sortir du bureau le midi et courir ensemble.</p>'+
  '<p>Trois collègues de la Direction Numérique du groupe SNCF, emmenés par <strong>Loïc Queudrue</strong>, troquent la pause déjeuner contre quelques kilomètres partagés. Pas de structure, pas de budget. Juste l\'envie de bouger et de se retrouver autrement qu\'en réunion.</p>'+
  '<p>Le sport reste l\'un des rares endroits où les étiquettes tombent : un dossard, des baskets, et chacun repart à égalité.</p>'+
  photos(2),
  r:
  '<h2 class="t2">2015, une communauté naît</h2>'+
  '<p>Loïc lance un espace en ligne pour centraliser les infos, les sorties et les bons plans. Le petit groupe du midi devient un réseau : Nantes, Paris, Bordeaux, Lyon se retrouvent autour d\'une même passion.</p>'+
  '<h2 class="t2">«&nbsp;La Vie en Rose&nbsp;»</h2>'+
  '<p>Dix ans plus tard, ils sont plus de 1 400. Le thème 2026 naît autour d\'un café. Le rose, couleur de SoRunning depuis le premier jour, fait écho à <strong>Michel.e</strong> le flamant rose, et sert de <strong>référence au partenariat</strong> avec SNCF Mixité, le réseau qui agit depuis 2012 pour l\'égalité femmes&#8201;/&#8201;hommes.</p>'+
  '<p class="quote">«&nbsp;On court comme on est, à son rythme, pour le plaisir.&nbsp;»<span class="who">l\'esprit SoRunning</span></p>'+
  photos(1)
},

/* 1 · CHAPITRE 1 */
{nav:'Chapitre 1', l:
  kick('Chapitre 1 · L\'Échauffement')+
  '<h1 class="t">Vous avez couru. Mais qui transpirait en coulisses&nbsp;?</h1>'+
  '<p class="lead">Pendant quatre jours, plus de mille collègues ont couru ou marché partout en France.</p>'+
  '<p>Derrière la photo de groupe : un mois de préparation, des centaines d\'heures invisibles, et trois personnes aux manettes.</p>'+
  '<div class="compare">'+
    '<div class="cyear"><span class="cy">2025</span><span class="cv">1 000</span></div>'+
    '<div class="carrow"><span class="cgrow">+40&nbsp;%</span><span class="caline"></span></div>'+
    '<div class="cyear now"><span class="cy">2026</span><span class="cv">1 400</span></div>'+
  '</div>'+
  photos(2),
  r:
  '<div class="stats">'+
    '<div class="stat"><div class="n" data-c="1400">0</div><div class="l">inscrit·e·s</div></div>'+
    '<div class="stat"><div class="n" data-c="2004">0</div><div class="l">inscriptions aux épreuves</div></div>'+
    '<div class="stat"><div class="n" data-c="1015">0</div><div class="l">finishers</div></div>'+
    '<div class="stat"><div class="n" data-c="42" data-suffix="&nbsp;%">0</div><div class="l">de femmes</div></div>'+
  '</div>'+
  '<div class="satband">'+
    '<div><b>8,9</b><span>satisfaction&#8202;/&#8202;10</span></div>'+
    '<div><b>9,2</b><span>inscription&#8202;/&#8202;10</span></div>'+
    '<div><b>65</b><span>score NPS</span></div>'+
  '</div>'+
  '<p class="quote">«&nbsp;On s\'était dit : si on arrive à 1 000 dossards, ce serait génial.&nbsp;»<span class="who">Loïc</span></p>'+
  '<p>Objectif dépassé de <strong>40&nbsp;%</strong>, et une mixité record : <strong>42&nbsp;%</strong> de femmes, bien au dessus de la moyenne du groupe.</p>'+
  photos(1)
},

/* 2 · CHAPITRE 2 */
{nav:'Chapitre 2', l:
  kick('Chapitre 2 · La Ligne de Départ')+
  '<h1 class="t">Trois héros, trois super-pouvoirs</h1>'+
  '<div class="hero">'+ava('constance','C')+'<div class="hbody">'+
    '<div class="role">L\'Âme Créative</div><h4>Constance</h4>'+
    '<p>Affiches, podcast, interviews, univers «&nbsp;Vie en Rose&nbsp;». Et le SAV : près de <strong>60&nbsp;heures</strong> à répondre, relancer, rassurer. Le visage humain derrière l\'écran.</p>'+
    '<div class="gg"><i style="width:70%"></i></div><div class="gl">IA &nbsp;·&nbsp; un appui créatif</div></div></div>'+
  '<div class="hero">'+ava('loic','L')+'<div class="hbody">'+
    '<div class="role">Le Connecteur</div><h4>Loïc</h4>'+
    '<p>Le chef d\'orchestre. Dix ans de réseau running, et un art : faire le pont entre des entités qui ne se parlent pas, jusqu\'à la présidente de SNCF Mixité.</p>'+
    '<div class="gg"><i style="width:55%"></i></div><div class="gl">IA &nbsp;·&nbsp; messages &amp; pitchs</div></div></div>'+
  '<div class="hero">'+ava('mathieu','M')+'<div class="hbody">'+
    '<div class="role">L\'Architecte Tech</div><h4>Mathieu</h4>'+
    '<p>Le maître des rouages invisibles. La plateforme, les automatisations, les 1 400 dossards : tout ce qui doit marcher sans qu\'on le voie.</p>'+
    '<div class="gg"><i style="width:92%"></i></div><div class="gl">IA &nbsp;·&nbsp; automatisation</div></div></div>'+
  photos(1),
  r:
  '<h2 class="t2">Le vrai défi n\'était pas (que) technique</h2>'+
  '<p>Une équipe de trois, pas assez de temps, pas toutes les compétences, et un projet porté en plus du quotidien. Un mur. Chacun a dû sortir de sa zone de confort et apprendre sur le tas.</p>'+
  '<p>Ce qu\'on redoutait le plus&nbsp;? La visibilité à l\'échelle nationale. Activer 150 000 personnes depuis Nantes n\'a rien d\'évident.</p>'+
  '<ul class="dots">'+
    '<li>Faire le pont entre des entités qui se croisent peu.</li>'+
    '<li>Toucher toutes les régions, pas seulement l\'Ouest.</li>'+
    '<li>Donner envie, sans budget pub, juste avec du lien.</li>'+
  '</ul>'+
  '<p class="quote">«&nbsp;Aucun doute sur la faisabilité : je ne suis pas tout seul, c\'est co-construit.&nbsp;»<span class="who">Loïc</span></p>'+
  photos(1)
},

/* 3 · CHAPITRE 3 */
{nav:'Chapitre 3', l:
  kick('Chapitre 3 · Les Ravitaillements')+
  '<h1 class="t">Chacun sa course, chacun son IA</h1>'+
  '<p class="lead">Il n\'y a pas de bonne manière d\'utiliser l\'IA. Il y a la vôtre.</p>'+
  '<div class="iab"><h4>Constance, l\'appui</h4><p>Un soutien, jamais un pilote. Débloquer une idée, préparer les questions d\'un podcast, reformuler un post. Jamais pour créer un visuel à sa place.</p></div>'+
  '<div class="iab"><h4>Loïc, l\'embarquement</h4><p>Structurer sa stratégie de contact et écrire des invitations qui donnent envie de s\'inscrire. «&nbsp;Ça m\'a fait gagner du temps, et donné du peps.&nbsp;»</p></div>'+
  '<div class="iab"><h4>Mathieu, les rouages</h4><p>C\'est lui qui a poussé l\'IA le plus loin : trier l\'information, structurer les listes, fabriquer la plateforme.</p></div>'+
  photos(1),
  r:
  '<h2 class="t2">Le travail de l\'ombre</h2>'+
  '<p>Constance ne fait pas que des visuels. Dès janvier, elle dessine l\'affiche et les flyers, puis se déplace <strong>en personne</strong> dans les entités nantaises (Gares &amp; Connexions, Réseau, TER, TGV) pour échanger, pas seulement déposer. Elle interviewe une ambassadrice Mixité, enregistre un podcast, organise une journée maillots deux semaines avant le départ.</p>'+
  '<p>Loïc, lui, actionne tous les canaux : les listes mails, Viva Engage, le WhatsApp et le Strava SoRunning (plus de 900 membres), LinkedIn, les clubs régionaux, et un webinaire de lancement.</p>'+
  '<p class="quote">«&nbsp;J\'adore fédérer les gens, avec une bonne dose de folie.&nbsp;»<span class="who">Loïc</span></p>'+
  photos(1)
},

/* 4 · CHAPITRE 4 */
{nav:'Chapitre 4', l:
  kick('Chapitre 4 · Le Dopage Légal')+
  '<h1 class="t">On a musclé notre quotidien avec l\'IA</h1>'+
  '<p class="lead">Pas de potion magique : juste de l\'IA, pour supprimer l\'ennui des tâches répétitives et aller plus vite.</p>'+
  '<div class="ba">'+
    '<div class="c b"><h4>Avant</h4><ul>'+
      '<li>Deux formulaires séparés, un interne, un externe.</li>'+
      '<li>Des tableurs mis à jour à la main.</li>'+
      '<li>Les dossards recopiés ligne par ligne.</li>'+
      '<li>Les statistiques refaites à chaque fois.</li>'+
    '</ul></div>'+
    '<div class="c a"><h4>Après</h4><ul>'+
      '<li>Une seule page web : inscription, règlement, résultats.</li>'+
      '<li>Les dossards générés tout seuls, erreurs repérées.</li>'+
      '<li>Un mail de confirmation envoyé automatiquement.</li>'+
      '<li>Un assistant qui crée des plans d\'entraînement.</li>'+
    '</ul></div>'+
  '</div>'+
  photos(1),
  r:
  '<h2 class="t2">Ce que ça change vraiment</h2>'+
  '<p>Le plus surprenant&nbsp;? Gérer <strong>1 400 inscrits</strong> est devenu plus simple que d\'en gérer 1 000 l\'année d\'avant. Et tout respecte la vie privée : les données sont anonymisées.</p>'+
  '<p><strong>L\'assistant SoRunning, c\'est quoi&nbsp;?</strong> Une IA à qui on a donné de bonnes consignes. Elle pose quelques questions (objectif, niveau, disponibilités) et rend un plan d\'entraînement, semaine par semaine.</p>'+
  '<p class="quote">«&nbsp;On s\'est retrouvés à organiser comme un vrai chrono de course.&nbsp;»<span class="who">Loïc</span></p>'+
  photos(1)
},

/* 5 · CHAPITRE 5 */
{nav:'Chapitre 5', l:
  kick('Chapitre 5 · Votre Prochaine Course')+
  '<h1 class="t">L\'IA a couru pour nous. Laissez-la marcher pour vous.</h1>'+
  '<p class="lead">Trois mini-défis pour apprivoiser l\'IA, sans rien y connaître.</p>'+
  '<ul class="todo">'+
    '<li><span class="num">1</span><p><strong>Le coach.</strong> Demandez à l\'assistant SoRunning un plan «&nbsp;5 km en 4 semaines&nbsp;» adapté à votre niveau.</p></li>'+
    '<li><span class="num">2</span><p><strong>Le pitch.</strong> Faites-vous rédiger un message pour inviter votre équipe au prochain challenge.</p></li>'+
    '<li><span class="num">3</span><p><strong>L\'automate.</strong> Repérez une tâche répétitive et demandez à l\'IA comment l\'alléger.</p></li>'+
  '</ul>'+
  photos(1),
  r:
  '<h2 class="t2">Le mot de la fin</h2>'+
  '<p>SoRunning n\'est pas une course de plus. C\'est un prétexte joyeux pour se rencontrer, à travers les métiers, les régions et les hiérarchies.</p>'+
  '<p>En 2026, l\'IA a été notre partenaire d\'entraînement : du temps gagné, des idées en plus. Mais ce sont toujours des humains qui ont couru et fait du lien.</p>'+
  '<p class="center disp" style="color:var(--ph);font-weight:600;font-size:1.2rem;margin:.2em 0">Rendez-vous en 2027 !</p>'+
  photos(1)
},

/* 6 · FINALE */
{nav:'Have Fun, Have Run !', l:
  '<div class="final-l">'+flam('var(--pl)','width:52%;max-width:170px')+
  '<div class="disp finalmerci">Merci aux<br>runners.euses&nbsp;!</div></div>'+
  photos(1),
  r:
  '<div class="final-r">'+
  '<div class="haverun disp"><span class="b">Have Fun,</span><br><span class="v">Have Run !</span></div>'+
  '<div class="divider" style="margin-top:1em"></div>'+
  '<p class="sm"><strong>Contacts</strong><br>Loïc Queudrue &nbsp;·&nbsp; loic.queudrue@sncf.fr<br>Mathieu Ribourg &nbsp;·&nbsp; mathieu.ribourg@sncf.fr<br>Constance Ehret &nbsp;·&nbsp; constance.ehret@sncf.fr</p>'+
  '<div class="partners"><b>Soutenu par le</b> SNCF Groupe<br><b>En partenariat avec</b> SNCF Mixité</div>'+
  '</div>'+
  photos(1)
}

];

window.LIVRE = { spreads:spreads, flam:flam };
})();
