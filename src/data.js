export const factions = [
  // {
  //   key: 'wushili',
  //   value: '无势力'
  // },
  {
    key: 'fei',
    value: '匪'
  },
  {
    key: 'qi',
    value: '齐'
  },
  {
    key: 'yan',
    value: '燕'
  },
  {
    key: 'chu',
    value: '楚'
  },
  {
    key: 'qin',
    value: '秦'
  },
  {
    key: 'han',
    value: '韩'
  },
  {
    key: 'zhao',
    value: '赵'
  },
  {
    key: 'wei',
    value: '魏'
  },
  {
    key: 'zhangchu',
    value: '张楚',
    black: true
  },
  {
    key: 'xichu',
    value: '西楚',
    black: true
  },
  {
    key: 'xihan',
    value: '西汉'
  },
  {
    key: 'donghan',
    value: '东汉'
  },
  {
    key: 'huangjin',
    value: '黄巾'
  },
  {
    key: 'caowei',
    value: '曹魏'
  },
  {
    key: 'shuhan',
    value: '蜀汉'
  },
  {
    key: 'sunwu',
    value: '孙吴'
  },
  {
    key: 'song',
    value: '宋'
  },
  {
    key: 'jin',
    value: '晋'
  }
]

export const rarities = [
  {
    key: '',
    value: '无'
  },
  {
    key: 'putong',
    value: '普通'
  },
  {
    key: 'xiyou',
    value: '稀有'
  },
  {
    key: 'shishi',
    value: '史诗'
  },
  {
    key: 'chuanshuo',
    value: '传说'
  }
]

export const defaultForm = {
  name: '荆轲',
  maxHP: 6,
  maxCards: 3,
  faction: 'yan',
  rarity: '',
  skills: [
    {
      id: -1,
      key: '图穷匕见',
      value: '<span.yellow>出牌阶段限1次</span>，当你失去最后手牌时，添加1张“徐夫人匕首”和1张杀到你的手牌。',
      isChild: false,
    },
    {
      id: -2,
      key: '把袖而揕',
      value: '<span.yellow>出牌阶段限1次</span>，你可以交给一名其他角色1张手牌，令你与其的距离变为1，并且你对其造成的下一次伤害+1，直到回合结束。',
      isChild: false,
    },
    {
      id: -3,
      key: '持匕掷柱',
      value: '当你的杀被抵消后，你可以弃置1张武器牌，对该角色造成1点伤害。',
      isChild: false,
    }
  ],
  topLeftText: '插画：',
  topRightText: '设计师：',
  nameColor: 'white',
  nameShadow: 'black',
  nameSpacing: 0,
  nameTransX: 0,
  nameTransY: 0,
  customCss: ''
}