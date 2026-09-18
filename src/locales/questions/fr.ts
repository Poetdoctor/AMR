import type { QuestionCopy } from '@/lib/visitPrep'

/**
 * The visit-prep question bank in French.
 *
 * Machine-drafted, awaiting review by a fluent team member.
 *
 * This one is worth more care than its length suggests. It is the only thing
 * on the site somebody prints and carries into an appointment, and a question
 * phrased awkwardly is a question they will not ask out loud. Read each one as
 * though about to say it to a doctor who is already standing up to leave: if it
 * sounds like a form, rewrite it until it sounds like a person.
 *
 * The person filling this in may be of any gender, and French first-person
 * agreement would assign them one — "suis-je soumise", "serai-je testée". Every
 * question here is phrased to avoid that rather than defaulting to the
 * masculine. If a rewrite reintroduces an agreement, find another way to say it.
 *
 * Quebec and francophone health vocabulary where it differs: "rendez-vous"
 * rather than "nomination", "intraveineux", "effets secondaires", "prise en
 * charge". Keep "vous" throughout — this is a stranger with authority, and
 * tutoiement would be wrong.
 */
const fr: QuestionCopy = {
  infection: {
    label: 'À propos de l’infection',
    note: 'Ce que les patients nous ont dit le plus souvent, c’est que personne ne leur avait expliqué le diagnostic.',
    questions: {
      organism: 'Quelle est exactement la bactérie en cause, et à quoi est-elle résistante ?',
      'same-again': 'Est-ce la même infection qui revient, ou une nouvelle ?',
      'what-rules-out':
        'Que veut dire « résistante » dans mon cas — quels traitements est-ce que cela écarte réellement ?',
      'how-caught':
        'Sait-on comment je l’ai attrapée, et est-ce que cela change quelque chose à la suite ?',
    },
  },

  treatment: {
    label: 'À propos du traitement',
    note: 'Une patiente a demandé expressément qu’on lui explique le raisonnement, et pas seulement qu’on lui annonce la décision.',
    questions: {
      'why-this': 'Pourquoi ce traitement plutôt que les autres options que vous avez envisagées ?',
      'side-effects':
        'À quels effets secondaires dois-je m’attendre, et lesquels doivent me pousser à appeler quelqu’un ?',
      'how-long':
        'Combien de temps dure cette cure, et comment saurons-nous si elle a fonctionné ?',
      'oral-or-iv': 'Existe-t-il une option par voie orale, ou est-ce forcément intraveineux ?',
      'if-not-working': 'Que se passe-t-il si celui-ci ne fonctionne pas ?',
    },
  },

  precautions: {
    label: 'À propos des précautions et des analyses',
    note: 'Des cliniciens nous ont dit que les précautions sont souvent mises en place sans explication, et réévaluées tardivement.',
    questions: {
      'why-precautions':
        'Pourquoi ces précautions s’appliquent-elles à moi, et que faudrait-il pour qu’elles soient levées ?',
      retest: 'Quand aurai-je une nouvelle analyse pour savoir si j’en ai encore besoin ?',
      'what-test': 'En quoi consiste cette analyse, et quand aurai-je le résultat ?',
      'explain-to-family':
        'Comment expliqueriez-vous ces précautions à ma famille, avec des mots que je peux répéter ?',
    },
  },

  life: {
    label: 'À propos de la place que cela prend dans ma vie',
    note: 'Le meilleur traitement sur le papier n’est pas toujours celui qui s’accorde avec la vie autour.',
    questions: {
      'how-many': 'Combien de rendez-vous cela représente-t-il encore, à peu près ?',
      closer: 'Y a-t-il un endroit plus près de chez moi où je pourrais faire faire cela ?',
      cost: 'Combien cela va-t-il me coûter, y compris ce qui n’est pas couvert ?',
      'work-school':
        'Que dois-je dire à mon employeur ou à mon école, et qu’est-ce que je peux continuer à faire ?',
    },
  },

  coping: {
    label: 'À propos de comment je vis les choses',
    note: 'C’est la partie que les rendez-vous sautent le plus souvent, et celle que les patients voulaient le plus voir abordée.',
    questions: {
      'whole-person':
        'Pouvons-nous parler de comment je vais vraiment, et pas seulement de l’état de l’infection ?',
      'mental-support':
        'Existe-t-il un soutien pour l’aspect psychologique, et est-ce que cela me coûterait quelque chose ?',
      'family-safe':
        'Est-ce que je peux être proche de ma famille et des personnes avec qui je vis sans risque ?',
      others: 'Y a-t-il quelqu’un d’autre qui traverse la même chose et à qui je pourrais parler ?',
    },
  },
}

export default fr
