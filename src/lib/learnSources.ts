/**
 * Academic sources cited at the foot of the Learn landing page, from the works
 * cited of the team's own narrative document.
 *
 * Its own module rather than part of `content.ts`, because it is the one thing
 * there that is not read off disk — which also means it can be imported by the
 * test scripts, where `content.ts` cannot be: that file's `import.meta.glob`
 * calls only exist under Vite.
 *
 * Not translated, and not a candidate for it: a citation is the reference as
 * published, and rewriting an author, journal or title in another language
 * makes the source harder to find rather than easier.
 */
export const LEARN_SOURCES = [
  {
    citation:
      'Crago, A.-L., Alexandre, S., Abdesselam, K., Gravel Tropper, D., Hartmann, M., Smith, G., & Lary, T. (2022). Understanding Canadians’ knowledge, attitudes and practices related to antimicrobial resistance and antibiotic use: Results from public opinion research. Canada Communicable Disease Report, 48(11/12).',
    href: 'https://doi.org/10.14745/ccdr.v48i1112a08',
  },
  {
    citation:
      'Mellinghoff, S. C., Grossi, A. A., Recanatini, C., Breull-Wierschem, L., Salm, F., Gadebusch-Bondio, M., & Jung, N. (2026). The human cost of resistance: ethical implications of coping with isolation for multidrug resistant organisms. Clinical Microbiology and Infection, 32(8), 1244–1249.',
    href: 'https://doi.org/10.1016/j.cmi.2026.05.043',
  },
] as const
