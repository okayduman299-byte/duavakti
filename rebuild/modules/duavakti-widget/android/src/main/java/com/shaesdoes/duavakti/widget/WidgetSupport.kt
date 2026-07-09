package com.shaesdoes.duavakti.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import org.json.JSONArray

internal data class WidgetData(
  val location: String,
  val nextPrayer: String,
  val nextTime: String,
  val remaining: String,
  val targetEpoch: Long,
  val prayers: List<Pair<String, String>>,
)

private fun formatRemaining(targetEpoch: Long, fallback: String): String {
  if (targetEpoch <= 0L) return fallback
  val seconds = ((targetEpoch - System.currentTimeMillis()) / 1000L).coerceAtLeast(0L)
  val hours = seconds / 3600L
  val minutes = (seconds % 3600L) / 60L
  val remainingSeconds = seconds % 60L
  return String.format("%02d:%02d:%02d", hours, minutes, remainingSeconds)
}

internal fun readWidgetData(context: Context): WidgetData {
  val prefs = context.getSharedPreferences(DuaVaktiWidgetModule.PREFS, Context.MODE_PRIVATE)
  val raw = prefs.getString("prayers", "[]") ?: "[]"
  val rows = mutableListOf<Pair<String, String>>()
  try {
    val array = JSONArray(raw)
    for (i in 0 until array.length()) {
      val item = array.optJSONObject(i) ?: continue
      rows += item.optString("label", "") to item.optString("time", "--:--")
    }
  } catch (_: Exception) {
    // Keep widget alive even when preferences are corrupted.
  }
  val targetEpoch = prefs.getLong("targetEpoch", 0L)
  val fallbackRemaining = prefs.getString("remaining", "--:--:--") ?: "--:--:--"
  return WidgetData(
    location = prefs.getString("location", "DuaVakti") ?: "DuaVakti",
    nextPrayer = prefs.getString("nextPrayer", "Sıradaki vakit") ?: "Sıradaki vakit",
    nextTime = prefs.getString("nextTime", "--:--") ?: "--:--",
    remaining = formatRemaining(targetEpoch, fallbackRemaining),
    targetEpoch = targetEpoch,
    prayers = rows,
  )
}

internal fun attachOpenAppIntent(context: Context, views: RemoteViews) {
  val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName) ?: return
  launchIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
  val pending = PendingIntent.getActivity(
    context,
    100,
    launchIntent,
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
  )
  views.setOnClickPendingIntent(R.id.widget_root, pending)
}

internal fun updateWidgets(
  context: Context,
  manager: AppWidgetManager,
  ids: IntArray,
  factory: (WidgetData) -> RemoteViews,
) {
  val data = readWidgetData(context)
  ids.forEach { id ->
    val views = factory(data)
    attachOpenAppIntent(context, views)
    manager.updateAppWidget(id, views)
  }
}
