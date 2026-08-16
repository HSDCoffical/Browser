package com.yourname.mybrowser;

import android.Manifest;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.view.inputmethod.EditorInfo;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private EditText urlEdit;

    private ValueCallback<Uri[]> mFilePathCallback;
    private static final int FILE_CHOOSER_REQUEST_CODE = 1;
    private static final int PERMISSION_REQUEST_CODE = 100;

    // 下载任务管理
    private Map<String, DownloadTask> downloadTasks = new ConcurrentHashMap<>();
    private Handler uiHandler = new Handler(Looper.getMainLooper());

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        urlEdit = findViewById(R.id.urlEdit);

        requestAllPermissions();

        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        webSettings.setAllowContentAccess(true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // Eruda
                String erudaJs = "javascript:(function(){" +
                        "var s=document.createElement('script');" +
                        "s.src='https://cdn.jsdelivr.net/npm/eruda';" +
                        "document.body.appendChild(s);" +
                        "s.onload=function(){eruda.init({locale:'zh-CN'});}" +
                        "})();";
                view.evaluateJavascript(erudaJs, null);

                String title = view.getTitle();
                if (title == null || title.isEmpty()) title = url;
                String safeTitle = title.replace("'", "\\'");
                String safeUrl = url.replace("'", "\\'");
                String js = "javascript:window.updateTopBar('" + safeTitle + "', '" + safeUrl + "');";
                view.evaluateJavascript(js, null);
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback,
                                             FileChooserParams fileChooserParams) {
                if (checkStoragePermission()) {
                    mFilePathCallback = filePathCallback;
                    Intent intent = fileChooserParams.createIntent();
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST_CODE);
                    return true;
                } else {
                    Toast.makeText(MainActivity.this, "需要存储权限才能选择图片", Toast.LENGTH_SHORT).show();
                    requestStoragePermission();
                    return false;
                }
            }
        });

        // 自定义下载拦截
        webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
            // 弹出确认框
            new AlertDialog.Builder(MainActivity.this)
                    .setTitle("下载文件")
                    .setMessage("是否下载该文件？\n" + url)
                    .setPositiveButton("下载", (dialog, which) -> {
                        startDownload(url, contentDisposition);
                    })
                    .setNegativeButton("取消", null)
                    .show();
        });

        webView.loadUrl("file:///android_asset/index.html");

        urlEdit.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_GO) {
                String input = urlEdit.getText().toString().trim();
                if (input.isEmpty()) return true;
                if (input.startsWith("http://") || input.startsWith("https://")) {
                    webView.loadUrl(input);
                } else if (input.contains(".")) {
                    webView.loadUrl("https://" + input);
                } else {
                    webView.loadUrl("https://www.bing.com/search?q=" + input);
                }
                return true;
            }
            return false;
        });
    }

    // 启动下载任务
    private void startDownload(String url, String contentDisposition) {
        // 生成唯一ID
        String id = UUID.randomUUID().toString();
        // 获取文件名
        String fileName = Uri.parse(url).getLastPathSegment();
        if (fileName == null || fileName.isEmpty()) {
            fileName = "download_" + System.currentTimeMillis();
        }
        // 如果contentDisposition有文件名，可解析，这里简化
        // 创建下载任务
        DownloadTask task = new DownloadTask(id, fileName, url, contentDisposition);
        downloadTasks.put(id, task);
        task.execute();

        // 通知前端添加任务（总大小未知时先传0）
        webView.evaluateJavascript("window._addDownloadTask('" + id + "', '" + fileName.replace("'", "\\'") + "', 0);", null);
    }

    // 下载任务类
    private class DownloadTask extends AsyncTask<Void, Long, File> {
        private String id;
        private String fileName;
        private String url;
        private String contentDisposition;
        private long totalSize = 0;
        private long downloaded = 0;
        private long lastUpdateTime = 0;
        private long lastDownloaded = 0;
        private volatile boolean paused = false;
        private volatile boolean cancelled = false;
        private HttpURLConnection connection;

        public DownloadTask(String id, String fileName, String url, String contentDisposition) {
            this.id = id;
            this.fileName = fileName;
            this.url = url;
            this.contentDisposition = contentDisposition;
        }

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
            lastUpdateTime = System.currentTimeMillis();
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
                // 更新前端总大小
                runOnUiThread(() -> {
                    String js = "window._updateDownloadProgress('" + id + "', 0, " + totalSize + ", 0);";
                    webView.evaluateJavascript(js, null);
                });

                File dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                if (!dir.exists()) dir.mkdirs();
                File file = new File(dir, fileName);
                // 如果文件已存在，重命名
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
                final File finalFile = file;

                InputStream input = connection.getInputStream();
                FileOutputStream output = new FileOutputStream(finalFile);
                byte[] buffer = new byte[8192];
                int len;
                long lastReport = System.currentTimeMillis();
                long speed = 0;
                while ((len = input.read(buffer)) != -1) {
                    if (cancelled) {
                        output.close();
                        input.close();
                        finalFile.delete();
                        return null;
                    }
                    while (paused) {
                        try { Thread.sleep(500); } catch (InterruptedException e) {}
                        if (cancelled) {
                            output.close();
                            input.close();
                            finalFile.delete();
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
                    }
                }
                output.close();
                input.close();
                connection.disconnect();
                // 下载完成
                runOnUiThread(() -> {
                    webView.evaluateJavascript("window._downloadComplete('" + id + "');", null);
                    Toast.makeText(MainActivity.this, "下载完成: " + finalFile.getName(), Toast.LENGTH_LONG).show();
                });
                return finalFile;
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
            }
        }

        public void togglePause(boolean resume) {
            if (resume) {
                paused = false;
            } else {
                paused = true;
            }
        }

        public void cancel() {
            cancelled = true;
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    // 暴露给JS的下载控制接口
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
        public void openFile(String id) {
            // 通过id查找已下载的文件，这里简化
            // 实际需要保存文件路径，这里省略
            Toast.makeText(MainActivity.this, "打开文件功能开发中", Toast.LENGTH_SHORT).show();
        }
    }

    // 注册JS接口
    private void setupJSInterface() {
        webView.addJavascriptInterface(new NativeDownloadBridge(), "_nativeDownload");
    }

    // 在onCreate中添加
    @Override
    protected void onResume() {
        super.onResume();
        // 确保JS接口已注册
        setupJSInterface();
    }

    // 权限方法省略（与之前相同）

    // ... 其他代码如权限请求、文件选择器回调等保持不变 ...
}