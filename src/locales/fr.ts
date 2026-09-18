import type { Dict } from './en'

/**
 * French.
 *
 * Machine-drafted, awaiting review by a fluent team member — edit freely; this
 * file is the source of truth for French chrome, not a cache of anything.
 *
 * Two decisions a reviewer should either keep or overturn deliberately:
 *
 *   1. `site.short` stays "AMR". It is the wordmark in the header lockup, not
 *      prose. Everywhere the acronym appears in a sentence it is "la RAM"
 *      (résistance aux antimicrobiens), which is the term Santé Canada uses.
 *   2. "Learn" is "Comprendre" rather than "Apprendre" — the section explains
 *      what living with this is like; it does not teach a syllabus.
 */
const fr: Dict = {
  site: {
    name: 'La RAM — le côté humain',
    short: 'AMR',
    tagline: 'le côté humain',
    blurb:
      'Un projet Human Practices d’iGEM UBC sur les répercussions psychosociales de la résistance aux antimicrobiens.',
    credit: 'iGEM UBC — Human Practices',
    noTrackers:
      'Aucune analyse d’audience. Aucun traceur. Rien de ce que vous écrivez ici n’est enregistré.',
  },

  nav: {
    primary: 'Principale',
    menu: 'Menu',
    close: 'Fermer',
    learn: 'Comprendre',
    stories: 'Témoignages',
    tool: 'Préparation',
    community: 'Communauté',
    team: 'Équipe',
    mission: 'Mission',
  },

  footer: {
    read: 'Lire',
    use: 'Utiliser',
    about: 'À propos',
    narrative: 'Le récit',
    toolLong: 'Préparer un rendez-vous',
  },

  skip: 'Aller au contenu principal',

  disclaimer: {
    lead: 'Information pédagogique, et non un avis médical.',
    body: 'Tout ce qui se trouve sur ce site relève de l’information et du partage d’expérience. Il ne s’agit ni d’un diagnostic ni d’un plan de traitement, et cela ne remplace pas une consultation auprès d’un professionnel de la santé. Si une infection ou un médicament vous inquiète, parlez-en à un clinicien.',
  },

  language: {
    label: 'Langue',
    changed: 'La langue a été changée pour le français.',
  },

  untranslated: {
    notice: 'Cette page n’a pas encore été traduite. Le texte ci-dessous est en anglais.',
  },

  home: {
    eyebrow: 'iGEM UBC · Human Practices',
    title: 'On compte soigneusement la résistance aux antimicrobiens. Pas les personnes.',
    lede: 'Sept choses que des patients et des cliniciens nous ont dites, dans l’ordre où elles arrivent généralement. Il faut environ cinq minutes pour les lire.',
    start: 'Commencer la lecture',
    tryMoving: 'Essayer la version animée',
    tryStill: 'Passer à la version fixe',
    reducedMotion:
      'Votre appareil demande une réduction des animations : voici donc la version fixe. Il n’y manque rien.',
    onward: 'Où aller à partir d’ici',
    cards: {
      learn: 'Ce qu’est réellement la résistance, et pourquoi personne ne l’a expliqué.',
      stories: 'Les récits complets dont ces sept temps sont tirés.',
      community:
        'Les deux patients nous ont dit qu’aucune communauté n’existait. Voici notre tentative.',
      tool: 'Écrivez vos questions avant le rendez-vous. Rien ne quitte votre navigateur.',
      mission: 'Ce que nous faisons à ce sujet, et ce que nous espérons changer.',
      team: 'Les six personnes qui lisent votre histoire.',
    },
  },

  pages: {
    learn: {
      title: 'Ce que personne n’a eu le temps d’expliquer',
      subhead:
        'Des articles en langage clair sur la science, les précautions, et ce que des cliniciens de toute la Colombie-Britannique nous ont dit observer. Écrits pour la personne qui vient de recevoir un diagnostic, pas pour une revue scientifique.',
      sources: 'Sources',
      sourcesNote:
        'Ces articles s’appuient sur des entretiens menés par l’équipe auprès de cliniciens et de chercheurs en Colombie-Britannique, ainsi que sur les travaux publiés ci-dessous.',
    },
    stories: {
      title: 'Dans leurs propres mots',
      subhead:
        'Les récits de personnes qui vivent avec une infection résistante. Les citations sont les leurs, telles quelles ; tout ce qui les entoure est de nous.',
      bothTitle: 'Ce qui est revenu chez les deux',
      both1:
        'Deux personnes, deux maladies différentes, et une série d’expériences qui ne cessaient de se recouper. Pour certains patients, le premier changement visible est que le personnel, la famille et les amis doivent soudain enfiler une blouse et des gants avant d’entrer dans la chambre. Ces précautions comptent — c’est ainsi qu’on empêche les bactéries résistantes de se propager — mais elles changent aussi ce que cela fait d’être soigné.',
      both2:
        'L’isolement physique devient vite un isolement social. Un patient commence à se demander s’il représente un danger pour son entourage. Certains prennent leurs distances avec leur conjoint ou leur famille par peur de transmettre l’infection. D’autres se mettent à se voir comme « sales », ou contagieux. Les médecins spécialistes des maladies infectieuses à qui nous avons parlé ont ajouté quelque chose que les patients ne peuvent pas voir de l’intérieur : les patients isolés reçoivent en général des visites moins nombreuses et plus courtes de leur équipe soignante, ce qui constitue un préjudice en soi.',
      both3:
        'Norma comme Sunny avaient trouvé leur propre façon de traverser cela — une église et une amie qui prie, un groupe d’amis en ligne — et on n’avait rien proposé ni à l’une ni à l’autre. Tous deux ont soulevé la même absence, séparément : il n’existe aucune communauté de patients touchés par la RAM où se retrouver, et tous deux ont dit qu’ils y tiendraient.',
      calloutTitle: 'C’est pour cette dernière raison que la section Communauté existe',
      calloutBody:
        'Si vous avez vécu une partie de tout cela, vous n’êtes pas la première personne — on ne vous a simplement jamais mise dans la même pièce que les autres. Publiez sous le nom que vous voulez. Une personne lit tout avant publication.',
      calloutAction: 'Aller à la Communauté',
    },
    team: {
      eyebrow: 'Qui nous sommes',
      title: 'Les six personnes qui lisent votre histoire',
      subhead:
        'Nous sommes la sous-équipe Human Practices d’iGEM UBC. Si vous nous écrivez, c’est l’un ou l’une de nous qui répond. Il n’y a pas de boîte de réception entre les deux.',
      igemTitle: 'iGEM, en un paragraphe',
      igemBody:
        'iGEM est une compétition internationale où des équipes étudiantes passent un an à construire quelque chose en biologie de synthèse. Chaque équipe a un groupe Human Practices dont le rôle est de se demander si la chose construite est réellement souhaitée, et par qui. C’est nous.',
      jamboree: 'La communauté iGEM mondiale au Grand Jamboree.',
    },
    community: {
      title: 'Un endroit pour le dire à voix haute',
      subhead:
        'Les deux patients que nous avons interrogés nous ont dit la même chose, séparément : il n’existe aucune communauté pour cela. Voici notre tentative.',
      openingSoon: 'Ouverture prochaine',
      openingSoonBody:
        'Cette section est construite mais pas encore connectée. Elle ouvrira une fois que l’équipe aura terminé de la mettre en place.',
      latest: 'Derniers récits vécus',
      empty:
        'Personne n’a encore rien écrit. Si vous avez vécu une partie de tout cela, vous seriez la première personne — et la raison pour laquelle la suivante ne trouvera pas cette page vide.',
      glossary: 'Glossaire de la RAM',
    },
    mission: {
      eyebrow: 'Notre travail',
      title: 'Ce que nous faisons, et pourquoi',
      subhead:
        'Trois étapes, dans l’ordre. La revue de littérature est terminée ; nous sommes au début de la deuxième, et c’est là que vous entrez en jeu.',
      s1Title: 'Le problème',
      s1a: 'On compte généralement la résistance aux antimicrobiens : ordonnances rédigées, échantillons résistants, jours d’hospitalisation, dollars. La Colombie-Britannique possède certaines des meilleures données qui soient : dix-neuf années, cinquante et un millions d’ordonnances, un programme de bon usage qui a réduit de plus de moitié la consommation d’antibiotiques chez les jeunes enfants. C’est un travail réellement solide, et il décrit une bactérie plutôt qu’une personne.',
      s1b: 'Nous avons passé ce printemps à lire tout ce que nous pouvions trouver sur l’autre versant de la question, et trois choses ressortent. L’essentiel de ce qui existe provient d’échantillons hospitaliers, ce qui laisse systématiquement de côté les personnes les moins susceptibles de figurer dans un dossier hospitalier. Les études qui interrogent directement les patients sont petites, dispersées entre plusieurs pays et plusieurs infections, et presque aucune ne vient de la Colombie-Britannique. Et les mêmes obstacles y reviennent malgré tout : la honte, l’isolement, le silence, le coût, et le simple fait que personne n’a expliqué le diagnostic.',
      s1c: 'Le fardeau est aussi réparti inégalement. Notre revue revenait toujours aux mêmes groupes : les personnes en soins de longue durée, les personnes en situation d’itinérance, les réfugiés, les communautés autochtones vivant avec des infrastructures sous-financées, les personnes atteintes de cancer, les nouveau-nés, et les soignants à leurs côtés. La résistance suit les lignes de fracture qui existaient déjà. Cela en fait un problème d’équité, et pas seulement de microbiologie.',
      s2Title: 'Ce que nous faisons',
      s2a: 'La lecture est faite, et nous apprenons depuis auprès de personnes qui connaissent cela de l’intérieur. Le Dr Bob Hancock, titulaire de la Chaire de recherche du Canada en santé et génomique à UBC, nous a guidés à travers la science et les endroits où la compréhension du public est en retard. Le Dr Richard Lester, médecin spécialiste des maladies infectieuses, nous a montré à quoi cela ressemble depuis la clinique. Et Sunny Loo, qui vit avec une vascularite et une dépendance de longue durée aux antibiotiques et qui est partenaire patient au sein du BC Antimicrobial Stewardship Program, façonne depuis le début ce que nous demandons, et la façon dont nous le demandons. Nous allons maintenant vers les personnes dont parlent les articles.',
      card1Title: 'Demander aux personnes à qui c’est arrivé.',
      card1Body:
        'Sondages, entretiens individuels et récits écrits, auprès des patients, des proches qui les ont accompagnés, et des infirmières et médecins qui traitent ces infections en Colombie-Britannique.',
      card2Title: 'Nommer les obstacles, avec leurs mots.',
      card2Body:
        'Transformer ce que nous entendons en une cartographie honnête des obstacles psychosociaux que les gens rencontrent réellement, en partant de ce qui existe dans chaque communauté plutôt que de ce qui lui manque.',
      card3Title: 'Régler le problème de l’explication.',
      card3Body:
        'Avec UBC Geering Up, nous construisons un enseignement sur la RAM pour les élèves d’âge scolaire, et nous publions des entretiens de patients et de cliniciens sur nos réseaux, parce que « personne ne m’a rien dit » est revenu trop souvent pour être ignoré.',
      card4Title: 'Ramener tout cela à la paillasse.',
      card4Body:
        'Utiliser cette cartographie pour orienter le travail de laboratoire de notre propre équipe, et publier l’ensemble en langage clair, en accès libre, pour les patients autant que pour les chercheurs.',
      s3Title: 'Ce que nous espérons changer',
      s3a: 'Qu’on demande à un patient atteint d’une infection résistante comment il tient le coup, et pas seulement de quoi a l’air sa plaie. Que personne ne passe une semaine en chambre d’isolement sans qu’on lui dise pourquoi, avec des mots qu’il pourra reprendre auprès de sa propre famille. Que la Colombie-Britannique dispose enfin de données du côté des patients, pour que la prochaine stratégie écrite ici soit conçue pour celles et ceux qu’elle touche le plus durement, plutôt qu’autour d’eux. Et que la prochaine équipe étudiante qui conçoit quelque chose pour la RAM commence par lire ce que les patients ont dit, parce que cela existe et que c’est facile à trouver.',
      s3b: 'Nous sommes une équipe de premier cycle avec une seule saison devant elle. Nous n’allons pas régler ce problème. Nous pouvons rendre sa dimension humaine plus difficile à ignorer.',
      calloutTitle: 'La deuxième étape ne fonctionne que si les gens nous parlent',
      calloutBody:
        'Tout ce qui précède dépend de ce que nous entendrons de personnes qui l’ont vécu. Si c’est votre cas, dix minutes de votre temps changent ce que nous pourrons dire.',
      share: 'Partagez votre expérience',
      shareSoon: 'Nous mettons en place le formulaire. Il ouvrira bientôt.',
    },
  },

  narrative: {
    act: 'Acte {n}',
    readMore: 'Lire la suite',
    translatedQuote: 'Traduit de l’anglais',
    showOriginal: 'Voir les mots d’origine',
  },

  tool: {
    eyebrow: 'Préparation',
    title: 'Entrez avec vos questions déjà écrites',
    subhead:
      'Les rendez-vous vont vite. Voici un endroit pour mettre au clair ce que vous voulez demander et ce que vous voulez faire comprendre, avant d’être dans la pièce.',
    privacyTitle: 'Rien de ce que vous écrivez ici ne quitte cette page',
    privacyBody:
      'Cette fiche fonctionne entièrement dans votre navigateur. Il n’y a aucun compte, aucun serveur, et rien n’est enregistré — nous ne pourrions pas lire ce que vous écrivez ici même si nous le voulions. Cela vous appartient jusqu’à ce que vous l’imprimiez ou fermiez l’onglet.',
    privacyShared:
      'Si vous êtes sur un ordinateur partagé ou public, laissez l’enregistrement désactivé et imprimez ou téléchargez la fiche avant de partir.',
    restored: 'Restauré à partir d’une copie enregistrée dans ce navigateur.',

    basics: 'L’essentiel',
    basicsNote:
      'Tout est facultatif — ne remplissez que ce qu’il vous est utile d’avoir sous les yeux.',
    withWho: 'Rendez-vous avec',
    withWhoHint: 'Nom ou clinique',
    when: 'Quand',
    whenHint: 'Date et heure',
    diagnosis: 'Ce qu’on vous a dit que vous aviez',
    diagnosisHint: 'Avec les mots qu’on vous a donnés',
    medications: 'Ce que vous prenez',
    medicationsHint: 'Médicaments, et les doses si vous les connaissez',

    happening: 'Ce qui s’est passé',
    sinceLast: 'Depuis le dernier rendez-vous',
    sinceLastHint:
      'Changements, nouveaux symptômes, tout ce qui vous a inquiété. Des points suffisent — c’est pour vous, pas pour être corrigé.',

    questions: 'Questions à poser',
    questionsNote:
      'Cochez celles que vous voulez sur votre fiche. Elles viennent de ce que des patients nous ont dit avoir regretté de ne pas demander, et de ce que des cliniciens nous ont dit souhaiter qu’on leur demande.',

    notClinical: 'La partie qui n’est pas clinique',
    affecting: 'Ce que cela change vraiment pour vous',
    affectingHint:
      'Le sommeil, le travail, l’argent, la famille, le moral, ce que vous avez arrêté de faire. Une patiente nous a dit que le plus dur était qu’on ne lui demande que de quoi avait l’air sa plaie.',
    leaveWith: 'Ce avec quoi vous voulez repartir',
    leaveWithHint:
      'Une décision, une explication que vous pouvez répéter à votre famille, une orientation, une date pour la prochaine analyse.',

    sheet: 'Votre fiche',
    sheetNote: 'C’est ce qui s’imprime.',
    print: 'Imprimer',
    download: 'Télécharger',
    copy: 'Copier',
    keepTitle: 'Garder ceci sur cet appareil',
    keepBody:
      'Enregistre vos réponses dans ce navigateur uniquement, pour qu’elles soient encore là si vous revenez. Désactiver l’option les efface. Laissez-la désactivée sur un ordinateur partagé.',
    clear: 'Effacer toute la fiche',

    sheetTitle: 'Préparation du rendez-vous',
    sheetQuestions: 'Questions que je veux poser',
    sheetOwnQuestions: 'Mes propres questions',
    sheetWith: 'Rendez-vous avec',
    sheetDiagnosis: 'Ce qu’on m’a dit que j’avais',
    sheetMedications: 'Ce que je prends',
    sheetHappening: 'Ce qui s’est passé',
    sheetAffecting: 'Ce que cela change vraiment pour moi',
    sheetLeaveWith: 'Ce avec quoi je veux repartir',
    ownQuestionPlaceholder: 'Tapez une question et appuyez sur Entrée',

    sheetEmpty:
      'Votre fiche se construit ici à mesure que vous remplissez le formulaire. Rien de ce que vous écrivez ne quitte cette page.',
    sheetDisclaimer:
      'Information pédagogique, et non un avis médical. Cette fiche est destinée à votre usage personnel et ne remplace pas une consultation auprès d’un professionnel de la santé.',
    prepared: 'Préparée le {date}',
    ownTitle: 'Vos propres questions',
    ownNote: 'Tout ce que la liste ci-dessus ne couvre pas. C’est la partie qui compte le plus.',
    add: 'Ajouter',
    remove: 'Retirer',
    removeLabel: ' la question : {q}',

    statusSavingOn: 'L’enregistrement dans ce navigateur est activé.',
    statusSavingOff:
      'L’enregistrement est désactivé, et tout ce qui avait été enregistré a été effacé.',
    statusCleared: 'Fiche effacée.',
    statusCopied: 'Copié dans votre presse-papiers.',
    statusCopyBlocked:
      'Votre navigateur a bloqué le presse-papiers. Utilisez Télécharger ou Imprimer.',
    statusDownloaded: 'Téléchargé sous le nom visit-preparation.txt.',
  },

  titles: {
    learn: 'Comprendre',
    stories: 'Témoignages',
    tool: 'Préparer un rendez-vous',
    community: 'Communauté',
    share: 'Partager une expérience',
    team: 'Équipe',
    mission: 'Mission',
    notFound: 'Page introuvable',
  },

  notFound: {
    eyebrow: '404',
    title: 'Cette page n’existe pas',
    body: 'Le lien est peut-être périmé, ou cette section n’est pas encore publiée.',
    home: 'Retour au début',
    mission: 'Ce que nous faisons',
  },
}

export default fr
