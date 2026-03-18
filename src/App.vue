<template>
  <div class="app-wrapper">
    <el-row justify="space-evenly" class="main-row">
      <el-col :xs="24" :sm="12">
        <el-card class="form-section">
          <template #header>
            <h3>信息设置</h3>
          </template>
          <el-form :model="form" label-width="auto" style="max-width: 460px; margin: 0 auto;">
            <el-form-item label="姓名">
              <el-input v-model="form.name" placeholder="请输入姓名" clearable />
            </el-form-item>

            <el-form-item label="血量">
              <el-input-number v-model="form.maxHP" :min="0" :max="9" />
            </el-form-item>

            <el-form-item label="手牌上限">
              <el-input-number v-model="form.maxCards" :min="0" :max="9" />
            </el-form-item>

            <el-form-item label="势力">
              <el-button-group>
                <el-button v-for="faction in factions" @click="form.faction = faction.key">{{ faction.value
                }}</el-button>
                <!-- <el-button @click="uploadFactionImage">上传图片</el-button> -->
              </el-button-group>
            </el-form-item>

            <el-form-item v-for="(skill, index) in form.skills" :key="skill.id" :label="'技能' + (index + 1)"
              :prop="'skills.' + index + '.value'">
              <el-input v-model="skill.key" placeholder="技能名" />
              <el-input v-model="skill.value" :autosize="{ minRows: 2 }" type="textarea" placeholder="技能描述" />
              <div style="width: 100%; display: flex; gap: 12px;">
                <el-checkbox v-model="skill.isChild" label="衍生技" />
                <div style="flex: 1"></div>
                <el-button class="mt-2" @click.prevent="removeSkill(skill)">
                  删除
                </el-button>
              </div>
            </el-form-item>
            <el-form-item label=" ">
              <el-button type="primary" @click="addSkill">新技能</el-button>
              <el-popover>
                <template #reference>
                  <el-button>编辑帮助</el-button>
                </template>
                <el-button-group>
                  <el-button @click="copy(v)" v-for="(v, k) in {
                    '♠': '♠',
                    '♣': '♣',
                    '♥': '♥',
                    '♦': '♦',
                    '粗体': '<b>粗体</b>',
                    '斜体': '<i>斜体</i>',
                    '橙色': '<span.orange>橙色</span>',
                    '绿色': '<span.green>绿色</span>',
                    '黄色': '<span.yellow>黄色</span>'
                  }">{{ k }}</el-button>
                </el-button-group>
              </el-popover>
            </el-form-item>

            <el-form-item label="顶部文字">
              <el-input v-model="form.topLeftText" placeholder="左侧文字" clearable />
              <el-input v-model="form.topRightText" placeholder="右侧文字" clearable />
            </el-form-item>

            <el-form-item label="图片">
              <ImageCropper v-model:image="images.bgImage" :aspectRatio="[63, 88]">
                上传背景图
              </ImageCropper>
              <ImageCropper v-model:image="images.fgImage" :aspectRatio="[69, 94]">
                上传前景图
              </ImageCropper>
              <el-button @click="images.fgImage = ''">清除前景图</el-button>
            </el-form-item>

            <el-form-item>
              <div style="width: 100%; display: flex; gap: 12px;">
                <el-button type="primary" @click="downloadCard" :loading="loading" style="flex: 1">
                  下载图片
                </el-button>
                <el-button @click="resetForm">重置</el-button>
              </div>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-space>
              <el-link href="https://www.taptap.cn/moment/783350437376950702" target="_blank">问题反馈</el-link>
              -
              <el-link href="https://www.taptap.cn/user/757224223" target="_blank">制作器作者：Snownee</el-link>
              -
              <el-link href="https://tieba.baidu.com/p/10477361730" target="_blank">模板制作：绛皓</el-link>
            </el-space>
          </template>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="8" class="preview-section">
        <div ref="cardRef" class="card-preview">
          <div id="card-bg" :style="{ backgroundImage: `url(${images.bgImage})` }"></div>
          <div id="card-frame"></div>
          <div id="card-fg" :style="{ backgroundImage: `url(${images.fgImage})` }">
            <div id="faction" :style="{ backgroundImage: `url(${images.factionImage})` }"></div>
            <div class="name name2" v-if="form.name.length == 2">{{ form.name || '姓名' }}</div>
            <div class="name name3" v-else>{{ form.name || '' }}</div>
            <div id="max-cards">{{ form.maxCards || '0' }}</div>
            <div id="skills">
              <div v-for="skill in form.skills" class="skill" :class="{ 'child-skill': skill.isChild }">
                <div class="skill-name skill-dot" data-text="◆">◆&nbsp;&nbsp;</div>
                <div class="skill-name" :data-text="skill.key">{{ skill.key }}</div>
                <div class="skill-desc" v-html="processText(skill.value)"></div>
              </div>
            </div>
            <div id="max-hp">
              <div class="hp-point" v-for="i in form.maxHP"></div>
            </div>
            <div id="top-left-text" class="top-text">{{ form.topLeftText }}</div>
            <div id="top-right-text" class="top-text">{{ form.topRightText }}</div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import domtoimage from 'dom-to-image';
import ImageCropper from './components/ImageCropper.vue';
import jingke from '@/assets/ui_s1_yuanhua_jingke.jpg'
import yan from '@/assets/yan.png'
import { ElMessage } from 'element-plus';

const factions = [
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
    value: '张楚'
  },
  {
    key: 'xichu',
    value: '西楚'
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

const defaultForm = {
  name: '荆轲',
  maxHP: 6,
  maxCards: 3,
  faction: 'yan',
  skills: [
    {
      id: -1,
      key: '图穷匕见',
      value: '<span.yellow>出牌阶段限1次</span>，当你失去最后手牌时，添加1张&ldquo;徐夫人匕首&rdquo;和1张杀到你的手牌。',
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
}
const form = reactive(structuredClone(defaultForm));
const images = reactive({
  bgImage: jingke,
  fgImage: '',
  factionImage: yan,
})

// 1. 页面加载时：从本地读取数据
onMounted(() => {
  const savedData = localStorage.getItem('card_data');
  if (savedData) {
    // 将字符串转回对象并赋值
    Object.assign(form, JSON.parse(savedData));
  }
});

// 2. 数据变化时：实时写入本地
watch(form, (newVal) => {
  if (images !== null) {
    images.factionImage = new URL(`./assets/${newVal.faction}.png`, import.meta.url).href
  }
  localStorage.setItem('card_data', JSON.stringify(newVal));
}, { deep: true }); // deep: true 确保能监听到对象内部属性的变化

const resetForm = () => {
  Object.assign(form, defaultForm);
}

const cardRef = ref(null);
const loading = ref(false);

const downloadCard = async () => {
  if (!cardRef.value) return;

  loading.value = true; // 点击按钮，开启加载动画
  try {
    cardRef.value.classList.add('card-preview-rendering');
    const image = await domtoimage.toPng(cardRef.value)
    var link = document.createElement('a');
    link.download = `${form.name || 'mjs-card'}.png`;
    link.href = image;
    link.click();
  } finally {
    loading.value = false; // 无论成功还是失败，最后都要关闭加载动画
    cardRef.value.classList.remove('card-preview-rendering');
  }
};

const removeSkill = (item) => {
  const index = form.skills.indexOf(item)
  if (index !== -1) {
    form.skills.splice(index, 1)
  }
}

const addSkill = () => {
  form.skills.push({
    id: Date.now(),
    key: '',
    value: '',
    isChild: false,
  })
}

const uploadFactionImage = () => {

}

const copy = v => {
  navigator.clipboard.writeText(v)
  ElMessage.success('已复制')
}

const processText = (s) => {
  s = s.replaceAll('\n', '<br/>')
  s = s.replaceAll(`<span.`, `<span class=`)
  for (const [k, v] of Object.entries({
    '♠': 'spades',
    '♣': 'clubs',
    '♥': 'hearts',
    '♦': 'diams'
  })) {
    s = s.replaceAll(k, `<span class="${v}">${k}</span0>`)
    s = s.replaceAll(`&${v};`, `<span class="${v}">${k}</span>`)
  }
  return s
}
</script>

<style scoped>
.card-preview {
  aspect-ratio: 69 / 94;
  position: relative;
  font-family: "楷体", "Microsoft YaHei", sans-serif;
  container-type: inline-size;
}

.card-preview>div {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.card-preview-rendering {
  width: 1380px;
}

#card-frame {
  background-image: url("assets/frame.png");
  background-size: contain;
}

#card-bg {
  /*
  尺寸：69 / 94
  出血：3
  */
  padding: calc(3 / 94 * 100%) calc(3 / 69 * 100%);
  box-sizing: border-box;
  background-size: contain;
  background-origin: content-box;
  background-repeat: no-repeat;
}

#card-fg {
  /*
  尺寸：69 / 94
  */
  box-sizing: border-box;
  background-size: contain;
  background-origin: content-box;
  background-repeat: no-repeat;
}

#card-fg>* {
  position: relative;
}

.name {
  left: calc(7.5 / 69 * 100%);
  width: calc(4 / 69 * 100%);
  color: white;
  font-size: 7cqw;
  font-weight: normal;
  writing-mode: vertical-lr;
  white-space: nowrap;
  text-align: center;
  text-shadow: 0.4cqw 0.5cqw 0.5cqw rgba(0, 0, 0, 0.8);
}

.name2 {
  text-align-last: justify;
  top: calc(20 / 94 * 100%);
  height: calc(9 / 69 * 100%);
}

.name3 {
  top: 0;
  height: calc(40 / 69 * 100%);
}

#max-cards {
  left: calc(8.2 / 69 * 100%);
  top: calc(28.3 / 94 * 100%);
  width: calc(4 / 69 * 100%);
  color: #b2dfdb;
  font-size: 7cqw;
  text-align: center;
  text-shadow: 0.4cqw 0.4cqw 0.4cqw rgba(0, 0, 0, 0.8);
}

#skills {
  position: absolute;
  bottom: 16cqw;
  width: 80cqw;
  left: 50%;
  transform: translateX(-50%);
}

#faction {
  box-sizing: border-box;
  background-size: contain;
  background-origin: content-box;
  background-repeat: no-repeat;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

.skill {
  line-height: 1.1;
  padding: 0.5cqw;
  margin-top: 0.6cqw;
  /* 增加了透明度：从上往下深灰到中灰，rgba(r,g,b,0.7) */
  background: linear-gradient(to bottom, rgba(74, 74, 74, 0.7) 0%, rgba(117, 117, 117, 0.7) 30%, rgba(109, 109, 109, 0.7) 100%);
  border: 0.2cqw solid #9994;
  /* 外部投影，增加浮起感 */
  box-shadow: 0 0 2cqw rgba(0, 0, 0, 0.5);
  color: #ffffff;
}

.child-skill {
  margin-left: 1.2cqw;
  margin-right: 1.2cqw;
}

/* 标题栏布局 */
.skill-dot::before {
  position: absolute;
  display: block;
  content: '';
  width: 45cqw;
  height: 3cqw;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.6) 40%, rgba(0, 0, 0, 0) 100%);
  transform: translate(-1.1cqw, -0.8cqw);
}

.skill-dot {
  font-size: 1.4cqw !important;
  transform: translate(1cqw, -0.8cqw);
}

.skill-name {
  display: inline-block;
  position: relative;
  margin: 0;
  font-size: 4cqw;
  font-weight: bold;
  letter-spacing: 0.5cqw;

  color: #000;
  background-clip: text;
  -webkit-background-clip: text;
  /**
  * 指定文字前景色味透明
  **/
  -webkit-text-fill-color: transparent;
  /**
  * 指定文字笔触宽度和颜色
  */
  -webkit-text-stroke: 0.5cqw;
}

.skill-name::after {
  background-image: linear-gradient(to bottom, #ff9800 0%, #ffeb3b 100%);
  /* 上橙下黄 */
  background-clip: text;
  -webkit-background-clip: text;
  /**
  * 指定文字前景色味透明
  **/
  -webkit-text-fill-color: transparent;
  /**
  * 指定文字笔触宽度和颜色
  */
  -webkit-text-stroke: 0;
  content: attr(data-text);
  display: block;
  position: absolute;
  left: 0;
  top: 0;
}

.child-skill .skill-name::after {
  background-image: linear-gradient(to bottom, #f9b857 0%, #fff38a 100%);
}

/* 描述文字样式 */
.skill-desc {
  margin: 0;
  padding: 0;
  font-size: 2.5cqw;
  line-height: 1.4;
  color: #e0e0e0;
  text-shadow: 0.1cqw 0.1cqw 0.2cqw rgba(0, 0, 0, 0.8);
  font-weight: 300;
  font-family: "Microsoft YaHei", sans-serif;
  font-weight: normal;
}

#max-hp {
  position: absolute;
  bottom: 9cqw;
  height: 4.5cqw;
  left: 50%;
  transform: translateX(-50%);
}

.hp-point {
  display: inline-block;
  height: 4.5cqw;
  width: 4.5cqw;
  background: url("assets/hp.png");
  background-repeat: no-repeat;
  background-size: contain;
}

#card-fg .top-text {
  font-size: 2.3cqw;
  color: #b2dfdb;
  text-shadow: 0.1cqw 0.1cqw 0.2cqw rgba(0, 0, 0, 0.8);
  font-weight: bold;
  font-family: "Microsoft YaHei", sans-serif;
  position: absolute;
  top: 5.7cqw;
  white-space: nowrap;
}

#top-left-text {
  left: 19cqw;
}

#top-right-text {
  left: 57.7cqw;
}

.main-row {
  padding: 40px 20px;
}

/* 移动端预览区也增加一点间距 */
@media (max-width: 767px) {
  .preview-section {
    margin-top: 30px;
  }
}
</style>