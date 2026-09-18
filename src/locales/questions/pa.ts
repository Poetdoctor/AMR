import type { QuestionCopy } from '@/lib/visitPrep'

/**
 * The visit-prep question bank in Punjabi.
 *
 * Machine-drafted, awaiting review by a fluent team member.
 *
 * This one is worth more care than its length suggests. It is the only thing on
 * the site somebody prints and carries into an appointment, and a question
 * phrased awkwardly is a question they will not ask out loud. Read each one as
 * though about to say it to a doctor who is already standing up to leave: if it
 * sounds like a form, rewrite it until it sounds like a person.
 *
 * Where a clinical loanword is what people actually say — ਡਾਕਟਰ, ਟੈਸਟ,
 * ਐਂਟੀਬਾਇਓਟਿਕ, ਰਿਪੋਰਟ — keep it rather than reaching for a coinage nobody uses
 * out loud. This sheet gets read aloud in a room, not marked by an examiner.
 */
const pa: QuestionCopy = {
  infection: {
    label: 'ਲਾਗ ਬਾਰੇ',
    note: 'ਮਰੀਜ਼ਾਂ ਨੇ ਸਾਨੂੰ ਸਭ ਤੋਂ ਵੱਧ ਇਹੀ ਦੱਸਿਆ ਕਿ ਕਿਸੇ ਨੇ ਤਸ਼ਖ਼ੀਸ ਸਮਝਾਈ ਹੀ ਨਹੀਂ ਸੀ।',
    questions: {
      organism: 'ਇਹ ਜੀਵਾਣੂ ਠੀਕ-ਠੀਕ ਕਿਹੜਾ ਹੈ, ਅਤੇ ਇਹ ਕਿਨ੍ਹਾਂ ਦਵਾਈਆਂ ਖ਼ਿਲਾਫ਼ ਪ੍ਰਤੀਰੋਧੀ ਹੈ?',
      'same-again': 'ਕੀ ਇਹ ਉਹੀ ਪੁਰਾਣੀ ਲਾਗ ਵਾਪਸ ਆਈ ਹੈ, ਜਾਂ ਕੋਈ ਨਵੀਂ?',
      'what-rules-out':
        'ਮੇਰੇ ਮਾਮਲੇ ਵਿੱਚ "ਪ੍ਰਤੀਰੋਧੀ" ਦਾ ਕੀ ਮਤਲਬ ਹੈ — ਇਹ ਅਸਲ ਵਿੱਚ ਕਿਹੜੇ ਇਲਾਜ ਬਾਹਰ ਕਰ ਦਿੰਦਾ ਹੈ?',
      'how-caught': 'ਕੀ ਸਾਨੂੰ ਪਤਾ ਹੈ ਕਿ ਮੈਨੂੰ ਇਹ ਕਿਵੇਂ ਲੱਗੀ, ਅਤੇ ਕੀ ਇਸ ਨਾਲ ਅੱਗੇ ਕੁਝ ਬਦਲਦਾ ਹੈ?',
    },
  },

  treatment: {
    label: 'ਇਲਾਜ ਬਾਰੇ',
    note: 'ਇੱਕ ਮਰੀਜ਼ ਨੇ ਖ਼ਾਸ ਕਰਕੇ ਇਹ ਮੰਗਿਆ ਕਿ ਉਸ ਨੂੰ ਸੋਚ ਦੱਸੀ ਜਾਵੇ, ਸਿਰਫ਼ ਨਤੀਜਾ ਨਾ ਫੜਾਇਆ ਜਾਵੇ।',
    questions: {
      'why-this': 'ਜੋ ਹੋਰ ਬਦਲ ਤੁਸੀਂ ਸੋਚੇ ਸਨ, ਉਨ੍ਹਾਂ ਦੀ ਥਾਂ ਇਹ ਇਲਾਜ ਕਿਉਂ?',
      'side-effects':
        'ਮੈਨੂੰ ਕਿਹੜੇ ਮਾੜੇ ਅਸਰ ਦੀ ਉਮੀਦ ਰੱਖਣੀ ਚਾਹੀਦੀ ਹੈ, ਅਤੇ ਕਿਹੜੇ ਹੋਣ ਉੱਤੇ ਮੈਨੂੰ ਕਿਸੇ ਨੂੰ ਫ਼ੋਨ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ?',
      'how-long': 'ਇਹ ਕੋਰਸ ਕਿੰਨਾ ਲੰਮਾ ਹੈ, ਅਤੇ ਸਾਨੂੰ ਕਿਵੇਂ ਪਤਾ ਲੱਗੇਗਾ ਕਿ ਇਸ ਨੇ ਕੰਮ ਕੀਤਾ?',
      'oral-or-iv': 'ਕੀ ਮੂੰਹ ਰਾਹੀਂ ਲੈਣ ਦਾ ਕੋਈ ਬਦਲ ਹੈ, ਜਾਂ ਇਹ ਨਾੜ ਰਾਹੀਂ ਹੀ ਹੋਣਾ ਜ਼ਰੂਰੀ ਹੈ?',
      'if-not-working': 'ਜੇ ਇਹ ਵਾਲਾ ਕੰਮ ਨਾ ਕਰੇ ਤਾਂ ਫਿਰ ਕੀ ਹੁੰਦਾ ਹੈ?',
    },
  },

  precautions: {
    label: 'ਬਚਾਅ ਦੇ ਉਪਾਵਾਂ ਅਤੇ ਟੈਸਟਾਂ ਬਾਰੇ',
    note: 'ਡਾਕਟਰਾਂ ਨੇ ਸਾਨੂੰ ਦੱਸਿਆ ਕਿ ਬਚਾਅ ਦੇ ਉਪਾਅ ਅਕਸਰ ਬਿਨਾਂ ਸਮਝਾਏ ਸ਼ੁਰੂ ਹੋ ਜਾਂਦੇ ਹਨ, ਅਤੇ ਦੁਬਾਰਾ ਜਾਂਚ ਦੇਰ ਨਾਲ ਹੁੰਦੀ ਹੈ।',
    questions: {
      'why-precautions': 'ਮੇਰੇ ਉੱਤੇ ਇਹ ਉਪਾਅ ਕਿਉਂ ਲਾਗੂ ਹਨ, ਅਤੇ ਹਟਣ ਲਈ ਕੀ ਬਦਲਣਾ ਪਵੇਗਾ?',
      retest: 'ਅਗਲਾ ਟੈਸਟ ਕਦੋਂ ਹੋਵੇਗਾ ਤਾਂ ਜੋ ਪਤਾ ਲੱਗੇ ਕਿ ਇਹ ਹਾਲੇ ਵੀ ਲੋੜੀਂਦੇ ਹਨ ਜਾਂ ਨਹੀਂ?',
      'what-test': 'ਇਸ ਟੈਸਟ ਵਿੱਚ ਕੀ ਹੋਵੇਗਾ, ਅਤੇ ਨਤੀਜਾ ਕਦੋਂ ਮਿਲੇਗਾ?',
      'explain-to-family':
        'ਇਹ ਉਪਾਅ ਤੁਸੀਂ ਮੇਰੇ ਪਰਿਵਾਰ ਨੂੰ ਕਿਵੇਂ ਸਮਝਾਓਗੇ, ਉਨ੍ਹਾਂ ਸ਼ਬਦਾਂ ਵਿੱਚ ਜੋ ਮੈਂ ਦੁਹਰਾ ਸਕਾਂ?',
    },
  },

  life: {
    label: 'ਇਸ ਨੂੰ ਆਪਣੀ ਜ਼ਿੰਦਗੀ ਵਿੱਚ ਢਾਲਣ ਬਾਰੇ',
    note: 'ਕਾਗਜ਼ ਉੱਤੇ ਸਭ ਤੋਂ ਵਧੀਆ ਇਲਾਜ ਹਮੇਸ਼ਾ ਉਹ ਨਹੀਂ ਹੁੰਦਾ ਜੋ ਆਲੇ-ਦੁਆਲੇ ਦੀ ਜ਼ਿੰਦਗੀ ਵਿੱਚ ਫਿੱਟ ਬੈਠੇ।',
    questions: {
      'how-many': 'ਇਹ ਅੰਦਾਜ਼ਨ ਹੋਰ ਕਿੰਨੀਆਂ ਮੁਲਾਕਾਤਾਂ ਬਣੇਗਾ?',
      closer: 'ਕੀ ਘਰ ਦੇ ਨੇੜੇ ਕੋਈ ਥਾਂ ਹੈ ਜਿੱਥੇ ਮੈਂ ਇਹ ਕਰਵਾ ਸਕਾਂ?',
      cost: 'ਇਸ ਦਾ ਮੈਨੂੰ ਕਿੰਨਾ ਖ਼ਰਚਾ ਪਵੇਗਾ, ਉਸ ਸਮੇਤ ਜੋ ਕਵਰ ਨਹੀਂ ਹੁੰਦਾ?',
      'work-school': 'ਮੈਂ ਕੰਮ ਵਾਲੀ ਥਾਂ ਜਾਂ ਸਕੂਲ ਨੂੰ ਕੀ ਦੱਸਾਂ, ਅਤੇ ਮੈਂ ਕੀ-ਕੀ ਕਰ ਸਕਦਾ ਹਾਂ?',
    },
  },

  coping: {
    label: 'ਮੈਂ ਇਹ ਸਭ ਕਿਵੇਂ ਝੱਲ ਰਿਹਾ ਹਾਂ, ਇਸ ਬਾਰੇ',
    note: 'ਮੁਲਾਕਾਤਾਂ ਵਿੱਚ ਇਹੀ ਹਿੱਸਾ ਸਭ ਤੋਂ ਵੱਧ ਛੱਡਿਆ ਜਾਂਦਾ ਹੈ, ਅਤੇ ਮਰੀਜ਼ ਸਭ ਤੋਂ ਵੱਧ ਇਹੀ ਚਾਹੁੰਦੇ ਸਨ ਕਿ ਇਹ ਉੱਠੇ।',
    questions: {
      'whole-person':
        'ਕੀ ਅਸੀਂ ਇਸ ਬਾਰੇ ਗੱਲ ਕਰ ਸਕਦੇ ਹਾਂ ਕਿ ਮੈਂ ਅਸਲ ਵਿੱਚ ਕਿਵੇਂ ਹਾਂ, ਸਿਰਫ਼ ਇਹ ਨਹੀਂ ਕਿ ਲਾਗ ਕਿਹੋ ਜਿਹੀ ਲੱਗਦੀ ਹੈ?',
      'mental-support': 'ਕੀ ਇਸ ਦੇ ਮਾਨਸਿਕ ਪੱਖ ਲਈ ਕੋਈ ਸਹਾਇਤਾ ਹੈ, ਅਤੇ ਕੀ ਉਸ ਦਾ ਮੈਨੂੰ ਕੋਈ ਖ਼ਰਚਾ ਪਵੇਗਾ?',
      'family-safe': 'ਕੀ ਮੇਰਾ ਆਪਣੇ ਪਰਿਵਾਰ ਅਤੇ ਨਾਲ ਰਹਿੰਦੇ ਲੋਕਾਂ ਦੇ ਨੇੜੇ ਹੋਣਾ ਸੁਰੱਖਿਅਤ ਹੈ?',
      others: 'ਕੀ ਕੋਈ ਹੋਰ ਹੈ ਜੋ ਇਹੀ ਕੁਝ ਹੰਢਾ ਰਿਹਾ ਹੋਵੇ ਅਤੇ ਜਿਸ ਨਾਲ ਮੈਂ ਗੱਲ ਕਰ ਸਕਾਂ?',
    },
  },
}

export default pa
