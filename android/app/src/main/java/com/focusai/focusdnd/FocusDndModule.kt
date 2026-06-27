package com.focusai.focusdnd

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Tizim DND ko'prigi — NotificationManager.setInterruptionFilter.
 * Fokus sessiyaси davomida JS yoqadi/o'chiradi. ACCESS_NOTIFICATION_POLICY ruxsati shart.
 */
class FocusDndModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "FocusDnd"

  private fun notificationManager(): NotificationManager? =
    reactApplicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager

  @ReactMethod
  fun isAvailable(promise: Promise) {
    promise.resolve(Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
  }

  @ReactMethod
  fun hasPermission(promise: Promise) {
    val manager = notificationManager()
    val granted =
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
        manager != null &&
        manager.isNotificationPolicyAccessGranted
    promise.resolve(granted)
  }

  @ReactMethod
  fun requestPermission(promise: Promise) {
    try {
      val intent = Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS)
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      reactApplicationContext.startActivity(intent)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("dnd_request_failed", e)
    }
  }

  @ReactMethod
  fun setEnabled(enabled: Boolean, promise: Promise) {
    val manager = notificationManager()
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M || manager == null) {
      promise.resolve(false)
      return
    }
    if (!manager.isNotificationPolicyAccessGranted) {
      promise.resolve(false)
      return
    }
    try {
      val filter =
        if (enabled) NotificationManager.INTERRUPTION_FILTER_PRIORITY
        else NotificationManager.INTERRUPTION_FILTER_ALL
      manager.setInterruptionFilter(filter)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("dnd_set_failed", e)
    }
  }
}
