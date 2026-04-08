import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import CropperNextVue from "cropper-next-vue";
import "cropper-next-vue/style.css";
import App from "./App.vue";
import "@/assets/base.css";
import zhCn from "element-plus/es/locale/lang/zh-cn";

const app = createApp(App);
app.use(ElementPlus, {
  locale: zhCn,
});
app.use(CropperNextVue);
app.mount("#app");
