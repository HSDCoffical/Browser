package com.yourname.mybrowser;

import android.os.Bundle;
import android.view.inputmethod.EditorInfo;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private EditText urlEdit;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        urlEdit = findViewById(R.id.urlEdit);

        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                String js = "javascript:(function(){" +
                        "var s=document.createElement('script');" +
                        "s.src='https://cdn.jsdelivr.net/npm/eruda';" +
                        "document.body.appendChild(s);" +
                        "s.onload=function(){eruda.init();}" +
                        "})();";
                view.evaluateJavascript(js, null);
            }
        });

        // ✅ 改这里：加载你自定义的首页
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

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
}