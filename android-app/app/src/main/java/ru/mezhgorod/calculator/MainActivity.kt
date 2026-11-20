package ru.mezhgorod.calculator

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.os.Build
import android.view.View
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.ProgressBar
import android.widget.TextView

class MainActivity : Activity() {
    private lateinit var webView: WebView
    private lateinit var progress: ProgressBar
    private lateinit var offline: TextView
    private val home = "https://mezhgorod-calculator.vercel.app/v3"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        webView = findViewById(R.id.webView)
        progress = findViewById(R.id.progress)
        offline = findViewById(R.id.offline)

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            setSupportZoom(false)
            userAgentString = "$userAgentString MezhgorodAndroid/1.01"
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                isAlgorithmicDarkeningAllowed = false
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                @Suppress("DEPRECATION")
                forceDark = android.webkit.WebSettings.FORCE_DARK_OFF
            }
        }
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val uri = request.url
                return if (uri.scheme == "https" && uri.host == "mezhgorod-calculator.vercel.app") false
                else { openExternal(uri); true }
            }
            override fun onPageStarted(view: WebView, url: String, favicon: Bitmap?) {
                progress.visibility = View.VISIBLE
                offline.visibility = View.GONE
            }
            override fun onPageFinished(view: WebView, url: String) { progress.visibility = View.GONE }
            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: android.webkit.WebResourceError) {
                if (request.isForMainFrame) { progress.visibility = View.GONE; offline.visibility = View.VISIBLE }
            }
        }
        offline.setOnClickListener { webView.loadUrl(home) }
        val previousUrl = savedInstanceState?.getString("url")
        val launchUrl = previousUrl?.takeIf { it == home || it.startsWith("$home?") || it.startsWith("$home#") } ?: home
        webView.loadUrl(launchUrl)
    }

    private fun openExternal(uri: Uri) {
        try { startActivity(Intent(Intent.ACTION_VIEW, uri)) }
        catch (_: Exception) { offline.visibility = View.VISIBLE }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        outState.putString("url", webView.url ?: home)
        super.onSaveInstanceState(outState)
    }

    @Deprecated("Deprecated in Android")
    override fun onBackPressed() { if (webView.canGoBack()) webView.goBack() else super.onBackPressed() }
}
