/**
 * saveImage 桥调用示例
 *
 * 桥名称: saveImage
 * 调用方式:
 *   - 页面加载中: window.urlResource.TapTapAPI('saveImage', param)
 *   - 页面加载后: window.TapTapAPI('saveImage', param)
 *
 * 两种使用场景:
 *   1. 保存远程图片 —— 只需传 imageId + remoteUrl
 *   2. 保存本地 Blob 图片 —— 需要分片 base64 传输
 *
 * 保存结果通过 notifyImageSaveStatusChanged 事件异步回调
 */

// ============================================================
// 0. 前置准备：初始化事件监听（页面初始化时调用一次）
// ============================================================

const saveImageCallbackMap = new Map();

export function initSaveImageListener() {
  // 注册 webviewEmit / webviewOn（如果尚未注册）
  if (!window.webviewEvents) window.webviewEvents = {};
  if (!window.webviewEmit) {
    window.webviewEmit = (event, params) => {
      (window.webviewEvents[event] || []).forEach((cb) => cb(params));
    };
  }
  if (!window.webviewOn) {
    window.webviewOn = (event, cb) => {
      if (!window.webviewEvents[event]) window.webviewEvents[event] = [];
      window.webviewEvents[event].push(cb);
    };
  }

  // 监听客户端保存结果回调
  window.webviewOn("notifyImageSaveStatusChanged", (callbackParams) => {
    const result = JSON.parse(callbackParams);
    // result 结构:
    // {
    //   "imageId": "xxx",        // 对应请求时的 imageId
    //   "localStatus": true,     // 是否已保存到本地
    //   "albumStatus": true      // 是否已保存到相册
    // }
    const callback = saveImageCallbackMap.get(result.imageId);
    if (callback && result.localStatus) {
      callback(result);
      saveImageCallbackMap.delete(result.imageId);
    }
  });
}

function generateImageId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  ).slice(-12);
}

function stripDataUrlPrefix(base64) {
  const idx = base64.indexOf("base64,");
  return idx >= 0 ? base64.slice(idx + 7) : base64;
}

export function saveLargeBase64Image(
  base64Str,
  { saveAlbum = true, mimeType = "image/png", chunkSize = 500 * 1024 } = {},
) {
  if (typeof window.TapTapAPI !== "function") {
    return Promise.reject(
      new Error("window.TapTapAPI 不存在（非 TapTap WebView 环境）"),
    );
  }

  const pure = stripDataUrlPrefix(base64Str);
  const imageId = generateImageId();
  const totalChunks = Math.max(1, Math.ceil(pure.length / chunkSize));

  return new Promise((resolve) => {
    saveImageCallbackMap.set(imageId, resolve);
    for (let i = 0; i < totalChunks; i++) {
      window.TapTapAPI(
        "saveImage",
        JSON.stringify({
          imageId,
          chunks: totalChunks,
          chunkIndex: i,
          base64Data: pure.slice(i * chunkSize, (i + 1) * chunkSize),
          saveAlbum,
          mimeType,
        }),
      );
    }
  });
}
