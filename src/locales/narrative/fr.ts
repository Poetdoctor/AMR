import type { NarrativeCopy } from '@/lib/beats'

/**
 * The Home narrative in French.
 *
 * Machine-drafted, awaiting review by a fluent team member.
 *
 * Two things a reviewer should watch for that an ordinary translation review
 * would not:
 *
 *   1. **The quotes are people's own sentences.** They are translated here
 *      because a reader who only reads French should be able to hear what was
 *      said — but the site shows them as translations and keeps the English
 *      original beside them (see `Quote.original`). Translate for how somebody
 *      actually speaks, not for the record: these were said out loud, in
 *      interviews, by two people describing the worst stretch of their lives.
 *      Norma and Sunny do not sound like a report.
 *
 *   2. **Grammatical gender is a decision English never forced.** Norma
 *      Washburn is she/her in the source and Sunny Loo is he/him — check any
 *      agreement that refers to either of them, and to both of them together.
 *      For the unnamed person the narrative follows, agreement is avoided
 *      where the French allows it ("Suis-je un danger ?" rather than
 *      "dangereux/dangereuse") and falls back to the masculine generic where
 *      it does not. A reviewer should decide whether that is the right call
 *      for a project about people not being seen properly.
 *
 *   3. **`words` are drawn in the 3D scenes**, in hand-placed slots sized for
 *      the English. French runs roughly 15–20% longer, so a faithful but long
 *      fragment can overflow its slot or collide with the reading card. Prefer
 *      the shorter of two good options here; the prose in `body` is where the
 *      full thought belongs.
 */
const fr: NarrativeCopy = {
  acts: {
    1: 'Quelque chose ne va pas',
    2: 'Personne ne comprend ce que je porte',
    3: 'L’infection n’est pas toute l’histoire',
    4: 'La guérison commence quand quelqu’un voit la personne entière',
  },

  beats: {
    fall: {
      title: 'La chute',
      words: ['Espoir', 'Encore ?', 'Peur'],
      quotes: [
        {
          text: 'La première chose qu’on ressent, c’est un serrement au cœur : j’ai déjà vécu ça, et oh non, ça recommence.',
          attribution: 'Norma Washburn',
        },
        {
          text: 'Mon pansement a tenu des mois, mais j’avais peur que ça recommence.',
          attribution: 'Norma Washburn',
        },
      ],
      body: [
        'Rien de dramatique ne se produit. Il n’y a aucun moment que quiconque noterait dans un dossier. Il y a un résultat, ou une phrase, ou un regard — et le sol n’est plus tout à fait là où il était une seconde plus tôt.',
      ],
    },

    rollercoaster: {
      title: 'Les montagnes russes',
      words: ['Joie', 'Désespoir', 'Encouragée', 'De nouveau au fond'],
      quotes: [
        {
          text: 'Mais c’est un soulagement d’avoir des spécialistes pour faire ces pansements à votre place.',
          attribution: 'Norma Washburn',
        },
      ],
      body: [
        'D’abord l’espoir et la joie, puis le désespoir, puis l’encouragement, et finalement de nouveau le fond. Les patients nous ont décrit la même courbe encore et encore. Ce n’est pas la description d’une maladie — c’est ce que vivre avec une maladie qui revient sans cesse fait à une personne.',
        'La personne ne bouge pas. C’est le sol qui bouge.',
      ],
    },

    weight: {
      title: 'Le poids invisible',
      words: ['Encore une cure', 'Et une autre', 'Assez'],
      quotes: [],
      body: [
        'Chaque cure d’antibiotiques est une épreuve de plus à traverser. Elles s’accumulent. Personne ne les compte, parce que prise isolément chacune est raisonnable.',
        'Ce désespoir inconscient peut se manifester physiquement. Norma s’est effondrée au sol d’épuisement après des traitements antibiotiques répétés. Pas à cause de l’infection. À cause des traitements.',
      ],
    },

    corridor: {
      title: 'L’hôpital qui ne vous voit pas',
      words: ['Diagnostic', 'Ordonnance', 'Analyse', 'Intervention'],
      quotes: [
        {
          text: 'Je voudrais que les autres comprennent ce que je ressens et s’arrêtent assez longtemps pour me laisser le dire, au lieu de passer directement au… traitement',
          attribution: 'Sunny Loo',
        },
        {
          text: 'J’aimerais que mon médecin me demande comment je me sens… mais si je le demandais, on m’enverrait directement en psychothérapie.',
          attribution: 'Sunny Loo — et la psychothérapie serait à ses frais',
        },
        {
          text: 'On dirait qu’ils ont simplement décidé que leur priorité était d’enchaîner les patients, mais le patient en ressort mal préparé à affronter ce qui l’attend.',
          attribution: 'Norma Washburn',
        },
      ],
      body: [
        'Tout le monde ici est compétent, et tout le monde ici est débordé. Le Canada manque de médecins, la Colombie-Britannique comprise, et trouver le temps d’établir un lien personnel est réellement difficile.',
        'Les mots arrivent quand même à l’heure. On ne demande rien à la personne qui les porte.',
      ],
    },

    machine: {
      title: 'L’explication manquante',
      words: ['Pourquoi ceci ?', 'Pourquoi maintenant ?', 'Personne n’a dit'],
      quotes: [
        {
          text: 'Ils sont occupés à poser un cathéter PICC en me disant que j’en ai besoin, et c’est seulement parce que j’ai une expérience en soins infirmiers que j’ai compris… sinon j’aurais eu vraiment très peur… les gens n’ont pas le temps d’expliquer aux patients.',
          attribution: 'Une personne, lors des entretiens de l’équipe',
        },
        {
          text: 'Qu’on en fasse une priorité : si le médecin a des réserves sur un médicament et hésite entre plusieurs options, qu’il dise au patient qu’il a ces réserves… qu’il le mette au courant, pour qu’il sache quelles sont les issues possibles.',
          attribution: 'Norma Washburn',
        },
      ],
      body: [
        'Prélèvements, cathéters, examens d’imagerie, résultats. Chacun a une raison, et la raison reste à l’intérieur de la machine.',
        'La Dre Edith Blondel-Hill nous a expliqué qu’une partie du dépistage de la RAM porte atteinte à l’intimité et à la pudeur des patients — des prélèvements répétés, y compris des prélèvements anaux. Sans explication préalable, on peut en ressortir avec le sentiment d’avoir été violé plutôt qu’examiné.',
        'Le médecin de Norma n’a jamais eu le temps de lui expliquer ce qu’était la RAM, ni à quels effets secondaires s’attendre. Les comorbidités qui ont suivi sont arrivées comme une surprise qu’une conversation aurait pu éviter.',
      ],
    },

    glass: {
      title: 'L’isolement',
      words: ['Suis-je un danger ?', 'Suis-je contagieux ?', 'Suis-je sale ?'],
      quotes: [],
      body: [
        'La chambre ne change pas. Le personnel, puis la famille, puis les amis commencent à enfiler une blouse et des gants avant d’entrer, et à partir de là ce n’est plus la même chambre.',
        'Les précautions comptent — elles empêchent les bactéries résistantes de se propager. Ce qui les accompagne souvent n’est voulu par personne. L’isolement physique devient un isolement social. Les gens commencent à s’éloigner de leur conjoint et de leur famille de peur de transmettre quelque chose, et certains finissent par se voir comme sales, ou contagieux.',
        'La Dre Blondel-Hill et le Dr Anthony Liu ont tous deux soulevé ce que les patients ne peuvent pas voir depuis leur chambre : les patients isolés reçoivent en général des visites moins nombreuses et plus courtes de leur équipe soignante, et les données relient cela à l’anxiété, à la dépression et à la stigmatisation.',
      ],
    },

    ocean: {
      title: 'La solitude',
      words: ['Personne d’autre', 'Nulle part', 'Sûrement quelqu’un'],
      quotes: [],
      body: [
        'Norma et Sunny ont chacun trouvé quelque chose par eux-mêmes. Norma a son église, et une amie qui croit au pouvoir de la prière, ce qui l’a beaucoup aidée pendant les périodes d’isolement. Sunny joue en ligne avec des amis, et garde le lien comme ça.',
        'On n’a rien proposé ni à l’un ni à l’autre. Tous deux ont soulevé la même absence, sans qu’on le leur demande : il n’existe aucune communauté de patients touchés par la RAM où se retrouver, et tous deux ont dit qu’ils y tiendraient.',
        'Ils ne sont pas rares. Ils sont sans lien les uns avec les autres. Chaque lumière là-bas est une autre personne à qui on a dit la même chose, dans une autre chambre, un autre soir.',
      ],
    },

    monster: {
      title: 'Le monstre est un mot',
      words: ['SUPERBACTÉRIE', 'INCURABLE', 'CONDAMNÉ', 'CONTAGIEUX'],
      quotes: [
        {
          text: 'Maman, tu te souviens quand on était petits et que tu nous lisais tout ça sur la surconsommation d’antibiotiques et sur le fait qu’on allait créer une superbactérie ? Maman, voilà ce que tu as eu — une superbactérie !',
          attribution: 'La fille de Norma',
        },
      ],
      body: [
        'Les gens entendent « superbactérie » et supposent qu’aucun antibiotique ne fonctionnera. En général quelque chose fonctionne encore ; la résistance raccourcit la liste et complique le traitement.',
        'Et sous le mot se cache l’idée fausse qui compte le plus : que la personne serait devenue résistante aux antibiotiques. Ce n’est pas elle. Ce sont les bactéries.',
      ],
    },

    world: {
      title: 'Le monde au-delà de l’hôpital',
      words: ['Travail', 'École', 'Argent', 'S’y rendre'],
      quotes: [
        {
          text: 'Les médecins vont droit à la maladie, à l’intervention… mais souvent ce n’est qu’une petite partie des préoccupations quotidiennes du patient… la plupart des patients ont besoin qu’on aborde l’aspect psychologique : comment je passe le reste de ma journée avec ce que j’ai, comment je passe demain avec ce que j’ai ?',
          attribution: 'Sunny Loo',
        },
      ],
      body: [
        'Le patient finit par quitter la chambre et l’infection repart avec lui — mais le travail aussi, et l’école, les personnes à charge, les relations et l’argent. Les rendez-vous viennent s’épingler là-dedans.',
        'Quelqu’un qui habite près d’un grand hôpital s’en sort. Quelqu’un dans une plus petite communauté n’a peut-être pas le même accès, et chaque déplacement représente un coût de plus. Norma s’est un jour effondrée à force d’aller à l’hôpital.',
        'La forme même du traitement compte : certains traitements intraveineux exigent une réfrigération qui n’est pas réaliste dans tous les foyers. Le meilleur traitement sur le papier n’est pas toujours celui qui convient à la vie de quelqu’un.',
      ],
    },

    whole: {
      title: 'La personne entière',
      words: ['Compréhension', 'Soutien', 'Communication', 'Éducation', 'Lien', 'Soin'],
      quotes: [
        {
          text: 'Nous ne prenons pas en charge la personne dans son ensemble.',
          attribution: 'Norma Washburn',
        },
        {
          text: 'Quand nous parlons de ce que nous vivons, nous demandons seulement à être compris, à être soutenus.',
          attribution: 'Sunny Loo',
        },
      ],
      body: [
        'Tout dans cette histoire — le service, la famille, la bactérie, les cures de traitement, les murs, les lumières au loin — tournait depuis le début autour d’une seule personne.',
        'La RAM ne se résume pas à savoir si un médicament peut tuer une bactérie. C’est le parcours d’une personne entière à travers quelque chose qui fait dévier sa santé sociale, psychologique et spirituelle. De meilleurs tests et de meilleurs antibiotiques comptent. Que quelqu’un s’arrête assez longtemps pour poser la question, aussi.',
      ],
    },

    breath: {
      title: 'Et ce n’a jamais été une seule personne',
      words: [],
      quotes: [
        {
          text: 'Quand nous parlons de ce que nous vivons, nous demandons seulement à être compris, à être soutenus.',
          attribution: 'Sunny Loo',
        },
      ],
      body: [
        'Chaque lumière là-bas était quelqu’un. Une autre chambre, un autre soir, une autre personne à qui on a dit la même chose et qu’on a laissée le porter seule.',
      ],
    },
  },
}

export default fr
