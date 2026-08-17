package com.yourname.mybrowser;

import android.Manifest;
import android.app.AlertDialog;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
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
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private EditText urlEdit;

    private ValueCallback<Uri[]> mFilePathCallback;
    private static final int FILE_CHOOSER_REQUEST_CODE = 1;
    private static final int PERMISSION_REQUEST_CODE = 100;

    private ConcurrentHashMap<String, DownloadTask> downloadTasks = new ConcurrentHashMap<>();
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

        setupJSInterface();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    "download_channel",
                    "下载通知",
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    // ============================================================
    // 权限管理
    // ============================================================
    private void requestAllPermissions() {
        String[] permissions = getAllPermissions();
        boolean needRequest = false;
        for (String perm : permissions) {
            if (ContextCompat.checkSelfPermission(this, perm) != PackageManager.PERMISSION_GRANTED) {
                needRequest = true;
                break;
            }
        }
        if (needRequest) {
            ActivityCompat.requestPermissions(this, permissions, PERMISSION_REQUEST_CODE);
        }
    }

    private String[] getAllPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return new String[]{
                    Manifest.permission.READ_MEDIA_IMAGES,
                    Manifest.permission.READ_MEDIA_VIDEO,
                    Manifest.permission.READ_MEDIA_AUDIO,
                    Manifest.permission.CAMERA,
                    Manifest.permission.RECORD_AUDIO,
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION,
                    Manifest.permission.READ_CONTACTS,
                    Manifest.permission.READ_CALENDAR,
                    Manifest.permission.BODY_SENSORS,
                    Manifest.permission.ACTIVITY_RECOGNITION
            };
        } else {
            return new String[]{
                    Manifest.permission.READ_EXTERNAL_STORAGE,
                    Manifest.permission.WRITE_EXTERNAL_STORAGE,
                    Manifest.permission.CAMERA,
                    Manifest.permission.RECORD_AUDIO,
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION,
                    Manifest.permission.READ_CONTACTS,
                    Manifest.permission.WRITE_CONTACTS,
                    Manifest.permission.READ_CALENDAR,
                    Manifest.permission.WRITE_CALENDAR,
                    Manifest.permission.BODY_SENSORS,
                    Manifest.permission.ACTIVITY_RECOGNITION
            };
        }
    }

    private boolean checkStoragePermission() {
        String permission = (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU)
                ? Manifest.permission.READ_MEDIA_IMAGES
                : Manifest.permission.READ_EXTERNAL_STORAGE;
        return ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED;
    }

    private void requestStoragePermission() {
        String permission = (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU)
                ? Manifest.permission.READ_MEDIA_IMAGES
                : Manifest.permission.READ_EXTERNAL_STORAGE;
        ActivityCompat.requestPermissions(this, new String[]{permission}, PERMISSION_REQUEST_CODE);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }

    // ============================================================
    // 文件选择器回调
    // ============================================================
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (mFilePathCallback != null) {
                Uri[] results = null;
                if (resultCode == RESULT_OK && data != null) {
                    String dataString = data.getDataString();
                    if (dataString != null) {
                        results = new Uri[]{Uri.parse(dataString)};
                    }
                }
                mFilePathCallback.onReceiveValue(results);
                mFilePathCallback = null;
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    // ============================================================
    // JS 接口
    // ============================================================
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
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(Uri.parse("file://" + filePath), "application/vnd.android.package-archive");
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
        }
    }

    private void setupJSInterface() {
        webView.addJavascriptInterface(new NativeDownloadBridge(), "_nativeDownload");
    }

    // ============================================================
    // 下载任务管理
    // ============================================================
    private void startDownload(String url, String contentDisposition) {
        String id = UUID.randomUUID().toString();
        String fileName = Uri.parse(url).getLastPathSegment();
        if (fileName == null || fileName.isEmpty()) {
            fileName = "download_" + System.currentTimeMillis();
        }
        DownloadTask task = new DownloadTask(id, fileName, url, contentDisposition);
        downloadTasks.put(id, task);
        task.execute();
        webView.evaluateJavascript("window._addDownloadTask('" + id + "', '" + fileName.replace("'", "\\'") + "', 0);", null);
        Toast.makeText(this, "开始下载: " + fileName, Toast.LENGTH_SHORT).show();
    }

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
            showNotification("开始下载", fileName, 0, 0);
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
                        updateNotification(fileName, downloaded, totalSize);
                    }
                }
                output.close();
                input.close();
                connection.disconnect();
                runOnUiThread(() -> {
                    webView.evaluateJavascript("window._downloadComplete('" + id + "', '" + outputFile.getAbsolutePath() + "');", null);
                    Toast.makeText(MainActivity.this, "下载完成: " + outputFile.getName(), Toast.LENGTH_LONG).show();
                    showNotification("下载完成", outputFile.getName(), 100, 100);
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
                showNotification("下载失败", fileName, 0, 0);
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

        private void showNotification(String title, String content, long progress, long max) {
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager == null) return;
            NotificationCompat.Builder builder = new NotificationCompat.Builder(MainActivity.this, "download_channel")
                    .setSmallIcon(android.R.drawable.stat_sys_download)
                    .setContentTitle(title)
                    .setContentText(content)
                    .setPriority(NotificationCompat.PRIORITY_LOW)
                    .setOngoing(true);
            if (max > 0) {
                builder.setProgress((int) max, (int) progress, false);
            }
            if (progress >= max && max > 0) {
                builder.setOngoing(false);
                builder.setContentText("下载完成");
            }
            manager.notify(id.hashCode(), builder.build());
        }

        private void updateNotification(String content, long progress, long max) {
            showNotification("下载中", content, progress, max);
        }
    }
}