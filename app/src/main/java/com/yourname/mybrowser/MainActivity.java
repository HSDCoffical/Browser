// 在类中声明下载任务映射和 Handler
private Map<String, DownloadTask> downloadTasks = new ConcurrentHashMap<>();
private Handler uiHandler = new Handler(Looper.getMainLooper());

// 在 onCreate 中设置 WebView 的下载监听（替换原有）
webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
    new AlertDialog.Builder(MainActivity.this)
            .setTitle("下载文件")
            .setMessage("是否下载该文件？\n" + url)
            .setPositiveButton("下载", (dialog, which) -> {
                startDownload(url, contentDisposition);
            })
            .setNegativeButton("取消", null)
            .show();
});

// 启动下载任务
private void startDownload(String url, String contentDisposition) {
    String id = UUID.randomUUID().toString();
    String fileName = Uri.parse(url).getLastPathSegment();
    if (fileName == null || fileName.isEmpty()) {
        fileName = "download_" + System.currentTimeMillis();
    }
    DownloadTask task = new DownloadTask(id, fileName, url, contentDisposition);
    downloadTasks.put(id, task);
    task.execute();
    // 通知前端添加任务
    webView.evaluateJavascript("window._addDownloadTask('" + id + "', '" + fileName.replace("'", "\\'") + "', 0);", null);
    Toast.makeText(this, "开始下载: " + fileName, Toast.LENGTH_SHORT).show();
}

// 下载任务类
private class DownloadTask extends AsyncTask<Void, Long, File> {
    private String id;
    private String fileName;
    private String url;
    private long totalSize = 0;
    private long downloaded = 0;
    private long lastUpdateTime = 0;
    private long lastDownloaded = 0;
    private volatile boolean paused = false;
    private volatile boolean cancelled = false;
    private HttpURLConnection connection;
    private File outputFile;

    public DownloadTask(String id, String fileName, String url, String contentDisposition) {
        this.id = id;
        this.fileName = fileName;
        this.url = url;
    }

    @Override
    protected void onPreExecute() {
        super.onPreExecute();
        lastUpdateTime = System.currentTimeMillis();
        // 发送通知（使用系统 DownloadManager 通知或自定义）
        showNotification("开始下载", fileName);
    }

    @Override
    protected File doInBackground(Void... voids) {
        try {
            URL downloadUrl = new URL(url);
            connection = (HttpURLConnection) downloadUrl.openConnection();
            connection.setRequestMethod("GET");
            connection.connect();

            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                return null;
            }
            totalSize = connection.getContentLength();
            // 更新总大小
            runOnUiThread(() -> {
                String js = "window._updateDownloadProgress('" + id + "', 0, " + totalSize + ", 0);";
                webView.evaluateJavascript(js, null);
            });

            File dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            if (!dir.exists()) dir.mkdirs();
            File file = new File(dir, fileName);
            int i = 1;
            while (file.exists()) {
                String name = fileName;
                int dot = fileName.lastIndexOf('.');
                if (dot > 0) {
                    name = fileName.substring(0, dot) + "(" + i + ")" + fileName.substring(dot);
                } else {
                    name = fileName + "(" + i + ")";
                }
                file = new File(dir, name);
                i++;
            }
            outputFile = file;

            InputStream input = connection.getInputStream();
            FileOutputStream output = new FileOutputStream(outputFile);
            byte[] buffer = new byte[8192];
            int len;
            long lastReport = System.currentTimeMillis();
            long speed = 0;
            while ((len = input.read(buffer)) != -1) {
                if (cancelled) {
                    output.close();
                    input.close();
                    outputFile.delete();
                    return null;
                }
                while (paused) {
                    try { Thread.sleep(500); } catch (InterruptedException e) {}
                    if (cancelled) {
                        output.close();
                        input.close();
                        outputFile.delete();
                        return null;
                    }
                }
                output.write(buffer, 0, len);
                downloaded += len;
                long now = System.currentTimeMillis();
                if (now - lastReport > 500) {
                    speed = (downloaded - lastDownloaded) * 1000 / (now - lastReport);
                    lastDownloaded = downloaded;
                    lastReport = now;
                    final long finalDownloaded = downloaded;
                    final long finalSpeed = speed;
                    runOnUiThread(() -> {
                        String js = "window._updateDownloadProgress('" + id + "', " + finalDownloaded + ", " + totalSize + ", " + finalSpeed + ");";
                        webView.evaluateJavascript(js, null);
                    });
                    // 更新通知
                    updateNotification("下载中", fileName, downloaded, totalSize);
                }
            }
            output.close();
            input.close();
            connection.disconnect();
            // 完成
            runOnUiThread(() -> {
                webView.evaluateJavascript("window._downloadComplete('" + id + "', '" + outputFile.getAbsolutePath() + "');", null);
                Toast.makeText(MainActivity.this, "下载完成: " + outputFile.getName(), Toast.LENGTH_LONG).show();
                showNotification("下载完成", outputFile.getName());
            });
            return outputFile;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    protected void onPostExecute(File file) {
        super.onPostExecute(file);
        downloadTasks.remove(id);
        if (file == null && !cancelled) {
            runOnUiThread(() -> Toast.makeText(MainActivity.this, "下载失败", Toast.LENGTH_SHORT).show());
            showNotification("下载失败", fileName);
        }
    }

    public void togglePause(boolean resume) {
        paused = !resume;
    }

    public void cancel() {
        cancelled = true;
        if (connection != null) {
            connection.disconnect();
        }
    }

    // 通知栏（使用 NotificationManager）
    private void showNotification(String title, String content) {
        // 简化：使用系统 Toast 和通知，这里省略详细实现，实际可用 NotificationManager
        // 因为篇幅，可参考 Android 官方文档
    }
    private void updateNotification(String title, String content, long progress, long max) {
        // 同上
    }
}

// JS 接口（在 onCreate 中注册）
private class NativeDownloadBridge {
    @android.webkit.JavascriptInterface
    public void togglePause(String id, boolean resume) {
        DownloadTask task = downloadTasks.get(id);
        if (task != null) {
            task.togglePause(resume);
        }
    }

    @android.webkit.JavascriptInterface
    public void cancel(String id) {
        DownloadTask task = downloadTasks.get(id);
        if (task != null) {
            task.cancel();
        }
    }

    @android.webkit.JavascriptInterface
    public void install(String filePath) {
        // 打开安装界面
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setDataAndType(Uri.parse("file://" + filePath), "application/vnd.android.package-archive");
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
    }
}

private void setupJSInterface() {
    webView.addJavascriptInterface(new NativeDownloadBridge(), "_nativeDownload");
}