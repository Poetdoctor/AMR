import type { NarrativeCopy } from '@/lib/beats'

/**
 * The Home narrative in Simplified Chinese.
 *
 * Machine-drafted, awaiting review by a fluent team member.
 *
 * Notes for that reviewer:
 *
 *   1. **The quotes are people's own sentences**, translated so a reader who
 *      only reads Chinese can hear what was said. The site shows them as
 *      translations and keeps the English original one click away. Translate
 *      for how somebody actually speaks — these were said out loud, in
 *      interviews, by two people describing the worst stretch of their lives.
 *
 *   2. **Names are transliterated**, not translated: 诺玛·沃什本 (Norma
 *      Washburn), 桑尼·卢 (Sunny Loo). If the team can ask them how they would
 *      like to be written in Chinese, that beats any convention.
 *
 *   3. **`words` are drawn in the 3D scenes.** Chinese runs much shorter than
 *      English per character but each glyph is full-width, so a six-character
 *      fragment is about as wide as a ten-letter English one. They fit; keep
 *      them to roughly this length.
 *
 *   4. **“超级细菌” (superbug) is the word the whole eighth beat is about.**
 *      It should read as the tabloid word it is, not as a clinical term.
 */
const zh: NarrativeCopy = {
  acts: {
    1: '有些事不对劲',
    2: '没人明白我背负着什么',
    3: '感染不是故事的全部',
    4: '当有人看见完整的人，疗愈才开始',
  },

  beats: {
    fall: {
      title: '坠落',
      words: ['希望', '又来了？', '恐惧'],
      quotes: [
        {
          text: '最先感觉到的是心往下沉：这个我以前得过，糟了，又来了。',
          attribution: '诺玛·沃什本，耐药感染患者',
        },
        {
          text: '我的敷料换了好几个月，但我一直怕它再发作。',
          attribution: '诺玛·沃什本',
        },
      ],
      body: [
        '没有什么戏剧性的事发生。没有哪一刻是会被写进病历的。只有一个结果，或一句话，或一个眼神——然后地面就不再是一秒钟前的位置了。',
      ],
    },

    rollercoaster: {
      title: '过山车',
      words: ['高兴', '绝望', '受到鼓舞', '又跌回谷底'],
      quotes: [
        {
          text: '但能有专科人员替你换这些敷料，是一种解脱。',
          attribution: '诺玛·沃什本',
        },
      ],
      body: [
        '起初是希望和高兴，然后是绝望，然后受到鼓舞，最后又跌回谷底。患者们一次又一次地向我们描述同样的曲线。这不是在描述一种疾病——这是反复发作的疾病对一个人做的事。',
        '人没有动。动的是地面。',
      ],
    },

    weight: {
      title: '看不见的重量',
      words: ['再来一个疗程', '又一个', '够了'],
      quotes: [],
      body: [
        '每一个疗程的抗生素都是又一件要熬过去的事。它们会累积。没人去数，因为单独看每一个都合情合理。',
        '这种潜在的绝望会以身体的方式显现出来。在反复使用抗生素之后，诺玛因为精疲力竭而倒在地上。不是因为感染。是因为治疗。',
      ],
    },

    corridor: {
      title: '看不见你的医院',
      words: ['诊断', '处方', '化验', '操作'],
      quotes: [
        {
          text: '我希望别人能理解我的感受，能停下来听我说完，而不是直接进入……治疗',
          attribution: '桑尼·卢，血管炎患者',
        },
        {
          text: '我希望我的医生能问问我感觉怎么样……但如果我真问了，他们会直接把我转去心理咨询。',
          attribution: '桑尼·卢——而心理咨询要自费',
        },
        {
          text: '看起来他们只是认定，优先要做的是一个接一个地看完病人，可这让病人根本没准备好去面对自己要面对的事。',
          attribution: '诺玛·沃什本',
        },
      ],
      body: [
        '这里每个人都很称职，每个人也都很忙。加拿大医生短缺，不列颠哥伦比亚省也一样，要腾出时间与人建立联系确实很难。',
        '那些话还是准时送到了。没有人问过背负着它们的那个人任何问题。',
      ],
    },

    machine: {
      title: '缺失的解释',
      words: ['为什么是这个？', '为什么是现在？', '没人说过'],
      quotes: [
        {
          text: '他们忙着给我置入 PICC 导管，只告诉我需要这个，而我能听懂完全是因为我有一点护理经验……换了别人会非常非常害怕……大家都没时间向病人解释。',
          attribution: '一位受访者，在团队的访谈中',
        },
        {
          text: '请把这件事当成优先事项：如果医生对某种药有顾虑，正在几个方案之间犹豫，就告诉病人有这些顾虑……应该让病人知情，让他们清楚可能的结果。',
          attribution: '诺玛·沃什本',
        },
      ],
      body: [
        '拭子、导管、影像检查、结果。每一项都有理由，而理由留在机器里面。',
        '伊迪丝·布隆代尔-希尔医生告诉我们，部分耐药性筛查会侵犯患者的隐私和体面——反复采样，包括肛拭子。如果事先没有好好说明，人做完之后的感觉可能是被侵犯，而不是被检查。',
        '诺玛的医生始终没有时间向她解释什么是耐药性，也没说会有哪些副作用。后来出现的并发症成了意外，而一次谈话本可以避免这种意外。',
      ],
    },

    glass: {
      title: '隔离',
      words: ['我危险吗？', '我会传染吗？', '我脏吗？'],
      quotes: [],
      body: [
        '病房没有变。先是医护人员，然后是家人，然后是朋友，进门前都开始穿隔离衣、戴手套——从那时起，这就不是同一间病房了。',
        '这些预防措施是有意义的——它们能阻止耐药细菌扩散。但随之而来的东西并不是任何人想要的。身体上的隔离变成了社交上的隔离。人们因为怕传染而开始疏远伴侣和家人，有些人甚至开始把自己看作是脏的，或者有传染性的。',
        '布隆代尔-希尔医生和刘安东尼医生都提到了患者在病房里看不见的一点：被隔离的患者与医疗团队的接触往往更少、更短，而证据表明这与焦虑、抑郁和污名化有关。',
      ],
    },

    ocean: {
      title: '孤独',
      words: ['没有别人', '哪里都没有', '总该有人吧'],
      quotes: [],
      body: [
        '诺玛和桑尼各自找到了自己的办法。诺玛有教会，还有一位相信祷告力量的朋友，这在隔离的那些日子里帮了她很多。桑尼和朋友一起玩网络游戏，就这样保持着联系。',
        '没有人向他们中的任何一位提供过什么。两人都在没有被问到的情况下提起了同一个缺失：没有一个可以联系的耐药感染患者社群，而两人都说他们会珍视这样一个社群。',
        '他们并不罕见。他们只是彼此之间没有联系。外面的每一盏灯，都是另一个在另一间病房、另一个夜晚被告知同样的话的人。',
      ],
    },

    monster: {
      title: '怪物是一个词',
      words: ['超级细菌', '无法治愈', '注定完蛋', '会传染'],
      quotes: [
        {
          text: '妈妈，你还记得我们小时候，你读给我们听那些关于滥用抗生素、说我们会造出超级细菌的东西吗？妈妈，这就是你得到的——一个超级细菌！',
          attribution: '诺玛的女儿',
        },
      ],
      body: [
        '人们听到“超级细菌”，就以为没有任何抗生素会管用。通常还是有办法的；耐药性让可选的清单变短，让治疗变得更复杂。',
        '而这个词底下藏着最要紧的那个误解：以为是这个人对抗生素产生了耐药性。不是的。产生耐药性的是细菌。',
      ],
    },

    world: {
      title: '医院之外的世界',
      words: ['工作', '学校', '钱', '怎么去'],
      quotes: [
        {
          text: '医生直奔什么病、做什么操作……但这往往只是病人日常牵挂中很小的一部分……大多数病人需要有人顾及心理层面：我带着现在这个身体，要怎么过完今天剩下的时间，明天又要怎么过？',
          attribution: '桑尼·卢',
        },
      ],
      body: [
        '病人最终会离开病房，感染跟着他走——可跟着走的还有工作、学业、要照顾的人、人际关系和钱。一个个预约就钉在这些当中。',
        '住在大医院附近的人还能应付。住在小社区的人可能没有同样的条件，而每一趟路都是又一笔开销。诺玛曾经因为跑医院跑得太多而累倒。',
        '连剂型都有影响：有些静脉治疗需要冷藏，而不是每个家庭都能做到。纸面上最好的治疗，未必最适合一个人的生活。',
      ],
    },

    whole: {
      title: '完整的人',
      words: ['理解', '支持', '沟通', '教育', '联系', '照护'],
      quotes: [
        {
          text: '我们没有照顾到完整的人。',
          attribution: '诺玛·沃什本',
        },
        {
          text: '我们讲述自己的经历时，只是希望被理解，被支持。',
          attribution: '桑尼·卢',
        },
      ],
      body: [
        '这个故事里的一切——病房、家人、细菌、一个个疗程、那些墙、远处的灯光——自始至终都围着同一个人转。',
        '耐药性不只关乎一种药能不能杀死一种细菌。它是一个完整的人穿过某种把他的社会、心理和精神健康都带偏的东西的历程。更好的诊断和更好的抗生素很重要。有人肯停下来问一句，同样重要。',
      ],
    },

    breath: {
      title: '而这从来不是一个人的事',
      words: [],
      quotes: [
        {
          text: '我们讲述自己的经历时，只是希望被理解，被支持。',
          attribution: '桑尼·卢',
        },
      ],
      body: [
        '外面的每一盏灯都曾是某个人。另一间病房，另一个夜晚，另一个被告知同样的话、然后被留下独自背负的人。',
      ],
    },
  },
}

export default zh
