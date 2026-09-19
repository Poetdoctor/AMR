import type { Dict } from './en'

/**
 * Simplified Chinese.
 *
 * Machine-drafted, awaiting review by a fluent team member — edit freely; this
 * file is the source of truth for Chinese chrome, not a cache of anything.
 *
 * Things a reviewer should check that an ordinary review would not:
 *
 *   1. **Register.** The English is deliberately plain and direct — it is
 *      written for somebody who has just been handed a diagnosis, not for a
 *      journal. Chinese medical writing drifts formal very easily; if a
 *      sentence reads like a hospital notice, it has drifted.
 *
 *   2. **“超级细菌” is the word the eighth beat is about.** It should keep the
 *      tabloid alarm it has in English, not read as a clinical term.
 *
 *   3. **`site.short` stays "AMR"** — it is the wordmark in the header lockup,
 *      not prose. In sentences the term is 抗微生物药物耐药性, shortened to
 *      耐药性 where the context is already clear.
 *
 *   4. **Names are transliterated**, not translated: 诺玛·沃什本, 桑尼·卢. If
 *      the team can ask them how they would like to be written, that beats any
 *      convention.
 */
const zh: Dict = {
  site: {
    name: '耐药性——人的那一面',
    short: 'AMR',
    tagline: '人的那一面',
    blurb: 'iGEM UBC 人文实践团队的项目，关于抗微生物药物耐药性对人的心理与社会影响。',
    credit: 'iGEM UBC 人文实践团队',
    noTrackers: '没有数据分析。没有追踪器。你在这里输入的任何内容都不会被记录。',
  },

  nav: {
    primary: '主导航',
    menu: '菜单',
    close: '关闭',
    learn: '了解',
    stories: '故事',
    tool: '就诊准备',
    community: '社群',
    team: '团队',
    mission: '我们的工作',
  },

  footer: {
    read: '阅读',
    use: '使用',
    about: '关于',
    narrative: '这段叙事',
    toolLong: '为就诊做准备',
  },

  skip: '跳到主要内容',

  disclaimer: {
    lead: '这是科普内容，不是医疗建议。',
    body: '本网站上的一切都是为了提供信息和分享经历。它不是诊断，不是治疗方案，也不能取代向医疗专业人员咨询。如果你对某种感染或某种药物感到担心，请向临床医生咨询。',
  },

  language: {
    label: '语言',
    changed: '语言已切换为简体中文。',
  },

  untranslated: {
    notice: '本页尚未翻译。下面的内容是英文的。',
  },

  home: {
    eyebrow: 'iGEM UBC · 人文实践',
    title: '耐药性被仔细地统计着。人却没有。',
    lede: '患者和临床医生告诉我们的七件事，按它们通常发生的顺序排列。读完大约需要五分钟。',
    start: '开始阅读',
    tryMoving: '试试动态版本',
    tryStill: '切换到静态版本',
    reducedMotion: '你的设备要求减少动态效果，所以这是静态版本。它没有少任何内容。',
    onward: '接下来可以去哪里',
    cards: {
      learn: '耐药性究竟是什么，以及为什么没人解释过。',
      stories: '这七个片段所出自的完整讲述。',
      community: '两位患者都告诉我们，这样的社群并不存在。这是我们的尝试。',
      tool: '在就诊前写下你的问题。任何内容都不会离开你的浏览器。',
      mission: '我们正在为此做什么，以及我们希望什么发生改变。',
      team: '读你故事的那六个人。',
    },
  },

  pages: {
    learn: {
      title: '没人有时间解释的事',
      subhead:
        '用平实语言写的文章，讲科学、讲防护措施，也讲不列颠哥伦比亚省的临床医生告诉我们他们看到的情况。写给刚拿到诊断的人，不是写给期刊的。',
      sources: '参考文献',
      sourcesNote:
        '这些文章基于团队对不列颠哥伦比亚省临床医生与研究者的访谈，以及下列已发表的研究。',
    },
    stories: {
      title: '用他们自己的话说',
      subhead: '来自与耐药感染共处的人的讲述。这里的引语是他们的，未经改动；其余的一切是我们的。',
      bothTitle: '两个人身上共同出现的',
      both1:
        '两个人，两种不同的疾病，还有一组不断重叠的经历。对一些患者来说，第一个看得见的变化，是医护人员、家人和朋友忽然要穿隔离衣、戴手套才能进房间。这些防护措施是有意义的——耐药细菌正是这样被拦住的——但它们也改变了"被照顾"这件事的感觉。',
      both2:
        '身体上的隔离很快变成社交上的隔离。患者开始怀疑自己对身边的人是不是一种危险。有些人因为怕传染而疏远伴侣或家人。另一些人开始把自己看成"脏的"，或者有传染性的。我们访谈的感染科医生补充了患者在房间里看不到的一点：被隔离的患者与医疗团队的接触往往更少、更短，而这本身就是一种伤害。',
      both3:
        '诺玛和桑尼都各自找到了自己的办法——一个教会和一位会祷告的朋友，一群网上的朋友——而没有人向他们提供过任何东西。两人还各自提到了同一个缺失：没有一个可以联系的耐药感染患者社群，而两人都说他们会珍视这样一个社群。',
      calloutTitle: '正是最后这一点，才有了"社群"这个板块',
      calloutBody:
        '如果你经历过这里面的任何一部分，你不是第一个——只是从来没有人把你和其他人放进同一个房间。用你喜欢的任何名字发帖。每一条内容在出现之前都有人阅读。',
      calloutAction: '前往社群',
    },
    team: {
      eyebrow: '我们是谁',
      title: '读你故事的那六个人',
      subhead:
        '我们是 iGEM UBC 的人文实践小组。如果你写信给我们，回信的就是我们其中一个人。中间没有任何收件箱。',
      igemTitle: '一段话讲清 iGEM',
      igemBody:
        'iGEM 是一项国际竞赛，学生团队用一年时间在合成生物学领域做出一样东西。每支队伍都有一个人文实践小组，负责追问：正在做的这样东西，究竟有没有人真正需要，又是谁需要。那个小组就是我们。',
      jamboree: '在 Grand Jamboree 上的全球 iGEM 社群。',
    },
    community: {
      title: '一个可以把它说出口的地方',
      subhead:
        '我们访谈的两位患者分别告诉我们同一件事：这样的社群并不存在。这是我们建立一个的尝试。',
      openingSoon: '即将开放',
      openingSoonBody: '这个板块已经建好，但还没有接通。等团队把设置做完，它就会开放。',
      latest: '最新的亲历讲述',
      empty:
        '还没有人写过任何东西。如果你经历过这里面的任何一部分，你会是第一个——也会是下一个人来到这页时它不再空着的原因。',
      glossary: '耐药性词汇表',
    },
    mission: {
      eyebrow: '我们的工作',
      title: '我们在做什么，为什么做',
      subhead:
        '三个阶段，依次进行。文献梳理已经完成；我们正处在第二个阶段的开头，而这正是需要你的地方。',
      stage: '第 {n} 阶段 — ',
      s1Title: '问题',
      s1a: '人们通常用数字来统计耐药性：开出的处方、耐药样本、住院天数、金额。不列颠哥伦比亚省拥有全世界最好的这类数据之一：十九年的记录，五千一百万张处方，还有一个让幼儿抗生素使用量减少一半以上的合理用药项目。这确实是很扎实的工作，而它描述的是一种细菌，不是一个人。',
      s1b: '这个春天我们把能找到的、关于另一面的材料都读了一遍，有三件事格外突出。现有资料大多来自医院样本，这就系统性地漏掉了那些最不可能出现在医院记录里的人。真正直接询问患者的研究规模都很小，散落在不同国家、不同感染之间，而且几乎没有一项来自不列颠哥伦比亚省。可即便如此，同样的障碍还是在每一项研究里浮现：羞耻、孤立、沉默、费用，以及一个再简单不过的事实——没人解释过那个诊断。',
      s1c: '这份负担的分布也不均匀。我们的梳理一次又一次落到同样几个群体身上：长期照护机构里的人、无家可归者、难民、基础设施长期投入不足的原住民社区、癌症患者、新生儿，以及陪在他们身边的医护人员。耐药性沿着原本就存在的裂缝走。这让它成为一个公平问题，而不只是微生物学问题。',
      s2Title: '我们正在做的',
      s2a: '阅读已经完成，之后我们一直在向那些从内部了解这件事的人学习。UBC 健康与基因组学加拿大研究讲席教授 Bob Hancock 带我们梳理了科学本身，以及公众理解落后的地方。感染科医生 Richard Lester 让我们看到这件事在诊室里是什么样子。而与血管炎和长期抗生素依赖共处、同时也是不列颠哥伦比亚省抗菌药物管理项目患者伙伴的桑尼·卢，一直在塑造我们问什么、以及怎么问。现在，我们要去找那些论文所写的人本身。',
      card1Title: '去问那些亲身经历过的人。',
      card1Body:
        '问卷、一对一访谈和书面讲述，来自患者，来自照顾过他们的家人和朋友，也来自在不列颠哥伦比亚省治疗这些感染的护士和医生。',
      card2Title: '用他们的话，把障碍说出来。',
      card2Body:
        '把听到的东西整理成一张诚实的地图，标出人们真正遇到的心理与社会障碍，从每个社区已经拥有的东西出发，而不是从它缺什么出发。',
      card3Title: '解决"没人解释"这个问题。',
      card3Body:
        '我们和 UBC Geering Up 一起为中小学生开发耐药性教学内容，并在社交平台上发布患者与临床医生的访谈，因为"没人告诉过我"出现得太频繁，无法忽视。',
      card4Title: '把它带回实验台。',
      card4Body:
        '用这张地图指导我们自己团队的实验工作，并把全部成果以平实的语言免费发表，既写给研究者，也写给患者。',
      s3Title: '我们希望什么发生改变',
      s3a: '希望耐药感染的患者被问到的是"你最近怎么样"，而不只是"伤口看起来怎么样"。希望没有人在隔离病房里待上一周，却始终没被告知为什么——而且要用他能对家人复述的话来告诉他。希望不列颠哥伦比亚省至少拥有来自患者这一侧的证据，好让下一份在这里写下的策略，是为受冲击最重的人而建，而不是绕开他们而建。也希望下一支为耐药性设计方案的学生团队，能从阅读患者说过的话开始，因为这些话已经存在，而且很容易找到。',
      s3b: '我们只是一支本科生团队，只有一季的时间。我们解决不了这个问题。但我们可以让它属于人的那一面，更难被忽视。',
      calloutTitle: '第二阶段只有在人们愿意和我们说话时才成立',
      calloutBody:
        '上面的一切，都取决于我们能否听到亲身经历过的人的声音。如果你是其中之一，你的十分钟会改变我们能说出什么。',
      share: '分享你的经历',
      shareSoon: '我们正在搭建提交表单。它很快就会开放。',
    },
  },

  narrative: {
    act: '第 {n} 幕',
    readMore: '继续阅读',
    translatedQuote: '译自英文',
    showOriginal: '查看原话',
  },

  tool: {
    eyebrow: '就诊准备',
    title: '带着已经写好的问题走进去',
    subhead: '就诊过得很快。这里可以让你在进入诊室之前，先理清自己想问什么、想让对方明白什么。',
    privacyTitle: '你在这里输入的任何内容都不会离开这一页',
    privacyBody:
      '这份工作表完全在你的浏览器里运行。没有账号，没有服务器，什么都不会被记录——就算我们想读你在这里写的内容也做不到。在你把它打印出来或关掉这个标签页之前，它都只属于你。',
    privacyShared:
      '如果你用的是共用或公共电脑，请让保存功能保持关闭，并在离开前把这份表打印或下载下来。',
    restored: '已从这个浏览器里保存的副本恢复。',

    basics: '基本情况',
    basicsNote: '全部可选——只填那些放在眼前对你有用的。',
    withWho: '就诊对象',
    withWhoHint: '医生姓名或诊所',
    when: '时间',
    whenHint: '日期和时间',
    diagnosis: '别人告诉你，你得的是什么',
    diagnosisHint: '就用别人告诉你的原话',
    medications: '你正在用的药',
    medicationsHint: '药名，如果知道剂量也写上',

    happening: '最近发生了什么',
    sinceLast: '自上次就诊以来',
    sinceLastHint:
      '变化、新出现的症状、任何让你担心的事。列几条就行——这是给你自己的，不是要被批改的。',

    questions: '要问的问题',
    questionsNote:
      '勾选你希望出现在表上的问题。这些来自患者告诉我们"当时真希望问了"的事，以及临床医生告诉我们"真希望有人问我"的事。',

    notClinical: '不属于临床的那一部分',
    affecting: '这件事实际上对你有什么影响',
    affectingHint:
      '睡眠、工作、金钱、家人、情绪，还有你已经不再做的那些事。一位患者告诉我们，最难的地方是别人只问她伤口看起来怎么样。',
    leaveWith: '你希望带着什么离开',
    leaveWithHint: '一个决定、一段可以复述给家人的解释、一次转诊、下一次检查的日期。',

    sheet: '你的表',
    sheetNote: '打印出来的就是这个。',
    print: '打印',
    download: '下载',
    copy: '复制',
    keepTitle: '把它保存在这台设备上',
    keepBody:
      '只会把你的回答保存在这个浏览器里，这样你回来时它们还在。关掉这个选项会把它们清除。在共用电脑上请让它保持关闭。',
    clear: '清空整份工作表',

    sheetTitle: '就诊准备',
    sheetQuestions: '我想问的问题',
    sheetOwnQuestions: '我自己的问题',
    sheetWith: '就诊对象',
    sheetDiagnosis: '别人告诉我，我得的是什么',
    sheetMedications: '我正在用的药',
    sheetHappening: '最近发生了什么',
    sheetAffecting: '这件事实际上对我有什么影响',
    sheetLeaveWith: '我希望带着什么离开',
    ownQuestionPlaceholder: '输入一个问题，然后按回车',
    sheetEmpty: '你填表的时候，这份表会在这里逐渐成形。你输入的任何内容都不会离开这一页。',
    sheetDisclaimer:
      '这是科普内容，不是医疗建议。这份工作表供你个人使用，不能取代向医疗专业人员咨询。',
    prepared: '制作于 {date}',
    ownTitle: '你自己的问题',
    ownNote: '上面的列表没有涵盖的任何事。这才是最要紧的部分。',
    add: '添加',
    remove: '移除',
    removeLabel: '问题：{q}',

    statusSavingOn: '已开启在此浏览器中的保存。',
    statusSavingOff: '保存已关闭，此前保存的内容都已清除。',
    statusCleared: '工作表已清空。',
    statusCopied: '已复制到你的剪贴板。',
    statusCopyBlocked: '你的浏览器拦截了剪贴板。请改用下载或打印。',
    statusDownloaded: '已下载为 visit-preparation.txt。',
  },

  titles: {
    learn: '了解',
    stories: '故事',
    tool: '为就诊做准备',
    community: '社群',
    share: '分享一段经历',
    team: '团队',
    mission: '我们的工作',
    notFound: '找不到页面',
  },

  notFound: {
    eyebrow: '404',
    title: '这个页面不在这里',
    body: '链接可能已经过期，或者这个板块还没有发布。',
    home: '回到开头',
    mission: '我们在做的事',
  },
}

export default zh
