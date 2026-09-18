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
