plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "ru.mezhgorod.calculator"
    compileSdk = 35

    defaultConfig {
        applicationId = "ru.mezhgorod.calculator"
        minSdk = 24
        targetSdk = 35
        versionCode = 2
        versionName = "1.0.1"
    }

    buildTypes { release { isMinifyEnabled = false } }
}
