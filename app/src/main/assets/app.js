package com.yourname.mybrowser;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
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

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private EditText urlEdit;

    private ValueCallback<Uri[]> mFilePathCallback;
    private static final int FILE_CHOOSER_REQUEST_CODE = 1;
    private static final int PERMISSION_REQUEST_CODE = 100;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        urlEdit = findViewById(R.id.urlEdit);

        // 请求所有权限（用户可拒绝非必要）
        requestAllPermissions();

        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        webSettings.setAllowContentAccess(true);

        // 设置 WebViewClient（记录浏览历史到前端）
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // 注入 Eruda
                String js = "javascript:(function(){" +
                        "var s=document.createElement('script');" +
                        "s.src='https://cdn.jsdelivr.net/npm/eruda';" +
                        "document.body.appendChild(s);" +
                        "s.onload=function(){eruda.init({locale:'zh-CN'});}" +
                        "})();";
                view.evaluateJavascript(js, null);

                // 记录浏览历史（调用前端函数）
                if (url != null && !url.startsWith("file://")) {
                    String title = view.getTitle();
                    if (title == null || title.isEmpty()) title = url;
                    // 转义特殊字符
                    title = title.replace("'", "\\'");
                    url = url.replace("'", "\\'");
                    view.evaluateJavascript("addHistory('" + title + "', '" + url + "');", null);
                }
            }
        });

        // 设置 WebChromeClient（文件选择器）
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

        // 设置下载监听（用于下载管理）
        webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
            // 获取文件名
            String fileName = Uri.parse(url).getLastPathSegment();
            if (fileName == null || fileName.isEmpty()) {
                fileName = "下载文件";
            }
            // 调用前端函数添加下载记录
            String js = "addDownloadItem('" + fileName.replace("'", "\\'") + "', '" + url.replace("'", "\\'") + "');";
            webView.evaluateJavascript(js, null);
            // 触发系统下载
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            startActivity(intent);
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
        // 用户选择结果，无需特殊处理
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
}