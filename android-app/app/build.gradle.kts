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
        versionCode = 5
        versionName = "1.01"
    }

    buildTypes { release { isMinifyEnabled = false } }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
