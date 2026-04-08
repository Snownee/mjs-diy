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
  window.webviewOn('notifyImageSaveStatusChanged', (callbackParams) => {
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
  // 生成 12 位唯一 ID，可用 uuid 截取或其他方式
  return Math.random().toString(36).slice(-12);
}

export async function saveLargeBase64Image(base64Str, saveAlbum = false) {
  return new Promise((resolve) => {
    const imageId = generateImageId();
    
    // 2. 设定每片大小（比如每片 500KB 的字符长度）
    const chunkSize = 500 * 1024; 
    const totalChunks = Math.ceil(base64Str.length / chunkSize);

    // 3. 循环发送分片
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize;
      const chunk = base64Str.slice(start, end);

      window.TapTapAPI('saveImage', {
        imageId,
        chunks: totalChunks,
        chunkIndex: i,
        base64Data: chunk,
        saveAlbum,
        mimeType: 'image/png', // 根据实际情况填写
      });
    }

    saveImageCallbackMap.set(imageId, resolve);
  });
}
