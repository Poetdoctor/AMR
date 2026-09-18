import type { QuestionCopy } from '@/lib/visitPrep'

/**
 * The visit-prep question bank in Simplified Chinese.
 *
 * Machine-drafted, awaiting review by a fluent team member.
 *
 * This one is worth more care than its length suggests. It is the only thing on
 * the site somebody prints and carries into an appointment, and a question
 * phrased awkwardly is a question they will not ask out loud. Read each one as
 * though about to say it to a doctor who is already standing up to leave: if it
 * sounds like a form, rewrite it until it sounds like a person.
 *
 * Keep 您 out of it — the English is direct and unfussy, and 您 throughout
 * would make a patient sound like they are apologising for taking up time,
 * which is the exact posture this sheet exists to correct.
 */
const zh: QuestionCopy = {
  infection: {
    label: '关于这次感染',
    note: '患者告诉我们最多的一件事，就是没有人解释过那个诊断。',
    questions: {
      organism: '具体是哪一种细菌，它对哪些药物耐药？',
      'same-again': '这是之前那次感染又回来了，还是一次新的感染？',
      'what-rules-out': '"耐药"在我这里具体是什么意思——它实际上排除了哪些治疗？',
      'how-caught': '我们知道我是怎么感染上的吗，这会改变后面的处理吗？',
    },
  },

  treatment: {
    label: '关于治疗',
    note: '有位患者特别要求，希望别人把考虑的理由讲给她听，而不只是把结论交给她。',
    questions: {
      'why-this': '为什么选这个治疗，而不是你们考虑过的其他方案？',
      'side-effects': '我该预期哪些副作用，其中哪些出现时我应该打电话找人？',
      'how-long': '这个疗程要多久，我们怎么知道它起作用了？',
      'oral-or-iv': '有口服的选择吗，还是一定要静脉给药？',
      'if-not-working': '如果这个方案没用，接下来会怎么样？',
    },
  },

  precautions: {
    label: '关于防护措施和检查',
    note: '临床医生告诉我们，防护措施常常在没有解释的情况下就开始了，而且复评得很晚。',
    questions: {
      'why-precautions': '我为什么要采取这些防护措施，要发生什么变化才能解除？',
      retest: '我下一次复查是什么时候，好确认是不是还需要这些措施？',
      'what-test': '这项检查具体要做什么，我什么时候能拿到结果？',
      'explain-to-family': '这些防护措施，你会怎么向我的家人解释，用我能复述的话？',
    },
  },

  life: {
    label: '关于把这件事放进我的生活',
    note: '纸面上最好的治疗，未必是最适合它周围那种生活的。',
    questions: {
      'how-many': '大概还要来多少次？',
      closer: '有没有离我家更近的地方可以做这件事？',
      cost: '这会花我多少钱，包括不在保障范围内的部分？',
      'work-school': '我该怎么跟单位或学校说，我还能继续做哪些事？',
    },
  },

  coping: {
    label: '关于我是怎么撑过来的',
    note: '这是就诊时最常被跳过的一部分，也是患者最希望被提到的一部分。',
    questions: {
      'whole-person': '我们能不能聊聊我实际的状态，而不只是感染看起来怎么样？',
      'mental-support': '心理方面有支持吗，会不会需要我自己花钱？',
      'family-safe': '我和家人、还有同住的人靠近，安全吗？',
      others: '有没有别人也在经历同样的事，我可以和他聊聊？',
    },
  },
}

export default zh
