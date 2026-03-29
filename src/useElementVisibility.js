import { ref, onMounted, onUnmounted } from 'vue';

export function useElementVisibility(targetSelector) {
  const isVisible = ref(false);
  let observer = null;

  onMounted(() => {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    // 只要目标元素有 1 像素进入视口，就会触发回调
    observer = new IntersectionObserver(([entry]) => {
      isVisible.value = entry.isIntersecting;
    }, {
      threshold: 0 // 0 表示“部分可见”即触发，1 表示“完全进入”才触发
    });

    observer.observe(target);
  });

  // 别忘了在组件销毁时停止观察，防止内存泄漏
  onUnmounted(() => {
    if (observer) observer.disconnect();
  });

  return isVisible;
}