/**
 * The six narrative beats for Home.
 *
 * One source of truth for both paths. The 3D scroll sequence and the flat
 * fallback render the same beats in the same order with the same words — the
 * only difference is whether a camera moves through space or the panels
 * cross-fade. Anything written here appears in both, so the reduced-motion
 * version can never quietly lose content.
 *
 * Every quote is verbatim from docs/doc-a-amr-beyond-the-diagnosis.pdf.
 * `scene` names the abstract shape the 3D path draws at that stop — deliberately
 * geometry, not illustration: nobody on the team is a 3D artist, and the beat
 * about isolation does not need to look like a hospital room to land.
 */

export type SceneId =
  'descent' | 'selection' | 'gap' | 'enclosure' | 'corridor' | 'convergence' | 'wider'

export interface Quote {
  text: string
  attribution: string
}

export interface Beat {
  id: string
  eyebrow: string
  heading: string
  body: string[]
  quote?: Quote
  scene: SceneId
}

export const BEATS: Beat[] = [
  {
    id: 'hook',
    eyebrow: 'One',
    heading: "It isn't one bad day",
    scene: 'descent',
    quote: {
      text: "A sinking feeling is what you feel first: I've had this before and oh no, it's happening again.",
      attribution: 'Norma Washburn, AMR patient',
    },
    body: [
      'Initial hope, then despair, then encouragement, and ultimately back down in the dumps. That is the rollercoaster patients living with antimicrobial resistance describe — not a single bad day, a cycle that keeps returning.',
      'It can show up in the body as well as the mind. One patient described collapsing to the ground with exhaustion after repeated courses of antibiotics.',
    ],
  },
  {
    id: 'mechanism',
    eyebrow: 'Two',
    heading: 'You did not become resistant. The bacteria did.',
    scene: 'selection',
    quote: {
      text: 'Reinforce that bacteria are resistant — not the patient.',
      attribution: 'Dr. Edith Blondel-Hill, infectious disease physician',
    },
    body: [
      'This is the most common misunderstanding, and the most damaging. Antibiotics kill the bacteria they can reach; every so often one survives, and its descendants inherit whatever let it survive. Resistance is a property of a bacterial population, not of a person’s body.',
      'The word people meet instead is “superbug”, and it usually arrives from outside the clinic. Norma heard it from her own daughter: “Mom, this is what you got — a superbug!” People hear it and assume nothing will work. Usually something still does; resistance makes the list shorter and the treatment harder.',
    ],
  },
  {
    id: 'gap',
    eyebrow: 'Three',
    heading: 'Treated quickly, heard slowly',
    scene: 'gap',
    quote: {
      text: 'I want others to understand how I feel and stop long enough to allow me to share how I feel instead of going straight into…the treatment',
      attribution: 'Sunny Loo, vasculitis patient',
    },
    body: [
      'Not a request for different medicine. A request for the moment before it. Norma put the same thing from the other side: “It seems they have just decided that their priority is getting through patients after patients, but it leaves the patient feeling less than prepared to face what they need.”',
      'Clinicians described the same gap. Dr. Anthony Liu told us that as physicians specialise, they lose the basics of a condition and debrief patients on them less. Nobody decides to stop explaining. It stops being anybody’s job.',
    ],
  },
  {
    id: 'isolation',
    eyebrow: 'Four',
    heading: 'Physical distance becomes social distance',
    scene: 'enclosure',
    body: [
      'For many people the first visible change is not a conversation. It is that staff, then family, then friends start putting on gowns and gloves before coming into the room.',
      'The precautions are necessary. What follows them often is not. A patient begins wondering whether they are dangerous to the people around them. Some pull away from partners, from family, from a new baby. Others begin to describe themselves as dirty, or contagious — words about character, applied to a culture result.',
      'Both patients we spoke to had found their own way through: for Norma, the church and a friend who believes in the power of prayer; for Sunny, online games with friends. Neither had been offered anything. Both raised the same absence — there is no community of AMR patients to connect with, and both said they would value one.',
    ],
  },
  {
    id: 'life',
    eyebrow: 'Five',
    heading: 'Treatment has to fit a life',
    scene: 'corridor',
    body: [
      'Eventually the patient leaves the hospital room and the infection goes with them — but so does everything else in their life: work, school, dependents, relationships, money.',
      'A resistant infection can mean repeat appointments, more testing, specialist visits, longer courses. Someone near a major hospital manages. Someone in a smaller community may not have the same access, and every appointment carries another cost. Norma once collapsed from going to the hospital so much.',
      'Even the form matters. Some intravenous treatments need refrigeration that is not practical for every household. The best treatment on paper is not always the best fit for somebody’s life.',
    ],
  },
  {
    id: 'whole',
    eyebrow: 'Six',
    heading: 'We fail to address the whole person',
    scene: 'convergence',
    quote: {
      text: 'When we talk about our experience, we are just asking to be understood, to be supported.',
      attribution: 'Sunny Loo',
    },
    body: [
      'Preventing and treating resistant infections needs better diagnostics, effective antibiotics and responsible prescribing. Our conversations suggest it also needs communication, education and empathy.',
      '“We fail to address the whole person,” Norma told us. AMR is not only a question of whether a drug can kill a bacterium. It is a person’s social, psychological and spiritual health, running alongside the infection the whole way.',
    ],
  },
  {
    id: 'wider',
    eyebrow: 'And beyond this',
    heading: 'The same shape, across different infections',
    scene: 'wider',
    body: [
      'Mechanism misunderstood, distress dismissed, isolation, then the sheer weight of the treatment. That pattern turned up in every conversation, across different conditions — it is not specific to any one organism.',
      'Our team’s diagnostic work is one concrete example inside that picture, not the frame around it.',
    ],
  },
]
