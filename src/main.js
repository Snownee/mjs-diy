import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import CropperNextVue from 'cropper-next-vue'
import 'cropper-next-vue/style.css'
import App from './App.vue'
import '@/assets/base.css'

const app = createApp(App)

app.use(ElementPlus)
app.use(CropperNextVue)
app.mount('#app')