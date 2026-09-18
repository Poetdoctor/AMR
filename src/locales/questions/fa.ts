import type { QuestionCopy } from '@/lib/visitPrep'

/**
 * The visit-prep question bank in Persian.
 *
 * Machine-drafted, awaiting review by a fluent team member.
 *
 * This one is worth more care than its length suggests. It is the only thing on
 * the site somebody prints and carries into an appointment, and a question
 * phrased awkwardly is a question they will not ask out loud. Read each one as
 * though about to say it to a doctor who is already standing up to leave: if it
 * sounds like a form, rewrite it until it sounds like a person.
 *
 * Keep the formal register (شما) throughout — this is a stranger with authority
 * in a clinical setting. And use the Persian letterforms ی and ک, not the
 * Arabic ي and ك.
 */
const fa: QuestionCopy = {
  infection: {
    label: 'دربارهٔ عفونت',
    note: 'چیزی که بیماران بیش از همه به ما گفتند این بود که کسی تشخیص را برایشان توضیح نداده بود.',
    questions: {
      organism: 'دقیقاً چه باکتری‌ای در کار است، و به چه چیزهایی مقاوم است؟',
      'same-again': 'این همان عفونت قبلی است که برگشته، یا یک عفونت تازه؟',
      'what-rules-out': '«مقاوم» در مورد من یعنی چه — عملاً چه درمان‌هایی را کنار می‌گذارد؟',
      'how-caught': 'می‌دانیم چطور به آن مبتلا شدم، و آیا این چیزی را در ادامه عوض می‌کند؟',
    },
  },

  treatment: {
    label: 'دربارهٔ درمان',
    note: 'یک بیمار صریحاً خواست که استدلال پشت تصمیم را برایش توضیح بدهند، نه فقط نتیجه را اعلام کنند.',
    questions: {
      'why-this': 'چرا این درمان، و نه گزینه‌های دیگری که در نظر گرفتید؟',
      'side-effects': 'چه عوارضی را باید انتظار داشته باشم، و کدامشان یعنی باید به کسی زنگ بزنم؟',
      'how-long': 'این دوره چقدر طول می‌کشد، و از کجا می‌فهمیم که جواب داده؟',
      'oral-or-iv': 'گزینهٔ خوراکی هم هست، یا حتماً باید وریدی باشد؟',
      'if-not-working': 'اگر این یکی جواب ندهد، چه می‌شود؟',
    },
  },

  precautions: {
    label: 'دربارهٔ احتیاط‌ها و آزمایش‌ها',
    note: 'پزشکان به ما گفتند احتیاط‌ها اغلب بدون توضیح شروع می‌شوند و دیر بازبینی می‌شوند.',
    questions: {
      'why-precautions':
        'چرا این احتیاط‌ها برای من در نظر گرفته شده، و چه باید بشود تا برداشته شوند؟',
      retest: 'کِی آزمایش بعدی را خواهم داد تا معلوم شود هنوز لازم‌اند یا نه؟',
      'what-test': 'این آزمایش شامل چه چیزی است، و کِی نتیجه‌اش را می‌شنوم؟',
      'explain-to-family':
        'این احتیاط‌ها را به خانواده‌ام چطور توضیح می‌دهید، با کلماتی که بتوانم تکرارشان کنم؟',
    },
  },

  life: {
    label: 'دربارهٔ جا دادن این ماجرا در زندگی‌ام',
    note: 'بهترین درمان روی کاغذ همیشه آن نیست که با زندگی اطرافش جور دربیاید.',
    questions: {
      'how-many': 'این تقریباً چند ویزیت دیگر خواهد بود؟',
      closer: 'جایی نزدیک‌تر به خانه‌ام هست که بتوانم این کار را آنجا انجام بدهم؟',
      cost: 'این برای من چقدر خرج برمی‌دارد، از جمله آنچه تحت پوشش نیست؟',
      'work-school': 'به محل کار یا دانشگاهم چه بگویم، و چه کارهایی را می‌توانم ادامه بدهم؟',
    },
  },

  coping: {
    label: 'دربارهٔ این‌که چطور دارم از پسش برمی‌آیم',
    note: 'این همان بخشی است که بیش از همه در ویزیت‌ها از قلم می‌افتد، و بیماران بیش از همه می‌خواستند مطرح شود.',
    questions: {
      'whole-person': 'می‌شود دربارهٔ این‌که واقعاً حالم چطور است حرف بزنیم، نه فقط وضع عفونت؟',
      'mental-support': 'حمایتی برای جنبهٔ روانی این ماجرا هست، و آیا برایم هزینه‌ای دارد؟',
      'family-safe': 'آیا نزدیک بودن به خانواده‌ام و کسانی که با آن‌ها زندگی می‌کنم خطری ندارد؟',
      others: 'کس دیگری هست که همین را از سر می‌گذراند و بتوانم با او حرف بزنم؟',
    },
  },
}

export default fa
