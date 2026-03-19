<template>
  <el-button class="cropper-component">
    <div @click="triggerUpload">
      <slot>
        <el-button type="primary">上传图片</el-button>
      </slot>
    </div>

    <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="onFileChange" />

    <el-dialog v-model="visible" title="图片裁剪" width="600px" append-to-body @closed="cleanup">
      <div class="cropper-container">
        <vue-cropper ref="cropperRef" :img="tempImg" :wrapper="{ width: 400, height: 400 }"
          :cropLayout="{ width: 300 * aspectRatio[0] / aspectRatio[1], height: 300 }" :centerBox="true"
          :original="true" />
      </div>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确认裁剪</el-button>
      </template>
    </el-dialog>
  </el-button>
</template>

<script setup>
import { ref } from 'vue';
import 'cropper-next-vue/style.css'
import { VueCropper } from 'cropper-next-vue'

const props = defineProps({
  // 裁剪比例，默认名片比例 9:5
  aspectRatio: {
    type: Array,
    default: () => [1, 5]
  },
  // 接收外部 v-model:image
  image: String
});
const emit = defineEmits(['update:image'])

const visible = ref(false);
const tempImg = ref('');
const fileInput = ref(null);
const cropperRef = ref(null);

// 触发文件选择
const triggerUpload = () => {
  fileInput.value.click();
};

// 选择文件后处理
const onFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    tempImg.value = event.target.result;
    visible.value = true;
  };
  reader.readAsDataURL(file);
  // 清除 value 保证同名文件可重复触发
  e.target.value = '';
};

// 确认裁剪
const handleConfirm = () => {
  cropperRef.value.getCropData().then((data) => {
    emit('update:image', data)
    visible.value = false;
  });
};

const cleanup = () => {
  tempImg.value = '';
};
</script>

<style scoped>
.cropper-container {
  width: 100%;
  height: 400px;
}
</style>