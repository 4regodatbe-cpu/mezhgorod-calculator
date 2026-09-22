plugins { id("com.android.application") }

android {
    namespace = "ru.mezhgorod.calculator"
    compileSdk = 35

    defaultConfig {
        applicationId = "ru.mezhgorod.calculator"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes { release { isMinifyEnabled = false } }
}
